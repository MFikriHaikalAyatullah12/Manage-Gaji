import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { deleteSalary } from '@/services/salaryService'

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const existing = await prisma.salary.findUnique({
      where: { id: params.id },
    })

    if (!existing || existing.userId !== session.user.id) {
      return NextResponse.json({ message: 'Not found' }, { status: 404 })
    }

    await deleteSalary(params.id)
    return NextResponse.json({ message: 'Gaji berhasil dihapus' })
  } catch (error) {
    console.error('Error deleting salary:', error)
    return NextResponse.json(
      { message: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}
