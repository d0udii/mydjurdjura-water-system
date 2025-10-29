import { getTransportTariffs, createTransportTariff } from "@/lib/supabase-db"
import { initializeDatabase } from "@/lib/supabase-db"

export async function GET() {
  try {
    await initializeDatabase()
    const tariffs = await getTransportTariffs()
    return Response.json({ transport: tariffs })
  } catch (error) {
    console.error('Error fetching transport tariffs:', error)
    return Response.json({ error: "Failed to fetch tariffs" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    await initializeDatabase()
    const data = await request.json()
    
    // Validate required fields
    if (!data.city || !data.price || !data.region_id) {
      return Response.json({ error: "Missing required fields: city, price, region_id" }, { status: 400 })
    }

    const tariff = await createTransportTariff({
      city: data.city,
      price: parseFloat(data.price),
      driver_type: data.driver_type || 'factory',
      region_id: data.region_id
    })

    if (!tariff) {
      return Response.json({ error: "Failed to create tariff" }, { status: 500 })
    }

    return Response.json(tariff)
  } catch (error) {
    console.error('Error creating transport tariff:', error)
    return Response.json({ error: "Failed to create tariff" }, { status: 500 })
  }
}
