"use client"

import React, { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Package, Plus, Edit, Trash2, MoreHorizontal, FileText, FileSpreadsheet, Download, MapPin, Phone, Calculator, Truck, Info, User, CheckCircle, Clock, AlertCircle, RefreshCw, Smartphone, Wifi, WifiOff, Crown, Shield, Zap, Lock, Unlock, Save, AlertTriangle } from "lucide-react"
import { ExportButton } from "@/components/export-utils"
import { MobileOrderForm } from "@/components/mobile-order-form"
import { offlineStorage, networkManager } from '@/lib/offline-storage'
import { getAdminPermissions, isAdmin, getAdminBadge, getAdminColors } from "@/lib/admin-permissions"
import { showEditSuccessToast, showEditErrorToast, showDeleteSuccessToast, showDeleteErrorToast } from "@/lib/toast-notifications"
import { logEditActivity, logDeleteActivity } from "@/lib/activity-logging"
import { useToast } from "@/lib/toast-context"
import { useAutoSave } from "@/hooks/use-auto-save"
import { ordersApi } from "@/lib/api-client"
import { validateOrder } from "@/lib/validation"
import {
  AnimatedDiv,
  FloatingElement,
  GradientText,
  GlowEffect,
  RevealOnScroll,
  RevealTableRow,
  ShakeElement
} from "@/components/animations"
import { useDataStore } from "@/lib/shared-data-store"

// Loading Spinner Component
const LoadingSpinner = ({ text, subtext }: { text: string; subtext?: string }) => (
  <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
    <div className="text-center space-y-4">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{text}</h2>
        {subtext && <p className="text-gray-600 dark:text-gray-400 mt-1">{subtext}</p>}
      </div>
    </div>
  </div>
)

// Demo data
const demoClients = [
  { id: "CLI-001", name: "Samir Mennacer", phone: "0540233149", address: "Tolga, Biskra", region_id: "REG-001" },
  { id: "CLI-002", name: "Ahmed Benali", phone: "0555123456", address: "Ouled Djellal", region_id: "REG-001" },
  { id: "CLI-003", name: "Fatima Zohra", phone: "0666789012", address: "Oued Souf", region_id: "REG-001" },
  { id: "CLI-004", name: "Mohamed Khelil", phone: "0777890123", address: "El Mghair", region_id: "REG-001" },
]

const demoRegions = [
  { id: "REG-001", name: "East", responsible: "Hamouche" },
  { id: "REG-002", name: "West", responsible: "Ali" },
  { id: "REG-003", name: "North", responsible: "Sara" },
  { id: "REG-004", name: "South", responsible: "Omar" },
]

const demoOrders = [
  {
    id: "ORD-001",
    client_id: "CLI-001",
    region_id: "REG-001",
    assigned_to: "USR-004",
    status: "pending" as const,
    total_price: 150000,
    product_5_5L_pallets: 5,
    product_1_5L_pallets: 3,
    truck_type: "factory" as const,
    truck_capacity: 22,
    delivery_date: "2024-01-15",
    notes: "Urgent delivery",
    created_at: "2024-01-10T10:00:00Z",
    updated_at: "2024-01-10T10:00:00Z",
    clients: demoClients[0],
    regions: demoRegions[0],
  },
  {
    id: "ORD-002",
    client_id: "CLI-002",
    region_id: "REG-001",
    assigned_to: "USR-004",
    status: "processing" as const,
    total_price: 200000,
    product_5_5L_pallets: 8,
    product_1_5L_pallets: 2,
    truck_type: "client_own" as const,
    truck_capacity: 24,
    delivery_date: "2024-01-16",
    notes: "Regular delivery",
    created_at: "2024-01-11T14:30:00Z",
    updated_at: "2024-01-11T14:30:00Z",
    clients: demoClients[1],
    regions: demoRegions[0],
  },
]

interface Order {
  id: string
  client_id: string
  region_id: string
  assigned_to: string
  status: "pending" | "processing" | "delivered" | "cancelled"
  total_price: number
  product_5_5L_pallets: number
  product_1_5L_pallets: number
  truck_type: "factory" | "client_own"
  truck_capacity: number
  delivery_date: string
  notes?: string
  created_at: string
  updated_at: string
  clients?: {
    id: string
    name: string
    phone: string
    address: string
    region_id: string
  }
  regions?: {
    id: string
    name: string
    responsible: string
  }
}

interface Client {
  id: string
  name: string
  phone: string
  address: string
  region_id: string
}

interface Region {
  id: string
  name: string
  responsible: string
}

interface TransportTariff {
  id: string
  city: string
  cost_per_pallet: number
  status: 'active' | 'inactive'
  created_at: string
}

