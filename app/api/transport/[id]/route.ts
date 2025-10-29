import { NextRequest, NextResponse } from 'next/server'
import { updateTransportTariff, deleteTransportTariff } from '@/lib/supabase-db'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    
    const updatedTariff = await updateTransportTariff(id, body)
    
    if (!updatedTariff) {
      return NextResponse.json({ error: 'Transport tariff not found' }, { status: 404 })
    }

    console.log('Transport tariff updated:', updatedTariff)
    return NextResponse.json({ tariff: updatedTariff }, { status: 200 })
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
    
    const success = await deleteTransportTariff(id)
    
    if (!success) {
      return NextResponse.json({ error: 'Transport tariff not found' }, { status: 404 })
    }

    console.log('Transport tariff deleted:', id)
    return NextResponse.json({ message: 'Transport tariff deleted successfully' }, { status: 200 })
  } catch (error) {
    console.error('Error deleting transport tariff:', error)
    return NextResponse.json({ error: 'Failed to delete transport tariff' }, { status: 500 })
  }
}