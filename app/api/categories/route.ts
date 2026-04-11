import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

// Default categories untuk user
const DEFAULT_CATEGORIES = [
  { name: 'Beras', color: '#ec4899' },
  { name: 'Lauk', color: '#ef4444' },
  { name: 'Kebersihan', color: '#06b6d4' },
  { name: 'Skincare', color: '#8b5cf6' },
  { name: 'Jajan', color: '#f97316' },
  { name: 'Lain-lain', color: '#6b7280' },
]

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    // Get user's own categories only (fully isolated per user)
    let categories = await prisma.category.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: { name: 'asc' },
    })

    // If user has no categories, create default ones (for existing users)
    if (categories.length === 0) {
      await prisma.category.createMany({
        data: DEFAULT_CATEGORIES.map(cat => ({
          ...cat,
          userId: session.user.id,
        })),
      })

      // Fetch again after creating
      categories = await prisma.category.findMany({
        where: {
          userId: session.user.id,
        },
        orderBy: { name: 'asc' },
      })
    }

    return NextResponse.json(categories)
  } catch (error) {
    console.error('Error fetching categories:', error)
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
    const category = await prisma.category.create({
      data: {
        name: data.name,
        color: data.color || '#6b7280',
        userId: session.user.id,
      },
    })

    return NextResponse.json(category, { status: 201 })
  } catch (error) {
    console.error('Error creating category:', error)
    return NextResponse.json(
      { message: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}
