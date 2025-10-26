import { login } from "@/lib/auth"
import { initializeDatabase } from "@/lib/db"

export async function POST(request: Request) {
  initializeDatabase()

  try {
    const { email, password } = await request.json()

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
    return Response.json({ error: "Internal server error" }, { status: 500 })
  }
}
