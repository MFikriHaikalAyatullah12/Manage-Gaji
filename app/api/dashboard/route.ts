import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getMonthlyTotals, getCategoryExpenses, getMonthlyTrend } from '@/services/transactionService'
import { getSalaryVsExpense } from '@/services/salaryService'
import { getBudgetStatus } from '@/services/budgetService'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const month = parseInt(searchParams.get('month') || String(new Date().getMonth() + 1))
    const year = parseInt(searchParams.get('year') || String(new Date().getFullYear()))

    // Get all dashboard data in parallel
    const [totals, salaryComparison, categoryExpenses, budgetStatus, monthlyTrend] = await Promise.all([
      getMonthlyTotals(session.user.id, month, year),
      getSalaryVsExpense(session.user.id, month, year),
      getCategoryExpenses(session.user.id, month, year),
      getBudgetStatus(session.user.id, month, year),
      getMonthlyTrend(session.user.id, year),
    ])

    // Calculate daily average
    const daysElapsed = new Date().getDate()
    const daysInMonth = new Date(year, month, 0).getDate()
    const dailyAverage = daysElapsed > 0 ? totals.expense / daysElapsed : 0
    const projectedMonthly = dailyAverage * daysInMonth

    return NextResponse.json({
      totals,
      salaryComparison,
      categoryExpenses,
      budgetStatus,
      monthlyTrend,
      dailyStats: {
        dailyAverage,
        projectedMonthly,
        daysElapsed,
        daysInMonth,
      },
    })
  } catch (error) {
    console.error('Error fetching dashboard data:', error)
    return NextResponse.json(
      { message: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}
