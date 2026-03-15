import nodemailer from 'nodemailer'
import prisma from './prisma'

interface SendEmailParams {
  to: string
  subject: string
  html: string
}

// Check if Gmail SMTP is configured
export function isEmailSystemConfigured(): boolean {
  const email = process.env.SYSTEM_SMTP_EMAIL
  const password = process.env.SYSTEM_SMTP_PASSWORD
  return !!(email && password && email !== 'email_anda@gmail.com' && password !== 'xxxx xxxx xxxx xxxx')
}

// Create Gmail SMTP transporter
function createTransporter() {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.SYSTEM_SMTP_EMAIL,
      pass: process.env.SYSTEM_SMTP_PASSWORD,
    },
  })
}

export async function sendEmail({ to, subject, html }: SendEmailParams) {
  try {
    if (!isEmailSystemConfigured()) {
      console.error('Gmail SMTP not configured')
      return { success: false, error: 'Email system not configured. Please set SYSTEM_SMTP_EMAIL and SYSTEM_SMTP_PASSWORD in .env' }
    }
    
    const transporter = createTransporter()
    
    const info = await transporter.sendMail({
      from: `"Pengelola Keuangan" <${process.env.SYSTEM_SMTP_EMAIL}>`,
      to,
      subject,
      html,
    })

    console.log('Email sent:', info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (error: any) {
    console.error('Error sending email:', error)
    return { success: false, error: error.message || 'Failed to send email' }
  }
}

export async function getUserEmailSettings(userId: string) {
  return await prisma.emailSettings.findUnique({
    where: { userId },
  })
}

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

// Email Templates
export function salaryExceededEmailTemplate(
  gaji: number,
  pengeluaran: number,
  selisih: number
): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #ef4444, #dc2626); color: white; padding: 20px; border-radius: 10px 10px 0 0; }
        .content { background: #f9fafb; padding: 20px; border-radius: 0 0 10px 10px; }
        .warning-box { background: #fee2e2; border-left: 4px solid #ef4444; padding: 15px; margin: 15px 0; border-radius: 5px; }
        .amount { font-size: 18px; font-weight: bold; }
        .negative { color: #ef4444; }
        .footer { margin-top: 20px; text-align: center; color: #6b7280; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2 style="margin:0;">⚠️ Peringatan Keuangan</h2>
          <p style="margin:5px 0 0;">Pengeluaran Melebihi Gaji</p>
        </div>
        <div class="content">
          <p>Halo,</p>
          <p>Total pengeluaran Anda bulan ini telah <strong>melebihi gaji pokok</strong>.</p>
          
          <div class="warning-box">
            <p><strong>Gaji Pokok:</strong> <span class="amount">${formatRupiah(gaji)}</span></p>
            <p><strong>Total Pengeluaran:</strong> <span class="amount negative">${formatRupiah(pengeluaran)}</span></p>
            <p><strong>Selisih:</strong> <span class="amount negative">${formatRupiah(selisih)}</span></p>
          </div>
          
          <p>Silakan periksa dashboard keuangan Anda dan pertimbangkan untuk mengurangi pengeluaran.</p>
          
          <div class="footer">
            <p>Email ini dikirim secara otomatis oleh sistem Pengelola Keuangan.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `
}

export function budgetExceededEmailTemplate(
  categoryName: string,
  budget: number,
  spent: number
): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #f97316, #ea580c); color: white; padding: 20px; border-radius: 10px 10px 0 0; }
        .content { background: #f9fafb; padding: 20px; border-radius: 0 0 10px 10px; }
        .warning-box { background: #ffedd5; border-left: 4px solid #f97316; padding: 15px; margin: 15px 0; border-radius: 5px; }
        .amount { font-size: 18px; font-weight: bold; }
        .footer { margin-top: 20px; text-align: center; color: #6b7280; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2 style="margin:0;">📊 Peringatan Anggaran</h2>
          <p style="margin:5px 0 0;">Anggaran Kategori Terlampaui</p>
        </div>
        <div class="content">
          <p>Halo,</p>
          <p>Pengeluaran untuk kategori <strong>${categoryName}</strong> telah melebihi anggaran yang ditetapkan.</p>
          
          <div class="warning-box">
            <p><strong>Kategori:</strong> ${categoryName}</p>
            <p><strong>Anggaran:</strong> <span class="amount">${formatRupiah(budget)}</span></p>
            <p><strong>Terpakai:</strong> <span class="amount" style="color:#ef4444;">${formatRupiah(spent)}</span></p>
          </div>
          
          <p>Silakan periksa pengeluaran Anda pada kategori ini.</p>
          
          <div class="footer">
            <p>Email ini dikirim secara otomatis oleh sistem Pengelola Keuangan.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `
}

export function lowBalanceEmailTemplate(
  balance: number,
  threshold: number = 500000
): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #3b82f6, #2563eb); color: white; padding: 20px; border-radius: 10px 10px 0 0; }
        .content { background: #f9fafb; padding: 20px; border-radius: 0 0 10px 10px; }
        .info-box { background: #dbeafe; border-left: 4px solid #3b82f6; padding: 15px; margin: 15px 0; border-radius: 5px; }
        .amount { font-size: 18px; font-weight: bold; }
        .footer { margin-top: 20px; text-align: center; color: #6b7280; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2 style="margin:0;">💰 Pemberitahuan Saldo</h2>
          <p style="margin:5px 0 0;">Saldo Tersisa Rendah</p>
        </div>
        <div class="content">
          <p>Halo,</p>
          <p>Saldo keuangan Anda bulan ini berada di bawah batas minimum yang disarankan.</p>
          
          <div class="info-box">
            <p><strong>Saldo Tersisa:</strong> <span class="amount">${formatRupiah(balance)}</span></p>
            <p><strong>Batas Minimum:</strong> ${formatRupiah(threshold)}</p>
          </div>
          
          <p>Pertimbangkan untuk mengurangi pengeluaran atau menambah pemasukan.</p>
          
          <div class="footer">
            <p>Email ini dikirim secara otomatis oleh sistem Pengelola Keuangan.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `
}
