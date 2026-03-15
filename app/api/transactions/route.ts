import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import {
  createTransaction,
  getUserTransactions,
  getMonthlyTotals,
  getCategoryExpenses,
  getMonthlyTrend,
  getDailyExpenses,
} from '@/services/transactionService'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') as 'income' | 'expense' | null
    const categoryId = searchParams.get('categoryId')
    const month = searchParams.get('month')
    const year = searchParams.get('year')
    const search = searchParams.get('search')
    const action = searchParams.get('action')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    // Get monthly totals
    if (action === 'totals') {
      const m = parseInt(month || String(new Date().getMonth() + 1))
      const y = parseInt(year || String(new Date().getFullYear()))
      const totals = await getMonthlyTotals(session.user.id, m, y)
      return NextResponse.json(totals)
    }

    // Get category expenses
    if (action === 'categoryExpenses') {
      const m = parseInt(month || String(new Date().getMonth() + 1))
      const y = parseInt(year || String(new Date().getFullYear()))
      const expenses = await getCategoryExpenses(session.user.id, m, y)
      return NextResponse.json(expenses)
    }

    // Get monthly trend
    if (action === 'trend') {
      const y = parseInt(year || String(new Date().getFullYear()))
      const trend = await getMonthlyTrend(session.user.id, y)
      return NextResponse.json(trend)
    }

    // Get daily expenses
    if (action === 'daily') {
      const m = parseInt(month || String(new Date().getMonth() + 1))
      const y = parseInt(year || String(new Date().getFullYear()))
      const daily = await getDailyExpenses(session.user.id, m, y)
      return NextResponse.json(daily)
    }

    // Get transactions
    const result = await getUserTransactions(session.user.id, {
      type: type || undefined,
      categoryId: categoryId || undefined,
      month: month ? parseInt(month) : undefined,
      year: year ? parseInt(year) : undefined,
      search: search || undefined,
      skip: (page - 1) * limit,
      take: limit,
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching transactions:', error)
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
    const transaction = await createTransaction({
      userId: session.user.id,
      tanggal: new Date(data.tanggal),
      amount: data.amount,
      type: data.type,
      categoryId: data.categoryId || null,
      note: data.note || null,
    })

    return NextResponse.json(transaction, { status: 201 })
  } catch (error) {
    console.error('Error creating transaction:', error)
    return NextResponse.json(
      { message: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}
