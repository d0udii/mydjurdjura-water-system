import { NextRequest } from 'next/server'
import { getClients, createClient, getRegions } from '@/lib/supabase-db'
import { initializeDatabase } from '@/lib/supabase-db'
import { requireAuth } from '@/lib/api-auth'
import { ApiResponseHelper } from '@/lib/api-response'

export async function GET(request: NextRequest) {
  try {
    await initializeDatabase()
    
    // Require authentication
    const authResult = await requireAuth(request)
    if (authResult instanceof Response) {
      return authResult
    }
    const { user } = authResult

    const { searchParams } = new URL(request.url)
    const region_id = searchParams.get('region_id')

    const clients = await getClients()
    const regions = await getRegions()

    let filteredClients = clients

    // Apply region filter if provided
    if (region_id) {
      filteredClients = clients.filter(client => client.region_id === region_id)
      
      // Regional managers can only see clients in their region
      if (user.role === 'regional_manager' && user.region_id !== region_id) {
        return ApiResponseHelper.forbidden('You can only view clients in your region')
      }
    }

    // Apply role-based filtering
    if (user.role === 'regional_manager' && user.region_id) {
      filteredClients = filteredClients.filter(client => client.region_id === user.region_id)
    }

    return ApiResponseHelper.success(
      'Clients fetched successfully',
      {
        clients: filteredClients,
        regions: regions,
        count: filteredClients.length
      }
    )
  } catch (error) {
    console.error('Error fetching clients:', error)
    return ApiResponseHelper.internalError(
      'Failed to fetch clients',
      error instanceof Error ? error.message : String(error)
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    await initializeDatabase()
    
    // Require authentication and admin/operations/regional_manager role
    const authResult = await requireAuth(request)
    if (authResult instanceof Response) {
      return authResult
    }
    const { user } = authResult

    // Only admin, operations, and regional managers can create clients
    if (!['admin', 'operations', 'regional_manager'].includes(user.role)) {
      return ApiResponseHelper.forbidden('Only admins, operations team, and regional managers can create clients')
    }

    const data = await request.json()
    const {
      name,
      phone,
      address,
      rc_number,
      region_id,
      contact_person
    } = data

    // Validate required fields
    const errors: Record<string, string> = {}
    if (!name || !name.trim()) {
      errors.name = 'Client name is required'
    }
    if (!phone || !phone.trim()) {
      errors.phone = 'Phone number is required'
    }
    if (!address || !address.trim()) {
      errors.address = 'Address is required'
    }
    if (!region_id) {
      errors.region_id = 'Region is required'
    }

    // Regional managers can only create clients in their region
    if (user.role === 'regional_manager' && user.region_id !== region_id) {
      errors.region_id = 'You can only create clients in your region'
    }

    if (Object.keys(errors).length > 0) {
      return ApiResponseHelper.validationError('Validation failed', errors)
    }

    const newClient = await createClient({
      name: name.trim(),
      phone: phone.trim(),
      address: address.trim(),
      rc_number: rc_number || '',
      region_id,
      contact_person: contact_person || '',
      status: 'active'
    })

    if (!newClient) {
      return ApiResponseHelper.internalError('Failed to create client')
    }

    return ApiResponseHelper.created(
      'Client created successfully',
      { client: newClient }
    )
  } catch (error) {
    console.error('Error creating client:', error)
    return ApiResponseHelper.internalError(
      'Failed to create client',
      error instanceof Error ? error.message : String(error)
    )
  }
}