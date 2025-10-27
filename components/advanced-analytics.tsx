"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts'
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Package, 
  Users, 
  Truck,
  Calendar,
  Download,
  Filter,
  RefreshCw
} from "lucide-react"
import { ExportButton } from "@/components/export-utils"

interface AnalyticsData {
  orders: any[]
  clients: any[]
  regions: any[]
  timeRange: string
  metrics: {
    totalRevenue: number
    totalOrders: number
    avgOrderValue: number
    deliveryRate: number
    growthRate: number
    topClients: any[]
    regionalPerformance: any[]
    monthlyTrends: any[]
    productMix: any[]
  }
}

interface AdvancedAnalyticsProps {
  className?: string
}

export const AdvancedAnalytics: React.FC<AdvancedAnalyticsProps> = ({ className }) => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('30d')
  const [selectedMetric, setSelectedMetric] = useState('revenue')

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true)
      
      // Fetch orders data
      const ordersResponse = await fetch('/api/orders')
      const ordersData = await ordersResponse.json()
      
      // Fetch clients data
      const clientsResponse = await fetch('/api/clients')
      const clientsData = await clientsResponse.json()
      
      // Fetch regions data
      const regionsResponse = await fetch('/api/transport')
      const regionsData = await regionsResponse.json()

      const orders = ordersData.orders || []
      const clients = clientsData.clients || []
      const regions = regionsData.tariffs || []

      // Calculate metrics
      const totalRevenue = orders.reduce((sum: number, order: any) => sum + (order.total_price || 0), 0)
      const totalOrders = orders.length
      const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0
      const deliveredOrders = orders.filter((o: any) => o.status === 'delivered').length
      const deliveryRate = totalOrders > 0 ? (deliveredOrders / totalOrders) * 100 : 0

      // Calculate growth rate (simplified - comparing current period to previous)
      const currentPeriodOrders = orders.filter((o: any) => {
        const orderDate = new Date(o.created_at)
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
        return orderDate >= thirtyDaysAgo
      }).length

      const previousPeriodOrders = orders.filter((o: any) => {
        const orderDate = new Date(o.created_at)
        const sixtyDaysAgo = new Date()
        sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60)
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
        return orderDate >= sixtyDaysAgo && orderDate < thirtyDaysAgo
      }).length

      const growthRate = previousPeriodOrders > 0 
        ? ((currentPeriodOrders - previousPeriodOrders) / previousPeriodOrders) * 100 
        : 0

      // Top clients by revenue
      const clientRevenue = clients.map(client => {
        const clientOrders = orders.filter((o: any) => o.client_id === client.id)
        const revenue = clientOrders.reduce((sum: number, order: any) => sum + (order.total_price || 0), 0)
        return {
          ...client,
          revenue,
          orderCount: clientOrders.length
        }
      }).sort((a, b) => b.revenue - a.revenue).slice(0, 5)

      // Regional performance
      const regionalPerformance = regions.map(region => {
        const regionOrders = orders.filter((o: any) => 
          o.regions?.name?.toLowerCase().includes(region.city.toLowerCase()) ||
          region.city.toLowerCase().includes(o.regions?.name?.toLowerCase())
        )
        const revenue = regionOrders.reduce((sum: number, order: any) => sum + (order.total_price || 0), 0)
        return {
          region: region.city,
          revenue,
          orderCount: regionOrders.length,
          avgOrderValue: regionOrders.length > 0 ? revenue / regionOrders.length : 0
        }
      })

      // Monthly trends (last 6 months)
      const monthlyTrends = []
      for (let i = 5; i >= 0; i--) {
        const date = new Date()
        date.setMonth(date.getMonth() - i)
        const monthStart = new Date(date.getFullYear(), date.getMonth(), 1)
        const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0)
        
        const monthOrders = orders.filter((o: any) => {
          const orderDate = new Date(o.created_at)
          return orderDate >= monthStart && orderDate <= monthEnd
        })
        
        const monthRevenue = monthOrders.reduce((sum: number, order: any) => sum + (order.total_price || 0), 0)
        
        monthlyTrends.push({
          month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          revenue: monthRevenue,
          orders: monthOrders.length,
          avgOrderValue: monthOrders.length > 0 ? monthRevenue / monthOrders.length : 0
        })
      }

      // Product mix analysis
      const productMix = [
        {
          name: '5.5L Bottles',
          value: orders.reduce((sum: number, order: any) => sum + (order.product_5_5L_pallets || 0), 0),
          revenue: orders.reduce((sum: number, order: any) => sum + ((order.product_5_5L_pallets || 0) * 212 * 65), 0)
        },
        {
          name: '1.5L Bottles',
          value: orders.reduce((sum: number, order: any) => sum + (order.product_1_5L_pallets || 0), 0),
          revenue: orders.reduce((sum: number, order: any) => sum + ((order.product_1_5L_pallets || 0) * 112 * 178.5), 0)
        }
      ]

      setAnalyticsData({
        orders,
        clients,
        regions,
        timeRange,
        metrics: {
          totalRevenue,
          totalOrders,
          avgOrderValue,
          deliveryRate,
          growthRate,
          topClients: clientRevenue,
          regionalPerformance,
          monthlyTrends,
          productMix
        }
      })
    } catch (error) {
      console.error('Error fetching analytics data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAnalyticsData()
    
    // Refresh data every 5 minutes
    const interval = setInterval(fetchAnalyticsData, 300000)
    
    return () => clearInterval(interval)
  }, [timeRange])

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (!analyticsData) {
    return (
      <Card className="p-8 text-center">
        <CardContent>
          <p className="text-gray-500">No analytics data available</p>
        </CardContent>
      </Card>
    )
  }

  const { metrics } = analyticsData

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={selectedMetric} onValueChange={setSelectedMetric}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="revenue">Revenue</SelectItem>
              <SelectItem value="orders">Orders</SelectItem>
              <SelectItem value="avgOrderValue">Avg Order Value</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchAnalyticsData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <ExportButton type="analytics" className="bg-blue-600 hover:bg-blue-700" />
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {metrics.totalRevenue.toLocaleString()} DA
            </div>
            <div className="flex items-center text-xs text-gray-500 mt-1">
              {metrics.growthRate > 0 ? (
                <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
              )}
              {Math.abs(metrics.growthRate).toFixed(1)}% vs previous period
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <Package className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {metrics.totalOrders}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {metrics.deliveryRate.toFixed(1)}% delivery rate
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
            <Users className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {metrics.avgOrderValue.toLocaleString()} DA
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Per order average
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Delivery Rate</CardTitle>
            <Truck className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {metrics.deliveryRate.toFixed(1)}%
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Successfully delivered
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trends */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              Monthly Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={metrics.monthlyTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip 
                  formatter={(value: any, name: string) => [
                    name === 'revenue' ? `${value.toLocaleString()} DA` : value,
                    name === 'revenue' ? 'Revenue' : name === 'orders' ? 'Orders' : 'Avg Order Value'
                  ]}
                />
                <Area 
                  type="monotone" 
                  dataKey={selectedMetric === 'revenue' ? 'revenue' : selectedMetric === 'orders' ? 'orders' : 'avgOrderValue'} 
                  stroke="#3b82f6" 
                  fill="#3b82f6" 
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Regional Performance */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5 text-green-600" />
              Regional Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={metrics.regionalPerformance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="region" />
                <YAxis />
                <Tooltip 
                  formatter={(value: any, name: string) => [
                    name === 'revenue' ? `${value.toLocaleString()} DA` : value,
                    name === 'revenue' ? 'Revenue' : name === 'orderCount' ? 'Orders' : 'Avg Order Value'
                  ]}
                />
                <Bar dataKey="revenue" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Clients */}
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-purple-600" />
            Top Clients by Revenue
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {metrics.topClients.map((client, index) => (
              <div key={client.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <Badge variant="secondary" className="w-8 h-8 rounded-full flex items-center justify-center">
                    {index + 1}
                  </Badge>
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {client.name}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {client.orderCount} orders
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-gray-900 dark:text-white">
                    {client.revenue.toLocaleString()} DA
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {((client.revenue / metrics.totalRevenue) * 100).toFixed(1)}% of total
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Product Mix */}
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-orange-600" />
            Product Mix Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-4">Revenue Distribution</h4>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={metrics.productMix}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="revenue"
                  >
                    {metrics.productMix.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any) => [`${value.toLocaleString()} DA`, 'Revenue']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div>
              <h4 className="font-medium mb-4">Volume Distribution</h4>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={metrics.productMix}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {metrics.productMix.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any) => [`${value} pallets`, 'Volume']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
