import { NextRequest } from 'next/server'
import { getClientById, updateClient, deleteClient } from '@/lib/supabase-db'
import { initializeDatabase } from '@/lib/supabase-db'
import { requireAuth, canModifyResource } from '@/lib/api-auth'
import { ApiResponseHelper } from '@/lib/api-response'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await initializeDatabase()
    
    // Require authentication
    const authResult = await requireAuth(request)
    if (authResult instanceof Response) {
      return authResult
    }
    const { user } = authResult

    const { id } = await params
    const client = await getClientById(id)
    
    if (!client) {
      return ApiResponseHelper.notFound('Client not found')
    }

    // Check if user can view this client
    if (!canModifyResource(user, undefined, client.region_id)) {
      return ApiResponseHelper.forbidden('You do not have permission to view this client')
    }
    
    return ApiResponseHelper.success(
      'Client fetched successfully',
      { client }
    )
  } catch (error) {
    console.error('Error fetching client:', error)
    return ApiResponseHelper.internalError(
      'Failed to fetch client',
      error instanceof Error ? error.message : String(error)
    )
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await initializeDatabase()
    
    // Require authentication
    const authResult = await requireAuth(request)
    if (authResult instanceof Response) {
      return authResult
    }
    const { user } = authResult

    const { id } = await params
    const data = await request.json()
    
    // Get existing client to check permissions
    const existingClient = await getClientById(id)
    if (!existingClient) {
      return ApiResponseHelper.notFound('Client not found')
    }

    // Check if user can modify this client
    if (!canModifyResource(user, undefined, existingClient.region_id)) {
      return ApiResponseHelper.forbidden('You do not have permission to modify this client')
    }

    // Validate update data
    const errors: Record<string, string> = {}
    if (data.name !== undefined && !data.name.trim()) {
      errors.name = 'Client name cannot be empty'
    }
    if (data.phone !== undefined && !data.phone.trim()) {
      errors.phone = 'Phone number cannot be empty'
    }
    if (data.address !== undefined && !data.address.trim()) {
      errors.address = 'Address cannot be empty'
    }

    // Regional managers can only update clients in their region
    if (data.region_id !== undefined && user.role === 'regional_manager') {
      if (data.region_id !== user.region_id) {
        errors.region_id = 'You can only update clients in your region'
      }
    }

    if (Object.keys(errors).length > 0) {
      return ApiResponseHelper.validationError('Validation failed', errors)
    }
    
    const updatedClient = await updateClient(id, data)
    
    if (!updatedClient) {
      return ApiResponseHelper.internalError('Failed to update client')
    }
    
    return ApiResponseHelper.success(
      'Client updated successfully',
      { client: updatedClient }
    )
  } catch (error) {
    console.error('Error updating client:', error)
    return ApiResponseHelper.internalError(
      'Failed to update client',
      error instanceof Error ? error.message : String(error)
    )
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await initializeDatabase()
    
    // Require authentication and admin role
    const authResult = await requireAuth(request)
    if (authResult instanceof Response) {
      return authResult
    }
    const { user } = authResult

    // Only admin can delete clients
    if (user.role !== 'admin') {
      return ApiResponseHelper.forbidden('Only admins can delete clients')
    }

    const { id } = await params
    
    // Check if client exists
    const existingClient = await getClientById(id)
    if (!existingClient) {
      return ApiResponseHelper.notFound('Client not found')
    }
    
    const success = await deleteClient(id)
    
    if (!success) {
      return ApiResponseHelper.internalError('Failed to delete client')
    }
    
    return ApiResponseHelper.success('Client deleted successfully')
  } catch (error) {
    console.error('Error deleting client:', error)
    return ApiResponseHelper.internalError(
      'Failed to delete client',
      error instanceof Error ? error.message : String(error)
    )
  }
}