const OrdersPage = () => {
  const { user } = useAuth()
  const { orders, clients, addOrder, updateOrder, refreshData } = useDataStore()
  const { showSuccess, showError, showWarning } = useToast()
  const [regions, setRegions] = useState<Region[]>([])
  const [transportTariffs, setTransportTariffs] = useState<TransportTariff[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [isOnline, setIsOnline] = useState(true)
  const [offlineOrders, setOfflineOrders] = useState<any[]>([])
  const [showMobileForm, setShowMobileForm] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  
  // Admin permissions
  const adminPermissions = getAdminPermissions(user?.role || "")
  const isUserAdmin = isAdmin(user?.role || "")
  const adminColors = getAdminColors()
  
  const [formData, setFormData] = useState({
    client_id: "",
    region_id: "",
    product_5_5L_pallets: 0,
    product_1_5L_pallets: 0,
    truck_type: "factory",
    notes: "",
  })

  // Auto-save functionality for form data
  const { isSaving, hasUnsavedChanges, lastSaved, save, reset } = useAutoSave(formData, {
    delay: 3000,
    validate: async (data) => {
      if (!data.client_id || !data.region_id) return false
      if (data.product_5_5L_pallets === 0 && data.product_1_5L_pallets === 0) return false
      return true
    },
    onSave: async (data) => {
      if (currentOrder) {
        // Update existing order
        const response = await ordersApi.update(currentOrder.id, {
          ...currentOrder,
          ...data,
          total_price: calculateTotalPrice(data.product_5_5L_pallets, data.product_1_5L_pallets)
        })
        
        if (!response.success) {
          throw new Error(response.error || 'Failed to update order')
        }
        
        updateOrder(currentOrder.id, response.data)
      }
    },
    onError: (error) => {
      showError('Auto-save Failed', error.message)
    },
    enabled: isEditOpen && currentOrder !== null,
    showToast: false // We'll handle toasts manually
  })
  
  // State for selected client details
  const [selectedClientDetails, setSelectedClientDetails] = useState<{
    client: Client | null
    region: Region | null
    city: string
  }>({
    client: null,
    region: null,
    city: ""
  })

  useEffect(() => {
    fetchData()
    
    // Set up real-time updates every 15 seconds for orders
    const interval = setInterval(() => {
      fetchData()
    }, 15000)
    
    // Set up transport price updates every 10 seconds for real-time sync
    const transportInterval = setInterval(async () => {
      try {
        const transportResponse = await fetch('/api/transport')
        if (transportResponse.ok) {
          const transportData = await transportResponse.json()
          setTransportTariffs(transportData.tariffs || [])
        }
      } catch (error) {
        console.error("Failed to fetch transport tariffs:", error)
      }
    }, 10000)
    
    // Check if mobile device
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
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

    return () => {
      clearInterval(interval)
      clearInterval(transportInterval)
      window.removeEventListener('resize', checkMobile)
      removeListener()
    }
  }, [])

  const fetchData = async () => {
    try {
      // Fetch orders from API to ensure persistence
      const ordersResponse = await fetch('/api/orders')
      if (ordersResponse.ok) {
        const ordersData = await ordersResponse.json()
        setOrders(ordersData.orders || [])
      } else {
        // Fallback to demo data if API fails
        setOrders(demoOrders)
      }
      
      // Set clients and regions (these are relatively static)
      setClients(demoClients)
      setRegions(demoRegions)
      
      // Fetch transport tariffs
      const transportResponse = await fetch('/api/transport')
      if (transportResponse.ok) {
        const transportData = await transportResponse.json()
        setTransportTariffs(transportData.tariffs || [])
      }
    } catch (error) {
      console.error("Failed to fetch data:", error)
      // Fallback to demo data
      setOrders(demoOrders)
      setClients(demoClients)
      setRegions(demoRegions)
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      client_id: "",
      region_id: "",
      product_5_5L_pallets: 0,
      product_1_5L_pallets: 0,
      truck_type: "factory",
      notes: "",
    })
    setSelectedClientDetails({
      client: null,
      region: null,
      city: ""
    })
    setCurrentOrder(null)
  }

  // Function to fetch client details from database
  const fetchClientDetails = async (clientId: string) => {
    try {
      // First try to fetch from API
      const response = await fetch(`/api/clients/${clientId}`)
      if (response.ok) {
        const client = await response.json()
        
        // Find the region for this client
        const region = regions.find(r => r.id === client.region_id)
        
        // Extract city from client address
        const city = client.address ? client.address.split(',')[1]?.trim() || client.address.split(',')[0]?.trim() : 'Unknown'
        
        // Update selected client details with comprehensive information
        setSelectedClientDetails({
          client: {
            ...client,
            // Ensure all fields are present
            name: client.name || 'Unknown Client',
            phone: client.phone || 'No Phone',
            address: client.address || 'No Address',
            contact_person: client.contact_person || client.name,
            rc_number: client.rc_number || 'No RC Number',
            region_id: client.region_id || 'Unknown Region'
          },
          region: region || null,
          city: city
        })
        
        // Update form data with region
        setFormData(prev => ({
          ...prev,
          region_id: client.region_id || ""
        }))
        
        return { client, region, city }
      } else {
        // Fallback to demo data
        const client = clients.find(c => c.id === clientId)
        if (client) {
          const region = regions.find(r => r.id === client.region_id)
          const city = client.address ? client.address.split(',')[1]?.trim() || client.address.split(',')[0]?.trim() : 'Unknown'
          
          setSelectedClientDetails({
            client: {
              ...client,
              name: client.name || 'Unknown Client',
              phone: client.phone || 'No Phone',
              address: client.address || 'No Address',
              contact_person: client.contact_person || client.name,
              rc_number: client.rc_number || 'No RC Number',
              region_id: client.region_id || 'Unknown Region'
            },
            region: region || null,
            city: city
          })
          
          setFormData(prev => ({
            ...prev,
            region_id: client.region_id || ""
          }))
          
          return { client, region, city }
        }
        console.error('Failed to fetch client details')
        return null
      }
    } catch (error) {
      console.error('Error fetching client details:', error)
      // Fallback to demo data
      const client = clients.find(c => c.id === clientId)
      if (client) {
        const region = regions.find(r => r.id === client.region_id)
        const city = client.address ? client.address.split(',')[1]?.trim() || client.address.split(',')[0]?.trim() : 'Unknown'
        
        setSelectedClientDetails({
          client: {
            ...client,
            name: client.name || 'Unknown Client',
            phone: client.phone || 'No Phone',
            address: client.address || 'No Address',
            contact_person: client.contact_person || client.name,
            rc_number: client.rc_number || 'No RC Number',
            region_id: client.region_id || 'Unknown Region'
          },
          region: region || null,
          city: city
        })
        
        setFormData(prev => ({
          ...prev,
          region_id: client.region_id || ""
        }))
        
        return { client, region, city }
      }
      return null
    }
  }

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
        
        await handleCreateOrderDirect(orderData)
        offlineStorage.removeOfflineOrder(order.id)
      }
      
      offlineStorage.updateLastSync()
      loadOfflineOrders()
    } catch (error) {
      console.error('Failed to sync offline orders:', error)
    }
  }

  // Direct order creation function for offline sync and mobile forms
  const handleCreateOrderDirect = async (orderData: any) => {
    try {
      const totalPallets = orderData.product_5_5L_pallets + orderData.product_1_5L_pallets
      const truckCapacity = totalPallets <= 22 ? 22 : totalPallets <= 24 ? 24 : 26
      
      // Calculate pricing
      const product5_5LPrice = orderData.product_5_5L_pallets * 212 * 65
      const product1_5LPrice = orderData.product_1_5L_pallets * 112 * 178.5
      const productTotal = product5_5LPrice + product1_5LPrice
      
      // Transport cost
      const transportCost = orderData.truck_type === "factory" ? getTransportCostForRegion(orderData.region_id) : 0
      const totalPrice = productTotal + transportCost

      const newOrder: Order = {
        id: `ORD-${Date.now()}`,
        client_id: orderData.client_id,
        region_id: orderData.region_id,
        assigned_to: "USR-004", // Operations team
        status: "pending" as const,
        total_price: totalPrice,
        product_5_5L_pallets: orderData.product_5_5L_pallets,
        product_1_5L_pallets: orderData.product_1_5L_pallets,
        truck_type: orderData.truck_type as "factory" | "client_own",
        truck_capacity: truckCapacity,
        delivery_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        notes: orderData.notes || "",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        clients: clients.find(c => c.id === orderData.client_id),
        regions: regions.find(r => r.id === orderData.region_id),
        // BL number is NOT automatically generated - Operations Team will assign it
        bl_number: null,
        approved_by: null,
        approved_at: null
      }

      // Create order via API to ensure persistence with validation
      const orderPayload = {
        client_id: orderData.client_id,
        region_id: orderData.region_id,
        assigned_to: "USR-004", // Operations team
        total_price: totalPrice,
        product_5_5L_pallets: orderData.product_5_5L_pallets,
        product_1_5L_pallets: orderData.product_1_5L_pallets,
        truck_type: orderData.truck_type,
        truck_capacity: truckCapacity,
        delivery_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        notes: orderData.notes || "",
        created_by: user?.id || 'unknown',
        // BL number is NOT automatically generated - Operations Team will assign it
        bl_number: null,
        approved_by: null,
        approved_at: null
      }

      const response = await ordersApi.create(orderPayload)

      if (!response.success) {
        throw new Error(response.error || 'Failed to create order')
      }

      const createdOrder = response.data
      
      // Update local state immediately for real-time UI update
      setOrders(prev => [createdOrder.order, ...prev])
      
      // Send notifications to relevant users
      await sendOrderNotifications(createdOrder.order)
      
      // Show success message
      showSuccess('Order Created', `Order ${createdOrder.order.id} has been created and saved to database`)
      
      // Log activity
      if (user) {
        await logEditActivity(
          user.id,
          user.name || 'Unknown User',
          'Order',
          newOrder.id,
          `Created order ${newOrder.id} for ${clients.find(c => c.id === orderData.client_id)?.name || 'Unknown Client'}`,
          {},
          {
            client_id: newOrder.client_id,
            region_id: newOrder.region_id,
            product_5_5L_pallets: newOrder.product_5_5L_pallets,
            product_1_5L_pallets: newOrder.product_1_5L_pallets,
            truck_type: newOrder.truck_type,
            total_price: newOrder.total_price,
            status: newOrder.status
          }
        )
      }
      
      return createdOrder.order
      
    } catch (error) {
      console.error("Failed to create order:", error)
      showError('Order Creation Failed', error instanceof Error ? error.message : 'Failed to create order')
      throw error
    }
  }


  const calculateOrderTotal = (orderData: any) => {
    const pallet5_5L = orderData.product_5_5L_pallets * 212 * 65
    const pallet1_5L = orderData.product_1_5L_pallets * 112 * 178.5
    return pallet5_5L + pallet1_5L
  }

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation - only require client, region will be auto-assigned
    if (!formData.client_id) {
      alert("Please select a client")
      return
    }

    if (formData.product_5_5L_pallets === 0 && formData.product_1_5L_pallets === 0) {
      alert("Please enter quantity for at least one product type")
      return
    }

    if (formData.product_5_5L_pallets < 0 || formData.product_1_5L_pallets < 0) {
      alert("Product quantities cannot be negative")
      return
    }

    try {
      // Get client details to auto-assign region
      const clientDetails = await fetchClientDetails(formData.client_id)
      if (!clientDetails) {
        alert("Failed to fetch client details")
        return
      }

      const totalPallets = formData.product_5_5L_pallets + formData.product_1_5L_pallets
      const truckCapacity = totalPallets <= 22 ? 22 : totalPallets <= 24 ? 24 : 26
      
      // Calculate pricing - Fixed calculation
      const product5_5LPrice = formData.product_5_5L_pallets * 212 * 65  // 212 bottles per pallet * 65 DA per bottle
      const product1_5LPrice = formData.product_1_5L_pallets * 112 * 178.5  // 112 bottles per pallet * 178.5 DA per bottle
      const productTotal = product5_5LPrice + product1_5LPrice
      
      // Transport cost - Fixed calculation
      const transportCost = formData.truck_type === "factory" ? getTransportCostForRegion(clientDetails.client.region_id) : 0
      const totalPrice = productTotal + transportCost

      const newOrder: Order = {
        id: `ORD-${Date.now()}`,
        client_id: formData.client_id,
        region_id: clientDetails.client.region_id, // Auto-assigned from client
        assigned_to: "USR-004", // Operations team
        status: "pending" as const,
        total_price: totalPrice,
        product_5_5L_pallets: formData.product_5_5L_pallets,
        product_1_5L_pallets: formData.product_1_5L_pallets,
        truck_type: formData.truck_type as "factory" | "client_own",
        truck_capacity: truckCapacity,
        delivery_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        notes: formData.notes,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        clients: clientDetails.client,
        regions: clientDetails.region,
      }

      // Create order via API to ensure persistence
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newOrder,
          created_by: user?.id || 'unknown'
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create order')
      }

      const createdOrder = await response.json()
      
      // Add to shared data store for real-time updates across all components
      addOrder(createdOrder.order)
      
      // Send notifications to relevant users
      await sendOrderNotifications(createdOrder.order)
      
      setIsCreateOpen(false)
      resetForm()
      
      // Show success message
      showEditSuccessToast('Order', `${newOrder.id} created successfully`)
      
      // Log activity
      if (user) {
        await logEditActivity(
          user.id,
          user.name || 'Unknown User',
          'Order',
          newOrder.id,
          `Created order ${newOrder.id} for ${selectedClientDetails.client?.name || 'Unknown Client'}`,
          {},
          {
            client_id: newOrder.client_id,
            region_id: newOrder.region_id,
            product_5_5L_pallets: newOrder.product_5_5L_pallets,
            product_1_5L_pallets: newOrder.product_1_5L_pallets,
            truck_type: newOrder.truck_type,
            total_price: newOrder.total_price,
            status: newOrder.status
          }
        )
      }
      
    } catch (error) {
      console.error("Failed to create order:", error)
      showEditErrorToast('Order', error instanceof Error ? error.message : 'Failed to create order')
    }
  }

  // Function to send notifications to relevant users
  const sendOrderNotifications = async (order: Order) => {
    try {
      const notificationData = {
        order_id: order.id,
        client_name: order.clients?.name || 'Unknown Client',
        total_price: order.total_price,
        region_name: order.regions?.name || 'Unknown Region',
        created_by: user?.id || 'unknown'
      }

      // Send notification to Operations Team
      await fetch('/api/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: "New Order Created",
          message: `Order ${order.id} created for ${notificationData.client_name} - Total: ${order.total_price.toLocaleString()} DA`,
          type: "order",
          priority: "high",
          target_role: "operations",
          order_data: notificationData
        })
      })

      // Send notification to Admin
      await fetch('/api/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: "New Order Created",
          message: `Order ${order.id} created for ${notificationData.client_name} in ${notificationData.region_name} region`,
          type: "order",
          priority: "medium",
          target_role: "admin",
          order_data: notificationData
        })
      })

      // Send notification to Regional Manager (if applicable)
      if (order.regions?.responsible) {
        await fetch('/api/notifications', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: "New Order in Your Region",
            message: `Order ${order.id} created for ${notificationData.client_name} in your region`,
            type: "order",
            priority: "medium",
            target_role: "regional_manager",
            target_region: order.region_id,
            order_data: notificationData
          })
        })
      }
    } catch (error) {
      console.error('Failed to send notifications:', error)
    }
  }


  const handleRejectOrder = async (order: Order, rejectionReason?: string) => {
    try {
      const response = await fetch(`/api/orders/${order.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'reject',
          rejection_reason: rejectionReason,
          user_id: user?.id || 'USR-004'
        })
      })

      if (response.ok) {
        const data = await response.json()
        updateOrder(order.id, data.order)
        alert(data.message)
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to reject order')
      }
    } catch (error) {
      console.error("Failed to reject order:", error)
      alert('Failed to reject order')
    }
  }

  const handleUpdateBLNumber = async (order: Order, blNumber: string) => {
    try {
      const response = await fetch(`/api/orders/${order.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'update_bl_number',
          bl_number: blNumber,
          user_id: user?.id || 'USR-004'
        })
      })

      if (response.ok) {
        const data = await response.json()
        updateOrder(order.id, data.order)
        alert(data.message)
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to update BL number')
      }
    } catch (error) {
      console.error("Failed to update BL number:", error)
      alert('Failed to update BL number')
    }
  }

  const handleUpdateTracking = async (order: Order, trackingInfo: any) => {
    try {
      const response = await fetch(`/api/orders/${order.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'update_tracking',
          tracking_info: trackingInfo,
          user_id: user?.id || 'USR-004'
        })
      })

      if (response.ok) {
        const data = await response.json()
        updateOrder(order.id, data.order)
        alert(data.message)
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to update tracking')
      }
    } catch (error) {
      console.error("Failed to update tracking:", error)
      alert('Failed to update tracking')
    }
  }

  const handleDeleteOrder = async (order: Order) => {
    try {
      const response = await fetch(`/api/orders/${order.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_role: user?.role || 'operations',
          user_id: user?.id || 'USR-004'
        })
      })

      if (response.ok) {
        const data = await response.json()
        updateOrder(order.id, data.order)
        alert(data.message)
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to delete order')
      }
    } catch (error) {
      console.error("Failed to delete order:", error)
      alert('Failed to delete order')
    }
  }

  const handleUpdateOrderStatus = async (order: Order, newStatus: string) => {
    try {
      const response = await fetch(`/api/orders/${order.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'update_status',
          status: newStatus
        })
      })

        if (response.ok) {
          const data = await response.json()
          // Update the order in shared data store
          updateOrder(order.id, data.order)
          alert(data.message)
        } else {
          const error = await response.json()
          alert(error.error || 'Failed to update order status')
        }
    } catch (error) {
      console.error("Failed to update order status:", error)
      alert('Failed to update order status')
    }
  }

  const canApproveOrder = (order: Order) => {
    return user?.role === 'operations' && order.status === 'pending'
  }

  const canRejectOrder = (order: Order) => {
    return user?.role === 'operations' && (order.status === 'pending' || order.status === 'processing')
  }

  const canUpdateBLNumber = (order: Order) => {
    return user?.role === 'operations' && order.status !== 'cancelled' && order.status !== 'deleted'
  }

  const canUpdateTracking = (order: Order) => {
    return user?.role === 'operations' && order.status !== 'cancelled' && order.status !== 'deleted'
  }

  const canDeleteOrder = (order: Order) => {
    return user?.role === 'operations' && order.status !== 'delivered'
  }

  const canCreateOrder = () => {
    return user?.role === 'operations' || user?.role === 'supervisor'
  }

  const canUpdateOrderStatus = (order: Order) => {
    return user?.role === 'operations' && ['pending', 'processing', 'in_transit'].includes(order.status)
  }

  const handleViewOrder = (order: Order) => {
    alert(`Order Details:\nID: ${order.id}\nClient: ${order.clients?.name}\nStatus: ${order.status}\nTotal: ${order.total_price.toLocaleString()} DA`)
  }

  const handleEditOrder = (order: Order) => {
    setCurrentOrder(order)
    setFormData({
      client_id: order.client_id,
      region_id: order.region_id,
      product_5_5L_pallets: order.product_5_5L_pallets,
      product_1_5L_pallets: order.product_1_5L_pallets,
      truck_type: order.truck_type,
      notes: order.notes || "",
    })
    setIsEditOpen(true)
  }

  const handleUpdateOrder = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!currentOrder) return

    try {
      const totalPallets = formData.product_5_5L_pallets + formData.product_1_5L_pallets
      const truckCapacity = totalPallets <= 22 ? 22 : totalPallets <= 24 ? 24 : 26
      
      // Calculate pricing
      const product5_5LPrice = formData.product_5_5L_pallets * 212 * 65
      const product1_5LPrice = formData.product_1_5L_pallets * 112 * 178.5
      const productTotal = product5_5LPrice + product1_5LPrice
      
      // Transport cost
      const transportCost = formData.truck_type === "factory" ? getTransportCostForRegion(formData.region_id) : 0
      const totalPrice = productTotal + transportCost

      const updateData = {
        action: 'edit',
        assigned_to: currentOrder.assigned_to,
        delivery_date: currentOrder.delivery_date,
        total_price: totalPrice,
        product_5_5L_pallets: formData.product_5_5L_pallets,
        product_1_5L_pallets: formData.product_1_5L_pallets,
        truck_type: formData.truck_type,
        truck_capacity: truckCapacity,
        notes: formData.notes,
        user_role: user?.role,
        user_id: user?.id
      }

      const response = await ordersApi.update(currentOrder.id, updateData)

      if (!response.success) {
        throw new Error(response.error || 'Failed to update order')
      }

      const updatedOrder = response.data.order

      // Update local state
      updateOrder(currentOrder.id, updatedOrder)

      // Show success message
      showSuccess('Order Updated', `Order ${currentOrder.id} has been updated successfully`)

      // Log activity
      if (user) {
        await logEditActivity(
          user.id,
          user.name || 'Unknown User',
          'Order',
          currentOrder.id,
          `Updated order ${currentOrder.id}`,
          {},
          updateData
        )
      }

      setIsEditOpen(false)
      setCurrentOrder(null)

    } catch (error) {
      console.error('Error updating order:', error)
      showError('Order Update Failed', error instanceof Error ? error.message : 'Failed to update order')
    }
  }

  // Helper function to get transport cost based on region
  const getTransportCostForRegion = (regionId: string) => {
    // First try to get cost from transport tariffs API
    const region = regions.find(r => r.id === regionId)
    if (region) {
      const tariff = transportTariffs.find(t => 
        t.city.toLowerCase().includes(region.name.toLowerCase()) || 
        region.name.toLowerCase().includes(t.city.toLowerCase())
      )
      if (tariff && tariff.status === 'active') {
        return tariff.cost_per_pallet
      }
    }
    
    // Fallback to hardcoded values if API data is not available
    const shippingCosts: { [key: string]: number } = {
      "REG-001": 31000, // Biskra
      "REG-002": 30000, // Ouled Djellal  
      "REG-003": 47000, // Oued Souf
      "REG-004": 42000, // El Mghair
    }
    
    return shippingCosts[regionId] || 0
  }
  const canEditOrder = (order: Order) => {
    // Operations Team can edit any order
    if (user?.role === "operations") {
      return true
    }
    
    // Admin and Regional Managers can edit any order
    if (user?.role === "admin" || user?.role === "regional_manager") {
      return true
    }
    
    // Allow supervisors to edit orders from their assigned cities
    if (user?.role === "supervisor") {
      const supervisorCities = ["Biskra", "Ouled Djellal", "Oued Souf", "El Mghair"]
      const client = clients.find(c => c.id === order.client_id)
      if (client) {
        const clientCity = client.address.split(',')[1]?.trim()
        return supervisorCities.includes(clientCity)
      }
    }
    
    return false
  }

  if (loading) {
    return <LoadingSpinner text="Loading Orders" subtext="Fetching your data..." />
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="p-4 md:p-6 lg:p-8 space-y-6">
        {/* Optimized Header */}
        <RevealOnScroll direction="down" delay={0.1}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 ${isUserAdmin ? 'bg-red-100 dark:bg-red-900' : 'bg-blue-100 dark:bg-blue-900'} rounded-lg transition-colors duration-200`}>
                  {isUserAdmin ? (
                    <Crown className="h-6 w-6 text-red-600 dark:text-red-400" />
                  ) : (
                    <Package className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Orders Management</h1>
                    {isUserAdmin && (
                      <Badge className={`${adminColors.secondary} px-2 py-1 text-xs font-bold transition-all duration-200`}>
                        <Shield className="h-3 w-3 mr-1" />
                        {getAdminBadge()}
                      </Badge>
                    )}
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    {isUserAdmin 
                      ? "Full administrative control over all orders and operations"
                      : "Manage and track all orders"
                    }
                  </p>
                  {isUserAdmin && (
                    <div className="flex items-center gap-4 mt-2">
                      <div className="flex items-center gap-1 text-xs text-red-600 dark:text-red-400">
                        <Zap className="h-3 w-3" />
                        <span className="font-medium">Override All Restrictions</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-red-600 dark:text-red-400">
                        <Lock className="h-3 w-3" />
                        <span className="font-medium">Full System Control</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Network Status */}
              <div className="flex items-center gap-3 text-sm">
                {isOnline ? (
                  <div className="flex items-center gap-1.5 text-green-600 dark:text-green-400">
                    <Wifi className="h-4 w-4" />
                    <span className="font-medium">Online</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-red-600 dark:text-red-400">
                    <WifiOff className="h-4 w-4" />
                    <span className="font-medium">Offline</span>
                  </div>
                )}
                {offlineOrders.length > 0 && (
                  <div className="flex items-center gap-1.5 text-yellow-600 dark:text-yellow-400">
                    <Clock className="h-4 w-4" />
                    <span className="font-medium">{offlineOrders.length} pending sync</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Mobile Order Form Button */}
              {isMobile && (
                <Button
                  onClick={() => setShowMobileForm(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow-md transition-all duration-200"
                >
                  <Smartphone className="mr-2 h-4 w-4" />
                  Mobile Order
                </Button>
              )}
              
              {/* Create Order Button */}
              {canCreateOrder && (
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow-md transition-all duration-200">
                      <Plus className="mr-2 h-4 w-4" />
                      Create Order
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                          <Plus className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        Create New Order
                      </DialogTitle>
                    </DialogHeader>
                    
                    <form onSubmit={handleCreateOrder} className="space-y-6">
                      {/* Client Selection */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                          <User className="h-5 w-5 text-blue-600" /> Client Details
                        </h3>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="client_id" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              Select Client
                            </Label>
                            <Select
                              value={formData.client_id}
                              onValueChange={async (value) => {
                                // Update form data immediately
                                setFormData(prev => ({ 
                                  ...prev, 
                                  client_id: value
                                }))
                                
                                // Fetch detailed client information from database
                                await fetchClientDetails(value)
                              }}
                            >
                              <SelectTrigger className="w-full mt-2">
                                <SelectValue placeholder="Choose a client from the list" />
                              </SelectTrigger>
                              <SelectContent className="max-h-60">
                                {clients.map((client) => (
                                  <SelectItem key={client.id} value={client.id}>
                                    <div className="flex flex-col items-start">
                                      <span className="font-medium text-gray-900 dark:text-white">{client.name}</span>
                                      <span className="text-sm text-gray-500 dark:text-gray-400">{client.address}</span>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          
                          {/* Auto-filled Client Information Display */}
                          {formData.client_id && selectedClientDetails.client && (
                            <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg border border-blue-200 dark:border-blue-800">
                              <div className="flex items-center gap-2 mb-4">
                                <MapPin className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                <span className="text-lg font-semibold text-blue-900 dark:text-blue-100">Client Information</span>
                                <div className="ml-auto">
                                  <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Verified
                                  </Badge>
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Client Details */}
                                <div className="space-y-3">
                                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 border-b pb-1">Client Details</h4>
                                  <div className="space-y-2">
                                    <div className="flex justify-between items-center py-2 px-3 bg-white dark:bg-gray-700 rounded">
                                      <span className="text-sm text-gray-600 dark:text-gray-400">Name:</span>
                                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                                        {selectedClientDetails.client.name}
                                      </span>
                                    </div>
                                    <div className="flex justify-between items-center py-2 px-3 bg-white dark:bg-gray-700 rounded">
                                      <span className="text-sm text-gray-600 dark:text-gray-400">Phone:</span>
                                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                                        {selectedClientDetails.client.phone}
                                      </span>
                                    </div>
                                    <div className="flex justify-between items-center py-2 px-3 bg-white dark:bg-gray-700 rounded">
                                      <span className="text-sm text-gray-600 dark:text-gray-400">Address:</span>
                                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                                        {selectedClientDetails.client.address}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                
                                {/* Region & Location Details */}
                                <div className="space-y-3">
                                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 border-b pb-1">Location & Region</h4>
                                  <div className="space-y-2">
                                    <div className="flex justify-between items-center py-2 px-3 bg-white dark:bg-gray-700 rounded">
                                      <span className="text-sm text-gray-600 dark:text-gray-400">City:</span>
                                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                                        {selectedClientDetails.city}
                                      </span>
                                    </div>
                                    <div className="flex justify-between items-center py-2 px-3 bg-white dark:bg-gray-700 rounded">
                                      <span className="text-sm text-gray-600 dark:text-gray-400">Region:</span>
                                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                                        {selectedClientDetails.region?.name || 'Not assigned'}
                                      </span>
                                    </div>
                                    <div className="flex justify-between items-center py-2 px-3 bg-white dark:bg-gray-700 rounded">
                                      <span className="text-sm text-gray-600 dark:text-gray-400">Regional Manager:</span>
                                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                                        {selectedClientDetails.region?.responsible || 'Not assigned'}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              
                              {/* Locked Fields Notice */}
                              <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded">
                                <div className="flex items-center gap-2">
                                  <Lock className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                                  <span className="text-sm text-yellow-800 dark:text-yellow-200 font-medium">
                                    Location information is automatically fetched from the database and cannot be modified for accuracy.
                                  </span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Product Details */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                          <Package className="h-5 w-5 text-blue-600" /> Product Quantities
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label htmlFor="product_5_5L_pallets" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              5.5L Bottles (Pallets)
                            </Label>
                            <Input
                              id="product_5_5L_pallets"
                              type="number"
                              value={formData.product_5_5L_pallets}
                              onChange={(e) => setFormData(prev => ({ ...prev, product_5_5L_pallets: parseInt(e.target.value) || 0 }))}
                              min="0"
                              className="w-full"
                              placeholder="Enter number of pallets"
                            />
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              212 units per pallet × 65 DA = {(formData.product_5_5L_pallets * 212 * 65).toLocaleString()} DA
                            </p>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="product_1_5L_pallets" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              1.5L Bottles (Pallets)
                            </Label>
                            <Input
                              id="product_1_5L_pallets"
                              type="number"
                              value={formData.product_1_5L_pallets}
                              onChange={(e) => setFormData(prev => ({ ...prev, product_1_5L_pallets: parseInt(e.target.value) || 0 }))}
                              min="0"
                              className="w-full"
                              placeholder="Enter number of pallets"
                            />
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              112 units per pallet × 178.5 DA = {(formData.product_1_5L_pallets * 112 * 178.5).toLocaleString()} DA
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Truck Type */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                          <Truck className="h-5 w-5 text-blue-600" /> Truck Type
                        </h3>
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Select Transportation Method
                          </Label>
                          <Select
                            value={formData.truck_type}
                            onValueChange={(value: "factory" | "client_own") => setFormData(prev => ({ ...prev, truck_type: value }))}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Choose transportation method" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="factory">
                                <div className="flex flex-col items-start">
                                  <span className="font-medium">Factory Truck</span>
                                  <span className="text-sm text-gray-500">
                                    {formData.region_id ? `${getTransportCostForRegion(formData.region_id).toLocaleString()} DA` : 'Cost will be calculated'}
                                  </span>
                                </div>
                              </SelectItem>
                              <SelectItem value="client_own">
                                <div className="flex flex-col items-start">
                                  <span className="font-medium">Client's Own Truck</span>
                                  <span className="text-sm text-gray-500">Free shipping</span>
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {formData.truck_type === "factory" 
                              ? "Client pays for shipping - cost included in total price"
                              : "Client provides their own transportation - no shipping cost"
                            }
                          </p>
                        </div>
                      </div>

                      {/* Price Calculation */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                          <Calculator className="h-5 w-5 text-blue-600" /> Price Calculation
                        </h3>
                        <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                          <div className="space-y-4">
                            {/* Product Costs */}
                            <div className="space-y-3">
                              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Product Costs</h4>
                              {formData.product_5_5L_pallets > 0 && (
                                <div className="flex justify-between items-center py-2 px-3 bg-white dark:bg-gray-700 rounded">
                                  <div>
                                    <span className="text-sm text-gray-600 dark:text-gray-400">5.5L Bottles</span>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                      {formData.product_5_5L_pallets} pallets × 212 units × 65 DA
                                    </div>
                                  </div>
                                  <span className="font-medium text-gray-900 dark:text-white">
                                    {(formData.product_5_5L_pallets * 212 * 65).toLocaleString()} DA
                                  </span>
                                </div>
                              )}
                              {formData.product_1_5L_pallets > 0 && (
                                <div className="flex justify-between items-center py-2 px-3 bg-white dark:bg-gray-700 rounded">
                                  <div>
                                    <span className="text-sm text-gray-600 dark:text-gray-400">1.5L Bottles</span>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                      {formData.product_1_5L_pallets} pallets × 112 units × 178.5 DA
                                    </div>
                                  </div>
                                  <span className="font-medium text-gray-900 dark:text-white">
                                    {(formData.product_1_5L_pallets * 112 * 178.5).toLocaleString()} DA
                                  </span>
                                </div>
                              )}
                            </div>
                            
                            {/* Shipping Cost */}
                            <div className="space-y-3">
                              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Shipping Cost</h4>
                              <div className="flex justify-between items-center py-2 px-3 bg-white dark:bg-gray-700 rounded">
                                <div>
                                  <span className="text-sm text-gray-600 dark:text-gray-400">
                                    {formData.truck_type === "factory" ? "Factory Truck" : "Client's Own Truck"}
                                  </span>
                                  <div className="text-xs text-gray-500 dark:text-gray-400">
                                    {formData.truck_type === "factory" 
                                      ? `${regions.find(r => r.id === formData.region_id)?.name || 'Selected region'} - Fixed cost`
                                      : "Client provides transportation"
                                    }
                                  </div>
                                </div>
                                <span className="font-medium text-gray-900 dark:text-white">
                                  {formData.truck_type === "factory" && formData.region_id 
                                    ? `${getTransportCostForRegion(formData.region_id).toLocaleString()} DA`
                                    : "0 DA"
                                  }
                                </span>
                              </div>
                            </div>
                            
                            {/* Total */}
                            <div className="border-t pt-4">
                              <div className="flex justify-between items-center py-3 px-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                                <span className="text-lg font-semibold text-gray-900 dark:text-white">Total Order Price</span>
                                <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
                                  {(() => {
                                    const product5_5LPrice = formData.product_5_5L_pallets * 212 * 65
                                    const product1_5LPrice = formData.product_1_5L_pallets * 112 * 178.5
                                    const productTotal = product5_5LPrice + product1_5LPrice
                                    const transportCost = formData.truck_type === "factory" && formData.region_id 
                                      ? getTransportCostForRegion(formData.region_id) 
                                      : 0
                                    return (productTotal + transportCost).toLocaleString()
                                  })()} DA
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Notes */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                          <Info className="h-5 w-5 text-blue-600" /> Additional Notes
                        </h3>
                        <div className="space-y-2">
                          <Label htmlFor="notes" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Special Instructions (Optional)
                          </Label>
                          <Textarea
                            id="notes"
                            placeholder="Enter any special instructions, delivery requirements, or additional notes for this order..."
                            value={formData.notes}
                            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                            className="min-h-[100px] resize-none"
                          />
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            These notes will be visible to the operations team and delivery personnel.
                          </p>
                        </div>
                      </div>

                      {/* Form Actions */}
                      <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsCreateOpen(false)}
                          className="w-full sm:w-auto"
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow-md transition-all duration-200"
                          disabled={!formData.client_id || (formData.product_5_5L_pallets === 0 && formData.product_1_5L_pallets === 0)}
                        >
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Create Order
                        </Button>
                      </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
              
              {/* Export Button */}
              <ExportButton
                type="orders"
                className="bg-gray-600 hover:bg-gray-700 text-white"
              />
            </div>
      </div>
        </RevealOnScroll>

        {/* Optimized Search and Filters */}
        <RevealOnScroll direction="up" delay={0.2}>
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="Search orders by client name, ID, or status..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={fetchData}
                    className="transition-all duration-200 hover:bg-blue-50 hover:border-blue-300"
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Refresh
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </RevealOnScroll>

        {/* Optimized Orders Table */}
        <RevealOnScroll direction="up" delay={0.3}>
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Package className="h-5 w-5 text-blue-600" />
                Orders ({orders.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-150">
                      <TableHead className="text-gray-900 dark:text-white font-semibold">Order ID</TableHead>
                      <TableHead className="text-gray-900 dark:text-white font-semibold sm:hidden">Client & Total</TableHead>
                      <TableHead className="text-gray-900 dark:text-white font-semibold md:table-cell">Client</TableHead>
                      <TableHead className="text-gray-900 dark:text-white font-semibold md:table-cell">Region</TableHead>
                      <TableHead className="text-gray-900 dark:text-white font-semibold md:table-cell">Status</TableHead>
                      <TableHead className="text-gray-900 dark:text-white font-semibold md:table-cell">BL Number</TableHead>
                      <TableHead className="text-gray-900 dark:text-white font-semibold md:table-cell">Products</TableHead>
                      <TableHead className="text-gray-900 dark:text-white font-semibold md:table-cell">Truck</TableHead>
                      <TableHead className="text-gray-900 dark:text-white font-semibold md:table-cell text-right">Total Price</TableHead>
                      <TableHead className="text-gray-900 dark:text-white font-semibold md:table-cell">Delivery Date</TableHead>
                      <TableHead className="text-gray-900 dark:text-white font-semibold text-center">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders
                      .filter(order => 
                        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        order.clients?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        order.status.toLowerCase().includes(searchTerm.toLowerCase())
                      )
                      .map((order, index) => (
                        <TableRow 
                          key={order.id} 
                          className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150 group"
                        >
                          <TableCell className="font-medium text-gray-900 dark:text-white">
                            {order.id}
                          </TableCell>
                          
                          {/* Mobile View - Combined Client & Total */}
                          <TableCell className="sm:hidden">
                            <div className="space-y-1">
                              <div className="font-medium text-gray-900 dark:text-white">
                                {order.clients?.name}
                              </div>
                              <div className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                                {order.total_price.toLocaleString()} DA
                              </div>
                            </div>
                          </TableCell>
                          
                          {/* Desktop View - Separate Columns */}
                          <TableCell className="md:table-cell">
                            <div className="space-y-1">
                              <div className="font-medium text-gray-900 dark:text-white">
                                {order.clients?.name}
                              </div>
                              <div className="text-sm text-gray-600 dark:text-gray-400">
                                {order.clients?.phone}
                              </div>
                            </div>
                          </TableCell>
                          
                          <TableCell className="md:table-cell">
                            <div className="space-y-1">
                              <div className="font-medium text-gray-900 dark:text-white">
                                {order.regions?.name}
                              </div>
                              <div className="text-sm text-gray-600 dark:text-gray-400">
                                {order.regions?.responsible}
                              </div>
                            </div>
                          </TableCell>
                          
                          <TableCell className="md:table-cell">
                            <Badge 
                              variant={
                                order.status === "delivered" ? "default" : 
                                order.status === "processing" ? "secondary" : 
                                order.status === "cancelled" ? "destructive" : 
                                "outline"
                              }
                              className={
                                order.status === "delivered" ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" :
                                order.status === "processing" ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" :
                                order.status === "cancelled" ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" :
                                "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                              }
                            >
                              {order.status}
                        </Badge>
                          </TableCell>
                          
                          <TableCell className="md:table-cell">
                            {order.bl_number ? (
                              <div className="space-y-1">
                                <div className="font-medium text-green-600 dark:text-green-400">
                                  {order.bl_number}
                                </div>
                                {order.approved_at && (
                                  <div className="text-xs text-gray-500 dark:text-gray-400">
                                    Approved: {new Date(order.approved_at).toLocaleDateString()}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="text-gray-400 dark:text-gray-500 text-sm">
                                Not assigned
                              </div>
                            )}
                          </TableCell>
                          
                          <TableCell className="md:table-cell">
                            <div className="space-y-1">
                              {order.product_5_5L_pallets > 0 && (
                                <div className="text-sm text-gray-900 dark:text-white">
                                  5.5L: {order.product_5_5L_pallets} pallets
                                </div>
                              )}
                              {order.product_1_5L_pallets > 0 && (
                                <div className="text-sm text-gray-900 dark:text-white">
                                  1.5L: {order.product_1_5L_pallets} pallets
                                </div>
                              )}
                            </div>
                          </TableCell>
                          
                          <TableCell className="md:table-cell">
                            <div className="space-y-1">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {order.truck_type === "factory" ? "Factory Truck" : "Client's Truck"}
                              </div>
                              <div className="text-sm text-gray-600 dark:text-gray-400">
                                {order.truck_capacity} pallets
                              </div>
                            </div>
                          </TableCell>
                          
                          <TableCell className="md:table-cell text-right">
                            <div className="font-semibold text-blue-600 dark:text-blue-400">
                              {order.total_price.toLocaleString()} DA
                            </div>
                          </TableCell>
                          
                          <TableCell className="md:table-cell">
                            <div className="text-sm text-gray-900 dark:text-white">
                              {new Date(order.delivery_date).toLocaleDateString()}
                            </div>
                          </TableCell>
                          
                          <TableCell className="text-center">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="h-3 w-3" />
                        </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleViewOrder(order)}>
                                  <Info className="mr-2 h-3 w-3" />
                                  View Details
                                </DropdownMenuItem>
                                {canEditOrder(order) && (
                                  <DropdownMenuItem onClick={() => handleEditOrder(order)}>
                                    <Edit className="mr-2 h-3 w-3" />
                                    Edit Order
                                  </DropdownMenuItem>
                                )}
                                {canApproveOrder(order) && (
                                  <DropdownMenuItem onClick={() => handleApproveOrder(order)}>
                                    <CheckCircle className="mr-2 h-3 w-3" />
                                    Approve Order
                                  </DropdownMenuItem>
                                )}
                                {canRejectOrder(order) && (
                                  <DropdownMenuItem onClick={() => {
                                    const reason = prompt('Enter rejection reason (optional):')
                                    handleRejectOrder(order, reason || undefined)
                                  }}>
                                    <AlertCircle className="mr-2 h-3 w-3" />
                                    Reject Order
                                  </DropdownMenuItem>
                                )}
                                {canUpdateBLNumber(order) && (
                                  <DropdownMenuItem onClick={() => {
                                    const blNumber = prompt('Enter BL Number:', order.bl_number || '')
                                    if (blNumber) handleUpdateBLNumber(order, blNumber)
                                  }}>
                                    <FileText className="mr-2 h-3 w-3" />
                                    Update BL Number
                                  </DropdownMenuItem>
                                )}
                                {canUpdateTracking(order) && (
                                  <DropdownMenuItem onClick={() => {
                                    const trackingInfo = {
                                      location: prompt('Enter current location:') || '',
                                      estimated_delivery: prompt('Enter estimated delivery date (YYYY-MM-DD):') || '',
                                      notes: prompt('Enter tracking notes:') || ''
                                    }
                                    handleUpdateTracking(order, trackingInfo)
                                  }}>
                                    <MapPin className="mr-2 h-3 w-3" />
                                    Update Tracking
                                  </DropdownMenuItem>
                                )}
                                {canUpdateOrderStatus(order) && (
                                  <>
                                    <DropdownMenuItem onClick={() => handleUpdateOrderStatus(order, 'processing')}>
                                      <Clock className="mr-2 h-3 w-3" />
                                      Mark as Processing
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleUpdateOrderStatus(order, 'in_transit')}>
                                      <Truck className="mr-2 h-3 w-3" />
                                      Mark as In Transit
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleUpdateOrderStatus(order, 'delivered')}>
                                      <CheckCircle className="mr-2 h-3 w-3" />
                                      Mark as Delivered
                                    </DropdownMenuItem>
                                  </>
                                )}
                                {canEditOrder(order) && (
                                  <DropdownMenuItem onClick={() => handleEditOrder(order)}>
                                    <Edit className="mr-2 h-3 w-3" />
                                    Edit Order
                                  </DropdownMenuItem>
                                )}
                                {canDeleteOrder(order) && (
                                  <DropdownMenuItem onClick={() => {
                                    if (confirm('Are you sure you want to delete this order?')) {
                                      handleDeleteOrder(order)
                                    }
                                  }}>
                                    <Trash2 className="mr-2 h-3 w-3" />
                                    Delete Order
                                  </DropdownMenuItem>
                                )}
                                {canDeleteOrder(order) && (
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                        <Trash2 className="mr-2 h-3 w-3" />
                                        Delete Order
                                      </DropdownMenuItem>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Delete Order</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          Are you sure you want to delete order {order.id}? This action cannot be undone.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction
                                          onClick={() => handleDeleteOrder(order.id)}
                                          className="bg-red-600 hover:bg-red-700 text-white"
                                        >
                                          Delete
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
          </div>
        </CardContent>
      </Card>
        </RevealOnScroll>

        {/* Edit Order Dialog */}
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <Edit className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                Edit Order
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleUpdateOrder} className="space-y-6">
              {/* Client Selection */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <User className="h-5 w-5 text-blue-600" /> Client Details
                </h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="edit_client_id" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Select Client
                    </Label>
                    <Select
                      value={formData.client_id}
                      onValueChange={async (value) => {
                        // Update form data immediately
                        setFormData(prev => ({ 
                          ...prev, 
                          client_id: value
                        }))
                        
                        // Fetch detailed client information from database
                        await fetchClientDetails(value)
                      }}
                    >
                      <SelectTrigger className="w-full mt-2">
                        <SelectValue placeholder="Choose a client from the list" />
                      </SelectTrigger>
                      <SelectContent className="max-h-60">
                        {clients.map((client) => (
                          <SelectItem key={client.id} value={client.id}>
                            <div className="flex flex-col items-start">
                              <span className="font-medium text-gray-900 dark:text-white">{client.name}</span>
                              <span className="text-sm text-gray-500 dark:text-gray-400">{client.address}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Auto-filled Client Information Display */}
                  {formData.client_id && selectedClientDetails.client && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg border border-blue-200 dark:border-blue-800">
                      <div className="flex items-center gap-2 mb-4">
                        <MapPin className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        <span className="text-lg font-semibold text-blue-900 dark:text-blue-100">Client Information</span>
                        <div className="ml-auto">
                          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Verified
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Client Details */}
                        <div className="space-y-3">
                          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 border-b pb-1">Client Details</h4>
                          <div className="space-y-2">
                            <div className="flex justify-between items-center py-2 px-3 bg-white dark:bg-gray-700 rounded">
                              <span className="text-sm text-gray-600 dark:text-gray-400">Name:</span>
                              <span className="text-sm font-medium text-gray-900 dark:text-white">
                                {selectedClientDetails.client.name}
                              </span>
                            </div>
                            <div className="flex justify-between items-center py-2 px-3 bg-white dark:bg-gray-700 rounded">
                              <span className="text-sm text-gray-600 dark:text-gray-400">Phone:</span>
                              <span className="text-sm font-medium text-gray-900 dark:text-white">
                                {selectedClientDetails.client.phone}
                              </span>
                            </div>
                            <div className="flex justify-between items-center py-2 px-3 bg-white dark:bg-gray-700 rounded">
                              <span className="text-sm text-gray-600 dark:text-gray-400">Address:</span>
                              <span className="text-sm font-medium text-gray-900 dark:text-white">
                                {selectedClientDetails.client.address}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Region & Location Details */}
                        <div className="space-y-3">
                          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 border-b pb-1">Location & Region</h4>
                          <div className="space-y-2">
                            <div className="flex justify-between items-center py-2 px-3 bg-white dark:bg-gray-700 rounded">
                              <span className="text-sm text-gray-600 dark:text-gray-400">City:</span>
                              <span className="text-sm font-medium text-gray-900 dark:text-white">
                                {selectedClientDetails.city}
                              </span>
                            </div>
                            <div className="flex justify-between items-center py-2 px-3 bg-white dark:bg-gray-700 rounded">
                              <span className="text-sm text-gray-600 dark:text-gray-400">Region:</span>
                              <span className="text-sm font-medium text-gray-900 dark:text-white">
                                {selectedClientDetails.region?.name || 'Not assigned'}
                              </span>
                            </div>
                            <div className="flex justify-between items-center py-2 px-3 bg-white dark:bg-gray-700 rounded">
                              <span className="text-sm text-gray-600 dark:text-gray-400">Regional Manager:</span>
                              <span className="text-sm font-medium text-gray-900 dark:text-white">
                                {selectedClientDetails.region?.responsible || 'Not assigned'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Locked Fields Notice */}
                      <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded">
                        <div className="flex items-center gap-2">
                          <Lock className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                          <span className="text-sm text-yellow-800 dark:text-yellow-200 font-medium">
                            Location information is automatically fetched from the database and cannot be modified for accuracy.
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Product Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Package className="h-5 w-5 text-blue-600" /> Product Quantities
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="edit_product_5_5L_pallets" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      5.5L Bottles (Pallets)
                    </Label>
                    <Input
                      id="edit_product_5_5L_pallets"
                      type="number"
                      value={formData.product_5_5L_pallets}
                      onChange={(e) => setFormData(prev => ({ ...prev, product_5_5L_pallets: parseInt(e.target.value) || 0 }))}
                      min="0"
                      className="w-full"
                      placeholder="Enter number of pallets"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      212 units per pallet × 65 DA = {(formData.product_5_5L_pallets * 212 * 65).toLocaleString()} DA
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit_product_1_5L_pallets" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      1.5L Bottles (Pallets)
                    </Label>
                    <Input
                      id="edit_product_1_5L_pallets"
                      type="number"
                      value={formData.product_1_5L_pallets}
                      onChange={(e) => setFormData(prev => ({ ...prev, product_1_5L_pallets: parseInt(e.target.value) || 0 }))}
                      min="0"
                      className="w-full"
                      placeholder="Enter number of pallets"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      112 units per pallet × 178.5 DA = {(formData.product_1_5L_pallets * 112 * 178.5).toLocaleString()} DA
                    </p>
                  </div>
                </div>
              </div>

              {/* Truck Type */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Truck className="h-5 w-5 text-blue-600" /> Truck Type
                </h3>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Select Transportation Method
                  </Label>
                  <Select
                    value={formData.truck_type}
                    onValueChange={(value: "factory" | "client_own") => setFormData(prev => ({ ...prev, truck_type: value }))}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Choose transportation method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="factory">
                        <div className="flex flex-col items-start">
                          <span className="font-medium">Factory Truck</span>
                          <span className="text-sm text-gray-500">
                            {formData.region_id ? `${getTransportCostForRegion(formData.region_id).toLocaleString()} DA` : 'Cost will be calculated'}
                          </span>
                        </div>
                      </SelectItem>
                      <SelectItem value="client_own">
                        <div className="flex flex-col items-start">
                          <span className="font-medium">Client's Own Truck</span>
                          <span className="text-sm text-gray-500">Free shipping</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {formData.truck_type === "factory" 
                      ? "Client pays for shipping - cost included in total price"
                      : "Client provides their own transportation - no shipping cost"
                    }
                  </p>
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Info className="h-5 w-5 text-blue-600" /> Additional Notes
                </h3>
                <div className="space-y-2">
                  <Label htmlFor="edit_notes" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Special Instructions (Optional)
                  </Label>
                  <Textarea
                    id="edit_notes"
                    placeholder="Enter any special instructions, delivery requirements, or additional notes for this order..."
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    className="min-h-[100px] resize-none"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    These notes will be visible to the operations team and delivery personnel.
                  </p>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditOpen(false)}
                  className="w-full sm:w-auto"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow-md transition-all duration-200"
                  disabled={!formData.client_id || (formData.product_5_5L_pallets === 0 && formData.product_1_5L_pallets === 0)}
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Update Order
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Mobile Order Form */}
        {showMobileForm && (
          <MobileOrderForm
            clients={clients}
            regions={regions}
            onCreateOrder={handleCreateOrderDirect}
            onClose={() => setShowMobileForm(false)}
          />
        )}
      </div>
    </div>
  )
}

export default withAuth(OrdersPage)