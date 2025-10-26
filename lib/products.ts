import { db, type Product } from "./db"

export function createProduct(productData: Omit<Product, "id">): Product {
  const newProduct: Product = {
    ...productData,
    id: Date.now().toString(),
  }
  db.products.push(newProduct)
  return newProduct
}

export function getProductById(id: string): Product | undefined {
  return db.products.find((p) => p.id === id)
}

export function getAllProducts(): Product[] {
  return db.products
}

export function updateProduct(id: string, updates: Partial<Product>): Product | null {
  const product = db.products.find((p) => p.id === id)
  if (!product) return null

  Object.assign(product, updates)
  return product
}

export function deleteProduct(id: string): boolean {
  const index = db.products.findIndex((p) => p.id === id)
  if (index === -1) return false
  db.products.splice(index, 1)
  return true
}
