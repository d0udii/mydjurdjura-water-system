// Email notification service
export interface EmailNotification {
  to: string
  subject: string
  body: string
  timestamp: Date
}

const emailLog: EmailNotification[] = []

export function sendOrderNotification(
  email: string,
  orderData: {
    orderId: string
    clientName: string
    productName: string
    pallets: number
    totalPrice: number
    status: string
  },
): void {
  const notification: EmailNotification = {
    to: email,
    subject: `Order Confirmation - Order #${orderData.orderId}`,
    body: `
Order Details:
- Order ID: ${orderData.orderId}
- Client: ${orderData.clientName}
- Product: ${orderData.productName}
- Pallets: ${orderData.pallets}
- Total Price: ${orderData.totalPrice.toLocaleString()} DA
- Status: ${orderData.status}

This order has been submitted and is pending approval.
    `,
    timestamp: new Date(),
  }

  emailLog.push(notification)
  console.log("[EMAIL SENT]", notification)
}

export function sendApprovalNotification(
  email: string,
  orderData: {
    orderId: string
    clientName: string
    blNumber?: string
    driverName?: string
  },
): void {
  const notification: EmailNotification = {
    to: email,
    subject: `Order Approved - Order #${orderData.orderId}`,
    body: `
Your order has been approved!

Order Details:
- Order ID: ${orderData.orderId}
- Client: ${orderData.clientName}
- BL Number: ${orderData.blNumber || "Pending"}
- Driver: ${orderData.driverName || "To be assigned"}

Your order is now in the delivery queue.
    `,
    timestamp: new Date(),
  }

  emailLog.push(notification)
  console.log("[EMAIL SENT]", notification)
}

export function getEmailLog(): EmailNotification[] {
  return emailLog
}
