import { login } from "@/lib/auth"
import { initializeDatabase } from "@/lib/db"

export async function POST(request: Request) {
  try {
    initializeDatabase()

    const { email, password } = await request.json()

    if (!email || !password) {
      return Response.json({ error: "Email and password are required" }, { status: 400 })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return Response.json({ error: "Invalid email format" }, { status: 400 })
    }

    const session = login(email, password)

    if (!session) {
      return Response.json({ error: "Invalid email or password" }, { status: 401 })
    }

    return Response.json({
      token: session.token,
      user: {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        role: session.user.role,
        region: session.user.region,
        assignedCities: session.user.assignedCities,
        chefRegionId: session.user.chefRegionId,
      },
    })
  } catch (error) {
    console.error('Login error:', error)
    return Response.json({ 
      error: "Internal server error", 
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
