import { NextRequest, NextResponse } from 'next/server'

// Mock notifications storage (in production, this would be in Supabase)
let notifications: any[] = [
  {
    id: "NOTIF-001",
    title: "New Promotion Available",
    message: "Summer discount promotion is now active for Biskra region",
    type: "promotion", // "meeting", "message", "alert", "promotion", "goal", "order"
    priority: "medium", // "low", "medium", "high", "urgent"
    target_role: "all", // "all", "admin", "supervisor", "regional_manager", "operations"
    target_user_id: null, // null for all users, specific user ID for individual
    is_read: false,
    created_by: "USR-001",
    created_at: "2024-01-01T00:00:00Z",
    expires_at: "2024-12-31T23:59:59Z"
  },
  {
    id: "NOTIF-002",
    title: "Team Meeting Scheduled",
    message: "Monthly team meeting scheduled for next Friday at 2 PM",
    type: "meeting",
    priority: "high",
    target_role: "all",
    target_user_id: null,
    is_read: false,
    created_by: "USR-001",
    created_at: "2024-01-01T00:00:00Z",
    expires_at: "2024-12-31T23:59:59Z"
  }
]

// Function to create automatic notifications for new orders
export function createOrderNotification(orderData: any, createdBy: string) {
  const orderId = orderData.id || `ORD-${Date.now()}`
  const clientName = orderData.client_name || "Unknown Client"
  const totalPrice = orderData.total_price || 0
  
  // Notification for Operations Team
  const operationsNotification = {
    id: `NOTIF-${Date.now()}-OPS`,
    title: "New Order Created",
    message: `Order ${orderId} created for ${clientName} - Total: ${totalPrice.toLocaleString()} DA`,
    type: "order",
    priority: "high",
    target_role: "operations",
    target_user_id: null,
    is_read: false,
    created_by: createdBy,
    created_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
  }
  
  // Notification for Admin
  const adminNotification = {
    id: `NOTIF-${Date.now()}-ADMIN`,
    title: "New Order Created",
    message: `Order ${orderId} created for ${clientName} - Total: ${totalPrice.toLocaleString()} DA`,
    type: "order",
    priority: "medium",
    target_role: "admin",
    target_user_id: null,
    is_read: false,
    created_by: createdBy,
    created_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
  }
  
  // Notification for Regional Manager (if applicable)
  const regionalManagerNotification = {
    id: `NOTIF-${Date.now()}-RM`,
    title: "New Order in Your Region",
    message: `Order ${orderId} created for ${clientName} in your region - Total: ${totalPrice.toLocaleString()} DA`,
    type: "order",
    priority: "medium",
    target_role: "regional_manager",
    target_user_id: null,
    is_read: false,
    created_by: createdBy,
    created_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
  }
  
  // Add notifications to the array
  notifications.push(operationsNotification, adminNotification, regionalManagerNotification)
  
  return [operationsNotification, adminNotification, regionalManagerNotification]
}

// Function to create client assignment notifications
export function createClientAssignmentNotification(clientData: any, supervisorId: string) {
  const clientName = clientData.name || "Unknown Client"
  const clientCity = clientData.address?.split(',')[1]?.trim() || "Unknown City"
  
  // Notification for assigned supervisor
  const supervisorNotification = {
    id: `NOTIF-${Date.now()}-CLIENT`,
    title: "New Client Assigned",
    message: `New client "${clientName}" from ${clientCity} has been assigned to you`,
    type: "order", // Using order type for client assignments
    priority: "medium",
    target_role: "supervisor",
    target_user_id: supervisorId,
    is_read: false,
    created_by: "system",
    created_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
  }
  
  notifications.push(supervisorNotification)
  return supervisorNotification
}

