/**
 * Standardized API Response Utility
 * Provides consistent response format for all API routes
 */

import { NextResponse } from 'next/server'

export interface ApiResponse<T = any> {
  success: boolean
  message: string
  data?: T
  error?: string
  errors?: Record<string, string>
}

export class ApiResponseHelper {
  /**
   * Success response with data
   */
  static success<T>(
    message: string,
    data?: T,
    status: number = 200
  ): NextResponse<ApiResponse<T>> {
    return NextResponse.json(
      {
        success: true,
        message,
        ...(data && { data })
      },
      { status }
    )
  }

  /**
   * Created response (201)
   */
  static created<T>(
    message: string,
    data?: T
  ): NextResponse<ApiResponse<T>> {
    return NextResponse.json(
      {
        success: true,
        message,
        ...(data && { data })
      },
      { status: 201 }
    )
  }

  /**
   * Error response
   */
  static error(
    message: string,
    status: number = 500,
    error?: string | Error,
    errors?: Record<string, string>
  ): NextResponse<ApiResponse> {
    const errorMessage = error instanceof Error ? error.message : error
    
    return NextResponse.json(
      {
        success: false,
        message,
        ...(errorMessage && { error: errorMessage }),
        ...(errors && { errors })
      },
      { status }
    )
  }

  /**
   * Bad request (400)
   */
  static badRequest(
    message: string,
    errors?: Record<string, string>
  ): NextResponse<ApiResponse> {
    return this.error(message, 400, undefined, errors)
  }

  /**
   * Unauthorized (401)
   */
  static unauthorized(message: string = 'Unauthorized'): NextResponse<ApiResponse> {
    return this.error(message, 401)
  }

  /**
   * Forbidden (403)
   */
  static forbidden(message: string = 'Forbidden'): NextResponse<ApiResponse> {
    return this.error(message, 403)
  }

  /**
   * Not found (404)
   */
  static notFound(message: string = 'Resource not found'): NextResponse<ApiResponse> {
    return this.error(message, 404)
  }

  /**
   * Conflict (409)
   */
  static conflict(message: string = 'Resource conflict'): NextResponse<ApiResponse> {
    return this.error(message, 409)
  }

  /**
   * Internal server error (500)
   */
  static internalError(
    message: string = 'Internal server error',
    error?: string | Error
  ): NextResponse<ApiResponse> {
    return this.error(message, 500, error)
  }

  /**
   * Validation error (422)
   */
  static validationError(
    message: string = 'Validation failed',
    errors: Record<string, string>
  ): NextResponse<ApiResponse> {
    return this.error(message, 422, undefined, errors)
  }
}
