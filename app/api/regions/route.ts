import { NextRequest, NextResponse } from 'next/server'
import { getRegions } from '@/lib/supabase-db'
import { initializeDatabase } from '@/lib/supabase-db'

export async function GET(request: NextRequest) {
  try {
    await initializeDatabase()
    const regions = await getRegions()

    return NextResponse.json({
      regions: regions
    })
  } catch (error) {
    console.error('Error fetching regions:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
