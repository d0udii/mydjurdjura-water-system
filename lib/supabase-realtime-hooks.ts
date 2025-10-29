/**
 * Supabase Realtime with React Query
 * Provides real-time subscriptions and caching consistency
 */

'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useEffect } from 'react'
import { 
  showClientSuccessToast, 
  showClientErrorToast,
  showOrderSuccessToast,
  showOrderErrorToast,
  showBLNumberSuccessToast,
  showBLNumberErrorToast,
  showProductSuccessToast,
  showProductErrorToast,
  showTransportTariffSuccessToast,
  showTransportTariffErrorToast,
  showFetchErrorToast,
  showLoadingToast,
  dismissToast
} from '@/lib/toast-notifications'
import { 
  withErrorHandling, 
  logSupabaseError
} from '@/lib/error-handling'

// Query keys for cache management
export const queryKeys = {
  orders: ['orders'] as const,
  clients: ['clients'] as const,
  blNumbers: ['blNumbers'] as const,
  transportTariffs: ['transportTariffs'] as const,
  products: ['products'] as const,
  users: ['users'] as const,
  regions: ['regions'] as const,
  goals: ['goals'] as const,
  notifications: (userId?: string) => ['notifications', userId] as const,
}

// Database functions using Supabase
async function fetchOrders() {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

async function fetchClients() {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

async function fetchBLNumbers() {
  const { data, error } = await supabase
    .from('bl_numbers')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

async function fetchTransportTariffs() {
  const { data, error } = await supabase
    .from('transport_tariffs')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

async function fetchProducts() {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

async function fetchUsers() {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

async function fetchRegions() {
  const { data, error } = await supabase
    .from('regions')
    .select('*')
    .order('name')

  if (error) throw error
  return data || []
}

// Custom hooks for data fetching with React Query
export function useOrders() {
  return useQuery({
    queryKey: queryKeys.orders,
    queryFn: withErrorHandling(() => fetchOrders(), 'READ', 'Orders'),
  })
}

export function useClients() {
  return useQuery({
    queryKey: queryKeys.clients,
    queryFn: withErrorHandling(() => fetchClients(), 'READ', 'Clients'),
  })
}

export function useBLNumbers() {
  return useQuery({
    queryKey: queryKeys.blNumbers,
    queryFn: withErrorHandling(() => fetchBLNumbers(), 'READ', 'BL Numbers'),
  })
}

export function useTransportTariffs() {
  return useQuery({
    queryKey: queryKeys.transportTariffs,
    queryFn: withErrorHandling(() => fetchTransportTariffs(), 'READ', 'Transport Tariffs'),
  })
}

export function useProducts() {
  return useQuery({
    queryKey: queryKeys.products,
    queryFn: withErrorHandling(() => fetchProducts(), 'READ', 'Products'),
  })
}

export function useUsers() {
  return useQuery({
    queryKey: queryKeys.users,
    queryFn: withErrorHandling(() => fetchUsers(), 'READ', 'Users'),
  })
}

export function useRegions() {
  return useQuery({
    queryKey: queryKeys.regions,
    queryFn: withErrorHandling(() => fetchRegions(), 'READ', 'Regions'),
  })
}

// Real-time subscription setup
export function useRealtimeSubscription() {
  const queryClient = useQueryClient()

  useEffect(() => {
    // Subscribe to changes in orders table
    const ordersChannel = supabase
      .channel('orders_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'orders' },
        (payload) => {
          console.log('📥 Orders change received:', payload.eventType)
          queryClient.invalidateQueries({ queryKey: queryKeys.orders })
        }
      )
      .subscribe()

    // Subscribe to changes in clients table
    const clientsChannel = supabase
      .channel('clients_changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'clients' },
        (payload) => {
          console.log('📥 Clients change received:', payload.eventType)
          queryClient.invalidateQueries({ queryKey: queryKeys.clients })
        }
      )
      .subscribe()

    // Subscribe to changes in BL numbers table
    const blNumbersChannel = supabase
      .channel('bl_numbers_changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'bl_numbers' },
        (payload) => {
          console.log('📥 BL Numbers change received:', payload.eventType)
          queryClient.invalidateQueries({ queryKey: queryKeys.blNumbers })
        }
      )
      .subscribe()

    // Subscribe to changes in transport tariffs table
    const transportTariffsChannel = supabase
      .channel('transport_tariffs_changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'transport_tariffs' },
        (payload) => {
          console.log('📥 Transport Tariffs change received:', payload.eventType)
          queryClient.invalidateQueries({ queryKey: queryKeys.transportTariffs })
        }
      )
      .subscribe()

    // Subscribe to changes in products table
    const productsChannel = supabase
      .channel('products_changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'products' },
        (payload) => {
          console.log('📥 Products change received:', payload.eventType)
          queryClient.invalidateQueries({ queryKey: queryKeys.products })
        }
      )
      .subscribe()

    // Cleanup subscriptions on unmount
    return () => {
      ordersChannel.unsubscribe()
      clientsChannel.unsubscribe()
      blNumbersChannel.unsubscribe()
      transportTariffsChannel.unsubscribe()
      productsChannel.unsubscribe()
    }
  }, [queryClient])
}

// Mutations with automatic cache invalidation
export function useCreateOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (orderData: any) => {
      const { data, error } = await supabase
        .from('orders')
        .insert([orderData])
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.orders })
      showOrderSuccessToast('create')
    },
    onError: (error) => {
      logSupabaseError('CREATE', 'Order', error)
      showOrderErrorToast('create', error)
    },
  })
}

export function useUpdateOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string, updates: any }) => {
      const { data, error } = await supabase
        .from('orders')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.orders })
      showOrderSuccessToast('update')
    },
    onError: (error) => {
      logSupabaseError('UPDATE', 'Order', error)
      showOrderErrorToast('update', error)
    },
  })
}

