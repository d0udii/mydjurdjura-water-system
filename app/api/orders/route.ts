import { createOrder, getAllOrders } from "@/lib/orders"
import { getClientById } from "@/lib/clients"
import { getProductById } from "@/lib/products"
import { getTariffByCity } from "@/lib/transport"
import { sendOrderNotification } from "@/lib/email"
import { getUserById } from "@/lib/auth"
import { initializeDatabase } from "@/lib/db"

export async function GET(request: Request) {
  initializeDatabase()

  try {
    const orders = getAllOrders()
    return Response.json(orders)
  } catch (error) {
    return Response.json({ error: "Failed to fetch orders" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  initializeDatabase()

  try {
    const data = await request.json()
    const client = getClientById(data.clientId)
    const product = getProductById(data.productId)
    const supervisor = getUserById(data.supervisorId)

    if (!client || !product) {
      return Response.json({ error: "Invalid client or product" }, { status: 400 })
    }

    // Calculate totals
    const totalQuantity = data.pallets * product.unitsPerPallet
    const productTotal = totalQuantity * product.unitPrice
    const tariff = getTariffByCity(client.city)
    const transportPrice = tariff?.price || 0

    const order = createOrder({
      clientId: data.clientId,
      supervisorId: data.supervisorId,
      productId: data.productId,
      pallets: data.pallets,
      totalQuantity,
      unitPrice: product.unitPrice,
      transportPrice,
      totalPrice: productTotal + transportPrice,
      driverName: data.driverName,
      status: "pending",
    })

    // Send email notification
    if (supervisor) {
      sendOrderNotification(supervisor.email, {
        orderId: order.id,
        clientName: client.name,
        productName: product.name,
        pallets: data.pallets,
        totalPrice: order.totalPrice,
        status: "pending",
      })
    }

    return Response.json(order)
  } catch (error) {
    console.error("Error creating order:", error)
    return Response.json({ error: "Failed to create order" }, { status: 500 })
  }
}
