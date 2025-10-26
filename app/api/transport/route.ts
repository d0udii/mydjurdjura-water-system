import { getAllTariffs, createTransportTariff } from "@/lib/transport"
import { initializeDatabase } from "@/lib/db"

export async function GET() {
  initializeDatabase()

  try {
    const tariffs = getAllTariffs()
    return Response.json(tariffs)
  } catch (error) {
    return Response.json({ error: "Failed to fetch tariffs" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  initializeDatabase()

  try {
    const data = await request.json()
    const tariff = createTransportTariff(data)
    return Response.json(tariff)
  } catch (error) {
    return Response.json({ error: "Failed to create tariff" }, { status: 500 })
  }
}
