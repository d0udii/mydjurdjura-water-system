import { NextRequest, NextResponse } from 'next/server'

// Import demo data from the main clients API
const demoClients = [
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
    contact_person: "Fatima Djellal",
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
    contact_person: "Omar Souf",
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
    contact_person: "Amina Mghair",
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

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const client = demoClients.find(c => c.id === id)
    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 })
    }
    return NextResponse.json(client)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch client" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const data = await request.json()
    
    const clientIndex = demoClients.findIndex(c => c.id === id)
    if (clientIndex === -1) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 })
    }
    
    // Update client
    const updatedClient = {
      ...demoClients[clientIndex],
      ...data,
      id: id, // Ensure ID doesn't change
      updated_at: new Date().toISOString()
    }
    
    demoClients[clientIndex] = updatedClient
    
    return NextResponse.json(updatedClient)
  } catch (error) {
    return NextResponse.json({ error: "Failed to update client" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    
    const clientIndex = demoClients.findIndex(c => c.id === id)
    if (clientIndex === -1) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 })
    }
    
    const deletedClient = demoClients[clientIndex]
    demoClients.splice(clientIndex, 1)
    
    return NextResponse.json({ 
      message: `Client "${deletedClient.name}" deleted successfully`,
      client: deletedClient
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete client" }, { status: 500 })
  }
}
