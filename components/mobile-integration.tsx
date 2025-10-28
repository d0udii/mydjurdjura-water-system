"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Smartphone, 
  Download, 
  QrCode, 
  Link, 
  Share, 
  Bell, 
  MapPin, 
  Camera, 
  Mic, 
  Wifi, 
  WifiOff,
  Battery,
  Signal,
  Clock,
  CheckCircle,
  AlertTriangle,
  Settings,
  User,
  Users,
  Package,
  ShoppingCart,
  BarChart3,
  MessageSquare,
  Phone,
  Mail,
  Globe,
  Code,
  Database,
  Cloud,
  Shield,
  Zap,
  Activity
} from "lucide-react"
import { useDataStore } from "@/lib/shared-data-store"
import { useAuth } from "@/lib/auth"
import { withAuth } from "@/lib/auth"

interface MobileApp {
  id: string
  name: string
  version: string
  platform: 'ios' | 'android' | 'web'
  status: 'active' | 'maintenance' | 'deprecated'
  features: string[]
  download_url: string
  qr_code: string
  last_updated: string
  user_count: number
  rating: number
}

interface MobileIntegrationData {
  id: string
  type: 'push_notification' | 'location_tracking' | 'offline_sync' | 'camera_integration' | 'voice_command'
  name: string
  description: string
  status: 'enabled' | 'disabled' | 'beta'
  configuration: any
  last_sync: string
}

interface MobileAnalytics {
  total_users: number
  active_users: number
  app_downloads: number
  session_duration: number
  crash_rate: number
  feature_usage: Array<{ feature: string; usage: number }>
  platform_distribution: Array<{ platform: string; users: number }>
}

interface MobileIntegrationProps {
  className?: string
}

