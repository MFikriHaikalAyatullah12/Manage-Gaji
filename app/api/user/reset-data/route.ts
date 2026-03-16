import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id

    // Delete all user data in order (respect foreign key constraints)
    // 1. Delete transactions
    await prisma.transaction.deleteMany({
      where: { userId },
    })

    // 2. Delete budgets
    await prisma.budget.deleteMany({
      where: { userId },
    })

    // 3. Delete salaries
    await prisma.salary.deleteMany({
      where: { userId },
    })

    // 4. Delete categories
    await prisma.category.deleteMany({
      where: { userId },
    })

    return NextResponse.json({ 
      message: 'Semua data berhasil dihapus',
      deleted: {
        transactions: true,
        budgets: true,
        salaries: true,
        categories: true,
      }
    })
  } catch (error) {
    console.error('Error resetting user data:', error)
    return NextResponse.json(
      { message: 'Terjadi kesalahan saat menghapus data' },
      { status: 500 }
    )
  }
}
