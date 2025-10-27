import { NextRequest, NextResponse } from 'next/server'

// Mock notifications storage (copied from main notifications route)
let notifications: any[] = [
  {
    id: "NOTIF-001",
    title: "New Promotion Available",
    message: "Summer discount promotion is now active for Biskra region",
    type: "promotion",
    priority: "medium",
    target_role: "all",
    target_user_id: null,
    is_read: false,
    created_by: "USR-001",
    created_at: "2024-01-01T00:00:00Z",
    expires_at: "2024-12-31T23:59:59Z"
  }
]

// Function to mark notification as read
async function markNotificationAsRead(notificationId: string) {
  const notificationIndex = notifications.findIndex(n => n.id === notificationId)
  if (notificationIndex !== -1) {
    notifications[notificationIndex] = {
      ...notifications[notificationIndex],
      is_read: true,
      read_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    return notifications[notificationIndex]
  }
  return null
}

// Function to mark all notifications as read for a user
async function markAllNotificationsAsRead(userId: string, userRole: string) {
  const userNotifications = notifications.filter(n => 
    (n.target_role === "all" || n.target_role === userRole) &&
    (n.target_user_id === null || n.target_user_id === userId) &&
    !n.is_read
  )
  
  userNotifications.forEach(notification => {
    const index = notifications.findIndex(n => n.id === notification.id)
    if (index !== -1) {
      notifications[index] = {
        ...notifications[index],
        is_read: true,
        read_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    }
  })
  
  return userNotifications.length
}

// Function to get unread notification count
function getUnreadNotificationCount(userId: string, userRole: string) {
  return notifications.filter(n => 
    (n.target_role === "all" || n.target_role === userRole) &&
    (n.target_user_id === null || n.target_user_id === userId) &&
    !n.is_read &&
    (!n.expires_at || new Date(n.expires_at) > new Date())
  ).length
}

// Mark single notification as read
export async function PUT(request: NextRequest) {
  try {
    const data = await request.json()
    const { notificationId, userId, userRole } = data
    
    if (!notificationId) {
      return NextResponse.json(
        { error: 'Notification ID is required' },
        { status: 400 }
      )
    }
    
    const updatedNotification = await markNotificationAsRead(notificationId)
    
    if (!updatedNotification) {
      return NextResponse.json(
        { error: 'Notification not found' },
        { status: 404 }
      )
    }
    
    // Get updated unread count
    const unreadCount = userId && userRole ? getUnreadNotificationCount(userId, userRole) : 0
    
    return NextResponse.json({
      notification: updatedNotification,
      unreadCount,
      message: 'Notification marked as read'
    })
  } catch (error) {
    console.error('Error marking notification as read:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Mark all notifications as read for a user
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const { userId, userRole } = data
    
    if (!userId || !userRole) {
      return NextResponse.json(
        { error: 'User ID and role are required' },
        { status: 400 }
      )
    }
    
    const markedCount = await markAllNotificationsAsRead(userId, userRole)
    
    return NextResponse.json({
      markedCount,
      message: `${markedCount} notifications marked as read`
    })
  } catch (error) {
    console.error('Error marking all notifications as read:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Get unread notification count
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('user_id')
    const userRole = searchParams.get('user_role')
    
    if (!userId || !userRole) {
      return NextResponse.json(
        { error: 'User ID and role are required' },
        { status: 400 }
      )
    }
    
    const unreadCount = getUnreadNotificationCount(userId, userRole)
    
    return NextResponse.json({
      unreadCount,
      userId,
      userRole
    })
  } catch (error) {
    console.error('Error getting unread notification count:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
