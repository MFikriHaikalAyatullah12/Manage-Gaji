import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import {
  getEmailSettings,
  createOrUpdateEmailSettings,
  testEmailConnection,
  isSystemEmailConfigured,
} from '@/services/emailService'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const settings = await getEmailSettings(session.user.id)
    
    if (settings) {
      return NextResponse.json({
        id: settings.id,
        notificationEmail: settings.notificationEmail,
        isEnabled: settings.isEnabled,
        systemConfigured: isSystemEmailConfigured(),
      })
    }

    return NextResponse.json({
      systemConfigured: isSystemEmailConfigured(),
    })
  } catch (error) {
    console.error('Error fetching email settings:', error)
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

    // Test connection if action is test
    if (data.action === 'test') {
      const result = await testEmailConnection(session.user.id)
      return NextResponse.json(result)
    }

    const settings = await createOrUpdateEmailSettings({
      userId: session.user.id,
      notificationEmail: data.notificationEmail,
      isEnabled: data.isEnabled,
    })

    return NextResponse.json({
      id: settings.id,
      notificationEmail: settings.notificationEmail,
      isEnabled: settings.isEnabled,
    })
  } catch (error: any) {
    console.error('Error updating email settings:', error)
    
    // Check if it's a user not found error
    if (error.message?.includes('User not found')) {
      return NextResponse.json(
        { message: 'Sesi telah berakhir. Silakan login kembali.' },
        { status: 401 }
      )
    }
    
    return NextResponse.json(
      { message: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}
