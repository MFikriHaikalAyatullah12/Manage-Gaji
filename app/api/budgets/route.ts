import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import {
  createOrUpdateBudget,
  getBudgetsByMonthYear,
  getBudgetStatus,
} from '@/services/budgetService'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const month = searchParams.get('month')
    const year = searchParams.get('year')
    const action = searchParams.get('action')

    const m = parseInt(month || String(new Date().getMonth() + 1))
    const y = parseInt(year || String(new Date().getFullYear()))

    // Get budget status with spent amounts
    if (action === 'status') {
      const status = await getBudgetStatus(session.user.id, m, y)
      return NextResponse.json(status)
    }

    // Get budgets for month/year
    const budgets = await getBudgetsByMonthYear(session.user.id, m, y)
    return NextResponse.json(budgets)
  } catch (error) {
    console.error('Error fetching budgets:', error)
    return NextResponse.json(
      { message: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.json()
    const budget = await createOrUpdateBudget({
      userId: session.user.id,
      categoryId: data.categoryId,
      limitAmount: data.limitAmount,
      month: data.month,
      year: data.year,
    })

    return NextResponse.json(budget, { status: 201 })
  } catch (error) {
    console.error('Error creating budget:', error)
    return NextResponse.json(
      { message: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}
