"use client"

import React from 'react'
import { useAuth } from '@/lib/auth.tsx'
import { Sidebar } from '@/components/sidebar'
import { usePathname } from 'next/navigation'

interface ConditionalLayoutProps {
  children: React.ReactNode
}

export function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const { user, loading } = useAuth()
  const pathname = usePathname()

  // If loading, show loading spinner
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Loading...</h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Please wait</p>
          </div>
        </div>
      </div>
    )
  }

  // If on login page, always show without sidebar
  if (pathname === '/') {
    return <main className="min-h-screen">{children}</main>
  }

  // If logged in, show sidebar and main content
  if (user) {
    return (
      <>
        <Sidebar />
        <main className="md:ml-64 min-h-screen">{children}</main>
      </>
    )
  }

  // If not logged in and not on login page, show access denied
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Access Denied</h1>
        <p className="text-gray-600 dark:text-gray-400">Please log in to access this page.</p>
        <a 
          href="/" 
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Go to Login
        </a>
      </div>
    </main>
  )
}
