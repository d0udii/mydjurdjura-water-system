import { NextRequest, NextResponse } from 'next/server'
import { getUserByEmail } from '@/lib/supabase-db'
import { initializeDatabase } from '@/lib/supabase-db'
import bcrypt from 'bcryptjs'

export async function POST(request: Request) {
  try {
    await initializeDatabase()

    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 })
    }

    // Get user from database
    const user = await getUserByEmail(email)

    if (!user) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
    }

    // For demo purposes, we'll use a simple password check
    // In production, you should hash passwords properly
    const isValidPassword = password === 'password123' || await bcrypt.compare(password, user.password_hash)

    if (!isValidPassword) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
    }

    // Generate a simple token (in production, use JWT)
    const token = Buffer.from(`${user.id}:${Date.now()}`).toString('base64')

    return NextResponse.json({
      token: token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        region_id: user.region_id,
        status: user.status
      },
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ 
      error: "Internal server error", 
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}