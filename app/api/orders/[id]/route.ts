import { getOrderById, updateOrder } from "@/lib/orders"
import { initializeDatabase } from "@/lib/db"
import { db } from "@/lib/db"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  initializeDatabase()

  try {
    const order = getOrderById(params.id)
    if (!order) {
      return Response.json({ error: "Order not found" }, { status: 404 })
    }
    return Response.json(order)
  } catch (error) {
    return Response.json({ error: "Failed to fetch order" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  initializeDatabase()

  try {
    const data = await request.json()
    const order = updateOrder(params.id, data)
    if (!order) {
      return Response.json({ error: "Order not found" }, { status: 404 })
    }
    return Response.json(order)
  } catch (error) {
    return Response.json({ error: "Failed to update order" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  initializeDatabase()

  try {
    const order = getOrderById(params.id)
    if (!order) {
      return Response.json({ error: "Order not found" }, { status: 404 })
    }
    if (order.status !== "pending") {
      return Response.json({ error: "Can only delete pending orders" }, { status: 400 })
    }

    const index = db.orders.findIndex((o) => o.id === params.id)
    if (index !== -1) {
      db.orders.splice(index, 1)
    }

    return Response.json({ success: true })
  } catch (error) {
    return Response.json({ error: "Failed to delete order" }, { status: 500 })
  }
}
