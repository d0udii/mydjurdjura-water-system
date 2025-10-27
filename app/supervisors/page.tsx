"use client"

import React, { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Search, 
  Filter, 
  Users, 
  MapPin, 
  Mail, 
  Phone, 
  User,
  Building,
  Settings,
  Save,
  X,
  Crown,
  Shield,
  UserPlus,
  CheckCircle,
  XCircle
} from "lucide-react"
import { useAuth } from "@/lib/auth"
import { withAuth } from "@/lib/auth"
import { showEditSuccessToast, showEditErrorToast, showDeleteSuccessToast, showDeleteErrorToast } from "@/lib/toast-notifications"
import { logEditActivity, logDeleteActivity, logCreateActivity } from "@/lib/activity-logging"

interface Supervisor {
  id: string
  name: string
  email: string
  role: 'supervisor' | 'regional_manager'
  assigned_cities: string[]
  region_id: string
  status: 'active' | 'inactive'
  phone?: string
  created_at: string
}

interface RegionalManager {
  id: string
  name: string
  email: string
  role: 'regional_manager'
  region_id: string
  status: 'active' | 'inactive'
  phone?: string
  created_at: string
}

interface Region {
  id: string
  name: string
  description: string
}

function SupervisorsPage() {
  const { user } = useAuth()
  const [supervisors, setSupervisors] = useState<Supervisor[]>([])
  const [regionalManagers, setRegionalManagers] = useState<RegionalManager[]>([])
  const [regions, setRegions] = useState<Region[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [regionFilter, setRegionFilter] = useState("all")
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isAddUserOpen, setIsAddUserOpen] = useState(false)
  const [selectedSupervisor, setSelectedSupervisor] = useState<Supervisor | null>(null)
  const [editingCities, setEditingCities] = useState<string[]>([])
  const [newCity, setNewCity] = useState("")
  
  // Add user form state
  const [newUserForm, setNewUserForm] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'supervisor' as 'supervisor' | 'regional_manager',
    region_id: '',
    assigned_cities: [] as string[]
  })

  // Available cities for assignment
  const availableCities = [
    "Biskra", "Ouled Djellal", "Oued Souf", "El Mghair", "Tebessa", "Khenchela", 
    "Batna", "Oran", "Mostaganem", "Sidi Bel Abbes", "Algiers", "Blida", 
    "Constantine", "Annaba", "Setif", "Djelfa", "Laghouat", "Ouargla"
  ]

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      // Fetch supervisors
      const supervisorsResponse = await fetch('/api/supervisors')
      if (supervisorsResponse.ok) {
        const supervisorsData = await supervisorsResponse.json()
        setSupervisors(supervisorsData.supervisors || [])
      }

      // Demo regions data
      const demoRegions: Region[] = [
        {
          id: "REG-001",
          name: "East",
          description: "Eastern region of Algeria"
        },
        {
          id: "REG-002",
          name: "West",
          description: "Western region of Algeria"
        },
        {
          id: "REG-003",
          name: "Center",
          description: "Central region of Algeria"
        }
      ]
      setRegions(demoRegions)
    } catch (error) {
      console.error("Failed to fetch data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleEditCities = (supervisor: Supervisor) => {
    setSelectedSupervisor(supervisor)
    setEditingCities([...supervisor.assigned_cities])
    setIsEditOpen(true)
  }

  const handleAddCity = () => {
    if (newCity && !editingCities.includes(newCity)) {
      setEditingCities([...editingCities, newCity])
      setNewCity("")
    }
  }

  const handleRemoveCity = (cityToRemove: string) => {
    setEditingCities(editingCities.filter(city => city !== cityToRemove))
  }

  const handleSaveCities = async () => {
    if (!selectedSupervisor) return

    try {
      const response = await fetch('/api/supervisors', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          supervisor_id: selectedSupervisor.id,
          assigned_cities: editingCities
        })
      })

      if (response.ok) {
        // Update local state
        setSupervisors(prev => prev.map(supervisor => 
          supervisor.id === selectedSupervisor.id 
            ? { ...supervisor, assigned_cities: editingCities }
            : supervisor
        ))
        setIsEditOpen(false)
        setSelectedSupervisor(null)
        showEditSuccessToast('Supervisor', 'Cities updated successfully')
        
        // Log activity
        await logEditActivity(
          user?.id || 'unknown',
          user?.name || 'Unknown User',
          'Supervisor Cities',
          selectedSupervisor.id,
          selectedSupervisor.name,
          { oldCities: selectedSupervisor.assigned_cities },
          { newCities: editingCities }
        )
      } else {
        showEditErrorToast('Supervisor', 'Failed to update cities')
      }
    } catch (error) {
      console.error("Failed to update supervisor cities:", error)
      showEditErrorToast('Supervisor', 'Failed to update cities. Please try again.')
    }
  }

  const handleAddUser = async () => {
    // Validation
    if (!newUserForm.name.trim()) {
      showEditErrorToast('User', 'Name is required')
      return
    }
    if (!newUserForm.email.trim()) {
      showEditErrorToast('User', 'Email is required')
      return
    }
    if (!newUserForm.region_id) {
      showEditErrorToast('User', 'Region is required')
      return
    }
    if (newUserForm.role === 'supervisor' && newUserForm.assigned_cities.length === 0) {
      showEditErrorToast('User', 'At least one city must be assigned to supervisors')
      return
    }

    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newUserForm,
          status: 'active'
        })
      })

      if (response.ok) {
        const newUser = await response.json()
        
        if (newUserForm.role === 'supervisor') {
          setSupervisors(prev => [...prev, newUser.user])
        } else {
          setRegionalManagers(prev => [...prev, newUser.user])
        }
        
        showEditSuccessToast('User', `${newUserForm.role === 'supervisor' ? 'Supervisor' : 'Regional Manager'} added successfully`)
        
        // Reset form
        setNewUserForm({
          name: '',
          email: '',
          phone: '',
          role: 'supervisor',
          region_id: '',
          assigned_cities: []
        })
        setIsAddUserOpen(false)
        
        // Log activity
        await logCreateActivity(
          user?.id || 'unknown',
          user?.name || 'Unknown User',
          newUserForm.role === 'supervisor' ? 'Supervisor' : 'Regional Manager',
          newUser.user.id,
          newUserForm.name,
          newUserForm
        )
      } else {
        const errorData = await response.json()
        showEditErrorToast('User', errorData.error || 'Failed to add user')
      }
    } catch (error) {
      console.error("Failed to add user:", error)
      showEditErrorToast('User', 'Failed to add user. Please try again.')
    }
  }

  const handleDeleteUser = async (userId: string, userRole: 'supervisor' | 'regional_manager', userName: string) => {
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        if (userRole === 'supervisor') {
          setSupervisors(prev => prev.filter(s => s.id !== userId))
        } else {
          setRegionalManagers(prev => prev.filter(r => r.id !== userId))
        }
        
        showDeleteSuccessToast(userRole === 'supervisor' ? 'Supervisor' : 'Regional Manager', userName)
        
        // Log activity
        await logDeleteActivity(
          user?.id || 'unknown',
          user?.name || 'Unknown User',
          userRole === 'supervisor' ? 'Supervisor' : 'Regional Manager',
          userId,
          userName,
          { name: userName, role: userRole }
        )
      } else {
        const errorData = await response.json()
        showEditErrorToast('User', errorData.error || 'Failed to delete user')
      }
    } catch (error) {
      console.error("Failed to delete user:", error)
      showEditErrorToast('User', 'Failed to delete user. Please try again.')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "inactive":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
  }

  const filteredSupervisors = supervisors.filter(supervisor => {
    const matchesSearch = supervisor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         supervisor.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || supervisor.status === statusFilter
    const matchesRegion = regionFilter === "all" || supervisor.region_id === regionFilter
    
    return matchesSearch && matchesStatus && matchesRegion
  })

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Supervisor & Regional Manager Management</h1>
          <p className="text-slate-600 dark:text-slate-400">
            Manage supervisors, regional managers, and their assigned regions/cities
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => setIsAddUserOpen(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Add User
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Supervisors</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{supervisors.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Regional Managers</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{regionalManagers.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {supervisors.filter(s => s.status === "active").length + regionalManagers.filter(r => r.status === "active").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Regions</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{regions.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content with Tabs */}
      <Tabs defaultValue="supervisors" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="supervisors">Supervisors</TabsTrigger>
          <TabsTrigger value="regional-managers">Regional Managers</TabsTrigger>
        </TabsList>

        <TabsContent value="supervisors" className="space-y-4">
          {/* Filters and Search */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filters & Search
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search supervisors..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={regionFilter} onValueChange={setRegionFilter}>
                  <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="Filter by region" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Regions</SelectItem>
                    {regions.map((region) => (
                      <SelectItem key={region.id} value={region.id}>
                        {region.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Supervisors Table */}
          <Card>
            <CardHeader>
              <CardTitle>Supervisors & Assigned Cities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Supervisor</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Region</TableHead>
                      <TableHead>Assigned Cities</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSupervisors.map((supervisor) => (
                      <TableRow key={supervisor.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                              <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                              <div className="font-medium">{supervisor.name}</div>
                              <div className="text-sm text-gray-500">ID: {supervisor.id}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-gray-400" />
                            {supervisor.email}
                          </div>
                        </TableCell>
                        <TableCell>
                          {regions.find(r => r.id === supervisor.region_id)?.name || "Unknown"}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {supervisor.assigned_cities.map((city) => (
                              <Badge key={city} variant="secondary" className="text-xs">
                                {city}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(supervisor.status)}>
                            {supervisor.status === 'active' && <CheckCircle className="h-3 w-3 mr-1" />}
                            {supervisor.status === 'inactive' && <XCircle className="h-3 w-3 mr-1" />}
                            {supervisor.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleEditCities(supervisor)}
                            >
                              <Settings className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Supervisor</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete {supervisor.name}? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeleteUser(supervisor.id, 'supervisor', supervisor.name)}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
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
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="regional-managers" className="space-y-4">
          {/* Regional Managers Table */}
          <Card>
            <CardHeader>
              <CardTitle>Regional Managers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Regional Manager</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Region</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {regionalManagers.map((manager) => (
                      <TableRow key={manager.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                              <Shield className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div>
                              <div className="font-medium">{manager.name}</div>
                              <div className="text-sm text-gray-500">ID: {manager.id}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-gray-400" />
                            {manager.email}
                          </div>
                        </TableCell>
                        <TableCell>
                          {regions.find(r => r.id === manager.region_id)?.name || "Unknown"}
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(manager.status)}>
                            {manager.status === 'active' && <CheckCircle className="h-3 w-3 mr-1" />}
                            {manager.status === 'inactive' && <XCircle className="h-3 w-3 mr-1" />}
                            {manager.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Regional Manager</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete {manager.name}? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeleteUser(manager.id, 'regional_manager', manager.name)}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
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
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Cities Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Manage Cities for {selectedSupervisor?.name}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Current Cities */}
            <div>
              <Label className="text-sm font-medium">Currently Assigned Cities</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {editingCities.map((city) => (
                  <Badge key={city} variant="secondary" className="flex items-center gap-1">
                    {city}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-4 w-4 p-0 hover:bg-red-100"
                      onClick={() => handleRemoveCity(city)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            </div>

            {/* Add New City */}
            <div>
              <Label className="text-sm font-medium">Add New City</Label>
              <div className="flex gap-2 mt-2">
                <Select value={newCity} onValueChange={setNewCity}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select a city to add" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableCities
                      .filter(city => !editingCities.includes(city))
                      .map((city) => (
                        <SelectItem key={city} value={city}>
                          {city}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <Button onClick={handleAddCity} disabled={!newCity}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button 
                variant="outline" 
                onClick={() => setIsEditOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSaveCities}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add User Dialog */}
      <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Add New User
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={newUserForm.name}
                  onChange={(e) => setNewUserForm({ ...newUserForm, name: e.target.value })}
                  placeholder="Enter full name"
                />
              </div>
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={newUserForm.email}
                  onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                  placeholder="Enter email address"
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={newUserForm.phone}
                  onChange={(e) => setNewUserForm({ ...newUserForm, phone: e.target.value })}
                  placeholder="+213 XX XXX XXXX"
                />
              </div>
              <div>
                <Label htmlFor="role">Role</Label>
                <Select 
                  value={newUserForm.role} 
                  onValueChange={(value: 'supervisor' | 'regional_manager') => 
                    setNewUserForm({ ...newUserForm, role: value, assigned_cities: [] })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="supervisor">Supervisor</SelectItem>
                    <SelectItem value="regional_manager">Regional Manager</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Region Selection */}
            <div>
              <Label htmlFor="region">Region</Label>
              <Select 
                value={newUserForm.region_id} 
                onValueChange={(value) => setNewUserForm({ ...newUserForm, region_id: value })}
              >
                <SelectTrigger>
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

            {/* City Assignment (only for supervisors) */}
            {newUserForm.role === 'supervisor' && (
              <div>
                <Label className="text-sm font-medium">Assigned Cities</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {newUserForm.assigned_cities.map((city) => (
                    <Badge key={city} variant="secondary" className="flex items-center gap-1">
                      {city}
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-4 w-4 p-0 hover:bg-red-100"
                        onClick={() => setNewUserForm({ 
                          ...newUserForm, 
                          assigned_cities: newUserForm.assigned_cities.filter(c => c !== city) 
                        })}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2 mt-2">
                  <Select 
                    value={newCity} 
                    onValueChange={setNewCity}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Select a city to add" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableCities
                        .filter(city => !newUserForm.assigned_cities.includes(city))
                        .map((city) => (
                          <SelectItem key={city} value={city}>
                            {city}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <Button 
                    onClick={() => {
                      if (newCity && !newUserForm.assigned_cities.includes(newCity)) {
                        setNewUserForm({ 
                          ...newUserForm, 
                          assigned_cities: [...newUserForm.assigned_cities, newCity] 
                        })
                        setNewCity("")
                      }
                    }} 
                    disabled={!newCity}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsAddUserOpen(false)
                  setNewUserForm({
                    name: '',
                    email: '',
                    phone: '',
                    role: 'supervisor',
                    region_id: '',
                    assigned_cities: []
                  })
                }}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleAddUser}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Save className="mr-2 h-4 w-4" />
                Add User
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default withAuth(SupervisorsPage)
