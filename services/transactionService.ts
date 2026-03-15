import prisma from '@/lib/prisma'

export type TransactionType = 'income' | 'expense'

export interface CreateTransactionInput {
  userId: string
  tanggal: Date
  amount: number
  type: TransactionType
  categoryId?: string | null
  note?: string | null
}

export interface UpdateTransactionInput {
  tanggal?: Date
  amount?: number
  type?: TransactionType
  categoryId?: string | null
  note?: string | null
}

export async function createTransaction(data: CreateTransactionInput) {
  return await prisma.transaction.create({
    data,
    include: { category: true },
  })
}

export async function getTransactionById(id: string) {
  return await prisma.transaction.findUnique({
    where: { id },
    include: { category: true },
  })
}

export async function updateTransaction(id: string, data: UpdateTransactionInput) {
  return await prisma.transaction.update({
    where: { id },
    data,
    include: { category: true },
  })
}

export async function deleteTransaction(id: string) {
  return await prisma.transaction.delete({
    where: { id },
  })
}

export async function getUserTransactions(
  userId: string,
  options?: {
    type?: TransactionType
    categoryId?: string
    month?: number
    year?: number
    search?: string
    skip?: number
    take?: number
  }
) {
  const where: any = { userId }

  if (options?.type) {
    where.type = options.type
  }

  if (options?.categoryId) {
    where.categoryId = options.categoryId
  }

  if (options?.month && options?.year) {
    const startOfMonth = new Date(options.year, options.month - 1, 1)
    const endOfMonth = new Date(options.year, options.month, 0, 23, 59, 59)
    where.tanggal = {
      gte: startOfMonth,
      lte: endOfMonth,
    }
  }

  if (options?.search) {
    where.note = {
      contains: options.search,
      mode: 'insensitive',
    }
  }

  const [transactions, total] = await Promise.all([
    prisma.transaction.findMany({
      where,
      include: { category: true },
      orderBy: { tanggal: 'desc' },
      skip: options?.skip,
      take: options?.take,
    }),
    prisma.transaction.count({ where }),
  ])

  return { transactions, total }
}

export async function getMonthlyTotals(userId: string, month: number, year: number) {
  const startOfMonth = new Date(year, month - 1, 1)
  const endOfMonth = new Date(year, month, 0, 23, 59, 59)

  const [income, expense] = await Promise.all([
    prisma.transaction.aggregate({
      where: {
        userId,
        type: 'income',
        tanggal: { gte: startOfMonth, lte: endOfMonth },
      },
      _sum: { amount: true },
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

  return {
    income: income._sum.amount || 0,
    expense: expense._sum.amount || 0,
  }
}

export async function getCategoryExpenses(userId: string, month: number, year: number) {
  const startOfMonth = new Date(year, month - 1, 1)
  const endOfMonth = new Date(year, month, 0, 23, 59, 59)

  const expenses = await prisma.transaction.groupBy({
    by: ['categoryId'],
    where: {
      userId,
      type: 'expense',
      tanggal: { gte: startOfMonth, lte: endOfMonth },
      categoryId: { not: null },
    },
    _sum: { amount: true },
  })

  const categories = await prisma.category.findMany({
    where: {
      id: { in: expenses.map((e: { categoryId: string | null }) => e.categoryId).filter(Boolean) as string[] },
    },
  })

  return expenses.map((e: { categoryId: string | null; _sum: { amount: number | null } }) => ({
    category: categories.find((c: { id: string }) => c.id === e.categoryId),
    amount: e._sum.amount || 0,
  }))
}

export async function getMonthlyTrend(userId: string, year: number) {
  const months = []
  for (let month = 1; month <= 12; month++) {
    const startOfMonth = new Date(year, month - 1, 1)
    const endOfMonth = new Date(year, month, 0, 23, 59, 59)

    const [income, expense] = await Promise.all([
      prisma.transaction.aggregate({
        where: {
          userId,
          type: 'income',
          tanggal: { gte: startOfMonth, lte: endOfMonth },
        },
        _sum: { amount: true },
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

    months.push({
      month,
      income: income._sum.amount || 0,
      expense: expense._sum.amount || 0,
    })
  }

  return months
}

export async function getDailyExpenses(userId: string, month: number, year: number) {
  const startOfMonth = new Date(year, month - 1, 1)
  const endOfMonth = new Date(year, month, 0, 23, 59, 59)

  const transactions = await prisma.transaction.findMany({
    where: {
      userId,
      type: 'expense',
      tanggal: { gte: startOfMonth, lte: endOfMonth },
    },
    orderBy: { tanggal: 'asc' },
  })

  const dailyTotals: { [key: number]: number } = {}
  
  transactions.forEach((t: { tanggal: Date; amount: number }) => {
    const day = new Date(t.tanggal).getDate()
    dailyTotals[day] = (dailyTotals[day] || 0) + t.amount
  })

  return dailyTotals
}
