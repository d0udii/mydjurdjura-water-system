import { NextRequest, NextResponse } from 'next/server'

// Mock BL numbers storage (in production, this would be in Supabase)
let blNumbers: any[] = [
  {
    id: "BL-001",
    order_id: "ORD-001",
    bl_number: "BL2024001",
    created_at: "2024-01-01T00:00:00Z",
    created_by: "USR-004",
    status: "active",
    notes: "Initial BL number"
  }
]

// Generate unique BL number
function generateBLNumber(): string {
  const year = new Date().getFullYear()
  const existingNumbers = blNumbers.map(bl => bl.bl_number)
  
  let counter = 1
  let newBLNumber: string
  
  do {
    newBLNumber = `BL${year}${counter.toString().padStart(3, '0')}`
    counter++
  } while (existingNumbers.includes(newBLNumber))
  
  return newBLNumber
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const orderId = searchParams.get('order_id')
    
    if (orderId) {
      const blNumber = blNumbers.find(bl => bl.order_id === orderId)
      return NextResponse.json({ blNumber })
    }
    
    return NextResponse.json({ blNumbers })
  } catch (error) {
    console.error('Error fetching BL numbers:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const { order_id, notes, created_by } = data
    
    if (!order_id) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      )
    }
    
    // Check if BL number already exists for this order
    const existingBL = blNumbers.find(bl => bl.order_id === order_id)
    if (existingBL) {
      return NextResponse.json(
        { error: 'BL number already exists for this order' },
        { status: 400 }
      )
    }
    
    const newBLNumber = generateBLNumber()
    const newBL = {
      id: `BL-${String(Date.now()).slice(-6)}`,
      order_id,
      bl_number: newBLNumber,
      created_at: new Date().toISOString(),
      created_by: created_by || "USR-004",
      status: "active",
      notes: notes || ""
    }
    
    blNumbers.push(newBL)
    
    return NextResponse.json({ 
      blNumber: newBL, 
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
    
    const blIndex = blNumbers.findIndex(bl => bl.id === id)
    if (blIndex === -1) {
      return NextResponse.json(
        { error: 'BL number not found' },
        { status: 404 }
      )
    }
    
    // Check if BL number is unique (if being updated)
    if (bl_number && bl_number !== blNumbers[blIndex].bl_number) {
      const existingBL = blNumbers.find(bl => bl.bl_number === bl_number && bl.id !== id)
      if (existingBL) {
        return NextResponse.json(
          { error: 'BL number already exists' },
          { status: 400 }
        )
      }
    }
    
    blNumbers[blIndex] = {
      ...blNumbers[blIndex],
      bl_number: bl_number || blNumbers[blIndex].bl_number,
      notes: notes || blNumbers[blIndex].notes,
      status: status || blNumbers[blIndex].status,
      updated_at: new Date().toISOString()
    }
    
    return NextResponse.json({ 
      blNumber: blNumbers[blIndex], 
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
    
    const blIndex = blNumbers.findIndex(bl => bl.id === id)
    if (blIndex === -1) {
      return NextResponse.json(
        { error: 'BL number not found' },
        { status: 404 }
      )
    }
    
    blNumbers.splice(blIndex, 1)
    
    return NextResponse.json({ 
      message: "BL number deleted successfully" 
    })
  } catch (error) {
    console.error('Error deleting BL number:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
