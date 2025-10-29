/**
 * Authentication and Authorization Middleware
 * Validates user authentication and role-based permissions
 */

import { NextRequest, NextResponse } from 'next/server'
import { ApiResponseHelper } from './api-response'
import { supabaseAdmin } from './supabase'

export interface AuthenticatedUser {
  id: string
  email: string
  role: 'admin' | 'supervisor' | 'regional_manager' | 'operations'
  region_id?: string
  status: 'active' | 'inactive' | 'pending'
}

export interface AuthResult {
  user: AuthenticatedUser | null
  error: string | null
}

/**
 * Get authenticated user from request headers
 */
export async function getAuthenticatedUser(request: NextRequest): Promise<AuthResult> {
  try {
    // Get auth token from headers
    const authHeader = request.headers.get('authorization')
    const sessionToken = authHeader?.replace('Bearer ', '') || 
                         request.cookies.get('session_token')?.value ||
                         request.headers.get('x-session-token')

    if (!sessionToken) {
      return {
        user: null,
        error: 'No authentication token provided'
      }
    }

    // For now, we'll use a simple session-based approach
    // In production, you should verify JWT tokens with Supabase
    // This is a placeholder - you should implement proper JWT verification
    
    // Check if user is logged in via cookie/session
    // This would typically involve verifying the session token with Supabase
    // const { data: { user }, error } = await supabase.auth.getUser(sessionToken)
    
    // For demo purposes, we'll extract user info from custom headers
    // In production, use Supabase Auth properly
    const userId = request.headers.get('x-user-id')
    const userEmail = request.headers.get('x-user-email')
    const userRole = request.headers.get('x-user-role') as AuthenticatedUser['role']
    const userRegionId = request.headers.get('x-user-region-id')
    const userStatus = request.headers.get('x-user-status') as AuthenticatedUser['status']

    if (!userId || !userEmail || !userRole) {
      return {
        user: null,
        error: 'Invalid authentication token'
      }
    }

    // Fetch user from database to verify they exist and are active
    const { data: user, error: dbError } = await supabaseAdmin
      .from('users')
      .select('id, email, role, region_id, status')
      .eq('id', userId)
      .eq('email', userEmail)
      .single()

    if (dbError || !user) {
      return {
        user: null,
        error: 'User not found or invalid'
      }
    }

    if (user.status !== 'active') {
      return {
        user: null,
        error: 'User account is not active'
      }
    }

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        region_id: user.region_id || undefined,
        status: user.status
      },
      error: null
    }
  } catch (error) {
    console.error('Error getting authenticated user:', error)
    return {
      user: null,
      error: 'Authentication error'
    }
  }
}

/**
 * Require authentication middleware
 */
export async function requireAuth(request: NextRequest): Promise<{ user: AuthenticatedUser } | NextResponse> {
  const { user, error } = await getAuthenticatedUser(request)

  if (!user || error) {
    return ApiResponseHelper.unauthorized(error || 'Authentication required')
  }

  return { user }
}

/**
 * Require specific role middleware
 */
export async function requireRole(
  request: NextRequest,
  allowedRoles: AuthenticatedUser['role'][]
): Promise<{ user: AuthenticatedUser } | NextResponse> {
  const authResult = await requireAuth(request)
  
  if (authResult instanceof NextResponse) {
    return authResult
  }

  const { user } = authResult

  if (!allowedRoles.includes(user.role)) {
    return ApiResponseHelper.forbidden(
      `Access denied. Required roles: ${allowedRoles.join(', ')}`
    )
  }

  return { user }
}

/**
 * Require admin role middleware
 */
export async function requireAdmin(request: NextRequest): Promise<{ user: AuthenticatedUser } | NextResponse> {
  return requireRole(request, ['admin'])
}

/**
 * Check if user can modify resource
 * Supervisors can only modify their own data
 * Regional managers can modify data in their region
 * Admins can modify everything
 */
export function canModifyResource(
  user: AuthenticatedUser,
  resourceUserId?: string,
  resourceRegionId?: string
): boolean {
  // Admin can modify everything
  if (user.role === 'admin') {
    return true
  }

  // Operations team can modify everything
  if (user.role === 'operations') {
    return true
  }

  // Regional managers can modify resources in their region
  if (user.role === 'regional_manager') {
    return resourceRegionId === user.region_id
  }

  // Supervisors can only modify their own resources
  if (user.role === 'supervisor') {
    return resourceUserId === user.id
  }

  return false
}

/**
 * Check if user can view resource
 */
export function canViewResource(
  user: AuthenticatedUser,
  resourceUserId?: string,
  resourceRegionId?: string
): boolean {
  // Admin and operations can view everything
  if (user.role === 'admin' || user.role === 'operations') {
    return true
  }

  // Regional managers can view resources in their region
  if (user.role === 'regional_manager') {
    return resourceRegionId === user.region_id
  }

  // Supervisors can view their own resources
  if (user.role === 'supervisor') {
    return resourceUserId === user.id
  }

  return false
}
