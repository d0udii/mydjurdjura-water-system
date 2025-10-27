import { NextRequest, NextResponse } from 'next/server'

// Demo supervisors data
let supervisors = [
  {
    id: "USR-003",
    name: "Mahmoud Djouadi",
    email: "mahmoud@djurdjura.com",
    role: "supervisor",
    assigned_cities: ["Biskra", "Ouled Djellal", "Oued Souf", "El Mghair"],
    region_id: "REG-001",
    status: "active",
    created_at: "2024-01-01T00:00:00Z"
  },
  {
    id: "USR-005",
    name: "Ahmed Benali",
    email: "ahmed@djurdjura.com",
    role: "supervisor",
    assigned_cities: ["Tebessa", "Khenchela", "Batna"],
    region_id: "REG-001",
    status: "active",
    created_at: "2024-01-02T00:00:00Z"
  },
  {
    id: "USR-008",
    name: "Fatima Zohra",
    email: "fatima@djurdjura.com",
    role: "supervisor",
    assigned_cities: ["Oran", "Mostaganem", "Sidi Bel Abbes"],
    region_id: "REG-002",
    status: "active",
    created_at: "2024-01-03T00:00:00Z"
  }
]

export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({ supervisors })
  } catch (error) {
    console.error('Error fetching supervisors:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const { name, email, role, phone, region_id, assigned_cities } = data

    if (!name || !email || !role) {
      return NextResponse.json(
        { error: 'Name, email, and role are required' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = supervisors.find(user => user.email === email)
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      )
    }

    // Generate new user ID
    const newUserId = `USR-${String(Date.now()).slice(-6)}`

    const newUser = {
      id: newUserId,
      name,
      email,
      role,
      phone: phone || '',
      region_id: region_id || null,
      assigned_cities: assigned_cities || [],
      status: 'active' as const,
      created_at: new Date().toISOString()
    }

    supervisors.push(newUser)

    return NextResponse.json(
      { 
        message: 'Supervisor created successfully',
        supervisor: newUser 
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating supervisor:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const data = await request.json()
    const { supervisor_id, assigned_cities, name, email, phone, region_id, status } = data

    if (!supervisor_id) {
      return NextResponse.json(
        { error: 'Supervisor ID is required' },
        { status: 400 }
      )
    }

    const supervisorIndex = supervisors.findIndex(s => s.id === supervisor_id)
    if (supervisorIndex === -1) {
      return NextResponse.json(
        { error: 'Supervisor not found' },
        { status: 404 }
      )
    }

    // Update supervisor
    const updatedSupervisor = {
      ...supervisors[supervisorIndex],
      name: name || supervisors[supervisorIndex].name,
      email: email || supervisors[supervisorIndex].email,
      phone: phone || supervisors[supervisorIndex].phone,
      region_id: region_id || supervisors[supervisorIndex].region_id,
      assigned_cities: assigned_cities || supervisors[supervisorIndex].assigned_cities,
      status: status || supervisors[supervisorIndex].status,
      updated_at: new Date().toISOString()
    }

    supervisors[supervisorIndex] = updatedSupervisor

    return NextResponse.json({ 
      message: 'Supervisor updated successfully',
      supervisor: updatedSupervisor
    })
  } catch (error) {
    console.error('Error updating supervisor:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Supervisor ID is required' },
        { status: 400 }
      )
    }

    const supervisorIndex = supervisors.findIndex(s => s.id === id)
    if (supervisorIndex === -1) {
      return NextResponse.json(
        { error: 'Supervisor not found' },
        { status: 404 }
      )
    }

    const deletedSupervisor = supervisors[supervisorIndex]
    supervisors.splice(supervisorIndex, 1)

    return NextResponse.json({
      message: `Supervisor "${deletedSupervisor.name}" deleted successfully`,
      supervisor: deletedSupervisor
    })
  } catch (error) {
    console.error('Error deleting supervisor:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}