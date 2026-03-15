import prisma from '@/lib/prisma'

export interface SalaryInput {
  userId: string
  gajiPokok: number
  tunjangan?: number | null
  bonus?: number | null
  potongan?: number | null
}

export async function createOrUpdateSalary(data: SalaryInput) {
  return await prisma.salary.upsert({
    where: { userId: data.userId },
    update: {
      gajiPokok: data.gajiPokok,
      tunjangan: data.tunjangan,
      bonus: data.bonus,
      potongan: data.potongan,
    },
    create: data,
  })
}

export async function getUserSalary(userId: string) {
  return await prisma.salary.findUnique({
    where: { userId },
  })
}

export async function deleteSalary(userId: string) {
  return await prisma.salary.delete({
    where: { userId },
  })
}

// Calculate total salary (gajiPokok + tunjangan + bonus - potongan)
export function calculateTotalSalary(salary: {
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

export async function getSalaryVsExpense(userId: string, month: number, year: number) {
  const startOfMonth = new Date(year, month - 1, 1)
  const endOfMonth = new Date(year, month, 0, 23, 59, 59)

  const [salary, expenses] = await Promise.all([
    prisma.salary.findUnique({
      where: { userId },
    }),
    prisma.transaction.aggregate({
      where: {
        userId,
        type: 'expense',
        tanggal: { gte: startOfMonth, lte: endOfMonth },
      },
      _sum: { amount: true },
    }),
  ])

  const salaryAmount = salary ? calculateTotalSalary(salary) : 0
  const expenseAmount = expenses._sum.amount || 0
  const selisih = salaryAmount - expenseAmount
  const isOverBudget = expenseAmount > salaryAmount && salaryAmount > 0

  return {
    salaryAmount,
    expenseAmount,
    selisih,
    isOverBudget,
    salaryDetail: salary,
  }
}
