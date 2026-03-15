import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { hash, compare } from 'bcryptjs'
import prisma from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        createdAt: true,
      },
    })

    return NextResponse.json(user)
  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json(
      { message: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.json()

    // If changing password
    if (data.currentPassword && data.newPassword) {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
      })

      if (!user?.password) {
        return NextResponse.json(
          { message: 'Password tidak dapat diubah untuk akun OAuth' },
          { status: 400 }
        )
      }

      const isValid = await compare(data.currentPassword, user.password)
      if (!isValid) {
        return NextResponse.json(
          { message: 'Password saat ini salah' },
          { status: 400 }
        )
      }

      const hashedPassword = await hash(data.newPassword, 12)
      await prisma.user.update({
        where: { id: session.user.id },
        data: { password: hashedPassword },
      })

      return NextResponse.json({ message: 'Password berhasil diubah' })
    }

    // Update profile
    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: data.name,
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
      },
    })

    return NextResponse.json(user)
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json(
      { message: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}
