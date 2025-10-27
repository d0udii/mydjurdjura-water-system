import { NextRequest, NextResponse } from 'next/server'

interface Product {
  id: string
  name: string
  volume: string
  units_per_pallet: number
  unit_price: number
  status: 'active' | 'inactive' | 'discontinued'
  created_at: string
}

// Demo products data
const demoProducts: Product[] = [
  {
    id: '1',
    name: 'Djurdjura Water 5.5L',
    volume: '5.5L',
    units_per_pallet: 212,
    unit_price: 65,
    status: 'active',
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    name: 'Djurdjura Water 1.5L',
    volume: '1.5L',
    units_per_pallet: 112,
    unit_price: 178.5,
    status: 'active',
    created_at: '2024-01-02T00:00:00Z'
  }
]

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    
    const productIndex = demoProducts.findIndex(product => product.id === id)
    if (productIndex === -1) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // Update the product
    demoProducts[productIndex] = {
      ...demoProducts[productIndex],
      ...body,
      id: id // Ensure ID doesn't change
    }

    console.log('Product updated:', demoProducts[productIndex])
    return NextResponse.json({ product: demoProducts[productIndex] }, { status: 200 })
  } catch (error) {
    console.error('Error updating product:', error)
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    
    const productIndex = demoProducts.findIndex(product => product.id === id)
    if (productIndex === -1) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // Remove the product
    const deletedProduct = demoProducts.splice(productIndex, 1)[0]

    console.log('Product deleted:', deletedProduct)
    return NextResponse.json({ message: 'Product deleted successfully' }, { status: 200 })
  } catch (error) {
    console.error('Error deleting product:', error)
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 })
  }
}