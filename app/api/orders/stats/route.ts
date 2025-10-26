import { getOrderStats } from "@/lib/orders"
import { initializeDatabase } from "@/lib/db"

export async function GET() {
  initializeDatabase()

  try {
    const stats = getOrderStats()
    return Response.json(stats)
  } catch (error) {
    return Response.json({ error: "Failed to fetch stats" }, { status: 500 })
  }
}
