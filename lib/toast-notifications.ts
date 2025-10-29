/**
 * Toast Notification System
 * Provides success and error notifications for all CRUD operations
 */

import { toast } from 'sonner'

export interface ToastConfig {
  title?: string
  description?: string
  duration?: number
}

// Success Toast Functions
export const showSuccessToast = (message: string, config?: ToastConfig) => {
  toast.success(message, {
    description: config?.description,
    duration: config?.duration || 4000,
  })
}

export const showCreateSuccessToast = (entity: string, config?: ToastConfig) => {
  showSuccessToast(`${entity} created successfully!`, {
    description: config?.description || `The ${entity.toLowerCase()} has been added to the system.`,
    ...config
  })
}

export const showUpdateSuccessToast = (entity: string, config?: ToastConfig) => {
  showSuccessToast(`${entity} updated successfully!`, {
    description: config?.description || `The ${entity.toLowerCase()} has been updated.`,
    ...config
  })
}

export const showDeleteSuccessToast = (entity: string, config?: ToastConfig) => {
  showSuccessToast(`${entity} deleted successfully!`, {
    description: config?.description || `The ${entity.toLowerCase()} has been removed from the system.`,
    ...config
  })
}

// Error Toast Functions
export const showErrorToast = (message: string, config?: ToastConfig) => {
  toast.error(message, {
    description: config?.description,
    duration: config?.duration || 6000,
  })
}

export const showCreateErrorToast = (entity: string, error?: any, config?: ToastConfig) => {
  const errorMessage = error?.message || 'Unknown error occurred'
  showErrorToast(`Failed to create ${entity.toLowerCase()}`, {
    description: config?.description || `Error: ${errorMessage}`,
    ...config
  })
}

export const showUpdateErrorToast = (entity: string, error?: any, config?: ToastConfig) => {
  const errorMessage = error?.message || 'Unknown error occurred'
  showErrorToast(`Failed to update ${entity.toLowerCase()}`, {
    description: config?.description || `Error: ${errorMessage}`,
    ...config
  })
}

export const showDeleteErrorToast = (entity: string, error?: any, config?: ToastConfig) => {
  const errorMessage = error?.message || 'Unknown error occurred'
  showErrorToast(`Failed to delete ${entity.toLowerCase()}`, {
    description: config?.description || `Error: ${errorMessage}`,
    ...config
  })
}

export const showFetchErrorToast = (entity: string, error?: any, config?: ToastConfig) => {
  const errorMessage = error?.message || 'Unknown error occurred'
  showErrorToast(`Failed to load ${entity.toLowerCase()}`, {
    description: config?.description || `Error: ${errorMessage}`,
    ...config
  })
}

// Loading Toast Functions
export const showLoadingToast = (message: string) => {
  return toast.loading(message, {
    duration: Infinity,
  })
}

export const dismissToast = (toastId: string) => {
  toast.dismiss(toastId)
}

// Specific Entity Toasts
export const showClientSuccessToast = (action: 'create' | 'update' | 'delete') => {
  switch (action) {
    case 'create':
      showCreateSuccessToast('Client')
      break
    case 'update':
      showUpdateSuccessToast('Client')
      break
    case 'delete':
      showDeleteSuccessToast('Client')
      break
  }
}

export const showClientErrorToast = (action: 'create' | 'update' | 'delete', error?: any) => {
  switch (action) {
    case 'create':
      showCreateErrorToast('Client', error)
      break
    case 'update':
      showUpdateErrorToast('Client', error)
      break
    case 'delete':
      showDeleteErrorToast('Client', error)
      break
  }
}

export const showOrderSuccessToast = (action: 'create' | 'update' | 'delete') => {
  switch (action) {
    case 'create':
      showCreateSuccessToast('Order')
      break
    case 'update':
      showUpdateSuccessToast('Order')
      break
    case 'delete':
      showDeleteSuccessToast('Order')
      break
  }
}

