import { getProductById, updateProduct, deleteProduct } from "@/lib/products"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const product = getProductById(params.id)
    if (!product) {
      return Response.json({ error: "Product not found" }, { status: 404 })
    }
    return Response.json(product)
  } catch (error) {
    return Response.json({ error: "Failed to fetch product" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const data = await request.json()
    const product = updateProduct(params.id, data)
    if (!product) {
      return Response.json({ error: "Product not found" }, { status: 404 })
    }
    return Response.json(product)
  } catch (error) {
    return Response.json({ error: "Failed to update product" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const success = deleteProduct(params.id)
    if (!success) {
      return Response.json({ error: "Product not found" }, { status: 404 })
    }
    return Response.json({ success: true })
  } catch (error) {
    return Response.json({ error: "Failed to delete product" }, { status: 500 })
  }
}
