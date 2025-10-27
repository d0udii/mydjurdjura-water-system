import { NextRequest, NextResponse } from 'next/server'

// Demo orders data (same as in main route)
const demoOrders = [
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
    notes: "Urgent delivery required",
    created_at: "2024-01-10T10:00:00Z",
    updated_at: "2024-01-10T10:00:00Z",
    clients: {
      id: "CLI-001",
      name: "Biskra Water Distributor",
      phone: "+213 33 123 456",
      address: "123 Main Street, Biskra",
      contact_person: "Ahmed Benali"
    },
    regions: {
      id: "REG-001",
      name: "East"
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
    bl_number: "BL-2024-001",
    delivery_date: "2024-01-12",
    notes: "Regular delivery",
    created_at: "2024-01-08T14:30:00Z",
    updated_at: "2024-01-09T09:15:00Z",
    clients: {
      id: "CLI-002",
      name: "Ouled Djellal Store",
      phone: "+213 33 789 012",
      address: "456 Market Square, Ouled Djellal",
      contact_person: "Fatima Zohra"
    },
    regions: {
      id: "REG-001",
      name: "East"
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
    bl_number: "BL-2024-002",
    delivery_date: "2024-01-05",
    delivery_proof_url: "/proofs/delivery-003.jpg",
    notes: "Delivered successfully",
    created_at: "2024-01-01T08:00:00Z",
    updated_at: "2024-01-05T16:45:00Z",
    clients: {
      id: "CLI-003",
      name: "El Mghair Trading",
      phone: "+213 33 456 789",
      address: "789 Industrial Zone, El Mghair",
      contact_person: "Mohamed Khelil"
    },
    regions: {
      id: "REG-001",
      name: "East"
    },
    users: {
      id: "USR-004",
      name: "Operations Team",
      role: "operations"
    }
  },
  {
    id: "ORD-004",
    client_id: "CLI-004",
    region_id: "REG-001",
    assigned_to: "USR-004",
    status: "pending",
    total_price: 95000,
    product_5_5L_pallets: 6,
    product_1_5L_pallets: 8,
    truck_type: "factory",
    truck_capacity: 22,
    delivery_date: "2024-01-18",
    notes: "New order from supervisor",
    created_at: "2024-01-15T14:20:00Z",
    updated_at: "2024-01-15T14:20:00Z",
    clients: {
      id: "CLI-004",
      name: "Oued Souf Market",
      phone: "+213 33 555 123",
      address: "321 Commercial Street, Oued Souf",
      contact_person: "Youssef Benali"
    },
    regions: {
      id: "REG-001",
      name: "East"
    },
    users: {
      id: "USR-004",
      name: "Operations Team",
      role: "operations"
    }
  }
]

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const order = demoOrders.find(o => o.id === params.id)

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ order })
  } catch (error) {
    console.error('Error fetching order:', error)
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
    const data = await request.json()
    const { status, assigned_to, delivery_proof_url, notes, bl_number, product_5_5L_pallets, product_1_5L_pallets, truck_type, delivery_date } = data

    const orderIndex = demoOrders.findIndex(o => o.id === params.id)
    if (orderIndex === -1) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    // Update order
    const updatedOrder = {
      ...demoOrders[orderIndex],
      status: status || demoOrders[orderIndex].status,
      assigned_to: assigned_to || demoOrders[orderIndex].assigned_to,
      delivery_proof_url: delivery_proof_url || demoOrders[orderIndex].delivery_proof_url,
      notes: notes || demoOrders[orderIndex].notes,
      bl_number: bl_number || demoOrders[orderIndex].bl_number,
      product_5_5L_pallets: product_5_5L_pallets || demoOrders[orderIndex].product_5_5L_pallets,
      product_1_5L_pallets: product_1_5L_pallets || demoOrders[orderIndex].product_1_5L_pallets,
      truck_type: truck_type || demoOrders[orderIndex].truck_type,
      delivery_date: delivery_date || demoOrders[orderIndex].delivery_date,
      updated_at: new Date().toISOString()
    }

    demoOrders[orderIndex] = updatedOrder

    return NextResponse.json({ 
      order: updatedOrder,
      message: 'Order updated successfully'
    })
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
    const orderIndex = demoOrders.findIndex(o => o.id === params.id)
    if (orderIndex === -1) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    const deletedOrder = demoOrders[orderIndex]
    demoOrders.splice(orderIndex, 1)

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