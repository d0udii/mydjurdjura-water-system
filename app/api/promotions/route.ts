import { NextRequest, NextResponse } from 'next/server'

// Mock promotions storage (in production, this would be in Supabase)
let promotions: any[] = [
  {
    id: "PROMO-001",
    name: "Summer Discount Biskra",
    type: "percentage", // "fixed" or "percentage"
    value: 10, // 10% or fixed amount
    target_type: "city", // "city", "client", "supervisor"
    target_id: "Biskra",
    start_date: "2024-06-01",
    end_date: "2024-08-31",
    status: "active",
    created_by: "USR-001",
    created_at: "2024-01-01T00:00:00Z",
    description: "Summer promotion for Biskra region"
  }
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const targetType = searchParams.get('target_type')
    const targetId = searchParams.get('target_id')
    const status = searchParams.get('status')
    
    let filteredPromotions = promotions
    
    if (targetType) {
      filteredPromotions = filteredPromotions.filter(p => p.target_type === targetType)
    }
    
    if (targetId) {
      filteredPromotions = filteredPromotions.filter(p => p.target_id === targetId)
    }
    
    if (status) {
      filteredPromotions = filteredPromotions.filter(p => p.status === status)
    }
    
    return NextResponse.json({ promotions: filteredPromotions })
  } catch (error) {
    console.error('Error fetching promotions:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const {
      name,
      type,
      value,
      target_type,
      target_id,
      start_date,
      end_date,
      description,
      created_by
    } = data
    
    // Validation
    if (!name || !type || !value || !target_type || !target_id || !start_date || !end_date) {
      return NextResponse.json(
        { error: 'All required fields must be provided' },
        { status: 400 }
      )
    }
    
    if (type !== 'fixed' && type !== 'percentage') {
      return NextResponse.json(
        { error: 'Type must be either "fixed" or "percentage"' },
        { status: 400 }
      )
    }
    
    if (type === 'percentage' && (value < 0 || value > 100)) {
      return NextResponse.json(
        { error: 'Percentage value must be between 0 and 100' },
        { status: 400 }
      )
    }
    
    if (new Date(start_date) >= new Date(end_date)) {
      return NextResponse.json(
        { error: 'End date must be after start date' },
        { status: 400 }
      )
    }
    
    const newPromotion = {
      id: `PROMO-${String(Date.now()).slice(-6)}`,
      name,
      type,
      value: parseFloat(value),
      target_type,
      target_id,
      start_date,
      end_date,
      status: "active",
      created_by: created_by || "USR-001",
      created_at: new Date().toISOString(),
      description: description || ""
    }
    
    promotions.push(newPromotion)
    
    return NextResponse.json({ 
      promotion: newPromotion, 
      message: "Promotion created successfully" 
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating promotion:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const data = await request.json()
    const { id, ...updateData } = data
    
    const promoIndex = promotions.findIndex(p => p.id === id)
    if (promoIndex === -1) {
      return NextResponse.json(
        { error: 'Promotion not found' },
        { status: 404 }
      )
    }
    
    promotions[promoIndex] = {
      ...promotions[promoIndex],
      ...updateData,
      updated_at: new Date().toISOString()
    }
    
    return NextResponse.json({ 
      promotion: promotions[promoIndex], 
      message: "Promotion updated successfully" 
    })
  } catch (error) {
    console.error('Error updating promotion:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json(
        { error: 'Promotion ID is required' },
        { status: 400 }
      )
    }
    
    const promoIndex = promotions.findIndex(p => p.id === id)
    if (promoIndex === -1) {
      return NextResponse.json(
        { error: 'Promotion not found' },
        { status: 404 }
      )
    }
    
    promotions.splice(promoIndex, 1)
    
    return NextResponse.json({ 
      message: "Promotion deleted successfully" 
    })
  } catch (error) {
    console.error('Error deleting promotion:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
