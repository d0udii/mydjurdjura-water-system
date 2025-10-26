import { db, type Order } from "./db"

export function createOrder(orderData: Omit<Order, "id" | "createdAt" | "updatedAt">): Order {
  const newOrder: Order = {
    ...orderData,
    id: Date.now().toString(),
    createdAt: new Date(),
    updatedAt: new Date(),
  }
  db.orders.push(newOrder)
  return newOrder
}

export function getOrderById(id: string): Order | undefined {
  return db.orders.find((o) => o.id === id)
}

export function getOrdersBySupervisor(supervisorId: string): Order[] {
  return db.orders.filter((o) => o.supervisorId === supervisorId)
}

export function getOrdersByStatus(status: Order["status"]): Order[] {
  return db.orders.filter((o) => o.status === status)
}

export function getAllOrders(): Order[] {
  return db.orders
}

export function updateOrder(id: string, updates: Partial<Order>): Order | null {
  const order = db.orders.find((o) => o.id === id)
  if (!order) return null

  Object.assign(order, { ...updates, updatedAt: new Date() })
  return order
}

export function getOrderStats() {
  const orders = db.orders
  const totalOrders = orders.length
  const pendingOrders = orders.filter((o) => o.status === "pending").length
  const approvedOrders = orders.filter((o) => o.status === "approved").length
  const deliveredOrders = orders.filter((o) => o.status === "delivered").length
  const totalRevenue = orders.reduce((sum, o) => sum + o.totalPrice, 0)
  const totalPallets = orders.reduce((sum, o) => sum + o.pallets, 0)

  return {
    totalOrders,
    pendingOrders,
    approvedOrders,
    deliveredOrders,
    totalRevenue,
    totalPallets,
  }
}
