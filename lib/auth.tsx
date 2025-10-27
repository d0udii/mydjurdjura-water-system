'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
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
      const { data: { user: authUser } } = await supabase.auth.getUser()
      
      if (authUser) {
        // Get user details from our users table
        const { data: userData, error } = await supabase
          .from('users')
          .select('*')
          .eq('email', authUser.email)
          .single()

        if (error) {
          console.error('Error fetching user data:', error)
          setUser(null)
        } else {
          setUser(userData)
        }
      } else {
        setUser(null)
      }
    } catch (error) {
      console.error('Error refreshing user:', error)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      // Demo mode - check against hardcoded credentials
      const demoUsers = {
        'admin@djurdjura.dz': { password: 'admin123', role: 'admin', name: 'Admin Djurdjura' },
        'hamouch@djurdjura.dz': { password: 'chef123', role: 'regional_manager', name: 'Hamouch', region_id: '550e8400-e29b-41d4-a716-446655440001' },
        'mahmoud@djurdjura.dz': { password: 'supervisor123', role: 'supervisor', name: 'Mahmoud Djouadi', region_id: '550e8400-e29b-41d4-a716-446655440001' },
        'operations@djurdjura.dz': { password: 'operations123', role: 'operations', name: 'Operations Team' }
      }

      const user = demoUsers[email as keyof typeof demoUsers]
      
      if (user && user.password === password) {
        // Set demo user data
        setUser({
          id: 'demo-' + email,
          name: user.name,
          email: email,
          role: user.role as any,
          region_id: user.region_id,
          status: 'active'
        })
        return { error: null }
      }

      return { error: 'Invalid email or password' }
    } catch (error) {
      return { error: 'An unexpected error occurred' }
    }
  }

  const signOut = async () => {
    try {
      setUser(null)
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  useEffect(() => {
    // Demo mode - just set loading to false
    setLoading(false)
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
