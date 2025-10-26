import { updateUser, getUserById } from "@/lib/auth"
import { initializeDatabase } from "@/lib/db"
import { db } from "@/lib/db"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  initializeDatabase()

  try {
    const user = getUserById(params.id)
    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 })
    }
    return Response.json(user)
  } catch (error) {
    return Response.json({ error: "Failed to fetch user" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  initializeDatabase()

  try {
    const data = await request.json()
    const user = updateUser(params.id, {
      name: data.name,
      email: data.email,
      password: data.password || undefined,
      role: data.role,
      region: data.region,
      chefRegionId: data.chefRegionId,
      assignedCities: data.assignedCities,
    })
    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 })
    }
    return Response.json(user)
  } catch (error) {
    return Response.json({ error: "Failed to update user" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  initializeDatabase()

  try {
    const user = getUserById(params.id)
    if (user?.role === "admin") {
      return Response.json({ error: "Cannot delete admin accounts" }, { status: 400 })
    }

    const index = db.users.findIndex((u) => u.id === params.id)
    if (index !== -1) {
      db.users.splice(index, 1)
    }

    return Response.json({ success: true })
  } catch (error) {
    return Response.json({ error: "Failed to delete user" }, { status: 500 })
  }
}
