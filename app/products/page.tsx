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
import { Crown, Shield, Zap, Lock, Package, Edit, Trash2, Plus, CheckCircle, XCircle } from "lucide-react"
import { useAuth } from "@/lib/auth"
import { withAuth } from "@/lib/auth"
import { showEditSuccessToast, showEditErrorToast, showDeleteSuccessToast, showDeleteErrorToast } from "@/lib/toast-notifications"
import { useProducts, useCreateProduct, useUpdateProduct, useDeleteProduct } from "@/lib/supabase-realtime-hooks"
import { FormInput, FormSelect, FormButton, FormLayout, FormActions } from "@/components/ui/form-components"
import { FormValidator } from "@/lib/form-validation"

interface Product {
  id: string
  name: string
  volume: string
  units_per_pallet: number
  unit_price: number
  status: 'active' | 'inactive' | 'discontinued'
  created_at: string
}

function ProductsPage() {
  const { user } = useAuth()
  const { data: products = [], isLoading: loading, error } = useProducts()
  const createProduct = useCreateProduct()
  const updateProduct = useUpdateProduct()
  const deleteProduct = useDeleteProduct()
  
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [createForm, setCreateForm] = useState({
    name: '',
    volume: '',
    units_per_pallet: 0,
    unit_price: 0,
    status: 'active' as 'active' | 'inactive' | 'discontinued'
  })
  const [createErrors, setCreateErrors] = useState<Record<string, string>>({})
  const [editForm, setEditForm] = useState({
    name: '',
    volume: '',
    units_per_pallet: 0,
    unit_price: 0,
    status: 'active' as 'active' | 'inactive' | 'discontinued'
  })
  const [editErrors, setEditErrors] = useState<Record<string, string>>({})
  
  // Admin permissions
  const isUserAdmin = user?.role === "admin"

  const validateCreateForm = (): boolean => {
    const validationRules = {
      name: FormValidator.rules.required('Product Name'),
      volume: FormValidator.rules.required('Volume'),
      units_per_pallet: FormValidator.rules.positiveNumber('Units per Pallet'),
      unit_price: FormValidator.rules.positiveNumber('Unit Price')
    }

    const result = FormValidator.validateForm(createForm, validationRules)
    setCreateErrors(result.errors)
    return result.isValid
  }

  const validateEditForm = (): boolean => {
    const validationRules = {
      name: FormValidator.rules.required('Product Name'),
      volume: FormValidator.rules.required('Volume'),
      units_per_pallet: FormValidator.rules.positiveNumber('Units per Pallet'),
      unit_price: FormValidator.rules.positiveNumber('Unit Price')
    }

    const result = FormValidator.validateForm(editForm, validationRules)
    setEditErrors(result.errors)
    return result.isValid
  }

  const handleCreateProduct = async () => {
    if (!validateCreateForm()) {
      return
    }

    try {
      await createProduct.mutateAsync(createForm)
      setIsCreateDialogOpen(false)
      setCreateForm({
        name: '',
        volume: '',
        units_per_pallet: 0,
        unit_price: 0,
        status: 'active'
      })
      setCreateErrors({})
    } catch (error) {
      console.error('Error creating product:', error)
    }
  }

  const handleEditProduct = (productToEdit: Product) => {
    setSelectedProduct(productToEdit)
    setEditForm({
      name: productToEdit.name,
      volume: productToEdit.volume,
      units_per_pallet: productToEdit.units_per_pallet,
      unit_price: productToEdit.unit_price,
      status: productToEdit.status
    })
    setIsEditDialogOpen(true)
  }

  const handleUpdateProduct = async () => {
    if (!selectedProduct) return

    if (!validateEditForm()) {
      return
    }

    try {
      await updateProduct.mutateAsync({
        id: selectedProduct.id,
        updates: editForm
      })
      
      setIsEditDialogOpen(false)
      setSelectedProduct(null)
      setEditErrors({})
    } catch (error) {
      console.error('Error updating product:', error)
    }
  }

  const handleDeleteProduct = async (productId: string) => {
    const productToDelete = products.find(p => p.id === productId)
    if (!productToDelete) {
      showEditErrorToast('Product', 'Product not found')
      return
    }

    try {
      await deleteProduct.mutateAsync(productId)
    } catch (error) {
      console.error('Error deleting product:', error)
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
                <Package className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Products Management</h1>
                {user?.role === 'admin' && (
                  <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 px-3 py-1 text-sm font-bold">
                    <Shield className="h-4 w-4 mr-1" />
                    ADMIN
                  </Badge>
                )}
              </div>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {user?.role === 'admin' 
                  ? "Full administrative control over all products, pricing, and system configurations"
                  : "Manage water products, pricing, and inventory"
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
              onClick={() => setIsCreateDialogOpen(true)}
              className={`w-full sm:w-auto ${user?.role === 'admin' ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'} text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105`}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </div>
        </div>
      </div>

      {/* Products List */}
      <Card>
        <CardHeader>
          <CardTitle>All Products ({products.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {products.map((product) => (
              <div key={product.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-lg">{product.name}</h3>
                    <Package className="h-5 w-5 text-blue-500" />
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {product.volume} - {product.units_per_pallet} units/pallet
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    Created: {new Date(product.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Badge className={product.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : product.status === 'inactive' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'}>
                      {product.status === 'active' && <CheckCircle className="h-3 w-3 mr-1" />}
                      {product.status === 'discontinued' && <XCircle className="h-3 w-3 mr-1" />}
                      {(product.status || 'active').toUpperCase()}
                    </Badge>
                    <span className="font-semibold text-lg">{product.unit_price} DA</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditProduct(product)}
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
                            Delete Product
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete <strong>{product.name}</strong>? 
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
                            onClick={() => handleDeleteProduct(product.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Delete Product
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

      {/* Create Product Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Product</DialogTitle>
          </DialogHeader>
          <FormLayout onSubmit={(e) => { e.preventDefault(); handleCreateProduct(); }}>
            <FormInput
              label="Product Name"
              name="create_name"
              required
              error={createErrors.name}
              value={createForm.name}
              onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
              placeholder="Enter product name"
            />
            <FormInput
              label="Volume"
              name="create_volume"
              required
              error={createErrors.volume}
              value={createForm.volume}
              onChange={(e) => setCreateForm({ ...createForm, volume: e.target.value })}
              placeholder="e.g., 5.5L, 1.5L"
            />
            <FormInput
              label="Units per Pallet"
              name="create_units_per_pallet"
              type="number"
              required
              error={createErrors.units_per_pallet}
              value={createForm.units_per_pallet}
              onChange={(e) => setCreateForm({ ...createForm, units_per_pallet: parseInt(e.target.value) || 0 })}
              placeholder="Enter units per pallet"
            />
            <FormInput
              label="Unit Price (DA)"
              name="create_unit_price"
              type="number"
              step="0.01"
              required
              error={createErrors.unit_price}
              value={createForm.unit_price}
              onChange={(e) => setCreateForm({ ...createForm, unit_price: parseFloat(e.target.value) || 0 })}
              placeholder="Enter unit price"
            />
            <FormSelect
              label="Status"
              name="create_status"
              value={createForm.status}
              onValueChange={(value: 'active' | 'inactive' | 'discontinued') => setCreateForm({ ...createForm, status: value })}
              options={[
                { value: 'active', label: 'Active' },
                { value: 'inactive', label: 'Inactive' },
                { value: 'discontinued', label: 'Discontinued' }
              ]}
              placeholder="Select status"
            />
            <FormActions>
              <FormButton 
                variant="outline" 
                onClick={() => {
                  setIsCreateDialogOpen(false)
                  setCreateErrors({})
                }}
              >
                Cancel
              </FormButton>
              <FormButton 
                onClick={handleCreateProduct}
                loading={createProduct.isPending}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Create Product
              </FormButton>
            </FormActions>
          </FormLayout>
        </DialogContent>
      </Dialog>

      {/* Edit Product Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5 text-blue-500" />
              Edit Product
            </DialogTitle>
          </DialogHeader>
          <FormLayout onSubmit={(e) => { e.preventDefault(); handleUpdateProduct(); }}>
            <FormInput
              label="Product Name"
              name="name"
              required
              error={editErrors.name}
              value={editForm.name}
              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              placeholder="Enter product name"
            />
            <FormInput
              label="Volume"
              name="volume"
              required
              error={editErrors.volume}
              value={editForm.volume}
              onChange={(e) => setEditForm({ ...editForm, volume: e.target.value })}
              placeholder="e.g., 5.5L, 1.5L"
            />
            <FormInput
              label="Units per Pallet"
              name="units_per_pallet"
              type="number"
              required
              error={editErrors.units_per_pallet}
              value={editForm.units_per_pallet}
              onChange={(e) => setEditForm({ ...editForm, units_per_pallet: parseInt(e.target.value) || 0 })}
              placeholder="Enter units per pallet"
            />
            <FormInput
              label="Unit Price (DA)"
              name="unit_price"
              type="number"
              step="0.01"
              required
              error={editErrors.unit_price}
              value={editForm.unit_price}
              onChange={(e) => setEditForm({ ...editForm, unit_price: parseFloat(e.target.value) || 0 })}
              placeholder="Enter unit price"
            />
            <FormSelect
              label="Status"
              name="status"
              value={editForm.status}
              onValueChange={(value: 'active' | 'inactive' | 'discontinued') => setEditForm({ ...editForm, status: value })}
              options={[
                { value: 'active', label: 'Active' },
                { value: 'inactive', label: 'Inactive' },
                { value: 'discontinued', label: 'Discontinued' }
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
                onClick={handleUpdateProduct}
                loading={updateProduct.isPending}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Update Product
              </FormButton>
            </FormActions>
          </FormLayout>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default withAuth(ProductsPage)