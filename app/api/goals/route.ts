import { NextRequest, NextResponse } from 'next/server'

// Mock goals and progress storage (in production, this would be in Supabase)
let goals: any[] = [
  {
    id: "GOAL-001",
    title: "Monthly Sales Target",
    description: "Achieve 100 orders this month",
    target_type: "supervisor", // "supervisor", "client", "city"
    target_id: "USR-003", // Mahmoud's ID
    metric_type: "orders_count", // "orders_count", "revenue", "clients_count"
    target_value: 100,
    current_value: 45,
    start_date: "2024-01-01",
    end_date: "2024-01-31",
    status: "active", // "active", "completed", "failed", "paused"
    priority: "high",
    created_by: "USR-001",
    created_at: "2024-01-01T00:00:00Z",
    progress_percentage: 45
  },
  {
    id: "GOAL-002",
    title: "Client Acquisition Goal",
    description: "Add 10 new clients in Biskra region",
    target_type: "city",
    target_id: "Biskra",
    metric_type: "clients_count",
    target_value: 10,
    current_value: 7,
    start_date: "2024-01-01",
    end_date: "2024-03-31",
    status: "active",
    priority: "medium",
    created_by: "USR-001",
    created_at: "2024-01-01T00:00:00Z",
    progress_percentage: 70
  }
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const targetType = searchParams.get('target_type')
    const targetId = searchParams.get('target_id')
    const status = searchParams.get('status')
    const createdBy = searchParams.get('created_by')
    
    let filteredGoals = goals
    
    if (targetType) {
      filteredGoals = filteredGoals.filter(g => g.target_type === targetType)
    }
    
    if (targetId) {
      filteredGoals = filteredGoals.filter(g => g.target_id === targetId)
    }
    
    if (status) {
      filteredGoals = filteredGoals.filter(g => g.status === status)
    }
    
    if (createdBy) {
      filteredGoals = filteredGoals.filter(g => g.created_by === createdBy)
    }
    
    // Calculate progress percentage for each goal
    filteredGoals = filteredGoals.map(goal => ({
      ...goal,
      progress_percentage: Math.round((goal.current_value / goal.target_value) * 100)
    }))
    
    return NextResponse.json({ goals: filteredGoals })
  } catch (error) {
    console.error('Error fetching goals:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const {
      title,
      description,
      target_type,
      target_id,
      metric_type,
      target_value,
      start_date,
      end_date,
      priority,
      created_by
    } = data
    
    // Validation
    if (!title || !target_type || !target_id || !metric_type || !target_value || !start_date || !end_date) {
      return NextResponse.json(
        { error: 'All required fields must be provided' },
        { status: 400 }
      )
    }
    
    const validTargetTypes = ['supervisor', 'client', 'city']
    if (!validTargetTypes.includes(target_type)) {
      return NextResponse.json(
        { error: 'Invalid target type' },
        { status: 400 }
      )
    }
    
    const validMetricTypes = ['orders_count', 'revenue', 'clients_count']
    if (!validMetricTypes.includes(metric_type)) {
      return NextResponse.json(
        { error: 'Invalid metric type' },
        { status: 400 }
      )
    }
    
    if (new Date(start_date) >= new Date(end_date)) {
      return NextResponse.json(
        { error: 'End date must be after start date' },
        { status: 400 }
      )
    }
    
    const newGoal = {
      id: `GOAL-${String(Date.now()).slice(-6)}`,
      title,
      description: description || "",
      target_type,
      target_id,
      metric_type,
      target_value: parseFloat(target_value),
      current_value: 0,
      start_date,
      end_date,
      status: "active",
      priority: priority || "medium",
      created_by: created_by || "USR-001",
      created_at: new Date().toISOString(),
      progress_percentage: 0
    }
    
    goals.push(newGoal)
    
    return NextResponse.json({ 
      goal: newGoal, 
      message: "Goal created successfully" 
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating goal:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const data = await request.json()
    const { id, ...updateData } = data
    
    const goalIndex = goals.findIndex(g => g.id === id)
    if (goalIndex === -1) {
      return NextResponse.json(
        { error: 'Goal not found' },
        { status: 404 }
      )
    }
    
    // Update current value and recalculate progress
    if (updateData.current_value !== undefined) {
      const targetValue = goals[goalIndex].target_value
      updateData.progress_percentage = Math.round((updateData.current_value / targetValue) * 100)
      
      // Update status based on progress
      if (updateData.current_value >= targetValue) {
        updateData.status = "completed"
      } else if (new Date() > new Date(goals[goalIndex].end_date)) {
        updateData.status = "failed"
      }
    }
    
    goals[goalIndex] = {
      ...goals[goalIndex],
      ...updateData,
      updated_at: new Date().toISOString()
    }
    
    return NextResponse.json({ 
      goal: goals[goalIndex], 
      message: "Goal updated successfully" 
    })
  } catch (error) {
    console.error('Error updating goal:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json(
        { error: 'Goal ID is required' },
        { status: 400 }
      )
    }
    
    const goalIndex = goals.findIndex(g => g.id === id)
    if (goalIndex === -1) {
      return NextResponse.json(
        { error: 'Goal not found' },
        { status: 404 }
      )
    }
    
    goals.splice(goalIndex, 1)
    
    return NextResponse.json({ 
      message: "Goal deleted successfully" 
    })
  } catch (error) {
    console.error('Error deleting goal:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
