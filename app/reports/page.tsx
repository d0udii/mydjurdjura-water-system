"use client"

import React, { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
} from "recharts"
import { 
  Download, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Package, 
  DollarSign, 
  MapPin, 
  Calendar,
  Filter,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  Target,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle
} from "lucide-react"
import { useDataStore } from "@/lib/supabase-data-store"
import { format } from "date-fns"
import { ExportButton } from "@/components/export-utils"
import { AdvancedAnalytics } from "@/components/advanced-analytics"
import {
  AnimatedDiv,
  FloatingElement,
  GradientText,
  GlowEffect,
  RevealOnScroll,
  RevealTableRow,
  ShakeElement
} from "@/components/animations"

interface ReportData {
  totalOrders: number
  totalRevenue: number
  totalClients: number
  totalUsers: number
  ordersByStatus: Record<string, number>
  revenueByRegion: Array<{ region: string; revenue: number; orders: number }>
  ordersByMonth: Array<{ month: string; orders: number; revenue: number }>
  topClients: Array<{ name: string; orders: number; revenue: number }>
  userActivity: Array<{ role: string; count: number; active: number }>
  deliveryPerformance: Array<{ city: string; delivered: number; pending: number; delayed: number }>
  revenueGrowth: number
  orderGrowth: number
  clientGrowth: number
}

