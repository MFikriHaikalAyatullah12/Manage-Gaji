import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Providers from './providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Pengelola Keuangan - Aplikasi Manajemen Keuangan Pribadi',
  description: 'Kelola keuangan pribadi Anda dengan mudah. Catat pemasukan, pengeluaran, dan pantau anggaran bulanan Anda.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id">
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
