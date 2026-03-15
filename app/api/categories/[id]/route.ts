import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const existing = await prisma.category.findUnique({
      where: { id: params.id },
    })

    if (!existing) {
      return NextResponse.json({ message: 'Not found' }, { status: 404 })
    }

    // Only allow editing user's own categories
    if (!existing.isDefault && existing.userId !== session.user.id) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
    }

    const data = await request.json()
    const category = await prisma.category.update({
      where: { id: params.id },
      data: {
        name: data.name,
        icon: data.icon,
        color: data.color,
      },
    })

    return NextResponse.json(category)
  } catch (error) {
    console.error('Error updating category:', error)
    return NextResponse.json(
      { message: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const existing = await prisma.category.findUnique({
      where: { id: params.id },
    })

    if (!existing) {
      return NextResponse.json({ message: 'Not found' }, { status: 404 })
    }

    // Only allow deleting user's own categories, not default ones
    if (existing.isDefault || existing.userId !== session.user.id) {
      return NextResponse.json(
        { message: 'Kategori default tidak dapat dihapus' },
        { status: 403 }
      )
    }

    await prisma.category.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: 'Kategori berhasil dihapus' })
  } catch (error) {
    console.error('Error deleting category:', error)
    return NextResponse.json(
      { message: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}
