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
import { Target, Edit, Trash2, Plus, Search, Filter, TrendingUp, Users, DollarSign } from "lucide-react"

import { showGoalSuccessToast, showGoalErrorToast, showLoadingToast, dismissToast } from "@/lib/toast-notifications"
import { logSupabaseError } from "@/lib/error-handling"

interface Goal {
  id: string
  title: string
  description: string
  target_type: "supervisor" | "client" | "city"
  target_id: string
  metric_type: "orders_count" | "revenue" | "clients_count"
  target_value: number
  current_value: number
  start_date: string
  end_date: string
  status: "active" | "completed" | "cancelled"
  priority: "low" | "medium" | "high"
  created_by: string
  created_at: string
  updated_at: string
  progress_percentage: number
}

function GoalsPage() {
  const { user } = useAuth()
  const [goals, setGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [filterType, setFilterType] = useState("all")
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    target_type: "supervisor" as "supervisor" | "client" | "city",
    target_id: "",
    metric_type: "orders_count" as "orders_count" | "revenue" | "clients_count",
    target_value: "",
    start_date: "",
    end_date: "",
    priority: "medium" as "low" | "medium" | "high"
  })

  useEffect(() => {
    fetchGoals()
  }, [])

  const fetchGoals = async () => {
    const loadingToastId = showLoadingToast('Loading goals...')
    
    try {
      setLoading(true)
      const response = await fetch('/api/goals')
      
      if (response.ok) {
        const data = await response.json()
        setGoals(data.goals || [])
      } else {
        const errorData = await response.json()
        showGoalErrorToast('read', new Error(errorData.error || 'Failed to fetch goals'))
        setGoals([])
      }
    } catch (error) {
      console.error('Error fetching goals:', error)
      logSupabaseError('READ', 'Goals', error)
      showGoalErrorToast('read', error)
      setGoals([])
    } finally {
      setLoading(false)
      dismissToast(loadingToastId)
    }
  }

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      target_type: "supervisor",
      target_id: "",
      metric_type: "orders_count",
      target_value: "",
      start_date: "",
      end_date: "",
      priority: "medium"
    })
  }

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title || !formData.target_value || !formData.start_date || !formData.end_date) {
      alert('Please fill in all required fields')
      return
    }

    try {
      const response = await fetch('/api/goals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          target_value: parseFloat(formData.target_value),
          current_value: 0,
          status: 'active',
          created_by: user?.id || 'unknown'
        }),
      })

      if (response.ok) {
        await fetchGoals() // Refetch to ensure consistency
        setIsCreateOpen(false)
        resetForm()
      } else {
        alert('Failed to create goal')
      }
    } catch (error) {
      console.error('Error creating goal:', error)
      alert('Failed to create goal')
    }
  }

  const handleEditGoal = (goal: Goal) => {
    setSelectedGoal(goal)
    setFormData({
      title: goal.title,
      description: goal.description,
      target_type: goal.target_type,
      target_id: goal.target_id,
      metric_type: goal.metric_type,
      target_value: goal.target_value.toString(),
      start_date: goal.start_date,
      end_date: goal.end_date,
      priority: goal.priority
    })
    setIsEditOpen(true)
  }

  const handleUpdateGoal = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedGoal) return

    try {
      const response = await fetch('/api/goals', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: selectedGoal.id,
          ...formData,
          target_value: parseFloat(formData.target_value)
        }),
      })

      if (response.ok) {
        await fetchGoals() // Refetch to ensure consistency
        setIsEditOpen(false)
        setSelectedGoal(null)
        resetForm()
      } else {
        alert('Failed to update goal')
      }
    } catch (error) {
      console.error('Error updating goal:', error)
      alert('Failed to update goal')
    }
  }

  const handleDeleteGoal = async (goalId: string) => {
    try {
      const response = await fetch('/api/goals', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: goalId }),
      })

      if (response.ok) {
        await fetchGoals() // Refetch to ensure consistency
      } else {
        alert('Failed to delete goal')
      }
    } catch (error) {
      console.error('Error deleting goal:', error)
      alert('Failed to delete goal')
    }
  }

  // Filter goals based on search, status, and type
  const filteredGoals = goals.filter(goal => {
    const matchesSearch = goal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         goal.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === "all" || goal.status === filterStatus
    const matchesType = filterType === "all" || goal.target_type === filterType
    return matchesSearch && matchesStatus && matchesType
  })

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive'
      case 'medium': return 'default'
      case 'low': return 'secondary'
      default: return 'default'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'default'
      case 'completed': return 'secondary'
      case 'cancelled': return 'destructive'
      default: return 'default'
    }
  }

  const getMetricIcon = (metricType: string) => {
    switch (metricType) {
      case 'orders_count': return <Target className="w-4 h-4" />
      case 'revenue': return <DollarSign className="w-4 h-4" />
      case 'clients_count': return <Users className="w-4 h-4" />
      default: return <Target className="w-4 h-4" />
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading Goals...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Goals & Objectives</h1>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Goal
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
                  placeholder="Search goals..."
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
                  <DropdownMenuItem onClick={() => setFilterStatus("completed")}>
                    Completed
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterStatus("cancelled")}>
                    Cancelled
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="w-48">
              <Label htmlFor="type">Type</Label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full justify-between">
                    <Filter className="w-4 h-4 mr-2" />
                    {filterType === "all" ? "All Types" : filterType}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setFilterType("all")}>
                    All Types
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterType("supervisor")}>
                    Supervisor
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterType("client")}>
                    Client
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterType("city")}>
                    City
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Goals Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Goals ({filteredGoals.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Metric</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Deadline</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredGoals.map((goal) => (
                <TableRow key={goal.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{goal.title}</div>
                      <div className="text-sm text-muted-foreground">{goal.description}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{goal.target_type}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getMetricIcon(goal.metric_type)}
                      <span className="text-sm">{goal.metric_type.replace('_', ' ')}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${goal.progress_percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm">{goal.progress_percentage}%</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {goal.current_value} / {goal.target_value}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusColor(goal.status) as any}>
                      {goal.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getPriorityColor(goal.priority) as any}>
                      {goal.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(goal.end_date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditGoal(goal)}
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
                            <AlertDialogTitle>Delete Goal</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{goal.title}"? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteGoal(goal.id)}>
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
          
          {filteredGoals.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No goals found
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Goal Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Goal</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateGoal} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Goal title"
                  required
                />
              </div>
              <div>
                <Label htmlFor="priority">Priority</Label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full justify-between">
                      {formData.priority}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => setFormData({ ...formData, priority: "low" })}>
                      Low
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setFormData({ ...formData, priority: "medium" })}>
                      Medium
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setFormData({ ...formData, priority: "high" })}>
                      High
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Goal description"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="target_type">Target Type</Label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full justify-between">
                      {formData.target_type}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => setFormData({ ...formData, target_type: "supervisor" })}>
                      Supervisor
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setFormData({ ...formData, target_type: "client" })}>
                      Client
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setFormData({ ...formData, target_type: "city" })}>
                      City
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div>
                <Label htmlFor="metric_type">Metric Type</Label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full justify-between">
                      {formData.metric_type.replace('_', ' ')}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => setFormData({ ...formData, metric_type: "orders_count" })}>
                      Orders Count
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setFormData({ ...formData, metric_type: "revenue" })}>
                      Revenue
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setFormData({ ...formData, metric_type: "clients_count" })}>
                      Clients Count
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <div>
              <Label htmlFor="target_value">Target Value *</Label>
              <Input
                id="target_value"
                type="number"
                value={formData.target_value}
                onChange={(e) => setFormData({ ...formData, target_value: e.target.value })}
                placeholder="Target value"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="start_date">Start Date *</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="end_date">End Date *</Label>
                <Input
                  id="end_date"
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Create Goal</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Goal Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Goal</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateGoal} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit_title">Title *</Label>
                <Input
                  id="edit_title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Goal title"
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit_priority">Priority</Label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full justify-between">
                      {formData.priority}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => setFormData({ ...formData, priority: "low" })}>
                      Low
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setFormData({ ...formData, priority: "medium" })}>
                      Medium
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setFormData({ ...formData, priority: "high" })}>
                      High
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            
            <div>
              <Label htmlFor="edit_description">Description</Label>
              <Textarea
                id="edit_description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Goal description"
              />
            </div>

            <div>
              <Label htmlFor="edit_target_value">Target Value *</Label>
              <Input
                id="edit_target_value"
                type="number"
                value={formData.target_value}
                onChange={(e) => setFormData({ ...formData, target_value: e.target.value })}
                placeholder="Target value"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit_start_date">Start Date *</Label>
                <Input
                  id="edit_start_date"
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit_end_date">End Date *</Label>
                <Input
                  id="edit_end_date"
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Update Goal</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default withAuth(GoalsPage)