"use client"

import React, { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Textarea } from "@/components/ui/textarea"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useDataStore } from '@/lib/shared-data-store'

// Mock auth hook for demo
const useAuth = () => ({
  user: { id: "demo-operations", role: "operations", name: "Operations Team" }
})

const withAuth = (Component: any) => Component

interface PalletTracking {
  id: string
  order_id: string
  client_id: string
  wooden_pallets_sent: number
  intercalaires_sent: number
  wooden_pallets_returned: number
  intercalaires_returned: number
  wooden_pallets_good_condition: number
  wooden_pallets_bad_condition: number
  intercalaires_good_condition: number
  intercalaires_bad_condition: number
  return_date: string | null
  notes: string
  status: "no_return" | "partial_return" | "full_return"
  created_at: string
  updated_at: string
}

interface Order {
  id: string
  client_id: string
  status: string
  total_price: number
  product_5_5L_pallets: number
  product_1_5L_pallets: number
  clients?: {
    name: string
    address: string
  }
}

function PalletTrackingPage() {
  const { user } = useAuth()
  const { orders, refreshData } = useDataStore()
  const [palletTracking, setPalletTracking] = useState<PalletTracking[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [selectedTracking, setSelectedTracking] = useState<PalletTracking | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [formData, setFormData] = useState({
    order_id: "",
    wooden_pallets_sent: "",
    intercalaires_sent: "",
    wooden_pallets_returned: "",
    intercalaires_returned: "",
    wooden_pallets_good_condition: "",
    wooden_pallets_bad_condition: "",
    intercalaires_good_condition: "",
    intercalaires_bad_condition: "",
    return_date: "",
    notes: ""
  })

  // Demo data
  const demoPalletTracking: PalletTracking[] = [
    {
      id: "PALLET-001",
      order_id: "ORD-001",
      client_id: "CLI-001",
      wooden_pallets_sent: 22,
      intercalaires_sent: 88,
      wooden_pallets_returned: 20,
      intercalaires_returned: 80,
      wooden_pallets_good_condition: 18,
      wooden_pallets_bad_condition: 2,
      intercalaires_good_condition: 75,
      intercalaires_bad_condition: 5,
      return_date: "2024-01-15",
      notes: "Client returned most pallets in good condition",
      status: "partial_return",
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-15T00:00:00Z"
    },
    {
      id: "PALLET-002",
      order_id: "ORD-002",
      client_id: "CLI-002",
      wooden_pallets_sent: 24,
      intercalaires_sent: 96,
      wooden_pallets_returned: 0,
      intercalaires_returned: 0,
      wooden_pallets_good_condition: 0,
      wooden_pallets_bad_condition: 0,
      intercalaires_good_condition: 0,
      intercalaires_bad_condition: 0,
      return_date: null,
      notes: "No returns yet",
      status: "no_return",
      created_at: "2024-01-02T00:00:00Z",
      updated_at: "2024-01-02T00:00:00Z"
    }
  ]

  const demoOrders: Order[] = [
    {
      id: "ORD-001",
      client_id: "CLI-001",
      status: "delivered",
      total_price: 125000,
      product_5_5L_pallets: 11,
      product_1_5L_pallets: 11,
      clients: {
        name: "Biskra Water Distributor",
        address: "123 Main Street, Biskra"
      }
    },
    {
      id: "ORD-002",
      client_id: "CLI-002",
      status: "delivered",
      total_price: 89000,
      product_5_5L_pallets: 12,
      product_1_5L_pallets: 12,
      clients: {
        name: "Ouled Djellal Store",
        address: "456 Market Square, Ouled Djellal"
      }
    }
  ]

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        
        // Fetch pallet tracking data
        const trackingResponse = await fetch('/api/pallet-tracking')
        if (trackingResponse.ok) {
          const trackingData = await trackingResponse.json()
          setPalletTracking(trackingData.palletTracking || [])
        }
        
        // Refresh orders from shared data store
        await refreshData()
        
      } catch (error) {
        console.error('Error fetching pallet tracking data:', error)
        // Fallback to demo data
        setPalletTracking(demoPalletTracking)
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
    
    // Set up real-time updates
    const interval = setInterval(fetchData, 10000) // Update every 10 seconds
    
    return () => clearInterval(interval)
  }, [refreshData])

  const calculatePalletsFromOrder = (order: Order) => {
    const totalPallets = order.product_5_5L_pallets + order.product_1_5L_pallets
    return {
      wooden_pallets: totalPallets,
      intercalaires: totalPallets * 4 // 4 intercalaires per pallet
    }
  }

  const handleCreateTracking = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate required fields with proper handling of zero values
    if (!formData.order_id || formData.order_id.trim() === '') {
      alert("Please select an order")
      return
    }
    
    if (formData.wooden_pallets_sent === undefined || formData.wooden_pallets_sent === null || formData.wooden_pallets_sent === '') {
      alert("Please enter wooden pallets sent quantity")
      return
    }
    
    if (formData.intercalaires_sent === undefined || formData.intercalaires_sent === null || formData.intercalaires_sent === '') {
      alert("Please enter intercalaires sent quantity")
      return
    }
    
    // Validate that quantities are non-negative
    if (parseInt(formData.wooden_pallets_sent) < 0) {
      alert("Wooden pallets sent cannot be negative")
      return
    }
    
    if (parseInt(formData.intercalaires_sent) < 0) {
      alert("Intercalaires sent cannot be negative")
      return
    }

    // Find the client_id from the selected order
    const selectedOrder = orders.find(order => order.id === formData.order_id)
    if (!selectedOrder) {
      alert("Selected order not found")
      return
    }

    try {
      const response = await fetch('/api/pallet-tracking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          order_id: formData.order_id,
          client_id: selectedOrder.client_id,
          wooden_pallets_sent: parseInt(formData.wooden_pallets_sent),
          intercalaires_sent: parseInt(formData.intercalaires_sent),
          wooden_pallets_returned: parseInt(formData.wooden_pallets_returned) || 0,
          intercalaires_returned: parseInt(formData.intercalaires_returned) || 0,
          wooden_pallets_good_condition: parseInt(formData.wooden_pallets_good_condition) || 0,
          wooden_pallets_bad_condition: parseInt(formData.wooden_pallets_bad_condition) || 0,
          intercalaires_good_condition: parseInt(formData.intercalaires_good_condition) || 0,
          intercalaires_bad_condition: parseInt(formData.intercalaires_bad_condition) || 0,
          return_date: formData.return_date || null,
          notes: formData.notes || ""
        })
      })

      if (response.ok) {
        const data = await response.json()
        setPalletTracking(prev => [data.palletTracking, ...prev])
        setIsCreateOpen(false)
        resetForm()
        alert(data.message || 'Pallet tracking record created successfully')
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to create pallet tracking')
      }
    } catch (error) {
      console.error("Failed to create pallet tracking:", error)
      alert('Failed to create pallet tracking')
    }
  }

  const resetForm = () => {
    setFormData({
      order_id: "",
      wooden_pallets_sent: "",
      intercalaires_sent: "",
      wooden_pallets_returned: "",
      intercalaires_returned: "",
      wooden_pallets_good_condition: "",
      wooden_pallets_bad_condition: "",
      intercalaires_good_condition: "",
      intercalaires_bad_condition: "",
      return_date: "",
      notes: ""
    })
  }

  const handleEdit = (tracking: PalletTracking) => {
    setSelectedTracking(tracking)
    setFormData({
      order_id: tracking.order_id,
      wooden_pallets_sent: tracking.wooden_pallets_sent.toString(),
      intercalaires_sent: tracking.intercalaires_sent.toString(),
      wooden_pallets_returned: tracking.wooden_pallets_returned.toString(),
      intercalaires_returned: tracking.intercalaires_returned.toString(),
      wooden_pallets_good_condition: tracking.wooden_pallets_good_condition.toString(),
      wooden_pallets_bad_condition: tracking.wooden_pallets_bad_condition.toString(),
      intercalaires_good_condition: tracking.intercalaires_good_condition.toString(),
      intercalaires_bad_condition: tracking.intercalaires_bad_condition.toString(),
      return_date: tracking.return_date || "",
      notes: tracking.notes
    })
    setIsEditOpen(true)
  }

  const handleDelete = async (trackingId: string) => {
    try {
      const response = await fetch(`/api/pallet-tracking?id=${trackingId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setPalletTracking(prev => prev.filter(tracking => tracking.id !== trackingId))
        alert("Pallet tracking record deleted successfully!")
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to delete pallet tracking')
      }
    } catch (error) {
      console.error("Failed to delete pallet tracking:", error)
      alert('Failed to delete pallet tracking')
    }
  }

  const filteredTracking = palletTracking.filter(tracking => {
    const matchesSearch = tracking.order_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tracking.client_id.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === "all" || tracking.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const canManageTracking = user?.role === "admin" || user?.role === "operations"

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="p-4 md:p-6 lg:p-8 space-y-6">
        {/* Enhanced Header */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg shadow-lg">
                  <ClipboardList className="h-6 w-6 text-white" />
                </div>
                <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                  Pallet Tracking
                </h1>
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                Track wooden pallets and intercalaires sent to clients and monitor returns
              </p>
            </div>
            
            {canManageTracking && (
              <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogTrigger asChild>
                  <Button 
                    size="lg"
                    className="w-full lg:w-auto bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                    onClick={resetForm}
                  >
                    <Plus className="mr-2 h-5 w-5" />
                    Add Tracking Record
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-bold flex items-center gap-3">
                      <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                        <ClipboardList className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                      </div>
                      Add Pallet Tracking Record
                    </DialogTitle>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                      Track pallets and intercalaires sent to clients and monitor their return status.
                    </p>
                  </DialogHeader>
                  <form onSubmit={handleCreateTracking} className="space-y-6 pt-4">
                    <div>
                      <Label htmlFor="order_id" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Order <span className="text-red-500">*</span>
                      </Label>
                      <select
                        id="order_id"
                        value={formData.order_id}
                        onChange={(e) => {
                          const selectedOrder = orders.find(o => o.id === e.target.value)
                          if (selectedOrder) {
                            const pallets = calculatePalletsFromOrder(selectedOrder)
                            setFormData({ 
                              ...formData, 
                              order_id: e.target.value,
                              wooden_pallets_sent: pallets.wooden_pallets.toString(),
                              intercalaires_sent: pallets.intercalaires.toString()
                            })
                          } else {
                            setFormData({ ...formData, order_id: e.target.value })
                          }
                        }}
                        className="w-full h-12 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        required
                      >
                        <option value="">Select an order...</option>
                        {orders.map((order) => (
                          <option key={order.id} value={order.id}>
                            {order.id} - {order.clients?.name} ({order.clients?.address})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="wooden_pallets_sent" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Wooden Pallets Sent <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="wooden_pallets_sent"
                          type="number"
                          value={formData.wooden_pallets_sent}
                          onChange={(e) => setFormData({ ...formData, wooden_pallets_sent: e.target.value })}
                          placeholder="22"
                          className="h-12"
                          min="0"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="intercalaires_sent" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Intercalaires Sent <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="intercalaires_sent"
                          type="number"
                          value={formData.intercalaires_sent}
                          onChange={(e) => setFormData({ ...formData, intercalaires_sent: e.target.value })}
                          placeholder="88"
                          className="h-12"
                          min="0"
                          required
                        />
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Return Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="wooden_pallets_returned" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Wooden Pallets Returned
                          </Label>
                          <Input
                            id="wooden_pallets_returned"
                            type="number"
                            value={formData.wooden_pallets_returned}
                            onChange={(e) => setFormData({ ...formData, wooden_pallets_returned: e.target.value })}
                            placeholder="0"
                            className="h-12"
                            min="0"
                          />
                        </div>
                        <div>
                          <Label htmlFor="intercalaires_returned" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Intercalaires Returned
                          </Label>
                          <Input
                            id="intercalaires_returned"
                            type="number"
                            value={formData.intercalaires_returned}
                            onChange={(e) => setFormData({ ...formData, intercalaires_returned: e.target.value })}
                            placeholder="0"
                            className="h-12"
                            min="0"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Condition Assessment</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="wooden_pallets_good_condition" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Wooden Pallets - Good Condition
                          </Label>
                          <Input
                            id="wooden_pallets_good_condition"
                            type="number"
                            value={formData.wooden_pallets_good_condition}
                            onChange={(e) => setFormData({ ...formData, wooden_pallets_good_condition: e.target.value })}
                            placeholder="0"
                            className="h-12"
                            min="0"
                          />
                        </div>
                        <div>
                          <Label htmlFor="wooden_pallets_bad_condition" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Wooden Pallets - Bad Condition
                          </Label>
                          <Input
                            id="wooden_pallets_bad_condition"
                            type="number"
                            value={formData.wooden_pallets_bad_condition}
                            onChange={(e) => setFormData({ ...formData, wooden_pallets_bad_condition: e.target.value })}
                            placeholder="0"
                            className="h-12"
                            min="0"
                          />
                        </div>
                        <div>
                          <Label htmlFor="intercalaires_good_condition" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Intercalaires - Good Condition
                          </Label>
                          <Input
                            id="intercalaires_good_condition"
                            type="number"
                            value={formData.intercalaires_good_condition}
                            onChange={(e) => setFormData({ ...formData, intercalaires_good_condition: e.target.value })}
                            placeholder="0"
                            className="h-12"
                            min="0"
                          />
                        </div>
                        <div>
                          <Label htmlFor="intercalaires_bad_condition" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Intercalaires - Bad Condition
                          </Label>
                          <Input
                            id="intercalaires_bad_condition"
                            type="number"
                            value={formData.intercalaires_bad_condition}
                            onChange={(e) => setFormData({ ...formData, intercalaires_bad_condition: e.target.value })}
                            placeholder="0"
                            className="h-12"
                            min="0"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="return_date" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Return Date
                        </Label>
                        <Input
                          id="return_date"
                          type="date"
                          value={formData.return_date}
                          onChange={(e) => setFormData({ ...formData, return_date: e.target.value })}
                          className="h-12"
                        />
                      </div>
                      <div>
                        <Label htmlFor="notes" className="text-sm font-medium text-gray-700 dark:text-gray-300">Notes</Label>
                        <Textarea
                          id="notes"
                          value={formData.notes}
                          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                          placeholder="Additional notes about pallet condition..."
                          className="min-h-[100px]"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsCreateOpen(false)}
                        className="px-6"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        className="px-8 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 shadow-lg hover:shadow-xl transition-all duration-200"
                      >
                        <ClipboardList className="mr-2 h-4 w-4" />
                        Create Tracking Record
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by Order ID or Client ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-12"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="h-12 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="all">All Status</option>
                <option value="no_return">No Return</option>
                <option value="partial_return">Partial Return</option>
                <option value="full_return">Full Return</option>
              </select>
              <Button variant="outline" size="sm" className="h-12 px-4">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </div>

        {/* Enhanced Pallet Tracking Table */}
        <Card className="shadow-lg border-0 bg-white dark:bg-gray-800">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-t-xl">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                  <ClipboardList className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold">Pallet Tracking ({filteredTracking.length})</CardTitle>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Monitor pallet and intercalaire returns</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" className="hover:bg-purple-50 dark:hover:bg-purple-900/20">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 dark:bg-gray-700">
                    <TableHead className="font-semibold text-gray-700 dark:text-gray-300">Order</TableHead>
                    <TableHead className="font-semibold text-gray-700 dark:text-gray-300">Client</TableHead>
                    <TableHead className="font-semibold text-gray-700 dark:text-gray-300">Sent</TableHead>
                    <TableHead className="font-semibold text-gray-700 dark:text-gray-300">Returned</TableHead>
                    <TableHead className="font-semibold text-gray-700 dark:text-gray-300">Condition</TableHead>
                    <TableHead className="font-semibold text-gray-700 dark:text-gray-300">Status</TableHead>
                    <TableHead className="font-semibold text-gray-700 dark:text-gray-300">Return Date</TableHead>
                    <TableHead className="font-semibold text-gray-700 dark:text-gray-300 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTracking.map((tracking) => {
                    const order = orders.find(o => o.id === tracking.order_id)
                    return (
                      <TableRow key={tracking.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium text-gray-900 dark:text-white">{tracking.order_id}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">ID: {tracking.id}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium text-gray-900 dark:text-white">{order?.clients?.name}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">{order?.clients?.address}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {tracking.wooden_pallets_sent} wooden pallets
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {tracking.intercalaires_sent} intercalaires
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {tracking.wooden_pallets_returned} wooden pallets
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {tracking.intercalaires_returned} intercalaires
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="text-sm">
                              <span className="text-green-600 dark:text-green-400 font-medium">
                                Good: {tracking.wooden_pallets_good_condition + tracking.intercalaires_good_condition}
                              </span>
                            </div>
                            <div className="text-sm">
                              <span className="text-red-600 dark:text-red-400 font-medium">
                                Bad: {tracking.wooden_pallets_bad_condition + tracking.intercalaires_bad_condition}
                              </span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={tracking.status === "full_return" ? "default" : "secondary"}
                            className={
                              tracking.status === "full_return" 
                                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" 
                                : tracking.status === "partial_return"
                                ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                                : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                            }
                          >
                            {tracking.status === "full_return" && <CheckCircle className="h-3 w-3 mr-1" />}
                            {tracking.status === "partial_return" && <AlertCircle className="h-3 w-3 mr-1" />}
                            {tracking.status === "no_return" && <XCircle className="h-3 w-3 mr-1" />}
                            {tracking.status.replace('_', ' ').toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-gray-500">
                            {tracking.return_date ? new Date(tracking.return_date).toLocaleDateString() : "Not returned"}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            {canManageTracking && (
                              <>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEdit(tracking)}
                                  className="hover:bg-purple-50 dark:hover:bg-purple-900/20"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="hover:bg-red-50 dark:hover:bg-red-900/20"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Delete Tracking Record</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Are you sure you want to delete this pallet tracking record? This action cannot be undone.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => handleDelete(tracking.id)}
                                        className="bg-red-600 hover:bg-red-700"
                                      >
                                        Delete
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </>
                            )}
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>
                                  <Package className="mr-2 h-4 w-4" />
                                  View Order Details
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Download className="mr-2 h-4 w-4" />
                                  Export PDF
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default withAuth(PalletTrackingPage)
