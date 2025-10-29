/**
 * Error Handling and Logging System
 * Provides comprehensive error handling, logging, and debugging for all CRUD operations
 */

export interface ErrorLog {
  timestamp: string
  operation: string
  entity: string
  error: any
  context?: any
  userId?: string
}

export interface ApiCallLog {
  timestamp: string
  method: string
  endpoint: string
  status: 'success' | 'error'
  duration?: number
  error?: any
  userId?: string
}

class ErrorLogger {
  private logs: ErrorLog[] = []
  private apiLogs: ApiCallLog[] = []

  // Log errors with context
  logError(operation: string, entity: string, error: any, context?: any, userId?: string) {
    const errorLog: ErrorLog = {
    timestamp: new Date().toISOString(),
      operation,
      entity,
      error: this.sanitizeError(error),
      context,
      userId
    }

    this.logs.push(errorLog)
    
    // Console logging for debugging
    console.group(`🚨 ERROR: ${operation} ${entity}`)
    console.error('Error:', error)
    console.error('Context:', context)
    console.error('Timestamp:', errorLog.timestamp)
    console.error('User ID:', userId)
    console.groupEnd()

    // Store in localStorage for debugging (development only)
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
      try {
        const existingLogs = JSON.parse(localStorage.getItem('error-logs') || '[]')
        existingLogs.push(errorLog)
        // Keep only last 100 logs
        if (existingLogs.length > 100) {
          existingLogs.splice(0, existingLogs.length - 100)
        }
        localStorage.setItem('error-logs', JSON.stringify(existingLogs))
      } catch (e) {
        console.warn('Failed to store error log in localStorage:', e)
      }
    }
  }

  // Log API calls
  logApiCall(method: string, endpoint: string, status: 'success' | 'error', duration?: number, error?: any, userId?: string) {
    const apiLog: ApiCallLog = {
      timestamp: new Date().toISOString(),
      method,
      endpoint,
      status,
      duration,
      error: error ? this.sanitizeError(error) : undefined,
      userId
    }

    this.apiLogs.push(apiLog)

    if (status === 'error') {
      console.group(`🌐 API ERROR: ${method} ${endpoint}`)
      console.error('Error:', error)
      console.error('Duration:', duration)
      console.error('Timestamp:', apiLog.timestamp)
      console.error('User ID:', userId)
      console.groupEnd()
    } else {
      console.log(`🌐 API SUCCESS: ${method} ${endpoint} (${duration}ms)`)
    }

    // Store in localStorage for debugging (development only)
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
      try {
        const existingLogs = JSON.parse(localStorage.getItem('api-logs') || '[]')
        existingLogs.push(apiLog)
        // Keep only last 200 logs
        if (existingLogs.length > 200) {
          existingLogs.splice(0, existingLogs.length - 200)
        }
        localStorage.setItem('api-logs', JSON.stringify(existingLogs))
      } catch (e) {
        console.warn('Failed to store API log in localStorage:', e)
      }
    }
  }

  // Sanitize error objects for logging
  private sanitizeError(error: any): any {
    if (error instanceof Error) {
      return {
        name: error.name,
        message: error.message,
        stack: error.stack
      }
    }
    
    if (typeof error === 'object' && error !== null) {
      // Remove sensitive data
      const sanitized = { ...error }
      delete sanitized.password
      delete sanitized.token
      delete sanitized.key
      delete sanitized.secret
      return sanitized
    }
    
    return error
  }

  // Get error logs
  getErrorLogs(): ErrorLog[] {
    return [...this.logs]
  }

  // Get API logs
  getApiLogs(): ApiCallLog[] {
    return [...this.apiLogs]
  }

  // Clear logs
  clearLogs() {
    this.logs = []
    this.apiLogs = []
    if (typeof window !== 'undefined') {
      localStorage.removeItem('error-logs')
      localStorage.removeItem('api-logs')
    }
  }

  // Export logs for debugging
  exportLogs() {
    return {
      errorLogs: this.logs,
      apiLogs: this.apiLogs,
      exportedAt: new Date().toISOString()
    }
  }
}

