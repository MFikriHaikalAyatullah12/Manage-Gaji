import prisma from '@/lib/prisma'

export interface CreateBudgetInput {
  userId: string
  categoryId: string
  limitAmount: number
  month: number
  year: number
}

export interface UpdateBudgetInput {
  limitAmount?: number
}

export async function createOrUpdateBudget(data: CreateBudgetInput) {
  return await prisma.budget.upsert({
    where: {
      userId_categoryId_month_year: {
        userId: data.userId,
        categoryId: data.categoryId,
        month: data.month,
        year: data.year,
      },
    },
    update: {
      limitAmount: data.limitAmount,
    },
    create: data,
    include: { category: true },
  })
}

export async function getBudgetsByMonthYear(userId: string, month: number, year: number) {
  return await prisma.budget.findMany({
    where: {
      userId,
      month,
      year,
    },
    include: { category: true },
    orderBy: { category: { name: 'asc' } },
  })
}

export async function getBudgetById(id: string) {
  return await prisma.budget.findUnique({
    where: { id },
    include: { category: true },
  })
}

export async function deleteBudget(id: string) {
  return await prisma.budget.delete({
    where: { id },
  })
}

export async function getBudgetStatus(userId: string, month: number, year: number) {
  const startOfMonth = new Date(year, month - 1, 1)
  const endOfMonth = new Date(year, month, 0, 23, 59, 59)

  const budgets = await prisma.budget.findMany({
    where: { userId, month, year },
    include: { category: true },
  })

  const results = await Promise.all(
    budgets.map(async (budget: { id: string; userId: string; categoryId: string; limitAmount: number; month: number; year: number; category: { id: string; name: string } }) => {
      const expenses = await prisma.transaction.aggregate({
        where: {
          userId,
          type: 'expense',
          categoryId: budget.categoryId,
          tanggal: { gte: startOfMonth, lte: endOfMonth },
        },
        _sum: { amount: true },
      })

      const spent = expenses._sum.amount || 0
      const remaining = budget.limitAmount - spent
      const percentage = (spent / budget.limitAmount) * 100
      const isOverBudget = spent > budget.limitAmount

      return {
        ...budget,
        spent,
        remaining,
        percentage: Math.min(percentage, 100),
        actualPercentage: percentage,
        isOverBudget,
      }
    })
  )

  return results
}
