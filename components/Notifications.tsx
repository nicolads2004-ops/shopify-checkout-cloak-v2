'use client'

interface Notification {
  type: 'success' | 'warning' | 'error' | 'info'
  message: string
  timestamp: Date
}

interface NotificationsProps {
  notifications: Notification[]
  onDismiss: (index: number) => void
}

export default function Notifications({ notifications, onDismiss }: NotificationsProps) {
  if (notifications.length === 0) return null

  return (
    <div className="fixed top-20 right-4 z-50 space-y-2 max-w-md">
      {notifications.map((notif, index) => (
        <div
          key={index}
          className={`p-4 rounded-lg shadow-lg border-l-4 backdrop-blur-sm animate-slide-in ${
            notif.type === 'error'
              ? 'bg-red-900/90 border-red-500'
              : notif.type === 'warning'
              ? 'bg-yellow-900/90 border-yellow-500'
              : notif.type === 'success'
              ? 'bg-green-900/90 border-green-500'
              : 'bg-blue-900/90 border-blue-500'
          }`}
        >
          <div className="flex items-start justify-between">
            <p className="text-white text-sm font-medium">{notif.message}</p>
            <button
              onClick={() => onDismiss(index)}
              className="ml-4 text-white/70 hover:text-white"
            >
              ✕
            </button>
          </div>
          <p className="text-xs text-white/60 mt-1">
            {new Date(notif.timestamp).toLocaleTimeString('fr-FR')}
          </p>
        </div>
      ))}
    </div>
  )
}
