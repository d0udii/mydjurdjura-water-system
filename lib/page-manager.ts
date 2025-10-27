/**
 * Page Loading and Data Persistence Utilities
 * Ensures every page loads correctly and saves data instantly
 */

import { safeApiCall, AppError, ErrorCodes } from './error-handling'

export interface PageState {
  loading: boolean
  error: AppError | null
  data: any
  lastUpdated: string | null
}

export interface PersistenceConfig {
  key: string
  ttl?: number // Time to live in milliseconds
  encrypt?: boolean
}

export class PageManager {
  private static instance: PageManager
  private cache: Map<string, any> = new Map()
  private loadingStates: Map<string, boolean> = new Map()
  private errorStates: Map<string, AppError | null> = new Map()

  static getInstance(): PageManager {
    if (!PageManager.instance) {
      PageManager.instance = new PageManager()
    }
    return PageManager.instance
  }

  // Data persistence methods
  saveToLocalStorage(key: string, data: any, config?: PersistenceConfig): void {
    try {
      const persistenceData = {
        data,
        timestamp: Date.now(),
        ttl: config?.ttl || 24 * 60 * 60 * 1000, // Default 24 hours
        version: '1.0'
      }
      
      const serializedData = JSON.stringify(persistenceData)
      localStorage.setItem(key, serializedData)
    } catch (error) {
      console.error('Failed to save to localStorage:', error)
    }
  }

  loadFromLocalStorage<T>(key: string, config?: PersistenceConfig): T | null {
    try {
      const serializedData = localStorage.getItem(key)
      if (!serializedData) return null

      const persistenceData = JSON.parse(serializedData)
      const now = Date.now()
      
      // Check if data has expired
      if (now - persistenceData.timestamp > persistenceData.ttl) {
        localStorage.removeItem(key)
        return null
      }

      return persistenceData.data
    } catch (error) {
      console.error('Failed to load from localStorage:', error)
      return null
    }
  }

  clearLocalStorage(key: string): void {
    try {
      localStorage.removeItem(key)
    } catch (error) {
      console.error('Failed to clear localStorage:', error)
    }
  }

  // Loading state management
  setLoading(pageId: string, loading: boolean): void {
    this.loadingStates.set(pageId, loading)
  }

  isLoading(pageId: string): boolean {
    return this.loadingStates.get(pageId) || false
  }

  // Error state management
  setError(pageId: string, error: AppError | null): void {
    this.errorStates.set(pageId, error)
  }

  getError(pageId: string): AppError | null {
    return this.errorStates.get(pageId) || null
  }

