"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Eye, Edit2, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface Order {
  id: string
  clientId: string
  supervisorId: string
  productId: string
  pallets: number
  totalQuantity: number
  unitPrice: number
  transportPrice: number
  totalPrice: number
  driverName?: string
  blNumber?: string
  status: string
  createdAt: string
}

interface Client {
  id: string
  name: string
  city: string
}

interface Product {
  id: string
  name: string
  volume: string
  unitsPerPallet: number
  unitPrice: number
}

export default function OrdersPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [isOpen, setIsOpen] = useState(false)
  const [filterStatus, setFilterStatus] = useState("all")
  const [formData, setFormData] = useState({
    clientId: "",
    productId: "",
    pallets: "",
    driverName: "",
  })

  useEffect(() => {
    const token = localStorage.getItem("authToken")
    const userData = localStorage.getItem("user")

    if (!token) {
      router.push("/")
      return
    }

    if (userData) {
      setUser(JSON.parse(userData))
    }

    fetchData()
  }, [router])

  const fetchData = async () => {
    try {
      const [ordersRes, clientsRes, productsRes] = await Promise.all([
        fetch("/api/orders"),
        fetch("/api/clients"),
        fetch("/api/products"),
      ])

      const ordersData = await ordersRes.json()
      const clientsData = await clientsRes.json()
      const productsData = await productsRes.json()

      setOrders(ordersData)
      setClients(clientsData)
      setProducts(productsData)
    } catch (error) {
      console.error("Failed to fetch data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.clientId || !formData.productId || !formData.pallets) {
      alert("Please fill all required fields")
      return
    }

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: formData.clientId,
          supervisorId: user.id,
          productId: formData.productId,
          pallets: Number.parseInt(formData.pallets),
          driverName: formData.driverName,
        }),
      })

      if (response.ok) {
        fetchData()
        setIsOpen(false)
        setFormData({ clientId: "", productId: "", pallets: "", driverName: "" })
      }
    } catch (error) {
      console.error("Failed to create order:", error)
    }
  }

  const handleDeleteOrder = async (id: string) => {
    if (!confirm("Are you sure?")) return

    try {
      await fetch(`/api/orders/${id}`, { method: "DELETE" })
      fetchData()
    } catch (error) {
      console.error("Failed to delete order:", error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      case "approved":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      case "in_delivery":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
      case "delivered":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      default:
        return "bg-slate-100 text-slate-800"
    }
  }

  let visibleOrders = orders
  if (user?.role === "supervisor") {
    visibleOrders = orders.filter((o) => o.supervisorId === user.id)
  }

  let visibleClients = clients
  if (user?.role === "supervisor") {
    visibleClients = clients.filter((c) => user.assignedCities?.includes(c.city))
  }

  const filteredOrders = filterStatus === "all" ? visibleOrders : visibleOrders.filter((o) => o.status === filterStatus)

  if (loading) return <div className="p-8">Loading...</div>

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Orders</h1>
          <p className="text-slate-600 dark:text-slate-400">Manage water distribution orders</p>
        </div>
        {user?.role === "supervisor" && (
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Order
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Order</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateOrder} className="space-y-4">
                <div>
                  <Label htmlFor="client">Client</Label>
                  <Select
                    value={formData.clientId}
                    onValueChange={(value) => setFormData({ ...formData, clientId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select client" />
                    </SelectTrigger>
                    <SelectContent>
                      {visibleClients.map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.name} ({client.city})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="product">Product</Label>
                  <Select
                    value={formData.productId}
                    onValueChange={(value) => setFormData({ ...formData, productId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select product" />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.name} ({product.volume})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="pallets">Number of Pallets</Label>
                  <Input
                    id="pallets"
                    type="number"
                    min="1"
                    value={formData.pallets}
                    onChange={(e) => setFormData({ ...formData, pallets: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="driver">Driver Name (Optional)</Label>
                  <Input
                    id="driver"
                    value={formData.driverName}
                    onChange={(e) => setFormData({ ...formData, driverName: e.target.value })}
                  />
                </div>

                <Button type="submit" className="w-full">
                  Create Order
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="flex gap-2">
        <Button variant={filterStatus === "all" ? "default" : "outline"} onClick={() => setFilterStatus("all")}>
          All
        </Button>
        <Button variant={filterStatus === "pending" ? "default" : "outline"} onClick={() => setFilterStatus("pending")}>
          Pending
        </Button>
        <Button
          variant={filterStatus === "approved" ? "default" : "outline"}
          onClick={() => setFilterStatus("approved")}
        >
          Approved
        </Button>
        <Button
          variant={filterStatus === "delivered" ? "default" : "outline"}
          onClick={() => setFilterStatus("delivered")}
        >
          Delivered
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Orders List</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-4">Order ID</th>
                  <th className="text-left py-2 px-4">Client</th>
                  <th className="text-left py-2 px-4">Product</th>
                  <th className="text-left py-2 px-4">Pallets</th>
                  <th className="text-left py-2 px-4">Total Price</th>
                  <th className="text-left py-2 px-4">Status</th>
                  <th className="text-left py-2 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => {
                  const client = clients.find((c) => c.id === order.clientId)
                  const product = products.find((p) => p.id === order.productId)
                  return (
                    <tr key={order.id} className="border-b hover:bg-slate-50 dark:hover:bg-slate-800">
                      <td className="py-2 px-4 font-mono text-xs">{order.id.slice(0, 8)}</td>
                      <td className="py-2 px-4">{client?.name}</td>
                      <td className="py-2 px-4">{product?.name}</td>
                      <td className="py-2 px-4">{order.pallets}</td>
                      <td className="py-2 px-4 font-semibold">{order.totalPrice.toLocaleString()} DA</td>
                      <td className="py-2 px-4">
                        <Badge className={getStatusColor(order.status)}>
                          {order.status.replace("_", " ").toUpperCase()}
                        </Badge>
                      </td>
                      <td className="py-2 px-4 space-x-2">
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4" />
                        </Button>
                        {order.status === "pending" && user?.role === "supervisor" && (
                          <Button size="sm" variant="outline">
                            <Edit2 className="h-4 w-4" />
                          </Button>
                        )}
                        {order.status === "pending" && user?.role === "supervisor" && (
                          <Button size="sm" variant="destructive" onClick={() => handleDeleteOrder(order.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
