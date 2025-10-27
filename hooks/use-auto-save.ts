"use client"

import { useState, useEffect, useCallback, useRef } from 'react'
import { useToast } from '@/lib/toast-context'

interface AutoSaveOptions {
  delay?: number
  validate?: (data: any) => Promise<boolean> | boolean
  onSave?: (data: any) => Promise<any>
  onError?: (error: Error) => void
  enabled?: boolean
  showToast?: boolean
}

interface AutoSaveReturn {
  isSaving: boolean
  hasUnsavedChanges: boolean
  lastSaved: Date | null
  save: () => Promise<void>
  reset: () => void
  setData: (data: any) => void
}

export function useAutoSave<T>(
  initialData: T,
  options: AutoSaveOptions = {}
): AutoSaveReturn {
  const {
    delay = 2000,
    validate,
    onSave,
    onError,
    enabled = true,
    showToast = true
  } = options

  const { showSuccess, showError } = useToast()
  const [data, setData] = useState<T>(initialData)
  const [isSaving, setIsSaving] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  
  const timeoutRef = useRef<NodeJS.Timeout>()
  const previousDataRef = useRef<T>(initialData)

  // Check if data has changed
  const hasDataChanged = useCallback((newData: T) => {
    return JSON.stringify(newData) !== JSON.stringify(previousDataRef.current)
  }, [])

  // Save function
  const save = useCallback(async () => {
    if (!enabled || !onSave || !hasDataChanged(data)) {
      return
    }

    try {
      setIsSaving(true)

      // Validate data if validator provided
      if (validate) {
        const isValid = await validate(data)
        if (!isValid) {
          throw new Error('Data validation failed')
        }
      }

      // Save data
      await onSave(data)
      
      // Update state
      previousDataRef.current = data
      setHasUnsavedChanges(false)
      setLastSaved(new Date())
      
      if (showToast) {
        showSuccess('Data Saved', 'Your changes have been saved successfully')
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save data'
      
      if (showToast) {
        showError('Save Failed', errorMessage)
      }
      
      if (onError) {
        onError(error instanceof Error ? error : new Error(errorMessage))
      }
    } finally {
      setIsSaving(false)
    }
  }, [data, enabled, onSave, validate, showToast, showSuccess, showError, onError, hasDataChanged])

  // Auto-save effect
  useEffect(() => {
    if (!enabled || !hasDataChanged(data)) {
      return
    }

    setHasUnsavedChanges(true)

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // Set new timeout
    timeoutRef.current = setTimeout(() => {
      save()
    }, delay)

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [data, delay, enabled, save, hasDataChanged])

  // Reset function
  const reset = useCallback(() => {
    setData(initialData)
    previousDataRef.current = initialData
    setHasUnsavedChanges(false)
    setLastSaved(null)
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
  }, [initialData])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return {
    isSaving,
    hasUnsavedChanges,
    lastSaved,
    save,
    reset,
    setData
  }
}
