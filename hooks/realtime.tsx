"use client"

import { useEffect, useState, useCallback, useRef } from "react"

// Real-time synchronization hook
export function useRealtimeSync<T>(
  endpoint: string,
  interval: number = 30000, // 30 seconds default
  dependencies: any[] = []
) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastSync, setLastSync] = useState<Date | null>(null)
  const [isOnline, setIsOnline] = useState(true)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  const fetchData = useCallback(async (signal?: AbortSignal) => {
    try {
      const response = await fetch(endpoint, {
        signal,
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      setData(result)
      setLastSync(new Date())
      setError(null)
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        return // Request was aborted, don't update state
      }
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }, [endpoint])

  const startSync = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }

    // Initial fetch
    abortControllerRef.current = new AbortController()
    fetchData(abortControllerRef.current.signal)

    // Set up interval
    intervalRef.current = setInterval(() => {
      if (isOnline) {
        abortControllerRef.current = new AbortController()
        fetchData(abortControllerRef.current.signal)
      }
    }, interval)
  }, [fetchData, interval, isOnline])

  const stopSync = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
  }, [])

  const manualSync = useCallback(() => {
    abortControllerRef.current = new AbortController()
    fetchData(abortControllerRef.current.signal)
  }, [fetchData])

  // Handle online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      if (!intervalRef.current) {
        startSync()
      }
    }

    const handleOffline = () => {
      setIsOnline(false)
      stopSync()
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [startSync, stopSync])

  // Start/stop sync based on dependencies
  useEffect(() => {
    startSync()
    return () => stopSync()
  }, dependencies)

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopSync()
    }
  }, [stopSync])

  return {
    data,
    loading,
    error,
    lastSync,
    isOnline,
    manualSync,
    startSync,
    stopSync
  }
}

// WebSocket connection hook
export function useWebSocket(
  url: string,
  options: {
    onMessage?: (event: MessageEvent) => void
    onOpen?: (event: Event) => void
    onClose?: (event: CloseEvent) => void
    onError?: (event: Event) => void
    reconnectInterval?: number
    maxReconnectAttempts?: number
  } = {}
) {
  const [socket, setSocket] = useState<WebSocket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [reconnectAttempts, setReconnectAttempts] = useState(0)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const {
    onMessage,
    onOpen,
    onClose,
    onError,
    reconnectInterval = 5000,
    maxReconnectAttempts = 10
  } = options

  const connect = useCallback(() => {
    try {
      const ws = new WebSocket(url)
      
      ws.onopen = (event) => {
        setIsConnected(true)
        setReconnectAttempts(0)
        onOpen?.(event)
      }

      ws.onmessage = (event) => {
        onMessage?.(event)
      }

      ws.onclose = (event) => {
        setIsConnected(false)
        onClose?.(event)
        
        // Attempt to reconnect
        if (reconnectAttempts < maxReconnectAttempts) {
          reconnectTimeoutRef.current = setTimeout(() => {
            setReconnectAttempts(prev => prev + 1)
            connect()
          }, reconnectInterval)
        }
      }

      ws.onerror = (event) => {
        console.warn('WebSocket error:', event)
        onError?.(event)
      }

      setSocket(ws)
    } catch (error) {
      console.warn('WebSocket connection error:', error)
      // Don't throw error, just log it
    }
  }, [url, reconnectInterval, maxReconnectAttempts, reconnectAttempts])

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
    }
    if (socket) {
      socket.close()
      setSocket(null)
    }
    setIsConnected(false)
  }, [socket])

  const sendMessage = useCallback((message: string | ArrayBuffer | Blob) => {
    if (socket && isConnected) {
      socket.send(message)
    }
  }, [socket, isConnected])

  useEffect(() => {
    connect()
    return () => disconnect()
  }, [url]) // Only depend on url to prevent infinite re-renders

  return {
    socket,
    isConnected,
    reconnectAttempts,
    connect,
    disconnect,
    sendMessage
  }
}

// Optimistic updates hook
export function useOptimisticUpdates<T>(
  initialData: T,
  updateFn: (data: T, updates: Partial<T>) => T
) {
  const [data, setData] = useState<T>(initialData)
  const [pendingUpdates, setPendingUpdates] = useState<Map<string, Partial<T>>>(new Map())

  const optimisticUpdate = useCallback((id: string, updates: Partial<T>) => {
    // Apply optimistic update immediately
    setData(prevData => updateFn(prevData, updates))
    
    // Track pending update
    setPendingUpdates(prev => new Map(prev.set(id, updates)))
  }, [updateFn])

  const confirmUpdate = useCallback((id: string) => {
    setPendingUpdates(prev => {
      const newMap = new Map(prev)
      newMap.delete(id)
      return newMap
    })
  }, [])

  const revertUpdate = useCallback((id: string) => {
    const pendingUpdate = pendingUpdates.get(id)
    if (pendingUpdate) {
      // Revert the optimistic update
      setData(prevData => {
        const revertedData = { ...prevData }
        Object.keys(pendingUpdate).forEach(key => {
          // This is a simplified revert - in practice you'd need more sophisticated logic
          delete (revertedData as any)[key]
        })
        return revertedData
      })
      
      setPendingUpdates(prev => {
        const newMap = new Map(prev)
        newMap.delete(id)
        return newMap
      })
    }
  }, [pendingUpdates])

  return {
    data,
    pendingUpdates,
    optimisticUpdate,
    confirmUpdate,
    revertUpdate
  }
}

// Cache management hook
export function useCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = 300000 // 5 minutes default
) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const cacheRef = useRef<Map<string, { data: T; timestamp: number }>>(new Map())

  const getCachedData = useCallback(() => {
    const cached = cacheRef.current.get(key)
    if (cached && Date.now() - cached.timestamp < ttl) {
      return cached.data
    }
    return null
  }, [key, ttl])

  const setCachedData = useCallback((newData: T) => {
    cacheRef.current.set(key, {
      data: newData,
      timestamp: Date.now()
    })
    setData(newData)
  }, [key])

  const fetchData = useCallback(async (force = false) => {
    if (!force) {
      const cached = getCachedData()
      if (cached) {
        setData(cached)
        return cached
      }
    }

    setLoading(true)
    setError(null)

    try {
      const result = await fetcher()
      setCachedData(result)
      return result
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      throw err
    } finally {
      setLoading(false)
    }
  }, [fetcher, getCachedData, setCachedData])

  const invalidateCache = useCallback(() => {
    cacheRef.current.delete(key)
    setData(null)
  }, [key])

  const clearAllCache = useCallback(() => {
    cacheRef.current.clear()
    setData(null)
  }, [])

  return {
    data,
    loading,
    error,
    fetchData,
    invalidateCache,
    clearAllCache,
    getCachedData
  }
}

// Real-time notifications hook
export function useRealtimeNotifications() {
  const [notifications, setNotifications] = useState<any[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  const addNotification = useCallback((notification: any) => {
    setNotifications(prev => [notification, ...prev])
    setUnreadCount(prev => prev + 1)
  }, [])

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, is_read: true } : notif
      )
    )
    setUnreadCount(prev => Math.max(0, prev - 1))
  }, [])

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, is_read: true }))
    )
    setUnreadCount(0)
  }, [])

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id))
  }, [])

  return {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification
  }
}
