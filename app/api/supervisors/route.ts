import { getUsersByRole } from "@/lib/auth"
import { initializeDatabase } from "@/lib/db"

export async function GET() {
  initializeDatabase()

  try {
    const supervisors = getUsersByRole("supervisor")
    return Response.json(supervisors)
  } catch (error) {
    return Response.json({ error: "Failed to fetch supervisors" }, { status: 500 })
  }
}
