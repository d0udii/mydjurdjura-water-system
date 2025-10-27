"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  Truck, 
  MapPin, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Package,
  User,
  Calendar,
  Phone,
  Mail,
  Navigation,
  Route,
  Timer,
  Zap,
  Shield,
  Eye,
  Edit,
  Trash2
} from "lucide-react"
import { useAuth } from "@/lib/auth"
import { withAuth } from "@/lib/auth"

interface OrderTrackingData {
  id: string
  status: 'pending' | 'processing' | 'in_transit' | 'delivered' | 'cancelled'
  client_id: string
  client_name: string
  client_phone: string
  client_address: string
  region: string
  total_price: number
  product_5_5L_pallets: number
  product_1_5L_pallets: number
  truck_type: 'factory' | 'client_own'
  truck_capacity: number
  delivery_date: string
  created_at: string
  updated_at: string
  assigned_to: string
  assigned_driver?: string
  driver_phone?: string
  bl_number?: string
  tracking_events: TrackingEvent[]
  estimated_delivery: string
  actual_delivery?: string
  notes?: string
}

interface TrackingEvent {
  id: string
  order_id: string
  status: string
  location?: string
  timestamp: string
  description: string
  created_by: string
  metadata?: any
}

interface OrderTrackingProps {
  orderId?: string
  className?: string
}