// Function to create order approval notification for Supervisor
export function createOrderApprovalNotification(orderData: any, supervisorId: string, blNumber: string) {
  const orderId = orderData.id || "Unknown Order"
  const clientName = orderData.clients?.name || "Unknown Client"
  
  const supervisorNotification = {
    id: `NOTIF-${Date.now()}-APPROVAL`,
    title: "Order Approved",
    message: `Your order ${orderId} for ${clientName} has been approved with BL Number: ${blNumber}`,
    type: "order",
    priority: "high",
    target_role: "supervisor",
    target_user_id: supervisorId,
    is_read: false,
    created_by: "operations-team",
    created_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    order_id: orderId,
    bl_number: blNumber
  }
  
  notifications.push(supervisorNotification)
  return supervisorNotification
}

// Function to create order rejection notification for Supervisor
export function createOrderRejectionNotification(orderData: any, supervisorId: string, reason?: string) {
  const orderId = orderData.id || "Unknown Order"
  const clientName = orderData.clients?.name || "Unknown Client"
  
  const supervisorNotification = {
    id: `NOTIF-${Date.now()}-REJECTION`,
    title: "Order Rejected",
    message: `Your order ${orderId} for ${clientName} has been rejected${reason ? ': ' + reason : ''}`,
    type: "order",
    priority: "high",
    target_role: "supervisor",
    target_user_id: supervisorId,
    is_read: false,
    created_by: "operations-team",
    created_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    order_id: orderId,
    rejection_reason: reason
  }
  
  notifications.push(supervisorNotification)
  return supervisorNotification
}

// Function to create order status update notification for Supervisor
export function createOrderStatusUpdateNotification(orderData: any, supervisorId: string, newStatus: string, trackingInfo?: any) {
  const orderId = orderData.id || "Unknown Order"
  const clientName = orderData.clients?.name || "Unknown Client"
  
  const statusMessages = {
    'pending': 'is pending approval',
    'processing': 'is being processed',
    'in_progress': 'is in progress',
    'in_transit': 'is in transit (on the way)',
    'delivered': 'has been delivered',
    'cancelled': 'has been cancelled'
  }
  
  const statusMessage = statusMessages[newStatus as keyof typeof statusMessages] || `status updated to ${newStatus}`
  
  const supervisorNotification = {
    id: `NOTIF-${Date.now()}-STATUS`,
    title: "Order Status Updated",
    message: `Your order ${orderId} for ${clientName} ${statusMessage}`,
    type: "order",
    priority: "medium",
    target_role: "supervisor",
    target_user_id: supervisorId,
    is_read: false,
    created_by: "operations-team",
    created_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    order_id: orderId,
    new_status: newStatus,
    tracking_info: trackingInfo
  }
  
  notifications.push(supervisorNotification)
  return supervisorNotification
}

// Function to create BL number update notification for Supervisor
export function createBLNumberUpdateNotification(orderData: any, supervisorId: string, blNumber: string) {
  const orderId = orderData.id || "Unknown Order"
  const clientName = orderData.clients?.name || "Unknown Client"
  
  const supervisorNotification = {
    id: `NOTIF-${Date.now()}-BL`,
    title: "BL Number Updated",
    message: `BL Number for your order ${orderId} (${clientName}) has been updated to: ${blNumber}`,
    type: "order",
    priority: "medium",
    target_role: "supervisor",
    target_user_id: supervisorId,
    is_read: false,
    created_by: "operations-team",
    created_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    order_id: orderId,
    bl_number: blNumber
  }
  
  notifications.push(supervisorNotification)
  return supervisorNotification
}

