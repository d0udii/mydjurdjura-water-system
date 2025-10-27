import { getClientById, updateClient, deleteClient } from "@/lib/clients"
import { initializeDatabase } from "@/lib/db"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  initializeDatabase()

  try {
    const { id } = await params
    const client = getClientById(id)
    if (!client) {
      return Response.json({ error: "Client not found" }, { status: 404 })
    }
    return Response.json(client)
  } catch (error) {
    return Response.json({ error: "Failed to fetch client" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  initializeDatabase()

  try {
    const { id } = await params
    const data = await request.json()
    const client = updateClient(id, data)
    if (!client) {
      return Response.json({ error: "Client not found" }, { status: 404 })
    }
    return Response.json(client)
  } catch (error) {
    return Response.json({ error: "Failed to update client" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  initializeDatabase()

  try {
    const { id } = await params
    const success = deleteClient(id)
    if (!success) {
      return Response.json({ error: "Client not found" }, { status: 404 })
    }
    return Response.json({ success: true })
  } catch (error) {
    return Response.json({ error: "Failed to delete client" }, { status: 500 })
  }
}
