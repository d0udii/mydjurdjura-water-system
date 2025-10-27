import { NextRequest, NextResponse } from 'next/server'

// Demo users data
const demoUsers = [
  {
    id: "demo-admin@djurdjura.dz",
    name: "Admin User",
    email: "admin@djurdjura.dz",
    role: "admin",
    status: "active",
    created_at: "2024-01-01T00:00:00Z"
  },
  {
    id: "demo-hamouch@djurdjura.dz",
    name: "Hamouch",
    email: "hamouch@djurdjura.dz",
    role: "regional_manager",
    status: "active",
    region_id: "REG-001",
    created_at: "2024-01-01T00:00:00Z"
  },
  {
    id: "demo-mahmoud@djurdjura.dz",
    name: "Mahmoud Djouadi",
    email: "mahmoud@djurdjura.dz",
    role: "supervisor",
    status: "active",
    region_id: "REG-001",
    assigned_cities: ["Biskra", "Ouled Djellal", "Oued Souf", "El Mghair", "Tolga"],
    created_at: "2024-01-01T00:00:00Z"
  },
  {
    id: "demo-operations@djurdjura.dz",
    name: "Operations Team",
    email: "operations@djurdjura.dz",
    role: "operations",
    status: "active",
    created_at: "2024-01-01T00:00:00Z"
  }
]

export async function POST(request: NextRequest) {
  try {
    const { name, email, role, phone, region_id, assigned_cities } = await request.json()

    if (!name || !email || !role) {
      return NextResponse.json(
        { error: 'Name, email, and role are required' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = demoUsers.find(user => user.email === email)
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      )
    }

    // Generate new user ID
    const newUserId = `demo-${email.split('@')[0]}@djurdjura.dz`

    const newUser = {
      id: newUserId,
      name,
      email,
      role,
      phone: phone || '',
      region_id: region_id || null,
      assigned_cities: assigned_cities || [],
      status: 'pending' as const,
      created_at: new Date().toISOString()
    }

    demoUsers.push(newUser)

    return NextResponse.json(
      { 
        message: 'User created successfully',
        user: newUser 
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const role = searchParams.get('role')
    const region_id = searchParams.get('region_id')

    let filteredUsers = demoUsers

    if (role) {
      filteredUsers = filteredUsers.filter(user => user.role === role)
    }

    if (region_id) {
      filteredUsers = filteredUsers.filter(user => user.region_id === region_id)
    }

    // Sort by created_at descending
    filteredUsers.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

    return NextResponse.json({ users: filteredUsers })
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const data = await request.json()
    const { id, name, email, role, phone, region_id, assigned_cities, status } = data

    if (!id) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    const userIndex = demoUsers.findIndex(user => user.id === id)
    if (userIndex === -1) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Update user
    const updatedUser = {
      ...demoUsers[userIndex],
      name: name || demoUsers[userIndex].name,
      email: email || demoUsers[userIndex].email,
      role: role || demoUsers[userIndex].role,
      phone: phone || demoUsers[userIndex].phone,
      region_id: region_id || demoUsers[userIndex].region_id,
      assigned_cities: assigned_cities || demoUsers[userIndex].assigned_cities,
      status: status || demoUsers[userIndex].status,
      updated_at: new Date().toISOString()
    }

    demoUsers[userIndex] = updatedUser

    return NextResponse.json({
      user: updatedUser,
      message: 'User updated successfully'
    })
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    const userIndex = demoUsers.findIndex(user => user.id === id)
    if (userIndex === -1) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const deletedUser = demoUsers[userIndex]
    demoUsers.splice(userIndex, 1)

    return NextResponse.json({
      message: `User "${deletedUser.name}" deleted successfully`,
      user: deletedUser
    })
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}