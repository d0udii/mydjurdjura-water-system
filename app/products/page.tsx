"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Edit2, Trash2 } from "lucide-react"

interface Product {
  id: string
  name: string
  volume: string
  unitsPerPallet: number
  unitPrice: number
}

export default function ProductsPage() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [isOpen, setIsOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    volume: "",
    unitsPerPallet: "",
    unitPrice: "",
  })

  useEffect(() => {
    const token = localStorage.getItem("authToken")
    if (!token) {
      router.push("/")
      return
    }
    fetchProducts()
  }, [router])

  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/products")
      const data = await response.json()
      setProducts(data)
    } catch (error) {
      console.error("Failed to fetch products:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const endpoint = editingId ? `/api/products/${editingId}` : "/api/products"
      const method = editingId ? "PUT" : "POST"

      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          unitsPerPallet: Number.parseInt(formData.unitsPerPallet),
          unitPrice: Number.parseFloat(formData.unitPrice),
        }),
      })

      if (response.ok) {
        fetchProducts()
        setIsOpen(false)
        resetForm()
      }
    } catch (error) {
      console.error("Failed to save product:", error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure?")) return

    try {
      await fetch(`/api/products/${id}`, { method: "DELETE" })
      fetchProducts()
    } catch (error) {
      console.error("Failed to delete product:", error)
    }
  }

  const resetForm = () => {
    setFormData({ name: "", volume: "", unitsPerPallet: "", unitPrice: "" })
    setEditingId(null)
  }

  const handleEdit = (product: Product) => {
    setFormData({
      name: product.name,
      volume: product.volume,
      unitsPerPallet: product.unitsPerPallet.toString(),
      unitPrice: product.unitPrice.toString(),
    })
    setEditingId(product.id)
    setIsOpen(true)
  }

  if (loading) return <div className="p-8">Loading...</div>

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Products</h1>
          <p className="text-slate-600 dark:text-slate-400">Manage water products and pricing</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit Product" : "Add New Product"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Product Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="volume">Volume</Label>
                <Input
                  id="volume"
                  value={formData.volume}
                  onChange={(e) => setFormData({ ...formData, volume: e.target.value })}
                  placeholder="e.g., 5.5L"
                  required
                />
              </div>

              <div>
                <Label htmlFor="units">Units Per Pallet</Label>
                <Input
                  id="units"
                  type="number"
                  value={formData.unitsPerPallet}
                  onChange={(e) => setFormData({ ...formData, unitsPerPallet: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="price">Unit Price (DA)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={formData.unitPrice}
                  onChange={(e) => setFormData({ ...formData, unitPrice: e.target.value })}
                  required
                />
              </div>

              <Button type="submit" className="w-full">
                {editingId ? "Update Product" : "Add Product"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((product) => (
          <Card key={product.id}>
            <CardHeader>
              <CardTitle className="text-lg">{product.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Volume</p>
                <p className="font-semibold">{product.volume}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Units Per Pallet</p>
                <p className="font-semibold">{product.unitsPerPallet}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Unit Price</p>
                <p className="font-semibold">{product.unitPrice} DA</p>
              </div>
              <div className="flex gap-2 pt-4">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 bg-transparent"
                  onClick={() => handleEdit(product)}
                >
                  <Edit2 className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button size="sm" variant="destructive" className="flex-1" onClick={() => handleDelete(product.id)}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
