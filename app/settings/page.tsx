"use client"

import React, { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { 
  AlertCircle, 
  CheckCircle, 
  User, 
  Mail, 
  Shield, 
  Bell, 
  Palette, 
  Globe, 
  Database, 
  ShieldCheck, 
  Settings as SettingsIcon,
  Save,
  RefreshCw,
  Download,
  Upload,
  Trash2,
  Eye,
  EyeOff,
  Sun,
  Moon,
  Monitor,
  Languages,
  Clock,
  MapPin,
  Phone,
  Building,
  Key,
  Lock,
  Unlock,
  Activity,
  Server,
  HardDrive,
  Cpu,
  Wifi,
  AlertTriangle,
  Info,
  Send,
  Camera,
  Image,
  FileText,
  Archive
} from "lucide-react"
import { useAuth } from "@/lib/auth"
import { withAuth } from "@/lib/auth"
import { format } from "date-fns"
import { showEditSuccessToast, showEditErrorToast } from "@/lib/toast-notifications"
import { logEditActivity } from "@/lib/activity-logging"

interface UserSettings {
  name: string
  email: string
  phone?: string
  avatar?: string
  language: string
  timezone: string
  dateFormat: string
  currency: string
  notifications: {
    email: boolean
    push: boolean
    sms: boolean
    orderUpdates: boolean
    systemAlerts: boolean
    weeklyReports: boolean
  }
  privacy: {
    profileVisibility: string
    dataSharing: boolean
    analytics: boolean
  }
  appearance: {
    theme: 'light' | 'dark' | 'system'
    fontSize: string
    compactMode: boolean
  }
}

interface SystemInfo {
  version: string
  buildDate: string
  uptime: string
  database: {
    status: string
    size: string
    lastBackup: string
  }
  server: {
    cpu: string
    memory: string
    disk: string
  }
  security: {
    lastLogin: string
    failedAttempts: number
    twoFactorEnabled: boolean
  }
}

function SettingsPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [messageType, setMessageType] = useState<"success" | "error" | "info">("info")
  const [showPassword, setShowPassword] = useState(false)
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [notificationMessage, setNotificationMessage] = useState("")
  const [notificationEmail, setNotificationEmail] = useState("")
  const [notificationPhone, setNotificationPhone] = useState("")
  
  const [settings, setSettings] = useState<UserSettings>({
    name: user?.name || "",
    email: user?.email || "",
    phone: "",
    avatar: "",
    language: "fr",
    timezone: "Africa/Algiers",
    dateFormat: "DD/MM/YYYY",
    currency: "DZD",
    notifications: {
      email: true,
      push: true,
      sms: false,
      orderUpdates: true,
      systemAlerts: true,
      weeklyReports: false
    },
    privacy: {
      profileVisibility: "team",
      dataSharing: false,
      analytics: true
    },
    appearance: {
      theme: "system",
      fontSize: "medium",
      compactMode: false
    }
  })

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const [systemInfo] = useState<SystemInfo>({
    version: "2.1.0",
    buildDate: "2024-01-15",
    uptime: "15 days, 8 hours",
    database: {
      status: "Healthy",
      size: "2.4 GB",
      lastBackup: "2024-01-14 23:30:00"
    },
    server: {
      cpu: "12%",
      memory: "68%",
      disk: "45%"
    },
    security: {
      lastLogin: "2024-01-15 09:30:00",
      failedAttempts: 0,
      twoFactorEnabled: false
    }
  })

  const showMessage = (text: string, type: "success" | "error" | "info" = "info") => {
    setMessage(text)
    setMessageType(type)
    setTimeout(() => setMessage(""), 5000)
  }

  const handleSaveSettings = async () => {
    setLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      showMessage("Settings saved successfully!", "success")
    } catch (error) {
      showMessage("Failed to save settings", "error")
    } finally {
      setLoading(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showEditErrorToast('Password', 'Passwords do not match')
      setLoading(false)
      return
    }

    if (passwordData.newPassword.length < 8) {
      showEditErrorToast('Password', 'Password must be at least 8 characters')
      setLoading(false)
      return
    }

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Log activity
      await logEditActivity(
        user?.id || 'unknown',
        user?.name || 'Unknown User',
        'Password',
        user?.id || 'unknown',
        'User Password',
        { oldPassword: '***' },
        { newPassword: '***' }
      )
      
      showEditSuccessToast('Password', 'Password changed successfully')
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" })
    } catch (error) {
      showEditErrorToast('Password', 'Failed to change password')
    } finally {
      setLoading(false)
    }
  }

  const handleProfileImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (file.size > 2 * 1024 * 1024) { // 2MB limit
      showEditErrorToast('Profile Image', 'File size must be less than 2MB')
      return
    }

    if (!file.type.startsWith('image/')) {
      showEditErrorToast('Profile Image', 'Please select a valid image file')
      return
    }

    setLoading(true)
    try {
      // Simulate image upload
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      const reader = new FileReader()
      reader.onload = (e) => {
        setProfileImage(e.target?.result as string)
        showEditSuccessToast('Profile Image', 'Profile picture updated successfully')
      }
      reader.readAsDataURL(file)
      
      // Log activity
      await logEditActivity(
        user?.id || 'unknown',
        user?.name || 'Unknown User',
        'Profile Image',
        user?.id || 'unknown',
        'User Profile',
        { oldImage: 'Previous image' },
        { newImage: 'New image uploaded' }
      )
    } catch (error) {
      showEditErrorToast('Profile Image', 'Failed to upload profile picture')
    } finally {
      setLoading(false)
    }
  }

  const handleSendNotification = async () => {
    if (!notificationMessage.trim()) {
      showEditErrorToast('Notification', 'Message is required')
      return
    }

    if (!notificationEmail.trim() && !notificationPhone.trim()) {
      showEditErrorToast('Notification', 'Email or phone number is required')
      return
    }

    setLoading(true)
    try {
      // Simulate sending notification
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      showEditSuccessToast('Notification', 'Notification sent successfully')
      setNotificationMessage("")
      setNotificationEmail("")
      setNotificationPhone("")
      
      // Log activity
      await logEditActivity(
        user?.id || 'unknown',
        user?.name || 'Unknown User',
        'Notification',
        'system',
        'System Notification',
        {},
        { message: notificationMessage, email: notificationEmail, phone: notificationPhone }
      )
    } catch (error) {
      showEditErrorToast('Notification', 'Failed to send notification')
    } finally {
      setLoading(false)
    }
  }

  // Data Backup and Export Functions
  const handleDataBackup = async () => {
    setLoading(true)
    try {
      // Simulate backup process
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Fetch all data from APIs
      const [ordersResponse, clientsResponse, usersResponse, productsResponse, transportResponse, activityLogsResponse] = await Promise.all([
        fetch('/api/orders'),
        fetch('/api/clients'),
        fetch('/api/users'),
        fetch('/api/products'),
        fetch('/api/transport'),
        fetch('/api/activity-logs')
      ])
      
      const ordersData = ordersResponse.ok ? await ordersResponse.json() : { orders: [] }
      const clientsData = clientsResponse.ok ? await clientsResponse.json() : { clients: [] }
      const usersData = usersResponse.ok ? await usersResponse.json() : { users: [] }
      const productsData = productsResponse.ok ? await productsResponse.json() : { products: [] }
      const transportData = transportResponse.ok ? await transportResponse.json() : { tariffs: [] }
      const activityLogsData = activityLogsResponse.ok ? await activityLogsResponse.json() : { activityLogs: [] }
      
      // Create comprehensive backup data
      const backupData = {
        timestamp: new Date().toISOString(),
        version: systemInfo.version,
        backup_type: "full_database_backup",
        data: {
          orders: ordersData.orders || [],
          clients: clientsData.clients || [],
          users: usersData.users || [],
          products: productsData.products || [],
          transport_tariffs: transportData.tariffs || [],
          activity_logs: activityLogsData.activityLogs || [],
          system_info: {
            total_orders: ordersData.orders?.length || 0,
            total_clients: clientsData.clients?.length || 0,
            total_users: usersData.users?.length || 0,
            total_products: productsData.products?.length || 0,
            total_transport_tariffs: transportData.tariffs?.length || 0,
            total_activity_logs: activityLogsData.activityLogs?.length || 0
          }
        },
        metadata: {
          created_by: user?.name || 'Unknown User',
          user_id: user?.id || 'unknown',
          backup_size: 'Calculated after generation',
          format_version: '1.0'
        }
      }
      
      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `djurdjura-backup-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
      showEditSuccessToast('Data Backup', 'Database backup downloaded successfully!')
      
      // Log backup activity
      await logEditActivity(
        user?.id || 'unknown',
        user?.name || 'Unknown User',
        'Data Backup',
        'system',
        'Database Backup',
        {},
        { backup_type: 'full_database_backup', records_count: Object.keys(backupData.data).length }
      )
    } catch (error) {
      showEditErrorToast('Data Backup', 'Failed to create backup')
    } finally {
      setLoading(false)
    }
  }

  const handleExportLogs = async () => {
    setLoading(true)
    try {
      // Fetch real activity logs from API
      const response = await fetch('/api/activity-logs')
      if (!response.ok) {
        throw new Error('Failed to fetch activity logs')
      }
      
      const data = await response.json()
      const activityLogs = data.activityLogs || []
      
      // Create comprehensive log export
      const logData = {
        timestamp: new Date().toISOString(),
        export_type: "activity_logs",
        total_logs: activityLogs.length,
        logs: activityLogs.map((log: any) => ({
          timestamp: log.timestamp,
          user_name: log.user_name,
          action_type: log.action_type,
          entity_type: log.entity_type,
          entity_name: log.entity_name,
          details: log.details,
          old_values: log.old_values || null,
          new_values: log.new_values || null
        })),
        metadata: {
          exported_by: user?.name || 'Unknown User',
          user_id: user?.id || 'unknown',
          export_format: 'JSON',
          date_range: activityLogs.length > 0 ? {
            from: activityLogs[activityLogs.length - 1]?.timestamp,
            to: activityLogs[0]?.timestamp
          } : null
        }
      }
      
      const blob = new Blob([JSON.stringify(logData, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `djurdjura-activity-logs-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
      showEditSuccessToast('Activity Logs', 'Activity logs exported successfully!')
      
      // Log export activity
      await logEditActivity(
        user?.id || 'unknown',
        user?.name || 'Unknown User',
        'Activity Logs Export',
        'system',
        'Activity Logs Export',
        {},
        { export_type: 'activity_logs', logs_count: activityLogs.length }
      )
    } catch (error) {
      showEditErrorToast('Activity Logs', 'Failed to export activity logs')
    } finally {
      setLoading(false)
    }
  }

  const handleExportFullReport = async () => {
    setLoading(true)
    try {
      // Simulate full report generation
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      // Fetch all data for comprehensive report
      const [ordersResponse, clientsResponse, usersResponse, productsResponse, transportResponse, activityLogsResponse] = await Promise.all([
        fetch('/api/orders'),
        fetch('/api/clients'),
        fetch('/api/users'),
        fetch('/api/products'),
        fetch('/api/transport'),
        fetch('/api/activity-logs')
      ])
      
      const ordersData = ordersResponse.ok ? await ordersResponse.json() : { orders: [] }
      const clientsData = clientsResponse.ok ? await clientsResponse.json() : { clients: [] }
      const usersData = usersResponse.ok ? await usersResponse.json() : { users: [] }
      const productsData = productsResponse.ok ? await productsResponse.json() : { products: [] }
      const transportData = transportResponse.ok ? await transportResponse.json() : { tariffs: [] }
      const activityLogsData = activityLogsResponse.ok ? await activityLogsResponse.json() : { activityLogs: [] }
      
      // Calculate comprehensive statistics
      const orders = ordersData.orders || []
      const clients = clientsData.clients || []
      const users = usersData.users || []
      const products = productsData.products || []
      const transportTariffs = transportData.tariffs || []
      const activityLogs = activityLogsData.activityLogs || []
      
      // Calculate business metrics
      const totalRevenue = orders.reduce((sum: number, order: any) => sum + (order.total_price || 0), 0)
      const totalOrders = orders.length
      const activeClients = clients.filter((client: any) => client.status === 'active').length
      const activeUsers = users.filter((user: any) => user.status === 'active').length
      const pendingOrders = orders.filter((order: any) => order.status === 'pending').length
      const deliveredOrders = orders.filter((order: any) => order.status === 'delivered').length
      
      const reportData = {
        timestamp: new Date().toISOString(),
        report_type: "comprehensive_business_report",
        summary: {
          total_orders: totalOrders,
          total_clients: clients.length,
          active_clients: activeClients,
          total_users: users.length,
          active_users: activeUsers,
          total_products: products.length,
          total_transport_tariffs: transportTariffs.length,
          total_revenue: totalRevenue,
          pending_orders: pendingOrders,
          delivered_orders: deliveredOrders,
          delivery_rate: totalOrders > 0 ? ((deliveredOrders / totalOrders) * 100).toFixed(2) : 0
        },
        detailed_data: {
          orders: orders,
          clients: clients,
          users: users,
          products: products,
          transport_tariffs: transportTariffs,
          activity_logs: activityLogs.slice(0, 100) // Last 100 activity logs
        },
        analytics: {
          orders_by_status: {
            pending: orders.filter((o: any) => o.status === 'pending').length,
            processing: orders.filter((o: any) => o.status === 'processing').length,
            delivered: orders.filter((o: any) => o.status === 'delivered').length,
            cancelled: orders.filter((o: any) => o.status === 'cancelled').length
          },
          users_by_role: {
            admin: users.filter((u: any) => u.role === 'admin').length,
            regional_manager: users.filter((u: any) => u.role === 'regional_manager').length,
            supervisor: users.filter((u: any) => u.role === 'supervisor').length,
            operations: users.filter((u: any) => u.role === 'operations').length
          },
          recent_activity: activityLogs.slice(0, 20) // Last 20 activities
        },
        metadata: {
          generated_by: user?.name || 'Unknown User',
          user_id: user?.id || 'unknown',
          report_format: 'JSON',
          generation_time: new Date().toISOString(),
          data_sources: ['orders', 'clients', 'users', 'products', 'transport_tariffs', 'activity_logs']
        }
      }
      
      const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `djurdjura-full-report-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
      showEditSuccessToast('Full Report', 'Comprehensive report exported successfully!')
      
      // Log report generation activity
      await logEditActivity(
        user?.id || 'unknown',
        user?.name || 'Unknown User',
        'Full Report Export',
        'system',
        'Comprehensive Business Report',
        {},
        { 
          report_type: 'comprehensive_business_report', 
          total_orders: totalOrders,
          total_revenue: totalRevenue,
          records_included: Object.keys(reportData.detailed_data).length
        }
      )
    } catch (error) {
      showEditErrorToast('Full Report', 'Failed to export comprehensive report')
    } finally {
      setLoading(false)
    }
  }

  const handleDataDeletionRequest = async () => {
    if (!confirm("Are you sure you want to request data deletion? This action cannot be undone.")) {
      return
    }
    
    setLoading(true)
    try {
      // Simulate data deletion request
      await new Promise(resolve => setTimeout(resolve, 2000))
      showMessage("Data deletion request submitted. You will be contacted within 48 hours.", "info")
    } catch (error) {
      showMessage("Failed to submit deletion request", "error")
    } finally {
      setLoading(false)
    }
  }

  const handleExportData = () => {
    showMessage("Data export started. You'll receive an email when ready.", "info")
  }

  const handleDeleteAccount = () => {
    showMessage("Account deletion requires admin approval. Contact support.", "error")
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      case "regional_manager":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      case "supervisor":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "operations":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
      default:
        return "bg-slate-100 text-slate-800"
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin":
        return <Shield className="h-4 w-4" />
      case "regional_manager":
        return <MapPin className="h-4 w-4" />
      case "supervisor":
        return <User className="h-4 w-4" />
      case "operations":
        return <Activity className="h-4 w-4" />
      default:
        return <User className="h-4 w-4" />
    }
  }

  return (
    <div className="p-4 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-slate-600 dark:text-slate-400">
            Manage your account preferences and system configuration
          </p>
      </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportData}>
            <Download className="mr-2 h-4 w-4" />
            Export Data
          </Button>
          <Button onClick={handleSaveSettings} disabled={loading}>
            {loading ? (
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Save Changes
          </Button>
        </div>
      </div>

      {/* Message Alert */}
      {message && (
        <Alert variant={messageType === "error" ? "destructive" : "default"}>
          {messageType === "success" ? (
            <CheckCircle className="h-4 w-4" />
          ) : messageType === "error" ? (
            <AlertCircle className="h-4 w-4" />
          ) : (
            <Info className="h-4 w-4" />
          )}
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}

      {/* Settings Tabs */}
      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="send-notifications">Send Notifications</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Profile Information */}
        <Card className="lg:col-span-2">
          <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Profile Information
                </CardTitle>
          </CardHeader>
              <CardContent className="space-y-6">
                {/* Avatar Section */}
                <div className="flex items-center gap-4">
                  <Avatar className="h-20 w-20">
                    {profileImage ? (
                      <AvatarImage src={profileImage} alt="Profile" />
                    ) : (
                      <AvatarFallback className="text-lg">
                        {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    )}
                  </Avatar>
            <div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleProfileImageUpload}
                      className="hidden"
                      id="profile-image-upload"
                    />
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => document.getElementById('profile-image-upload')?.click()}
                      disabled={loading}
                    >
                      {loading ? (
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Camera className="mr-2 h-4 w-4" />
                      )}
                      {profileImage ? 'Change Avatar' : 'Upload Avatar'}
                    </Button>
                    <p className="text-xs text-slate-500 mt-1">JPG, PNG up to 2MB</p>
            </div>
                </div>

                <Separator />

                {/* Personal Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={settings.name}
                      onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                    />
            </div>

            <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={settings.email}
                      onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={settings.phone}
                      onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                      placeholder="+213 XX XXX XXXX"
                    />
                  </div>

                  <div>
                    <Label htmlFor="role">Role</Label>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge className={getRoleColor(user?.role || "")}>
                        <span className="flex items-center gap-1">
                          {getRoleIcon(user?.role || "")}
                          {user?.role?.replace("_", " ").toUpperCase()}
                        </span>
                      </Badge>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Regional Settings */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="language">Language</Label>
                    <Select
                      value={settings.language}
                      onValueChange={(value) => setSettings({ ...settings, language: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fr">Français</SelectItem>
                        <SelectItem value="ar">العربية</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="timezone">Timezone (Fixed)</Label>
                    <Select
                      value={settings.timezone}
                      disabled={true}
                    >
                      <SelectTrigger className="bg-gray-50 dark:bg-gray-700">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Africa/Algiers">Algiers (GMT+1)</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-500 mt-1">
                      Timezone is fixed to Algeria (GMT+1) for all users
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="dateFormat">Date Format</Label>
                    <Select
                      value={settings.dateFormat}
                      onValueChange={(value) => setSettings({ ...settings, dateFormat: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                        <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                        <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="currency">Currency (Fixed)</Label>
                    <Select
                      value={settings.currency}
                      disabled={true}
                    >
                      <SelectTrigger className="bg-gray-50 dark:bg-gray-700">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="DZD">Algerian Dinar (DA)</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-500 mt-1">
                      Currency is fixed to Algerian Dinar (DA) for all users
                    </p>
                  </div>
            </div>
          </CardContent>
        </Card>

            {/* Account Status */}
        <Card>
          <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5" />
                  Account Status
                </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Status</span>
                  <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Active
                  </Badge>
            </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm">Two-Factor Auth</span>
                  <Badge variant="outline">
                    {systemInfo.security.twoFactorEnabled ? "Enabled" : "Disabled"}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm">Last Login</span>
                  <span className="text-xs text-slate-500">
                    {format(new Date(systemInfo.security.lastLogin), 'MMM dd, HH:mm')}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm">Failed Attempts</span>
                  <span className="text-xs text-slate-500">
                    {systemInfo.security.failedAttempts}
                  </span>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Button variant="outline" size="sm" className="w-full">
                    <Key className="mr-2 h-4 w-4" />
                    Enable 2FA
                  </Button>
                  <Button variant="outline" size="sm" className="w-full">
                    <Activity className="mr-2 h-4 w-4" />
                    Login History
                  </Button>
            </div>
          </CardContent>
        </Card>
      </div>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Change Password */}
      <Card>
        <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Change Password
                </CardTitle>
        </CardHeader>
        <CardContent>
                <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <div className="relative">
              <Input
                        id="currentPassword"
                        type={showPassword ? "text" : "password"}
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
            </div>

            <div>
                    <Label htmlFor="newPassword">New Password</Label>
              <Input
                      id="newPassword"
                type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
              />
            </div>

            <div>
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                      id="confirmPassword"
                type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
              />
            </div>

                  <Button type="submit" disabled={loading} className="w-full">
                    {loading ? (
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Lock className="mr-2 h-4 w-4" />
                    )}
                    Change Password
                  </Button>
          </form>
        </CardContent>
      </Card>

            {/* Security Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Security Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Two-Factor Authentication</Label>
                    <p className="text-xs text-slate-500">Add an extra layer of security</p>
                  </div>
                  <Switch defaultChecked={systemInfo.security.twoFactorEnabled} />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Login Notifications</Label>
                    <p className="text-xs text-slate-500">Get notified of new logins</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Session Timeout</Label>
                    <p className="text-xs text-slate-500">Auto-logout after inactivity</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <Separator />

                <div className="space-y-2">
                  <Button variant="outline" size="sm" className="w-full">
                    <Activity className="mr-2 h-4 w-4" />
                    View Login History
                  </Button>
                  <Button variant="outline" size="sm" className="w-full">
                    <ShieldCheck className="mr-2 h-4 w-4" />
                    Security Audit
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Danger Zone */}
          <Card className="border-red-200 dark:border-red-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="h-5 w-5" />
                Data Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-red-600">Request Data Deletion</Label>
                  <p className="text-xs text-slate-500">Request deletion of your personal data</p>
                </div>
                <Button variant="destructive" size="sm" onClick={handleDataDeletionRequest}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Request Deletion
                </Button>
              </div>
              <Alert className="border-orange-200 bg-orange-50 dark:bg-orange-900/20">
                <AlertTriangle className="h-4 w-4 text-orange-600" />
                <AlertDescription className="text-orange-800 dark:text-orange-200">
                  Data deletion requests are processed within 48 hours and cannot be undone.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Email Notifications</Label>
                    <p className="text-xs text-slate-500">Receive notifications via email</p>
                  </div>
                  <Switch 
                    checked={settings.notifications.email}
                    onCheckedChange={(checked) => 
                      setSettings({ 
                        ...settings, 
                        notifications: { ...settings.notifications, email: checked } 
                      })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Push Notifications</Label>
                    <p className="text-xs text-slate-500">Receive browser push notifications</p>
                  </div>
                  <Switch 
                    checked={settings.notifications.push}
                    onCheckedChange={(checked) => 
                      setSettings({ 
                        ...settings, 
                        notifications: { ...settings.notifications, push: checked } 
                      })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>SMS Notifications</Label>
                    <p className="text-xs text-slate-500">Receive notifications via SMS</p>
                  </div>
                  <Switch 
                    checked={settings.notifications.sms}
                    onCheckedChange={(checked) => 
                      setSettings({ 
                        ...settings, 
                        notifications: { ...settings.notifications, sms: checked } 
                      })
                    }
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Notification Types</h4>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Order Updates</Label>
                    <p className="text-xs text-slate-500">Get notified about order status changes</p>
                  </div>
                  <Switch 
                    checked={settings.notifications.orderUpdates}
                    onCheckedChange={(checked) => 
                      setSettings({ 
                        ...settings, 
                        notifications: { ...settings.notifications, orderUpdates: checked } 
                      })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>System Alerts</Label>
                    <p className="text-xs text-slate-500">Receive important system notifications</p>
                  </div>
                  <Switch 
                    checked={settings.notifications.systemAlerts}
                    onCheckedChange={(checked) => 
                      setSettings({ 
                        ...settings, 
                        notifications: { ...settings.notifications, systemAlerts: checked } 
                      })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Weekly Reports</Label>
                    <p className="text-xs text-slate-500">Receive weekly performance summaries</p>
                  </div>
                  <Switch 
                    checked={settings.notifications.weeklyReports}
                    onCheckedChange={(checked) => 
                      setSettings({ 
                        ...settings, 
                        notifications: { ...settings.notifications, weeklyReports: checked } 
                      })
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="send-notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="h-5 w-5" />
                Send Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="notification-message">Message</Label>
                  <Textarea
                    id="notification-message"
                    value={notificationMessage}
                    onChange={(e) => setNotificationMessage(e.target.value)}
                    placeholder="Enter your notification message..."
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="notification-email">Email Address</Label>
                    <Input
                      id="notification-email"
                      type="email"
                      value={notificationEmail}
                      onChange={(e) => setNotificationEmail(e.target.value)}
                      placeholder="recipient@example.com"
                    />
                  </div>

                  <div>
                    <Label htmlFor="notification-phone">Phone Number</Label>
                    <Input
                      id="notification-phone"
                      value={notificationPhone}
                      onChange={(e) => setNotificationPhone(e.target.value)}
                      placeholder="+213 XX XXX XXXX"
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button 
                    onClick={handleSendNotification}
                    disabled={loading || (!notificationMessage.trim() || (!notificationEmail.trim() && !notificationPhone.trim()))}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {loading ? (
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="mr-2 h-4 w-4" />
                    )}
                    Send Notification
                  </Button>
                  
                  <Button 
                    variant="outline"
                    onClick={() => {
                      setNotificationMessage("")
                      setNotificationEmail("")
                      setNotificationPhone("")
                    }}
                  >
                    Clear
                  </Button>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Quick Templates</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setNotificationMessage("New order has been created and requires your attention.")}
                  >
                    Order Alert
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setNotificationMessage("System maintenance scheduled for tonight at 2 AM.")}
                  >
                    System Maintenance
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setNotificationMessage("Weekly report is now available for review.")}
                  >
                    Weekly Report
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setNotificationMessage("Important meeting scheduled for tomorrow at 10 AM.")}
                  >
                    Meeting Reminder
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Theme & Display
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Theme</Label>
                  <Select
                    value={settings.appearance.theme}
                    onValueChange={(value) => 
                      setSettings({ 
                        ...settings, 
                        appearance: { ...settings.appearance, theme: value as any } 
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">
                        <div className="flex items-center gap-2">
                          <Sun className="h-4 w-4" />
                          Light
                        </div>
                      </SelectItem>
                      <SelectItem value="dark">
                        <div className="flex items-center gap-2">
                          <Moon className="h-4 w-4" />
                          Dark
                        </div>
                      </SelectItem>
                      <SelectItem value="system">
                        <div className="flex items-center gap-2">
                          <Monitor className="h-4 w-4" />
                          System
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Font Size</Label>
                  <Select
                    value={settings.appearance.fontSize}
                    onValueChange={(value) => 
                      setSettings({ 
                        ...settings, 
                        appearance: { ...settings.appearance, fontSize: value } 
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small">Small</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="large">Large</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Compact Mode</Label>
                    <p className="text-xs text-slate-500">Reduce spacing for more content</p>
                  </div>
                  <Switch 
                    checked={settings.appearance.compactMode}
                    onCheckedChange={(checked) => 
                      setSettings({ 
                        ...settings, 
                        appearance: { ...settings.appearance, compactMode: checked } 
                      })
                    }
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Regional Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Language</Label>
                  <Select
                    value={settings.language}
                    onValueChange={(value) => setSettings({ ...settings, language: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fr">Français</SelectItem>
                      <SelectItem value="ar">العربية</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Timezone (Fixed)</Label>
                  <Select
                    value={settings.timezone}
                    disabled={true}
                  >
                    <SelectTrigger className="bg-gray-50 dark:bg-gray-700">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Africa/Algiers">Algiers (GMT+1)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500 mt-1">
                    Timezone is fixed to Algeria (GMT+1) for all users
                  </p>
                </div>

                <div>
                  <Label>Date Format</Label>
                  <Select
                    value={settings.dateFormat}
                    onValueChange={(value) => setSettings({ ...settings, dateFormat: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                      <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                      <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Currency (Fixed)</Label>
                  <Select
                    value={settings.currency}
                    disabled={true}
                  >
                    <SelectTrigger className="bg-gray-50 dark:bg-gray-700">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DZD">Algerian Dinar (DA)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500 mt-1">
                    Currency is fixed to Algerian Dinar (DA) for all users
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="privacy" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Privacy Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label>Profile Visibility</Label>
                  <Select
                    value={settings.privacy.profileVisibility}
                    onValueChange={(value) => 
                      setSettings({ 
                        ...settings, 
                        privacy: { ...settings.privacy, profileVisibility: value } 
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Public</SelectItem>
                      <SelectItem value="team">Team Only</SelectItem>
                      <SelectItem value="private">Private</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Data Sharing</Label>
                    <p className="text-xs text-slate-500">Allow sharing data for analytics</p>
                  </div>
                  <Switch 
                    checked={settings.privacy.dataSharing}
                    onCheckedChange={(checked) => 
                      setSettings({ 
                        ...settings, 
                        privacy: { ...settings.privacy, dataSharing: checked } 
                      })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Analytics</Label>
                    <p className="text-xs text-slate-500">Help improve the system with usage analytics</p>
                  </div>
                  <Switch 
                    checked={settings.privacy.analytics}
                    onCheckedChange={(checked) => 
                      setSettings({ 
                        ...settings, 
                        privacy: { ...settings.privacy, analytics: checked } 
                      })
                    }
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Button variant="outline" size="sm" className="w-full">
                  <Download className="mr-2 h-4 w-4" />
                  Download My Data
                </Button>
                <Button variant="outline" size="sm" className="w-full">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Request Data Deletion
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* System Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Server className="h-5 w-5" />
                  System Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Version</span>
                  <Badge variant="outline">{systemInfo.version}</Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm">Build Date</span>
                  <span className="text-xs text-slate-500">{systemInfo.buildDate}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm">Uptime</span>
                  <span className="text-xs text-slate-500">{systemInfo.uptime}</span>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">CPU Usage</span>
                    <span className="text-xs text-slate-500">{systemInfo.server.cpu}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Memory Usage</span>
                    <span className="text-xs text-slate-500">{systemInfo.server.memory}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Disk Usage</span>
                    <span className="text-xs text-slate-500">{systemInfo.server.disk}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Database Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Database Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Status</span>
                  <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    {systemInfo.database.status}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm">Size</span>
                  <span className="text-xs text-slate-500">{systemInfo.database.size}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm">Last Backup</span>
                  <span className="text-xs text-slate-500">
                    {format(new Date(systemInfo.database.lastBackup), 'MMM dd, HH:mm')}
                  </span>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Button variant="outline" size="sm" className="w-full">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Refresh Status
                  </Button>
                  <Button variant="outline" size="sm" className="w-full">
                    <Download className="mr-2 h-4 w-4" />
                    Backup Now
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Data Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HardDrive className="h-5 w-5" />
                Data Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Backup & Export */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white">Backup & Export</h4>
                  <div className="space-y-2">
                    <Button 
                      onClick={handleDataBackup}
                      disabled={loading}
                      className="w-full justify-start"
                      variant="outline"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download Data Backup
                    </Button>
                    <Button 
                      onClick={handleExportLogs}
                      disabled={loading}
                      className="w-full justify-start"
                      variant="outline"
                    >
                      <Activity className="mr-2 h-4 w-4" />
                      Export Activity Logs
                    </Button>
                    <Button 
                      onClick={handleExportFullReport}
                      disabled={loading}
                      className="w-full justify-start"
                      variant="outline"
                    >
                      <Database className="mr-2 h-4 w-4" />
                      Export Full Report
                    </Button>
                  </div>
                </div>

                {/* Data Control */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white">Data Control</h4>
                  <div className="space-y-2">
                    <Button 
                      onClick={handleDataDeletionRequest}
                      disabled={loading}
                      className="w-full justify-start"
                      variant="destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Request Data Deletion
                    </Button>
                    <Alert className="border-orange-200 bg-orange-50 dark:bg-orange-900/20">
                      <AlertTriangle className="h-4 w-4 text-orange-600" />
                      <AlertDescription className="text-orange-800 dark:text-orange-200">
                        Data deletion requests are processed within 48 hours and cannot be undone.
                      </AlertDescription>
                    </Alert>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* System Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <SettingsIcon className="h-5 w-5" />
                System Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button variant="outline">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Clear Cache
                </Button>
                <Button variant="outline">
                  <Database className="mr-2 h-4 w-4" />
                  Optimize Database
                </Button>
                <Button variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Export Logs
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default withAuth(SettingsPage)
