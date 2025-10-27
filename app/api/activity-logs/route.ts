import { NextRequest, NextResponse } from 'next/server'

// In-memory storage for activity logs (replace with database in production)
let activityLogs: any[] = []

export async function POST(request: NextRequest) {
  try {
    const logEntry = await request.json()
    
    // Add timestamp if not provided
    if (!logEntry.timestamp) {
      logEntry.timestamp = new Date().toISOString()
    }
    
    // Add to logs
    activityLogs.push(logEntry)
    
    // Keep only last 1000 logs to prevent memory issues
    if (activityLogs.length > 1000) {
      activityLogs = activityLogs.slice(-1000)
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Activity logged successfully',
      logId: logEntry.id
    })
  } catch (error) {
    console.error('Error logging activity:', error)
    return NextResponse.json({ error: 'Failed to log activity' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('user_id')
    const entityType = searchParams.get('entity_type')
    const limit = parseInt(searchParams.get('limit') || '100')
    
    let filteredLogs = activityLogs
    
    // Filter by user if specified
    if (userId) {
      filteredLogs = filteredLogs.filter(log => log.user_id === userId)
    }
    
    // Filter by entity type if specified
    if (entityType) {
      filteredLogs = filteredLogs.filter(log => log.entity_type === entityType)
    }
    
    // Sort by timestamp (newest first)
    filteredLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    
    // Limit results
    filteredLogs = filteredLogs.slice(0, limit)
    
    return NextResponse.json({ 
      logs: filteredLogs,
      total: activityLogs.length,
      filtered: filteredLogs.length
    })
  } catch (error) {
    console.error('Error fetching activity logs:', error)
    return NextResponse.json({ error: 'Failed to fetch activity logs' }, { status: 500 })
  }
}
