"use client"

import React, { useEffect } from 'react'
import { ErrorBoundary } from '@/components/error-boundary'

interface ClientErrorBoundaryProps {
  children: React.ReactNode
}

export function ClientErrorBoundary({ children }: ClientErrorBoundaryProps) {
  useEffect(() => {
    // Setup error handling for client-side only
    const handleError = (event: ErrorEvent) => {
      console.error('Client-side error:', event.error)
    }

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('Unhandled promise rejection:', event.reason)
    }

    window.addEventListener('error', handleError)
    window.addEventListener('unhandledrejection', handleUnhandledRejection)

    return () => {
      window.removeEventListener('error', handleError)
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
    }
  }, [])

  return (
    <ErrorBoundary>
      {children}
    </ErrorBoundary>
  )
}
