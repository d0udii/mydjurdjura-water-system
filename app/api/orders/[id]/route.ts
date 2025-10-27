import { NextRequest, NextResponse } from 'next/server'
import { getOrderById, updateOrder as updateSharedOrder, getAllOrders } from '@/lib/shared-api-data'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const order = getOrderById(id)

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(order)
  } catch (error) {
    console.error('Error fetching order:', error)
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
    const order = getOrderById(id)

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

      updateSharedOrder(id, updatedOrder)

      // Create notification for supervisor
      const supervisorNotification = {
        user_id: order.created_by,
        title: "Order Approved",
        message: `Order ${order.id} has been approved and assigned BL number ${generatedBlNumber}`,
        type: "success",
        order_id: order.id,
        created_at: new Date().toISOString()
      }

      return NextResponse.json({
        order: updatedOrder,
        notification: supervisorNotification,
        message: `Order approved successfully with BL number ${generatedBlNumber}`
      })
    }

    if (action === 'update_status') {
      const { status } = body
      const validStatuses = ['pending', 'processing', 'in_transit', 'delivered', 'cancelled']
      
      if (!validStatuses.includes(status)) {
        return NextResponse.json(
          { error: 'Invalid status' },
          { status: 400 }
        )
      }

      const updatedOrder = {
        ...order,
        status,
        updated_at: new Date().toISOString()
      }

      updateSharedOrder(id, updatedOrder)

      // Create notification for supervisor
      const supervisorNotification = {
        user_id: order.created_by,
        title: "Order Status Updated",
        message: `Order ${order.id} status has been updated to ${status}`,
        type: "info",
        order_id: order.id,
        created_at: new Date().toISOString()
      }

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

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const orderIndex = getAllOrders().findIndex(o => o.id === id)

    if (orderIndex === -1) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    // Update the order
    const updatedOrder = {
      ...demoOrders[orderIndex],
      ...body,
      id: params.id, // Ensure ID doesn't change
      updated_at: new Date().toISOString()
    }

    demoOrders[orderIndex] = updatedOrder

    return NextResponse.json({ order: updatedOrder })
  } catch (error) {
    console.error('Error updating order:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const orderIndex = getAllOrders().findIndex(o => o.id === id)

    if (orderIndex === -1) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    // Remove the order
    const deletedOrder = demoOrders.splice(orderIndex, 1)[0]

    return NextResponse.json({ 
      message: 'Order deleted successfully',
      order: deletedOrder 
    })
  } catch (error) {
    console.error('Error deleting order:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}