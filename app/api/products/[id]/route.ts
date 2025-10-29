import { NextRequest } from 'next/server'
import { getProductById, updateProduct, deleteProduct } from '@/lib/supabase-db'
import { initializeDatabase } from '@/lib/supabase-db'
import { requireAuth, canModifyResource } from '@/lib/api-auth'
import { ApiResponseHelper } from '@/lib/api-response'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await initializeDatabase()
    
    // Require authentication
    const authResult = await requireAuth(request)
    if (authResult instanceof Response) {
      return authResult
    }
    const { user } = authResult

    const { id } = params
    const product = await getProductById(id)
    
    if (!product) {
      return ApiResponseHelper.notFound('Product not found')
    }
    
    return ApiResponseHelper.success(
      'Product fetched successfully',
      { product }
    )
  } catch (error) {
    console.error('Error fetching product:', error)
    return ApiResponseHelper.internalError(
      'Failed to fetch product',
      error instanceof Error ? error.message : String(error)
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await initializeDatabase()
    
    // Require authentication and admin/operations role
    const authResult = await requireAuth(request)
    if (authResult instanceof Response) {
      return authResult
    }
    const { user } = authResult

    // Only admin and operations can update products
    if (user.role !== 'admin' && user.role !== 'operations') {
      return ApiResponseHelper.forbidden('Only admins and operations team can update products')
    }

    const { id } = params
    const body = await request.json()
    
    // Validate if product exists
    const existingProduct = await getProductById(id)
    if (!existingProduct) {
      return ApiResponseHelper.notFound('Product not found')
    }
    
    // Validate update data
    const errors: Record<string, string> = {}
    if (body.name !== undefined && !body.name.trim()) {
      errors.name = 'Product name cannot be empty'
    }
    if (body.volume !== undefined && !body.volume.trim()) {
      errors.volume = 'Volume cannot be empty'
    }
    if (body.units_per_pallet !== undefined && parseInt(body.units_per_pallet) <= 0) {
      errors.units_per_pallet = 'Units per pallet must be greater than 0'
    }
    if (body.unit_price !== undefined && parseFloat(body.unit_price) <= 0) {
      errors.unit_price = 'Unit price must be greater than 0'
    }

    if (Object.keys(errors).length > 0) {
      return ApiResponseHelper.validationError('Validation failed', errors)
    }
    
    const updatedProduct = await updateProduct(id, body)
    
    if (!updatedProduct) {
      return ApiResponseHelper.internalError('Failed to update product')
    }

    return ApiResponseHelper.success(
      'Product updated successfully',
      { product: updatedProduct }
    )
  } catch (error) {
    console.error('Error updating product:', error)
    return ApiResponseHelper.internalError(
      'Failed to update product',
      error instanceof Error ? error.message : String(error)
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await initializeDatabase()
    
    // Require authentication and admin role
    const authResult = await requireAuth(request)
    if (authResult instanceof Response) {
      return authResult
    }
    const { user } = authResult

    // Only admin can delete products
    if (user.role !== 'admin') {
      return ApiResponseHelper.forbidden('Only admins can delete products')
    }

    const { id } = params
    
    // Validate if product exists
    const existingProduct = await getProductById(id)
    if (!existingProduct) {
      return ApiResponseHelper.notFound('Product not found')
    }
    
    const success = await deleteProduct(id)
    
    if (!success) {
      return ApiResponseHelper.internalError('Failed to delete product')
    }

    return ApiResponseHelper.success('Product deleted successfully')
  } catch (error) {
    console.error('Error deleting product:', error)
    return ApiResponseHelper.internalError(
      'Failed to delete product',
      error instanceof Error ? error.message : String(error)
    )
  }
}