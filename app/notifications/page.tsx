"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { 
  Bell, 
  Check, 
  CheckCheck, 
  Filter, 
  Search, 
  Trash2, 
  AlertCircle, 
  Info, 
  CheckCircle,
  XCircle,
  Calendar,
  User,
  Package
} from 'lucide-react'
import { useNotifications } from '@/hooks/use-notifications'
import { formatDistanceToNow, format } from 'date-fns'

interface NotificationsPageProps {
  userId: string
  userRole: string
}

export default function NotificationsPage({ userId, userRole }: NotificationsPageProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [filterPriority, setFilterPriority] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  
  const { 
    notifications, 
    unreadCount, 
    isLoading, 
    error, 
    markAsRead, 
    markAllAsRead, 
    refreshNotifications 
  } = useNotifications({ userId, userRole })

  const handleNotificationClick = async (notification: any) => {
    if (!notification.is_read) {
      await markAsRead(notification.id)
    }
  }

  const handleMarkAllAsRead = async () => {
    await markAllAsRead()
  }

  const getNotificationIcon = (type: string, priority: string) => {
    const iconClass = priority === 'urgent' ? 'text-red-500' : 
                     priority === 'high' ? 'text-orange-500' : 
                     priority === 'medium' ? 'text-blue-500' : 'text-gray-500'
    
    switch (type) {
      case 'order':
        return <Package className={`h-5 w-5 ${iconClass}`} />
      case 'alert':
        return <AlertCircle className={`h-5 w-5 ${iconClass}`} />
      case 'meeting':
        return <Calendar className={`h-5 w-5 ${iconClass}`} />
      case 'promotion':
        return <CheckCircle className={`h-5 w-5 ${iconClass}`} />
      default:
        return <Bell className={`h-5 w-5 ${iconClass}`} />
    }
  }

  const getNotificationColor = (priority: string, isRead: boolean) => {
    if (isRead) return 'bg-gray-50'
    
    switch (priority) {
      case 'urgent': return 'bg-red-50 border-l-red-500'
      case 'high': return 'bg-orange-50 border-l-orange-500'
      case 'medium': return 'bg-blue-50 border-l-blue-500'
      default: return 'bg-gray-50 border-l-gray-500'
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return <Badge variant="destructive" className="text-xs">Urgent</Badge>
      case 'high':
        return <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-800">High</Badge>
      case 'medium':
        return <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800">Medium</Badge>
      default:
        return <Badge variant="outline" className="text-xs">Low</Badge>
    }
  }

  // Filter notifications
  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        notification.message.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesType = filterType === 'all' || notification.type === filterType
    const matchesPriority = filterPriority === 'all' || notification.priority === filterPriority
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'read' && notification.is_read) ||
                         (filterStatus === 'unread' && !notification.is_read)
    
    return matchesSearch && matchesType && matchesPriority && matchesStatus
  })

  const unreadNotifications = filteredNotifications.filter(n => !n.is_read)
  const readNotifications = filteredNotifications.filter(n => n.is_read)

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Loading Notifications</h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Fetching your notifications...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <XCircle className="h-12 w-12 text-red-500 mx-auto" />
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Error Loading Notifications</h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">{error}</p>
            <Button onClick={refreshNotifications} className="mt-4">
              Try Again
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Notifications</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Stay updated with your order status and system alerts
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <Badge variant="secondary" className="text-sm">
                {unreadCount} unread
              </Badge>
              
              {unreadCount > 0 && (
                <Button onClick={handleMarkAllAsRead} variant="outline">
                  <CheckCheck className="h-4 w-4 mr-2" />
                  Mark all read
                </Button>
              )}
              
              <Button onClick={refreshNotifications} variant="outline">
                <Bell className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="h-5 w-5 mr-2" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Search</label>
                <div className="relative mt-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search notifications..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Type</label>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="order">Orders</SelectItem>
                    <SelectItem value="alert">Alerts</SelectItem>
                    <SelectItem value="meeting">Meetings</SelectItem>
                    <SelectItem value="promotion">Promotions</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Priority</label>
                <Select value={filterPriority} onValueChange={setFilterPriority}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priorities</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="unread">Unread</SelectItem>
                    <SelectItem value="read">Read</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notifications Tabs */}
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">
              All ({filteredNotifications.length})
            </TabsTrigger>
            <TabsTrigger value="unread">
              Unread ({unreadNotifications.length})
            </TabsTrigger>
            <TabsTrigger value="read">
              Read ({readNotifications.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            <NotificationList 
              notifications={filteredNotifications}
              onNotificationClick={handleNotificationClick}
              getNotificationIcon={getNotificationIcon}
              getNotificationColor={getNotificationColor}
              getPriorityBadge={getPriorityBadge}
            />
          </TabsContent>

          <TabsContent value="unread" className="space-y-4">
            <NotificationList 
              notifications={unreadNotifications}
              onNotificationClick={handleNotificationClick}
              getNotificationIcon={getNotificationIcon}
              getNotificationColor={getNotificationColor}
              getPriorityBadge={getPriorityBadge}
            />
          </TabsContent>

          <TabsContent value="read" className="space-y-4">
            <NotificationList 
              notifications={readNotifications}
              onNotificationClick={handleNotificationClick}
              getNotificationIcon={getNotificationIcon}
              getNotificationColor={getNotificationColor}
              getPriorityBadge={getPriorityBadge}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

interface NotificationListProps {
  notifications: any[]
  onNotificationClick: (notification: any) => void
  getNotificationIcon: (type: string, priority: string) => React.ReactNode
  getNotificationColor: (priority: string, isRead: boolean) => string
  getPriorityBadge: (priority: string) => React.ReactNode
}

function NotificationList({ 
  notifications, 
  onNotificationClick, 
  getNotificationIcon, 
  getNotificationColor, 
  getPriorityBadge 
}: NotificationListProps) {
  if (notifications.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No notifications</h3>
          <p className="text-gray-600 dark:text-gray-400">
            You don't have any notifications matching your current filters.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {notifications.map((notification, index) => (
        <Card 
          key={notification.id}
          className={`cursor-pointer transition-all hover:shadow-md ${getNotificationColor(notification.priority, notification.is_read)}`}
          onClick={() => onNotificationClick(notification)}
        >
          <CardContent className="p-4">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 mt-1">
                {getNotificationIcon(notification.type, notification.priority)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <h3 className={`text-lg font-semibold ${notification.is_read ? 'text-gray-600' : 'text-gray-900'}`}>
                    {notification.title}
                  </h3>
                  
                  <div className="flex items-center space-x-2">
                    {getPriorityBadge(notification.priority)}
                    {!notification.is_read && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full" />
                    )}
                  </div>
                </div>
                
                <p className={`text-gray-700 dark:text-gray-300 mb-3 ${notification.is_read ? 'opacity-70' : ''}`}>
                  {notification.message}
                </p>
                
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center space-x-4">
                    <span className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {format(new Date(notification.created_at), 'MMM dd, yyyy')}
                    </span>
                    <span className="flex items-center">
                      <User className="h-4 w-4 mr-1" />
                      {notification.created_by}
                    </span>
                  </div>
                  
                  <span>
                    {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                  </span>
                </div>
                
                {notification.order_id && (
                  <div className="mt-2 p-2 bg-blue-50 rounded-md">
                    <p className="text-sm text-blue-800">
                      <strong>Order ID:</strong> {notification.order_id}
                      {notification.bl_number && (
                        <span className="ml-4">
                          <strong>BL Number:</strong> {notification.bl_number}
                        </span>
                      )}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}