// Toast notification system for edit confirmations
import { toast } from "sonner"

export interface ToastConfig {
  title: string
  description?: string
  type?: 'success' | 'error' | 'warning' | 'info'
  duration?: number
}

export const showEditToast = (config: ToastConfig) => {
  const { title, description, type = 'success', duration = 4000 } = config
  
  switch (type) {
    case 'success':
      toast.success(title, {
        description,
        duration,
        className: "bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-200"
      })
      break
    case 'error':
      toast.error(title, {
        description,
        duration,
        className: "bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-200"
      })
      break
    case 'warning':
      toast.warning(title, {
        description,
        duration,
        className: "bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-200"
      })
      break
    case 'info':
      toast.info(title, {
        description,
        duration,
        className: "bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-200"
      })
      break
  }
}

export const showEditSuccessToast = (entityType: string, entityName: string) => {
  showEditToast({
    title: `${entityType} Updated Successfully`,
    description: `${entityName} has been updated and saved to the database.`,
    type: 'success'
  })
}

export const showEditErrorToast = (entityType: string, error: string) => {
  showEditToast({
    title: `Failed to Update ${entityType}`,
    description: error,
    type: 'error'
  })
}

export const showDeleteSuccessToast = (entityType: string, entityName: string) => {
  showEditToast({
    title: `${entityType} Deleted Successfully`,
    description: `${entityName} has been removed from the database.`,
    type: 'success'
  })
}

export const showDeleteErrorToast = (entityType: string, error: string) => {
  showEditToast({
    title: `Failed to Delete ${entityType}`,
    description: error,
    type: 'error'
  })
}
