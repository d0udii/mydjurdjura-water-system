import { getTransportTariffs, createTransportTariff } from "@/lib/supabase-db"

export async function GET() {
  try {
    const tariffs = await getTransportTariffs()
    return Response.json({ transport: tariffs })
  } catch (error) {
    console.error('Error fetching transport tariffs:', error)
    return Response.json({ error: "Failed to fetch tariffs" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()
    
    console.log('📦 Received transport tariff data:', data)
    
    // Validate required fields
    if (!data.city) {
      return Response.json({ error: "Missing required field: city" }, { status: 400 })
    }
    
    if (!data.price || parseFloat(data.price) <= 0) {
      return Response.json({ error: "Price must be a positive number" }, { status: 400 })
    }
    
    if (!data.region_id) {
      return Response.json({ error: "Please select a region" }, { status: 400 })
    }

    const tariff = await createTransportTariff({
      city: data.city,
      price: parseFloat(data.price),
      driver_type: data.driver_type || 'local',
      region_id: data.region_id
    })

    if (!tariff) {
      return Response.json({ error: "Failed to create tariff" }, { status: 500 })
    }

    console.log('✅ Created transport tariff:', tariff)
    return Response.json(tariff)
  } catch (error) {
    console.error('❌ Error creating transport tariff:', error)
    return Response.json({ 
      error: error instanceof Error ? error.message : "Failed to create tariff" 
    }, { status: 500 })
  }
}
