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
import { Plus, Edit2, Trash2, CheckCircle, XCircle } from "lucide-react"

interface User {
  id: string
  name: string
  email: string
  role: string
  region?: string
  chefRegionId?: string
  assignedCities?: string[]
  approved: boolean
}

export default function UsersPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [isOpen, setIsOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "supervisor",
    region: "",
    chefRegionId: "",
    assignedCities: "",
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

    fetchUsers()
  }, [router])

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/users")
      const data = await response.json()
      setUsers(data)
    } catch (error) {
      console.error("Failed to fetch users:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const endpoint = editingId ? `/api/users/${editingId}` : "/api/users"
      const method = editingId ? "PUT" : "POST"

      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          assignedCities: formData.assignedCities.split(",").map((c) => c.trim()),
        }),
      })

      if (response.ok) {
        fetchUsers()
        setIsOpen(false)
        resetForm()
      }
    } catch (error) {
      console.error("Failed to save user:", error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure?")) return

    try {
      await fetch(`/api/users/${id}`, { method: "DELETE" })
      fetchUsers()
    } catch (error) {
      console.error("Failed to delete user:", error)
    }
  }

  const handleApprove = async (id: string) => {
    try {
      await fetch(`/api/users/${id}/approve`, { method: "POST" })
      fetchUsers()
    } catch (error) {
      console.error("Failed to approve user:", error)
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      password: "",
      role: "supervisor",
      region: "",
      chefRegionId: "",
      assignedCities: "",
    })
    setEditingId(null)
  }

  const handleEdit = (u: User) => {
    setFormData({
      name: u.name,
      email: u.email,
      password: "",
      role: u.role,
      region: u.region || "",
      chefRegionId: u.chefRegionId || "",
      assignedCities: u.assignedCities?.join(", ") || "",
    })
    setEditingId(u.id)
    setIsOpen(true)
  }

  if (user?.role !== "admin") {
    return (
      <div className="p-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">Only administrators can manage users</p>
        </div>
      </div>
    )
  }

  if (loading) return <div className="p-8">Loading...</div>

  const chefRegions = users.filter((u) => u.role === "chef_region")
  const supervisors = users.filter((u) => u.role === "supervisor")
  const admins = users.filter((u) => u.role === "admin")

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-slate-600 dark:text-slate-400">Manage system users and permissions</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="mr-2 h-4 w-4" />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit User" : "Create New User"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder={editingId ? "Leave blank to keep current" : ""}
                />
              </div>

              <div>
                <Label htmlFor="role">Role</Label>
                <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="chef_region">Chef de Région</SelectItem>
                    <SelectItem value="supervisor">Supervisor</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.role === "chef_region" && (
                <div>
                  <Label htmlFor="region">Region</Label>
                  <Select
                    value={formData.region}
                    onValueChange={(value) => setFormData({ ...formData, region: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="East">East</SelectItem>
                      <SelectItem value="West">West</SelectItem>
                      <SelectItem value="North">North</SelectItem>
                      <SelectItem value="South">South</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {formData.role === "supervisor" && (
                <>
                  <div>
                    <Label htmlFor="chefRegion">Chef de Région</Label>
                    <Select
                      value={formData.chefRegionId}
                      onValueChange={(value) => setFormData({ ...formData, chefRegionId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select chef de région" />
                      </SelectTrigger>
                      <SelectContent>
                        {chefRegions.map((chef) => (
                          <SelectItem key={chef.id} value={chef.id}>
                            {chef.name} ({chef.region})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="cities">Assigned Cities (comma-separated)</Label>
                    <Input
                      id="cities"
                      value={formData.assignedCities}
                      onChange={(e) => setFormData({ ...formData, assignedCities: e.target.value })}
                      placeholder="Biskra, Ouled Djellal, Tebessa"
                    />
                  </div>
                </>
              )}

              <Button type="submit" className="w-full">
                {editingId ? "Update User" : "Create User"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Admins Section */}
      <Card>
        <CardHeader>
          <CardTitle>Administrators</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-4">Name</th>
                  <th className="text-left py-2 px-4">Email</th>
                  <th className="text-left py-2 px-4">Status</th>
                  <th className="text-left py-2 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {admins.map((u) => (
                  <tr key={u.id} className="border-b hover:bg-slate-50 dark:hover:bg-slate-800">
                    <td className="py-2 px-4">{u.name}</td>
                    <td className="py-2 px-4">{u.email}</td>
                    <td className="py-2 px-4">
                      <div className="flex items-center text-green-600">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Approved
                      </div>
                    </td>
                    <td className="py-2 px-4 space-x-2">
                      <Button size="sm" variant="outline" onClick={() => handleEdit(u)}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Chef de Région Section */}
      <Card>
        <CardHeader>
          <CardTitle>Chef de Région</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-4">Name</th>
                  <th className="text-left py-2 px-4">Email</th>
                  <th className="text-left py-2 px-4">Region</th>
                  <th className="text-left py-2 px-4">Status</th>
                  <th className="text-left py-2 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {chefRegions.map((u) => (
                  <tr key={u.id} className="border-b hover:bg-slate-50 dark:hover:bg-slate-800">
                    <td className="py-2 px-4">{u.name}</td>
                    <td className="py-2 px-4">{u.email}</td>
                    <td className="py-2 px-4">{u.region}</td>
                    <td className="py-2 px-4">
                      {u.approved ? (
                        <div className="flex items-center text-green-600">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approved
                        </div>
                      ) : (
                        <div className="flex items-center text-yellow-600">
                          <XCircle className="h-4 w-4 mr-1" />
                          Pending
                        </div>
                      )}
                    </td>
                    <td className="py-2 px-4 space-x-2">
                      {!u.approved && (
                        <Button size="sm" variant="outline" onClick={() => handleApprove(u.id)}>
                          Approve
                        </Button>
                      )}
                      <Button size="sm" variant="outline" onClick={() => handleEdit(u)}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDelete(u.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Supervisors Section */}
      <Card>
        <CardHeader>
          <CardTitle>Supervisors</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-4">Name</th>
                  <th className="text-left py-2 px-4">Email</th>
                  <th className="text-left py-2 px-4">Chef de Région</th>
                  <th className="text-left py-2 px-4">Cities</th>
                  <th className="text-left py-2 px-4">Status</th>
                  <th className="text-left py-2 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {supervisors.map((u) => {
                  const chef = chefRegions.find((c) => c.id === u.chefRegionId)
                  return (
                    <tr key={u.id} className="border-b hover:bg-slate-50 dark:hover:bg-slate-800">
                      <td className="py-2 px-4">{u.name}</td>
                      <td className="py-2 px-4">{u.email}</td>
                      <td className="py-2 px-4">{chef?.name || "Unassigned"}</td>
                      <td className="py-2 px-4 text-xs">{u.assignedCities?.join(", ")}</td>
                      <td className="py-2 px-4">
                        {u.approved ? (
                          <div className="flex items-center text-green-600">
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approved
                          </div>
                        ) : (
                          <div className="flex items-center text-yellow-600">
                            <XCircle className="h-4 w-4 mr-1" />
                            Pending
                          </div>
                        )}
                      </td>
                      <td className="py-2 px-4 space-x-2">
                        {!u.approved && (
                          <Button size="sm" variant="outline" onClick={() => handleApprove(u.id)}>
                            Approve
                          </Button>
                        )}
                        <Button size="sm" variant="outline" onClick={() => handleEdit(u)}>
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDelete(u.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
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
