import prisma from '@/lib/prisma'
import { calculateTotalSalary } from './salaryService'

export interface CreateSavingInput {
  userId: string
  amount: number
  month: number
  year: number
  note?: string | null
}

export async function createOrUpdateSaving(data: CreateSavingInput) {
  return await prisma.saving.upsert({
    where: {
      userId_month_year: {
        userId: data.userId,
        month: data.month,
        year: data.year,
      },
    },
    update: {
      amount: data.amount,
      note: data.note,
    },
    create: data,
  })
}

export async function getSavingByMonthYear(userId: string, month: number, year: number) {
  return await prisma.saving.findUnique({
    where: {
      userId_month_year: {
        userId,
        month,
        year,
      },
    },
  })
}

export async function getSavingById(id: string) {
  return await prisma.saving.findUnique({
    where: { id },
  })
}

export async function getAllSavings(userId: string) {
  return await prisma.saving.findMany({
    where: { userId },
    orderBy: [{ year: 'desc' }, { month: 'desc' }],
  })
}

export async function deleteSaving(id: string) {
  return await prisma.saving.delete({
    where: { id },
  })
}

export async function getTotalSavings(userId: string) {
  const result = await prisma.saving.aggregate({
    where: { userId },
    _sum: { amount: true },
  })
  return result._sum.amount || 0
}

export async function getSavingsOverview(userId: string, month: number, year: number) {
  const startOfMonth = new Date(year, month - 1, 1)
  const endOfMonth = new Date(year, month, 0, 23, 59, 59)

  const [salary, expenses, currentSaving, totalSavings, allSavings] = await Promise.all([
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
    getSavingByMonthYear(userId, month, year),
    getTotalSavings(userId),
    getAllSavings(userId),
  ])

  const salaryAmount = salary ? calculateTotalSalary(salary) : 0
  const expenseAmount = expenses._sum.amount || 0
  const remainingFromSalary = salaryAmount - expenseAmount
  const savedThisMonth = currentSaving?.amount || 0

  return {
    salaryAmount,
    expenseAmount,
    remainingFromSalary,
    savedThisMonth,
    totalSavings,
    allSavings,
    canSave: remainingFromSalary > 0,
  }
}
