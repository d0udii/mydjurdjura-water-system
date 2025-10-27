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
import { logEditActivity, logDeleteActivity } from "@/lib/activity-logging"

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
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [editForm, setEditForm] = useState({
    name: '',
    volume: '',
    units_per_pallet: 0,
    unit_price: 0,
    status: 'active' as 'active' | 'inactive' | 'discontinued'
  })
  
  // Admin permissions
  const isUserAdmin = user?.role === "admin"

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const response = await fetch('/api/products')
      if (response.ok) {
        const data = await response.json()
        setProducts(data.products || [])
      }
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
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

    // Validation
    if (!editForm.name.trim()) {
      showEditErrorToast('Product', 'Name is required')
      return
    }
    if (!editForm.volume.trim()) {
      showEditErrorToast('Product', 'Volume is required')
      return
    }
    if (editForm.units_per_pallet <= 0) {
      showEditErrorToast('Product', 'Units per pallet must be greater than 0')
      return
    }
    if (editForm.unit_price <= 0) {
      showEditErrorToast('Product', 'Unit price must be greater than 0')
      return
    }

    try {
      const oldValues = {
        name: selectedProduct.name,
        volume: selectedProduct.volume,
        units_per_pallet: selectedProduct.units_per_pallet,
        unit_price: selectedProduct.unit_price,
        status: selectedProduct.status
      }

      const response = await fetch(`/api/products/${selectedProduct.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editForm),
      })

      if (response.ok) {
        // Update local state
        setProducts(products.map(p => 
          p.id === selectedProduct.id 
            ? { ...p, ...editForm }
            : p
        ))
        
        showEditSuccessToast('Product', editForm.name)
        
        // Log activity
        await logEditActivity(
          user?.id || 'unknown',
          user?.name || 'Unknown User',
          'Product',
          selectedProduct.id,
          editForm.name,
          oldValues,
          editForm
        )
        
        setIsEditDialogOpen(false)
        setSelectedProduct(null)
      } else {
        const errorData = await response.json()
        showEditErrorToast('Product', errorData.error || 'Failed to update product')
      }
    } catch (error) {
      console.error('Error updating product:', error)
      showEditErrorToast('Product', 'Network error occurred')
    }
  }

  const handleDeleteProduct = async (productId: string) => {
    const productToDelete = products.find(p => p.id === productId)
    if (!productToDelete) {
      showEditErrorToast('Product', 'Product not found')
      return
    }

    try {
      const oldValues = {
        name: productToDelete.name,
        volume: productToDelete.volume,
        units_per_pallet: productToDelete.units_per_pallet,
        unit_price: productToDelete.unit_price,
        status: productToDelete.status
      }

      const response = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        // Update local state
        setProducts(products.filter(p => p.id !== productId))
        
        showDeleteSuccessToast('Product', productToDelete.name)
        
        // Log activity
        await logDeleteActivity(
          user?.id || 'unknown',
          user?.name || 'Unknown User',
          'Product',
          productId,
          productToDelete.name,
          oldValues
        )
      } else {
        const errorData = await response.json()
        showEditErrorToast('Product', errorData.error || 'Failed to delete product')
      }
    } catch (error) {
      console.error('Error deleting product:', error)
      showEditErrorToast('Product', 'Network error occurred')
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
            <Button className={`w-full sm:w-auto ${user?.role === 'admin' ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'} text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105`}>
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
                      {product.status.toUpperCase()}
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

      {/* Edit Product Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5 text-blue-500" />
              Edit Product
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Product Name</Label>
              <Input
                id="name"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                placeholder="Enter product name"
              />
            </div>
            <div>
              <Label htmlFor="volume">Volume</Label>
              <Input
                id="volume"
                value={editForm.volume}
                onChange={(e) => setEditForm({ ...editForm, volume: e.target.value })}
                placeholder="e.g., 5.5L, 1.5L"
              />
            </div>
            <div>
              <Label htmlFor="units_per_pallet">Units per Pallet</Label>
              <Input
                id="units_per_pallet"
                type="number"
                value={editForm.units_per_pallet}
                onChange={(e) => setEditForm({ ...editForm, units_per_pallet: parseInt(e.target.value) || 0 })}
                placeholder="Enter units per pallet"
              />
            </div>
            <div>
              <Label htmlFor="unit_price">Unit Price (DA)</Label>
              <Input
                id="unit_price"
                type="number"
                value={editForm.unit_price}
                onChange={(e) => setEditForm({ ...editForm, unit_price: parseFloat(e.target.value) || 0 })}
                placeholder="Enter unit price"
              />
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={editForm.status} onValueChange={(value: 'active' | 'inactive' | 'discontinued') => setEditForm({ ...editForm, status: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="discontinued">Discontinued</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateProduct} className="bg-blue-600 hover:bg-blue-700">
                Update Product
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default withAuth(ProductsPage)