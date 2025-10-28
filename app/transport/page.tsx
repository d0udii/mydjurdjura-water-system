"use client"

import React, { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Crown, Shield, Zap, Lock, Truck, Edit, Trash2, Plus, CheckCircle, XCircle } from "lucide-react"
import { useAuth } from "@/lib/auth"
import { withAuth } from "@/lib/auth"
import { showEditSuccessToast, showEditErrorToast, showDeleteSuccessToast, showDeleteErrorToast } from "@/lib/toast-notifications"
import { logEditActivity, logDeleteActivity } from "@/lib/activity-logging"

interface TransportTariff {
  id: string
  city: string
  cost_per_pallet: number
  status: 'active' | 'inactive'
  created_at: string
}

function TransportPage() {
  const { user } = useAuth()
  const [tariffs, setTariffs] = useState<TransportTariff[]>([])
  const [loading, setLoading] = useState(true)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [selectedTariff, setSelectedTariff] = useState<TransportTariff | null>(null)
  const [editForm, setEditForm] = useState({
    city: '',
    cost_per_pallet: 0,
    status: 'active' as 'active' | 'inactive'
  })
  const [addForm, setAddForm] = useState({
    city: '',
    cost_per_pallet: 0,
    status: 'active' as 'active' | 'inactive'
  })
  
  // Admin permissions
  const isUserAdmin = user?.role === "admin"

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const response = await fetch('/api/transport')
      if (response.ok) {
        const data = await response.json()
        setTariffs(data.tariffs || [])
      }
    } catch (error) {
      console.error('Error fetching transport tariffs:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddTariff = () => {
    setAddForm({
      city: '',
      cost_per_pallet: 0,
      status: 'active'
    })
    setIsAddDialogOpen(true)
  }

  const handleCreateTariff = async () => {
    // Validation
    if (!addForm.city.trim()) {
      showEditErrorToast('Transport Tariff', 'City is required')
      return
    }
    if (addForm.cost_per_pallet <= 0) {
      showEditErrorToast('Transport Tariff', 'Cost per pallet must be greater than 0')
      return
    }

    try {
      const response = await fetch('/api/transport', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(addForm),
      })

      if (response.ok) {
        const newTariff = await response.json()
        
        // Update local state
        setTariffs([newTariff, ...tariffs])
        
        showEditSuccessToast('Transport Tariff', `New tariff for ${addForm.city} created successfully`)
        
        // Log activity
        await logEditActivity(
          user?.id || 'unknown',
          user?.name || 'Unknown User',
          'Transport Tariff',
          newTariff.id,
          `Created new tariff for ${addForm.city}`,
          {},
          addForm
        )
        
        setIsAddDialogOpen(false)
        setAddForm({
          city: '',
          cost_per_pallet: 0,
          status: 'active'
        })
      } else {
        const errorData = await response.json()
        showEditErrorToast('Transport Tariff', errorData.error || 'Failed to create transport tariff')
      }
    } catch (error) {
      console.error('Error creating transport tariff:', error)
      showEditErrorToast('Transport Tariff', 'Network error occurred')
    }
  }

  const handleEditTariff = (tariffToEdit: TransportTariff) => {
    setSelectedTariff(tariffToEdit)
    setEditForm({
      city: tariffToEdit.city,
      cost_per_pallet: tariffToEdit.cost_per_pallet,
      status: tariffToEdit.status
    })
    setIsEditDialogOpen(true)
  }

  const handleUpdateTariff = async () => {
    if (!selectedTariff) return

    // Validation
    if (!editForm.city.trim()) {
      showEditErrorToast('Transport Tariff', 'City is required')
      return
    }
    if (editForm.cost_per_pallet <= 0) {
      showEditErrorToast('Transport Tariff', 'Cost per pallet must be greater than 0')
      return
    }

    try {
      const oldValues = {
        city: selectedTariff.city,
        cost_per_pallet: selectedTariff.cost_per_pallet,
        status: selectedTariff.status
      }

      const response = await fetch(`/api/transport/${selectedTariff.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editForm),
      })

      if (response.ok) {
        // Update local state
        setTariffs(tariffs.map(t => 
          t.id === selectedTariff.id 
            ? { ...t, ...editForm }
            : t
        ))
        
        showEditSuccessToast('Transport Tariff', editForm.city)
        
        // Log activity
        await logEditActivity(
          user?.id || 'unknown',
          user?.name || 'Unknown User',
          'Transport Tariff',
          selectedTariff.id,
          editForm.city,
          oldValues,
          editForm
        )
        
        setIsEditDialogOpen(false)
        setSelectedTariff(null)
      } else {
        const errorData = await response.json()
        showEditErrorToast('Transport Tariff', errorData.error || 'Failed to update transport tariff')
      }
    } catch (error) {
      console.error('Error updating transport tariff:', error)
      showEditErrorToast('Transport Tariff', 'Network error occurred')
    }
  }

  const handleDeleteTariff = async (tariffId: string) => {
    const tariffToDelete = tariffs.find(t => t.id === tariffId)
    if (!tariffToDelete) {
      showEditErrorToast('Transport Tariff', 'Transport tariff not found')
      return
    }

    try {
      const oldValues = {
        city: tariffToDelete.city,
        cost_per_pallet: tariffToDelete.cost_per_pallet,
        status: tariffToDelete.status
      }

      const response = await fetch(`/api/transport/${tariffId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        // Update local state
        setTariffs(tariffs.filter(t => t.id !== tariffId))
        
        showDeleteSuccessToast('Transport Tariff', tariffToDelete.city)
        
        // Log activity
        await logDeleteActivity(
          user?.id || 'unknown',
          user?.name || 'Unknown User',
          'Transport Tariff',
          tariffId,
          tariffToDelete.city,
          oldValues
        )
      } else {
        const errorData = await response.json()
        showEditErrorToast('Transport Tariff', errorData.error || 'Failed to delete transport tariff')
      }
    } catch (error) {
      console.error('Error deleting transport tariff:', error)
      showEditErrorToast('Transport Tariff', 'Network error occurred')
    }
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-8 space-y-6">
      {/* Enhanced Header with Admin Controls */}
      <div className={`${user?.role === 'admin' ? 'bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border-red-200 dark:border-red-800' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'} rounded-lg border p-6`}>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className={`p-3 ${user?.role === 'admin' ? 'bg-red-100 dark:bg-red-900' : 'bg-blue-100 dark:bg-blue-900'} rounded-lg`}>
              {user?.role === 'admin' ? (
                <Crown className="h-8 w-8 text-red-600 dark:text-red-400" />
              ) : (
                <Truck className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Transport Management</h1>
                {user?.role === 'admin' && (
                  <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 px-3 py-1 text-sm font-bold">
                    <Shield className="h-4 w-4 mr-1" />
                    ADMIN
                  </Badge>
                )}
              </div>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {user?.role === 'admin' 
                  ? "Full administrative control over all transport tariffs, routes, and system configurations"
                  : "Manage transport tariffs, routes, and delivery costs"
                }
              </p>
              {user?.role === 'admin' && (
                <div className="flex items-center gap-4 mt-2">
                  <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
                    <Zap className="h-4 w-4" />
                    <span className="font-medium">Override All Restrictions</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
                    <Lock className="h-4 w-4" />
                    <span className="font-medium">Full System Control</span>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              onClick={handleAddTariff}
              className={`w-full sm:w-auto ${user?.role === 'admin' ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'} text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105`}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Tariff
            </Button>
          </div>
        </div>
      </div>

      {/* Transport Tariffs List */}
      <Card>
        <CardHeader>
          <CardTitle>Transport Tariffs ({tariffs.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {tariffs.map((tariff) => (
              <div key={tariff.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-lg">{tariff.city}</h3>
                    <Truck className="h-5 w-5 text-blue-500" />
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Transport cost per pallet</p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    Created: {new Date(tariff.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Badge className={tariff.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'}>
                      {tariff.status === 'active' && <CheckCircle className="h-3 w-3 mr-1" />}
                      {tariff.status === 'inactive' && <XCircle className="h-3 w-3 mr-1" />}
                      {tariff.status.toUpperCase()}
                    </Badge>
                    <span className="font-semibold text-lg">{tariff.cost_per_pallet.toLocaleString()} DA</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditTariff(tariff)}
                      className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200 hover:border-blue-300"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="bg-red-50 hover:bg-red-100 text-red-700 border-red-200 hover:border-red-300"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle className="flex items-center gap-2">
                            <Trash2 className="h-5 w-5 text-red-500" />
                            Delete Transport Tariff
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete the transport tariff for <strong>{tariff.city}</strong>? 
                            This action cannot be undone.
                            {isUserAdmin && (
                              <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 rounded border border-red-200 dark:border-red-800">
                                <div className="flex items-center gap-2 text-red-600 dark:text-red-400 text-sm font-medium">
                                  <Crown className="h-4 w-4" />
                                  Admin Override Permission
                                </div>
                              </div>
                            )}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteTariff(tariff.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Delete Tariff
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Add Transport Tariff Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-green-500" />
              Add New Transport Tariff
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="add-city">City</Label>
              <Input
                id="add-city"
                value={addForm.city}
                onChange={(e) => setAddForm({ ...addForm, city: e.target.value })}
                placeholder="Enter city name"
              />
            </div>
            <div>
              <Label htmlFor="add-cost_per_pallet">Cost per Pallet (DA)</Label>
              <Input
                id="add-cost_per_pallet"
                type="number"
                value={addForm.cost_per_pallet}
                onChange={(e) => setAddForm({ ...addForm, cost_per_pallet: parseFloat(e.target.value) || 0 })}
                placeholder="Enter cost per pallet"
              />
            </div>
            <div>
              <Label htmlFor="add-status">Status</Label>
              <Select value={addForm.status} onValueChange={(value: 'active' | 'inactive') => setAddForm({ ...addForm, status: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateTariff} className="bg-green-600 hover:bg-green-700">
                <Plus className="h-4 w-4 mr-2" />
                Create Tariff
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Transport Tariff Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5 text-blue-500" />
              Edit Transport Tariff
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={editForm.city}
                onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                placeholder="Enter city name"
              />
            </div>
            <div>
              <Label htmlFor="cost_per_pallet">Cost per Pallet (DA)</Label>
              <Input
                id="cost_per_pallet"
                type="number"
                value={editForm.cost_per_pallet}
                onChange={(e) => setEditForm({ ...editForm, cost_per_pallet: parseFloat(e.target.value) || 0 })}
                placeholder="Enter cost per pallet"
              />
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={editForm.status} onValueChange={(value: 'active' | 'inactive') => setEditForm({ ...editForm, status: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateTariff} className="bg-blue-600 hover:bg-blue-700">
                Update Tariff
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default withAuth(TransportPage)