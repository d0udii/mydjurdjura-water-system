"use client"

import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { 
  Package, 
  Truck, 
  Wifi, 
  WifiOff, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Smartphone,
  Calculator
} from "lucide-react"
import { offlineStorage, networkManager, OfflineOrder } from '@/lib/offline-storage'

interface MobileOrderFormProps {
  clients: any[]
  regions: any[]
  onCreateOrder: (orderData: any) => Promise<void>
  onClose: () => void
}

export const MobileOrderForm: React.FC<MobileOrderFormProps> = ({
  clients,
  regions,
  onCreateOrder,
  onClose
}) => {
  const [formData, setFormData] = useState({
    client_id: "",
    region_id: "",
    product_5_5L_pallets: 0,
    product_1_5L_pallets: 0,
    truck_type: "factory" as "factory" | "client_own",
    notes: ""
  })

  const [isOnline, setIsOnline] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [offlineOrders, setOfflineOrders] = useState<OfflineOrder[]>([])
  const [showOfflineOrders, setShowOfflineOrders] = useState(false)

  useEffect(() => {
    // Check network status
    setIsOnline(networkManager.isConnected())
    
    // Listen for network changes
    const removeListener = networkManager.addListener((online) => {
      setIsOnline(online)
      if (online) {
        // Try to sync offline orders when back online
        syncOfflineOrders()
      }
    })

    // Load offline orders
    loadOfflineOrders()

    return removeListener
  }, [])

  const loadOfflineOrders = () => {
    const orders = offlineStorage.getOfflineOrders()
    setOfflineOrders(orders)
  }

  const syncOfflineOrders = async () => {
    const orders = offlineStorage.getOfflineOrders()
    if (orders.length === 0) return

    try {
      for (const order of orders) {
        const orderData = {
          client_id: order.client_id,
          region_id: order.region_id,
          product_5_5L_pallets: order.product_5_5L_pallets,
          product_1_5L_pallets: order.product_1_5L_pallets,
          truck_type: order.truck_type,
          notes: order.notes
        }
        
        await onCreateOrder(orderData)
        offlineStorage.removeOfflineOrder(order.id)
      }
      
      offlineStorage.updateLastSync()
      loadOfflineOrders()
    } catch (error) {
      console.error('Failed to sync offline orders:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      if (isOnline) {
        // Submit directly if online
        await onCreateOrder(formData)
      } else {
        // Save to offline storage if offline
        offlineStorage.saveOfflineOrder(formData)
        loadOfflineOrders()
      }
      
      // Reset form
      setFormData({
        client_id: "",
        region_id: "",
        product_5_5L_pallets: 0,
        product_1_5L_pallets: 0,
        truck_type: "factory",
        notes: ""
      })
      
      onClose()
    } catch (error) {
      console.error('Failed to create order:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Auto-fill region when client is selected
  const handleClientChange = (clientId: string) => {
    const selectedClient = clients.find(c => c.id === clientId)
    if (selectedClient) {
      setFormData(prev => ({ 
        ...prev, 
        client_id: clientId,
        region_id: selectedClient.region_id // Auto-fill region
      }))
    }
  }

  const calculateTotal = () => {
    const pallet5_5L = formData.product_5_5L_pallets * 212 * 65 // 212 units per pallet at 65 DA each
    const pallet1_5L = formData.product_1_5L_pallets * 112 * 178.5 // 112 units per pallet at 178.5 DA each
    const productTotal = pallet5_5L + pallet1_5L
    
    // Add shipping cost if factory truck is selected
    let shippingCost = 0
    if (formData.truck_type === "factory" && formData.region_id) {
      const selectedRegion = regions.find(r => r.id === formData.region_id)
      if (selectedRegion) {
        // Get shipping cost based on region (mock data - should come from transport tariffs)
        const shippingCosts: { [key: string]: number } = {
          "REG-001": 31000, // Biskra
          "REG-002": 30000, // Ouled Djellal
          "REG-003": 47000, // Oued Souf
          "REG-004": 42000, // El Mghair
        }
        shippingCost = shippingCosts[formData.region_id] || 0
      }
    }
    
    return productTotal + shippingCost
  }

  const calculateShippingCost = () => {
    if (formData.truck_type === "factory" && formData.region_id) {
      const selectedRegion = regions.find(r => r.id === formData.region_id)
      if (selectedRegion) {
        const shippingCosts: { [key: string]: number } = {
          "REG-001": 31000, // Biskra
          "REG-002": 30000, // Ouled Djellal
          "REG-003": 47000, // Oued Souf
          "REG-004": 42000, // El Mghair
        }
        return shippingCosts[formData.region_id] || 0
      }
    }
    return 0
  }

  const getSelectedClient = () => {
    return clients.find(c => c.id === formData.client_id)
  }

  const getSelectedRegion = () => {
    return regions.find(r => r.id === formData.region_id)
  }

  return (
    <div className="fixed inset-0 bg-white dark:bg-gray-900 z-50 overflow-y-auto">
      {/* Mobile Header */}
      <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 p-4 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Smartphone className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white">New Order</h1>
              <div className="flex items-center gap-2">
                {isOnline ? (
                  <Badge variant="outline" className="text-green-600 border-green-200">
                    <Wifi className="h-3 w-3 mr-1" />
                    Online
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-orange-600 border-orange-200">
                    <WifiOff className="h-3 w-3 mr-1" />
                    Offline
                  </Badge>
                )}
                {offlineOrders.length > 0 && (
                  <Badge variant="outline" className="text-blue-600 border-blue-200">
                    <Clock className="h-3 w-3 mr-1" />
                    {offlineOrders.length} pending
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Offline Orders Alert */}
        {!isOnline && (
          <Alert className="border-orange-200 bg-orange-50 dark:bg-orange-900/20">
            <AlertCircle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800 dark:text-orange-200">
              You're offline. Orders will be saved locally and synced when connection is restored.
            </AlertDescription>
          </Alert>
        )}

        {/* Offline Orders Summary */}
        {offlineOrders.length > 0 && (
          <Card className="border-blue-200 bg-blue-50 dark:bg-blue-900/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-600" />
                Offline Orders ({offlineOrders.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowOfflineOrders(!showOfflineOrders)}
                className="w-full"
              >
                {showOfflineOrders ? 'Hide' : 'View'} Offline Orders
              </Button>
              {showOfflineOrders && (
                <div className="mt-3 space-y-2">
                  {offlineOrders.map((order) => (
                    <div key={order.id} className="text-xs bg-white dark:bg-gray-800 p-2 rounded border">
                      <div className="font-medium">
                        {clients.find(c => c.id === order.client_id)?.name || 'Unknown Client'}
                      </div>
                      <div className="text-gray-500">
                        {order.product_5_5L_pallets} × 5.5L + {order.product_1_5L_pallets} × 1.5L
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Order Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Client Selection */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Package className="h-4 w-4 text-blue-600" />
                Client Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label htmlFor="client" className="text-sm font-medium">Client</Label>
                <Select 
                  value={formData.client_id} 
                  onValueChange={handleClientChange}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select client" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        <div className="flex flex-col">
                          <span className="font-medium">{client.name}</span>
                          <span className="text-xs text-gray-500">{client.address}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="region" className="text-sm font-medium">Region (Auto-filled)</Label>
                <Select 
                  value={formData.region_id} 
                  disabled={true}
                >
                  <SelectTrigger className="w-full bg-gray-50 dark:bg-gray-700">
                    <SelectValue placeholder="Region will be auto-filled" />
                  </SelectTrigger>
                </Select>
                {formData.region_id && (
                  <div className="text-xs text-green-600 dark:text-green-400 mt-1">
                    ✓ Region automatically selected based on client
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Product Selection */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Calculator className="h-4 w-4 text-blue-600" />
                Products
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="5_5L" className="text-sm font-medium">5.5L Bottles</Label>
                  <div className="space-y-2">
                    <Input
                      id="5_5L"
                      type="number"
                      min="0"
                      value={formData.product_5_5L_pallets}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        product_5_5L_pallets: parseInt(e.target.value) || 0 
                      }))}
                      className="text-center"
                    />
                    <div className="text-xs text-gray-500 text-center">
                      {formData.product_5_5L_pallets} pallets × 212 units
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="1_5L" className="text-sm font-medium">1.5L Bottles</Label>
                  <div className="space-y-2">
                    <Input
                      id="1_5L"
                      type="number"
                      min="0"
                      value={formData.product_1_5L_pallets}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        product_1_5L_pallets: parseInt(e.target.value) || 0 
                      }))}
                      className="text-center"
                    />
                    <div className="text-xs text-gray-500 text-center">
                      {formData.product_1_5L_pallets} pallets × 112 units
                    </div>
                  </div>
                </div>
              </div>

              {/* Total Calculation */}
              {calculateTotal() > 0 && (
                <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                  <div className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                    Total: {calculateTotal().toLocaleString()} DA
                  </div>
                  <div className="text-xs text-gray-500 space-y-1">
                    {/* Product costs */}
                    {formData.product_5_5L_pallets > 0 && (
                      <div>5.5L: {formData.product_5_5L_pallets} × 212 × 65 = {(formData.product_5_5L_pallets * 212 * 65).toLocaleString()} DA</div>
                    )}
                    {formData.product_1_5L_pallets > 0 && (
                      <div>1.5L: {formData.product_1_5L_pallets} × 112 × 178.5 = {(formData.product_1_5L_pallets * 112 * 178.5).toLocaleString()} DA</div>
                    )}
                    
                    {/* Shipping cost */}
                    {calculateShippingCost() > 0 && (
                      <div className="text-blue-600 dark:text-blue-400 font-medium">
                        Shipping: {calculateShippingCost().toLocaleString()} DA ({formData.truck_type === 'factory' ? 'Factory Truck' : 'Client Truck'})
                      </div>
                    )}
                    {formData.truck_type === 'client_own' && (
                      <div className="text-green-600 dark:text-green-400">
                        ✓ Free shipping (Client's own truck)
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Truck Type */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Truck className="h-4 w-4 text-blue-600" />
                Shipping
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Label className="text-sm font-medium">Truck Type</Label>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    type="button"
                    variant={formData.truck_type === 'factory' ? 'default' : 'outline'}
                    onClick={() => setFormData(prev => ({ ...prev, truck_type: 'factory' }))}
                    className="h-12 flex flex-col items-center gap-1"
                  >
                    <Truck className="h-4 w-4" />
                    <span className="text-xs">Factory Truck</span>
                    {formData.region_id && (
                      <span className="text-xs text-blue-600">
                        +{calculateShippingCost().toLocaleString()} DA
                      </span>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant={formData.truck_type === 'client_own' ? 'default' : 'outline'}
                    onClick={() => setFormData(prev => ({ ...prev, truck_type: 'client_own' }))}
                    className="h-12 flex flex-col items-center gap-1"
                  >
                    <Package className="h-4 w-4" />
                    <span className="text-xs">Client Own</span>
                    <span className="text-xs text-green-600">Free</span>
                  </Button>
                </div>
                {formData.truck_type === 'factory' && formData.region_id && (
                  <div className="text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 p-2 rounded">
                    Shipping cost: {calculateShippingCost().toLocaleString()} DA to {regions.find(r => r.id === formData.region_id)?.name}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Additional Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Add any additional notes or special instructions..."
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                rows={3}
                className="resize-none"
              />
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="sticky bottom-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 p-4 -mx-4">
            <Button
              type="submit"
              disabled={isSubmitting || !formData.client_id || !formData.region_id || (formData.product_5_5L_pallets === 0 && formData.product_1_5L_pallets === 0)}
              className="w-full h-12 text-base font-medium"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  {isOnline ? 'Creating Order...' : 'Saving Offline...'}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  {isOnline ? (
                    <>
                      <CheckCircle className="h-5 w-5" />
                      Create Order
                    </>
                  ) : (
                    <>
                      <Clock className="h-5 w-5" />
                      Save Offline
                    </>
                  )}
                </div>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
