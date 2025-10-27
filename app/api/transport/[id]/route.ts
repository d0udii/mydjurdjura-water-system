import { NextRequest, NextResponse } from 'next/server'

interface TransportTariff {
  id: string
  city: string
  cost_per_pallet: number
  status: 'active' | 'inactive'
  created_at: string
}

// Demo transport tariffs data
const demoTransportTariffs: TransportTariff[] = [
  {
    id: '1',
    city: 'Biskra',
    cost_per_pallet: 31000,
    status: 'active',
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    city: 'Ouled Djellal',
    cost_per_pallet: 30000,
    status: 'active',
    created_at: '2024-01-02T00:00:00Z'
  },
  {
    id: '3',
    city: 'Oued Souf',
    cost_per_pallet: 47000,
    status: 'active',
    created_at: '2024-01-03T00:00:00Z'
  },
  {
    id: '4',
    city: 'El Mghair',
    cost_per_pallet: 42000,
    status: 'active',
    created_at: '2024-01-04T00:00:00Z'
  }
]

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    
    const tariffIndex = demoTransportTariffs.findIndex(tariff => tariff.id === id)
    if (tariffIndex === -1) {
      return NextResponse.json({ error: 'Transport tariff not found' }, { status: 404 })
    }

    // Update the tariff
    demoTransportTariffs[tariffIndex] = {
      ...demoTransportTariffs[tariffIndex],
      ...body,
      id: id // Ensure ID doesn't change
    }

    console.log('Transport tariff updated:', demoTransportTariffs[tariffIndex])
    return NextResponse.json({ tariff: demoTransportTariffs[tariffIndex] }, { status: 200 })
  } catch (error) {
    console.error('Error updating transport tariff:', error)
    return NextResponse.json({ error: 'Failed to update transport tariff' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    
    const tariffIndex = demoTransportTariffs.findIndex(tariff => tariff.id === id)
    if (tariffIndex === -1) {
      return NextResponse.json({ error: 'Transport tariff not found' }, { status: 404 })
    }

    // Remove the tariff
    const deletedTariff = demoTransportTariffs.splice(tariffIndex, 1)[0]

    console.log('Transport tariff deleted:', deletedTariff)
    return NextResponse.json({ message: 'Transport tariff deleted successfully' }, { status: 200 })
  } catch (error) {
    console.error('Error deleting transport tariff:', error)
    return NextResponse.json({ error: 'Failed to delete transport tariff' }, { status: 500 })
  }
}