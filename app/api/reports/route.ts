import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Demo data for reports
    const demoOrders = [
      {
        id: "ORD-001",
        client_id: "CLI-001",
        status: "pending",
        total_price: 125000,
        product_5_5L_pallets: 11,
        product_1_5L_pallets: 11,
        created_at: "2024-01-10T10:00:00Z",
        clients: {
          name: "Biskra Water Distributor",
          address: "123 Main Street, Biskra"
        }
      },
      {
        id: "ORD-002",
        client_id: "CLI-002",
        status: "in_progress",
        total_price: 89000,
        product_5_5L_pallets: 8,
        product_1_5L_pallets: 6,
        created_at: "2024-01-08T14:30:00Z",
        clients: {
          name: "Ouled Djellal Store",
          address: "456 Market Square, Ouled Djellal"
        }
      },
      {
        id: "ORD-003",
        client_id: "CLI-003",
        status: "delivered",
        total_price: 156000,
        product_5_5L_pallets: 15,
        product_1_5L_pallets: 7,
        created_at: "2024-01-01T08:00:00Z",
        clients: {
          name: "El Mghair Trading",
          address: "789 Industrial Zone, El Mghair"
        }
      },
      {
        id: "ORD-004",
        client_id: "CLI-004",
        status: "pending",
        total_price: 95000,
        product_5_5L_pallets: 6,
        product_1_5L_pallets: 8,
        created_at: "2024-01-15T14:20:00Z",
        clients: {
          name: "Oued Souf Market",
          address: "321 Commercial Street, Oued Souf"
        }
      }
    ]

    const totalOrders = demoOrders.length
    const totalRevenue = demoOrders.reduce((sum, o) => sum + o.total_price, 0)
    const totalPallets = demoOrders.reduce((sum, o) => sum + o.product_5_5L_pallets + o.product_1_5L_pallets, 0)

    const ordersByStatus = {
      pending: demoOrders.filter((o) => o.status === "pending").length,
      in_progress: demoOrders.filter((o) => o.status === "in_progress").length,
      delivered: demoOrders.filter((o) => o.status === "delivered").length,
      cancelled: demoOrders.filter((o) => o.status === "cancelled").length,
    }

    // Revenue by city
    const revenueByCity: Record<string, number> = {}
    demoOrders.forEach((order) => {
      const city = order.clients.address.split(',')[1]?.trim() || 'Unknown'
      revenueByCity[city] = (revenueByCity[city] || 0) + order.total_price
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

    // Top clients by revenue
    const clientRevenue: Record<string, number> = {}
    demoOrders.forEach((order) => {
      const clientName = order.clients.name
      clientRevenue[clientName] = (clientRevenue[clientName] || 0) + order.total_price
    })

    const topClients = Object.entries(clientRevenue)
      .map(([name, revenue]) => ({ name, revenue }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)

    return NextResponse.json({
      totalOrders,
      totalRevenue,
      totalPallets,
      ordersByStatus,
      revenueByCity: revenueByCity_array,
      ordersByMonth,
      topClients,
      averageOrderValue: totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0,
      deliveryRate: totalOrders > 0 ? Math.round((ordersByStatus.delivered / totalOrders) * 100) : 0
    })
  } catch (error) {
    console.error('Error fetching report data:', error)
    return NextResponse.json({ error: "Failed to fetch report data" }, { status: 500 })
  }
}