export const MobileIntegration: React.FC<MobileIntegrationProps> = ({ className }) => {
  const { user } = useAuth()
  const [mobileApps, setMobileApps] = useState<MobileApp[]>([])
  const [integrations, setIntegrations] = useState<MobileIntegrationData[]>([])
  const [analytics, setAnalytics] = useState<MobileAnalytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedApp, setSelectedApp] = useState<string>('')

  const fetchMobileData = async () => {
    try {
      setLoading(true)
      
      // Mock mobile apps
      const mockApps: MobileApp[] = [
        {
          id: 'APP-001',
          name: 'Djurdjura Water Manager',
          version: '2.1.4',
          platform: 'android',
          status: 'active',
          features: [
            'Order Management',
            'Client Tracking',
            'Delivery Navigation',
            'Offline Mode',
            'Push Notifications',
            'Camera Integration',
            'Voice Commands'
          ],
          download_url: 'https://play.google.com/store/apps/details?id=com.djurdjura.water',
          qr_code: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzAwMCIvPjxyZWN0IHg9IjEwIiB5PSIxMCIgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiBmaWxsPSIjZmZmIi8+PC9zdmc+',
          last_updated: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          user_count: 1250,
          rating: 4.6
        },
        {
          id: 'APP-002',
          name: 'Djurdjura Water iOS',
          version: '2.1.3',
          platform: 'ios',
          status: 'active',
          features: [
            'Order Management',
            'Client Tracking',
            'Delivery Navigation',
            'Offline Mode',
            'Push Notifications',
            'Camera Integration'
          ],
          download_url: 'https://apps.apple.com/app/djurdjura-water/id123456789',
          qr_code: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzAwMCIvPjxyZWN0IHg9IjEwIiB5PSIxMCIgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiBmaWxsPSIjZmZmIi8+PC9zdmc+',
          last_updated: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          user_count: 890,
          rating: 4.7
        },
        {
          id: 'APP-003',
          name: 'Djurdjura PWA',
          version: '1.8.2',
          platform: 'web',
          status: 'active',
          features: [
            'Order Management',
            'Client Tracking',
            'Offline Mode',
            'Push Notifications'
          ],
          download_url: 'https://app.djurdjura.dz',
          qr_code: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzAwMCIvPjxyZWN0IHg9IjEwIiB5PSIxMCIgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiBmaWxsPSIjZmZmIi8+PC9zdmc+',
          last_updated: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          user_count: 2100,
          rating: 4.5
        }
      ]

      setMobileApps(mockApps)

      // Mock integrations
      const mockIntegrations: MobileIntegrationData[] = [
        {
          id: 'INT-001',
          type: 'push_notification',
          name: 'Push Notifications',
          description: 'Real-time notifications for orders, deliveries, and system updates',
          status: 'enabled',
          configuration: {
            channels: ['orders', 'deliveries', 'system'],
            frequency: 'immediate',
            sound_enabled: true
          },
          last_sync: new Date(Date.now() - 5 * 60 * 1000).toISOString()
        },
        {
          id: 'INT-002',
          type: 'location_tracking',
          name: 'GPS Tracking',
          description: 'Track delivery vehicles and optimize routes in real-time',
          status: 'enabled',
          configuration: {
            accuracy: 'high',
            update_interval: 30,
            battery_optimization: true
          },
          last_sync: new Date(Date.now() - 2 * 60 * 1000).toISOString()
        },
        {
          id: 'INT-003',
          type: 'offline_sync',
          name: 'Offline Synchronization',
          description: 'Sync data when connection is restored after offline work',
          status: 'enabled',
          configuration: {
            sync_interval: 300,
            conflict_resolution: 'server_wins',
            max_offline_time: 24
          },
          last_sync: new Date(Date.now() - 10 * 60 * 1000).toISOString()
        },
        {
          id: 'INT-004',
          type: 'camera_integration',
          name: 'Camera Integration',
          description: 'Capture photos for delivery confirmation and inventory',
          status: 'enabled',
          configuration: {
            quality: 'high',
            compression: true,
            auto_upload: true
          },
          last_sync: new Date(Date.now() - 15 * 60 * 1000).toISOString()
        },
        {
          id: 'INT-005',
          type: 'voice_command',
          name: 'Voice Commands',
          description: 'Voice-activated order updates and status changes',
          status: 'beta',
          configuration: {
            language: 'ar',
            commands: ['update_status', 'add_note', 'mark_delivered'],
            accuracy_threshold: 0.8
          },
          last_sync: new Date(Date.now() - 30 * 60 * 1000).toISOString()
        }
      ]

      setIntegrations(mockIntegrations)

      // Mock analytics
      const mockAnalytics: MobileAnalytics = {
        total_users: 4240,
        active_users: 2890,
        app_downloads: 15600,
        session_duration: 18.5,
        crash_rate: 0.2,
        feature_usage: [
          { feature: 'Order Management', usage: 95 },
          { feature: 'Client Tracking', usage: 87 },
          { feature: 'Delivery Navigation', usage: 78 },
          { feature: 'Push Notifications', usage: 92 },
          { feature: 'Camera Integration', usage: 65 },
          { feature: 'Offline Mode', usage: 45 },
          { feature: 'Voice Commands', usage: 23 }
        ],
        platform_distribution: [
          { platform: 'Android', users: 1250 },
          { platform: 'iOS', users: 890 },
          { platform: 'Web PWA', users: 2100 }
        ]
      }

      setAnalytics(mockAnalytics)
    } catch (error) {
      console.error('Error fetching mobile data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'android':
        return <Smartphone className="h-5 w-5 text-green-500" />
      case 'ios':
        return <Smartphone className="h-5 w-5 text-blue-500" />
      case 'web':
        return <Globe className="h-5 w-5 text-purple-500" />
      default:
        return <Smartphone className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'deprecated':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      case 'enabled':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'disabled':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      case 'beta':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const getIntegrationIcon = (type: string) => {
    switch (type) {
      case 'push_notification':
        return <Bell className="h-5 w-5 text-blue-500" />
      case 'location_tracking':
        return <MapPin className="h-5 w-5 text-green-500" />
      case 'offline_sync':
        return <WifiOff className="h-5 w-5 text-orange-500" />
      case 'camera_integration':
        return <Camera className="h-5 w-5 text-purple-500" />
      case 'voice_command':
        return <Mic className="h-5 w-5 text-red-500" />
      default:
        return <Settings className="h-5 w-5 text-gray-500" />
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

  const generateQRCode = (url: string) => {
    // In a real implementation, this would generate a proper QR code
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}`
  }

  const shareApp = (app: MobileApp) => {
    if (navigator.share) {
      navigator.share({
        title: app.name,
        text: `Download ${app.name} for ${app.platform}`,
        url: app.download_url
      })
    } else {
      navigator.clipboard.writeText(app.download_url)
      alert('Download link copied to clipboard!')
    }
  }

  useEffect(() => {
    fetchMobileData()
    
    // Refresh mobile data every 2 minutes
    const interval = setInterval(fetchMobileData, 120000)
    
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Mobile Apps Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{analytics?.total_users.toLocaleString() || 0}</div>
            <p className="text-xs text-gray-500">Across all platforms</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Activity className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{analytics?.active_users.toLocaleString() || 0}</div>
            <p className="text-xs text-gray-500">Last 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">App Downloads</CardTitle>
            <Download className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{analytics?.app_downloads.toLocaleString() || 0}</div>
            <p className="text-xs text-gray-500">All time</p>
          </CardContent>
        </Card>
      </div>

      {/* Mobile Apps */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5 text-blue-600" />
            Mobile Applications ({mobileApps.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mobileApps.map((app) => (
              <div key={app.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-3">
                    {getPlatformIcon(app.platform)}
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
                        {app.name}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <span>Version {app.version}</span>
                        <span>•</span>
                        <span>{app.user_count.toLocaleString()} users</span>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          <span>★</span>
                          <span>{app.rating}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(app.status)}>
                      {app.status}
                    </Badge>
                    <Button size="sm" variant="outline" onClick={() => shareApp(app)}>
                      <Share className="h-4 w-4 mr-2" />
                      Share
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Features</h4>
                    <div className="flex flex-wrap gap-2">
                      {app.features.map((feature, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-center">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Download QR Code</h4>
                    <div className="p-2 bg-white dark:bg-gray-800 rounded border">
                      <img 
                        src={generateQRCode(app.download_url)} 
                        alt={`QR Code for ${app.name}`}
                        className="w-24 h-24"
                      />
                    </div>
                    <Button 
                      size="sm" 
                      className="mt-2 bg-blue-600 hover:bg-blue-700"
                      onClick={() => window.open(app.download_url, '_blank')}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>

                <div className="mt-4 text-xs text-gray-500">
                  Last updated: {formatTimeAgo(app.last_updated)}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Mobile Integrations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-green-600" />
            Mobile Integrations ({integrations.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {integrations.map((integration) => (
              <div key={integration.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3">
                    {getIntegrationIcon(integration.type)}
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {integration.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {integration.description}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(integration.status)}>
                      {integration.status}
                    </Badge>
                    <Button size="sm" variant="outline">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Configuration</h4>
                    <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                      {Object.entries(integration.configuration).map(([key, value]) => (
                        <div key={key} className="flex justify-between">
                          <span className="capitalize">{key.replace('_', ' ')}:</span>
                          <span className="font-mono">{String(value)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Status</h4>
                    <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                      <div className="flex justify-between">
                        <span>Last Sync:</span>
                        <span>{formatTimeAgo(integration.last_sync)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Type:</span>
                        <span className="capitalize">{integration.type.replace('_', ' ')}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Mobile Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-purple-600" />
              Feature Usage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics?.feature_usage.map((feature, index) => (
                <div key={index} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">{feature.feature}</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{feature.usage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${feature.usage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="h-5 w-5 text-green-600" />
              Platform Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics?.platform_distribution.map((platform, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded">
                  <div className="flex items-center gap-3">
                    {getPlatformIcon(platform.platform.toLowerCase())}
                    <span className="font-medium text-gray-900 dark:text-white">{platform.platform}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-gray-900 dark:text-white">
                      {platform.users.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500">
                      {Math.round((platform.users / (analytics?.total_users || 1)) * 100)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mobile Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-orange-600" />
            Performance Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="text-2xl font-bold text-blue-600">
                {analytics?.session_duration || 0}m
              </div>
              <div className="text-sm text-blue-700 dark:text-blue-300 font-medium">Avg Session Duration</div>
              <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                Per user session
              </div>
            </div>
            
            <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <div className="text-2xl font-bold text-green-600">
                {analytics?.crash_rate || 0}%
              </div>
              <div className="text-sm text-green-700 dark:text-green-300 font-medium">Crash Rate</div>
              <div className="text-xs text-green-600 dark:text-green-400 mt-1">
                App stability
              </div>
            </div>
            
            <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
              <div className="text-2xl font-bold text-purple-600">
                {Math.round(((analytics?.active_users || 0) / (analytics?.total_users || 1)) * 100)}%
              </div>
              <div className="text-sm text-purple-700 dark:text-purple-300 font-medium">Engagement Rate</div>
              <div className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                Active vs total users
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default withAuth(MobileIntegration)
