'use client'

import { useNotification, Notification, NotificationType } from '@/contexts/NotificationContext'
import { FiX, FiCheck, FiAlertTriangle, FiAlertCircle, FiInfo } from 'react-icons/fi'

const iconMap: Record<NotificationType, React.ReactNode> = {
  success: <FiCheck size={20} />,
  error: <FiAlertCircle size={20} />,
  warning: <FiAlertTriangle size={20} />,
  info: <FiInfo size={20} />,
}

const colorMap: Record<NotificationType, { bg: string; border: string; icon: string; text: string }> = {
  success: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    icon: 'bg-green-500 text-white',
    text: 'text-green-800',
  },
  error: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    icon: 'bg-red-500 text-white',
    text: 'text-red-800',
  },
  warning: {
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    icon: 'bg-yellow-500 text-white',
    text: 'text-yellow-800',
  },
  info: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    icon: 'bg-blue-500 text-white',
    text: 'text-blue-800',
  },
}

function ToastItem({ notification }: { notification: Notification }) {
  const { removeNotification } = useNotification()
  const colors = colorMap[notification.type]

  return (
    <div
      className={`${colors.bg} ${colors.border} border rounded-xl p-3 sm:p-4 shadow-lg flex items-start gap-3 animate-slideIn max-w-sm`}
    >
      <div className={`${colors.icon} p-1.5 rounded-lg flex-shrink-0`}>
        {iconMap[notification.type]}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`${colors.text} font-semibold text-sm`}>{notification.title}</p>
        {notification.message && (
          <p className={`${colors.text} opacity-80 text-xs mt-0.5`}>{notification.message}</p>
        )}
      </div>
      <button
        onClick={() => removeNotification(notification.id)}
        className={`${colors.text} opacity-60 hover:opacity-100 transition-opacity p-1 flex-shrink-0`}
      >
        <FiX size={16} />
      </button>
    </div>
  )
}

export function ToastContainer() {
  const { notifications } = useNotification()

  if (notifications.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-[100] space-y-2 max-w-[calc(100vw-2rem)]">
      {notifications.map((notification) => (
        <ToastItem key={notification.id} notification={notification} />
      ))}
    </div>
  )
}
