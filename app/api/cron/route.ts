import { NextResponse } from 'next/server'
import { checkFinances } from '@/lib/cron'

export async function POST(request: Request) {
  try {
    // Verify cron secret
    const { searchParams } = new URL(request.url)
    const secret = searchParams.get('secret')
    
    if (secret !== process.env.CRON_SECRET) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    await checkFinances()
    return NextResponse.json({ message: 'Cron job executed successfully' })
  } catch (error) {
    console.error('Error running cron job:', error)
    return NextResponse.json(
      { message: 'Error running cron job' },
      { status: 500 }
    )
  }
}
