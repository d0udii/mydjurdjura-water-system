import { NextRequest, NextResponse } from 'next/server'
import { getOrderById, updateOrder as updateSharedOrder, getAllOrders } from '@/lib/shared-api-data'

// Mock notifications storage
let notifications: any[] = []

// Function to create order approval notification for Supervisor
function createOrderApprovalNotification(orderData: any, supervisorId: string, blNumber: string) {
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
function createOrderRejectionNotification(orderData: any, supervisorId: string, reason?: string) {
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
function createOrderStatusUpdateNotification(orderData: any, supervisorId: string, newStatus: string, trackingInfo?: any) {
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
function createBLNumberUpdateNotification(orderData: any, supervisorId: string, blNumber: string) {
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
function createOrderEditNotification(orderData: any, supervisorId: string, editedFields: string[]) {
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

// Helper functions
function getOrderByIdLocal(id: string) {
  return getOrderById(id)
}

function updateOrderLocal(id: string, updatedOrder: any) {
  updateSharedOrder(id, updatedOrder)
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { user_role, user_id } = await request.json().catch(() => ({}))
    
    const order = getOrderByIdLocal(id)

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    // Check permissions - only operations team and admin can delete orders
    if (user_role !== 'operations' && user_role !== 'admin') {
      return NextResponse.json(
        { error: 'Insufficient permissions to delete orders' },
        { status: 403 }
      )
    }

    // Soft delete by updating status to 'deleted'
    const deletedOrder = {
      ...order,
      status: 'deleted',
      deleted_by: user_id || 'operations-team',
      deleted_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    updateOrder(id, deletedOrder)

    // Create notification for supervisor
    const supervisorNotification = {
      user_id: order.created_by,
      title: "Order Deleted",
      message: `Order ${order.id} has been deleted by operations team`,
      type: "error",
      order_id: order.id,
      created_at: new Date().toISOString()
    }

    return NextResponse.json({
      order: deletedOrder,
      notification: supervisorNotification,
      message: 'Order deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting order:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { action, bl_number, approved_by } = body
    const order = getOrderByIdLocal(id)

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    if (action === 'approve') {
      // Generate BL number if not provided
      const generatedBlNumber = bl_number || `BL-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`
      
      // Update order with approval
      const updatedOrder = {
        ...order,
        status: 'processing',
        bl_number: generatedBlNumber,
        approved_by: approved_by || 'USR-004',
        approved_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      updateOrderLocal(id, updatedOrder)

      // Create notification for supervisor
      const supervisorNotification = createOrderApprovalNotification(order, order.created_by, generatedBlNumber)

      return NextResponse.json({
        order: updatedOrder,
        notification: supervisorNotification,
        message: `Order approved successfully with BL number ${generatedBlNumber}`
      })
    }

    if (action === 'reject') {
      const { rejection_reason, user_id } = body
      
      const updatedOrder = {
        ...order,
        status: 'rejected',
        rejected_by: user_id || 'operations-team',
        rejected_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        rejection_reason: rejection_reason || 'Order rejected by operations team'
      }

      updateOrderLocal(id, updatedOrder)

      // Create notification for supervisor
      const supervisorNotification = createOrderRejectionNotification(order, order.created_by, rejection_reason)

      return NextResponse.json({
        order: updatedOrder,
        notification: supervisorNotification,
        message: 'Order rejected successfully'
      })
    }

    if (action === 'update_bl_number') {
      const { bl_number, user_id } = body
      
      if (!bl_number) {
        return NextResponse.json(
          { error: 'BL number is required' },
          { status: 400 }
        )
      }

      const updatedOrder = {
        ...order,
        bl_number: bl_number,
        updated_at: new Date().toISOString(),
        bl_updated_by: user_id || 'operations-team',
        bl_updated_at: new Date().toISOString()
      }

      updateOrderLocal(id, updatedOrder)

      // Create notification for supervisor
      const supervisorNotification = createBLNumberUpdateNotification(order, order.created_by, bl_number)

      return NextResponse.json({
        order: updatedOrder,
        notification: supervisorNotification,
        message: `BL number updated to ${bl_number}`
      })
    }

    if (action === 'update_tracking') {
      const { tracking_info, user_id } = body
      
      const updatedOrder = {
        ...order,
        tracking_info: {
          ...order.tracking_info,
          ...tracking_info,
          last_updated: new Date().toISOString(),
          updated_by: user_id || 'operations-team'
        },
        updated_at: new Date().toISOString()
      }

      updateOrderLocal(id, updatedOrder)

      // Create notification for supervisor
      const supervisorNotification = createOrderStatusUpdateNotification(order, order.created_by, order.status, tracking_info)

      return NextResponse.json({
        order: updatedOrder,
        notification: supervisorNotification,
        message: 'Tracking information updated successfully'
      })
    }

    if (action === 'update_status') {
      const { status } = body
      const validStatuses = ['pending', 'processing', 'in_progress', 'in_transit', 'delivered', 'cancelled']
      
      if (!validStatuses.includes(status)) {
        return NextResponse.json(
          { error: 'Invalid status' },
          { status: 400 }
        )
      }

      const updatedOrder = {
        ...order,
        status: status,
        updated_at: new Date().toISOString(),
        status_updated_by: user_id || 'operations-team',
        status_updated_at: new Date().toISOString()
      }

      updateOrderLocal(id, updatedOrder)

      // Create notification for supervisor
      const supervisorNotification = createOrderStatusUpdateNotification(order, order.created_by, status)

      return NextResponse.json({
        order: updatedOrder,
        notification: supervisorNotification,
        message: `Order status updated to ${status}`
      })
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    )

  } catch (error) {
    console.error('Error updating order:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
