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
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Eye, 
  Lock, 
  Unlock,
  User,
  Clock,
  MapPin,
  Activity,
  FileText,
  Database,
  Key,
  Fingerprint,
  Zap,
  AlertCircle,
  Search,
  Filter,
  Download,
  RefreshCw,
  Settings,
  Bell,
  TrendingUp,
  TrendingDown
} from "lucide-react"
import { useAuth } from "@/lib/auth"
import { withAuth } from "@/lib/auth"

interface SecurityEvent {
  id: string
  type: 'login' | 'logout' | 'permission_change' | 'data_access' | 'data_modification' | 'failed_login' | 'suspicious_activity'
  severity: 'low' | 'medium' | 'high' | 'critical'
  user_id: string
  user_name: string
  user_role: string
  action: string
  resource: string
  ip_address: string
  user_agent: string
  location?: string
  timestamp: string
  details: any
  status: 'success' | 'failed' | 'blocked'
}

interface SecurityAlert {
  id: string
  type: 'brute_force' | 'unauthorized_access' | 'data_breach' | 'privilege_escalation' | 'suspicious_pattern'
  severity: 'medium' | 'high' | 'critical'
  title: string
  description: string
  affected_users: string[]
  affected_resources: string[]
  detected_at: string
  resolved_at?: string
  status: 'active' | 'investigating' | 'resolved' | 'false_positive'
  mitigation_actions: string[]
}

interface SecurityMetrics {
  total_events: number
  failed_logins: number
  suspicious_activities: number
  blocked_attempts: number
  active_alerts: number
  security_score: number
  last_24h_events: number
  top_threats: Array<{ type: string; count: number }>
}

interface SecurityAuditProps {
  className?: string
}

