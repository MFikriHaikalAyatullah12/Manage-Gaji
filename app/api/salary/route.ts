import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import {
  createOrUpdateSalary,
  getUserSalary,
  getSalaryVsExpense,
} from '@/services/salaryService'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    console.log('Salary GET - Session:', session?.user?.id ? 'Found' : 'Not found')
    
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const month = searchParams.get('month')
    const year = searchParams.get('year')
    const action = searchParams.get('action')

    // Get salary vs expense comparison
    if (action === 'compare') {
      const m = parseInt(month || String(new Date().getMonth() + 1))
      const y = parseInt(year || String(new Date().getFullYear()))
      const comparison = await getSalaryVsExpense(session.user.id, m, y)
      return NextResponse.json(comparison)
    }

    // Get user's salary
    const salary = await getUserSalary(session.user.id)
    console.log('Salary GET - Found salary:', salary ? salary.id : 'null')
    return NextResponse.json(salary)
  } catch (error) {
    console.error('Error fetching salary:', error)
    return NextResponse.json(
      { message: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    console.log('Salary POST - Session:', session?.user?.id ? 'Found' : 'Not found')
    
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.json()
    console.log('Salary POST - Data received:', data)
    
    const salary = await createOrUpdateSalary({
      userId: session.user.id,
      gajiPokok: data.gajiPokok,
      tunjangan: data.tunjangan,
      bonus: data.bonus,
      potongan: data.potongan,
    })
    
    console.log('Salary POST - Saved:', salary.id)

    return NextResponse.json(salary, { status: 201 })
  } catch (error) {
    console.error('Error creating salary:', error)
    return NextResponse.json(
      { message: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}
