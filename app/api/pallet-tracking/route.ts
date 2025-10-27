import { NextRequest, NextResponse } from 'next/server'
import { getAllOrders } from '@/lib/shared-api-data'

// Mock pallet tracking storage (in production, this would be in Supabase)
let palletTracking: any[] = [
  {
    id: "PALLET-001",
    order_id: "ORD-001",
    client_id: "CLI-001",
    wooden_pallets_sent: 22,
    intercalaires_sent: 88,
    wooden_pallets_returned: 20,
    intercalaires_returned: 80,
    wooden_pallets_good_condition: 18,
    wooden_pallets_bad_condition: 2,
    intercalaires_good_condition: 75,
    intercalaires_bad_condition: 5,
    return_date: "2024-01-15",
    notes: "Client returned most pallets in good condition",
    status: "partial_return",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-15T00:00:00Z"
  }
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const orderId = searchParams.get('order_id')
    const clientId = searchParams.get('client_id')
    const status = searchParams.get('status')
    
    let filteredTracking = palletTracking
    
    if (orderId) {
      filteredTracking = filteredTracking.filter(p => p.order_id === orderId)
    }
    
    if (clientId) {
      filteredTracking = filteredTracking.filter(p => p.client_id === clientId)
    }
    
    if (status) {
      filteredTracking = filteredTracking.filter(p => p.status === status)
    }
    
    return NextResponse.json({ palletTracking: filteredTracking })
  } catch (error) {
    console.error('Error fetching pallet tracking:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const {
      order_id,
      client_id,
      wooden_pallets_sent,
      intercalaires_sent,
      wooden_pallets_returned,
      intercalaires_returned,
      wooden_pallets_good_condition,
      wooden_pallets_bad_condition,
      intercalaires_good_condition,
      intercalaires_bad_condition,
      return_date,
      notes
    } = data
    
    // Validation - Check for required fields with proper handling of zero values
    if (!order_id || order_id.trim() === '') {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      )
    }
    
    if (!client_id || client_id.trim() === '') {
      return NextResponse.json(
        { error: 'Client ID is required' },
        { status: 400 }
      )
    }
    
    // Check if pallet quantities are provided (including zero values)
    // Support both old field names and new field names
    const woodenPalletsSent = wooden_pallets_sent !== undefined ? wooden_pallets_sent : 
                             data.pallet_5_5L_quantity !== undefined ? data.pallet_5_5L_quantity : 0
    const intercalairesSent = intercalaires_sent !== undefined ? intercalaires_sent : 
                              data.pallet_1_5L_quantity !== undefined ? data.pallet_1_5L_quantity : 0
    
    if (woodenPalletsSent === undefined || woodenPalletsSent === null || woodenPalletsSent === '') {
      return NextResponse.json(
        { error: 'Pallet quantities are required (5.5L or wooden pallets)' },
        { status: 400 }
      )
    }
    
    if (intercalairesSent === undefined || intercalairesSent === null || intercalairesSent === '') {
      return NextResponse.json(
        { error: 'Pallet quantities are required (1.5L or intercalaires)' },
        { status: 400 }
      )
    }
    
    // Validate that quantities are non-negative numbers
    if (parseInt(woodenPalletsSent) < 0) {
      return NextResponse.json(
        { error: 'Pallet quantities cannot be negative' },
        { status: 400 }
      )
    }
    
    if (parseInt(intercalairesSent) < 0) {
      return NextResponse.json(
        { error: 'Pallet quantities cannot be negative' },
        { status: 400 }
      )
    }
    
    // Validate that order exists and get client_id if not provided
    const orders = getAllOrders()
    const order = orders.find(o => o.id === order_id)
    
    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }
    
    // Use order's client_id if not provided in request
    const finalClientId = client_id || order.client_id
    
    if (!finalClientId) {
      return NextResponse.json(
        { error: 'Client ID is required and could not be determined from order' },
        { status: 400 }
      )
    }
    
    // Calculate status based on returns
    let status = "no_return"
    if (wooden_pallets_returned > 0 || intercalaires_returned > 0) {
      const totalPalletsSent = parseInt(woodenPalletsSent) + parseInt(intercalairesSent)
      const totalReturned = wooden_pallets_returned + intercalaires_returned
      
      if (totalReturned === totalPalletsSent) {
        status = "full_return"
      } else {
        status = "partial_return"
      }
    }
    
    const newTracking = {
      id: `PALLET-${String(Date.now()).slice(-6)}`,
      order_id,
      client_id: finalClientId,
      wooden_pallets_sent: parseInt(woodenPalletsSent),
      intercalaires_sent: parseInt(intercalairesSent),
      wooden_pallets_returned: parseInt(wooden_pallets_returned) || 0,
      intercalaires_returned: parseInt(intercalaires_returned) || 0,
      wooden_pallets_good_condition: parseInt(wooden_pallets_good_condition) || 0,
      wooden_pallets_bad_condition: parseInt(wooden_pallets_bad_condition) || 0,
      intercalaires_good_condition: parseInt(intercalaires_good_condition) || 0,
      intercalaires_bad_condition: parseInt(intercalaires_bad_condition) || 0,
      return_date: return_date || null,
      notes: notes || "",
      status,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      // Include related order and client data for immediate display
      order: {
        id: order.id,
        client_id: order.client_id,
        status: order.status,
        total_price: order.total_price,
        delivery_date: order.delivery_date,
        clients: order.clients
      },
      client: {
        id: finalClientId,
        name: order.clients?.name || 'Unknown Client',
        phone: order.clients?.phone || '',
        address: order.clients?.address || ''
      }
    }
    
    palletTracking.push(newTracking)
    
    return NextResponse.json({ 
      palletTracking: newTracking, 
      message: "Pallet tracking created successfully" 
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating pallet tracking:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const data = await request.json()
    const { id, ...updateData } = data
    
    const trackingIndex = palletTracking.findIndex(p => p.id === id)
    if (trackingIndex === -1) {
      return NextResponse.json(
        { error: 'Pallet tracking record not found' },
        { status: 404 }
      )
    }
    
    // Recalculate status if return data is updated
    if (updateData.wooden_pallets_returned !== undefined || updateData.intercalaires_returned !== undefined) {
      const current = palletTracking[trackingIndex]
      const woodenReturned = updateData.wooden_pallets_returned !== undefined ? updateData.wooden_pallets_returned : current.wooden_pallets_returned
      const intercalairesReturned = updateData.intercalaires_returned !== undefined ? updateData.intercalaires_returned : current.intercalaires_returned
      
      let status = "no_return"
      if (woodenReturned > 0 || intercalairesReturned > 0) {
        const totalPalletsSent = current.wooden_pallets_sent + current.intercalaires_sent
        const totalReturned = woodenReturned + intercalairesReturned
        
        if (totalReturned === totalPalletsSent) {
          status = "full_return"
        } else {
          status = "partial_return"
        }
      }
      
      updateData.status = status
    }
    
    palletTracking[trackingIndex] = {
      ...palletTracking[trackingIndex],
      ...updateData,
      updated_at: new Date().toISOString()
    }
    
    return NextResponse.json({ 
      palletTracking: palletTracking[trackingIndex], 
      message: "Pallet tracking updated successfully" 
    })
  } catch (error) {
    console.error('Error updating pallet tracking:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json(
        { error: 'Pallet tracking ID is required' },
        { status: 400 }
      )
    }
    
    const trackingIndex = palletTracking.findIndex(p => p.id === id)
    if (trackingIndex === -1) {
      return NextResponse.json(
        { error: 'Pallet tracking record not found' },
        { status: 404 }
      )
    }
    
    palletTracking.splice(trackingIndex, 1)
    
    return NextResponse.json({ 
      message: "Pallet tracking record deleted successfully" 
    })
  } catch (error) {
    console.error('Error deleting pallet tracking:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
