import { NextResponse } from 'next/server'
import { hash } from 'bcryptjs'
import prisma from '@/lib/prisma'

// Default categories untuk setiap user baru
const DEFAULT_CATEGORIES = [
  { name: 'Beras', color: '#ec4899' },
  { name: 'Lauk', color: '#ef4444' },
  { name: 'Kebersihan', color: '#06b6d4' },
  { name: 'Skincare', color: '#8b5cf6' },
  { name: 'Jajan', color: '#f97316' },
  { name: 'Lain-lain', color: '#6b7280' },
]

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email dan password diperlukan' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { message: 'Email sudah terdaftar' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await hash(password, 12)

    // Create user with default categories
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        categories: {
          create: DEFAULT_CATEGORIES,
        },
      },
    })

    return NextResponse.json(
      {
        message: 'Registrasi berhasil',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { message: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}
