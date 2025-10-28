"use client"

import React, { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { 
  Zap, 
  Clock, 
  Database, 
  Network, 
  Cpu, 
  MemoryStick, 
  RefreshCw, 
  Wifi, 
  WifiOff,
  Activity,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Settings,
  Play,
  Pause,
  Square
} from "lucide-react"
import { 
  usePerformanceMonitor, 
  OptimizedLoader, 
  PerformanceDashboard,
  useOptimizedFetch,
  useDebouncedSearch,
  OptimizedTable
} from "@/hooks/performance"
import { 
  useRealtimeSync, 
  useWebSocket, 
  useOptimisticUpdates, 
  useCache,
  useRealtimeNotifications
} from "@/hooks/realtime"
import { useAuth } from "@/lib/auth"
import { withAuth } from "@/lib/auth"

function PerformancePage() {
  const { user } = useAuth()
  const [isRealtimeEnabled, setIsRealtimeEnabled] = useState(true)
  const [syncInterval, setSyncInterval] = useState(30)
  const [cacheEnabled, setCacheEnabled] = useState(true)
  const [optimisticUpdatesEnabled, setOptimisticUpdatesEnabled] = useState(true)
  
  // Performance monitoring
  const metrics = usePerformanceMonitor()
  
  // Real-time synchronization
  const { 
    data: ordersData, 
    loading: ordersLoading, 
    lastSync, 
    isOnline, 
    manualSync 
  } = useRealtimeSync('/api/orders', syncInterval * 1000, [isRealtimeEnabled])
  
  // WebSocket connection (optional - will gracefully handle connection failures)
  const { isConnected: wsConnected, sendMessage } = useWebSocket('ws://localhost:3001/ws', {
    onMessage: (event) => {
      console.log('WebSocket message:', event.data)
    },
    onOpen: () => console.log('WebSocket connected'),
    onClose: () => console.log('WebSocket disconnected'),
    onError: () => console.log('WebSocket connection failed - this is expected in demo mode'),
    reconnectInterval: 10000, // 10 seconds
    maxReconnectAttempts: 3 // Limit reconnection attempts
  })
  
  // Optimistic updates
  const { 
    data: optimisticData, 
    pendingUpdates, 
    optimisticUpdate, 
    confirmUpdate, 
    revertUpdate 
  } = useOptimisticUpdates(
    { count: 0, status: 'idle' },
    (data, updates) => ({ ...data, ...updates })
  )
  
  // Cache management
  const { 
    data: cachedData, 
    loading: cacheLoading, 
    fetchData: fetchCachedData,
    invalidateCache 
  } = useCache(
    'performance-data',
    async () => {
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
      return { timestamp: Date.now(), data: 'Cached data' }
    },
    60000 // 1 minute TTL
  )
  
  // Real-time notifications
  const { 
    notifications, 
    unreadCount, 
    addNotification, 
    markAsRead, 
    markAllAsRead 
  } = useRealtimeNotifications()
  
  // Mock data for demonstration
  const mockOrders = [
    { id: 'ORD-001', client: 'Biskra Water', status: 'pending', amount: 125000 },
    { id: 'ORD-002', client: 'Ouled Djellal Store', status: 'completed', amount: 89000 },
    { id: 'ORD-003', client: 'Oued Souf Market', status: 'in_progress', amount: 156000 }
  ]
  
  const [searchTerm, setSearchTerm] = useState('')
  const filteredOrders = useDebouncedSearch(
    mockOrders,
    searchTerm,
    ['client', 'status'],
    300
  )

  // Simulate performance metrics
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate changing metrics
      const newMetrics = {
        ...metrics,
        apiCalls: Math.floor(Math.random() * 100),
        cacheHits: Math.floor(Math.random() * 50),
        cacheMisses: Math.floor(Math.random() * 20),
        memoryUsage: Math.floor(Math.random() * 1000) + 100
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [metrics])

  const handleOptimisticUpdate = () => {
    const updateId = Date.now().toString()
    optimisticUpdate(updateId, { count: optimisticData.count + 1, status: 'updating' })
    
    // Simulate API call
    setTimeout(() => {
      confirmUpdate(updateId)
    }, 2000)
  }

  const handleAddNotification = () => {
    addNotification({
      id: Date.now().toString(),
      title: 'Performance Alert',
      message: 'System performance is optimal',
      type: 'info',
      timestamp: new Date()
    })
  }

  const performanceScore = Math.max(0, 100 - (metrics.loadTime / 10) - (metrics.memoryUsage / 10))

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="p-4 md:p-6 lg:p-8 space-y-6">
        {/* Enhanced Header */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg shadow-lg">
                  <Zap className="h-6 w-6 text-white" />
                </div>
                <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                  Performance & Real-time Sync
                </h1>
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                Monitor system performance and manage real-time synchronization
              </p>
            </div>
            
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={manualSync}
                disabled={!isOnline}
                className="hover:bg-blue-50 dark:hover:bg-blue-900/20"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Manual Sync
              </Button>
              <Button
                variant="outline"
                onClick={handleAddNotification}
                className="hover:bg-green-50 dark:hover:bg-green-900/20"
              >
                <Activity className="h-4 w-4 mr-2" />
                Test Notification
              </Button>
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-500" />
                Load Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{metrics.loadTime}ms</div>
              <div className="flex items-center gap-2 mt-2">
                <Progress value={Math.min(100, (metrics.loadTime / 2000) * 100)} className="flex-1" />
                <Badge variant={metrics.loadTime < 1000 ? "default" : "destructive"}>
                  {metrics.loadTime < 1000 ? "Fast" : "Slow"}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Database className="h-5 w-5 text-green-500" />
                API Calls
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{metrics.apiCalls}</div>
              <div className="text-sm text-gray-500 mt-2">
                Last sync: {lastSync ? lastSync.toLocaleTimeString() : 'Never'}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Network className="h-5 w-5 text-purple-500" />
                Cache Hit Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">
                {Math.round((metrics.cacheHits / (metrics.cacheHits + metrics.cacheMisses)) * 100)}%
              </div>
              <div className="text-sm text-gray-500 mt-2">
                {metrics.cacheHits} hits / {metrics.cacheMisses} misses
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Cpu className="h-5 w-5 text-orange-500" />
                Performance Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600">{Math.round(performanceScore)}</div>
              <div className="flex items-center gap-2 mt-2">
                <Progress value={performanceScore} className="flex-1" />
                <Badge variant={performanceScore > 80 ? "default" : performanceScore > 60 ? "secondary" : "destructive"}>
                  {performanceScore > 80 ? "Excellent" : performanceScore > 60 ? "Good" : "Poor"}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Connection Status */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <Activity className="h-6 w-6" />
              Connection Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  {isOnline ? (
                    <Wifi className="h-6 w-6 text-green-500" />
                  ) : (
                    <WifiOff className="h-6 w-6 text-red-500" />
                  )}
                  <div>
                    <div className="font-medium">Internet Connection</div>
                    <div className="text-sm text-gray-500">
                      {isOnline ? 'Connected' : 'Disconnected'}
                    </div>
                  </div>
                </div>
                <Badge variant={isOnline ? "default" : "destructive"}>
                  {isOnline ? "Online" : "Offline"}
                </Badge>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  {wsConnected ? (
                    <CheckCircle className="h-6 w-6 text-green-500" />
                  ) : (
                    <AlertCircle className="h-6 w-6 text-red-500" />
                  )}
                  <div>
                    <div className="font-medium">WebSocket</div>
                    <div className="text-sm text-gray-500">
                      {wsConnected ? 'Connected' : 'Disconnected'}
                    </div>
                  </div>
                </div>
                <Badge variant={wsConnected ? "default" : "destructive"}>
                  {wsConnected ? "Active" : "Inactive"}
                </Badge>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <RefreshCw className="h-6 w-6 text-blue-500" />
                  <div>
                    <div className="font-medium">Real-time Sync</div>
                    <div className="text-sm text-gray-500">
                      {isRealtimeEnabled ? 'Enabled' : 'Disabled'}
                    </div>
                  </div>
                </div>
                <Badge variant={isRealtimeEnabled ? "default" : "secondary"}>
                  {isRealtimeEnabled ? "Active" : "Paused"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Settings */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <Settings className="h-6 w-6" />
              Performance Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="realtime" className="text-sm font-medium">
                    Real-time Synchronization
                  </Label>
                  <Switch
                    id="realtime"
                    checked={isRealtimeEnabled}
                    onCheckedChange={setIsRealtimeEnabled}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="cache" className="text-sm font-medium">
                    Cache Management
                  </Label>
                  <Switch
                    id="cache"
                    checked={cacheEnabled}
                    onCheckedChange={setCacheEnabled}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="optimistic" className="text-sm font-medium">
                    Optimistic Updates
                  </Label>
                  <Switch
                    id="optimistic"
                    checked={optimisticUpdatesEnabled}
                    onCheckedChange={setOptimisticUpdatesEnabled}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="interval" className="text-sm font-medium">
                    Sync Interval: {syncInterval}s
                  </Label>
                  <input
                    id="interval"
                    type="range"
                    min="5"
                    max="300"
                    value={syncInterval}
                    onChange={(e) => setSyncInterval(Number(e.target.value))}
                    className="w-full mt-2"
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fetchCachedData(true)}
                    disabled={cacheLoading}
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${cacheLoading ? 'animate-spin' : ''}`} />
                    Refresh Cache
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={invalidateCache}
                  >
                    Clear Cache
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Optimistic Updates Demo */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <TrendingUp className="h-6 w-6" />
              Optimistic Updates Demo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <div className="font-medium">Counter: {optimisticData.count}</div>
                  <div className="text-sm text-gray-500">Status: {optimisticData.status}</div>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleOptimisticUpdate}
                    disabled={optimisticData.status === 'updating'}
                  >
                    {optimisticData.status === 'updating' ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      'Increment'
                    )}
                  </Button>
                </div>
              </div>
              
              {pendingUpdates.size > 0 && (
                <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                      {pendingUpdates.size} pending update(s)
                    </span>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Real-time Data Table */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <Database className="h-6 w-6" />
              Real-time Orders Data
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <input
                  type="text"
                  placeholder="Search orders..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
                <Badge variant="outline">
                  {filteredOrders.length} orders
                </Badge>
              </div>
              
              <OptimizedTable
                data={filteredOrders}
                columns={[
                  { key: 'id', label: 'Order ID' },
                  { key: 'client', label: 'Client' },
                  { key: 'status', label: 'Status' },
                  { key: 'amount', label: 'Amount' }
                ]}
                loading={ordersLoading}
                onRowClick={(row) => console.log('Row clicked:', row)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        {notifications.length > 0 && (
          <Card className="shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl flex items-center gap-2">
                  <Activity className="h-6 w-6" />
                  Real-time Notifications
                </CardTitle>
                <div className="flex gap-2">
                  <Badge variant="outline">
                    {unreadCount} unread
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={markAllAsRead}
                  >
                    Mark All Read
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {notifications.slice(0, 5).map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-3 border rounded-lg ${
                      notification.is_read 
                        ? 'bg-gray-50 dark:bg-gray-800' 
                        : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{notification.title}</div>
                        <div className="text-sm text-gray-500">{notification.message}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400">
                          {notification.timestamp.toLocaleTimeString()}
                        </span>
                        {!notification.is_read && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => markAsRead(notification.id)}
                          >
                            Mark Read
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Performance Dashboard */}
      <PerformanceDashboard />
    </div>
  )
}

export default withAuth(PerformancePage)
