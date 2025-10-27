import { NextRequest, NextResponse } from 'next/server'
import { sharedOrders, addOrder, getAllOrders } from '@/lib/shared-api-data'

// Helper function to calculate promotion discount
function calculatePromotionDiscount(order: any, promotions: any[]): number {
  const clientCity = order.clients?.address?.split(',')[1]?.trim()
  const clientId = order.client_id
  
  // Find applicable promotions
  const applicablePromotions = promotions.filter(promo => {
    if (promo.status !== 'active') return false
    if (new Date() < new Date(promo.start_date) || new Date() > new Date(promo.end_date)) return false
    
    return (
      promo.target_type === 'city' && promo.target_id === clientCity ||
      promo.target_type === 'client' && promo.target_id === clientId ||
      promo.target_type === 'supervisor' && promo.target_id === order.created_by
    )
  })
  
  if (applicablePromotions.length === 0) return 0
  
  // Use the highest discount promotion
  const bestPromotion = applicablePromotions.reduce((best, current) => {
    const bestDiscount = best.type === 'percentage' ? 
      (order.total_price * best.value / 100) : best.value
    const currentDiscount = current.type === 'percentage' ? 
      (order.total_price * current.value / 100) : current.value
    
    return currentDiscount > bestDiscount ? current : best
  })
  
  return bestPromotion.type === 'percentage' ? 
    (order.total_price * bestPromotion.value / 100) : bestPromotion.value
}

export async function POST(request: NextRequest) {
  try {
    let orderData
    try {
      orderData = await request.json()
    } catch (jsonError) {
      return NextResponse.json(
        { error: 'Invalid JSON format' },
        { status: 400 }
      )
    }
    
    // Validation
    if (!orderData.client_id || orderData.client_id.trim() === '') {
      return NextResponse.json(
        { error: 'Client ID is required' },
        { status: 400 }
      )
    }
    
    if (!orderData.product_5_5L_pallets && !orderData.product_1_5L_pallets) {
      return NextResponse.json(
        { error: 'At least one product quantity is required' },
        { status: 400 }
      )
    }
    
    if (orderData.product_5_5L_pallets < 0 || orderData.product_1_5L_pallets < 0) {
      return NextResponse.json(
        { error: 'Product quantities cannot be negative' },
        { status: 400 }
      )
    }
    
    if (!['factory', 'client_own'].includes(orderData.truck_type)) {
      return NextResponse.json(
        { error: 'Invalid truck type' },
        { status: 400 }
      )
    }
    
    // Generate new order ID
    const newOrderId = `ORD-${Date.now()}`
    
    // Create new order with proper structure
    const newOrder = {
      id: newOrderId,
      client_id: orderData.client_id,
      region_id: orderData.region_id,
      assigned_to: orderData.assigned_to || "USR-004", // Operations team
      status: "pending",
      total_price: orderData.total_price,
      product_5_5L_pallets: orderData.product_5_5L_pallets,
      product_1_5L_pallets: orderData.product_1_5L_pallets,
      truck_type: orderData.truck_type,
      truck_capacity: orderData.truck_capacity,
      delivery_date: orderData.delivery_date,
      notes: orderData.notes || "",
      bl_number: null,
      approved_by: null,
      approved_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: orderData.created_by || 'unknown',
      // Include related data for immediate display
      clients: {
        id: orderData.client_id,
        name: orderData.clients?.name || 'Unknown Client',
        phone: orderData.clients?.phone || '',
        address: orderData.clients?.address || '',
        region_id: orderData.region_id
      },
      regions: {
        id: orderData.region_id,
        name: orderData.regions?.name || 'Unknown Region',
        responsible: orderData.regions?.responsible || 'Unknown Manager'
      }
    }
    
    // Add to shared orders array (persistent across server restarts)
    addOrder(newOrder)
    
    // Create automatic notifications (simplified for now)
    const notifications = {
      type: 'order_created',
      title: 'New Order Created',
      message: `Order ${newOrder.id} has been created`,
      recipient_id: orderData.created_by || 'unknown',
      order_id: newOrder.id
    }
    
    return NextResponse.json({
      message: 'Order created successfully',
      order: newOrder,
      notifications: notifications
    }, { status: 201 })
    
  } catch (error) {
    console.error('Error creating order:', error)
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userRole = searchParams.get('user_role')
    const userId = searchParams.get('user_id')
    const regionId = searchParams.get('region_id')
    const status = searchParams.get('status')
    const assignedTo = searchParams.get('assigned_to')
    
    // Use shared orders data
    let filteredOrders = [...getAllOrders()]
    
    // Filter based on user role and permissions
    if (userRole === 'operations') {
      // Operations Team can see all orders
      // No additional filtering needed
    } else if (userRole === 'supervisor') {
      // Supervisors can only see orders they created or are assigned to
      filteredOrders = filteredOrders.filter(order => 
        order.created_by === userId || order.assigned_to === userId
      )
    } else if (userRole === 'regional_manager') {
      // Regional managers can see orders in their region
      if (regionId) {
        filteredOrders = filteredOrders.filter(order => order.region_id === regionId)
      }
    }
    
    // Apply additional filters
    if (status) {
      filteredOrders = filteredOrders.filter(order => order.status === status)
    }
    
    if (assignedTo) {
      filteredOrders = filteredOrders.filter(order => order.assigned_to === assignedTo)
    }
    
    // Sort by creation date (newest first)
    filteredOrders.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    
    return NextResponse.json({ 
      orders: filteredOrders,
      stats: {
        totalOrders: filteredOrders.length,
        pendingOrders: filteredOrders.filter(o => o.status === 'pending').length,
        inProgressOrders: filteredOrders.filter(o => o.status === 'in_progress').length,
        deliveredOrders: filteredOrders.filter(o => o.status === 'delivered').length,
        totalRevenue: filteredOrders.reduce((sum, o) => sum + o.total_price, 0)
      }
    })
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}