  // Cache management
  setCache(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    })
  }

  getCache<T>(key: string, maxAge: number = 5 * 60 * 1000): T | null {
    const cached = this.cache.get(key)
    if (!cached) return null

    const now = Date.now()
    if (now - cached.timestamp > maxAge) {
      this.cache.delete(key)
      return null
    }

    return cached.data
  }

  clearCache(key?: string): void {
    if (key) {
      this.cache.delete(key)
    } else {
      this.cache.clear()
    }
  }

  // Instant data saving
  async saveDataInstantly<T>(
    pageId: string,
    apiCall: () => Promise<Response>,
    localData: T,
    persistenceKey?: string
  ): Promise<{ success: boolean; error?: AppError }> {
    try {
      // Save to local storage immediately for instant feedback
      if (persistenceKey) {
        this.saveToLocalStorage(persistenceKey, localData)
      }

      // Update cache immediately
      this.setCache(`${pageId}_data`, localData)

      // Make API call
      const result = await safeApiCall(apiCall, `Save data for ${pageId}`)
      
      if (result.error) {
        // Revert local changes on API failure
        if (persistenceKey) {
          this.clearLocalStorage(persistenceKey)
        }
        this.clearCache(`${pageId}_data`)
        
        return { success: false, error: result.error }
      }

      return { success: true }
    } catch (error) {
      const appError = error instanceof AppError ? error : new AppError(
        'Failed to save data',
        ErrorCodes.SERVER_ERROR,
        error
      )
      
      return { success: false, error: appError }
    }
  }

  // Page loading with error handling
  async loadPageData<T>(
    pageId: string,
    apiCall: () => Promise<Response>,
    persistenceKey?: string,
    useCache: boolean = true
  ): Promise<{ data?: T; error?: AppError; fromCache?: boolean }> {
    try {
      this.setLoading(pageId, true)
      this.setError(pageId, null)

      // Try cache first
      if (useCache) {
        const cachedData = this.getCache<T>(`${pageId}_data`)
        if (cachedData) {
          this.setLoading(pageId, false)
          return { data: cachedData, fromCache: true }
        }
      }

      // Try localStorage
      if (persistenceKey) {
        const localData = this.loadFromLocalStorage<T>(persistenceKey)
        if (localData) {
          this.setCache(`${pageId}_data`, localData)
          this.setLoading(pageId, false)
          return { data: localData, fromCache: true }
        }
      }

      // Make API call
      const result = await safeApiCall(apiCall, `Load data for ${pageId}`)
      
      if (result.error) {
        this.setError(pageId, result.error)
        this.setLoading(pageId, false)
        return { error: result.error }
      }

      // Cache the result
      this.setCache(`${pageId}_data`, result.data)
      
      // Save to localStorage if persistence key provided
      if (persistenceKey && result.data) {
        this.saveToLocalStorage(persistenceKey, result.data)
      }

      this.setLoading(pageId, false)
      return { data: result.data }
    } catch (error) {
      const appError = error instanceof AppError ? error : new AppError(
        'Failed to load page data',
        ErrorCodes.SERVER_ERROR,
        error
      )
      
      this.setError(pageId, appError)
      this.setLoading(pageId, false)
      return { error: appError }
    }
  }

  // Real-time data updates
  async refreshData<T>(
    pageId: string,
    apiCall: () => Promise<Response>,
    persistenceKey?: string
  ): Promise<{ data?: T; error?: AppError }> {
    try {
      const result = await safeApiCall(apiCall, `Refresh data for ${pageId}`)
      
      if (result.error) {
        this.setError(pageId, result.error)
        return { error: result.error }
      }

      // Update cache
      this.setCache(`${pageId}_data`, result.data)
      
      // Update localStorage
      if (persistenceKey && result.data) {
        this.saveToLocalStorage(persistenceKey, result.data)
      }

      this.setError(pageId, null)
      return { data: result.data }
    } catch (error) {
      const appError = error instanceof AppError ? error : new AppError(
        'Failed to refresh data',
        ErrorCodes.SERVER_ERROR,
        error
      )
      
      this.setError(pageId, appError)
      return { error: appError }
    }
  }

  // Auto-save functionality
  createAutoSave<T>(
    pageId: string,
    data: T,
    saveFunction: (data: T) => Promise<Response>,
    persistenceKey?: string,
    interval: number = 30000 // 30 seconds
  ): () => void {
    const autoSave = async () => {
      try {
        await this.saveDataInstantly(pageId, () => saveFunction(data), data, persistenceKey)
      } catch (error) {
        console.error('Auto-save failed:', error)
      }
    }

    const intervalId = setInterval(autoSave, interval)
    
    // Return cleanup function
    return () => clearInterval(intervalId)
  }

  // Form validation
  validateFormData(data: any, rules: Record<string, any>): { valid: boolean; errors: string[] } {
    const errors: string[] = []

    for (const [field, rule] of Object.entries(rules)) {
      const value = data[field]

      if (rule.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
        errors.push(`${field} is required`)
        continue
      }

      if (value && rule.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        errors.push(`${field} must be a valid email`)
      }

      if (value && rule.type === 'phone' && !/^[\+]?[0-9\s\-\(\)]+$/.test(value)) {
        errors.push(`${field} must be a valid phone number`)
      }

      if (value && rule.type === 'number' && typeof value !== 'number') {
        errors.push(`${field} must be a number`)
      }

      if (value && rule.min && value < rule.min) {
        errors.push(`${field} must be at least ${rule.min}`)
      }

      if (value && rule.max && value > rule.max) {
        errors.push(`${field} must be at most ${rule.max}`)
      }
    }

    return { valid: errors.length === 0, errors }
  }
}

// Export singleton instance
export const pageManager = PageManager.getInstance()

// React hook for page management
export function usePageManager(pageId: string) {
  return {
    isLoading: () => pageManager.isLoading(pageId),
    getError: () => pageManager.getError(pageId),
    setLoading: (loading: boolean) => pageManager.setLoading(pageId, loading),
    setError: (error: AppError | null) => pageManager.setError(pageId, error),
    loadData: <T>(apiCall: () => Promise<Response>, persistenceKey?: string) => 
      pageManager.loadPageData<T>(pageId, apiCall, persistenceKey),
    saveData: <T>(apiCall: () => Promise<Response>, data: T, persistenceKey?: string) =>
      pageManager.saveDataInstantly(pageId, apiCall, data, persistenceKey),
    refreshData: <T>(apiCall: () => Promise<Response>, persistenceKey?: string) =>
      pageManager.refreshData<T>(pageId, apiCall, persistenceKey)
  }
}
