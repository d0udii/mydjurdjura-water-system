import { NextRequest, NextResponse } from 'next/server'
import { getAllOrders } from '@/lib/shared-api-data'

// Demo BL numbers data (in production, this would be in a database)
let demoBLNumbers = [
  {
    id: "BL-001",
    order_id: "ORD-002",
    bl_number: "BL-2024-001",
    created_at: "2024-01-08T15:30:00Z",
    created_by: "USR-004",
    status: "active",
    notes: "BL number for Ouled Djellal Store order"
  },
  {
    id: "BL-002",
    order_id: "ORD-003",
    bl_number: "BL-2024-002",
    created_at: "2024-01-01T09:00:00Z",
    created_by: "USR-004",
    status: "active",
    notes: "BL number for Oued Souf Market order"
  }
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const orderId = searchParams.get('order_id')
    const status = searchParams.get('status')
    
    // Get BL numbers from orders that have them
    const ordersWithBL = getAllOrders().filter(order => order.bl_number)
    const blNumbersFromOrders = ordersWithBL.map(order => ({
      id: `BL-${order.id}`,
      order_id: order.id,
      bl_number: order.bl_number,
      created_at: order.approved_at || order.created_at,
      created_by: order.approved_by || 'USR-004',
      status: order.status === 'delivered' ? 'inactive' : 'active',
      notes: `Auto-generated BL number for order ${order.id}`
    }))
    
    // Combine with existing BL numbers
    let allBLNumbers = [...demoBLNumbers, ...blNumbersFromOrders]
    
    // Remove duplicates based on bl_number
    const uniqueBLNumbers = allBLNumbers.filter((bl, index, self) => 
      index === self.findIndex(b => b.bl_number === bl.bl_number)
    )
    
    let filteredBLNumbers = uniqueBLNumbers
    
    if (orderId) {
      filteredBLNumbers = filteredBLNumbers.filter(bl => bl.order_id === orderId)
    }
    
    if (status) {
      filteredBLNumbers = filteredBLNumbers.filter(bl => bl.status === status)
    }
    
    return NextResponse.json({ blNumbers: filteredBLNumbers })
  } catch (error) {
    console.error('Error fetching BL numbers:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const { order_id, bl_number, notes, created_by } = data
    
    // Validation
    if (!order_id || !bl_number) {
      return NextResponse.json(
        { error: 'Order ID and BL number are required' },
        { status: 400 }
      )
    }
    
    // Check if BL number already exists
    const existingBL = demoBLNumbers.find(bl => bl.bl_number === bl_number)
    if (existingBL) {
      return NextResponse.json(
        { error: 'BL number already exists' },
        { status: 400 }
      )
    }
    
    // Check if order already has a BL number
    const existingOrderBL = demoBLNumbers.find(bl => bl.order_id === order_id)
    if (existingOrderBL) {
      return NextResponse.json(
        { error: 'Order already has a BL number' },
        { status: 400 }
      )
    }
    
    const newBLNumber = {
      id: `BL-${String(Date.now()).slice(-6)}`,
      order_id,
      bl_number,
      created_at: new Date().toISOString(),
      created_by: created_by || 'USR-004',
      status: 'active' as const,
      notes: notes || ''
    }
    
    demoBLNumbers.push(newBLNumber)
    
    return NextResponse.json({ 
      blNumber: newBLNumber, 
      message: "BL number created successfully" 
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating BL number:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const data = await request.json()
    const { id, bl_number, notes, status } = data
    
    const blIndex = demoBLNumbers.findIndex(bl => bl.id === id)
    if (blIndex === -1) {
      return NextResponse.json(
        { error: 'BL number not found' },
        { status: 404 }
      )
    }
    
    // Check if new BL number already exists (if changing)
    if (bl_number && bl_number !== demoBLNumbers[blIndex].bl_number) {
      const existingBL = demoBLNumbers.find(bl => bl.bl_number === bl_number && bl.id !== id)
      if (existingBL) {
        return NextResponse.json(
          { error: 'BL number already exists' },
          { status: 400 }
        )
      }
    }
    
    // Update BL number
    const updatedBLNumber = {
      ...demoBLNumbers[blIndex],
      bl_number: bl_number || demoBLNumbers[blIndex].bl_number,
      notes: notes || demoBLNumbers[blIndex].notes,
      status: status || demoBLNumbers[blIndex].status,
      updated_at: new Date().toISOString()
    }
    
    demoBLNumbers[blIndex] = updatedBLNumber
    
    return NextResponse.json({ 
      blNumber: updatedBLNumber, 
      message: "BL number updated successfully" 
    })
  } catch (error) {
    console.error('Error updating BL number:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json(
        { error: 'BL number ID is required' },
        { status: 400 }
      )
    }
    
    const blIndex = demoBLNumbers.findIndex(bl => bl.id === id)
    if (blIndex === -1) {
      return NextResponse.json(
        { error: 'BL number not found' },
        { status: 404 }
      )
    }
    
    const deletedBLNumber = demoBLNumbers[blIndex]
    demoBLNumbers.splice(blIndex, 1)
    
    return NextResponse.json({ 
      message: "BL number deleted successfully",
      blNumber: deletedBLNumber
    })
  } catch (error) {
    console.error('Error deleting BL number:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}