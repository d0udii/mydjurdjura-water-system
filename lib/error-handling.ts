/**
 * Global Error Handling Utilities
 * Provides consistent error handling across all pages
 */

export interface ErrorInfo {
  message: string
  code?: string
  details?: any
  timestamp: string
  userAction?: string
}

export class AppError extends Error {
  public code: string
  public details?: any
  public userAction?: string

  constructor(message: string, code: string = 'UNKNOWN_ERROR', details?: any, userAction?: string) {
    super(message)
    this.name = 'AppError'
    this.code = code
    this.details = details
    this.userAction = userAction
  }
}

export const ErrorCodes = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR: 'AUTHORIZATION_ERROR',
  NOT_FOUND_ERROR: 'NOT_FOUND_ERROR',
  SERVER_ERROR: 'SERVER_ERROR',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',
  DATA_CORRUPTION_ERROR: 'DATA_CORRUPTION_ERROR'
} as const

export function createErrorInfo(error: any, userAction?: string): ErrorInfo {
  return {
    message: error.message || 'An unknown error occurred',
    code: error.code || ErrorCodes.SERVER_ERROR,
    details: error.details || null,
    timestamp: new Date().toISOString(),
    userAction
  }
}

export function handleApiError(response: Response, userAction?: string): AppError {
  if (response.status >= 500) {
    return new AppError(
      'Server error occurred. Please try again later.',
      ErrorCodes.SERVER_ERROR,
      { status: response.status },
      userAction
    )
  }
  
  if (response.status === 404) {
    return new AppError(
      'Resource not found.',
      ErrorCodes.NOT_FOUND_ERROR,
      { status: response.status },
      userAction
    )
  }
  
  if (response.status === 401) {
    return new AppError(
      'Authentication required. Please log in.',
      ErrorCodes.AUTHENTICATION_ERROR,
      { status: response.status },
      userAction
    )
  }
  
  if (response.status === 403) {
    return new AppError(
      'Access denied. You do not have permission to perform this action.',
      ErrorCodes.AUTHORIZATION_ERROR,
      { status: response.status },
      userAction
    )
  }
  
  if (response.status >= 400) {
    return new AppError(
      'Request failed. Please check your input and try again.',
      ErrorCodes.VALIDATION_ERROR,
      { status: response.status },
      userAction
    )
  }
  
  return new AppError(
    'An unexpected error occurred.',
    ErrorCodes.SERVER_ERROR,
    { status: response.status },
    userAction
  )
}

export async function safeApiCall<T>(
  apiCall: () => Promise<Response>,
  userAction?: string
): Promise<{ data?: T; error?: AppError }> {
  try {
    const response = await apiCall()
    
    if (!response.ok) {
      const error = handleApiError(response, userAction)
      return { error }
    }
    
    const data = await response.json()
    return { data }
  } catch (error) {
    if (error instanceof AppError) {
      return { error }
    }
    
    // Network or other errors
    const appError = new AppError(
      'Network error. Please check your connection and try again.',
      ErrorCodes.NETWORK_ERROR,
      error,
      userAction
    )
    
    return { error: appError }
  }
}

export function showErrorToast(error: AppError) {
  // This would integrate with your toast notification system
  console.error('Error:', error.message, error.details)
  
  // You can customize this based on error type
  switch (error.code) {
    case ErrorCodes.NETWORK_ERROR:
      return 'Network error. Please check your connection.'
    case ErrorCodes.AUTHENTICATION_ERROR:
      return 'Please log in to continue.'
    case ErrorCodes.AUTHORIZATION_ERROR:
      return 'You do not have permission to perform this action.'
    case ErrorCodes.VALIDATION_ERROR:
      return 'Please check your input and try again.'
    case ErrorCodes.NOT_FOUND_ERROR:
      return 'The requested resource was not found.'
    case ErrorCodes.SERVER_ERROR:
      return 'Server error. Please try again later.'
    default:
      return error.message || 'An unexpected error occurred.'
  }
}

export function logError(error: AppError, context?: string) {
  const errorInfo = createErrorInfo(error, context)
  
  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.error('Error logged:', errorInfo)
  }
  
  // In production, you might want to send this to an error tracking service
  // like Sentry, LogRocket, etc.
  
  return errorInfo
}

export function validateRequiredFields(data: any, requiredFields: string[]): string[] {
  const missingFields = requiredFields.filter(field => {
    const value = data[field]
    return !value || (typeof value === 'string' && value.trim() === '')
  })
  
  return missingFields
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function validatePhone(phone: string): boolean {
  const phoneRegex = /^[\+]?[0-9\s\-\(\)]+$/
  return phoneRegex.test(phone)
}

export function validatePositiveNumber(value: any): boolean {
  return typeof value === 'number' && value > 0
}

export function validateNonNegativeNumber(value: any): boolean {
  return typeof value === 'number' && value >= 0
}

export function sanitizeInput(input: string): string {
  return input.trim().replace(/[<>]/g, '')
}

export function createRetryableApiCall<T>(
  apiCall: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  return new Promise(async (resolve, reject) => {
    let lastError: any
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const result = await apiCall()
        resolve(result)
        return
      } catch (error) {
        lastError = error
        
        if (attempt < maxRetries) {
          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, attempt)))
        }
      }
    }
    
    reject(lastError)
  })
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}
