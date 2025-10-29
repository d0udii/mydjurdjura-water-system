/**
 * Global Error Handler Initialization
 * Sets up comprehensive error handling for the entire application
 */

import { initializeErrorHandlers } from '@/lib/error-handling'

// Initialize global error handlers when the module is imported
if (typeof window !== 'undefined') {
  initializeErrorHandlers()
  
  // Additional development-only error handling
  if (process.env.NODE_ENV === 'development') {
    // Log all console errors
    const originalError = console.error
    console.error = (...args) => {
      originalError(...args)
      
      // Store in localStorage for debugging
      try {
        const errorLog = {
          timestamp: new Date().toISOString(),
          type: 'console.error',
          message: args.join(' '),
          stack: new Error().stack
        }
        
        const existingLogs = JSON.parse(localStorage.getItem('console-errors') || '[]')
        existingLogs.push(errorLog)
        
        // Keep only last 50 console errors
        if (existingLogs.length > 50) {
          existingLogs.splice(0, existingLogs.length - 50)
        }
        
        localStorage.setItem('console-errors', JSON.stringify(existingLogs))
      } catch (e) {
        // Ignore localStorage errors
      }
    }
    
    // Log all console warnings
    const originalWarn = console.warn
    console.warn = (...args) => {
      originalWarn(...args)
      
      // Store in localStorage for debugging
      try {
        const warningLog = {
          timestamp: new Date().toISOString(),
          type: 'console.warn',
          message: args.join(' ')
        }
        
        const existingLogs = JSON.parse(localStorage.getItem('console-warnings') || '[]')
        existingLogs.push(warningLog)
        
        // Keep only last 50 console warnings
        if (existingLogs.length > 50) {
          existingLogs.splice(0, existingLogs.length - 50)
        }
        
        localStorage.setItem('console-warnings', JSON.stringify(existingLogs))
      } catch (e) {
        // Ignore localStorage errors
      }
    }
  }
}

export default function ErrorHandlerProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
