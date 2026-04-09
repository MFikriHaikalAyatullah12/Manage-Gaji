import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import {
  createOrUpdateSaving,
  getSavingsOverview,
  getAllSavings,
  getTotalSavings,
} from '@/services/savingsService'

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

    // Get savings overview
    if (action === 'overview') {
      const overview = await getSavingsOverview(session.user.id, m, y)
      return NextResponse.json(overview)
    }

    // Get total savings
    if (action === 'total') {
      const total = await getTotalSavings(session.user.id)
      return NextResponse.json({ total })
    }

    // Get all savings
    const savings = await getAllSavings(session.user.id)
    return NextResponse.json(savings)
  } catch (error) {
    console.error('Error fetching savings:', error)
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
    const saving = await createOrUpdateSaving({
      userId: session.user.id,
      amount: data.amount,
      month: data.month,
      year: data.year,
      note: data.note,
    })

    return NextResponse.json(saving, { status: 201 })
  } catch (error) {
    console.error('Error creating saving:', error)
    return NextResponse.json(
      { message: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}
