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
import { Plus, Edit2, Trash2 } from "lucide-react"

interface Client {
  id: string
  name: string
  city: string
  phone: string
  supervisorId: string
}

interface Supervisor {
  id: string
  name: string
  assignedCities?: string[]
}

export default function ClientsPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [clients, setClients] = useState<Client[]>([])
  const [supervisors, setSupervisors] = useState<Supervisor[]>([])
  const [loading, setLoading] = useState(true)
  const [isOpen, setIsOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    city: "",
    phone: "",
    supervisorId: "",
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
      const [clientsRes, supervisorsRes] = await Promise.all([fetch("/api/clients"), fetch("/api/supervisors")])

      const clientsData = await clientsRes.json()
      const supervisorsData = await supervisorsRes.json()

      setClients(clientsData)
      setSupervisors(supervisorsData)
    } catch (error) {
      console.error("Failed to fetch data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const endpoint = editingId ? `/api/clients/${editingId}` : "/api/clients"
      const method = editingId ? "PUT" : "POST"

      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        fetchData()
        setIsOpen(false)
        resetForm()
      }
    } catch (error) {
      console.error("Failed to save client:", error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure?")) return

    try {
      await fetch(`/api/clients/${id}`, { method: "DELETE" })
      fetchData()
    } catch (error) {
      console.error("Failed to delete client:", error)
    }
  }

  const resetForm = () => {
    setFormData({ name: "", city: "", phone: "", supervisorId: "" })
    setEditingId(null)
  }

  const handleEdit = (client: Client) => {
    setFormData({
      name: client.name,
      city: client.city,
      phone: client.phone,
      supervisorId: client.supervisorId,
    })
    setEditingId(client.id)
    setIsOpen(true)
  }

  let visibleClients = clients
  if (user?.role === "supervisor") {
    visibleClients = clients.filter((c) => c.supervisorId === user.id)
  }

  let visibleSupervisors = supervisors
  if (user?.role === "chef_region") {
    visibleSupervisors = supervisors.filter((s) => s.chefRegionId === user.id)
  }

  if (loading) return <div className="p-8">Loading...</div>

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Clients</h1>
          <p className="text-slate-600 dark:text-slate-400">
            {user?.role === "admin" ? "Manage all clients" : "View your assigned clients"}
          </p>
        </div>
        {user?.role === "admin" && (
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="mr-2 h-4 w-4" />
                Add Client
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingId ? "Edit Client" : "Add New Client"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Client Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="supervisor">Assign to Supervisor</Label>
                  <Select
                    value={formData.supervisorId}
                    onValueChange={(value) => setFormData({ ...formData, supervisorId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select supervisor" />
                    </SelectTrigger>
                    <SelectContent>
                      {supervisors.map((sup) => (
                        <SelectItem key={sup.id} value={sup.id}>
                          {sup.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button type="submit" className="w-full">
                  {editingId ? "Update Client" : "Add Client"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{user?.role === "admin" ? "All Clients" : "Your Clients"}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-4">Name</th>
                  <th className="text-left py-2 px-4">City</th>
                  <th className="text-left py-2 px-4">Phone</th>
                  <th className="text-left py-2 px-4">Supervisor</th>
                  {user?.role === "admin" && <th className="text-left py-2 px-4">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {visibleClients.map((client) => {
                  const supervisor = supervisors.find((s) => s.id === client.supervisorId)
                  return (
                    <tr key={client.id} className="border-b hover:bg-slate-50 dark:hover:bg-slate-800">
                      <td className="py-2 px-4">{client.name}</td>
                      <td className="py-2 px-4">{client.city}</td>
                      <td className="py-2 px-4">{client.phone}</td>
                      <td className="py-2 px-4">{supervisor?.name}</td>
                      {user?.role === "admin" && (
                        <td className="py-2 px-4 space-x-2">
                          <Button size="sm" variant="outline" onClick={() => handleEdit(client)}>
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleDelete(client.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </td>
                      )}
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
