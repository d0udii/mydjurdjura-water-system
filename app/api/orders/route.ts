import { NextRequest, NextResponse } from 'next/server'
import { getOrders, createOrder, getClients, getRegions } from '@/lib/supabase-db'
import { initializeDatabase } from '@/lib/supabase-db'

export async function GET(request: NextRequest) {
  try {
    await initializeDatabase()
    const { searchParams } = new URL(request.url)
    const userRole = searchParams.get('user_role')
    const userId = searchParams.get('user_id')
    const regionId = searchParams.get('region_id')
    const status = searchParams.get('status')
    const assignedTo = searchParams.get('assigned_to')
    
    let orders = await getOrders()
    
    // Filter based on user role and permissions
    if (userRole === 'operations') {
      // Operations Team can see all orders
      // No additional filtering needed
    } else if (userRole === 'supervisor') {
      // Supervisors can only see orders they created or are assigned to
      orders = orders.filter(order => 
        order.assigned_to === userId
      )
    } else if (userRole === 'regional_manager') {
      // Regional managers can see orders in their region
      if (regionId) {
        orders = orders.filter(order => order.region_id === regionId)
      }
    }
    
    // Apply additional filters
    if (status) {
      orders = orders.filter(order => order.status === status)
    }
    
    if (assignedTo) {
      orders = orders.filter(order => order.assigned_to === assignedTo)
    }
    
    // Sort by creation date (newest first)
    orders.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    
    return NextResponse.json({ 
      orders: orders,
      stats: {
        totalOrders: orders.length,
        pendingOrders: orders.filter(o => o.status === 'pending').length,
        inProgressOrders: orders.filter(o => o.status === 'in_progress').length,
        deliveredOrders: orders.filter(o => o.status === 'delivered').length,
        totalRevenue: orders.reduce((sum, o) => sum + o.total_price, 0)
      }
    })
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await initializeDatabase()
    const data = await request.json()
    const {
      client_id,
      region_id,
      assigned_to,
      total_price,
      product_5_5L_pallets,
      product_1_5L_pallets,
      truck_type,
      truck_capacity,
      delivery_date,
      notes
    } = data

    if (!client_id || !region_id || !total_price) {
      return NextResponse.json(
        { error: 'Client, region, and total price are required' },
        { status: 400 }
      )
    }

    const newOrder = await createOrder({
      client_id,
      region_id,
      assigned_to: assigned_to || null,
      status: 'pending',
      total_price: parseFloat(total_price),
      product_5_5L_pallets: product_5_5L_pallets || 0,
      product_1_5L_pallets: product_1_5L_pallets || 0,
      truck_type: truck_type || 'factory',
      truck_capacity: truck_capacity || 22,
      delivery_date: delivery_date || null,
      notes: notes || ''
    })

    if (!newOrder) {
      return NextResponse.json(
        { error: 'Failed to create order' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { 
        message: 'Order created successfully',
        order: newOrder 
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating order:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}