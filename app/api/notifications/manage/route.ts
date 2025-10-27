import { NextRequest, NextResponse } from 'next/server'
import { markNotificationAsRead, markAllNotificationsAsRead, getUnreadNotificationCount } from '../notifications/route'

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
