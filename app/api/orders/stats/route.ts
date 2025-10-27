import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const region_id = searchParams.get('region_id')
    const assigned_to = searchParams.get('assigned_to')

    let query = supabaseAdmin.from('orders').select('*')

    if (region_id) {
      query = query.eq('region_id', region_id)
    }

    if (assigned_to) {
      query = query.eq('assigned_to', assigned_to)
    }

    const { data: orders, error } = await query

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch orders' },
        { status: 500 }
      )
    }

    // Calculate stats
    const stats = {
      totalOrders: orders.length,
      pendingOrders: orders.filter(o => o.status === 'pending').length,
      inProgressOrders: orders.filter(o => o.status === 'in_progress').length,
      deliveredOrders: orders.filter(o => o.status === 'delivered').length,
      returnedOrders: orders.filter(o => o.status === 'returned').length,
      cancelledOrders: orders.filter(o => o.status === 'cancelled').length,
      totalRevenue: orders.reduce((sum, order) => sum + (order.total_price || 0), 0),
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching order stats:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
