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
import { useTransportTariffs, useCreateTransportTariff, useUpdateTransportTariff, useDeleteTransportTariff } from "@/lib/supabase-realtime-hooks"
import { FormInput, FormSelect, FormButton, FormLayout, FormActions } from "@/components/ui/form-components"
import { FormValidator } from "@/lib/form-validation"

interface TransportTariff {
  id: string
  city: string
  cost_per_pallet: number
  status: 'active' | 'inactive'
  created_at: string
}

function TransportPage() {
  const { user } = useAuth()
  const { data: tariffs = [], isLoading: loading, error } = useTransportTariffs()
  const createTariff = useCreateTransportTariff()
  const updateTariff = useUpdateTransportTariff()
  const deleteTariff = useDeleteTransportTariff()
  
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [selectedTariff, setSelectedTariff] = useState<TransportTariff | null>(null)
  const [editForm, setEditForm] = useState({
    city: '',
    cost_per_pallet: 0,
    status: 'active' as 'active' | 'inactive'
  })
  const [editErrors, setEditErrors] = useState<Record<string, string>>({})
  const [addForm, setAddForm] = useState({
    city: '',
    cost_per_pallet: 0,
    status: 'active' as 'active' | 'inactive'
  })
  const [addErrors, setAddErrors] = useState<Record<string, string>>({})
  
  // Admin permissions
  const isUserAdmin = user?.role === "admin"

  const validateAddForm = (): boolean => {
    const validationRules = {
      city: FormValidator.rules.required('City'),
      cost_per_pallet: FormValidator.rules.positiveNumber('Cost per Pallet')
    }
    const result = FormValidator.validateForm(addForm, validationRules)
    setAddErrors(result.errors)
    return result.isValid
  }

  const validateEditForm = (): boolean => {
    const validationRules = {
      city: FormValidator.rules.required('City'),
      cost_per_pallet: FormValidator.rules.positiveNumber('Cost per Pallet')
    }
    const result = FormValidator.validateForm(editForm, validationRules)
    setEditErrors(result.errors)
    return result.isValid
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
    if (!validateAddForm()) {
      return
    }

    try {
      await createTariff.mutateAsync({
        city: addForm.city,
        price: addForm.cost_per_pallet,
        driver_type: 'factory',
        region_id: '550e8400-e29b-41d4-a716-446655440001' // Default region
      })
      
      setIsAddDialogOpen(false)
      setAddForm({
        city: '',
        cost_per_pallet: 0,
        status: 'active'
      })
      setAddErrors({})
    } catch (error) {
      console.error('Error creating transport tariff:', error)
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

    if (!validateEditForm()) {
      return
    }

    try {
      await updateTariff.mutateAsync({
        id: selectedTariff.id,
        updates: {
          city: editForm.city,
          price: editForm.cost_per_pallet,
          status: editForm.status
        }
      })
      
      setIsEditDialogOpen(false)
      setSelectedTariff(null)
      setEditErrors({})
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
          <FormLayout onSubmit={(e) => { e.preventDefault(); handleCreateTariff(); }}>
            <FormInput
              label="City"
              name="add-city"
              required
              error={addErrors.city}
              value={addForm.city}
              onChange={(e) => setAddForm({ ...addForm, city: e.target.value })}
              placeholder="Enter city name"
            />
            <FormInput
              label="Cost per Pallet (DA)"
              name="add-cost_per_pallet"
              type="number"
              step="0.01"
              required
              error={addErrors.cost_per_pallet}
              value={addForm.cost_per_pallet}
              onChange={(e) => setAddForm({ ...addForm, cost_per_pallet: parseFloat(e.target.value) || 0 })}
              placeholder="Enter cost per pallet"
            />
            <FormSelect
              label="Status"
              name="add-status"
              value={addForm.status}
              onValueChange={(value: 'active' | 'inactive') => setAddForm({ ...addForm, status: value })}
              options={[
                { value: 'active', label: 'Active' },
                { value: 'inactive', label: 'Inactive' }
              ]}
              placeholder="Select status"
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
              placeholder="Enter city name"
            />
            <FormInput
              label="Cost per Pallet (DA)"
              name="cost_per_pallet"
              type="number"
              step="0.01"
              required
              error={editErrors.cost_per_pallet}
              value={editForm.cost_per_pallet}
              onChange={(e) => setEditForm({ ...editForm, cost_per_pallet: parseFloat(e.target.value) || 0 })}
              placeholder="Enter cost per pallet"
            />
            <FormSelect
              label="Status"
              name="status"
              value={editForm.status}
              onValueChange={(value: 'active' | 'inactive') => setEditForm({ ...editForm, status: value })}
              options={[
                { value: 'active', label: 'Active' },
                { value: 'inactive', label: 'Inactive' }
              ]}
              placeholder="Select status"
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