// Global error logger instance
export const errorLogger = new ErrorLogger()

// Utility functions for common error patterns
export const logSupabaseError = (operation: string, entity: string, error: any, context?: any, userId?: string) => {
  errorLogger.logError(operation, entity, error, context, userId)
}

export const logApiError = (method: string, endpoint: string, error: any, duration?: number, userId?: string) => {
  errorLogger.logApiCall(method, endpoint, 'error', duration, error, userId)
}

export const logApiSuccess = (method: string, endpoint: string, duration?: number, userId?: string) => {
  errorLogger.logApiCall(method, endpoint, 'success', duration, userId)
}

// Error handling wrapper for async operations
export const withErrorHandling = async <T>(
  operation: () => Promise<T>,
  operationName: string,
  entity: string,
  userId?: string
): Promise<T | null> => {
  try {
    const result = await operation()
    return result
  } catch (error) {
    logSupabaseError(operationName, entity, error, undefined, userId)
    return null
  }
}

// API call wrapper with logging
export const withApiLogging = async <T>(
  apiCall: () => Promise<T>,
  method: string,
  endpoint: string,
  userId?: string
): Promise<T | null> => {
  const startTime = Date.now()
  
  try {
    const result = await apiCall()
    const duration = Date.now() - startTime
    logApiSuccess(method, endpoint, duration, userId)
    return result
  } catch (error) {
    const duration = Date.now() - startTime
    logApiError(method, endpoint, error, duration, userId)
    return null
  }
}

// Specific error handlers for different operations
export const handleCreateError = (entity: string, error: any, context?: any, userId?: string) => {
  logSupabaseError('CREATE', entity, error, context, userId)
}

export const handleReadError = (entity: string, error: any, context?: any, userId?: string) => {
  logSupabaseError('READ', entity, error, context, userId)
}

export const handleUpdateError = (entity: string, error: any, context?: any, userId?: string) => {
  logSupabaseError('UPDATE', entity, error, context, userId)
}

export const handleDeleteError = (entity: string, error: any, context?: any, userId?: string) => {
  logSupabaseError('DELETE', entity, error, context, userId)
}

// Promise rejection handler
export const handlePromiseRejection = (reason: any, promise: Promise<any>) => {
  console.group('🚨 UNHANDLED PROMISE REJECTION')
  console.error('Reason:', reason)
  console.error('Promise:', promise)
  console.error('Timestamp:', new Date().toISOString())
  console.groupEnd()
  
  // Log to error logger
  errorLogger.logError('PROMISE_REJECTION', 'UNKNOWN', reason, { promise })
}

// Global error handler
export const handleGlobalError = (event: ErrorEvent) => {
  console.group('🚨 GLOBAL ERROR')
  console.error('Message:', event.message)
  console.error('Filename:', event.filename)
  console.error('Line:', event.lineno)
  console.error('Column:', event.colno)
  console.error('Error:', event.error)
  console.error('Timestamp:', new Date().toISOString())
  console.groupEnd()
  
  // Log to error logger
  errorLogger.logError('GLOBAL_ERROR', 'APPLICATION', event.error, {
    message: event.message,
    filename: event.filename,
    line: event.lineno,
    column: event.colno
  })
}

// Initialize global error handlers
export const initializeErrorHandlers = () => {
  if (typeof window !== 'undefined') {
    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      handlePromiseRejection(event.reason, event.promise)
    })

    // Handle global errors
    window.addEventListener('error', handleGlobalError)
  }
}

// Debug utilities
export const getDebugInfo = () => {
  return {
    errorLogs: errorLogger.getErrorLogs(),
    apiLogs: errorLogger.getApiLogs(),
    localStorage: typeof window !== 'undefined' ? {
      errorLogs: JSON.parse(localStorage.getItem('error-logs') || '[]'),
      apiLogs: JSON.parse(localStorage.getItem('api-logs') || '[]')
    } : null
  }
}

export const clearDebugLogs = () => {
  errorLogger.clearLogs()
  console.log('🧹 Debug logs cleared')
}