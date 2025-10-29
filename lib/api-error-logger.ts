/**
 * Enhanced API Error Logging Utility
 * Ensures no request fails silently - logs all errors comprehensively
 */

import { NextRequest } from 'next/server'
import * as fs from 'fs'
import * as path from 'path'

export interface ErrorLogEntry {
  timestamp: string
  endpoint: string
  method: string
  statusCode: number
  error: {
    message: string
    stack?: string
    name: string
    code?: string
  }
  request: {
    headers?: Record<string, string>
    body?: any
    query?: Record<string, string>
  }
  response?: any
  context?: any
}

class ErrorLogger {
  private static logFile = path.join(process.cwd(), 'logs', 'api-errors.json')
  private static maxLogSize = 10 * 1024 * 1024 // 10MB

  static ensureLogDirectory() {
    const logDir = path.dirname(this.logFile)
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true })
    }
  }

  static async logError(
    request: NextRequest,
    error: Error | any,
    statusCode: number = 500,
    context?: any
  ): Promise<void> {
    try {
      this.ensureLogDirectory()

      const errorEntry: ErrorLogEntry = {
        timestamp: new Date().toISOString(),
        endpoint: request.nextUrl.pathname,
        method: request.method,
        statusCode,
        error: {
          message: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
          name: error instanceof Error ? error.name : 'UnknownError',
          code: error?.code || error?.statusCode || undefined
        },
        request: {
          headers: Object.fromEntries(request.headers.entries()),
          query: Object.fromEntries(request.nextUrl.searchParams.entries())
        },
        context
      }

      // Try to get request body if available
      try {
        const clonedRequest = request.clone()
        const body = await clonedRequest.json()
        errorEntry.request.body = body
      } catch {
        // Body not available or not JSON
      }

      // Read existing logs
      let logs: ErrorLogEntry[] = []
      if (fs.existsSync(this.logFile)) {
        try {
          const logData = fs.readFileSync(this.logFile, 'utf-8')
          logs = JSON.parse(logData)
        } catch {
          logs = []
        }
      }

      // Add new error
      logs.push(errorEntry)

      // Keep only last 1000 entries
      if (logs.length > 1000) {
        logs = logs.slice(-1000)
      }

      // Write to file
      fs.writeFileSync(this.logFile, JSON.stringify(logs, null, 2))

      // Also log to console with full details
      console.error('='.repeat(70))
      console.error('🚨 API ERROR LOGGED')
      console.error('='.repeat(70))
      console.error(`Timestamp: ${errorEntry.timestamp}`)
      console.error(`Endpoint: ${errorEntry.method} ${errorEntry.endpoint}`)
      console.error(`Status Code: ${statusCode}`)
      console.error(`Error: ${errorEntry.error.message}`)
      console.error(`Error Name: ${errorEntry.error.name}`)
      if (errorEntry.error.stack) {
        console.error(`Stack Trace:\n${errorEntry.error.stack}`)
      }
      if (context) {
        console.error(`Context:`, JSON.stringify(context, null, 2))
      }
      console.error('='.repeat(70))
    } catch (logError) {
      // Fallback to console if file logging fails
      console.error('Failed to log error to file:', logError)
      console.error('Original error:', error)
    }
  }

  static async logFailedRequest(
    request: NextRequest,
    response: Response,
    error?: Error | any
  ): Promise<void> {
    if (!response.ok) {
      const statusCode = response.status
      await this.logError(request, error || new Error(`HTTP ${statusCode}`), statusCode, {
        responseStatus: statusCode,
        responseStatusText: response.statusText
      })
    }
  }

  static getRecentErrors(limit: number = 50): ErrorLogEntry[] {
    try {
      this.ensureLogDirectory()

      if (!fs.existsSync(this.logFile)) {
        return []
      }

      const logData = fs.readFileSync(this.logFile, 'utf-8')
      const logs: ErrorLogEntry[] = JSON.parse(logData)

      return logs.slice(-limit).reverse()
    } catch {
      return []
    }
  }

  static clearLogs(): void {
    try {
      this.ensureLogDirectory()
      if (fs.existsSync(this.logFile)) {
        fs.writeFileSync(this.logFile, '[]')
      }
    } catch (error) {
      console.error('Failed to clear logs:', error)
    }
  }

  static getErrorStats(): {
    total: number
    byEndpoint: Record<string, number>
    byStatus: Record<number, number>
    recent24Hours: number
  } {
    try {
      this.ensureLogDirectory()

      if (!fs.existsSync(this.logFile)) {
        return {
          total: 0,
          byEndpoint: {},
          byStatus: {},
          recent24Hours: 0
        }
      }

      const logData = fs.readFileSync(this.logFile, 'utf-8')
      const logs: ErrorLogEntry[] = JSON.parse(logData)

      const stats = {
        total: logs.length,
        byEndpoint: {} as Record<string, number>,
        byStatus: {} as Record<number, number>,
        recent24Hours: 0
      }

      const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000

      logs.forEach(log => {
        // Count by endpoint
        const endpoint = `${log.method} ${log.endpoint}`
        stats.byEndpoint[endpoint] = (stats.byEndpoint[endpoint] || 0) + 1

        // Count by status
        stats.byStatus[log.statusCode] = (stats.byStatus[log.statusCode] || 0) + 1

        // Count recent
        const logTime = new Date(log.timestamp).getTime()
        if (logTime > oneDayAgo) {
          stats.recent24Hours++
        }
      })

      return stats
    } catch {
      return {
        total: 0,
        byEndpoint: {},
        byStatus: {},
        recent24Hours: 0
      }
    }
  }
}

/**
 * Error logging middleware wrapper
 * Wraps API route handlers to automatically log errors
 */
export function withErrorLogging(
  handler: (request: NextRequest, ...args: any[]) => Promise<Response>
) {
  return async (request: NextRequest, ...args: any[]): Promise<Response> => {
    try {
      const response = await handler(request, ...args)

      // Log if response is not OK
      if (!response.ok) {
        const clonedResponse = response.clone()
        let errorData: any
        try {
          errorData = await clonedResponse.json()
        } catch {
          errorData = await clonedResponse.text()
        }

        await ErrorLogger.logError(
          request,
          new Error(errorData.error || errorData.message || `HTTP ${response.status}`),
          response.status,
          { response: errorData }
        )
      }

      return response
    } catch (error) {
      // Log the error
      await ErrorLogger.logError(request, error, 500)

      // Return error response
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Internal server error',
          error: error instanceof Error ? error.message : String(error)
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }
  }
}

export { ErrorLogger }
export default ErrorLogger