export function useDeleteClient() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.clients })
      showClientSuccessToast('delete')
    },
    onError: (error) => {
      logSupabaseError('DELETE', 'Client', error)
      showClientErrorToast('delete', error)
    },
  })
}

export function useDeleteOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('orders')
        .delete()
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.orders })
      showOrderSuccessToast('delete')
    },
    onError: (error) => {
      logSupabaseError('DELETE', 'Order', error)
      showOrderErrorToast('delete', error)
    },
  })
}

export function useCreateClient() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (clientData: any) => {
      // Transform form data to API format
      const apiData = {
        name: clientData.name,
        phone: clientData.phone,
        address: clientData.address || (clientData.city ? `${clientData.city}, ${clientData.address || ''}`.trim() : ''),
        region_id: clientData.region_id,
        contact_person: clientData.contact_person || '',
        rc_number: clientData.rc_number || '',
        status: clientData.status || 'active'
      }

      if (!apiData.region_id) {
        throw new Error('Region is required')
      }

      if (!apiData.address) {
        throw new Error('Address is required')
      }

      const response = await fetch('/api/clients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiData),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || errorData.error || 'Failed to create client')
      }

      const result = await response.json()
      return result.data?.client || result
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.clients })
      showClientSuccessToast('create')
    },
    onError: (error) => {
      logSupabaseError('CREATE', 'Client', error)
      showClientErrorToast('create', error)
    },
  })
}

export function useUpdateClient() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string, updates: any }) => {
      const { data, error } = await supabase
        .from('clients')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.clients })
      showClientSuccessToast('update')
    },
    onError: (error) => {
      logSupabaseError('UPDATE', 'Client', error)
      showClientErrorToast('update', error)
    },
  })
}

export function useCreateBLNumber() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (blData: any) => {
      const { data, error } = await supabase
        .from('bl_numbers')
        .insert([blData])
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.blNumbers })
      showBLNumberSuccessToast('create')
    },
    onError: (error) => {
      logSupabaseError('CREATE', 'BL Number', error)
      showBLNumberErrorToast('create', error)
    },
  })
}

export function useUpdateBLNumber() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string, updates: any }) => {
      const { data, error } = await supabase
        .from('bl_numbers')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.blNumbers })
      showBLNumberSuccessToast('update')
    },
    onError: (error) => {
      logSupabaseError('UPDATE', 'BL Number', error)
      showBLNumberErrorToast('update', error)
    },
  })
}

export function useCreateProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (productData: any) => {
      const { data, error } = await supabase
        .from('products')
        .insert([productData])
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.products })
      showProductSuccessToast('create')
    },
    onError: (error) => {
      logSupabaseError('CREATE', 'Product', error)
      showProductErrorToast('create', error)
    },
  })
}

export function useUpdateProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string, updates: any }) => {
      const { data, error } = await supabase
        .from('products')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.products })
      showProductSuccessToast('update')
    },
    onError: (error) => {
      logSupabaseError('UPDATE', 'Product', error)
      showProductErrorToast('update', error)
    },
  })
}

export function useDeleteProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.products })
      showProductSuccessToast('delete')
    },
    onError: (error) => {
      logSupabaseError('DELETE', 'Product', error)
      showProductErrorToast('delete', error)
    },
  })
}

export function useCreateTransportTariff() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (tariffData: any) => {
      const { data, error } = await supabase
        .from('transport_tariffs')
        .insert([tariffData])
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.transportTariffs })
      showTransportTariffSuccessToast('create')
    },
    onError: (error) => {
      logSupabaseError('CREATE', 'Transport Tariff', error)
      showTransportTariffErrorToast('create', error)
    },
  })
}

export function useUpdateTransportTariff() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string, updates: any }) => {
      const { data, error } = await supabase
        .from('transport_tariffs')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.transportTariffs })
      showTransportTariffSuccessToast('update')
    },
    onError: (error) => {
      logSupabaseError('UPDATE', 'Transport Tariff', error)
      showTransportTariffErrorToast('update', error)
    },
  })
}

export function useDeleteTransportTariff() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('transport_tariffs')
        .delete()
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.transportTariffs })
      showTransportTariffSuccessToast('delete')
    },
    onError: (error) => {
      logSupabaseError('DELETE', 'Transport Tariff', error)
      showTransportTariffErrorToast('delete', error)
    },
  })
}

export function useCreateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (userData: any) => {
      const { data, error } = await supabase
        .from('users')
        .insert([userData])
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users })
    },
    onError: (error) => {
      logSupabaseError('CREATE', 'User', error)
    },
  })
}

export function useUpdateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string, updates: any }) => {
      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users })
    },
    onError: (error) => {
      logSupabaseError('UPDATE', 'User', error)
    },
  })
}

export function useDeleteUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users })
    },
    onError: (error) => {
      logSupabaseError('DELETE', 'User', error)
    },
  })
}
