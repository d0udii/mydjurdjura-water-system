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
import { Package, Edit, Trash2, Plus, Search, Filter } from "lucide-react"

import { useAuth } from "@/lib/auth"
import { withAuth } from "@/lib/auth"

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
  status: "no_return" | "partial_return" | "complete_return"
  created_at: string
  updated_at: string
}

function PalletTrackingPage() {
  const { user } = useAuth()
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

  useEffect(() => {
    fetchPalletTracking()
  }, [])

  const fetchPalletTracking = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/pallet-tracking')
      if (response.ok) {
        const data = await response.json()
        setPalletTracking(data.palletTracking || [])
      }
    } catch (error) {
      console.error('Error fetching pallet tracking:', error)
    } finally {
      setLoading(false)
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

  const handleCreateTracking = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.order_id || !formData.wooden_pallets_sent || !formData.intercalaires_sent) {
      alert('Please fill in all required fields')
      return
    }

    try {
      const response = await fetch('/api/pallet-tracking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          wooden_pallets_sent: parseInt(formData.wooden_pallets_sent),
          intercalaires_sent: parseInt(formData.intercalaires_sent),
          wooden_pallets_returned: parseInt(formData.wooden_pallets_returned) || 0,
          intercalaires_returned: parseInt(formData.intercalaires_returned) || 0,
          wooden_pallets_good_condition: parseInt(formData.wooden_pallets_good_condition) || 0,
          wooden_pallets_bad_condition: parseInt(formData.wooden_pallets_bad_condition) || 0,
          intercalaires_good_condition: parseInt(formData.intercalaires_good_condition) || 0,
          intercalaires_bad_condition: parseInt(formData.intercalaires_bad_condition) || 0,
          status: 'no_return'
        }),
      })

      if (response.ok) {
        await fetchPalletTracking() // Refetch to ensure consistency
        setIsCreateOpen(false)
        resetForm()
      } else {
        alert('Failed to create pallet tracking')
      }
    } catch (error) {
      console.error('Error creating pallet tracking:', error)
      alert('Failed to create pallet tracking')
    }
  }

  const handleEditTracking = (tracking: PalletTracking) => {
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

  const handleUpdateTracking = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedTracking) return

    try {
      const response = await fetch('/api/pallet-tracking', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: selectedTracking.id,
          ...formData,
          wooden_pallets_sent: parseInt(formData.wooden_pallets_sent),
          intercalaires_sent: parseInt(formData.intercalaires_sent),
          wooden_pallets_returned: parseInt(formData.wooden_pallets_returned) || 0,
          intercalaires_returned: parseInt(formData.intercalaires_returned) || 0,
          wooden_pallets_good_condition: parseInt(formData.wooden_pallets_good_condition) || 0,
          wooden_pallets_bad_condition: parseInt(formData.wooden_pallets_bad_condition) || 0,
          intercalaires_good_condition: parseInt(formData.intercalaires_good_condition) || 0,
          intercalaires_bad_condition: parseInt(formData.intercalaires_bad_condition) || 0
        }),
      })

      if (response.ok) {
        await fetchPalletTracking() // Refetch to ensure consistency
        setIsEditOpen(false)
        setSelectedTracking(null)
        resetForm()
      } else {
        alert('Failed to update pallet tracking')
      }
    } catch (error) {
      console.error('Error updating pallet tracking:', error)
      alert('Failed to update pallet tracking')
    }
  }

  const handleDeleteTracking = async (trackingId: string) => {
    try {
      const response = await fetch('/api/pallet-tracking', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: trackingId }),
      })

      if (response.ok) {
        await fetchPalletTracking() // Refetch to ensure consistency
      } else {
        alert('Failed to delete pallet tracking')
      }
    } catch (error) {
      console.error('Error deleting pallet tracking:', error)
      alert('Failed to delete pallet tracking')
    }
  }

  // Filter tracking based on search and status
  const filteredTracking = palletTracking.filter(tracking => {
    const matchesSearch = tracking.order_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tracking.client_id.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === "all" || tracking.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'complete_return': return 'default'
      case 'partial_return': return 'secondary'
      case 'no_return': return 'destructive'
      default: return 'default'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading Pallet Tracking...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Pallet Tracking</h1>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Tracking
        </Button>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="p-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search by order ID or client ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-48">
              <Label htmlFor="status">Status</Label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full justify-between">
                    <Filter className="w-4 h-4 mr-2" />
                    {filterStatus === "all" ? "All Statuses" : filterStatus.replace('_', ' ')}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setFilterStatus("all")}>
                    All Statuses
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterStatus("no_return")}>
                    No Return
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterStatus("partial_return")}>
                    Partial Return
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterStatus("complete_return")}>
                    Complete Return
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pallet Tracking Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Pallet Tracking ({filteredTracking.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Client ID</TableHead>
                <TableHead>Sent</TableHead>
                <TableHead>Returned</TableHead>
                <TableHead>Good Condition</TableHead>
                <TableHead>Bad Condition</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Return Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTracking.map((tracking) => (
                <TableRow key={tracking.id}>
                  <TableCell className="font-medium">{tracking.order_id}</TableCell>
                  <TableCell>{tracking.client_id}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>Wooden: {tracking.wooden_pallets_sent}</div>
                      <div>Intercalaires: {tracking.intercalaires_sent}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>Wooden: {tracking.wooden_pallets_returned}</div>
                      <div>Intercalaires: {tracking.intercalaires_returned}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>Wooden: {tracking.wooden_pallets_good_condition}</div>
                      <div>Intercalaires: {tracking.intercalaires_good_condition}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>Wooden: {tracking.wooden_pallets_bad_condition}</div>
                      <div>Intercalaires: {tracking.intercalaires_bad_condition}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusColor(tracking.status) as any}>
                      {tracking.status.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {tracking.return_date ? new Date(tracking.return_date).toLocaleDateString() : 'N/A'}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditTracking(tracking)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Pallet Tracking</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this pallet tracking record? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteTracking(tracking.id)}>
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {filteredTracking.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No pallet tracking records found
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Tracking Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Pallet Tracking</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateTracking} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="order_id">Order ID *</Label>
                <Input
                  id="order_id"
                  value={formData.order_id}
                  onChange={(e) => setFormData({ ...formData, order_id: e.target.value })}
                  placeholder="Order ID"
                  required
                />
              </div>
              <div>
                <Label htmlFor="return_date">Return Date</Label>
                <Input
                  id="return_date"
                  type="date"
                  value={formData.return_date}
                  onChange={(e) => setFormData({ ...formData, return_date: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="wooden_pallets_sent">Wooden Pallets Sent *</Label>
                <Input
                  id="wooden_pallets_sent"
                  type="number"
                  value={formData.wooden_pallets_sent}
                  onChange={(e) => setFormData({ ...formData, wooden_pallets_sent: e.target.value })}
                  placeholder="0"
                  required
                />
              </div>
              <div>
                <Label htmlFor="intercalaires_sent">Intercalaires Sent *</Label>
                <Input
                  id="intercalaires_sent"
                  type="number"
                  value={formData.intercalaires_sent}
                  onChange={(e) => setFormData({ ...formData, intercalaires_sent: e.target.value })}
                  placeholder="0"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="wooden_pallets_returned">Wooden Pallets Returned</Label>
                <Input
                  id="wooden_pallets_returned"
                  type="number"
                  value={formData.wooden_pallets_returned}
                  onChange={(e) => setFormData({ ...formData, wooden_pallets_returned: e.target.value })}
                  placeholder="0"
                />
              </div>
              <div>
                <Label htmlFor="intercalaires_returned">Intercalaires Returned</Label>
                <Input
                  id="intercalaires_returned"
                  type="number"
                  value={formData.intercalaires_returned}
                  onChange={(e) => setFormData({ ...formData, intercalaires_returned: e.target.value })}
                  placeholder="0"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="wooden_pallets_good_condition">Wooden Pallets Good Condition</Label>
                <Input
                  id="wooden_pallets_good_condition"
                  type="number"
                  value={formData.wooden_pallets_good_condition}
                  onChange={(e) => setFormData({ ...formData, wooden_pallets_good_condition: e.target.value })}
                  placeholder="0"
                />
              </div>
              <div>
                <Label htmlFor="wooden_pallets_bad_condition">Wooden Pallets Bad Condition</Label>
                <Input
                  id="wooden_pallets_bad_condition"
                  type="number"
                  value={formData.wooden_pallets_bad_condition}
                  onChange={(e) => setFormData({ ...formData, wooden_pallets_bad_condition: e.target.value })}
                  placeholder="0"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="intercalaires_good_condition">Intercalaires Good Condition</Label>
                <Input
                  id="intercalaires_good_condition"
                  type="number"
                  value={formData.intercalaires_good_condition}
                  onChange={(e) => setFormData({ ...formData, intercalaires_good_condition: e.target.value })}
                  placeholder="0"
                />
              </div>
              <div>
                <Label htmlFor="intercalaires_bad_condition">Intercalaires Bad Condition</Label>
                <Input
                  id="intercalaires_bad_condition"
                  type="number"
                  value={formData.intercalaires_bad_condition}
                  onChange={(e) => setFormData({ ...formData, intercalaires_bad_condition: e.target.value })}
                  placeholder="0"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Additional notes..."
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Add Tracking</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Tracking Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Pallet Tracking</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateTracking} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit_order_id">Order ID *</Label>
                <Input
                  id="edit_order_id"
                  value={formData.order_id}
                  onChange={(e) => setFormData({ ...formData, order_id: e.target.value })}
                  placeholder="Order ID"
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit_return_date">Return Date</Label>
                <Input
                  id="edit_return_date"
                  type="date"
                  value={formData.return_date}
                  onChange={(e) => setFormData({ ...formData, return_date: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit_wooden_pallets_sent">Wooden Pallets Sent *</Label>
                <Input
                  id="edit_wooden_pallets_sent"
                  type="number"
                  value={formData.wooden_pallets_sent}
                  onChange={(e) => setFormData({ ...formData, wooden_pallets_sent: e.target.value })}
                  placeholder="0"
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit_intercalaires_sent">Intercalaires Sent *</Label>
                <Input
                  id="edit_intercalaires_sent"
                  type="number"
                  value={formData.intercalaires_sent}
                  onChange={(e) => setFormData({ ...formData, intercalaires_sent: e.target.value })}
                  placeholder="0"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="edit_notes">Notes</Label>
              <Textarea
                id="edit_notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Additional notes..."
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Update Tracking</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default withAuth(PalletTrackingPage)