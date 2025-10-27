import { NextRequest, NextResponse } from 'next/server'

interface User {
  id: string
  name: string
  email: string
  role: 'admin' | 'regional_manager' | 'supervisor' | 'operations'
  status: 'active' | 'inactive' | 'pending'
  created_at: string
}

// Demo users data
const demoUsers: User[] = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@djurdjura.dz',
    role: 'admin',
    status: 'active',
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    name: 'Hamouch Regional Manager',
    email: 'hamouch@djurdjura.dz',
    role: 'regional_manager',
    status: 'active',
    created_at: '2024-01-02T00:00:00Z'
  },
  {
    id: '3',
    name: 'Mahmoud Djouadi',
    email: 'mahmoud@djurdjura.dz',
    role: 'supervisor',
    status: 'active',
    created_at: '2024-01-03T00:00:00Z'
  },
  {
    id: '4',
    name: 'Operations Team',
    email: 'operations@djurdjura.dz',
    role: 'operations',
    status: 'active',
    created_at: '2024-01-04T00:00:00Z'
  }
]

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    
    const userIndex = demoUsers.findIndex(user => user.id === id)
    if (userIndex === -1) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Update the user
    demoUsers[userIndex] = {
      ...demoUsers[userIndex],
      ...body,
      id: id // Ensure ID doesn't change
    }

    console.log('User updated:', demoUsers[userIndex])
    return NextResponse.json({ user: demoUsers[userIndex] }, { status: 200 })
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    
    const userIndex = demoUsers.findIndex(user => user.id === id)
    if (userIndex === -1) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Remove the user
    const deletedUser = demoUsers.splice(userIndex, 1)[0]

    console.log('User deleted:', deletedUser)
    return NextResponse.json({ message: 'User deleted successfully' }, { status: 200 })
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 })
  }
}