// Function to create order edit notification for Supervisor
export function createOrderEditNotification(orderData: any, supervisorId: string, editedFields: string[]) {
  const orderId = orderData.id || "Unknown Order"
  const clientName = orderData.clients?.name || "Unknown Client"
  
  const supervisorNotification = {
    id: `NOTIF-${Date.now()}-EDIT`,
    title: "Order Modified",
    message: `Your order ${orderId} for ${clientName} has been modified by Operations Team. Fields updated: ${editedFields.join(', ')}`,
    type: "order",
    priority: "medium",
    target_role: "supervisor",
    target_user_id: supervisorId,
    is_read: false,
    created_by: "operations-team",
    created_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    order_id: orderId,
    edited_fields: editedFields
  }
  
  notifications.push(supervisorNotification)
  return supervisorNotification
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('user_id')
    const userRole = searchParams.get('user_role')
    const type = searchParams.get('type')
    const isRead = searchParams.get('is_read')
    
    let filteredNotifications = notifications
    
    // Filter by user role and individual user
    if (userRole) {
      filteredNotifications = filteredNotifications.filter(n => 
        n.target_role === "all" || n.target_role === userRole
      )
    }
    
    if (userId) {
      filteredNotifications = filteredNotifications.filter(n => 
        n.target_user_id === null || n.target_user_id === userId
      )
    }
    
    if (type) {
      filteredNotifications = filteredNotifications.filter(n => n.type === type)
    }
    
    if (isRead !== null) {
      filteredNotifications = filteredNotifications.filter(n => n.is_read === (isRead === 'true'))
    }
    
    // Filter out expired notifications
    const now = new Date()
    filteredNotifications = filteredNotifications.filter(n => 
      !n.expires_at || new Date(n.expires_at) > now
    )
    
    // Sort by priority and creation date
    filteredNotifications.sort((a, b) => {
      const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 }
      const aPriority = priorityOrder[a.priority as keyof typeof priorityOrder] || 0
      const bPriority = priorityOrder[b.priority as keyof typeof priorityOrder] || 0
      
      if (aPriority !== bPriority) {
        return bPriority - aPriority
      }
      
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })
    
    return NextResponse.json({ notifications: filteredNotifications })
  } catch (error) {
    console.error('Error fetching notifications:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const {
      title,
      message,
      type,
      priority,
      target_role,
      target_user_id,
      expires_at,
      created_by
    } = data
    
    // Validation
    if (!title || !message || !type || !priority || !target_role) {
      return NextResponse.json(
        { error: 'All required fields must be provided' },
        { status: 400 }
      )
    }
    
    const validTypes = ['meeting', 'message', 'alert', 'promotion', 'goal']
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: 'Invalid notification type' },
        { status: 400 }
      )
    }
    
    const validPriorities = ['low', 'medium', 'high', 'urgent']
    if (!validPriorities.includes(priority)) {
      return NextResponse.json(
        { error: 'Invalid priority level' },
        { status: 400 }
      )
    }
    
    const validRoles = ['all', 'admin', 'supervisor', 'regional_manager', 'operations']
    if (!validRoles.includes(target_role)) {
      return NextResponse.json(
        { error: 'Invalid target role' },
        { status: 400 }
      )
    }
    
    const newNotification = {
      id: `NOTIF-${String(Date.now()).slice(-6)}`,
      title,
      message,
      type,
      priority,
      target_role,
      target_user_id: target_user_id || null,
      is_read: false,
      created_by: created_by || "USR-001",
      created_at: new Date().toISOString(),
      expires_at: expires_at || null
    }
    
    notifications.push(newNotification)
    
    return NextResponse.json({ 
      notification: newNotification, 
      message: "Notification created successfully" 
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating notification:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const data = await request.json()
    const { id, ...updateData } = data
    
    const notificationIndex = notifications.findIndex(n => n.id === id)
    if (notificationIndex === -1) {
      return NextResponse.json(
        { error: 'Notification not found' },
        { status: 404 }
      )
    }
    
    notifications[notificationIndex] = {
      ...notifications[notificationIndex],
      ...updateData,
      updated_at: new Date().toISOString()
    }
    
    return NextResponse.json({ 
      notification: notifications[notificationIndex], 
      message: "Notification updated successfully" 
    })
  } catch (error) {
    console.error('Error updating notification:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json(
        { error: 'Notification ID is required' },
        { status: 400 }
      )
    }
    
    const notificationIndex = notifications.findIndex(n => n.id === id)
    if (notificationIndex === -1) {
      return NextResponse.json(
        { error: 'Notification not found' },
        { status: 404 }
      )
    }
    
    notifications.splice(notificationIndex, 1)
    
    return NextResponse.json({ 
      message: "Notification deleted successfully" 
    })
  } catch (error) {
    console.error('Error deleting notification:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}