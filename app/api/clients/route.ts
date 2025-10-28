import { NextRequest, NextResponse } from 'next/server'
import { createClientAssignmentNotification } from '../notifications/route'
import { sharedClients, addClient, getAllClients } from '@/lib/shared-api-data'

// Demo clients data
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

// Demo regions with supervisor assignments
const demoRegions = [
  {
    id: "REG-001",
    name: "East",
    description: "Eastern region covering Biskra, Ouled Djellal, Oued Souf, El Mghair",
    supervisor_id: "demo-mahmoud@djurdjura.dz",
    regional_manager_id: "demo-hamouch@djurdjura.dz",
    cities: ["Biskra", "Ouled Djellal", "Oued Souf", "El Mghair", "Tolga"]
  },
  {
    id: "REG-002",
    name: "West",
    description: "Western region covering Oran, Mostaganem, Sidi Bel Abbes",
    supervisor_id: "demo-ahmed@djurdjura.dz",
    regional_manager_id: "demo-hamouch@djurdjura.dz",
    cities: ["Oran", "Mostaganem", "Sidi Bel Abbes"]
  },
  {
    id: "REG-003",
    name: "Center",
    description: "Central region covering Algiers and surrounding areas",
    supervisor_id: "demo-fatima@djurdjura.dz",
    regional_manager_id: "demo-hamouch@djurdjura.dz",
    cities: ["Algiers", "Blida", "Tipaza"]
  }
]

// Demo supervisors
const demoSupervisors = [
  {
    id: "demo-mahmoud@djurdjura.dz",
    name: "Mahmoud Djouadi",
    email: "mahmoud@djurdjura.dz",
    role: "supervisor",
    region_id: "REG-001",
    assigned_cities: ["Biskra", "Ouled Djellal", "Oued Souf", "El Mghair", "Tolga"]
  },
  {
    id: "demo-ahmed@djurdjura.dz",
    name: "Ahmed Benali",
    email: "ahmed@djurdjura.dz",
    role: "supervisor",
    region_id: "REG-002",
    assigned_cities: ["Oran", "Mostaganem", "Sidi Bel Abbes"]
  },
  {
    id: "demo-fatima@djurdjura.dz",
    name: "Fatima Zohra",
    email: "fatima@djurdjura.dz",
    role: "supervisor",
    region_id: "REG-003",
    assigned_cities: ["Algiers", "Blida", "Tipaza"]
  }
]

