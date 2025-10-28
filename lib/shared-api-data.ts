/**
 * Shared API Data Store
 * This ensures all API endpoints have access to the same data
 */

// Shared demo data that all API endpoints can access
export let sharedOrders = [
  {
    id: "ORD-001",
    client_id: "CLI-001",
    region_id: "REG-001",
    assigned_to: "USR-004",
    status: "pending",
    total_price: 125000,
    product_5_5L_pallets: 11,
    product_1_5L_pallets: 11,
    truck_type: "factory",
    truck_capacity: 22,
    delivery_date: "2024-01-15",
    notes: "Urgent delivery",
    bl_number: null,
    approved_by: null,
    approved_at: null,
    created_at: "2024-01-10T10:00:00Z",
    updated_at: "2024-01-10T10:00:00Z",
    clients: {
      id: "CLI-001",
      name: "Biskra Water Distributor",
      phone: "0555123456",
      address: "123 Main Street, Biskra",
      contact_person: "Ahmed Benali"
    },
    regions: {
      id: "REG-001",
      name: "East",
      responsible: "Hamouch"
    },
    users: {
      id: "USR-004",
      name: "Operations Team",
      role: "operations"
    }
  },
  {
    id: "ORD-002",
    client_id: "CLI-002",
    region_id: "REG-001",
    assigned_to: "USR-004",
    status: "in_progress",
    total_price: 89000,
    product_5_5L_pallets: 8,
    product_1_5L_pallets: 6,
    truck_type: "client_own",
    truck_capacity: 24,
    delivery_date: "2024-01-16",
    notes: "Regular delivery",
    bl_number: "BL-2024-001",
    approved_by: "USR-004",
    approved_at: "2024-01-08T15:30:00Z",
    created_at: "2024-01-08T14:30:00Z",
    updated_at: "2024-01-08T15:30:00Z",
    clients: {
      id: "CLI-002",
      name: "Ouled Djellal Store",
      phone: "0666789012",
      address: "456 Market Square, Ouled Djellal",
      contact_person: "Fatima Zohra"
    },
    regions: {
      id: "REG-001",
      name: "East",
      responsible: "Hamouch"
    },
    users: {
      id: "USR-004",
      name: "Operations Team",
      role: "operations"
    }
  },
  {
    id: "ORD-003",
    client_id: "CLI-003",
    region_id: "REG-001",
    assigned_to: "USR-004",
    status: "delivered",
    total_price: 156000,
    product_5_5L_pallets: 15,
    product_1_5L_pallets: 7,
    truck_type: "factory",
    truck_capacity: 26,
    delivery_date: "2024-01-01",
    notes: "Completed",
    bl_number: "BL-2024-002",
    approved_by: "USR-004",
    approved_at: "2024-01-01T09:00:00Z",
    created_at: "2024-01-01T08:00:00Z",
    updated_at: "2024-01-01T08:00:00Z",
    clients: {
      id: "CLI-003",
      name: "Oued Souf Market",
      phone: "0777890123",
      address: "789 Commercial Ave, Oued Souf",
      contact_person: "Mohamed Khelil"
    },
    regions: {
      id: "REG-001",
      name: "East",
      responsible: "Hamouch"
    },
    users: {
      id: "USR-004",
      name: "Operations Team",
      role: "operations"
    }
  }
]

// Shared clients data
export let sharedClients = [
  {
    id: "CLI-001",
    name: "Biskra Water Distributor",
    phone: "+213 33 123 456",
    address: "123 Main Street, Biskra",
    region_id: "REG-001",
    contact_person: "Ahmed Benali",
    rc_number: "001234567RC",
    status: "active",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z"
  },
  {
    id: "CLI-002",
    name: "Ouled Djellal Store",
    phone: "+213 33 789 012",
    address: "456 Market Square, Ouled Djellal",
    region_id: "REG-001",
    contact_person: "Fatima Zohra",
    rc_number: "002345678RC",
    status: "active",
    created_at: "2024-01-02T00:00:00Z",
    updated_at: "2024-01-02T00:00:00Z"
  },
  {
    id: "CLI-003",
    name: "Oued Souf Market",
    phone: "+213 33 456 789",
    address: "789 Commercial Ave, Oued Souf",
    region_id: "REG-001",
    contact_person: "Mohamed Khelil",
    rc_number: "003456789RC",
    status: "active",
    created_at: "2024-01-03T00:00:00Z",
    updated_at: "2024-01-03T00:00:00Z"
  },
  {
    id: "CLI-004",
    name: "El Mghair Shop",
    phone: "+213 33 321 654",
    address: "321 Business St, El Mghair",
    region_id: "REG-001",
    contact_person: "Aicha Benali",
    rc_number: "004567890RC",
    status: "active",
    created_at: "2024-01-04T00:00:00Z",
    updated_at: "2024-01-04T00:00:00Z"
  },
  {
    id: "CLI-029",
    name: "Samir Mennacer",
    phone: "0540233149",
    address: "Tolga, Biskra",
    region_id: "REG-001",
    contact_person: "Samir Mennacer",
    rc_number: "123456789RC",
    status: "active",
    created_at: "2024-01-05T00:00:00Z",
    updated_at: "2024-01-05T00:00:00Z"
  }
]

export function addClient(client: any) {
  sharedClients.unshift(client)
}

export function updateClient(clientId: string, updates: any) {
  const clientIndex = sharedClients.findIndex(c => c.id === clientId)
  if (clientIndex !== -1) {
    sharedClients[clientIndex] = { ...sharedClients[clientIndex], ...updates }
  }
}

export function getClientById(clientId: string) {
  return sharedClients.find(c => c.id === clientId)
}

export function getAllClients() {
  return sharedClients
}

export function addOrder(order: any) {
  sharedOrders.unshift(order)
}

export function updateOrder(orderId: string, updates: any) {
  const orderIndex = sharedOrders.findIndex(o => o.id === orderId)
  if (orderIndex !== -1) {
    sharedOrders[orderIndex] = { ...sharedOrders[orderIndex], ...updates }
  }
}

export function getOrderById(orderId: string) {
  return sharedOrders.find(o => o.id === orderId)
}

export function getAllOrders() {
  return sharedOrders
}
