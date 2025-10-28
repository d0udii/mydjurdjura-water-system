import { getAllProducts, createProduct } from "@/lib/products"
import { initializeDatabase } from "@/lib/db"

export async function GET() {
  initializeDatabase()

  try {
    const products = getAllProducts()
    // Map database fields to frontend interface
    const mappedProducts = products.map(product => ({
      id: product.id,
      name: product.name,
      volume: product.volume,
      units_per_pallet: product.unitsPerPallet,
      unit_price: product.unitPrice,
      status: product.status,
      created_at: product.createdAt
    }))
    return Response.json({ products: mappedProducts })
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
