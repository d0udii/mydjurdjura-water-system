"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts"
import { ShoppingCart, TrendingUp, Users, Truck, ArrowRight, UserCheck, Building, Phone, Clock, CheckCircle, AlertCircle } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/lib/auth"
import { withAuth } from "@/lib/auth"
import { LoadingSpinner, LoadingCard } from "@/components/ui/loading"
import {
  AnimatedDiv,
  FloatingElement,
  GradientText,
  GlowEffect,
  RevealOnScroll,
  RevealTableRow,
  ShakeElement
} from "@/components/animations"

interface OrderStats {
  totalOrders: number
  pendingOrders: number
  inProgressOrders: number
  deliveredOrders: number
  totalRevenue: number
}

interface Client {
  id: string
  name: string
  phone: string
  address: string
  contact_person?: string
  status: string
}

interface Order {
  id: string
  client_id: string
  status: string
  total_price: number
  created_at: string
  clients?: {
    name: string
    phone: string
    address: string
  }
  regions?: {
    name: string
    responsible: string
  }
}

// Recent Orders List Component
function RecentOrdersList() {
  const [recentOrders, setRecentOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRecentOrders()
    
    // Set up real-time updates every 5 seconds
    const interval = setInterval(() => {
      fetchRecentOrders()
    }, 5000)
    
    return () => clearInterval(interval)
  }, [])

  const fetchRecentOrders = async () => {
    try {
      const response = await fetch('/api/orders')
      if (response.ok) {
        const data = await response.json()
        const orders = data.orders || []
        
        // Get the 5 most recent orders
        const recent = orders
          .sort((a: Order, b: Order) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, 5)
        
        setRecentOrders(recent)
      }
    } catch (error) {
      console.error('Error fetching recent orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />
      case 'processing':
      case 'in_progress':
        return <AlertCircle className="h-4 w-4 text-blue-500" />
      case 'delivered':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'cancelled':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'processing':
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'delivered':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  if (loading) {
    return <LoadingCard count={3} />
  }

  if (recentOrders.length === 0) {
    return (
      <div className="text-center py-8">
        <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500 dark:text-gray-400">No orders found</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {recentOrders.map((order, index) => (
        <div 
          key={order.id} 
          className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md hover:scale-[1.02] transition-all duration-300 ease-out"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              {getStatusIcon(order.status)}
              <div>
                <div className="font-medium text-gray-900 dark:text-white text-sm">
                  {order.id}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {order.clients?.name || 'Unknown Client'}
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="font-semibold text-gray-900 dark:text-white text-sm">
                {order.total_price.toLocaleString()} DA
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {new Date(order.created_at).toLocaleDateString()}
              </div>
            </div>
            
            <Badge className={getStatusColor(order.status)}>
              {order.status}
            </Badge>
          </div>
        </div>
      ))}
    </div>
  )
}

