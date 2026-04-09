import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { deleteSaving, getSavingById } from '@/services/savingsService'

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const existing = await getSavingById(params.id)

    if (!existing) {
      return NextResponse.json({ message: 'Not found' }, { status: 404 })
    }

    if (existing.userId !== session.user.id) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
    }

    await deleteSaving(params.id)

    return NextResponse.json({ message: 'Berhasil dihapus' })
  } catch (error) {
    console.error('Error deleting saving:', error)
    return NextResponse.json(
      { message: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}
