import { NextRequest, NextResponse } from 'next/server'
import { getBLNumbers, createBLNumber, updateBLNumber, deleteBLNumber } from '@/lib/supabase-db'
import { initializeDatabase } from '@/lib/supabase-db'

export async function GET(request: NextRequest) {
  try {
    await initializeDatabase()
    const { searchParams } = new URL(request.url)
    const orderId = searchParams.get('order_id')
    const status = searchParams.get('status')
    
    let blNumbers = await getBLNumbers()
    
    if (orderId) {
      blNumbers = blNumbers.filter(bl => bl.order_id === orderId)
    }
    
    if (status) {
      blNumbers = blNumbers.filter(bl => bl.status === status)
    }
    
    return NextResponse.json({ blNumbers })
  } catch (error) {
    console.error('Error fetching BL numbers:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await initializeDatabase()
    const data = await request.json()
    const { order_id, bl_number, notes, created_by } = data
    
    // Validation
    if (!order_id || !bl_number) {
      return NextResponse.json(
        { error: 'Order ID and BL number are required' },
        { status: 400 }
      )
    }
    
    const newBLNumber = await createBLNumber({
      order_id,
      bl_number,
      created_by: created_by || '550e8400-e29b-41d4-a716-446655440010', // Default admin user
      status: 'active',
      notes: notes || ''
    })
    
    if (!newBLNumber) {
      return NextResponse.json(
        { error: 'Failed to create BL number' },
        { status: 500 }
      )
    }
    
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
    await initializeDatabase()
    const data = await request.json()
    const { id, bl_number, notes, status } = data
    
    if (!id) {
      return NextResponse.json(
        { error: 'BL number ID is required' },
        { status: 400 }
      )
    }
    
    const updatedBLNumber = await updateBLNumber(id, {
      bl_number,
      notes,
      status
    })
    
    if (!updatedBLNumber) {
      return NextResponse.json(
        { error: 'BL number not found' },
        { status: 404 }
      )
    }
    
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
    await initializeDatabase()
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json(
        { error: 'BL number ID is required' },
        { status: 400 }
      )
    }
    
    const success = await deleteBLNumber(id)
    
    if (!success) {
      return NextResponse.json(
        { error: 'BL number not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ 
      message: "BL number deleted successfully"
    })
  } catch (error) {
    console.error('Error deleting BL number:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}