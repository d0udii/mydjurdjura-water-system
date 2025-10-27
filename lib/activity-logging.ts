// Activity logging utility for edit operations
export interface ActivityLogEntry {
  id: string
  user_id: string
  user_name: string
  action_type: 'UPDATE' | 'DELETE' | 'CREATE'
  entity_type: string
  entity_id: string
  entity_name: string
  details: string
  old_values?: Record<string, any>
  new_values?: Record<string, any>
  timestamp: string
  ip_address?: string
  user_agent?: string
}

export const createActivityLog = async (
  userId: string,
  userName: string,
  actionType: 'UPDATE' | 'DELETE' | 'CREATE',
  entityType: string,
  entityId: string,
  entityName: string,
  details: string,
  oldValues?: Record<string, any>,
  newValues?: Record<string, any>
): Promise<void> => {
  try {
    const logEntry: ActivityLogEntry = {
      id: `LOG-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      user_id: userId,
      user_name: userName,
      action_type: actionType,
      entity_type: entityType,
      entity_id: entityId,
      entity_name: entityName,
      details,
      old_values: oldValues,
      new_values: newValues,
      timestamp: new Date().toISOString(),
      ip_address: '127.0.0.1', // In production, get from request
      user_agent: 'Djurdjura Water System'
    }

    // Send to API for logging
    const response = await fetch('/api/activity-logs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(logEntry)
    })

    if (!response.ok) {
      console.error('Failed to log activity:', await response.text())
    }
  } catch (error) {
    console.error('Error creating activity log:', error)
  }
}

export const logEditActivity = async (
  userId: string,
  userName: string,
  entityType: string,
  entityId: string,
  entityName: string,
  oldValues: Record<string, any>,
  newValues: Record<string, any>
): Promise<void> => {
  const changes = Object.keys(newValues)
    .filter(key => oldValues[key] !== newValues[key])
    .map(key => `${key}: ${oldValues[key]} → ${newValues[key]}`)
    .join(', ')

  await createActivityLog(
    userId,
    userName,
    'UPDATE',
    entityType,
    entityId,
    entityName,
    `Updated ${entityType.toLowerCase()}: ${changes}`,
    oldValues,
    newValues
  )
}

export const logDeleteActivity = async (
  userId: string,
  userName: string,
  entityType: string,
  entityId: string,
  entityName: string,
  deletedValues: Record<string, any>
): Promise<void> => {
  await createActivityLog(
    userId,
    userName,
    'DELETE',
    entityType,
    entityId,
    entityName,
    `Deleted ${entityType.toLowerCase()}: ${entityName}`,
    deletedValues,
    undefined
  )
}

export const logCreateActivity = async (
  userId: string,
  userName: string,
  entityType: string,
  entityId: string,
  entityName: string,
  newValues: Record<string, any>
): Promise<void> => {
  await createActivityLog(
    userId,
    userName,
    'CREATE',
    entityType,
    entityId,
    entityName,
    `Created ${entityType.toLowerCase()}: ${entityName}`,
    undefined,
    newValues
  )
}
