'use client'

import { Suspense } from 'react'
import { SessionProvider } from 'next-auth/react'
import { NotificationProvider } from '@/contexts/NotificationContext'
import { ToastContainer } from '@/components/notifications/Toast'
import ProgressBar from '@/components/ProgressBar'

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <NotificationProvider>
        <Suspense fallback={null}>
          <ProgressBar />
        </Suspense>
        {children}
        <ToastContainer />
      </NotificationProvider>
    </SessionProvider>
  )
}
