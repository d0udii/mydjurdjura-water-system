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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Plus, Edit, Trash2, MoreHorizontal, Download, Search, Filter, RefreshCw, Bell, Users, User, MapPin, Calendar, AlertTriangle, MessageSquare, Target, Percent, Send } from "lucide-react"

// Mock auth hook for demo
const useAuth = () => ({
  user: { id: "demo-admin", role: "admin", name: "Admin" }
})

const withAuth = (Component: any) => Component

interface Notification {
  id: string
  title: string
  message: string
  type: "meeting" | "message" | "alert" | "promotion" | "goal"
  priority: "low" | "medium" | "high" | "urgent"
  target_role: "all" | "admin" | "supervisor" | "regional_manager" | "operations"
  target_user_id: string | null
  is_read: boolean
  created_by: string
  created_at: string
  expires_at: string | null
}

function NotificationsPage() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [filterPriority, setFilterPriority] = useState("all")
  const [filterRole, setFilterRole] = useState("all")
  const [formData, setFormData] = useState({
    title: "",
    message: "",
    type: "message" as "meeting" | "message" | "alert" | "promotion" | "goal",
    priority: "medium" as "low" | "medium" | "high" | "urgent",
    target_role: "all" as "all" | "admin" | "supervisor" | "regional_manager" | "operations",
    target_user_id: "",
    expires_at: ""
  })

  // Demo data
  const demoNotifications: Notification[] = [
    {
      id: "NOTIF-001",
      title: "New Promotion Available",
      message: "Summer discount promotion is now active for Biskra region",
      type: "promotion",
      priority: "medium",
      target_role: "all",
      target_user_id: null,
      is_read: false,
      created_by: "USR-001",
      created_at: "2024-01-01T00:00:00Z",
      expires_at: "2024-12-31T23:59:59Z"
    },
    {
      id: "NOTIF-002",
      title: "Team Meeting Scheduled",
      message: "Monthly team meeting scheduled for next Friday at 2 PM",
      type: "meeting",
      priority: "high",
      target_role: "all",
      target_user_id: null,
      is_read: false,
      created_by: "USR-001",
      created_at: "2024-01-01T00:00:00Z",
      expires_at: "2024-12-31T23:59:59Z"
    },
    {
      id: "NOTIF-003",
      title: "System Maintenance Alert",
      message: "System will be under maintenance from 2 AM to 4 AM tomorrow",
      type: "alert",
      priority: "urgent",
      target_role: "all",
      target_user_id: null,
      is_read: false,
      created_by: "USR-001",
      created_at: "2024-01-01T00:00:00Z",
      expires_at: "2024-12-31T23:59:59Z"
    }
  ]

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setNotifications(demoNotifications)
      setLoading(false)
    }, 1000)
  }, [])

  const handleCreateNotification = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title || !formData.message) {
      alert("Please fill all required fields")
      return
    }

    try {
      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          target_user_id: formData.target_user_id || null,
          expires_at: formData.expires_at || null,
          created_by: user.id
        })
      })

      if (response.ok) {
        const data = await response.json()
        setNotifications(prev => [data.notification, ...prev])
        setIsCreateOpen(false)
        resetForm()
        alert(data.message)
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to create notification')
      }
    } catch (error) {
      console.error("Failed to create notification:", error)
      alert('Failed to create notification')
    }
  }

  const resetForm = () => {
    setFormData({
      title: "",
      message: "",
      type: "message",
      priority: "medium",
      target_role: "all",
      target_user_id: "",
      expires_at: ""
    })
  }

  const handleEdit = (notification: Notification) => {
    setSelectedNotification(notification)
    setFormData({
      title: notification.title,
      message: notification.message,
      type: notification.type,
      priority: notification.priority,
      target_role: notification.target_role,
      target_user_id: notification.target_user_id || "",
      expires_at: notification.expires_at || ""
    })
    setIsEditOpen(true)
  }

  const handleDelete = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications?id=${notificationId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setNotifications(prev => prev.filter(notif => notif.id !== notificationId))
        alert("Notification deleted successfully!")
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to delete notification')
      }
    } catch (error) {
      console.error("Failed to delete notification:", error)
      alert('Failed to delete notification')
    }
  }

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: notificationId,
          is_read: true
        })
      })

      if (response.ok) {
        setNotifications(prev => prev.map(notif => 
          notif.id === notificationId ? { ...notif, is_read: true } : notif
        ))
      }
    } catch (error) {
      console.error("Failed to mark notification as read:", error)
    }
  }

  const filteredNotifications = notifications.filter(notif => {
    const matchesSearch = notif.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notif.message.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === "all" || notif.type === filterType
    const matchesPriority = filterPriority === "all" || notif.priority === filterPriority
    const matchesRole = filterRole === "all" || notif.target_role === filterRole
    return matchesSearch && matchesType && matchesPriority && matchesRole
  })

  const canManageNotifications = user?.role === "admin"

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "meeting": return <Calendar className="h-4 w-4" />
      case "message": return <MessageSquare className="h-4 w-4" />
      case "alert": return <AlertTriangle className="h-4 w-4" />
      case "promotion": return <Percent className="h-4 w-4" />
      case "goal": return <Target className="h-4 w-4" />
      default: return <Bell className="h-4 w-4" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      case "high": return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
      case "medium": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      case "low": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="p-4 md:p-6 lg:p-8 space-y-6">
        {/* Enhanced Header */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-lg">
                  <Bell className="h-6 w-6 text-white" />
                </div>
                <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                  Notifications Management
                </h1>
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                Send real-time notifications to users across all roles and departments
              </p>
            </div>
            
            {canManageNotifications && (
              <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogTrigger asChild>
                  <Button 
                    size="lg"
                    className="w-full lg:w-auto bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                    onClick={resetForm}
                  >
                    <Plus className="mr-2 h-5 w-5" />
                    Send Notification
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-bold flex items-center gap-3">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                        <Bell className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      Send New Notification
                    </DialogTitle>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                      Create and send notifications to specific users or all users with different priority levels.
                    </p>
                  </DialogHeader>
                  <form onSubmit={handleCreateNotification} className="space-y-6 pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="title" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Title <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="title"
                          value={formData.title}
                          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                          placeholder="e.g., Team Meeting Scheduled"
                          className="h-12"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="type" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Type <span className="text-red-500">*</span>
                        </Label>
                        <Select
                          value={formData.type}
                          onValueChange={(value: "meeting" | "message" | "alert" | "promotion" | "goal") => setFormData({ ...formData, type: value })}
                        >
                          <SelectTrigger className="h-12">
                            <SelectValue placeholder="Select notification type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="meeting">
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                Meeting
                              </div>
                            </SelectItem>
                            <SelectItem value="message">
                              <div className="flex items-center gap-2">
                                <MessageSquare className="h-4 w-4" />
                                Message
                              </div>
                            </SelectItem>
                            <SelectItem value="alert">
                              <div className="flex items-center gap-2">
                                <AlertTriangle className="h-4 w-4" />
                                Alert
                              </div>
                            </SelectItem>
                            <SelectItem value="promotion">
                              <div className="flex items-center gap-2">
                                <Percent className="h-4 w-4" />
                                Promotion
                              </div>
                            </SelectItem>
                            <SelectItem value="goal">
                              <div className="flex items-center gap-2">
                                <Target className="h-4 w-4" />
                                Goal
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="message" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Message <span className="text-red-500">*</span>
                      </Label>
                      <Textarea
                        id="message"
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        placeholder="Enter your notification message..."
                        className="min-h-[120px]"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="priority" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Priority <span className="text-red-500">*</span>
                        </Label>
                        <Select
                          value={formData.priority}
                          onValueChange={(value: "low" | "medium" | "high" | "urgent") => setFormData({ ...formData, priority: value })}
                        >
                          <SelectTrigger className="h-12">
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low Priority</SelectItem>
                            <SelectItem value="medium">Medium Priority</SelectItem>
                            <SelectItem value="high">High Priority</SelectItem>
                            <SelectItem value="urgent">Urgent</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="target_role" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Target Role <span className="text-red-500">*</span>
                        </Label>
                        <Select
                          value={formData.target_role}
                          onValueChange={(value: "all" | "admin" | "supervisor" | "regional_manager" | "operations") => setFormData({ ...formData, target_role: value })}
                        >
                          <SelectTrigger className="h-12">
                            <SelectValue placeholder="Select target role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">
                              <div className="flex items-center gap-2">
                                <Users className="h-4 w-4" />
                                All Users
                              </div>
                            </SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="supervisor">Supervisor</SelectItem>
                            <SelectItem value="regional_manager">Regional Manager</SelectItem>
                            <SelectItem value="operations">Operations</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="target_user_id" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Target User ID (Optional)
                      </Label>
                      <Input
                        id="target_user_id"
                        value={formData.target_user_id}
                        onChange={(e) => setFormData({ ...formData, target_user_id: e.target.value })}
                        placeholder="Leave empty to send to all users in the role"
                        className="h-12"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Specify a user ID to send to a specific user, or leave empty to send to all users in the selected role.
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="expires_at" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Expiration Date (Optional)
                      </Label>
                      <Input
                        id="expires_at"
                        type="datetime-local"
                        value={formData.expires_at}
                        onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
                        className="h-12"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Set when this notification should expire. Leave empty for no expiration.
                      </p>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsCreateOpen(false)}
                        className="px-6"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        className="px-8 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all duration-200"
                      >
                        <Send className="mr-2 h-4 w-4" />
                        Send Notification
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search notifications..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-12"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="h-12 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="all">All Types</option>
                <option value="meeting">Meeting</option>
                <option value="message">Message</option>
                <option value="alert">Alert</option>
                <option value="promotion">Promotion</option>
                <option value="goal">Goal</option>
              </select>
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="h-12 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="all">All Priorities</option>
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="h-12 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="all">All Roles</option>
                <option value="all">All Users</option>
                <option value="admin">Admin</option>
                <option value="supervisor">Supervisor</option>
                <option value="regional_manager">Regional Manager</option>
                <option value="operations">Operations</option>
              </select>
              <Button variant="outline" size="sm" className="h-12 px-4">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </div>

        {/* Enhanced Notifications Table */}
        <Card className="shadow-lg border-0 bg-white dark:bg-gray-800">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-t-xl">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <Bell className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold">Notifications ({filteredNotifications.length})</CardTitle>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Manage all system notifications</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" className="hover:bg-blue-50 dark:hover:bg-blue-900/20">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 dark:bg-gray-700">
                    <TableHead className="font-semibold text-gray-700 dark:text-gray-300">Notification</TableHead>
                    <TableHead className="font-semibold text-gray-700 dark:text-gray-300">Type</TableHead>
                    <TableHead className="font-semibold text-gray-700 dark:text-gray-300">Priority</TableHead>
                    <TableHead className="font-semibold text-gray-700 dark:text-gray-300">Target</TableHead>
                    <TableHead className="font-semibold text-gray-700 dark:text-gray-300">Status</TableHead>
                    <TableHead className="font-semibold text-gray-700 dark:text-gray-300">Created</TableHead>
                    <TableHead className="font-semibold text-gray-700 dark:text-gray-300">Expires</TableHead>
                    <TableHead className="font-semibold text-gray-700 dark:text-gray-300 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredNotifications.map((notification) => (
                    <TableRow key={notification.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium text-gray-900 dark:text-white">{notification.title}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400 max-w-[300px] truncate">
                            {notification.message}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="secondary"
                          className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                        >
                          <div className="flex items-center gap-1">
                            {getTypeIcon(notification.type)}
                            {notification.type.charAt(0).toUpperCase() + notification.type.slice(1)}
                          </div>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="secondary"
                          className={getPriorityColor(notification.priority)}
                        >
                          {notification.priority.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {notification.target_role === "all" ? (
                              <div className="flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                All Users
                              </div>
                            ) : (
                              notification.target_role.charAt(0).toUpperCase() + notification.target_role.slice(1)
                            )}
                          </div>
                          {notification.target_user_id && (
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              User: {notification.target_user_id}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={notification.is_read ? "secondary" : "default"}
                          className={
                            notification.is_read 
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" 
                              : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                          }
                        >
                          {notification.is_read ? "READ" : "UNREAD"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-500">
                          {new Date(notification.created_at).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-500">
                          {notification.expires_at ? new Date(notification.expires_at).toLocaleDateString() : "Never"}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          {canManageNotifications && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEdit(notification)}
                                className="hover:bg-blue-50 dark:hover:bg-blue-900/20"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="hover:bg-red-50 dark:hover:bg-red-900/20"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Notification</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete this notification? This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDelete(notification.id)}
                                      className="bg-red-600 hover:bg-red-700"
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </>
                          )}
                          {!notification.is_read && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleMarkAsRead(notification.id)}
                              className="hover:bg-green-50 dark:hover:bg-green-900/20"
                            >
                              Mark as Read
                            </Button>
                          )}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Bell className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Download className="mr-2 h-4 w-4" />
                                Export
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
      </div>
    </div>
  )
}

export default withAuth(NotificationsPage)
