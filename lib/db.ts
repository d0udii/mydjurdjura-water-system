// In-memory database for the water distribution system
// This will be replaced with a real database in production

export interface User {
  id: string
  name: string
  email: string
  password: string
  role: "admin" | "regional_manager" | "supervisor" | "operations"
  region?: string // For regional_manager
  chefRegionId?: string // For supervisor - who they report to
  assignedCities?: string[]
  approved: boolean
  createdAt: Date
}

export interface Client {
  id: string
  name: string
  city: string
  phone: string
  supervisorId: string
}

export interface Product {
  id: string
  name: string
  volume: string
  unitsPerPallet: number
  unitPrice: number
}

export interface Order {
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
  status: "pending" | "approved" | "in_delivery" | "delivered"
  createdAt: Date
  updatedAt: Date
}

export interface TransportTariff {
  id: string
  city: string
  price: number
  driverType: "factory" | "external"
}

export interface Objective {
  id: string
  month: string
  supervisorId: string
  targetPallets: number
  achievedPallets: number
}

// Database store
export const db = {
  users: [] as User[],
  clients: [] as Client[],
  products: [] as Product[],
  orders: [] as Order[],
  transportTariffs: [] as TransportTariff[],
  objectives: [] as Objective[],
  initialized: false,
}

// Initialize with default data
export function initializeDatabase() {
  if (db.initialized) return

  db.users.push({
    id: "1",
    name: "Admin Djurdjura",
    email: "admin@djurdjura.dz",
    password: "admin123",
    role: "admin",
    approved: true,
    createdAt: new Date(),
  })

  // Regional Manager - East
  db.users.push({
    id: "2",
    name: "Hamouch",
    email: "hamouch@djurdjura.dz",
    password: "chef123",
    role: "regional_manager",
    region: "East",
    approved: true,
    createdAt: new Date(),
  })

  // Supervisor under Hamouch
  db.users.push({
    id: "3",
    name: "Mahmoud Djouadi",
    email: "mahmoud@djurdjura.dz",
    password: "supervisor123",
    role: "supervisor",
    chefRegionId: "2",
    assignedCities: ["Biskra", "Ouled Djellal", "El Mghair", "Oued Souf", "Tebessa"],
    approved: true,
    createdAt: new Date(),
  })

  // Regional Manager - West
  db.users.push({
    id: "4",
    name: "Sara Regional Manager",
    email: "sara@djurdjura.dz",
    password: "chef123",
    role: "regional_manager",
    region: "West",
    approved: true,
    createdAt: new Date(),
  })

  // Operations Team
  db.users.push({
    id: "5",
    name: "Operations Team",
    email: "operations@djurdjura.dz",
    password: "operations123",
    role: "operations",
    approved: true,
    createdAt: new Date(),
  })

  db.products.push({
    id: "1",
    name: "5.5L Djurdjura Water",
    volume: "5.5L",
    unitsPerPallet: 212,
    unitPrice: 65,
  })

  db.products.push({
    id: "2",
    name: "1.5L Djurdjura Water",
    volume: "1.5L",
    unitsPerPallet: 112,
    unitPrice: 45,
  })

  db.transportTariffs.push({
    id: "1",
    city: "Biskra",
    price: 31000,
    driverType: "factory",
  })

  db.transportTariffs.push({
    id: "2",
    city: "Ouled Djellal",
    price: 28000,
    driverType: "factory",
  })

  db.transportTariffs.push({
    id: "3",
    city: "Tebessa",
    price: 35000,
    driverType: "factory",
  })

  db.transportTariffs.push({
    id: "4",
    city: "El Mghair",
    price: 25000,
    driverType: "factory",
  })

  db.transportTariffs.push({
    id: "5",
    city: "Oued Souf",
    price: 32000,
    driverType: "factory",
  })

  db.clients.push({
    id: "c1",
    name: "Supermarché Biskra",
    city: "Biskra",
    phone: "0771234567",
    supervisorId: "3",
  })

  db.clients.push({
    id: "c2",
    name: "Épicerie Ouled Djellal",
    city: "Ouled Djellal",
    phone: "0772345678",
    supervisorId: "3",
  })

  db.clients.push({
    id: "c3",
    name: "Magasin El Mghair",
    city: "El Mghair",
    phone: "0773456789",
    supervisorId: "3",
  })

  db.clients.push({
    id: "c4",
    name: "Commerce Oued Souf",
    city: "Oued Souf",
    phone: "0774567890",
    supervisorId: "3",
  })

  db.clients.push({
    id: "c5",
    name: "Boutique Tebessa",
    city: "Tebessa",
    phone: "0775678901",
    supervisorId: "3",
  })

  db.initialized = true
}
