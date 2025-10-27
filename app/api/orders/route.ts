import { NextRequest, NextResponse } from 'next/server'
import { createOrderNotification } from '../notifications/route'

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

// Demo orders data (in production, this would be in a database)
let demoOrders = [
  {
    id: "ORD-001",
    client_id: "CLI-001",
    region_id: "REG-001",
    assigned_to: "USR-004",
    status: "pending",
    total_price: 125000,
    product_5_5L_pallets: 11,
    product_1_5L_pallets: 11,
    truck_type: "factory",
    truck_capacity: 22,
    delivery_date: "2024-01-15",
    notes: "Urgent delivery",
    created_at: "2024-01-10T10:00:00Z",
    updated_at: "2024-01-10T10:00:00Z",
    clients: {
      id: "CLI-001",
      name: "Biskra Water Distributor",
      phone: "0555123456",
      address: "123 Main Street, Biskra",
      contact_person: "Ahmed Benali"
    },
    regions: {
      id: "REG-001",
      name: "East",
      responsible: "Hamouch"
    },
    users: {
      id: "USR-004",
      name: "Operations Team",
      role: "operations"
    }
  },
  {
    id: "ORD-002",
    client_id: "CLI-002",
    region_id: "REG-001",
    assigned_to: "USR-004",
    status: "in_progress",
    total_price: 89000,
    product_5_5L_pallets: 8,
    product_1_5L_pallets: 6,
    truck_type: "client_own",
    truck_capacity: 24,
    delivery_date: "2024-01-16",
    notes: "Regular delivery",
    created_at: "2024-01-08T14:30:00Z",
    updated_at: "2024-01-08T14:30:00Z",
    clients: {
      id: "CLI-002",
      name: "Ouled Djellal Store",
      phone: "0666789012",
      address: "456 Market Square, Ouled Djellal",
      contact_person: "Fatima Zohra"
    },
    regions: {
      id: "REG-001",
      name: "East",
      responsible: "Hamouch"
    },
    users: {
      id: "USR-004",
      name: "Operations Team",
      role: "operations"
    }
  },
  {
    id: "ORD-003",
    client_id: "CLI-003",
    region_id: "REG-001",
    assigned_to: "USR-004",
    status: "delivered",
    total_price: 156000,
    product_5_5L_pallets: 15,
    product_1_5L_pallets: 7,
    truck_type: "factory",
    truck_capacity: 26,
    delivery_date: "2024-01-01",
    notes: "Completed",
    created_at: "2024-01-01T08:00:00Z",
    updated_at: "2024-01-01T08:00:00Z",
    clients: {
      id: "CLI-003",
      name: "Oued Souf Market",
      phone: "0777890123",
      address: "789 Commercial Ave, Oued Souf",
      contact_person: "Mohamed Khelil"
    },
    regions: {
      id: "REG-001",
      name: "East",
      responsible: "Hamouch"
    },
    users: {
      id: "USR-004",
      name: "Operations Team",
      role: "operations"
    }
  }
]

export async function POST(request: NextRequest) {
  try {
    const orderData = await request.json()
    
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
    
    // Add to demo orders array (in production, this would be saved to database)
    demoOrders.unshift(newOrder)
    
    // Create automatic notifications
    const notifications = createOrderNotification(newOrder, orderData.created_by || 'unknown')
    
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
    return NextResponse.json({ 
      orders: demoOrders,
      stats: {
        totalOrders: demoOrders.length,
        pendingOrders: demoOrders.filter(o => o.status === 'pending').length,
        inProgressOrders: demoOrders.filter(o => o.status === 'in_progress').length,
        deliveredOrders: demoOrders.filter(o => o.status === 'delivered').length,
        totalRevenue: demoOrders.reduce((sum, o) => sum + o.total_price, 0)
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