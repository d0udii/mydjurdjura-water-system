"use client"

import React from 'react'
import { useAuth } from '@/lib/auth'
import { Sidebar } from '@/components/sidebar'

interface ConditionalLayoutProps {
  children: React.ReactNode
}

export function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) {
    // Show login page without sidebar
    return <main className="min-h-screen">{children}</main>
  }

  // Show sidebar and main content when logged in
  return (
    <>
      <Sidebar />
      <main className="md:ml-64">{children}</main>
    </>
  )
}
