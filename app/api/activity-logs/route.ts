import { NextRequest, NextResponse } from 'next/server'
import { getActivityLogs, createActivityLog } from '@/lib/supabase-db'
import { initializeDatabase } from '@/lib/supabase-db'

export async function GET(request: NextRequest) {
  try {
    await initializeDatabase()
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('user_id')
    const actionType = searchParams.get('action_type')
    const affectedTable = searchParams.get('affected_table')
    
    let activityLogs = await getActivityLogs()
    
    if (userId) {
      activityLogs = activityLogs.filter(log => log.user_id === userId)
    }
    
    if (actionType) {
      activityLogs = activityLogs.filter(log => log.action_type === actionType)
    }
    
    if (affectedTable) {
      activityLogs = activityLogs.filter(log => log.affected_table === affectedTable)
    }
    
    return NextResponse.json({ activityLogs })
  } catch (error) {
    console.error('Error fetching activity logs:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await initializeDatabase()
    const logEntry = await request.json()
    
    // Validate required fields
    if (!logEntry.user_id || !logEntry.action_type || !logEntry.details || !logEntry.affected_table) {
      return NextResponse.json(
        { error: 'Missing required fields: user_id, action_type, details, affected_table' },
        { status: 400 }
      )
    }
    
    const activityLog = await createActivityLog({
      user_id: logEntry.user_id,
      action_type: logEntry.action_type,
      details: logEntry.details,
      affected_table: logEntry.affected_table,
      affected_record_id: logEntry.affected_record_id || null
    })
    
    if (!activityLog) {
      return NextResponse.json(
        { error: 'Failed to create activity log' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Activity logged successfully',
      logId: activityLog.id
    })
  } catch (error) {
    console.error('Error logging activity:', error)
    return NextResponse.json({ error: 'Failed to log activity' }, { status: 500 })
  }
}