export const OrderTracking: React.FC<OrderTrackingProps> = ({ orderId, className }) => {
  const { user } = useAuth()
  const [orders, setOrders] = useState<OrderTrackingData[]>([])
  const [selectedOrder, setSelectedOrder] = useState<OrderTrackingData | null>(null)
  const [loading, setLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/orders')
      if (response.ok) {
        const data = await response.json()
        const ordersWithTracking = (data.orders || []).map((order: any) => ({
          ...order,
          tracking_events: generateTrackingEvents(order),
          estimated_delivery: calculateEstimatedDelivery(order),
          assigned_driver: getAssignedDriver(order.id),
          driver_phone: getDriverPhone(order.id),
          bl_number: getBLNumber(order.id)
        }))
        setOrders(ordersWithTracking)
        
        if (orderId) {
          const order = ordersWithTracking.find((o: OrderTrackingData) => o.id === orderId)
          if (order) setSelectedOrder(order)
        }
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateTrackingEvents = (order: any): TrackingEvent[] => {
    const events: TrackingEvent[] = [
      {
        id: `${order.id}-created`,
        order_id: order.id,
        status: 'created',
        timestamp: order.created_at,
        description: `Order created for ${order.clients?.name || 'Unknown Client'}`,
        created_by: 'system'
      }
    ]

    if (order.status === 'processing') {
      events.push({
        id: `${order.id}-processing`,
        order_id: order.id,
        status: 'processing',
        timestamp: order.updated_at,
        description: 'Order is being processed and prepared for shipment',
        created_by: 'operations'
      })
    }

    if (order.status === 'in_transit') {
      events.push({
        id: `${order.id}-transit`,
        order_id: order.id,
        status: 'in_transit',
        timestamp: order.updated_at,
        description: 'Order is in transit to delivery location',
        created_by: 'driver',
        location: 'En route'
      })
    }

    if (order.status === 'delivered') {
      events.push({
        id: `${order.id}-delivered`,
        order_id: order.id,
        status: 'delivered',
        timestamp: order.updated_at,
        description: 'Order has been successfully delivered',
        created_by: 'driver',
        location: order.clients?.address || 'Delivery location'
      })
    }

    return events.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
  }

  const calculateEstimatedDelivery = (order: any): string => {
    const createdDate = new Date(order.created_at)
    const estimatedDate = new Date(createdDate.getTime() + 2 * 24 * 60 * 60 * 1000) // 2 days
    return estimatedDate.toISOString()
  }

  const getAssignedDriver = (orderId: string): string => {
    const drivers = ['Ahmed Benali', 'Mohamed Khelil', 'Samir Mennacer', 'Fatima Zohra']
    return drivers[Math.floor(Math.random() * drivers.length)]
  }

  const getDriverPhone = (orderId: string): string => {
    const phones = ['0555123456', '0666789012', '0777890123', '0540233149']
    return phones[Math.floor(Math.random() * phones.length)]
  }

  const getBLNumber = (orderId: string): string => {
    return `BL-${orderId.slice(-6)}-${Date.now().toString().slice(-4)}`
  }

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      setIsUpdating(true)
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: newStatus,
          updated_at: new Date().toISOString()
        })
      })

      if (response.ok) {
        await fetchOrders() // Refresh data
        // Add tracking event
        const newEvent: TrackingEvent = {
          id: `${orderId}-${newStatus}-${Date.now()}`,
          order_id: orderId,
          status: newStatus,
          timestamp: new Date().toISOString(),
          description: `Order status updated to ${newStatus}`,
          created_by: user?.id || 'system'
        }
        
        // In a real app, this would be saved to the database
        console.log('New tracking event:', newEvent)
      }
    } catch (error) {
      console.error('Error updating order status:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />
      case 'processing':
        return <Package className="h-4 w-4 text-blue-500" />
      case 'in_transit':
        return <Truck className="h-4 w-4 text-purple-500" />
      case 'delivered':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'cancelled':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'processing':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'in_transit':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
      case 'delivered':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const getProgressPercentage = (status: string) => {
    switch (status) {
      case 'pending':
        return 25
      case 'processing':
        return 50
      case 'in_transit':
        return 75
      case 'delivered':
        return 100
      case 'cancelled':
        return 0
      default:
        return 0
    }
  }

  useEffect(() => {
    fetchOrders()
    
    // Real-time updates every 30 seconds
    const interval = setInterval(fetchOrders, 30000)
    
    return () => clearInterval(interval)
  }, [orderId])

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Order List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Navigation className="h-5 w-5 text-blue-600" />
            Order Tracking Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {orders.map((order) => (
              <div 
                key={order.id}
                className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md ${
                  selectedOrder?.id === order.id ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-700'
                }`}
                onClick={() => setSelectedOrder(order)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {getStatusIcon(order.status)}
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-white">
                        {order.id}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {order.client_name} • {order.total_price.toLocaleString()} DA
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {order.assigned_driver}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Driver
                      </div>
                    </div>
                    <Badge className={getStatusColor(order.status)}>
                      {order.status.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
                
                <div className="mt-3">
                  <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                    <span>Progress</span>
                    <span>{getProgressPercentage(order.status)}%</span>
                  </div>
                  <Progress value={getProgressPercentage(order.status)} className="h-2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Order Details */}
      {selectedOrder && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Order Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5 text-blue-600" />
                Order Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Order ID</label>
                  <div className="text-sm font-semibold text-gray-900 dark:text-white">
                    {selectedOrder.id}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">BL Number</label>
                  <div className="text-sm font-semibold text-gray-900 dark:text-white">
                    {selectedOrder.bl_number}
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Client Information</label>
                <div className="mt-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-900 dark:text-white">{selectedOrder.client_name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-900 dark:text-white">{selectedOrder.client_phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-900 dark:text-white">{selectedOrder.client_address}</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Delivery Information</label>
                <div className="mt-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <Truck className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-900 dark:text-white">
                      {selectedOrder.truck_type === 'factory' ? 'Factory Truck' : "Client's Truck"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-900 dark:text-white">{selectedOrder.assigned_driver}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-900 dark:text-white">{selectedOrder.driver_phone}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Estimated Delivery</label>
                  <div className="text-sm font-semibold text-gray-900 dark:text-white">
                    {new Date(selectedOrder.estimated_delivery).toLocaleDateString()}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Value</label>
                  <div className="text-sm font-semibold text-gray-900 dark:text-white">
                    {selectedOrder.total_price.toLocaleString()} DA
                  </div>
                </div>
              </div>

              {/* Status Update Actions */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex flex-wrap gap-2">
                  {selectedOrder.status === 'pending' && (
                    <Button 
                      size="sm" 
                      onClick={() => updateOrderStatus(selectedOrder.id, 'processing')}
                      disabled={isUpdating}
                    >
                      <Package className="h-4 w-4 mr-2" />
                      Start Processing
                    </Button>
                  )}
                  {selectedOrder.status === 'processing' && (
                    <Button 
                      size="sm" 
                      onClick={() => updateOrderStatus(selectedOrder.id, 'in_transit')}
                      disabled={isUpdating}
                    >
                      <Truck className="h-4 w-4 mr-2" />
                      Ship Order
                    </Button>
                  )}
                  {selectedOrder.status === 'in_transit' && (
                    <Button 
                      size="sm" 
                      onClick={() => updateOrderStatus(selectedOrder.id, 'delivered')}
                      disabled={isUpdating}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Mark Delivered
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tracking Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Route className="h-5 w-5 text-green-600" />
                Tracking Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {selectedOrder.tracking_events.map((event, index) => (
                  <div key={event.id} className="flex items-start gap-3">
                    <div className="flex flex-col items-center">
                      <div className={`w-3 h-3 rounded-full ${
                        index === selectedOrder.tracking_events.length - 1 
                          ? 'bg-blue-500' 
                          : 'bg-gray-300 dark:bg-gray-600'
                      }`} />
                      {index < selectedOrder.tracking_events.length - 1 && (
                        <div className="w-px h-8 bg-gray-300 dark:bg-gray-600 mt-2" />
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div className="font-medium text-gray-900 dark:text-white text-sm">
                          {event.description}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(event.timestamp).toLocaleDateString()}
                        </div>
                      </div>
                      {event.location && (
                        <div className="flex items-center gap-1 mt-1">
                          <MapPin className="h-3 w-3 text-gray-400" />
                          <span className="text-xs text-gray-600 dark:text-gray-400">
                            {event.location}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

export default withAuth(OrderTracking)
