import { NextRequest, NextResponse } from 'next/server'
import { getUsers, createUser, getRegions } from '@/lib/supabase-db'
import { initializeDatabase } from '@/lib/supabase-db'

export async function GET(request: NextRequest) {
  try {
    await initializeDatabase()
    const users = await getUsers()
    const regions = await getRegions()

    return NextResponse.json({
      users: users,
      regions: regions
    })
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await initializeDatabase()
    const { name, email, role, region_id } = await request.json()

    if (!name || !email || !role) {
      return NextResponse.json(
        { error: 'Name, email, and role are required' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUsers = await getUsers()
    const existingUser = existingUsers.find(user => user.email === email)
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      )
    }

    const newUser = await createUser({
      name,
      email,
      password_hash: 'temp_password_hash', // This should be properly hashed
      role: role as 'admin' | 'regional_manager' | 'supervisor' | 'operations',
      region_id: region_id || null,
      status: 'pending'
    })

    if (!newUser) {
      return NextResponse.json(
        { error: 'Failed to create user' },
        { status: 500 }
      )
    }

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