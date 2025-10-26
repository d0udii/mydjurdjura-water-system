import { getAllUsers, createUser } from "@/lib/auth"
import { initializeDatabase } from "@/lib/db"

export async function GET() {
  initializeDatabase()

  try {
    const users = getAllUsers()
    return Response.json(users)
  } catch (error) {
    return Response.json({ error: "Failed to fetch users" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  initializeDatabase()

  try {
    const data = await request.json()
    const user = createUser({
      name: data.name,
      email: data.email,
      password: data.password,
      role: data.role,
      region: data.region,
      chefRegionId: data.chefRegionId,
      assignedCities: data.assignedCities,
      approved: data.role === "admin",
    })
    return Response.json(user)
  } catch (error) {
    return Response.json({ error: "Failed to create user" }, { status: 500 })
  }
}
