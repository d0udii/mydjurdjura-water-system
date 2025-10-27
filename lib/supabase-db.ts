import { supabase } from '@/lib/supabase'

// Database interfaces
export interface User {
  id: string
  name: string
  email: string
  password_hash: string
  role: "admin" | "regional_manager" | "supervisor" | "operations"
  region_id?: string
  status: "active" | "inactive" | "pending"
  created_at: string
  updated_at: string
}

export interface Region {
  id: string
  name: string
  description?: string
  created_at: string
}

export interface Client {
  id: string
  name: string
  phone: string
  address: string
  region_id: string
  contact_person?: string
  rc_number?: string
  status: string
  created_at: string
  updated_at: string
}

export interface Product {
  id: string
  name: string
  volume: string
  units_per_pallet: number
  unit_price: number
  status: string
  created_at: string
  updated_at: string
}

export interface TransportTariff {
  id: string
  city: string
  price: number
  driver_type: "factory" | "local"
  region_id: string
  created_at: string
  updated_at: string
}

export interface Order {
  id: string
  client_id: string
  region_id: string
  assigned_to?: string
  status: "pending" | "in_progress" | "delivered" | "returned" | "cancelled"
  total_price: number
  product_5_5L_pallets?: number
  product_1_5L_pallets?: number
  truck_type?: string
  truck_capacity?: number
  delivery_date?: string
  delivery_proof_url?: string
  notes?: string
  created_at: string
  updated_at: string
  clients?: Client
  regions?: Region
}

export interface Notification {
  id: string
  user_id: string
  title: string
  message: string
  type: "info" | "warning" | "success" | "error"
  is_read: boolean
  created_at: string
}

export interface ActivityLog {
  id: string
  user_id: string
  action_type: string
  details: string
  affected_table: string
  affected_record_id?: string
  created_at: string
}

// Database functions using Supabase
export async function getUsers(): Promise<User[]> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching users:', error)
    return []
  }
}

export async function getUserById(id: string): Promise<User | null> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error fetching user:', error)
    return null
  }
}

export async function createUser(user: Omit<User, 'id' | 'created_at' | 'updated_at'>): Promise<User | null> {
  try {
    const { data, error } = await supabase
      .from('users')
      .insert([user])
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error creating user:', error)
    return null
  }
}

export async function updateUser(id: string, updates: Partial<User>): Promise<User | null> {
  try {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error updating user:', error)
    return null
  }
}

export async function deleteUser(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id)

    if (error) throw error
    return true
  } catch (error) {
    console.error('Error deleting user:', error)
    return false
  }
}

export async function getRegions(): Promise<Region[]> {
  try {
    const { data, error } = await supabase
      .from('regions')
      .select('*')
      .order('name')

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching regions:', error)
    return []
  }
}

export async function getClients(): Promise<Client[]> {
  try {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching clients:', error)
    return []
  }
}

export async function getClientById(id: string): Promise<Client | null> {
  try {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error fetching client:', error)
    return null
  }
}

export async function createClient(client: Omit<Client, 'id' | 'created_at' | 'updated_at'>): Promise<Client | null> {
  try {
    const { data, error } = await supabase
      .from('clients')
      .insert([client])
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error creating client:', error)
    return null
  }
}

export async function updateClient(id: string, updates: Partial<Client>): Promise<Client | null> {
  try {
    const { data, error } = await supabase
      .from('clients')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error updating client:', error)
    return null
  }
}

export async function deleteClient(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('clients')
      .delete()
      .eq('id', id)

    if (error) throw error
    return true
  } catch (error) {
    console.error('Error deleting client:', error)
    return false
  }
}

export async function getProducts(): Promise<Product[]> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('name')

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching products:', error)
    return []
  }
}

export async function getTransportTariffs(): Promise<TransportTariff[]> {
  try {
    const { data, error } = await supabase
      .from('transport_tariffs')
      .select('*')
      .order('city')

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching transport tariffs:', error)
    return []
  }
}

export async function getOrders(): Promise<Order[]> {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        clients:client_id(*),
        regions:region_id(*)
      `)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching orders:', error)
    return []
  }
}

export async function getOrderById(id: string): Promise<Order | null> {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        clients:client_id(*),
        regions:region_id(*)
      `)
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error fetching order:', error)
    return null
  }
}

export async function createOrder(order: Omit<Order, 'id' | 'created_at' | 'updated_at'>): Promise<Order | null> {
  try {
    const { data, error } = await supabase
      .from('orders')
      .insert([order])
      .select(`
        *,
        clients:client_id(*),
        regions:region_id(*)
      `)
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error creating order:', error)
    return null
  }
}

export async function updateOrder(id: string, updates: Partial<Order>): Promise<Order | null> {
  try {
    const { data, error } = await supabase
      .from('orders')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        clients:client_id(*),
        regions:region_id(*)
      `)
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error updating order:', error)
    return null
  }
}

export async function deleteOrder(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('orders')
      .delete()
      .eq('id', id)

    if (error) throw error
    return true
  } catch (error) {
    console.error('Error deleting order:', error)
    return false
  }
}

export async function getNotifications(userId?: string): Promise<Notification[]> {
  try {
    let query = supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })

    if (userId) {
      query = query.eq('user_id', userId)
    }

    const { data, error } = await query

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching notifications:', error)
    return []
  }
}

export async function createNotification(notification: Omit<Notification, 'id' | 'created_at'>): Promise<Notification | null> {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .insert([notification])
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error creating notification:', error)
    return null
  }
}

export async function markNotificationAsRead(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id)

    if (error) throw error
    return true
  } catch (error) {
    console.error('Error marking notification as read:', error)
    return false
  }
}

export async function getActivityLogs(): Promise<ActivityLog[]> {
  try {
    const { data, error } = await supabase
      .from('activity_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100)

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching activity logs:', error)
    return []
  }
}

export async function createActivityLog(log: Omit<ActivityLog, 'id' | 'created_at'>): Promise<ActivityLog | null> {
  try {
    const { data, error } = await supabase
      .from('activity_logs')
      .insert([log])
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error creating activity log:', error)
    return null
  }
}

// Helper function to get transport cost for a region
export async function getTransportCostForRegion(regionId: string): Promise<number> {
  try {
    const { data, error } = await supabase
      .from('transport_tariffs')
      .select('price')
      .eq('region_id', regionId)
      .eq('driver_type', 'factory')
      .limit(1)

    if (error) throw error
    return data?.[0]?.price || 0
  } catch (error) {
    console.error('Error fetching transport cost:', error)
    return 0
  }
}

// Initialize database - this will be called when the app starts
export async function initializeDatabase(): Promise<void> {
  try {
    // Test database connection
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1)

    if (error) {
      console.error('Database connection failed:', error)
      throw new Error('Failed to connect to database')
    }

    console.log('✅ Database connected successfully')
  } catch (error) {
    console.error('❌ Database initialization failed:', error)
    throw error
  }
}
