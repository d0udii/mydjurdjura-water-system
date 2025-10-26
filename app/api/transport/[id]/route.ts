import { updateTariff, deleteTariff } from "@/lib/transport"

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const data = await request.json()
    const tariff = updateTariff(params.id, data)
    if (!tariff) {
      return Response.json({ error: "Tariff not found" }, { status: 404 })
    }
    return Response.json(tariff)
  } catch (error) {
    return Response.json({ error: "Failed to update tariff" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const success = deleteTariff(params.id)
    if (!success) {
      return Response.json({ error: "Tariff not found" }, { status: 404 })
    }
    return Response.json({ success: true })
  } catch (error) {
    return Response.json({ error: "Failed to delete tariff" }, { status: 500 })
  }
}
