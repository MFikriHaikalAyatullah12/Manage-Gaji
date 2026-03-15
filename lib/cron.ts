import cron from 'node-cron'
import prisma from './prisma'
import {
  sendEmail,
  isEmailSystemConfigured,
  salaryExceededEmailTemplate,
  budgetExceededEmailTemplate,
  lowBalanceEmailTemplate,
} from './email'

// Calculate total salary
function calculateTotalSalary(salary: {
  gajiPokok: number
  tunjangan?: number | null
  bonus?: number | null
  potongan?: number | null
}) {
  return (
    salary.gajiPokok +
    (salary.tunjangan || 0) +
    (salary.bonus || 0) -
    (salary.potongan || 0)
  )
}

// Check all users' finances daily at 9:00 AM
async function checkFinances() {
  console.log('Running daily finance check...')

  // Check if email system is configured
  if (!isEmailSystemConfigured()) {
    console.log('Email system not configured. Skipping notifications.')
    return
  }

  const users = await prisma.user.findMany({
    include: {
      emailSettings: true,
    },
  })

  for (const user of users) {
    // Skip if notifications are disabled
    if (!user.emailSettings?.isEnabled) {
      continue
    }

    const notificationEmail = user.emailSettings.notificationEmail || user.email
    if (!notificationEmail) continue

    const now = new Date()
    const currentMonth = now.getMonth() + 1
    const currentYear = now.getFullYear()

    // Get user's salary (now per-user, not per-month)
    const salary = await prisma.salary.findUnique({
      where: { userId: user.id },
    })

    // Get total expenses for current month
    const startOfMonth = new Date(currentYear, currentMonth - 1, 1)
    const endOfMonth = new Date(currentYear, currentMonth, 0, 23, 59, 59)

    const expenses = await prisma.transaction.aggregate({
      where: {
        userId: user.id,
        type: 'expense',
        tanggal: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
      _sum: { amount: true },
    })

    const totalExpenses = expenses._sum.amount || 0
    const salaryAmount = salary ? calculateTotalSalary(salary) : 0
    const balance = salaryAmount - totalExpenses

    // Check if expenses exceed salary
    if (salary && totalExpenses > salaryAmount) {
      const selisih = salaryAmount - totalExpenses
      await sendEmail({
        to: notificationEmail,
        subject: 'Peringatan Keuangan - Pengeluaran Melebihi Gaji',
        html: salaryExceededEmailTemplate(salaryAmount, totalExpenses, selisih),
      })
    }

    // Check budget limits for each category
    const budgets = await prisma.budget.findMany({
      where: {
        userId: user.id,
        month: currentMonth,
        year: currentYear,
      },
      include: { category: true },
    })

    for (const budget of budgets) {
      const categoryExpenses = await prisma.transaction.aggregate({
        where: {
          userId: user.id,
          type: 'expense',
          categoryId: budget.categoryId,
          tanggal: {
            gte: startOfMonth,
            lte: endOfMonth,
          },
        },
        _sum: { amount: true },
      })

      const spent = categoryExpenses._sum.amount || 0
      if (spent > budget.limitAmount) {
        await sendEmail({
          to: notificationEmail,
          subject: `Peringatan Anggaran - ${budget.category.name} Terlampaui`,
          html: budgetExceededEmailTemplate(budget.category.name, budget.limitAmount, spent),
        })
      }
    }

    // Check for low balance (less than 500,000)
    if (balance > 0 && balance < 500000) {
      await sendEmail({
        to: notificationEmail,
        subject: 'Pemberitahuan - Saldo Tersisa Rendah',
        html: lowBalanceEmailTemplate(balance),
      })
    }
  }

  console.log('Daily finance check completed.')
}

// Schedule cron job to run every day at 9:00 AM
export function startCronJobs() {
  // Run daily at 9:00 AM
  cron.schedule('0 9 * * *', () => {
    checkFinances()
  })

  console.log('Cron jobs scheduled.')
}

// Export the check function for manual triggers
export { checkFinances }

// If running directly
if (require.main === module) {
  checkFinances().then(() => {
    console.log('Manual check completed.')
    process.exit(0)
  })
}
