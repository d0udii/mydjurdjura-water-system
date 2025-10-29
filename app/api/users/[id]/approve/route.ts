import { updateUser } from "@/lib/supabase-db"
import { initializeDatabase } from "@/lib/supabase-db"

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  await initializeDatabase()

  try {
    const { id } = await params
    const user = await updateUser(id, { approved: true })
    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 })
    }
    return Response.json(user)
  } catch (error) {
    return Response.json({ error: "Failed to approve user" }, { status: 500 })
  }
}