function ReportsPage() {
  const { user } = useAuth()
  const { orders, clients, supervisors, refreshData } = useDataStore()
  const [data, setData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState("30")
  const [chartType, setChartType] = useState("bar")
  const [filters, setFilters] = useState({
    client: "all",
    supervisor: "all", 
    city: "all",
    dateRange: "30",
    status: "all",
    region: "all"
  })
  const [regions, setRegions] = useState<any[]>([])
  const [statuses] = useState([
    { value: "all", label: "All Statuses" },
    { value: "pending", label: "Pending" },
    { value: "processing", label: "Processing" },
    { value: "in_transit", label: "In Transit" },
    { value: "delivered", label: "Delivered" },
    { value: "cancelled", label: "Cancelled" }
  ])

  // Load saved filters from localStorage on component mount
  useEffect(() => {
    const savedFilters = localStorage.getItem('reports-filters')
    const savedChartType = localStorage.getItem('reports-chart-type')
    const savedDateRange = localStorage.getItem('reports-date-range')
    
    if (savedFilters) {
      setFilters(JSON.parse(savedFilters))
    }
    if (savedChartType) {
      setChartType(savedChartType)
    }
    if (savedDateRange) {
      setDateRange(savedDateRange)
    }
  }, [])

  // Save filters to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('reports-filters', JSON.stringify(filters))
  }, [filters])

  useEffect(() => {
    localStorage.setItem('reports-chart-type', chartType)
  }, [chartType])

  useEffect(() => {
    localStorage.setItem('reports-date-range', dateRange)
  }, [dateRange])

  useEffect(() => {
    fetchReportData()
    fetchFilterData()
    
    // Set up real-time updates every 10 seconds
    const interval = setInterval(() => {
      fetchReportData()
    }, 10000)
    
    return () => clearInterval(interval)
  }, [dateRange, filters])

  const handleFilterChange = (filterType: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }))
  }

  const clearFilters = () => {
    setFilters({
      client: "all",
      supervisor: "all", 
      city: "all",
      dateRange: "30",
      status: "all",
      region: "all"
    })
  }

  const fetchFilterData = async () => {
    try {
      // Use data from shared store for clients and supervisors
      // Fetch regions from clients API
      const clientsRes = await fetch('/api/clients')
      if (clientsRes.ok) {
        const clientsData = await clientsRes.json()
        setRegions(clientsData.regions || [])
      }
    } catch (error) {
      console.error('Error fetching filter data:', error)
    }
  }

  // Calculate report data from filtered orders
  const calculateReportData = (filteredOrders: any[], clients: any[], supervisors: any[], regions: any[]): ReportData => {
    const totalOrders = filteredOrders.length
    const totalRevenue = filteredOrders.reduce((sum, order) => sum + (order.total_price || 0), 0)
    const totalClients = clients.length
    const totalUsers = supervisors.length

    // Orders by status
    const ordersByStatus = filteredOrders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // Revenue by region
    const revenueByRegion = regions.map(region => {
      const regionOrders = filteredOrders.filter(order => order.region_id === region.id)
      return {
        region: region.name,
        revenue: regionOrders.reduce((sum, order) => sum + (order.total_price || 0), 0),
        orders: regionOrders.length
      }
    })

    // Orders by month (last 6 months)
    const ordersByMonth = []
    for (let i = 5; i >= 0; i--) {
      const date = new Date()
      date.setMonth(date.getMonth() - i)
      const monthName = date.toLocaleDateString('en-US', { month: 'short' })
      
      const monthOrders = filteredOrders.filter(order => {
        const orderDate = new Date(order.created_at)
        return orderDate.getMonth() === date.getMonth() && orderDate.getFullYear() === date.getFullYear()
      })
      
      ordersByMonth.push({
        month: monthName,
        orders: monthOrders.length,
        revenue: monthOrders.reduce((sum, order) => sum + (order.total_price || 0), 0)
      })
    }

    // Top clients
    const clientOrders = filteredOrders.reduce((acc, order) => {
      const client = clients.find(c => c.id === order.client_id)
      if (client) {
        if (!acc[client.id]) {
          acc[client.id] = { name: client.name, orders: 0, revenue: 0 }
        }
        acc[client.id].orders += 1
        acc[client.id].revenue += order.total_price || 0
      }
      return acc
    }, {} as Record<string, any>)

    const topClients = Object.values(clientOrders)
      .sort((a: any, b: any) => b.revenue - a.revenue)
      .slice(0, 5)

    // User activity
    const userActivity = supervisors.map(supervisor => ({
      role: supervisor.role || 'Supervisor',
      count: 1,
      active: 1
    }))

    // Delivery performance by city
    const deliveryPerformance = clients.map(client => {
      const clientOrders = filteredOrders.filter(order => order.client_id === client.id)
      const city = client.address?.split(',')[1]?.trim() || client.address?.split(',')[0]?.trim() || 'Unknown'
      
      return {
        city,
        delivered: clientOrders.filter(o => o.status === 'delivered').length,
        pending: clientOrders.filter(o => o.status === 'pending').length,
        delayed: clientOrders.filter(o => o.status === 'cancelled').length
      }
    })

    // Growth calculations (mock for now)
    const revenueGrowth = 15.2
    const orderGrowth = 12.8
    const clientGrowth = 8.5

    return {
      totalOrders,
      totalRevenue,
      totalClients,
      totalUsers,
      ordersByStatus,
      revenueByRegion,
      ordersByMonth,
      topClients,
      userActivity,
      deliveryPerformance,
      revenueGrowth,
      orderGrowth,
      clientGrowth
    }
  }

  const fetchReportData = async () => {
    try {
      setLoading(true)
      
      // Use orders from shared data store, filtered by parameters
      let filteredOrders = orders
      
      // Apply filters to the orders
      if (filters.client !== "all") {
        filteredOrders = filteredOrders.filter(order => order.client_id === filters.client)
      }
      if (filters.supervisor !== "all") {
        filteredOrders = filteredOrders.filter(order => order.assigned_to === filters.supervisor)
      }
      if (filters.city !== "all") {
        filteredOrders = filteredOrders.filter(order => 
          order.clients?.address?.toLowerCase().includes(filters.city.toLowerCase())
        )
      }
      if (filters.status !== "all") {
        filteredOrders = filteredOrders.filter(order => order.status === filters.status)
      }
      if (filters.region !== "all") {
        filteredOrders = filteredOrders.filter(order => order.region_id === filters.region)
      }
      if (filters.dateRange !== "all") {
        const daysAgo = new Date()
        daysAgo.setDate(daysAgo.getDate() - parseInt(filters.dateRange))
        filteredOrders = filteredOrders.filter(order => 
          new Date(order.created_at) >= daysAgo
        )
      }
      
      // Calculate report data from filtered orders
      const reportData = calculateReportData(filteredOrders, clients, supervisors, regions)
      setData(reportData)
      
    } catch (error) {
      console.error('Error fetching report data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleExportPDF = () => {
    alert("PDF export functionality would be implemented with a library like jsPDF")
  }

  const handleExportExcel = () => {
    alert("Excel export functionality would be implemented with a library like xlsx")
  }

  const handleExportCSV = () => {
    alert("CSV export functionality would be implemented")
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "in_progress":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      case "approved":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
      case "returned":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      default:
        return "bg-slate-100 text-slate-800"
    }
  }

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4']

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
          <h1 className="text-3xl font-bold">Reports & Analytics</h1>
          <p className="text-slate-600 dark:text-slate-400">
            Comprehensive insights into system performance and business metrics
          </p>
        </div>
        
        <div className="flex flex-col md:flex-row gap-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="365">Last year</SelectItem>
            </SelectContent>
          </Select>
          
          <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportPDF}>
            <Download className="mr-2 h-4 w-4" />
              PDF
          </Button>
          <Button variant="outline" onClick={handleExportExcel}>
            <Download className="mr-2 h-4 w-4" />
              Excel
            </Button>
            <Button variant="outline" onClick={handleExportCSV}>
              <Download className="mr-2 h-4 w-4" />
              CSV
          </Button>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <Package className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.totalOrders}</div>
            <div className="flex items-center text-xs text-green-600">
              <TrendingUp className="h-3 w-3 mr-1" />
              +{data?.orderGrowth}% from last period
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(data?.totalRevenue || 0).toLocaleString()} DA</div>
            <div className="flex items-center text-xs text-green-600">
              <TrendingUp className="h-3 w-3 mr-1" />
              +{data?.revenueGrowth}% from last period
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Clients</CardTitle>
            <Users className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.totalClients}</div>
            <div className="flex items-center text-xs text-green-600">
              <TrendingUp className="h-3 w-3 mr-1" />
              +{data?.clientGrowth}% from last period
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Users</CardTitle>
            <Users className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.totalUsers}</div>
            <div className="flex items-center text-xs text-slate-500">
              <Activity className="h-3 w-3 mr-1" />
              Active users
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="clients">Clients</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        {/* Filter Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-blue-600" />
              Filter Reports
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                  Filter by Client
                </label>
                <Select value={filters.client} onValueChange={(value) => handleFilterChange('client', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Clients" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Clients</SelectItem>
                    {clients.map(client => (
                      <SelectItem key={client.id} value={client.id}>{client.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                  Filter by Supervisor
                </label>
                <Select value={filters.supervisor} onValueChange={(value) => handleFilterChange('supervisor', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Supervisors" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Supervisors</SelectItem>
                    {supervisors.map(supervisor => (
                      <SelectItem key={supervisor.id} value={supervisor.id}>{supervisor.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                  Filter by Region
                </label>
                <Select value={filters.region} onValueChange={(value) => handleFilterChange('region', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Regions" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Regions</SelectItem>
                    {regions.map(region => (
                      <SelectItem key={region.id} value={region.id}>{region.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                  Filter by Status
                </label>
                <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    {statuses.map(status => (
                      <SelectItem key={status.value} value={status.value}>{status.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                  Filter by City
                </label>
                <Select value={filters.city} onValueChange={(value) => handleFilterChange('city', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Cities" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Cities</SelectItem>
                    <SelectItem value="Biskra">Biskra</SelectItem>
                    <SelectItem value="Ouled Djellal">Ouled Djellal</SelectItem>
                    <SelectItem value="Oued Souf">Oued Souf</SelectItem>
                    <SelectItem value="El Mghair">El Mghair</SelectItem>
                    <SelectItem value="Tolga">Tolga</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                  Date Range
                </label>
                <Select value={filters.dateRange} onValueChange={(value) => handleFilterChange('dateRange', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Last 30 days" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">Last 7 days</SelectItem>
                    <SelectItem value="30">Last 30 days</SelectItem>
                    <SelectItem value="90">Last 90 days</SelectItem>
                    <SelectItem value="365">Last year</SelectItem>
                    <SelectItem value="all">All time</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" size="sm" onClick={clearFilters}>
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        <TabsContent value="analytics" className="space-y-6">
          <AdvancedAnalytics />
        </TabsContent>

        <TabsContent value="overview" className="space-y-6">
          {/* Orders by Status */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Orders by Status
                  </CardTitle>
                  <Select value={chartType} onValueChange={setChartType}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bar">Bar Chart</SelectItem>
                      <SelectItem value="pie">Pie Chart</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  {chartType === "bar" ? (
                    <BarChart data={Object.entries(data?.ordersByStatus || {}).map(([status, count]) => ({ status, count }))}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="status" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#3b82f6" />
                    </BarChart>
                  ) : (
                    <PieChart>
                      <Pie
                        data={Object.entries(data?.ordersByStatus || {}).map(([status, count]) => ({ status, count }))}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ status, count }) => `${status}: ${count}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                      >
                        {Object.entries(data?.ordersByStatus || {}).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  )}
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Revenue Trend
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={data?.ordersByMonth || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="revenue" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Revenue by Region */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Revenue by Region
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data?.revenueByRegion || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="region" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="revenue" fill="#3b82f6" name="Revenue (DA)" />
                  <Bar dataKey="orders" fill="#10b981" name="Orders" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders" className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
                <CardTitle>Order Status Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={Object.entries(data?.ordersByStatus || {}).map(([status, count]) => ({ status, count }))}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ status, count }) => `${status}: ${count}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {Object.entries(data?.ordersByStatus || {}).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Orders Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={data?.ordersByMonth || []}>
                <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                    <Line type="monotone" dataKey="orders" stroke="#3b82f6" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Order Status Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Status</TableHead>
                      <TableHead>Count</TableHead>
                      <TableHead>Percentage</TableHead>
                      <TableHead>Trend</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Object.entries(data?.ordersByStatus || {}).map(([status, count]) => (
                      <TableRow key={status}>
                        <TableCell>
                          <Badge className={getStatusColor(status)}>
                            {status.replace("_", " ").toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-semibold">{count}</TableCell>
                        <TableCell>
                          {((count / (data?.totalOrders || 1)) * 100).toFixed(1)}%
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center text-green-600">
                            <TrendingUp className="h-4 w-4 mr-1" />
                            <span className="text-sm">+5.2%</span>
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

        <TabsContent value="revenue" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue by Region</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data?.revenueByRegion || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="region" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${value.toLocaleString()} DA`, 'Revenue']} />
                    <Bar dataKey="revenue" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data?.ordersByMonth || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                    <Tooltip formatter={(value) => [`${value.toLocaleString()} DA`, 'Revenue']} />
                    <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
              <CardTitle>Top Performing Clients</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Client Name</TableHead>
                      <TableHead>Orders</TableHead>
                      <TableHead>Revenue</TableHead>
                      <TableHead>Avg Order Value</TableHead>
                      <TableHead>Performance</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data?.topClients.map((client, index) => (
                      <TableRow key={client.name}>
                        <TableCell className="font-medium">{client.name}</TableCell>
                        <TableCell>{client.orders}</TableCell>
                        <TableCell className="font-semibold">{client.revenue.toLocaleString()} DA</TableCell>
                        <TableCell>{(client.revenue / client.orders).toLocaleString()} DA</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Target className="h-4 w-4 mr-1 text-green-600" />
                            <span className="text-sm text-green-600">Top {index + 1}</span>
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

        <TabsContent value="clients" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Client Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={data?.topClients.map(client => ({ name: client.name, revenue: client.revenue })) || []}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, revenue }) => `${name}: ${revenue.toLocaleString()} DA`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="revenue"
                    >
                      {data?.topClients.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value.toLocaleString()} DA`, 'Revenue']} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Client Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <ScatterChart data={data?.topClients || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="orders" name="Orders" />
                    <YAxis dataKey="revenue" name="Revenue" />
                    <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                    <Scatter dataKey="revenue" fill="#3b82f6" />
                  </ScatterChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Client Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{data?.totalClients}</div>
                  <div className="text-sm text-blue-600">Total Clients</div>
                </div>
                <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {data?.topClients.reduce((sum, client) => sum + client.orders, 0)}
                  </div>
                  <div className="text-sm text-green-600">Total Orders</div>
                </div>
                <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {(data?.topClients.reduce((sum, client) => sum + client.revenue, 0) || 0).toLocaleString()} DA
                  </div>
                  <div className="text-sm text-purple-600">Total Revenue</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Delivery Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data?.deliveryPerformance || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="city" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="delivered" stackId="a" fill="#10b981" name="Delivered" />
                    <Bar dataKey="pending" stackId="a" fill="#f59e0b" name="Pending" />
                    <Bar dataKey="delayed" stackId="a" fill="#ef4444" name="Delayed" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>User Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data?.userActivity || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="role" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" fill="#3b82f6" name="Total Users" />
                    <Bar dataKey="active" fill="#10b981" name="Active Users" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <div className="text-xl font-bold text-green-600">94.2%</div>
                  <div className="text-sm text-green-600">Delivery Success Rate</div>
                </div>
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <Clock className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <div className="text-xl font-bold text-blue-600">2.3 days</div>
                  <div className="text-sm text-blue-600">Avg Delivery Time</div>
                </div>
                <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <Users className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <div className="text-xl font-bold text-purple-600">91.7%</div>
                  <div className="text-sm text-purple-600">User Satisfaction</div>
                </div>
                <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                  <TrendingUp className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                  <div className="text-xl font-bold text-orange-600">+12.5%</div>
                  <div className="text-sm text-orange-600">Growth Rate</div>
                </div>
          </div>
        </CardContent>
      </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default withAuth(ReportsPage)
