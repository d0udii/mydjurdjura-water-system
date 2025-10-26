import { updateUser } from "@/lib/auth"
import { initializeDatabase } from "@/lib/db"

export async function POST(request: Request, { params }: { params: { id: string } }) {
  initializeDatabase()

  try {
    const user = updateUser(params.id, { approved: true })
    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 })
    }
    return Response.json(user)
  } catch (error) {
    return Response.json({ error: "Failed to approve user" }, { status: 500 })
  }
}
