"use client"

import React, { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Textarea } from "@/components/ui/textarea"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Plus, Edit, Trash2, MoreHorizontal, Download, Phone, Mail, MapPin, User, Building, Eye, CheckCircle, XCircle, Clock, Users, RefreshCw, UserCheck, ShoppingCart, DollarSign, Crown, Shield, Zap, Lock, Unlock, Search, Filter } from "lucide-react"
import { showEditSuccessToast, showEditErrorToast, showDeleteSuccessToast, showDeleteErrorToast } from "@/lib/toast-notifications"
import { logEditActivity, logDeleteActivity } from "@/lib/activity-logging"
import { useClients, useCreateClient, useUpdateClient, useDeleteClient, useRegions } from "@/lib/supabase-realtime-hooks"
import { useAuth } from "@/lib/auth"
import { withAuth } from "@/lib/auth"

// Loading Spinner Component
const LoadingSpinner = ({ text, subtext }: { text: string; subtext?: string }) => (
  <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
    <div className="text-center space-y-4">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{text}</h2>
        {subtext && <p className="text-gray-600 dark:text-gray-400 mt-1">{subtext}</p>}
      </div>
    </div>
  </div>
)

interface Client {
  id: string
  name: string
  phone: string
  address: string
  region_id: string
  contact_person?: string
  rc_number?: string
  status: 'active' | 'inactive'
  created_at: string
  updated_at: string
}

interface Supervisor {
  id: string
  name: string
  email: string
  region_id: string
  assigned_cities: string[]
}

interface Region {
  id: string
  name: string
  responsible: string
}

