import { NextRequest } from 'next/server'
import { getProducts, createProduct } from '@/lib/supabase-db'
import { initializeDatabase } from '@/lib/supabase-db'
import { requireAuth, AuthenticatedUser } from '@/lib/api-auth'
import { ApiResponseHelper } from '@/lib/api-response'
import { ErrorLogger } from '@/lib/api-error-logger'

export async function GET(request: NextRequest) {
  try {
    await initializeDatabase()
    
    // Require authentication
    const authResult = await requireAuth(request)
    if (authResult instanceof Response) {
      return authResult
    }
    const { user } = authResult

    const products = await getProducts()
    
    return ApiResponseHelper.success(
      'Products fetched successfully',
      { products, count: products.length }
    )
  } catch (error) {
    // Log error - no request fails silently
    await ErrorLogger.logError(request, error, 500, {
      operation: 'GET /api/products',
      user: user?.id
    })
    
    console.error('Error fetching products:', error)
    return ApiResponseHelper.internalError(
      'Failed to fetch products',
      error instanceof Error ? error.message : String(error)
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    await initializeDatabase()
    
    // Require authentication and admin/operations role
    const authResult = await requireAuth(request)
    if (authResult instanceof Response) {
      return authResult
    }
    const { user } = authResult

    // Only admin and operations can create products
    if (user.role !== 'admin' && user.role !== 'operations') {
      return ApiResponseHelper.forbidden('Only admins and operations team can create products')
    }

    const data = await request.json()
    
    // Validate required fields
    const errors: Record<string, string> = {}
    if (!data.name || !data.name.trim()) {
      errors.name = 'Product name is required'
    }
    if (!data.volume || !data.volume.trim()) {
      errors.volume = 'Volume is required'
    }
    if (!data.units_per_pallet || parseInt(data.units_per_pallet) <= 0) {
      errors.units_per_pallet = 'Units per pallet must be greater than 0'
    }
    if (!data.unit_price || parseFloat(data.unit_price) <= 0) {
      errors.unit_price = 'Unit price must be greater than 0'
    }

    if (Object.keys(errors).length > 0) {
      return ApiResponseHelper.validationError('Validation failed', errors)
    }

    const product = await createProduct({
      name: data.name.trim(),
      volume: data.volume.trim(),
      units_per_pallet: parseInt(data.units_per_pallet),
      unit_price: parseFloat(data.unit_price),
      status: data.status || 'active'
    })

    if (!product) {
      return ApiResponseHelper.internalError('Failed to create product')
    }

    return ApiResponseHelper.created(
      'Product created successfully',
      { product }
    )
  } catch (error) {
    // Log error - no request fails silently
    await ErrorLogger.logError(request, error, 500, {
      operation: 'POST /api/products',
      user: user?.id,
      requestData: data
    })
    
    console.error('Error creating product:', error)
    return ApiResponseHelper.internalError(
      'Failed to create product',
      error instanceof Error ? error.message : String(error)
    )
  }
}