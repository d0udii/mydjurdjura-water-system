import { useState, useEffect, useCallback } from 'react'

interface Notification {
  id: string
  title: string
  message: string
  type: string
  priority: string
  target_role: string
  target_user_id: string | null
  is_read: boolean
  created_by: string
  created_at: string
  expires_at?: string
  order_id?: string
  bl_number?: string
  new_status?: string
  rejection_reason?: string
  edited_fields?: string[]
}

interface UseNotificationsProps {
  userId: string
  userRole: string
  enabled?: boolean
}

interface UseNotificationsReturn {
  notifications: Notification[]
  unreadCount: number
  isLoading: boolean
  error: string | null
  markAsRead: (notificationId: string) => Promise<void>
  markAllAsRead: () => Promise<void>
  refreshNotifications: () => Promise<void>
}

export function useNotifications({ 
  userId, 
  userRole, 
  enabled = true 
}: UseNotificationsProps): UseNotificationsReturn {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchNotifications = useCallback(async () => {
    if (!enabled || !userId || !userRole) return

    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch(`/api/notifications?user_role=${userRole}&user_id=${userId}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch notifications')
      }

      const data = await response.json()
      setNotifications(data.notifications || [])
      
      // Calculate unread count
      const unread = data.notifications?.filter((n: Notification) => !n.is_read).length || 0
      setUnreadCount(unread)

    } catch (err) {
      console.error('Error fetching notifications:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch notifications')
    } finally {
      setIsLoading(false)
    }
  }, [userId, userRole, enabled])

  const fetchUnreadCount = useCallback(async () => {
    if (!enabled || !userId || !userRole) return

    try {
      const response = await fetch(`/api/notifications/manage?user_id=${userId}&user_role=${userRole}`)
      
      if (response.ok) {
        const data = await response.json()
        setUnreadCount(data.unreadCount || 0)
      }
    } catch (err) {
      console.error('Error fetching unread count:', err)
    }
  }, [userId, userRole, enabled])

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      const response = await fetch('/api/notifications/manage', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          notificationId,
          userId,
          userRole
        })
      })

      if (response.ok) {
        const data = await response.json()
        
        // Update local state
        setNotifications(prev => 
          prev.map(n => 
            n.id === notificationId 
              ? { ...n, is_read: true, read_at: new Date().toISOString() }
              : n
          )
        )
        
        setUnreadCount(data.unreadCount || 0)
      }
    } catch (err) {
      console.error('Error marking notification as read:', err)
    }
  }, [userId, userRole])

  const markAllAsRead = useCallback(async () => {
    try {
      const response = await fetch('/api/notifications/manage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          userRole
        })
      })

      if (response.ok) {
        // Update local state
        setNotifications(prev => 
          prev.map(n => ({ ...n, is_read: true, read_at: new Date().toISOString() }))
        )
        
        setUnreadCount(0)
      }
    } catch (err) {
      console.error('Error marking all notifications as read:', err)
    }
  }, [userId, userRole])

  const refreshNotifications = useCallback(async () => {
    await fetchNotifications()
  }, [fetchNotifications])

  // Initial fetch
  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  // Set up real-time updates (polling every 10 seconds)
  useEffect(() => {
    if (!enabled) return

    const interval = setInterval(() => {
      fetchUnreadCount()
    }, 10000) // Check for new notifications every 10 seconds

    return () => clearInterval(interval)
  }, [fetchUnreadCount, enabled])

  // Set up real-time updates for notifications (polling every 30 seconds)
  useEffect(() => {
    if (!enabled) return

    const interval = setInterval(() => {
      fetchNotifications()
    }, 30000) // Refresh notifications every 30 seconds

    return () => clearInterval(interval)
  }, [fetchNotifications, enabled])

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    markAsRead,
    markAllAsRead,
    refreshNotifications
  }
}
