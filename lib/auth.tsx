'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

interface AuthUser {
  id: string
  name: string
  email: string
  role: 'admin' | 'supervisor' | 'regional_manager' | 'operations'
  region_id?: string
  status: 'active' | 'inactive' | 'pending'
}

interface AuthContextType {
  user: AuthUser | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  const refreshUser = async () => {
    try {
      // Check if user is already logged in from localStorage
      const savedUser = localStorage.getItem('djurdjura_user')
      if (savedUser) {
        const userData = JSON.parse(savedUser)
        setUser(userData)
      }
      setLoading(false)
    } catch (error) {
      console.error('Error refreshing user:', error)
      setUser(null)
      setLoading(false)
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      // For demo purposes, we'll use a simple password check
      // In production, you should use Supabase Auth properly
      const demoUsers = {
        'admin@djurdjura.dz': { password: 'admin123', role: 'admin', name: 'Admin Djurdjura' },
        'hamouch@djurdjura.dz': { password: 'admin123', role: 'regional_manager', name: 'Hamouch', region_id: '550e8400-e29b-41d4-a716-446655440001' },
        'mahmoud@djurdjura.dz': { password: 'admin123', role: 'supervisor', name: 'Mahmoud Djouadi', region_id: '550e8400-e29b-41d4-a716-446655440001' },
        'operations@djurdjura.dz': { password: 'admin123', role: 'operations', name: 'Operations Team' }
      }

      const user = demoUsers[email as keyof typeof demoUsers]
      
      if (user && user.password === password) {
        // Set demo user data directly (bypassing database for now)
        const userData = {
          id: 'demo-' + email,
          name: user.name,
          email: email,
          role: user.role as any,
          region_id: user.region_id,
          status: 'active' as const
        }
        
        // Save to localStorage for persistence
        localStorage.setItem('djurdjura_user', JSON.stringify(userData))
        setUser(userData)
        return { error: null }
      }

      return { error: 'Invalid email or password' }
    } catch (error) {
      console.error('Sign in error:', error)
      return { error: 'An unexpected error occurred' }
    }
  }

  const signOut = async () => {
    try {
      localStorage.removeItem('djurdjura_user')
      setUser(null)
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  useEffect(() => {
    refreshUser()
  }, [])

  const value = {
    user,
    loading,
    signIn,
    signOut,
    refreshUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Higher-order component for protected routes
export function withAuth<T extends object>(
  Component: React.ComponentType<T>,
  requiredRoles?: ('admin' | 'supervisor' | 'regional_manager' | 'operations')[]
) {
  return function AuthenticatedComponent(props: T) {
    const { user, loading } = useAuth()

    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      )
    }

    if (!user) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
            <p className="text-gray-600">Please log in to access this page.</p>
          </div>
        </div>
      )
    }

    if (requiredRoles && !requiredRoles.includes(user.role)) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
            <p className="text-gray-600">You don't have permission to access this page.</p>
          </div>
        </div>
      )
    }

    return <Component {...props} />
  }
}
