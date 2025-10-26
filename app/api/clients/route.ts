import { getAllClients, createClient } from "@/lib/clients"
import { initializeDatabase } from "@/lib/db"

export async function GET() {
  initializeDatabase()

  try {
    const clients = getAllClients()
    return Response.json(clients)
  } catch (error) {
    return Response.json({ error: "Failed to fetch clients" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  initializeDatabase()

  try {
    const data = await request.json()
    const client = createClient(data)
    return Response.json(client)
  } catch (error) {
    return Response.json({ error: "Failed to create client" }, { status: 500 })
  }
}