function ClientsPage() {
  const { user } = useAuth()
  const { data: clients = [], isLoading: loading, error } = useClients()
  const { data: regions = [] } = useRegions()
  const createClient = useCreateClient()
  const updateClient = useUpdateClient()
  const deleteClient = useDeleteClient()
  
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    rc_number: "",
    city: "",
    region_id: "",
    contact_person: "",
    supervisor_id: "",
    status: "active" as 'active' | 'inactive'
  })

  const resetForm = () => {
    setFormData({
      name: "",
      phone: "",
      address: "",
      rc_number: "",
      city: "",
      region_id: "",
      contact_person: "",
      supervisor_id: "",
      status: "active"
    })
  }

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.phone || !formData.address || !formData.region_id) {
      showEditErrorToast('Client', 'Please fill all required fields (Name, Phone, Address, and Region)')
      return
    }

    try {
      await createClient.mutateAsync({
        name: formData.name,
        phone: formData.phone,
        address: formData.address,
        rc_number: formData.rc_number,
        region_id: formData.region_id,
        contact_person: formData.contact_person,
        status: formData.status
      })
      
      setIsCreateOpen(false)
      resetForm()
      showEditSuccessToast('Client', formData.name)
    } catch (error) {
      console.error("Failed to create client:", error)
      showEditErrorToast('Client', error instanceof Error ? error.message : 'Failed to create client')
    }
  }

  const handleEdit = (client: Client) => {
    setSelectedClient(client)
    setFormData({
      name: client.name,
      phone: client.phone,
      address: client.address,
      rc_number: client.rc_number || "",
      city: client.address.split(',')[1]?.trim() || "",
      region_id: client.region_id,
      contact_person: client.contact_person || "",
      supervisor_id: "", // Will be set based on city or manually
      status: client.status
    })
    setIsEditOpen(true)
  }

  const handleUpdateClient = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedClient) return

    if (!formData.name || !formData.phone || !formData.address || !formData.region_id) {
      showEditErrorToast('Client', 'Please fill all required fields (Name, Phone, Address, and Region)')
      return
    }

    try {
      // Prepare old values for activity logging
      const oldValues = {
        name: selectedClient.name,
        phone: selectedClient.phone,
        address: selectedClient.address,
        rc_number: selectedClient.rc_number || "",
        region_id: selectedClient.region_id,
        contact_person: selectedClient.contact_person || "",
        status: selectedClient.status
      }

      // Prepare new values for activity logging
      const newValues = {
        name: formData.name,
        phone: formData.phone,
        address: formData.address,
        rc_number: formData.rc_number,
        region_id: formData.region_id,
        contact_person: formData.contact_person,
        status: formData.status
      }

      await updateClient.mutateAsync({
        id: selectedClient.id,
        updates: {
          name: formData.name,
          phone: formData.phone,
          address: formData.address,
          rc_number: formData.rc_number,
          region_id: formData.region_id,
          contact_person: formData.contact_person,
          status: formData.status
        }
      })

      setIsEditOpen(false)
      resetForm()

      // Show success toast
      showEditSuccessToast('Client', formData.name)

      // Log activity
      if (user) {
        await logEditActivity(
          user.id,
          user.name || 'Unknown User',
          'Client',
          selectedClient.id,
          formData.name,
          oldValues,
          newValues
        )
      }

    } catch (error) {
      console.error("Failed to update client:", error)
      showEditErrorToast('Client', error instanceof Error ? error.message : 'Failed to update client')
    }
  }

  const handleDelete = async (clientId: string) => {
    try {
      const clientToDelete = clients.find(client => client.id === clientId)
      if (!clientToDelete) {
        showEditErrorToast('Client', 'Client not found')
        return
      }

      // Delete via API
      await deleteClient.mutateAsync(clientId)

      // Show success toast
      showDeleteSuccessToast('Client', clientToDelete.name)

      // Log activity
      if (user) {
        await logDeleteActivity(
          user.id,
          user.name || 'Unknown User',
          'Client',
          clientId,
          clientToDelete.name,
          {
            name: clientToDelete.name,
            phone: clientToDelete.phone,
            address: clientToDelete.address,
            rc_number: clientToDelete.rc_number,
            region_id: clientToDelete.region_id,
            status: clientToDelete.status
          }
        )
      }

    } catch (error) {
      console.error("Failed to delete client:", error)
      showDeleteErrorToast('Client', error instanceof Error ? error.message : 'Failed to delete client')
    }
  }

  const canCreateClient = user?.role === "admin"
  const canEditClient = (client: Client) => user?.role === "admin"
  const canDeleteClient = (client: Client) => user?.role === "admin"

  if (loading) {
    return <LoadingSpinner text="Loading Clients" subtext="Fetching client data..." />
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="p-4 md:p-6 lg:p-8 space-y-6">
        {/* Enhanced Header with Admin Controls */}
        <div className={`${user?.role === 'admin' ? 'bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border-red-200 dark:border-red-800' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'} rounded-lg border p-6`}>
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className={`p-2 ${user?.role === 'admin' ? 'bg-red-600' : 'bg-blue-600'} rounded-lg`}>
                  {user?.role === 'admin' ? (
                    <Crown className="h-6 w-6 text-white" />
                  ) : (
                    <Users className="h-6 w-6 text-white" />
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">
                    Clients Management
                  </h1>
                  {user?.role === 'admin' && (
                    <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 px-3 py-1 text-sm font-bold">
                      <Shield className="h-4 w-4 mr-1" />
                      ADMIN
                    </Badge>
                  )}
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                {user?.role === 'admin' 
                  ? "Full administrative control over all clients, assignments, and system operations"
                  : "Manage water distribution clients across all regions"
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
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="hover:shadow-lg transition-all duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Clients</CardTitle>
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{clients.length}</div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                +12% from last month
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Clients</CardTitle>
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {clients.filter(c => c.status === 'active').length}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {Math.round((clients.filter(c => c.status === 'active').length / clients.length) * 100)}% of total
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">New This Month</CardTitle>
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <Plus className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">8</div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                +3 from last month
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Orders</CardTitle>
              <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                <ShoppingCart className="h-4 w-4 text-orange-600 dark:text-orange-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">156</div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                +8% from last month
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <Card className="hover:shadow-lg transition-all duration-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5 text-blue-600" />
              Search & Filter Clients
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search by name, phone, or city..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="h-12"
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="h-12">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
                <Button variant="outline" className="h-12">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Clients Table */}
        <Card className="hover:shadow-lg transition-all duration-200">
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                All Clients ({clients.length})
              </CardTitle>
              {canCreateClient && (
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
                    <Button className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105" onClick={resetForm}>
                <Plus className="mr-2 h-4 w-4" />
                Add Client
              </Button>
            </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Add New Client</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleCreateClient} className="space-y-6 pt-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <Label htmlFor="name" className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                            <User className="h-4 w-4 text-blue-600" />
                            Client Name <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="h-12 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
                            placeholder="Enter client name"
                          />
                        </div>

                        <div>
                          <Label htmlFor="phone" className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                            <Phone className="h-4 w-4 text-blue-600" />
                            Phone Number <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="phone"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            className="h-12 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
                            placeholder="Enter phone number"
                          />
                        </div>

                        <div>
                          <Label htmlFor="region_id" className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-blue-600" />
                            Region <span className="text-red-500">*</span>
                          </Label>
                          <Select
                            value={formData.region_id}
                            onValueChange={(value) => setFormData({ ...formData, region_id: value })}
                          >
                            <SelectTrigger className="h-12 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                              <SelectValue placeholder="Select region" />
                            </SelectTrigger>
                            <SelectContent>
                              {regions.map((region) => (
                                <SelectItem key={region.id} value={region.id}>
                                  {region.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label htmlFor="rc_number" className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                            <Building className="h-4 w-4 text-blue-600" />
                            RC Number
                          </Label>
                          <Input
                            id="rc_number"
                            value={formData.rc_number}
                            onChange={(e) => setFormData({ ...formData, rc_number: e.target.value })}
                            className="h-12 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
                            placeholder="Enter RC number"
                          />
                        </div>

                        <div>
                          <Label htmlFor="city" className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                            <Building className="h-4 w-4 text-blue-600" />
                            City
                          </Label>
                          <Input
                            id="city"
                            value={formData.city}
                            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                            className="h-12 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
                            placeholder="Enter city"
                          />
                        </div>

                        <div>
                          <Label htmlFor="contact_person" className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                            <UserCheck className="h-4 w-4 text-blue-600" />
                            Contact Person
                          </Label>
                          <Input
                            id="contact_person"
                            value={formData.contact_person}
                            onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                            className="h-12 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
                            placeholder="Enter contact person"
                          />
                        </div>

                        <div>
                          <Label htmlFor="status" className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-blue-600" />
                            Status
                          </Label>
                          <Select
                            value={formData.status}
                            onValueChange={(value) => setFormData({ ...formData, status: value as 'active' | 'inactive' })}
                          >
                            <SelectTrigger className="h-12 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="active">Active</SelectItem>
                              <SelectItem value="inactive">Inactive</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="address" className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-blue-600" />
                          Address <span className="text-red-500">*</span>
                        </Label>
                        <Textarea
                          id="address"
                          value={formData.address}
                          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                          className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
                          placeholder="Enter full address (street, city, etc.)"
                          rows={3}
                        />
                      </div>

                      <div className="flex justify-end gap-3 pt-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsCreateOpen(false)}
                          className="px-6 py-2"
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          Create Client
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-semibold text-gray-700 dark:text-gray-300 text-left">Client</TableHead>
                    <TableHead className="font-semibold text-gray-700 dark:text-gray-300 text-left">Contact</TableHead>
                    <TableHead className="font-semibold text-gray-700 dark:text-gray-300 text-left">Location</TableHead>
                    <TableHead className="font-semibold text-gray-700 dark:text-gray-300 text-left">Region</TableHead>
                    <TableHead className="font-semibold text-gray-700 dark:text-gray-300 text-left">Supervisor</TableHead>
                    <TableHead className="font-semibold text-gray-700 dark:text-gray-300 text-center">Status</TableHead>
                    <TableHead className="font-semibold text-gray-700 dark:text-gray-300 text-left">Created</TableHead>
                    <TableHead className="font-semibold text-gray-700 dark:text-gray-300 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clients.map((client, index) => (
                    <TableRow key={client.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
                      <TableCell className="py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                            <span className="text-sm font-semibold text-white">
                              {client.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">{client.name}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">{client.contact_person}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <Phone className="h-3 w-3" />
                            {client.phone}
                          </div>
                          {client.rc_number && (
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              RC: {client.rc_number}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <MapPin className="h-3 w-3" />
                            {client.address.split(',')[1]?.trim() || 'Unknown'}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[200px]">
                            {client.address}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="space-y-1">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {regions.find(r => r.id === client.region_id)?.name || 'Unknown'}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {regions.find(r => r.id === client.region_id)?.responsible || 'No Manager'}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="space-y-1">
                          {(() => {
                            const region = regions.find(r => r.id === client.region_id)
                            const supervisor = supervisors.find(s => s.region_id === client.region_id)
                            return (
                              <>
                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                  {supervisor?.name || 'Unassigned'}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                  {supervisor?.email || 'No Email'}
                                </div>
                              </>
                            )
                          })()}
                        </div>
                      </TableCell>
                      <TableCell className="py-4 text-center">
                        <Badge className={client.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'}>
                          {client.status === 'active' ? (
                            <CheckCircle className="h-3 w-3 mr-1" />
                          ) : (
                            <XCircle className="h-3 w-3 mr-1" />
                          )}
                          {client.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {new Date(client.created_at).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell className="text-right py-4">
                        <div className="flex items-center justify-end gap-2">
                          {canEditClient(client) && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(client)}
                              className="hover:bg-blue-50 dark:hover:bg-blue-900/20 border-blue-200 dark:border-blue-800"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          )}
                          {canDeleteClient(client) && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="hover:bg-red-50 dark:hover:bg-red-900/20 border-red-200 dark:border-red-800"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Client</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete {client.name}? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDelete(client.id)}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <ShoppingCart className="mr-2 h-4 w-4" />
                                View Orders
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <DollarSign className="mr-2 h-4 w-4" />
                                View Payments
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

        {/* Edit Client Dialog */}
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="max-w-2xl">
              <DialogHeader>
              <DialogTitle>Edit Client</DialogTitle>
              </DialogHeader>
            <form onSubmit={handleUpdateClient} className="space-y-6 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="edit-name" className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <User className="h-4 w-4 text-blue-600" />
                    Client Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="edit-name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="h-12 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
                    placeholder="Enter client name"
                  />
                </div>

                <div>
                  <Label htmlFor="edit-phone" className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <Phone className="h-4 w-4 text-blue-600" />
                    Phone Number <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="edit-phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="h-12 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
                    placeholder="Enter phone number"
                  />
                </div>

                <div>
                  <Label htmlFor="edit-region" className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-blue-600" />
                    Region <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.region_id}
                    onValueChange={(value) => setFormData({ ...formData, region_id: value })}
                  >
                    <SelectTrigger className="h-12 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                      <SelectValue placeholder="Select region" />
                    </SelectTrigger>
                    <SelectContent>
                      {regions.map((region) => (
                        <SelectItem key={region.id} value={region.id}>
                          {region.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="edit-rc" className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <Building className="h-4 w-4 text-blue-600" />
                    RC Number
                  </Label>
                  <Input
                    id="edit-rc"
                    value={formData.rc_number}
                    onChange={(e) => setFormData({ ...formData, rc_number: e.target.value })}
                    className="h-12 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
                    placeholder="Enter RC number"
                  />
                </div>

                <div>
                  <Label htmlFor="edit-city" className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <Building className="h-4 w-4 text-blue-600" />
                    City
                  </Label>
                  <Input
                    id="edit-city"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="h-12 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
                    placeholder="Enter city"
                  />
                </div>

                <div>
                  <Label htmlFor="edit-contact" className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <UserCheck className="h-4 w-4 text-blue-600" />
                    Contact Person
                  </Label>
                  <Input
                    id="edit-contact"
                    value={formData.contact_person}
                    onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                    className="h-12 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
                    placeholder="Enter contact person"
                  />
                </div>

                <div>
                  <Label htmlFor="edit-status" className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-blue-600" />
                    Status
                  </Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData({ ...formData, status: value as 'active' | 'inactive' })}
                  >
                    <SelectTrigger className="h-12 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="edit-address" className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-blue-600" />
                  Address <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="edit-address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
                  placeholder="Enter full address (street, city, etc.)"
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditOpen(false)}
                  className="px-6 py-2"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Update Client
                </Button>
              </div>
              </form>
            </DialogContent>
          </Dialog>
      </div>
    </div>
  )
}

export default withAuth(ClientsPage)