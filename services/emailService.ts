import prisma from '@/lib/prisma'
import {
  sendEmail,
  isEmailSystemConfigured,
  salaryExceededEmailTemplate,
  budgetExceededEmailTemplate,
  lowBalanceEmailTemplate,
} from '@/lib/email'

export interface EmailSettingsInput {
  userId: string
  notificationEmail?: string
  isEnabled?: boolean
}

export async function getEmailSettings(userId: string) {
  return await prisma.emailSettings.findUnique({
    where: { userId },
  })
}

export async function createOrUpdateEmailSettings(data: EmailSettingsInput) {
  // Verify user exists first
  const userExists = await prisma.user.findUnique({
    where: { id: data.userId },
  })
  
  if (!userExists) {
    throw new Error('User not found. Please login again.')
  }

  return await prisma.emailSettings.upsert({
    where: { userId: data.userId },
    update: {
      notificationEmail: data.notificationEmail,
      isEnabled: data.isEnabled,
    },
    create: {
      userId: data.userId,
      notificationEmail: data.notificationEmail,
      isEnabled: data.isEnabled ?? true,
    },
  })
}

// Check if system email is configured
export function isSystemEmailConfigured(): boolean {
  return isEmailSystemConfigured()
}

export async function sendSalaryExceededNotification(
  userId: string,
  gaji: number,
  pengeluaran: number
) {
  const settings = await getEmailSettings(userId)
  if (!settings?.isEnabled) {
    return { success: false, error: 'Email notifications disabled' }
  }

  if (!isSystemEmailConfigured()) {
    return { success: false, error: 'System email not configured' }
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
  })

  const selisih = gaji - pengeluaran
  const to = settings.notificationEmail || user?.email

  if (!to) {
    return { success: false, error: 'No email address found' }
  }

  return await sendEmail({
    to,
    subject: 'Peringatan Keuangan - Pengeluaran Melebihi Gaji',
    html: salaryExceededEmailTemplate(gaji, pengeluaran, selisih),
  })
}

export async function sendBudgetExceededNotification(
  userId: string,
  categoryName: string,
  budget: number,
  spent: number
) {
  const settings = await getEmailSettings(userId)
  if (!settings?.isEnabled) {
    return { success: false, error: 'Email notifications disabled' }
  }

  if (!isSystemEmailConfigured()) {
    return { success: false, error: 'System email not configured' }
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
  })

  const to = settings.notificationEmail || user?.email

  if (!to) {
    return { success: false, error: 'No email address found' }
  }

  return await sendEmail({
    to,
    subject: `Peringatan Anggaran - ${categoryName} Terlampaui`,
    html: budgetExceededEmailTemplate(categoryName, budget, spent),
  })
}

export async function sendLowBalanceNotification(userId: string, balance: number) {
  const settings = await getEmailSettings(userId)
  if (!settings?.isEnabled) {
    return { success: false, error: 'Email notifications disabled' }
  }

  if (!isSystemEmailConfigured()) {
    return { success: false, error: 'System email not configured' }
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
  })

  const to = settings.notificationEmail || user?.email

  if (!to) {
    return { success: false, error: 'No email address found' }
  }

  return await sendEmail({
    to,
    subject: 'Pemberitahuan - Saldo Tersisa Rendah',
    html: lowBalanceEmailTemplate(balance),
  })
}

export async function testEmailConnection(userId: string) {
  const settings = await getEmailSettings(userId)
  
  if (!isSystemEmailConfigured()) {
    return { success: false, error: 'System email not configured' }
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
  })

  const to = settings?.notificationEmail || user?.email

  if (!to) {
    return { success: false, error: 'No email address found' }
  }

  return await sendEmail({
    to,
    subject: 'Test Email - Pengelola Keuangan',
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>Test Email Berhasil!</h2>
        <p>Email ini dikirim untuk memastikan sistem notifikasi berfungsi dengan baik.</p>
        <p>Anda akan menerima notifikasi keuangan ke alamat email ini.</p>
      </div>
    `,
  })
}
