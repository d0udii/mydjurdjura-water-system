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
import { useDataStore } from "@/lib/supabase-data-store"
import { showBLNumberSuccessToast, showBLNumberErrorToast, showLoadingToast, dismissToast } from "@/lib/toast-notifications"
import { logSupabaseError } from "@/lib/error-handling"
import { useBLNumbers, useCreateBLNumber, useUpdateBLNumber } from "@/lib/supabase-realtime-hooks"
import { FileText, Edit, Trash2, Plus, Search, Filter } from "lucide-react"

import { useAuth } from "@/lib/auth"
import { withAuth } from "@/lib/auth"

interface BLNumber {
  id: string
  order_id: string
  bl_number: string
  created_at: string
  created_by: string
  status: "active" | "inactive" | "cancelled"
  notes: string
}

function BLNumbersPage() {
  const { user } = useAuth()
  const { data: blNumbers = [], isLoading: loading, error } = useBLNumbers()
  const createBLNumber = useCreateBLNumber()
  const updateBLNumber = useUpdateBLNumber()
  
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [selectedBL, setSelectedBL] = useState<BLNumber | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [formData, setFormData] = useState({
    order_id: "",
    notes: ""
  })

  const resetForm = () => {
    setFormData({
      order_id: "",
      notes: ""
    })
  }

  const handleCreateBL = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.order_id.trim()) {
      showBLNumberErrorToast('create', new Error('Please select an order'))
      return
    }

    const loadingToastId = showLoadingToast('Creating BL number...')

    try {
      const blData = {
        order_id: formData.order_id,
        bl_number: `BL-${Date.now()}`,
        notes: formData.notes,
        created_by: user?.id || 'unknown'
      }

      await createBLNumber.mutateAsync(blData)
      setIsCreateOpen(false)
      resetForm()
    } catch (error) {
      console.error('Error creating BL number:', error)
      logSupabaseError('CREATE', 'BL Number', error, { formData })
    } finally {
      dismissToast(loadingToastId)
    }
  }

  const handleEditBL = (bl: BLNumber) => {
    setSelectedBL(bl)
    setFormData({
      order_id: bl.order_id,
      notes: bl.notes
    })
    setIsEditOpen(true)
  }

  const handleUpdateBL = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedBL) return

    const loadingToastId = showLoadingToast('Updating BL number...')

    try {
      await updateBLNumber.mutateAsync({
        id: selectedBL.id,
        updates: { notes: formData.notes }
      })
      
      setIsEditOpen(false)
      setSelectedBL(null)
      resetForm()
    } catch (error) {
      console.error('Error updating BL number:', error)
      logSupabaseError('UPDATE', 'BL Number', error, { selectedBL, formData })
    } finally {
      dismissToast(loadingToastId)
    }
  }

  // Filter BL numbers based on search and status
  const filteredBLNumbers = blNumbers.filter(bl => {
    const matchesSearch = bl.bl_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         bl.order_id.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === "all" || bl.status === filterStatus
    return matchesSearch && matchesStatus
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading BL Numbers...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">BL Numbers Management</h1>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create BL Number
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
                  placeholder="Search by BL number or order ID..."
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
                    {filterStatus === "all" ? "All Statuses" : filterStatus}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setFilterStatus("all")}>
                    All Statuses
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterStatus("active")}>
                    Active
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterStatus("inactive")}>
                    Inactive
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterStatus("cancelled")}>
                    Cancelled
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* BL Numbers Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            BL Numbers ({filteredBLNumbers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>BL Number</TableHead>
                <TableHead>Order ID</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBLNumbers.map((bl) => (
                <TableRow key={bl.id}>
                  <TableCell className="font-medium">{bl.bl_number}</TableCell>
                  <TableCell>{bl.order_id}</TableCell>
                  <TableCell>
                    <Badge variant={bl.status === "active" ? "default" : "secondary"}>
                      {bl.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(bl.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="max-w-xs truncate">{bl.notes}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditBL(bl)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {filteredBLNumbers.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No BL numbers found
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create BL Number Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New BL Number</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateBL} className="space-y-4">
            <div>
              <Label htmlFor="order_id">Order ID</Label>
              <Input
                id="order_id"
                value={formData.order_id}
                onChange={(e) => setFormData({ ...formData, order_id: e.target.value })}
                placeholder="Enter order ID"
                required
              />
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
              <Button type="submit">Create BL Number</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit BL Number Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit BL Number</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateBL} className="space-y-4">
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
              <Button type="submit">Update BL Number</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default withAuth(BLNumbersPage)