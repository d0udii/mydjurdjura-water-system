// Offline storage utility for managing orders when internet is unavailable
export interface OfflineOrder {
  id: string
  client_id: string
  region_id: string
  product_5_5L_pallets: number
  product_1_5L_pallets: number
  truck_type: 'factory' | 'client_own'
  notes?: string
  created_at: string
  status: 'offline_pending'
}

export interface OfflineStorage {
  orders: OfflineOrder[]
  lastSync: string | null
}

class OfflineStorageManager {
  private readonly STORAGE_KEY = 'djurdjura_offline_orders'
  private readonly SYNC_KEY = 'djurdjura_last_sync'

  // Save order to offline storage
  saveOfflineOrder(order: Omit<OfflineOrder, 'id' | 'created_at' | 'status'>): OfflineOrder {
    const offlineOrder: OfflineOrder = {
      ...order,
      id: `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      created_at: new Date().toISOString(),
      status: 'offline_pending'
    }

    const storage = this.getOfflineStorage()
    storage.orders.push(offlineOrder)
    this.setOfflineStorage(storage)

    return offlineOrder
  }

  // Get all offline orders
  getOfflineOrders(): OfflineOrder[] {
    const storage = this.getOfflineStorage()
    return storage.orders
  }

  // Remove order from offline storage (after successful sync)
  removeOfflineOrder(orderId: string): void {
    const storage = this.getOfflineStorage()
    storage.orders = storage.orders.filter(order => order.id !== orderId)
    this.setOfflineStorage(storage)
  }

  // Clear all offline orders
  clearOfflineOrders(): void {
    const storage = this.getOfflineStorage()
    storage.orders = []
    this.setOfflineStorage(storage)
  }

  // Check if there are pending offline orders
  hasOfflineOrders(): boolean {
    return this.getOfflineOrders().length > 0
  }

  // Get offline storage data
  private getOfflineStorage(): OfflineStorage {
    if (typeof window === 'undefined') {
      return { orders: [], lastSync: null }
    }

    try {
      const data = localStorage.getItem(this.STORAGE_KEY)
      return data ? JSON.parse(data) : { orders: [], lastSync: null }
    } catch (error) {
      console.error('Error reading offline storage:', error)
      return { orders: [], lastSync: null }
    }
  }

  // Set offline storage data
  private setOfflineStorage(storage: OfflineStorage): void {
    if (typeof window === 'undefined') return

    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(storage))
    } catch (error) {
      console.error('Error writing offline storage:', error)
    }
  }

  // Update last sync time
  updateLastSync(): void {
    if (typeof window === 'undefined') return

    try {
      localStorage.setItem(this.SYNC_KEY, new Date().toISOString())
    } catch (error) {
      console.error('Error updating last sync:', error)
    }
  }

  // Get last sync time
  getLastSync(): string | null {
    if (typeof window === 'undefined') return null

    try {
      return localStorage.getItem(this.SYNC_KEY)
    } catch (error) {
      console.error('Error reading last sync:', error)
      return null
    }
  }
}

export const offlineStorage = new OfflineStorageManager()

// Network status utility
export class NetworkManager {
  private static instance: NetworkManager
  private isOnline: boolean = true
  private listeners: ((isOnline: boolean) => void)[] = []

  private constructor() {
    if (typeof window !== 'undefined') {
      this.isOnline = navigator.onLine
      
      window.addEventListener('online', () => {
        this.isOnline = true
        this.notifyListeners(true)
      })

      window.addEventListener('offline', () => {
        this.isOnline = false
        this.notifyListeners(false)
      })
    }
  }

  static getInstance(): NetworkManager {
    if (!NetworkManager.instance) {
      NetworkManager.instance = new NetworkManager()
    }
    return NetworkManager.instance
  }

  isConnected(): boolean {
    return this.isOnline
  }

  addListener(callback: (isOnline: boolean) => void): () => void {
    this.listeners.push(callback)
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback)
    }
  }

  private notifyListeners(isOnline: boolean): void {
    this.listeners.forEach(listener => listener(isOnline))
  }
}

export const networkManager = NetworkManager.getInstance()
