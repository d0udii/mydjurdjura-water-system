import { NextRequest, NextResponse } from 'next/server'
import { getNotifications, createNotification, markNotificationAsRead } from '@/lib/supabase-db'
import { initializeDatabase } from '@/lib/supabase-db'

export async function GET(request: NextRequest) {
  try {
    await initializeDatabase()
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('user_id')
    const type = searchParams.get('type')
    const isRead = searchParams.get('is_read')
    
    let notifications = await getNotifications(userId || undefined)
    
    if (type) {
      notifications = notifications.filter(n => n.type === type)
    }
    
    if (isRead !== null) {
      const readStatus = isRead === 'true'
      notifications = notifications.filter(n => n.is_read === readStatus)
    }
    
    return NextResponse.json({ notifications })
  } catch (error) {
    console.error('Error fetching notifications:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await initializeDatabase()
    const data = await request.json()
    const { user_id, title, message, type } = data
    
    // Validation
    if (!user_id || !title || !message) {
      return NextResponse.json(
        { error: 'User ID, title, and message are required' },
        { status: 400 }
      )
    }
    
    const notification = await createNotification({
      user_id,
      title,
      message,
      type: type || 'info',
      is_read: false
    })
    
    if (!notification) {
      return NextResponse.json(
        { error: 'Failed to create notification' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({ 
      notification, 
      message: "Notification created successfully" 
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating notification:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    await initializeDatabase()
    const data = await request.json()
    const { id, is_read } = data
    
    if (!id) {
      return NextResponse.json(
        { error: 'Notification ID is required' },
        { status: 400 }
      )
    }
    
    const success = await markNotificationAsRead(id)
    
    if (!success) {
      return NextResponse.json(
        { error: 'Notification not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ 
      message: "Notification marked as read" 
    })
  } catch (error) {
    console.error('Error updating notification:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}