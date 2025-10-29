import { createClient } from '@supabase/supabase-js'
import { createBrowserClient } from '@supabase/ssr'

// Fallback values for development when env vars are not set
const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://demo.supabase.co').trim()
const supabaseAnonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRlbW8iLCJyb2xlIjoiYW5vbiIsImlhdCI6MTY0NTQ2NzIwMCwiZXhwIjoxOTYxMDQzMjAwfQ.demo-key').trim().replace(/\r?\n/g, '')

// Only create clients if we have valid URLs
let supabase: any = null
let supabaseAdmin: any = null

if (supabaseUrl && supabaseUrl !== 'https://demo.supabase.co') {
  // Client for browser-side operations
  supabase = createBrowserClient(supabaseUrl, supabaseAnonKey)

  // Admin client for server-side operations (with service role key)
  const serviceRoleKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || 'demo-service-key').trim().replace(/\r?\n/g, '')
  supabaseAdmin = createClient(
    supabaseUrl,
    serviceRoleKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )
} else {
  // Demo mode - create mock clients
  supabase = {
    auth: {
      signInWithPassword: () => Promise.resolve({ data: null, error: null }),
      signOut: () => Promise.resolve({ error: null }),
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } })
    },
    from: () => ({
      select: () => ({ eq: () => Promise.resolve({ data: [], error: null }) }),
      insert: () => ({ select: () => ({ single: () => Promise.resolve({ data: null, error: null }) }) }),
      update: () => ({ eq: () => ({ select: () => ({ single: () => Promise.resolve({ data: null, error: null }) }) }) }),
      delete: () => ({ eq: () => Promise.resolve({ error: null }) })
    }),
    channel: () => ({
      on: () => ({ subscribe: () => ({}) })
    }),
    removeChannel: () => {}
  }

  supabaseAdmin = {
    auth: {
      admin: {
        createUser: () => Promise.resolve({ data: { user: null }, error: null }),
        deleteUser: () => Promise.resolve({ error: null })
      }
    },
    from: () => ({
      select: () => ({ eq: () => ({ order: () => Promise.resolve({ data: [], error: null }) }) }),
      insert: () => ({ select: () => ({ single: () => Promise.resolve({ data: null, error: null }) }) }),
      update: () => ({ eq: () => ({ select: () => ({ single: () => Promise.resolve({ data: null, error: null }) }) }) }),
      delete: () => ({ eq: () => Promise.resolve({ error: null }) })
    })
  }
}

export { supabase, supabaseAdmin }

// Database types
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          name: string
          email: string
          role: 'admin' | 'supervisor' | 'regional_manager' | 'operations'
          region_id?: string
          status: 'active' | 'inactive' | 'pending'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          role: 'admin' | 'supervisor' | 'regional_manager' | 'operations'
          region_id?: string
          status?: 'active' | 'inactive' | 'pending'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          role?: 'admin' | 'supervisor' | 'regional_manager' | 'operations'
          region_id?: string
          status?: 'active' | 'inactive' | 'pending'
          created_at?: string
          updated_at?: string
        }
      }
      regions: {
        Row: {
          id: string
          name: string
          description?: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          created_at?: string
        }
      }
      clients: {
        Row: {
          id: string
          name: string
          phone: string
          address: string
          region_id: string
          contact_person?: string
          status: 'active' | 'inactive'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          phone: string
          address: string
          region_id: string
          contact_person?: string
          status?: 'active' | 'inactive'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          phone?: string
          address?: string
          region_id?: string
          contact_person?: string
          status?: 'active' | 'inactive'
          created_at?: string
          updated_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          client_id: string
          region_id: string
          assigned_to?: string
          status: 'pending' | 'in_progress' | 'delivered' | 'returned' | 'cancelled'
          total_price: number
          delivery_date?: string
          delivery_proof_url?: string
          notes?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          client_id: string
          region_id: string
          assigned_to?: string
          status?: 'pending' | 'in_progress' | 'delivered' | 'returned' | 'cancelled'
          total_price: number
          delivery_date?: string
          delivery_proof_url?: string
          notes?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          client_id?: string
          region_id?: string
          assigned_to?: string
          status?: 'pending' | 'in_progress' | 'delivered' | 'returned' | 'cancelled'
          total_price?: number
          delivery_date?: string
          delivery_proof_url?: string
          notes?: string
          created_at?: string
          updated_at?: string
        }
      }
      products: {
        Row: {
          id: string
          name: string
          volume: string
          units_per_pallet: number
          unit_price: number
          status: 'active' | 'inactive'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          volume: string
          units_per_pallet: number
          unit_price: number
          status?: 'active' | 'inactive'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          volume?: string
          units_per_pallet?: number
          unit_price?: number
          status?: 'active' | 'inactive'
          created_at?: string
          updated_at?: string
        }
      }
      transport_tariffs: {
        Row: {
          id: string
          city: string
          price: number
          driver_type: 'factory' | 'local'
          region_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          city: string
          price: number
          driver_type: 'factory' | 'local'
          region_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          city?: string
          price?: number
          driver_type?: 'factory' | 'local'
          region_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          title: string
          message: string
          type: 'info' | 'warning' | 'success' | 'error'
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          message: string
          type?: 'info' | 'warning' | 'success' | 'error'
          is_read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          message?: string
          type?: 'info' | 'warning' | 'success' | 'error'
          is_read?: boolean
          created_at?: string
        }
      }
      activity_logs: {
        Row: {
          id: string
          user_id: string
          action_type: string
          details: string
          affected_table: string
          affected_record_id?: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          action_type: string
          details: string
          affected_table: string
          affected_record_id?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          action_type?: string
          details?: string
          affected_table?: string
          affected_record_id?: string
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