export const SecurityAudit: React.FC<SecurityAuditProps> = ({ className }) => {
  const { user } = useAuth()
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([])
  const [securityAlerts, setSecurityAlerts] = useState<SecurityAlert[]>([])
  const [metrics, setMetrics] = useState<SecurityMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [filterType, setFilterType] = useState('all')
  const [filterSeverity, setFilterSeverity] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  const fetchSecurityData = async () => {
    try {
      setLoading(true)
      
      // Mock security events
      const mockEvents: SecurityEvent[] = [
        {
          id: 'SEC-001',
          type: 'login',
          severity: 'low',
          user_id: 'USR-001',
          user_name: 'Admin User',
          user_role: 'admin',
          action: 'User login',
          resource: '/dashboard',
          ip_address: '192.168.1.100',
          user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          location: 'Algiers, Algeria',
          timestamp: new Date().toISOString(),
          details: { session_duration: '2h 30m' },
          status: 'success'
        },
        {
          id: 'SEC-002',
          type: 'failed_login',
          severity: 'medium',
          user_id: 'unknown',
          user_name: 'Unknown User',
          user_role: 'unknown',
          action: 'Failed login attempt',
          resource: '/login',
          ip_address: '203.0.113.42',
          user_agent: 'Mozilla/5.0 (Linux; Android 10; SM-G975F) AppleWebKit/537.36',
          location: 'Unknown',
          timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
          details: { attempts: 3, reason: 'Invalid password' },
          status: 'failed'
        },
        {
          id: 'SEC-003',
          type: 'data_modification',
          severity: 'high',
          user_id: 'USR-002',
          user_name: 'Mahmoud Supervisor',
          user_role: 'supervisor',
          action: 'Order status updated',
          resource: '/orders/ORD-001',
          ip_address: '192.168.1.105',
          user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          location: 'Biskra, Algeria',
          timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
          details: { old_status: 'pending', new_status: 'processing' },
          status: 'success'
        },
        {
          id: 'SEC-004',
          type: 'suspicious_activity',
          severity: 'critical',
          user_id: 'USR-003',
          user_name: 'Sara Regional Manager',
          user_role: 'regional_manager',
          action: 'Multiple rapid data access',
          resource: '/clients',
          ip_address: '192.168.1.110',
          user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          location: 'Oran, Algeria',
          timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
          details: { requests_per_minute: 45, pattern: 'automated' },
          status: 'blocked'
        }
      ]

      setSecurityEvents(mockEvents)

      // Mock security alerts
      const mockAlerts: SecurityAlert[] = [
        {
          id: 'ALERT-001',
          type: 'brute_force',
          severity: 'high',
          title: 'Brute Force Attack Detected',
          description: 'Multiple failed login attempts detected from IP 203.0.113.42',
          affected_users: ['admin@djurdjura.dz'],
          affected_resources: ['/login', '/api/auth'],
          detected_at: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
          status: 'investigating',
          mitigation_actions: ['IP blocked', 'Rate limiting enabled', 'User notified']
        },
        {
          id: 'ALERT-002',
          type: 'suspicious_pattern',
          severity: 'medium',
          title: 'Unusual Data Access Pattern',
          description: 'User accessing large amounts of client data in short time',
          affected_users: ['sara@djurdjura.dz'],
          affected_resources: ['/clients', '/api/clients'],
          detected_at: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
          status: 'active',
          mitigation_actions: ['Access monitoring increased', 'User session reviewed']
        }
      ]

      setSecurityAlerts(mockAlerts)

      // Mock security metrics
      const mockMetrics: SecurityMetrics = {
        total_events: 1247,
        failed_logins: 23,
        suspicious_activities: 5,
        blocked_attempts: 8,
        active_alerts: 2,
        security_score: 85,
        last_24h_events: 47,
        top_threats: [
          { type: 'Failed Login', count: 15 },
          { type: 'Suspicious Access', count: 8 },
          { type: 'Data Modification', count: 5 },
          { type: 'Unauthorized Access', count: 3 }
        ]
      }

      setMetrics(mockMetrics)
    } catch (error) {
      console.error('Error fetching security data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'high':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
      case 'critical':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'low':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'medium':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case 'high':
        return <AlertCircle className="h-4 w-4 text-orange-500" />
      case 'critical':
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <Activity className="h-4 w-4 text-gray-500" />
    }
  }

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'login':
        return <Unlock className="h-4 w-4 text-green-500" />
      case 'logout':
        return <Lock className="h-4 w-4 text-gray-500" />
      case 'failed_login':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'data_access':
        return <Eye className="h-4 w-4 text-blue-500" />
      case 'data_modification':
        return <Edit className="h-4 w-4 text-orange-500" />
      case 'suspicious_activity':
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      default:
        return <Activity className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      case 'blocked':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const getAlertStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      case 'investigating':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'resolved':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'false_positive':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
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

  const filteredEvents = securityEvents.filter(event => {
    const matchesType = filterType === 'all' || event.type === filterType
    const matchesSeverity = filterSeverity === 'all' || event.severity === filterSeverity
    const matchesSearch = searchTerm === '' || 
      event.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.resource.toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchesType && matchesSeverity && matchesSearch
  })

  const exportSecurityLog = () => {
    const csvContent = [
      ['Timestamp', 'Type', 'Severity', 'User', 'Action', 'Resource', 'IP Address', 'Status'].join(','),
      ...filteredEvents.map(event => [
        new Date(event.timestamp).toLocaleString(),
        event.type,
        event.severity,
        event.user_name,
        event.action,
        event.resource,
        event.ip_address,
        event.status
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `security-audit-${Date.now()}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  useEffect(() => {
    fetchSecurityData()
    
    // Refresh security data every 30 seconds
    const interval = setInterval(fetchSecurityData, 30000)
    
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Security Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Security Score</CardTitle>
            <Shield className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{metrics?.security_score || 0}%</div>
            <p className="text-xs text-gray-500">Overall security rating</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{metrics?.active_alerts || 0}</div>
            <p className="text-xs text-gray-500">Require attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed Logins</CardTitle>
            <XCircle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{metrics?.failed_logins || 0}</div>
            <p className="text-xs text-gray-500">Last 24 hours</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Blocked Attempts</CardTitle>
            <Lock className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{metrics?.blocked_attempts || 0}</div>
            <p className="text-xs text-gray-500">Security violations</p>
          </CardContent>
        </Card>
      </div>

      {/* Security Alerts */}
      {securityAlerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-red-600" />
              Security Alerts ({securityAlerts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {securityAlerts.map((alert) => (
                <Alert key={alert.id} className={`border-l-4 ${
                  alert.severity === 'critical' ? 'border-red-500 bg-red-50 dark:bg-red-900/20' :
                  alert.severity === 'high' ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20' :
                  'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20'
                }`}>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-gray-900 dark:text-white">
                          {alert.title}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {alert.description}
                        </div>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          <span>Detected: {formatTimeAgo(alert.detected_at)}</span>
                          <span>Affected: {alert.affected_users.length} users</span>
                          <span>Resources: {alert.affected_resources.length}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getAlertStatusColor(alert.status)}>
                          {alert.status}
                        </Badge>
                        <Badge className={getSeverityColor(alert.severity)}>
                          {alert.severity}
                        </Badge>
                      </div>
                    </div>
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Security Events */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-green-600" />
              Security Events ({filteredEvents.length})
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={exportSecurityLog}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button variant="outline" size="sm" onClick={fetchSecurityData}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <Input
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="login">Login</SelectItem>
                <SelectItem value="logout">Logout</SelectItem>
                <SelectItem value="failed_login">Failed Login</SelectItem>
                <SelectItem value="data_access">Data Access</SelectItem>
                <SelectItem value="data_modification">Data Modification</SelectItem>
                <SelectItem value="suspicious_activity">Suspicious Activity</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterSeverity} onValueChange={setFilterSeverity}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severity</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Events List */}
          <div className="space-y-3">
            {filteredEvents.map((event) => (
              <div key={event.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    {getEventTypeIcon(event.type)}
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-white">
                        {event.action}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {event.user_name} • {event.resource}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getSeverityColor(event.severity)}>
                      {event.severity}
                    </Badge>
                    <Badge className={getStatusColor(event.status)}>
                      {event.status}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <label className="text-gray-600 dark:text-gray-400">IP Address</label>
                    <div className="font-mono text-gray-900 dark:text-white">
                      {event.ip_address}
                    </div>
                  </div>
                  <div>
                    <label className="text-gray-600 dark:text-gray-400">Location</label>
                    <div className="text-gray-900 dark:text-white">
                      {event.location || 'Unknown'}
                    </div>
                  </div>
                  <div>
                    <label className="text-gray-600 dark:text-gray-400">User Agent</label>
                    <div className="text-gray-900 dark:text-white truncate">
                      {event.user_agent}
                    </div>
                  </div>
                  <div>
                    <label className="text-gray-600 dark:text-gray-400">Timestamp</label>
                    <div className="text-gray-900 dark:text-white">
                      {formatTimeAgo(event.timestamp)}
                    </div>
                  </div>
                </div>

                {event.details && Object.keys(event.details).length > 0 && (
                  <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-800 rounded">
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Additional Details:
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {JSON.stringify(event.details, null, 2)}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Security Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-purple-600" />
            Security Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Top Threats</h4>
              <div className="space-y-2">
                {metrics?.top_threats.map((threat, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                    <span className="text-sm text-gray-900 dark:text-white">{threat.type}</span>
                    <Badge variant="secondary">{threat.count}</Badge>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Recent Activity</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Total Events (24h)</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{metrics?.last_24h_events}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Suspicious Activities</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{metrics?.suspicious_activities}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Total Events (All Time)</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{metrics?.total_events}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default withAuth(SecurityAudit)
