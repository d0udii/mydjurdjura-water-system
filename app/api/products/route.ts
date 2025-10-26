import { getAllProducts, createProduct } from "@/lib/products"
import { initializeDatabase } from "@/lib/db"

export async function GET() {
  initializeDatabase()

  try {
    const products = getAllProducts()
    return Response.json(products)
  } catch (error) {
    return Response.json({ error: "Failed to fetch products" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  initializeDatabase()

  try {
    const data = await request.json()
    const product = createProduct(data)
    return Response.json(product)
  } catch (error) {
    return Response.json({ error: "Failed to create product" }, { status: 500 })
  }
}
