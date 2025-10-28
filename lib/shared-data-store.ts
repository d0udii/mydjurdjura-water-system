/**
 * Shared Data Store for Real-time Consistency
 * This ensures all components have access to the same data and updates in real-time
 */

import { useState, useEffect } from 'react'

class DataStore {
  private orders: any[] = []
  private clients: any[] = []
  private blNumbers: any[] = []
  private lastUpdate: Date = new Date()
  private listeners: Set<Function> = new Set()

  constructor() {
    // Don't load data immediately during static generation
    if (typeof window !== 'undefined') {
      this.loadInitialData()
    }
  }

  private async loadInitialData() {
    try {
      // Only load data if we're in a browser environment
      if (typeof window === 'undefined') {
        return
      }

      // Load orders
      const ordersResponse = await fetch('/api/orders')
      if (ordersResponse.ok) {
        const ordersData = await ordersResponse.json()
        this.orders = ordersData.orders || []
      }

      // Load clients
      const clientsResponse = await fetch('/api/clients')
      if (clientsResponse.ok) {
        const clientsData = await clientsResponse.json()
        this.clients = clientsData.clients || []
      }

      // Load BL numbers
      const blResponse = await fetch('/api/bl-numbers')
      if (blResponse.ok) {
        const blData = await blResponse.json()
        this.blNumbers = blData.blNumbers || []
      }

      this.lastUpdate = new Date()
      this.notifyListeners()
    } catch (error) {
      console.error('Error loading initial data:', error)
    }
  }

  private notifyListeners() {
    this.listeners.forEach(listener => {
      listener({
        orders: this.orders,
        clients: this.clients,
        blNumbers: this.blNumbers,
        lastUpdate: this.lastUpdate
      })
    })
  }

  public subscribe(listener: Function) {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  public async refreshData() {
    await this.loadInitialData()
  }

  public getOrders() {
    return this.orders
  }

  public getClients() {
    return this.clients
  }

  public getBLNumbers() {
    return this.blNumbers
  }

  public getLastUpdate() {
    return this.lastUpdate
  }

  public addOrder(order: any) {
    this.orders.unshift(order)
    this.lastUpdate = new Date()
    this.notifyListeners()
  }

  public updateOrder(orderId: string, updates: any) {
    const orderIndex = this.orders.findIndex(o => o.id === orderId)
    if (orderIndex !== -1) {
      this.orders[orderIndex] = { ...this.orders[orderIndex], ...updates }
      this.lastUpdate = new Date()
      this.notifyListeners()
    }
  }

  public addBLNumber(blNumber: any) {
    this.blNumbers.unshift(blNumber)
    this.lastUpdate = new Date()
    this.notifyListeners()
  }

  public updateBLNumber(blId: string, updates: any) {
    const blIndex = this.blNumbers.findIndex(bl => bl.id === blId)
    if (blIndex !== -1) {
      this.blNumbers[blIndex] = { ...this.blNumbers[blIndex], ...updates }
      this.lastUpdate = new Date()
      this.notifyListeners()
    }
  }

  public addClient(client: any) {
    this.clients.unshift(client)
    this.lastUpdate = new Date()
    this.notifyListeners()
  }

  public updateClient(clientId: string, updates: any) {
    const clientIndex = this.clients.findIndex(c => c.id === clientId)
    if (clientIndex !== -1) {
      this.clients[clientIndex] = { ...this.clients[clientIndex], ...updates }
      this.lastUpdate = new Date()
      this.notifyListeners()
    }
  }
}

// Create singleton instance
const dataStore = new DataStore()

export default dataStore

// Hook for React components
export function useDataStore() {
  const [data, setData] = useState({
    orders: dataStore.getOrders(),
    clients: dataStore.getClients(),
    blNumbers: dataStore.getBLNumbers(),
    lastUpdate: dataStore.getLastUpdate()
  })

  useEffect(() => {
    const unsubscribe = dataStore.subscribe((newData: any) => {
      setData(newData)
    })

    return unsubscribe
  }, [])

  return {
    ...data,
    addOrder: dataStore.addOrder.bind(dataStore),
    updateOrder: dataStore.updateOrder.bind(dataStore),
    addBLNumber: dataStore.addBLNumber.bind(dataStore),
    updateBLNumber: dataStore.updateBLNumber.bind(dataStore),
    addClient: dataStore.addClient.bind(dataStore),
    updateClient: dataStore.updateClient.bind(dataStore),
    refreshData: dataStore.refreshData.bind(dataStore)
  }
}