export const showOrderErrorToast = (action: 'create' | 'update' | 'delete', error?: any) => {
  switch (action) {
    case 'create':
      showCreateErrorToast('Order', error)
      break
    case 'update':
      showUpdateErrorToast('Order', error)
      break
    case 'delete':
      showDeleteErrorToast('Order', error)
      break
  }
}

export const showTransportTariffSuccessToast = (action: 'create' | 'update' | 'delete') => {
  switch (action) {
    case 'create':
      showCreateSuccessToast('Transport Tariff')
      break
    case 'update':
      showUpdateSuccessToast('Transport Tariff')
      break
    case 'delete':
      showDeleteSuccessToast('Transport Tariff')
      break
  }
}

export const showTransportTariffErrorToast = (action: 'create' | 'update' | 'delete', error?: any) => {
  switch (action) {
    case 'create':
      showCreateErrorToast('Transport Tariff', error)
      break
    case 'update':
      showUpdateErrorToast('Transport Tariff', error)
      break
    case 'delete':
      showDeleteErrorToast('Transport Tariff', error)
      break
  }
}

export const showProductSuccessToast = (action: 'create' | 'update' | 'delete') => {
  switch (action) {
    case 'create':
      showCreateSuccessToast('Product')
      break
    case 'update':
      showUpdateSuccessToast('Product')
      break
    case 'delete':
      showDeleteSuccessToast('Product')
      break
  }
}

export const showProductErrorToast = (action: 'create' | 'update' | 'delete', error?: any) => {
  switch (action) {
    case 'create':
      showCreateErrorToast('Product', error)
      break
    case 'update':
      showUpdateErrorToast('Product', error)
      break
    case 'delete':
      showDeleteErrorToast('Product', error)
      break
  }
}

export const showBLNumberSuccessToast = (action: 'create' | 'update' | 'delete') => {
  switch (action) {
    case 'create':
      showCreateSuccessToast('BL Number')
      break
    case 'update':
      showUpdateSuccessToast('BL Number')
      break
    case 'delete':
      showDeleteSuccessToast('BL Number')
      break
  }
}

export const showBLNumberErrorToast = (action: 'create' | 'update' | 'delete', error?: any) => {
  switch (action) {
    case 'create':
      showCreateErrorToast('BL Number', error)
      break
    case 'update':
      showUpdateErrorToast('BL Number', error)
      break
    case 'delete':
      showDeleteErrorToast('BL Number', error)
      break
  }
}

export const showGoalSuccessToast = (action: 'create' | 'update' | 'delete') => {
  switch (action) {
    case 'create':
      showCreateSuccessToast('Goal')
      break
    case 'update':
      showUpdateSuccessToast('Goal')
      break
    case 'delete':
      showDeleteSuccessToast('Goal')
      break
  }
}

export const showGoalErrorToast = (action: 'create' | 'update' | 'delete', error?: any) => {
  switch (action) {
    case 'create':
      showCreateErrorToast('Goal', error)
      break
    case 'update':
      showUpdateErrorToast('Goal', error)
      break
    case 'delete':
      showDeleteErrorToast('Goal', error)
      break
  }
}

export const showNotificationSuccessToast = (action: 'create' | 'update' | 'delete') => {
  switch (action) {
    case 'create':
      showCreateSuccessToast('Notification')
      break
    case 'update':
      showUpdateSuccessToast('Notification')
      break
    case 'delete':
      showDeleteSuccessToast('Notification')
      break
  }
}

export const showNotificationErrorToast = (action: 'create' | 'update' | 'delete', error?: any) => {
  switch (action) {
    case 'create':
      showCreateErrorToast('Notification', error)
      break
    case 'update':
      showUpdateErrorToast('Notification', error)
      break
    case 'delete':
      showDeleteErrorToast('Notification', error)
      break
  }
}

// Alias functions for backward compatibility (showEditSuccessToast, showEditErrorToast)
export const showEditSuccessToast = (entity: string, details?: string) => {
  showUpdateSuccessToast(entity, details ? { description: details } : undefined)
}

export const showEditErrorToast = (entity: string, error?: any) => {
  showUpdateErrorToast(entity, error)
}