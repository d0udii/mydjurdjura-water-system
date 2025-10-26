import { getClientById, updateClient, deleteClient } from "@/lib/clients"
import { initializeDatabase } from "@/lib/db"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  initializeDatabase()

  try {
    const client = getClientById(params.id)
    if (!client) {
      return Response.json({ error: "Client not found" }, { status: 404 })
    }
    return Response.json(client)
  } catch (error) {
    return Response.json({ error: "Failed to fetch client" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  initializeDatabase()

  try {
    const data = await request.json()
    const client = updateClient(params.id, data)
    if (!client) {
      return Response.json({ error: "Client not found" }, { status: 404 })
    }
    return Response.json(client)
  } catch (error) {
    return Response.json({ error: "Failed to update client" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  initializeDatabase()

  try {
    const success = deleteClient(params.id)
    if (!success) {
      return Response.json({ error: "Client not found" }, { status: 404 })
    }
    return Response.json({ success: true })
  } catch (error) {
    return Response.json({ error: "Failed to delete client" }, { status: 500 })
  }
}
