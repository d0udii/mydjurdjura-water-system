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

interface TransportTariff {
  id: string
  city: string
  price: number
  driverType: string
}

export default function TransportPage() {
  const router = useRouter()
  const [tariffs, setTariffs] = useState<TransportTariff[]>([])
  const [loading, setLoading] = useState(true)
  const [isOpen, setIsOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    city: "",
    price: "",
    driverType: "factory",
  })

  useEffect(() => {
    const token = localStorage.getItem("authToken")
    if (!token) {
      router.push("/")
      return
    }
    fetchTariffs()
  }, [router])

  const fetchTariffs = async () => {
    try {
      const response = await fetch("/api/transport")
      const data = await response.json()
      setTariffs(data)
    } catch (error) {
      console.error("Failed to fetch tariffs:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const endpoint = editingId ? `/api/transport/${editingId}` : "/api/transport"
      const method = editingId ? "PUT" : "POST"

      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          price: Number.parseFloat(formData.price),
        }),
      })

      if (response.ok) {
        fetchTariffs()
        setIsOpen(false)
        resetForm()
      }
    } catch (error) {
      console.error("Failed to save tariff:", error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure?")) return

    try {
      await fetch(`/api/transport/${id}`, { method: "DELETE" })
      fetchTariffs()
    } catch (error) {
      console.error("Failed to delete tariff:", error)
    }
  }

  const resetForm = () => {
    setFormData({ city: "", price: "", driverType: "factory" })
    setEditingId(null)
  }

  const handleEdit = (tariff: TransportTariff) => {
    setFormData({
      city: tariff.city,
      price: tariff.price.toString(),
      driverType: tariff.driverType,
    })
    setEditingId(tariff.id)
    setIsOpen(true)
  }

  if (loading) return <div className="p-8">Loading...</div>

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Transport Tariffs</h1>
          <p className="text-slate-600 dark:text-slate-400">Manage city-based transport costs</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="mr-2 h-4 w-4" />
              Add Tariff
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit Tariff" : "Add New Tariff"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
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
                <Label htmlFor="price">Transport Price (DA)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="driver">Driver Type</Label>
                <Select
                  value={formData.driverType}
                  onValueChange={(value) => setFormData({ ...formData, driverType: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="factory">Factory</SelectItem>
                    <SelectItem value="external">External</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button type="submit" className="w-full">
                {editingId ? "Update Tariff" : "Add Tariff"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Tariffs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-4">City</th>
                  <th className="text-left py-2 px-4">Price (DA)</th>
                  <th className="text-left py-2 px-4">Driver Type</th>
                  <th className="text-left py-2 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {tariffs.map((tariff) => (
                  <tr key={tariff.id} className="border-b hover:bg-slate-50 dark:hover:bg-slate-800">
                    <td className="py-2 px-4 font-semibold">{tariff.city}</td>
                    <td className="py-2 px-4">{tariff.price.toLocaleString()} DA</td>
                    <td className="py-2 px-4">
                      <span className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-xs">
                        {tariff.driverType.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-2 px-4 space-x-2">
                      <Button size="sm" variant="outline" onClick={() => handleEdit(tariff)}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDelete(tariff.id)}>
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
    </div>
  )
}
