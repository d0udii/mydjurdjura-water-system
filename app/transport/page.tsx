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
import { useTransportTariffs, useCreateTransportTariff, useUpdateTransportTariff, useDeleteTransportTariff, useRegions } from "@/lib/supabase-realtime-hooks"
import { FormInput, FormSelect, FormButton, FormLayout, FormActions } from "@/components/ui/form-components"
import { FormValidator } from "@/lib/form-validation"

interface TransportTariff {
  id: string
  city: string
  price: number
  driver_type: 'factory' | 'local'
  region_id: string
  created_at: string
  updated_at: string
}

function TransportPage() {
  const { user } = useAuth()
  const { data: tariffs = [], isLoading: loading, error } = useTransportTariffs()
  const { data: regions = [] } = useRegions()
  const createTariff = useCreateTransportTariff()
  const updateTariff = useUpdateTransportTariff()
  const deleteTariff = useDeleteTransportTariff()
  
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [selectedTariff, setSelectedTariff] = useState<TransportTariff | null>(null)
  const [editForm, setEditForm] = useState({
    city: '',
    price: 0,
    driver_type: 'local' as 'factory' | 'local',
    region_id: ''
  })
  const [editErrors, setEditErrors] = useState<Record<string, string>>({})
  const [addForm, setAddForm] = useState({
    city: '',
    price: 0,
    driver_type: 'local' as 'factory' | 'local',
    region_id: ''
  })
  const [addErrors, setAddErrors] = useState<Record<string, string>>({})
  
  // Admin permissions
  const isUserAdmin = user?.role === "admin"

  const validateAddForm = (): boolean => {
    const validationRules = {
      city: FormValidator.rules.required('City'),
      price: FormValidator.rules.positiveNumber('Delivery Price'),
      region_id: FormValidator.rules.required('Region')
    }
    const result = FormValidator.validateForm(addForm, validationRules)
    setAddErrors(result.errors)
    return result.isValid
  }

  const validateEditForm = (): boolean => {
    const validationRules = {
      city: FormValidator.rules.required('City'),
      price: FormValidator.rules.positiveNumber('Delivery Price'),
      region_id: FormValidator.rules.required('Region')
    }
    const result = FormValidator.validateForm(editForm, validationRules)
    setEditErrors(result.errors)
    return result.isValid
  }

  const handleAddTariff = () => {
    setAddForm({
      city: '',
      price: 0,
      driver_type: 'local',
      region_id: ''
    })
    setIsAddDialogOpen(true)
  }

  const handleCreateTariff = async () => {
    if (!validateAddForm()) {
      return
    }

    try {
      // Convert region name to ID if needed
      const region = (regions as any[]).find((r: any) => r.name === addForm.region_id || r.id === addForm.region_id)
      const regionId = region?.id || addForm.region_id

      console.log('🚀 Creating tariff with data:', {
        city: addForm.city,
        price: addForm.price,
        driver_type: addForm.driver_type,
        region_id: regionId,
        region_name: region?.name
      })

      const result = await createTariff.mutateAsync({
        city: addForm.city,
        price: addForm.price,
        driver_type: addForm.driver_type,
        region_id: regionId
      })
      
      console.log('✅ Tariff created successfully:', result)
      
      setIsAddDialogOpen(false)
      setAddForm({
        city: '',
        price: 0,
        driver_type: 'local',
        region_id: ''
      })
      setAddErrors({})
      
      // Force a refresh to show the new tariff
      window.location.reload()
    } catch (error) {
      console.error('❌ Error creating transport tariff:', error)
      alert(`Failed to create tariff: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const handleEditTariff = (tariffToEdit: TransportTariff) => {
    setSelectedTariff(tariffToEdit)
    // Find the region name from the ID
    const region = (regions as any[]).find((r: any) => r.id === tariffToEdit.region_id)
    setEditForm({
      city: tariffToEdit.city,
      price: tariffToEdit.price,
      driver_type: tariffToEdit.driver_type,
      region_id: region?.name || tariffToEdit.region_id
    })
    setIsEditDialogOpen(true)
  }

  const handleUpdateTariff = async () => {
    if (!selectedTariff) return

    if (!validateEditForm()) {
      return
    }

    try {
      // Convert region name to ID if needed
      const region = (regions as any[]).find((r: any) => r.name === editForm.region_id || r.id === editForm.region_id)
      const regionId = region?.id || editForm.region_id

      await updateTariff.mutateAsync({
        id: selectedTariff.id,
        updates: {
          city: editForm.city,
          price: editForm.price,
          driver_type: editForm.driver_type,
          region_id: regionId
        }
      })
      
      setIsEditDialogOpen(false)
      setSelectedTariff(null)
      setEditErrors({})
      
      // Force a refresh to show the updated tariff
      window.location.reload()
    } catch (error) {
      console.error('Error updating transport tariff:', error)
    }
  }

  const handleDeleteTariff = async (tariffId: string) => {
    try {
      await deleteTariff.mutateAsync(tariffId)
    } catch (error) {
      console.error('Error deleting transport tariff:', error)
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
                  <p className="text-sm text-gray-600 dark:text-gray-400">Fixed delivery cost (full truck)</p>
                  <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 mt-2">
                    {tariff.driver_type === 'factory' ? 'Factory' : 'Local'} Driver
                  </Badge>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    Created: {new Date(tariff.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-lg text-green-600">{tariff.price.toLocaleString()} DA</span>
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
          <FormLayout onSubmit={(e) => { e.preventDefault(); handleCreateTariff(); }}>
            <FormInput
              label="City"
              name="add-city"
              required
              error={addErrors.city}
              value={addForm.city}
              onChange={(e) => setAddForm({ ...addForm, city: e.target.value })}
              placeholder="Enter city name (e.g., Biskra)"
            />
            <FormInput
              label="Fixed Delivery Price (DA)"
              name="add-price"
              type="number"
              step="0.01"
              required
              error={addErrors.price}
              value={addForm.price}
              onChange={(e) => setAddForm({ ...addForm, price: parseFloat(e.target.value) || 0 })}
              placeholder="Enter full truck price (e.g., 31000)"
            />
            <FormSelect
              label="Driver Type"
              name="add-driver_type"
              required
              value={addForm.driver_type}
              onValueChange={(value: 'factory' | 'local') => setAddForm({ ...addForm, driver_type: value })}
              options={[
                { value: 'factory', label: 'Factory Driver' },
                { value: 'local', label: 'Local Driver' }
              ]}
              placeholder="Select driver type"
            />
            <FormSelect
              label="Region"
              name="add-region_id"
              required
              error={addErrors.region_id}
              value={addForm.region_id}
              onValueChange={(value: string) => {
                // Find the region ID based on the name
                const region = (regions as any[]).find((r: any) => r.name === value)
                setAddForm({ ...addForm, region_id: region?.id || value })
              }}
              options={[
                { value: 'East', label: '🌅 East' },
                { value: 'West', label: '🌄 West' },
                { value: 'North', label: '⛰️ North' }
              ]}
              placeholder="Select region"
            />
            <FormActions>
              <FormButton 
                variant="outline" 
                onClick={() => {
                  setIsAddDialogOpen(false)
                  setAddErrors({})
                }}
              >
                Cancel
              </FormButton>
              <FormButton 
                onClick={handleCreateTariff}
                loading={createTariff.isPending}
                className="bg-green-600 hover:bg-green-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Tariff
              </FormButton>
            </FormActions>
          </FormLayout>
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
          <FormLayout onSubmit={(e) => { e.preventDefault(); handleUpdateTariff(); }}>
            <FormInput
              label="City"
              name="city"
              required
              error={editErrors.city}
              value={editForm.city}
              onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
              placeholder="Enter city name (e.g., Biskra)"
            />
            <FormInput
              label="Fixed Delivery Price (DA)"
              name="price"
              type="number"
              step="0.01"
              required
              error={editErrors.price}
              value={editForm.price}
              onChange={(e) => setEditForm({ ...editForm, price: parseFloat(e.target.value) || 0 })}
              placeholder="Enter full truck price (e.g., 31000)"
            />
            <FormSelect
              label="Driver Type"
              name="driver_type"
              required
              value={editForm.driver_type}
              onValueChange={(value: 'factory' | 'local') => setEditForm({ ...editForm, driver_type: value })}
              options={[
                { value: 'factory', label: 'Factory Driver' },
                { value: 'local', label: 'Local Driver' }
              ]}
              placeholder="Select driver type"
            />
            <FormSelect
              label="Region"
              name="region_id"
              required
              error={editErrors.region_id}
              value={editForm.region_id}
              onValueChange={(value: string) => {
                // Find the region ID based on the name
                const region = (regions as any[]).find((r: any) => r.name === value)
                setEditForm({ ...editForm, region_id: region?.id || value })
              }}
              options={[
                { value: 'East', label: '🌅 East' },
                { value: 'West', label: '🌄 West' },
                { value: 'North', label: '⛰️ North' }
              ]}
              placeholder="Select region"
            />
            <FormActions>
              <FormButton 
                variant="outline" 
                onClick={() => {
                  setIsEditDialogOpen(false)
                  setEditErrors({})
                }}
              >
                Cancel
              </FormButton>
              <FormButton 
                onClick={handleUpdateTariff}
                loading={updateTariff.isPending}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Update Tariff
              </FormButton>
            </FormActions>
          </FormLayout>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default withAuth(TransportPage)