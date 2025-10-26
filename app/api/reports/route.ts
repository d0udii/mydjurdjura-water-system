import { getAllOrders } from "@/lib/orders"
import { getAllClients } from "@/lib/clients"
import { initializeDatabase } from "@/lib/db"

export async function GET() {
  initializeDatabase()

  try {
    const orders = getAllOrders()
    const clients = getAllClients()

    const totalOrders = orders.length
    const totalRevenue = orders.reduce((sum, o) => sum + o.totalPrice, 0)
    const totalPallets = orders.reduce((sum, o) => sum + o.pallets, 0)

    const ordersByStatus = {
      pending: orders.filter((o) => o.status === "pending").length,
      approved: orders.filter((o) => o.status === "approved").length,
      in_delivery: orders.filter((o) => o.status === "in_delivery").length,
      delivered: orders.filter((o) => o.status === "delivered").length,
    }

    // Revenue by city
    const revenueByCity: Record<string, number> = {}
    orders.forEach((order) => {
      const client = clients.find((c) => c.id === order.clientId)
      if (client) {
        revenueByCity[client.city] = (revenueByCity[client.city] || 0) + order.totalPrice
      }
    })

    const revenueByCity_array = Object.entries(revenueByCity).map(([city, revenue]) => ({
      city,
      revenue,
    }))

    // Orders by month (mock data)
    const ordersByMonth = [
      { month: "Jan", orders: Math.floor(totalOrders * 0.1) },
      { month: "Feb", orders: Math.floor(totalOrders * 0.15) },
      { month: "Mar", orders: Math.floor(totalOrders * 0.2) },
      { month: "Apr", orders: Math.floor(totalOrders * 0.25) },
      { month: "May", orders: Math.floor(totalOrders * 0.3) },
    ]

    return Response.json({
      totalOrders,
      totalRevenue,
      totalPallets,
      ordersByStatus,
      revenueByCity: revenueByCity_array,
      ordersByMonth,
    })
  } catch (error) {
    return Response.json({ error: "Failed to fetch report data" }, { status: 500 })
  }
}
