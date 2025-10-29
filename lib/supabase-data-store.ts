/**
 * Supabase Data Store Hook with Comprehensive Error Handling
 * Replaces in-memory shared data store with Supabase integration
 */

import { useState, useEffect } from 'react'
import { 
  getOrders, 
  getClients, 
  getBLNumbers, 
  createOrder, 
  updateOrder, 
  createClient, 
  updateClient,
  createBLNumber,
  updateBLNumber
} from '@/lib/supabase-db'
import { 
  showClientSuccessToast, 
  showClientErrorToast,
  showOrderSuccessToast,
  showOrderErrorToast,
  showBLNumberSuccessToast,
  showBLNumberErrorToast,
  showFetchErrorToast,
  showLoadingToast,
  dismissToast
} from '@/lib/toast-notifications'
import { 
  withErrorHandling, 
  withApiLogging,
  handleCreateError,
  handleReadError,
  handleUpdateError,
  handleDeleteError,
  logSupabaseError
} from '@/lib/error-handling'

export function useDataStore() {
  const [orders, setOrders] = useState<any[]>([])
  const [clients, setClients] = useState<any[]>([])
  const [blNumbers, setBLNumbers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())

  // Fetch all data from Supabase with error handling
  const fetchData = async () => {
    const loadingToastId = showLoadingToast('Loading data...')
    
    try {
      setLoading(true)
      
      const [ordersData, clientsData, blNumbersData] = await Promise.all([
        withErrorHandling(() => getOrders(), 'READ', 'Orders'),
        withErrorHandling(() => getClients(), 'READ', 'Clients'),
        withErrorHandling(() => getBLNumbers(), 'READ', 'BL Numbers')
      ])

      // Handle successful data fetching
      if (ordersData !== null) {
        setOrders(ordersData)
      } else {
        showFetchErrorToast('Orders')
        setOrders([])
      }

      if (clientsData !== null) {
        setClients(clientsData)
      } else {
        showFetchErrorToast('Clients')
        setClients([])
      }

      if (blNumbersData !== null) {
        setBLNumbers(blNumbersData)
      } else {
        showFetchErrorToast('BL Numbers')
        setBLNumbers([])
      }

      setLastUpdate(new Date())
      
    } catch (error) {
      console.error('Error in fetchData:', error)
      logSupabaseError('FETCH_ALL', 'DATA_STORE', error)
      showFetchErrorToast('Data')
    } finally {
      setLoading(false)
      dismissToast(loadingToastId)
    }
  }

  // Load data on mount
  useEffect(() => {
    fetchData()
  }, [])

  // CRUD operations with comprehensive error handling and notifications
  const addOrder = async (orderData: any) => {
    const loadingToastId = showLoadingToast('Creating order...')
    
    try {
      const newOrder = await withErrorHandling(
        () => createOrder(orderData), 
        'CREATE', 
        'Order'
      )
      
      if (newOrder) {
        await fetchData() // Refetch to ensure consistency
        showOrderSuccessToast('create')
        return newOrder
      } else {
        showOrderErrorToast('create', new Error('Failed to create order'))
        return null
      }
    } catch (error) {
      console.error('Error creating order:', error)
      showOrderErrorToast('create', error)
      return null
    } finally {
      dismissToast(loadingToastId)
    }
  }

  const updateOrder = async (id: string, updates: any) => {
    const loadingToastId = showLoadingToast('Updating order...')
    
    try {
      const updatedOrder = await withErrorHandling(
        () => updateOrder(id, updates), 
        'UPDATE', 
        'Order'
      )
      
      if (updatedOrder) {
        await fetchData() // Refetch to ensure consistency
        showOrderSuccessToast('update')
        return updatedOrder
      } else {
        showOrderErrorToast('update', new Error('Failed to update order'))
        return null
      }
    } catch (error) {
      console.error('Error updating order:', error)
      showOrderErrorToast('update', error)
      return null
    } finally {
      dismissToast(loadingToastId)
    }
  }

  const addClient = async (clientData: any) => {
    const loadingToastId = showLoadingToast('Creating client...')
    
    try {
      const newClient = await withErrorHandling(
        () => createClient(clientData), 
        'CREATE', 
        'Client'
      )
      
      if (newClient) {
        await fetchData() // Refetch to ensure consistency
        showClientSuccessToast('create')
        return newClient
      } else {
        showClientErrorToast('create', new Error('Failed to create client'))
        return null
      }
    } catch (error) {
      console.error('Error creating client:', error)
      showClientErrorToast('create', error)
      return null
    } finally {
      dismissToast(loadingToastId)
    }
  }

  const updateClient = async (id: string, updates: any) => {
    const loadingToastId = showLoadingToast('Updating client...')
    
    try {
      const updatedClient = await withErrorHandling(
        () => updateClient(id, updates), 
        'UPDATE', 
        'Client'
      )
      
      if (updatedClient) {
        await fetchData() // Refetch to ensure consistency
        showClientSuccessToast('update')
        return updatedClient
      } else {
        showClientErrorToast('update', new Error('Failed to update client'))
        return null
      }
    } catch (error) {
      console.error('Error updating client:', error)
      showClientErrorToast('update', error)
      return null
    } finally {
      dismissToast(loadingToastId)
    }
  }

  const addBLNumber = async (blData: any) => {
    const loadingToastId = showLoadingToast('Creating BL number...')
    
    try {
      const newBL = await withErrorHandling(
        () => createBLNumber(blData), 
        'CREATE', 
        'BL Number'
      )
      
      if (newBL) {
        await fetchData() // Refetch to ensure consistency
        showBLNumberSuccessToast('create')
        return newBL
      } else {
        showBLNumberErrorToast('create', new Error('Failed to create BL number'))
        return null
      }
    } catch (error) {
      console.error('Error creating BL number:', error)
      showBLNumberErrorToast('create', error)
      return null
    } finally {
      dismissToast(loadingToastId)
    }
  }

  const updateBLNumber = async (id: string, updates: any) => {
    const loadingToastId = showLoadingToast('Updating BL number...')
    
    try {
      const updatedBL = await withErrorHandling(
        () => updateBLNumber(id, updates), 
        'UPDATE', 
        'BL Number'
      )
      
      if (updatedBL) {
        await fetchData() // Refetch to ensure consistency
        showBLNumberSuccessToast('update')
        return updatedBL
      } else {
        showBLNumberErrorToast('update', new Error('Failed to update BL number'))
        return null
      }
    } catch (error) {
      console.error('Error updating BL number:', error)
      showBLNumberErrorToast('update', error)
      return null
    } finally {
      dismissToast(loadingToastId)
    }
  }

  return {
    orders,
    clients,
    blNumbers,
    loading,
    lastUpdate,
    addOrder,
    updateOrder,
    addClient,
    updateClient,
    addBLNumber,
    updateBLNumber,
    refreshData: fetchData
  }
}
