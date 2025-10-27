"use client"

import React, { createContext, useContext, useState, useCallback } from 'react'
import { toast as sonnerToast } from 'sonner'

export interface Toast {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message: string
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}

interface ToastContextType {
  showToast: (toast: Omit<Toast, 'id'>) => void
  showSuccess: (title: string, message?: string, options?: Partial<Toast>) => void
  showError: (title: string, message?: string, options?: Partial<Toast>) => void
  showWarning: (title: string, message?: string, options?: Partial<Toast>) => void
  showInfo: (title: string, message?: string, options?: Partial<Toast>) => void
  clearToasts: () => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const showToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    
    const toastConfig = {
      id,
      duration: toast.duration || 5000,
      ...toast
    }

    switch (toast.type) {
      case 'success':
        sonnerToast.success(toast.title, {
          description: toast.message,
          duration: toastConfig.duration,
          action: toast.action ? {
            label: toast.action.label,
            onClick: toast.action.onClick
          } : undefined
        })
        break
      case 'error':
        sonnerToast.error(toast.title, {
          description: toast.message,
          duration: toastConfig.duration,
          action: toast.action ? {
            label: toast.action.label,
            onClick: toast.action.onClick
          } : undefined
        })
        break
      case 'warning':
        sonnerToast.warning(toast.title, {
          description: toast.message,
          duration: toastConfig.duration,
          action: toast.action ? {
            label: toast.action.label,
            onClick: toast.action.onClick
          } : undefined
        })
        break
      case 'info':
        sonnerToast.info(toast.title, {
          description: toast.message,
          duration: toastConfig.duration,
          action: toast.action ? {
            label: toast.action.label,
            onClick: toast.action.onClick
          } : undefined
        })
        break
    }
  }, [])

  const showSuccess = useCallback((title: string, message?: string, options?: Partial<Toast>) => {
    showToast({
      type: 'success',
      title,
      message: message || '',
      ...options
    })
  }, [showToast])

  const showError = useCallback((title: string, message?: string, options?: Partial<Toast>) => {
    showToast({
      type: 'error',
      title,
      message: message || '',
      duration: 8000, // Longer duration for errors
      ...options
    })
  }, [showToast])

  const showWarning = useCallback((title: string, message?: string, options?: Partial<Toast>) => {
    showToast({
      type: 'warning',
      title,
      message: message || '',
      ...options
    })
  }, [showToast])

  const showInfo = useCallback((title: string, message?: string, options?: Partial<Toast>) => {
    showToast({
      type: 'info',
      title,
      message: message || '',
      ...options
    })
  }, [showToast])

  const clearToasts = useCallback(() => {
    sonnerToast.dismiss()
  }, [])

  return (
    <ToastContext.Provider value={{
      showToast,
      showSuccess,
      showError,
      showWarning,
      showInfo,
      clearToasts
    }}>
      {children}
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}
