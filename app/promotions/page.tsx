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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Plus, Edit, Trash2, MoreHorizontal, Download, Search, Filter, RefreshCw, Percent, DollarSign, Calendar, Target, Users, MapPin, User } from "lucide-react"

// Mock auth hook for demo
const useAuth = () => ({
  user: { id: "demo-admin", role: "admin", name: "Admin" }
})

const withAuth = (Component: any) => Component

interface Promotion {
  id: string
  name: string
  type: "fixed" | "percentage"
  value: number
  target_type: "city" | "client" | "supervisor"
  target_id: string
  start_date: string
  end_date: string
  status: "active" | "inactive" | "expired"
  created_by: string
  created_at: string
  description: string
}

function PromotionsPage() {
  const { user } = useAuth()
  const [promotions, setPromotions] = useState<Promotion[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [selectedPromotion, setSelectedPromotion] = useState<Promotion | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [filterType, setFilterType] = useState("all")
  const [formData, setFormData] = useState({
    name: "",
    type: "percentage" as "fixed" | "percentage",
    value: "",
    target_type: "city" as "city" | "client" | "supervisor",
    target_id: "",
    start_date: "",
    end_date: "",
    description: ""
  })

  // Demo data
  const demoPromotions: Promotion[] = [
    {
      id: "PROMO-001",
      name: "Summer Discount Biskra",
      type: "percentage",
      value: 10,
      target_type: "city",
      target_id: "Biskra",
      start_date: "2024-06-01",
      end_date: "2024-08-31",
      status: "active",
      created_by: "USR-001",
      created_at: "2024-01-01T00:00:00Z",
      description: "Summer promotion for Biskra region"
    },
    {
      id: "PROMO-002",
      name: "New Client Welcome",
      type: "fixed",
      value: 5000,
      target_type: "client",
      target_id: "CLI-003",
      start_date: "2024-01-01",
      end_date: "2024-12-31",
      status: "active",
      created_by: "USR-001",
      created_at: "2024-01-01T00:00:00Z",
      description: "Welcome discount for new clients"
    }
  ]

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setPromotions(demoPromotions)
      setLoading(false)
    }, 1000)
  }, [])

  const handleCreatePromotion = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || !formData.value || !formData.target_id || !formData.start_date || !formData.end_date) {
      alert("Please fill all required fields")
      return
    }

    try {
      const response = await fetch('/api/promotions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          value: parseFloat(formData.value),
          created_by: user.id
        })
      })

      if (response.ok) {
        const data = await response.json()
        setPromotions(prev => [data.promotion, ...prev])
        setIsCreateOpen(false)
        resetForm()
        alert(data.message)
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to create promotion')
      }
    } catch (error) {
      console.error("Failed to create promotion:", error)
      alert('Failed to create promotion')
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      type: "percentage",
      value: "",
      target_type: "city",
      target_id: "",
      start_date: "",
      end_date: "",
      description: ""
    })
  }

  const handleEdit = (promotion: Promotion) => {
    setSelectedPromotion(promotion)
    setFormData({
      name: promotion.name,
      type: promotion.type,
      value: promotion.value.toString(),
      target_type: promotion.target_type,
      target_id: promotion.target_id,
      start_date: promotion.start_date,
      end_date: promotion.end_date,
      description: promotion.description
    })
    setIsEditOpen(true)
  }

  const handleUpdatePromotion = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedPromotion) {
      alert("No promotion selected for update")
      return
    }

    try {
      const response = await fetch('/api/promotions', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: selectedPromotion.id,
          name: formData.name,
          type: formData.type,
          value: parseFloat(formData.value),
          target_type: formData.target_type,
          target_id: formData.target_id,
          start_date: formData.start_date,
          end_date: formData.end_date,
          description: formData.description
        })
      })

      if (response.ok) {
        const data = await response.json()
        setPromotions(prev => prev.map(promo => 
          promo.id === selectedPromotion.id ? data.promotion : promo
        ))
        setIsEditOpen(false)
        setSelectedPromotion(null)
        resetForm()
        alert(data.message)
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to update promotion')
      }
    } catch (error) {
      console.error("Failed to update promotion:", error)
      alert('Failed to update promotion')
    }
  }

  const handleDelete = async (promoId: string) => {
    try {
      const response = await fetch(`/api/promotions?id=${promoId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setPromotions(prev => prev.filter(promo => promo.id !== promoId))
        alert("Promotion deleted successfully!")
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to delete promotion')
      }
    } catch (error) {
      console.error("Failed to delete promotion:", error)
      alert('Failed to delete promotion')
    }
  }

  const filteredPromotions = promotions.filter(promo => {
    const matchesSearch = promo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         promo.target_id.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === "all" || promo.status === filterStatus
    const matchesType = filterType === "all" || promo.type === filterType
    return matchesSearch && matchesStatus && matchesType
  })

  const canManagePromotions = user?.role === "admin"

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
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
                <div className="p-2 bg-gradient-to-r from-green-500 to-green-600 rounded-lg shadow-lg">
                  <Percent className="h-6 w-6 text-white" />
                </div>
                <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                  Promotions Management
                </h1>
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                Create and manage promotional campaigns for cities, clients, and supervisors
              </p>
            </div>
            
            {canManagePromotions && (
              <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogTrigger asChild>
                  <Button 
                    size="lg"
                    className="w-full lg:w-auto bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                    onClick={resetForm}
                  >
                    <Plus className="mr-2 h-5 w-5" />
                    Create Promotion
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-bold flex items-center gap-3">
                      <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                        <Percent className="h-6 w-6 text-green-600 dark:text-green-400" />
                      </div>
                      Create New Promotion
                    </DialogTitle>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                      Set up promotional campaigns with fixed amounts or percentage discounts for specific targets.
                    </p>
                  </DialogHeader>
                  <form onSubmit={handleCreatePromotion} className="space-y-6 pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Promotion Name <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="e.g., Summer Discount Biskra"
                          className="h-12"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="type" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Discount Type <span className="text-red-500">*</span>
                        </Label>
                        <Select
                          value={formData.type}
                          onValueChange={(value: "fixed" | "percentage") => setFormData({ ...formData, type: value })}
                        >
                          <SelectTrigger className="h-12">
                            <SelectValue placeholder="Select discount type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="percentage">
                              <div className="flex items-center gap-2">
                                <Percent className="h-4 w-4" />
                                Percentage Discount
                              </div>
                            </SelectItem>
                            <SelectItem value="fixed">
                              <div className="flex items-center gap-2">
                                <DollarSign className="h-4 w-4" />
                                Fixed Amount Discount
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="value" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Discount Value <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="value"
                          type="number"
                          value={formData.value}
                          onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                          placeholder={formData.type === "percentage" ? "10" : "5000"}
                          className="h-12"
                          min="0"
                          max={formData.type === "percentage" ? "100" : undefined}
                          required
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          {formData.type === "percentage" ? "Enter percentage (0-100)" : "Enter amount in DA"}
                        </p>
                      </div>
                      <div>
                        <Label htmlFor="target_type" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Target Type <span className="text-red-500">*</span>
                        </Label>
                        <Select
                          value={formData.target_type}
                          onValueChange={(value: "city" | "client" | "supervisor") => setFormData({ ...formData, target_type: value })}
                        >
                          <SelectTrigger className="h-12">
                            <SelectValue placeholder="Select target type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="city">
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4" />
                                City
                              </div>
                            </SelectItem>
                            <SelectItem value="client">
                              <div className="flex items-center gap-2">
                                <Users className="h-4 w-4" />
                                Client
                              </div>
                            </SelectItem>
                            <SelectItem value="supervisor">
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4" />
                                Supervisor
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="target_id" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Target ID <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="target_id"
                        value={formData.target_id}
                        onChange={(e) => setFormData({ ...formData, target_id: e.target.value })}
                        placeholder={
                          formData.target_type === "city" ? "Biskra" :
                          formData.target_type === "client" ? "CLI-001" :
                          "USR-003"
                        }
                        className="h-12"
                        required
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {formData.target_type === "city" ? "Enter city name" :
                         formData.target_type === "client" ? "Enter client ID" :
                         "Enter supervisor user ID"}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="start_date" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Start Date <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="start_date"
                          type="date"
                          value={formData.start_date}
                          onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                          className="h-12"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="end_date" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          End Date <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="end_date"
                          type="date"
                          value={formData.end_date}
                          onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                          className="h-12"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="description" className="text-sm font-medium text-gray-700 dark:text-gray-300">Description</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Describe the promotion details..."
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
                        className="px-8 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-lg hover:shadow-xl transition-all duration-200"
                      >
                        <Percent className="mr-2 h-4 w-4" />
                        Create Promotion
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
                  placeholder="Search promotions..."
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
                className="h-12 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="expired">Expired</option>
              </select>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="h-12 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="all">All Types</option>
                <option value="percentage">Percentage</option>
                <option value="fixed">Fixed Amount</option>
              </select>
              <Button variant="outline" size="sm" className="h-12 px-4">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </div>

        {/* Enhanced Promotions Table */}
        <Card className="shadow-lg border-0 bg-white dark:bg-gray-800">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-t-xl">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                  <Percent className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold">Promotions ({filteredPromotions.length})</CardTitle>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Manage all promotional campaigns</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" className="hover:bg-green-50 dark:hover:bg-green-900/20">
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
                    <TableHead className="font-semibold text-gray-700 dark:text-gray-300">Promotion</TableHead>
                    <TableHead className="font-semibold text-gray-700 dark:text-gray-300">Type</TableHead>
                    <TableHead className="font-semibold text-gray-700 dark:text-gray-300">Value</TableHead>
                    <TableHead className="font-semibold text-gray-700 dark:text-gray-300">Target</TableHead>
                    <TableHead className="font-semibold text-gray-700 dark:text-gray-300">Duration</TableHead>
                    <TableHead className="font-semibold text-gray-700 dark:text-gray-300">Status</TableHead>
                    <TableHead className="font-semibold text-gray-700 dark:text-gray-300">Created</TableHead>
                    <TableHead className="font-semibold text-gray-700 dark:text-gray-300 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPromotions.map((promotion) => (
                    <TableRow key={promotion.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium text-gray-900 dark:text-white">{promotion.name}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400 max-w-[200px] truncate">
                            {promotion.description}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={promotion.type === "percentage" ? "default" : "secondary"}
                          className={
                            promotion.type === "percentage" 
                              ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" 
                              : "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                          }
                        >
                          {promotion.type === "percentage" ? (
                            <div className="flex items-center gap-1">
                              <Percent className="h-3 w-3" />
                              Percentage
                            </div>
                          ) : (
                            <div className="flex items-center gap-1">
                              <DollarSign className="h-3 w-3" />
                              Fixed
                            </div>
                          )}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {promotion.type === "percentage" ? `${promotion.value}%` : `${promotion.value.toLocaleString()} DA`}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {promotion.target_type === "city" && <MapPin className="h-3 w-3 inline mr-1" />}
                            {promotion.target_type === "client" && <Users className="h-3 w-3 inline mr-1" />}
                            {promotion.target_type === "supervisor" && <User className="h-3 w-3 inline mr-1" />}
                            {promotion.target_type.charAt(0).toUpperCase() + promotion.target_type.slice(1)}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">{promotion.target_id}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="text-sm text-gray-900 dark:text-white">
                            {new Date(promotion.start_date).toLocaleDateString()}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {new Date(promotion.end_date).toLocaleDateString()}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={promotion.status === "active" ? "default" : "secondary"}
                          className={
                            promotion.status === "active" 
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" 
                              : promotion.status === "inactive"
                              ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                              : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                          }
                        >
                          {promotion.status.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-500">
                          {new Date(promotion.created_at).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          {canManagePromotions && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEdit(promotion)}
                                className="hover:bg-green-50 dark:hover:bg-green-900/20"
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
                                    <AlertDialogTitle>Delete Promotion</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete the promotion "{promotion.name}"? This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDelete(promotion.id)}
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
                                <Target className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Download className="mr-2 h-4 w-4" />
                                Export
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Edit Promotion Dialog */}
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                  <Edit className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                Edit Promotion
              </DialogTitle>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                Update the promotion details and settings.
              </p>
            </DialogHeader>
            <form onSubmit={handleUpdatePromotion} className="space-y-6 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit_name" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Promotion Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="edit_name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Summer Discount Biskra"
                    className="h-12"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="edit_type" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Discount Type <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value: "fixed" | "percentage") => setFormData({ ...formData, type: value })}
                  >
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Select discount type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">
                        <div className="flex items-center gap-2">
                          <Percent className="h-4 w-4" />
                          Percentage Discount
                        </div>
                      </SelectItem>
                      <SelectItem value="fixed">
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4" />
                          Fixed Amount Discount
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit_value" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Discount Value <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="edit_value"
                    type="number"
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                    placeholder={formData.type === "percentage" ? "10" : "5000"}
                    className="h-12"
                    min="0"
                    max={formData.type === "percentage" ? "100" : undefined}
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.type === "percentage" ? "Enter percentage (0-100)" : "Enter amount in DA"}
                  </p>
                </div>
                <div>
                  <Label htmlFor="edit_target_type" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Target Type <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.target_type}
                    onValueChange={(value: "city" | "client" | "supervisor") => setFormData({ ...formData, target_type: value })}
                  >
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Select target type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="city">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          City
                        </div>
                      </SelectItem>
                      <SelectItem value="client">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          Client
                        </div>
                      </SelectItem>
                      <SelectItem value="supervisor">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          Supervisor
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="edit_target_id" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Target ID <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="edit_target_id"
                  value={formData.target_id}
                  onChange={(e) => setFormData({ ...formData, target_id: e.target.value })}
                  placeholder="e.g., Biskra, CLI-001, USR-003"
                  className="h-12"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter the specific city name, client ID, or supervisor ID
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit_start_date" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Start Date <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="edit_start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    className="h-12"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="edit_end_date" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    End Date <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="edit_end_date"
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    className="h-12"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="edit_description" className="text-sm font-medium text-gray-700 dark:text-gray-300">Description</Label>
                <Textarea
                  id="edit_description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe the promotion details..."
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
                  className="px-8 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Update Promotion
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

export default withAuth(PromotionsPage)
