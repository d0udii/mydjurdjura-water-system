// Shared data store for orders API
let ordersData = [
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
    notes: "Urgent delivery required",
    created_at: "2024-01-10T10:00:00Z",
    updated_at: "2024-01-10T10:00:00Z",
    clients: {
      id: "CLI-001",
      name: "Biskra Water Distributor",
      phone: "+213 33 123 456",
      address: "123 Main Street, Biskra",
      contact_person: "Ahmed Benali"
    },
    regions: {
      id: "REG-001",
      name: "East"
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
    bl_number: "BL-2024-001",
    delivery_date: "2024-01-12",
    notes: "Regular delivery",
    created_at: "2024-01-11T14:30:00Z",
    updated_at: "2024-01-11T14:30:00Z",
    clients: {
      id: "CLI-002",
      name: "Ouled Djellal Store",
      phone: "+213 33 789 012",
      address: "456 Market Square, Ouled Djellal",
      contact_person: "Fatima Zohra"
    },
    regions: {
      id: "REG-001",
      name: "East"
    },
    users: {
      id: "USR-004",
      name: "Operations Team",
      role: "operations"
    }
  }
]

export { ordersData }