function DashboardPage() {
  const { user } = useAuth()
  const [stats, setStats] = useState<OrderStats | null>(null)
  const [assignedClients, setAssignedClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
    
    // Set up real-time updates every 10 seconds
    const interval = setInterval(() => {
      fetchStats()
    }, 10000)
    
    return () => clearInterval(interval)
  }, [])

  const fetchStats = async () => {
    try {
      // Fetch real-time order data from API
      const response = await fetch('/api/orders')
      if (response.ok) {
        const data = await response.json()
        const orders = data.orders || []
        
        // Calculate comprehensive stats
        const orderStats = {
          totalOrders: orders.length,
          pendingOrders: orders.filter((o: any) => o.status === 'pending').length,
          inProgressOrders: orders.filter((o: any) => o.status === 'processing' || o.status === 'in_progress').length,
          deliveredOrders: orders.filter((o: any) => o.status === 'delivered').length,
          cancelledOrders: orders.filter((o: any) => o.status === 'cancelled').length,
          totalRevenue: orders.reduce((sum: number, o: any) => sum + (o.total_price || 0), 0)
        }
        
        setStats(orderStats)
      }

      // Fetch assigned clients for supervisors
      if (user?.role === "supervisor") {
        const clientsResponse = await fetch(`/api/clients?supervisor_id=${user.id}`)
        if (clientsResponse.ok) {
          const clientsData = await clientsResponse.json()
          setAssignedClients(clientsData.clients || [])
        }
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Loading Dashboard</h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Preparing your data...</p>
          </div>
        </div>
      </div>
    )
  }

  const chartData = stats
    ? [
        { name: "Pending", value: stats.pendingOrders },
        { name: "In Progress", value: stats.inProgressOrders },
        { name: "Delivered", value: stats.deliveredOrders },
      ]
    : []

  const COLORS = ["#fbbf24", "#60a5fa", "#34d399"]

  const getRoleBasedTitle = () => {
    switch (user?.role) {
      case 'admin':
        return 'Admin Dashboard'
      case 'regional_manager':
        return 'Regional Manager Dashboard'
      case 'supervisor':
        return 'Supervisor Dashboard'
      case 'operations':
        return 'Operations Dashboard'
      default:
        return 'Dashboard'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900">
      <div className="p-4 md:p-8 space-y-8">
        {/* Enhanced Header */}
        <RevealOnScroll direction="down" delay={0.1}>
          <div className="text-center space-y-4">
            <GradientText gradient="blue-purple" className="text-4xl md:text-6xl font-bold">
              {getRoleBasedTitle()}
            </GradientText>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Welcome back, <span className="font-semibold text-blue-600 dark:text-blue-400">{user?.name}</span>
            </p>
          </div>
        </RevealOnScroll>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <RevealOnScroll direction="left" delay={0.2}>
            <GlowEffect color="blue" intensity="medium">
              <Card className="hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                  <FloatingElement intensity="medium">
                    <ShoppingCart className="h-5 w-5 text-blue-500" />
                  </FloatingElement>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-600">{stats?.totalOrders || 0}</div>
                  <p className="text-xs text-gray-500">All time</p>
                </CardContent>
              </Card>
            </GlowEffect>
          </RevealOnScroll>

          <RevealOnScroll direction="left" delay={0.3}>
            <GlowEffect color="yellow" intensity="medium">
              <Card className="hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending</CardTitle>
                  <FloatingElement intensity="medium">
                    <TrendingUp className="h-5 w-5 text-yellow-500" />
                  </FloatingElement>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-yellow-600">{stats?.pendingOrders || 0}</div>
                  <p className="text-xs text-gray-500">Awaiting processing</p>
                </CardContent>
              </Card>
            </GlowEffect>
          </RevealOnScroll>

          <RevealOnScroll direction="right" delay={0.4}>
            <GlowEffect color="green" intensity="medium">
              <Card className="hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">In Progress</CardTitle>
                  <FloatingElement intensity="medium">
                    <Truck className="h-5 w-5 text-green-500" />
                  </FloatingElement>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">{stats?.inProgressOrders || 0}</div>
                  <p className="text-xs text-gray-500">Being processed</p>
                </CardContent>
              </Card>
            </GlowEffect>
          </RevealOnScroll>

          <RevealOnScroll direction="right" delay={0.5}>
            <GlowEffect color="purple" intensity="medium">
              <Card className="hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Revenue</CardTitle>
                  <FloatingElement intensity="medium">
                    <Users className="h-5 w-5 text-purple-500" />
                  </FloatingElement>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-purple-600">{(stats?.totalRevenue || 0).toLocaleString()} DA</div>
                  <p className="text-xs text-gray-500">Total sales</p>
                </CardContent>
              </Card>
            </GlowEffect>
          </RevealOnScroll>
        </div>

        {/* Recent Orders Section */}
        <RevealOnScroll direction="up" delay={0.6}>
          <Card className="hover:shadow-xl transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                <ShoppingCart className="h-6 w-6 text-blue-600" />
                Recent Orders
                <div className="ml-auto">
                  <Link href="/orders">
                    <Button variant="outline" size="sm" className="text-blue-600 border-blue-600 hover:bg-blue-50">
                      View All Orders
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </CardTitle>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Latest orders across the system - updates in real-time
              </p>
            </CardHeader>
            <CardContent>
              <RecentOrdersList />
            </CardContent>
          </Card>
        </RevealOnScroll>

        {/* Assigned Clients Section for Supervisors */}
        {user?.role === "supervisor" && assignedClients.length > 0 && (
          <RevealOnScroll direction="up" delay={0.5}>
            <Card className="hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                  <UserCheck className="h-6 w-6 text-blue-600" />
                  Your Assigned Clients ({assignedClients.length})
                </CardTitle>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Clients assigned to you for order management
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {assignedClients.slice(0, 6).map((client) => (
                    <div key={client.id} className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800 hover:shadow-md transition-all duration-200">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">
                            {client.name}
                          </h4>
                          <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                            <div className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {client.phone}
                            </div>
                            <div className="flex items-center gap-1">
                              <Building className="h-3 w-3" />
                              {client.address}
                            </div>
                            {client.contact_person && (
                              <div className="flex items-center gap-1">
                                <UserCheck className="h-3 w-3" />
                                {client.contact_person}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="ml-2">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            client.status === 'active' 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                          }`}>
                            {client.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {assignedClients.length > 6 && (
                  <div className="mt-4 text-center">
                    <Link href="/clients">
                      <Button variant="outline" className="text-blue-600 hover:text-blue-700">
                        View All Clients ({assignedClients.length})
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </RevealOnScroll>
        )}

        {/* Performance Metrics */}
        <RevealOnScroll direction="up" delay={0.6}>
          <Card className="hover:shadow-xl transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                <TrendingUp className="h-6 w-6 text-green-600" />
                Performance Metrics
              </CardTitle>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Key performance indicators and system health
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="text-2xl font-bold text-green-600">
                    {stats ? Math.round((stats.deliveredOrders / stats.totalOrders) * 100) : 0}%
                  </div>
                  <div className="text-sm text-green-700 dark:text-green-300 font-medium">Delivery Rate</div>
                  <div className="text-xs text-green-600 dark:text-green-400 mt-1">
                    {stats?.deliveredOrders || 0} of {stats?.totalOrders || 0} orders
                  </div>
                </div>
                
                <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="text-2xl font-bold text-blue-600">
                    {stats ? Math.round((stats.inProgressOrders / stats.totalOrders) * 100) : 0}%
                  </div>
                  <div className="text-sm text-blue-700 dark:text-blue-300 font-medium">Processing Rate</div>
                  <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                    {stats?.inProgressOrders || 0} orders in progress
                  </div>
                </div>
                
                <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                  <div className="text-2xl font-bold text-purple-600">
                    {stats ? Math.round((stats.totalRevenue / stats.totalOrders) || 0).toLocaleString() : 0}
                  </div>
                  <div className="text-sm text-purple-700 dark:text-purple-300 font-medium">Avg Order Value</div>
                  <div className="text-xs text-purple-600 dark:text-purple-400 mt-1">DA per order</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </RevealOnScroll>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <RevealOnScroll direction="up" delay={0.7}>
            <Card className="hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-xl font-bold">Order Status Distribution</CardTitle>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Visual breakdown of order statuses
                </p>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {COLORS.map((color, index) => (
                        <Cell key={`cell-${index}`} fill={color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </RevealOnScroll>

          <RevealOnScroll direction="up" delay={0.7}>
            <Card className="hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-xl font-bold">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/orders">
                  <Button className="w-full justify-between bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                    <span>View Orders</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                {(user?.role === "supervisor" || user?.role === "regional_manager") && (
                  <Link href="/orders">
                    <Button className="w-full justify-between bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                      <span>Create Order</span>
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                )}
                {user?.role === "admin" && (
                  <>
                    <Link href="/clients">
                      <Button className="w-full justify-between bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                        <span>Manage Clients</span>
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Link href="/users">
                      <Button className="w-full justify-between bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                        <span>Manage Users</span>
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </>
                )}
                <Link href="/reports">
                  <Button className="w-full justify-between bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                    <span>View Reports</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </RevealOnScroll>
        </div>
      </div>
    </div>
  )
}

export default withAuth(DashboardPage)
