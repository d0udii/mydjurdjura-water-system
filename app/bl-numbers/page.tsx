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
import { Plus, Edit, Trash2, MoreHorizontal, Download, FileText, Search, Filter, RefreshCw, Package, Truck } from "lucide-react"

// Mock auth hook for demo
const useAuth = () => ({
  user: { id: "demo-operations", role: "operations", name: "Operations Team" }
})

const withAuth = (Component: any) => Component

interface BLNumber {
  id: string
  order_id: string
  bl_number: string
  created_at: string
  created_by: string
  status: "active" | "inactive" | "cancelled"
  notes: string
}

interface Order {
  id: string
  client_id: string
  status: string
  total_price: number
  clients?: {
    name: string
    address: string
  }
}

function BLNumbersPage() {
  const { user } = useAuth()
  const [blNumbers, setBlNumbers] = useState<BLNumber[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [selectedBL, setSelectedBL] = useState<BLNumber | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [formData, setFormData] = useState({
    order_id: "",
    notes: ""
  })

  // Demo data
  const demoBLNumbers: BLNumber[] = [
    {
      id: "BL-001",
      order_id: "ORD-001",
      bl_number: "BL2024001",
      created_at: "2024-01-01T00:00:00Z",
      created_by: "USR-004",
      status: "active",
      notes: "Initial BL number"
    },
    {
      id: "BL-002",
      order_id: "ORD-002",
      bl_number: "BL2024002",
      created_at: "2024-01-02T00:00:00Z",
      created_by: "USR-004",
      status: "active",
      notes: "Standard delivery"
    }
  ]

  const demoOrders: Order[] = [
    {
      id: "ORD-001",
      client_id: "CLI-001",
      status: "pending",
      total_price: 125000,
      clients: {
        name: "Biskra Water Distributor",
        address: "123 Main Street, Biskra"
      }
    },
    {
      id: "ORD-002",
      client_id: "CLI-002",
      status: "in_progress",
      total_price: 89000,
      clients: {
        name: "Ouled Djellal Store",
        address: "456 Market Square, Ouled Djellal"
      }
    }
  ]

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setBlNumbers(demoBLNumbers)
      setOrders(demoOrders)
      setLoading(false)
    }, 1000)
  }, [])

  const handleCreateBL = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.order_id) {
      alert("Please select an order")
      return
    }

    try {
      const response = await fetch('/api/bl-numbers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          order_id: formData.order_id,
          notes: formData.notes,
          created_by: user.id
        })
      })

      if (response.ok) {
        const data = await response.json()
        setBlNumbers(prev => [data.blNumber, ...prev])
        setIsCreateOpen(false)
        resetForm()
        alert(data.message)
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to create BL number')
      }
    } catch (error) {
      console.error("Failed to create BL number:", error)
      alert('Failed to create BL number')
    }
  }

  const resetForm = () => {
    setFormData({
      order_id: "",
      notes: ""
    })
  }

  const handleEdit = (blNumber: BLNumber) => {
    setSelectedBL(blNumber)
    setFormData({
      order_id: blNumber.order_id,
      notes: blNumber.notes
    })
    setIsEditOpen(true)
  }

  const handleUpdateBL = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedBL) {
      alert("No BL number selected for update")
      return
    }

    try {
      const response = await fetch('/api/bl-numbers', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: selectedBL.id,
          notes: formData.notes,
          status: selectedBL.status
        })
      })

      if (response.ok) {
        const data = await response.json()
        setBlNumbers(prev => prev.map(bl => 
          bl.id === selectedBL.id ? data.blNumber : bl
        ))
        setIsEditOpen(false)
        setSelectedBL(null)
        resetForm()
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

  const handleDelete = async (blId: string) => {
    try {
      const response = await fetch(`/api/bl-numbers?id=${blId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setBlNumbers(prev => prev.filter(bl => bl.id !== blId))
        alert("BL number deleted successfully!")
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to delete BL number')
      }
    } catch (error) {
      console.error("Failed to delete BL number:", error)
      alert('Failed to delete BL number')
    }
  }

  const filteredBLNumbers = blNumbers.filter(bl => {
    const matchesSearch = bl.bl_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         bl.order_id.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === "all" || bl.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const canManageBL = user?.role === "admin" || user?.role === "operations"

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
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
                <div className="p-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-lg">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                  BL Numbers Management
                </h1>
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                Manage Bill of Lading numbers for all orders with unique tracking
              </p>
            </div>
            
            {canManageBL && (
              <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogTrigger asChild>
                  <Button 
                    size="lg"
                    className="w-full lg:w-auto bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                    onClick={resetForm}
                  >
                    <Plus className="mr-2 h-5 w-5" />
                    Add BL Number
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-bold flex items-center gap-3">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                        <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      Add New BL Number
                    </DialogTitle>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                      Create a unique BL number for an order. The system will automatically generate a unique identifier.
                    </p>
                  </DialogHeader>
                  <form onSubmit={handleCreateBL} className="space-y-6 pt-4">
                    <div>
                      <Label htmlFor="order_id" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Order <span className="text-red-500">*</span>
                      </Label>
                      <select
                        id="order_id"
                        value={formData.order_id}
                        onChange={(e) => setFormData({ ...formData, order_id: e.target.value })}
                        className="w-full h-12 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        required
                      >
                        <option value="">Select an order...</option>
                        {orders.filter(order => !blNumbers.some(bl => bl.order_id === order.id)).map((order) => (
                          <option key={order.id} value={order.id}>
                            {order.id} - {order.clients?.name} ({order.clients?.address})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <Label htmlFor="notes" className="text-sm font-medium text-gray-700 dark:text-gray-300">Notes</Label>
                      <Textarea
                        id="notes"
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        placeholder="Additional notes about this BL number..."
                        className="min-h-[100px]"
                      />
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
                        className="px-8 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all duration-200"
                      >
                        <FileText className="mr-2 h-4 w-4" />
                        Create BL Number
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
                  placeholder="Search by BL number or Order ID..."
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
                className="h-12 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <Button variant="outline" size="sm" className="h-12 px-4">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </div>

        {/* Enhanced BL Numbers Table */}
        <Card className="shadow-lg border-0 bg-white dark:bg-gray-800">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-t-xl">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold">BL Numbers ({filteredBLNumbers.length})</CardTitle>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Manage and track all Bill of Lading numbers</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" className="hover:bg-blue-50 dark:hover:bg-blue-900/20">
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
                    <TableHead className="font-semibold text-gray-700 dark:text-gray-300">BL Number</TableHead>
                    <TableHead className="font-semibold text-gray-700 dark:text-gray-300">Order ID</TableHead>
                    <TableHead className="font-semibold text-gray-700 dark:text-gray-300">Client</TableHead>
                    <TableHead className="font-semibold text-gray-700 dark:text-gray-300">Status</TableHead>
                    <TableHead className="font-semibold text-gray-700 dark:text-gray-300">Created</TableHead>
                    <TableHead className="font-semibold text-gray-700 dark:text-gray-300">Notes</TableHead>
                    <TableHead className="font-semibold text-gray-700 dark:text-gray-300 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBLNumbers.map((blNumber) => {
                    const order = orders.find(o => o.id === blNumber.order_id)
                    return (
                      <TableRow key={blNumber.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                              <span className="text-sm font-bold text-white">
                                {blNumber.bl_number.slice(-3)}
                              </span>
                            </div>
                            <div>
                              <div className="font-medium text-gray-900 dark:text-white">{blNumber.bl_number}</div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">ID: {blNumber.id}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium text-gray-900 dark:text-white">{blNumber.order_id}</div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium text-gray-900 dark:text-white">{order?.clients?.name}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">{order?.clients?.address}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={blNumber.status === "active" ? "default" : "secondary"}
                            className={
                              blNumber.status === "active" 
                                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" 
                                : blNumber.status === "inactive"
                                ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                                : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                            }
                          >
                            {blNumber.status.toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-gray-500">
                            {new Date(blNumber.created_at).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-gray-600 dark:text-gray-400 max-w-[200px] truncate">
                            {blNumber.notes || "No notes"}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            {canManageBL && (
                              <>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEdit(blNumber)}
                                  className="hover:bg-blue-50 dark:hover:bg-blue-900/20"
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
                                      <AlertDialogTitle>Delete BL Number</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Are you sure you want to delete BL number {blNumber.bl_number}? This action cannot be undone.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => handleDelete(blNumber.id)}
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

        {/* Edit BL Number Dialog */}
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <Edit className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                Edit BL Number
              </DialogTitle>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                Update the BL number details and notes.
              </p>
            </DialogHeader>
            <form onSubmit={handleUpdateBL} className="space-y-6 pt-4">
              <div>
                <Label htmlFor="edit_bl_number" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  BL Number
                </Label>
                <Input
                  id="edit_bl_number"
                  value={selectedBL?.bl_number || ""}
                  disabled
                  className="bg-gray-50 dark:bg-gray-700"
                />
                <p className="text-xs text-gray-500 mt-1">BL number cannot be changed</p>
              </div>

              <div>
                <Label htmlFor="edit_notes" className="text-sm font-medium text-gray-700 dark:text-gray-300">Notes</Label>
                <Textarea
                  id="edit_notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Additional notes about this BL number..."
                  className="min-h-[100px]"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditOpen(false)}
                  className="px-6"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="px-8 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Update BL Number
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

export default withAuth(BLNumbersPage)
