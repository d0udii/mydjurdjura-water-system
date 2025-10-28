"use client"

import React, { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  Users, 
  Eye, 
  Edit, 
  MessageCircle, 
  Bell, 
  Zap,
  Globe,
  Lock,
  UserPlus,
  UserMinus,
  Activity,
  Clock,
  MapPin,
  Package,
  ShoppingCart
} from "lucide-react"
import { useAuth } from "@/lib/auth"
import { withAuth } from "@/lib/auth"

interface UserPresence {
  id: string
  name: string
  email: string
  role: string
  avatar?: string
  status: 'online' | 'away' | 'busy' | 'offline'
  current_page: string
  current_action?: string
  last_seen: string
  location?: string
}

interface CollaborationSession {
  id: string
  type: 'order_edit' | 'client_edit' | 'inventory_update' | 'workflow_execution'
  entity_id: string
  entity_name: string
  participants: string[]
  started_at: string
  last_activity: string
  is_active: boolean
}

interface RealTimeCollaborationProps {
  className?: string
}

export const RealTimeCollaboration: React.FC<RealTimeCollaborationProps> = ({ className }) => {
  const { user } = useAuth()
  const [onlineUsers, setOnlineUsers] = useState<UserPresence[]>([])
  const [activeSessions, setActiveSessions] = useState<CollaborationSession[]>([])
  const [notifications, setNotifications] = useState<any[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const wsRef = useRef<WebSocket | null>(null)

  const connectWebSocket = () => {
    try {
      // Mock WebSocket connection (in production, this would be a real WebSocket)
      setIsConnected(true)
      
      // Simulate receiving user presence updates
      const mockUsers: UserPresence[] = [
        {
          id: 'USR-001',
          name: 'Admin User',
          email: 'admin@djurdjura.dz',
          role: 'admin',
          status: 'online',
          current_page: '/dashboard',
          current_action: 'Viewing analytics',
          last_seen: new Date().toISOString(),
          location: 'Algiers, Algeria'
        },
        {
          id: 'USR-002',
          name: 'Mahmoud Supervisor',
          email: 'mahmoud@djurdjura.dz',
          role: 'supervisor',
          status: 'online',
          current_page: '/orders',
          current_action: 'Creating new order',
          last_seen: new Date().toISOString(),
          location: 'Biskra, Algeria'
        },
        {
          id: 'USR-003',
          name: 'Sara Regional Manager',
          email: 'sara@djurdjura.dz',
          role: 'regional_manager',
          status: 'away',
          current_page: '/reports',
          current_action: 'Generating reports',
          last_seen: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
          location: 'Oran, Algeria'
        },
        {
          id: 'USR-004',
          name: 'Operations Team',
          email: 'ops@djurdjura.dz',
          role: 'operations',
          status: 'busy',
          current_page: '/order-tracking',
          current_action: 'Processing deliveries',
          last_seen: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
          location: 'Warehouse A'
        }
      ]

      setOnlineUsers(mockUsers)

      // Simulate active collaboration sessions
      const mockSessions: CollaborationSession[] = [
        {
          id: 'SESSION-001',
          type: 'order_edit',
          entity_id: 'ORD-001',
          entity_name: 'Order ORD-001',
          participants: ['USR-001', 'USR-002'],
          started_at: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
          last_activity: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
          is_active: true
        },
        {
          id: 'SESSION-002',
          type: 'inventory_update',
          entity_id: 'INV-001',
          entity_name: '5.5L Water Bottles',
          participants: ['USR-001', 'USR-004'],
          started_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
          last_activity: new Date(Date.now() - 1 * 60 * 1000).toISOString(),
          is_active: true
        }
      ]

      setActiveSessions(mockSessions)

      // Simulate notifications
      const mockNotifications = [
        {
          id: 'NOTIF-001',
          type: 'collaboration',
          title: 'User joined session',
          message: 'Mahmoud Supervisor joined Order ORD-001 editing session',
          timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
          is_read: false
        },
        {
          id: 'NOTIF-002',
          type: 'presence',
          title: 'User went offline',
          message: 'Sara Regional Manager went offline',
          timestamp: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
          is_read: false
        }
      ]

      setNotifications(mockNotifications)

    } catch (error) {
      console.error('WebSocket connection failed:', error)
      setIsConnected(false)
    }
  }

  const disconnectWebSocket = () => {
    if (wsRef.current) {
      wsRef.current.close()
    }
    setIsConnected(false)
  }

  const joinCollaborationSession = (sessionId: string) => {
    // Simulate joining a collaboration session
    console.log(`Joining session ${sessionId}`)
    
    // Update the session to include current user
    setActiveSessions(prev => 
      prev.map(session => 
        session.id === sessionId 
          ? { 
              ...session, 
              participants: [...session.participants, user?.id || 'current-user'],
              last_activity: new Date().toISOString()
            }
          : session
      )
    )
    
    // Add notification
    const newNotification = {
      id: `notif-${Date.now()}`,
      title: 'Session Joined',
      message: `You joined the collaboration session for ${activeSessions.find(s => s.id === sessionId)?.entity_name}`,
      timestamp: new Date().toISOString(),
      is_read: false
    }
    setNotifications(prev => [newNotification, ...prev])
    
    // In a real implementation, this would send a WebSocket message
  }

  const leaveCollaborationSession = (sessionId: string) => {
    // Simulate leaving a collaboration session
    console.log(`Leaving session ${sessionId}`)
    
    // Update the session to remove current user
    setActiveSessions(prev => 
      prev.map(session => 
        session.id === sessionId 
          ? { 
              ...session, 
              participants: session.participants.filter(p => p !== (user?.id || 'current-user')),
              last_activity: new Date().toISOString()
            }
          : session
      )
    )
    
    // Add notification
    const newNotification = {
      id: `notif-${Date.now()}`,
      title: 'Session Left',
      message: `You left the collaboration session for ${activeSessions.find(s => s.id === sessionId)?.entity_name}`,
      timestamp: new Date().toISOString(),
      is_read: false
    }
    setNotifications(prev => [newNotification, ...prev])
    
    // In a real implementation, this would send a WebSocket message
  }

  const sendNotification = (userId: string, message: string) => {
    // Simulate sending a notification
    console.log(`Sending notification to ${userId}: ${message}`)
    
    // Add notification to the list
    const newNotification = {
      id: `notif-${Date.now()}`,
      title: 'Message Sent',
      message: `Notification sent to ${onlineUsers.find(u => u.id === userId)?.name || 'User'}`,
      timestamp: new Date().toISOString(),
      is_read: false
    }
    setNotifications(prev => [newNotification, ...prev])
    
    // In a real implementation, this would send a WebSocket message
  }

  const startLiveChat = () => {
    console.log('Starting live chat')
    const newNotification = {
      id: `notif-${Date.now()}`,
      title: 'Live Chat Started',
      message: 'Live chat session has been initiated',
      timestamp: new Date().toISOString(),
      is_read: false
    }
    setNotifications(prev => [newNotification, ...prev])
  }

  const startSharedEditing = () => {
    console.log('Starting shared editing')
    const newNotification = {
      id: `notif-${Date.now()}`,
      title: 'Shared Editing Started',
      message: 'Shared editing session has been initiated',
      timestamp: new Date().toISOString(),
      is_read: false
    }
    setNotifications(prev => [newNotification, ...prev])
  }

  const startScreenShare = () => {
    console.log('Starting screen share')
    const newNotification = {
      id: `notif-${Date.now()}`,
      title: 'Screen Share Started',
      message: 'Screen sharing session has been initiated',
      timestamp: new Date().toISOString(),
      is_read: false
    }
    setNotifications(prev => [newNotification, ...prev])
  }

  const startVideoCall = () => {
    console.log('Starting video call')
    const newNotification = {
      id: `notif-${Date.now()}`,
      title: 'Video Call Started',
      message: 'Video call session has been initiated',
      timestamp: new Date().toISOString(),
      is_read: false
    }
    setNotifications(prev => [newNotification, ...prev])
  }

  const manageNotifications = () => {
    console.log('Managing notifications')
    // Mark all notifications as read
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, is_read: true }))
    )
  }

  const viewActivityFeed = () => {
    console.log('Viewing activity feed')
    const newNotification = {
      id: `notif-${Date.now()}`,
      title: 'Activity Feed Opened',
      message: 'Activity feed is now being displayed',
      timestamp: new Date().toISOString(),
      is_read: false
    }
    setNotifications(prev => [newNotification, ...prev])
  }

  const managePermissions = () => {
    console.log('Managing permissions')
    const newNotification = {
      id: `notif-${Date.now()}`,
      title: 'Permissions Opened',
      message: 'Permission management panel is now open',
      timestamp: new Date().toISOString(),
      is_read: false
    }
    setNotifications(prev => [newNotification, ...prev])
  }

  const viewSessionDetails = (sessionId: string) => {
    console.log(`Viewing details for session ${sessionId}`)
    const session = activeSessions.find(s => s.id === sessionId)
    const newNotification = {
      id: `notif-${Date.now()}`,
      title: 'Session Details Opened',
      message: `Details for ${session?.entity_name} session are now displayed`,
      timestamp: new Date().toISOString(),
      is_read: false
    }
    setNotifications(prev => [newNotification, ...prev])
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'away':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'busy':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      case 'offline':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online':
        return <div className="w-2 h-2 bg-green-500 rounded-full" />
      case 'away':
        return <div className="w-2 h-2 bg-yellow-500 rounded-full" />
      case 'busy':
        return <div className="w-2 h-2 bg-red-500 rounded-full" />
      case 'offline':
        return <div className="w-2 h-2 bg-gray-400 rounded-full" />
      default:
        return <div className="w-2 h-2 bg-gray-400 rounded-full" />
    }
  }

  const getSessionTypeIcon = (type: string) => {
    switch (type) {
      case 'order_edit':
        return <ShoppingCart className="h-4 w-4 text-blue-500" />
      case 'client_edit':
        return <Users className="h-4 w-4 text-green-500" />
      case 'inventory_update':
        return <Package className="h-4 w-4 text-purple-500" />
      case 'workflow_execution':
        return <Zap className="h-4 w-4 text-orange-500" />
      default:
        return <Activity className="h-4 w-4 text-gray-500" />
    }
  }

  const getSessionTypeColor = (type: string) => {
    switch (type) {
      case 'order_edit':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'client_edit':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'inventory_update':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
      case 'workflow_execution':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date()
    const time = new Date(timestamp)
    const diff = now.getTime() - time.getTime()
    
    if (diff < 60000) return 'Just now'
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
    return `${Math.floor(diff / 86400000)}d ago`
  }

  useEffect(() => {
    connectWebSocket()
    
    // Simulate periodic updates
    const interval = setInterval(() => {
      // Update last seen times
      setOnlineUsers(prev => 
        prev.map(user => ({
          ...user,
          last_seen: new Date().toISOString()
        }))
      )
    }, 30000) // Update every 30 seconds

    return () => {
      clearInterval(interval)
      disconnectWebSocket()
    }
  }, [])

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Connection Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-blue-600" />
            Real-time Collaboration
            <Badge className={isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
              {isConnected ? 'Connected' : 'Disconnected'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Button 
              onClick={isConnected ? disconnectWebSocket : connectWebSocket}
              variant={isConnected ? "destructive" : "default"}
            >
              {isConnected ? 'Disconnect' : 'Connect'}
            </Button>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {isConnected ? 'Real-time updates active' : 'Connection lost - attempting to reconnect...'}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Online Users */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-green-600" />
            Online Users ({onlineUsers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {onlineUsers.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatar} />
                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {user.name}
                      </span>
                      {getStatusIcon(user.status)}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {user.current_action} • {user.location}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getStatusColor(user.status)}>
                    {user.status}
                  </Badge>
                  <Badge variant="secondary">
                    {user.role}
                  </Badge>
                  <Button size="sm" variant="outline" onClick={() => sendNotification(user.id, `Hello ${user.name}!`)}>
                    <MessageCircle className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Active Collaboration Sessions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-purple-600" />
            Active Sessions ({activeSessions.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activeSessions.map((session) => (
              <div key={session.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {getSessionTypeIcon(session.type)}
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {session.entity_name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {session.participants.length} participants • Started {formatTimeAgo(session.started_at)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getSessionTypeColor(session.type)}>
                      {session.type.replace('_', ' ')}
                    </Badge>
                    <Badge className={session.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                      {session.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Participants:</span>
                  <div className="flex -space-x-2">
                    {session.participants.map((participantId, index) => {
                      const participant = onlineUsers.find(u => u.id === participantId)
                      return (
                        <Avatar key={participantId} className="h-6 w-6 border-2 border-white dark:border-gray-800">
                          <AvatarImage src={participant?.avatar} />
                          <AvatarFallback className="text-xs">
                            {participant?.name.charAt(0) || '?'}
                          </AvatarFallback>
                        </Avatar>
                      )
                    })}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    onClick={() => joinCollaborationSession(session.id)}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Join Session
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => leaveCollaborationSession(session.id)}
                  >
                    <UserMinus className="h-4 w-4 mr-2" />
                    Leave
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => viewSessionDetails(session.id)}>
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Real-time Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-orange-600" />
            Live Notifications ({notifications.filter(n => !n.is_read).length} unread)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div key={notification.id} className={`p-3 rounded-lg border ${
                notification.is_read 
                  ? 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700' 
                  : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
              }`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 dark:text-white text-sm">
                      {notification.title}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {notification.message}
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                    {formatTimeAgo(notification.timestamp)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Collaboration Tools */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-600" />
            Collaboration Tools
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Button variant="outline" className="h-20 flex flex-col gap-2" onClick={startLiveChat}>
              <MessageCircle className="h-6 w-6" />
              <span className="text-sm">Live Chat</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2" onClick={startSharedEditing}>
              <Edit className="h-6 w-6" />
              <span className="text-sm">Shared Editing</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2" onClick={startScreenShare}>
              <Eye className="h-6 w-6" />
              <span className="text-sm">Screen Share</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2" onClick={manageNotifications}>
              <Bell className="h-6 w-6" />
              <span className="text-sm">Notifications</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2" onClick={viewActivityFeed}>
              <Activity className="h-6 w-6" />
              <span className="text-sm">Activity Feed</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2" onClick={managePermissions}>
              <Lock className="h-6 w-6" />
              <span className="text-sm">Permissions</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default withAuth(RealTimeCollaboration)
