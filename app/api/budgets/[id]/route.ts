import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getBudgetById, deleteBudget } from '@/services/budgetService'

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const existing = await getBudgetById(params.id)
    if (!existing || existing.userId !== session.user.id) {
      return NextResponse.json({ message: 'Not found' }, { status: 404 })
    }

    await deleteBudget(params.id)
    return NextResponse.json({ message: 'Anggaran berhasil dihapus' })
  } catch (error) {
    console.error('Error deleting budget:', error)
    return NextResponse.json(
      { message: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}