// Demo regional managers
const demoRegionalManagers = [
  {
    id: "demo-hamouch@djurdjura.dz",
    name: "Hamouch",
    email: "hamouch@djurdjura.dz",
    role: "regional_manager",
    region_id: "REG-001"
  }
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const region_id = searchParams.get('region_id')
    const supervisor_id = searchParams.get('supervisor_id')

    let filteredClients = getAllClients()

    if (region_id) {
      filteredClients = filteredClients.filter(client => client.region_id === region_id)
    }

    if (supervisor_id) {
      const supervisor = demoSupervisors.find(s => s.id === supervisor_id)
      if (supervisor) {
        const region = demoRegions.find(r => r.id === supervisor.region_id)
        if (region) {
          filteredClients = filteredClients.filter(client => 
            region.cities.some(city => client.address.includes(city))
          )
        }
      }
    }

    return NextResponse.json({
      clients: filteredClients,
      regions: demoRegions,
      supervisors: demoSupervisors,
      regional_managers: demoRegionalManagers
    })
  } catch (error) {
    console.error('Error fetching clients:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const {
      name,
      phone,
      address,
      rc_number,
      city,
      supervisor_id,
      region_id
    } = data

    if (!name || !phone || !city) {
      return NextResponse.json(
        { error: 'Name, phone, and city are required' },
        { status: 400 }
      )
    }

    // Determine supervisor and region
    let supervisor, region, regionalManager

    if (supervisor_id) {
      // Manual supervisor assignment
      supervisor = demoSupervisors.find(s => s.id === supervisor_id)
      if (!supervisor) {
        return NextResponse.json(
          { error: 'Invalid supervisor selected' },
          { status: 400 }
        )
      }
      region = demoRegions.find(r => r.id === supervisor.region_id)
    } else if (region_id) {
      // Region-based assignment
      region = demoRegions.find(r => r.id === region_id)
      if (!region) {
        return NextResponse.json(
          { error: 'Invalid region selected' },
          { status: 400 }
        )
      }
      supervisor = demoSupervisors.find(s => s.id === region.supervisor_id)
    } else {
      // Auto-assign based on city
      region = demoRegions.find(r => r.cities.includes(city))
      if (!region) {
        return NextResponse.json(
          { error: 'Invalid city selected' },
          { status: 400 }
        )
      }
      supervisor = demoSupervisors.find(s => s.id === region.supervisor_id)
    }

    if (!supervisor) {
      return NextResponse.json(
        { error: 'No supervisor assigned to this region' },
        { status: 400 }
      )
    }

    regionalManager = demoRegionalManagers.find(rm => rm.id === region.regional_manager_id)

    // Generate new client ID
    const newClientId = `CLI-${String(Date.now()).slice(-6)}`

    const newClient = {
      id: newClientId,
      name,
      phone,
      address: address || `${city}`,
      region_id: region.id,
      contact_person: name,
      rc_number: rc_number || '',
      status: 'active' as const,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    // Add to demo clients
    addClient(newClient)

    // Create notifications for supervisor and regional manager
    const supervisorNotification = createClientAssignmentNotification(newClient, supervisor.id)
    
    const notifications = [supervisorNotification]

    if (regionalManager) {
      notifications.push({
        user_id: regionalManager.id,
        title: "New Client in Your Region",
        message: `New client "${name}" from ${city} has been added to ${region.name} region`,
        type: "info",
        client_id: newClientId
      })
    }

    return NextResponse.json({
      client: newClient,
      supervisor: {
        id: supervisor.id,
        name: supervisor.name,
        email: supervisor.email
      },
      regional_manager: regionalManager ? {
        id: regionalManager.id,
        name: regionalManager.name,
        email: regionalManager.email
      } : null,
      region: {
        id: region.id,
        name: region.name
      },
      notifications,
      message: `Client created successfully and assigned to ${supervisor.name} (${region.name} region)`
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating client:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const data = await request.json()
    const { id, name, phone, address, rc_number, city } = data

    if (!id || !name || !phone || !city) {
      return NextResponse.json(
        { error: 'ID, name, phone, and city are required' },
        { status: 400 }
      )
    }

    const clientIndex = demoClients.findIndex(client => client.id === id)
    if (clientIndex === -1) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      )
    }

    // Find the region for the selected city
    const region = demoRegions.find(r => r.cities.includes(city))
    if (!region) {
      return NextResponse.json(
        { error: 'Invalid city selected' },
        { status: 400 }
      )
    }

    const supervisor = demoSupervisors.find(s => s.id === region.supervisor_id)
    const regionalManager = demoRegionalManagers.find(rm => rm.id === region.regional_manager_id)

    // Update client
    const updatedClient = {
      ...demoClients[clientIndex],
      name,
      phone,
      address: address || `${city}`,
      region_id: region.id,
      contact_person: name,
      rc_number: rc_number || '',
      updated_at: new Date().toISOString()
    }

    demoClients[clientIndex] = updatedClient

    return NextResponse.json({
      client: updatedClient,
      supervisor: supervisor ? {
        id: supervisor.id,
        name: supervisor.name,
        email: supervisor.email
      } : null,
      regional_manager: regionalManager ? {
        id: regionalManager.id,
        name: regionalManager.name,
        email: regionalManager.email
      } : null,
      region: {
        id: region.id,
        name: region.name
      },
      message: 'Client updated successfully'
    })

  } catch (error) {
    console.error('Error updating client:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Client ID is required' },
        { status: 400 }
      )
    }

    const clientIndex = demoClients.findIndex(client => client.id === id)
    if (clientIndex === -1) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      )
    }

    const deletedClient = demoClients[clientIndex]
    demoClients.splice(clientIndex, 1)

    return NextResponse.json({
      message: `Client "${deletedClient.name}" deleted successfully`,
      client: deletedClient
    })

  } catch (error) {
    console.error('Error deleting client:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}