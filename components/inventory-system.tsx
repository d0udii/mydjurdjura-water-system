"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Package, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle,
  Plus,
  Minus,
  Edit,
  Trash2,
  RefreshCw,
  BarChart3,
  Package2,
  Truck,
  Warehouse,
  AlertCircle,
  Zap,
  Target,
  Calendar
} from "lucide-react"
import { useAuth } from "@/lib/auth"
import { withAuth } from "@/lib/auth"

interface InventoryItem {
  id: string
  name: string
  type: '5.5L' | '1.5L' | 'pallet' | 'bottle'
  current_stock: number
  min_stock: number
  max_stock: number
  unit_price: number
  last_updated: string
  location: string
  supplier: string
  status: 'in_stock' | 'low_stock' | 'out_of_stock' | 'reserved'
}

interface StockMovement {
  id: string
  item_id: string
  type: 'in' | 'out' | 'transfer' | 'adjustment'
  quantity: number
  reason: string
  order_id?: string
  created_by: string
  created_at: string
  notes?: string
}

interface InventorySystemProps {
  className?: string
}

export const InventorySystem: React.FC<InventorySystemProps> = ({ className }) => {
  const { user } = useAuth()
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [movements, setMovements] = useState<StockMovement[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null)

  const fetchInventory = async () => {
    try {
      setLoading(true)
      
      // Mock inventory data
      const mockInventory: InventoryItem[] = [
        {
          id: 'INV-001',
          name: '5.5L Water Bottles',
          type: '5.5L',
          current_stock: 1250,
          min_stock: 500,
          max_stock: 2000,
          unit_price: 65,
          last_updated: '2024-01-15T10:00:00Z',
          location: 'Warehouse A',
          supplier: 'Djurdjura Factory',
          status: 'in_stock'
        },
        {
          id: 'INV-002',
          name: '1.5L Water Bottles',
          type: '1.5L',
          current_stock: 180,
          min_stock: 300,
          max_stock: 1000,
          unit_price: 178.5,
          last_updated: '2024-01-15T10:00:00Z',
          location: 'Warehouse B',
          supplier: 'Djurdjura Factory',
          status: 'low_stock'
        },
        {
          id: 'INV-003',
          name: '5.5L Pallets',
          type: 'pallet',
          current_stock: 45,
          min_stock: 20,
          max_stock: 100,
          unit_price: 13780, // 212 bottles × 65 DA
          last_updated: '2024-01-15T10:00:00Z',
          location: 'Warehouse A',
          supplier: 'Djurdjura Factory',
          status: 'in_stock'
        },
        {
          id: 'INV-004',
          name: '1.5L Pallets',
          type: 'pallet',
          current_stock: 8,
          min_stock: 15,
          max_stock: 50,
          unit_price: 19992, // 112 bottles × 178.5 DA
          last_updated: '2024-01-15T10:00:00Z',
          location: 'Warehouse B',
          supplier: 'Djurdjura Factory',
          status: 'low_stock'
        }
      ]

      setInventory(mockInventory)

      // Mock stock movements
      const mockMovements: StockMovement[] = [
        {
          id: 'MOV-001',
          item_id: 'INV-001',
          type: 'out',
          quantity: 50,
          reason: 'Order fulfillment',
          order_id: 'ORD-001',
          created_by: 'USR-004',
          created_at: '2024-01-15T09:00:00Z',
          notes: 'Order ORD-001 - 5.5L bottles'
        },
        {
          id: 'MOV-002',
          item_id: 'INV-002',
          type: 'out',
          quantity: 30,
          reason: 'Order fulfillment',
          order_id: 'ORD-002',
          created_by: 'USR-004',
          created_at: '2024-01-15T08:30:00Z',
          notes: 'Order ORD-002 - 1.5L bottles'
        },
        {
          id: 'MOV-003',
          item_id: 'INV-001',
          type: 'in',
          quantity: 200,
          reason: 'Stock replenishment',
          created_by: 'USR-001',
          created_at: '2024-01-14T16:00:00Z',
          notes: 'Factory delivery - 200 units'
        }
      ]

      setMovements(mockMovements)
    } catch (error) {
      console.error('Error fetching inventory:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateStock = async (itemId: string, quantity: number, type: 'in' | 'out', reason: string, orderId?: string) => {
    try {
      const item = inventory.find(i => i.id === itemId)
      if (!item) return

      const newQuantity = type === 'in' ? item.current_stock + quantity : item.current_stock - quantity
      
      if (newQuantity < 0) {
        alert('Insufficient stock!')
        return
      }

      // Update inventory
      setInventory(prev => 
        prev.map(i => 
          i.id === itemId 
            ? { 
                ...i, 
                current_stock: newQuantity,
                status: getStockStatus(newQuantity, i.min_stock, i.max_stock),
                last_updated: new Date().toISOString()
              }
            : i
        )
      )

      // Add movement record
      const newMovement: StockMovement = {
        id: `MOV-${Date.now()}`,
        item_id: itemId,
        type,
        quantity,
        reason,
        order_id: orderId,
        created_by: user?.id || 'system',
        created_at: new Date().toISOString(),
        notes: `${type === 'in' ? 'Stock added' : 'Stock removed'} - ${reason}`
      }

      setMovements(prev => [newMovement, ...prev])
    } catch (error) {
      console.error('Error updating stock:', error)
    }
  }

  const getStockStatus = (current: number, min: number, max: number): 'in_stock' | 'low_stock' | 'out_of_stock' | 'reserved' => {
    if (current === 0) return 'out_of_stock'
    if (current <= min) return 'low_stock'
    if (current >= max * 0.9) return 'reserved'
    return 'in_stock'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in_stock':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'low_stock':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'out_of_stock':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      case 'reserved':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'in_stock':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'low_stock':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case 'out_of_stock':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      case 'reserved':
        return <Package2 className="h-4 w-4 text-blue-500" />
      default:
        return <Package className="h-4 w-4 text-gray-500" />
    }
  }

  const getStockPercentage = (current: number, max: number) => {
    return Math.min((current / max) * 100, 100)
  }

  const getLowStockItems = () => {
    return inventory.filter(item => item.status === 'low_stock' || item.status === 'out_of_stock')
  }

  const getTotalValue = () => {
    return inventory.reduce((total, item) => total + (item.current_stock * item.unit_price), 0)
  }

  useEffect(() => {
    fetchInventory()
    
    // Real-time updates every 60 seconds
    const interval = setInterval(fetchInventory, 60000)
    
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const lowStockItems = getLowStockItems()

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Inventory Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
            <Package className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{inventory.length}</div>
            <p className="text-xs text-gray-500">Active inventory items</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {getTotalValue().toLocaleString()} DA
            </div>
            <p className="text-xs text-gray-500">Current stock value</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{lowStockItems.length}</div>
            <p className="text-xs text-gray-500">Items need restocking</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {inventory.filter(item => item.status === 'out_of_stock').length}
            </div>
            <p className="text-xs text-gray-500">Items out of stock</p>
          </CardContent>
        </Card>
      </div>

      {/* Low Stock Alert */}
      {lowStockItems.length > 0 && (
        <Alert className="border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800 dark:text-yellow-200">
            <strong>Low Stock Alert:</strong> {lowStockItems.length} item(s) need immediate attention. 
            Consider restocking: {lowStockItems.map(item => item.name).join(', ')}
          </AlertDescription>
        </Alert>
      )}

      {/* Inventory Items */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Warehouse className="h-5 w-5 text-blue-600" />
              Inventory Items
            </CardTitle>
            <div className="flex gap-2">
              <Button 
                size="sm" 
                onClick={() => setShowAddForm(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={fetchInventory}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {inventory.map((item) => (
              <div key={item.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(item.status)}
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {item.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {item.location} • {item.supplier}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(item.status)}>
                      {item.status.replace('_', ' ')}
                    </Badge>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => setEditingItem(item)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Current Stock</label>
                    <div className="text-lg font-semibold text-gray-900 dark:text-white">
                      {item.current_stock.toLocaleString()} units
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Unit Price</label>
                    <div className="text-lg font-semibold text-gray-900 dark:text-white">
                      {item.unit_price.toLocaleString()} DA
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Value</label>
                    <div className="text-lg font-semibold text-gray-900 dark:text-white">
                      {(item.current_stock * item.unit_price).toLocaleString()} DA
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                    <span>Stock Level</span>
                    <span>{item.current_stock} / {item.max_stock}</span>
                  </div>
                  <Progress 
                    value={getStockPercentage(item.current_stock, item.max_stock)} 
                    className="h-2"
                  />
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>Min: {item.min_stock}</span>
                    <span>Max: {item.max_stock}</span>
                  </div>
                </div>

                <div className="flex gap-2 mt-3">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => updateStock(item.id, 10, 'in', 'Manual adjustment')}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Stock
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => updateStock(item.id, 10, 'out', 'Manual adjustment')}
                  >
                    <Minus className="h-4 w-4 mr-2" />
                    Remove Stock
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Stock Movements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-green-600" />
            Recent Stock Movements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {movements.slice(0, 10).map((movement) => {
              const item = inventory.find(i => i.id === movement.item_id)
              return (
                <div key={movement.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      movement.type === 'in' ? 'bg-green-500' : 
                      movement.type === 'out' ? 'bg-red-500' : 
                      'bg-blue-500'
                    }`} />
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white text-sm">
                        {item?.name || 'Unknown Item'}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        {movement.reason} • {new Date(movement.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`font-semibold text-sm ${
                      movement.type === 'in' ? 'text-green-600' : 
                      movement.type === 'out' ? 'text-red-600' : 
                      'text-blue-600'
                    }`}>
                      {movement.type === 'in' ? '+' : '-'}{movement.quantity}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {movement.type}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default withAuth(InventorySystem)
