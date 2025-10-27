"use client"

import React, { useEffect, useState, useCallback, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { RefreshCw, Zap, Clock, Database, Network, Cpu } from "lucide-react"

// Performance monitoring hook
export function usePerformanceMonitor() {
  const [metrics, setMetrics] = useState({
    loadTime: 0,
    renderTime: 0,
    apiCalls: 0,
    cacheHits: 0,
    cacheMisses: 0,
    memoryUsage: 0
  })

  const startTime = useMemo(() => Date.now(), [])

  useEffect(() => {
    const endTime = Date.now()
    setMetrics(prev => ({
      ...prev,
      loadTime: endTime - startTime
    }))
  }, [startTime])

  return metrics
}

// Optimized loading component
export function OptimizedLoader({ 
  isLoading, 
  children, 
  skeletonCount = 3,
  className = ""
}: {
  isLoading: boolean
  children: React.ReactNode
  skeletonCount?: number
  className?: string
}) {
  if (isLoading) {
    return (
      <div className={`space-y-4 ${className}`}>
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <Card key={i} className="p-6">
            <div className="space-y-3">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-8 w-full" />
            </div>
          </Card>
        ))}
      </div>
    )
  }

  return <>{children}</>
}

// Optimized data fetching hook
export function useOptimizedFetch<T>(
  url: string,
  options: RequestInit = {},
  dependencies: any[] = []
) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastFetch, setLastFetch] = useState<number>(0)

  const fetchData = useCallback(async () => {
    const now = Date.now()
    const CACHE_DURATION = 30000 // 30 seconds cache
    
    // Check if we have cached data and it's still fresh
    if (data && (now - lastFetch) < CACHE_DURATION) {
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(url, {
        ...options,
        headers: {
          'Cache-Control': 'max-age=30',
          ...options.headers
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      setData(result)
      setLastFetch(now)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }, [url, JSON.stringify(options), data, lastFetch])

  useEffect(() => {
    fetchData()
  }, dependencies)

  const refetch = useCallback(() => {
    setLastFetch(0) // Force refresh
    fetchData()
  }, [fetchData])

  return { data, loading, error, refetch }
}

// Performance dashboard component
export function PerformanceDashboard() {
  const [isVisible, setIsVisible] = useState(false)
  const metrics = usePerformanceMonitor()

  if (!isVisible) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 z-50"
      >
        <Zap className="h-4 w-4 mr-2" />
        Performance
      </Button>
    )
  }

  return (
    <Card className="fixed bottom-4 right-4 z-50 w-80 shadow-xl">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-500" />
            Performance Monitor
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsVisible(false)}
          >
            ×
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">Load Time</span>
            </div>
            <Badge variant={metrics.loadTime < 1000 ? "default" : "destructive"}>
              {metrics.loadTime}ms
            </Badge>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium">API Calls</span>
            </div>
            <Badge variant="outline">
              {metrics.apiCalls}
            </Badge>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Network className="h-4 w-4 text-purple-500" />
              <span className="text-sm font-medium">Cache Hit</span>
            </div>
            <Badge variant={metrics.cacheHits > metrics.cacheMisses ? "default" : "secondary"}>
              {metrics.cacheHits}/{metrics.cacheHits + metrics.cacheMisses}
            </Badge>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Cpu className="h-4 w-4 text-orange-500" />
              <span className="text-sm font-medium">Memory</span>
            </div>
            <Badge variant="outline">
              {metrics.memoryUsage}MB
            </Badge>
          </div>
        </div>
        
        <div className="pt-2 border-t">
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => window.location.reload()}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Page
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// Optimized table component
export function OptimizedTable<T>({
  data,
  columns,
  loading,
  onRowClick,
  className = ""
}: {
  data: T[]
  columns: Array<{
    key: keyof T
    label: string
    render?: (value: any, row: T) => React.ReactNode
  }>
  loading: boolean
  onRowClick?: (row: T) => void
  className?: string
}) {
  const memoizedData = useMemo(() => data, [data])

  if (loading) {
    return (
      <div className={`space-y-2 ${className}`}>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex space-x-4 p-4 border rounded">
            {columns.map((_, j) => (
              <Skeleton key={j} className="h-4 flex-1" />
            ))}
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="w-full">
        <thead>
          <tr className="border-b">
            {columns.map((column) => (
              <th key={String(column.key)} className="text-left p-4 font-medium">
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {memoizedData.map((row, index) => (
            <tr
              key={index}
              className={`border-b hover:bg-gray-50 dark:hover:bg-gray-800 ${
                onRowClick ? 'cursor-pointer' : ''
              }`}
              onClick={() => onRowClick?.(row)}
            >
              {columns.map((column) => (
                <td key={String(column.key)} className="p-4">
                  {column.render
                    ? column.render(row[column.key], row)
                    : String(row[column.key] || '')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// Debounced search hook
export function useDebouncedSearch<T>(
  data: T[],
  searchTerm: string,
  searchFields: (keyof T)[],
  delay: number = 300
) {
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, delay)

    return () => clearTimeout(timer)
  }, [searchTerm, delay])

  const filteredData = useMemo(() => {
    if (!debouncedSearchTerm) return data

    return data.filter((item) =>
      searchFields.some((field) => {
        const value = item[field]
        return String(value).toLowerCase().includes(debouncedSearchTerm.toLowerCase())
      })
    )
  }, [data, debouncedSearchTerm, searchFields])

  return filteredData
}

// Virtual scrolling hook for large lists
export function useVirtualScroll<T>(
  items: T[],
  itemHeight: number = 50,
  containerHeight: number = 400
) {
  const [scrollTop, setScrollTop] = useState(0)

  const visibleItems = useMemo(() => {
    const startIndex = Math.floor(scrollTop / itemHeight)
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / itemHeight) + 1,
      items.length
    )

    return items.slice(startIndex, endIndex).map((item, index) => ({
      item,
      index: startIndex + index
    }))
  }, [items, scrollTop, itemHeight, containerHeight])

  const totalHeight = items.length * itemHeight
  const offsetY = Math.floor(scrollTop / itemHeight) * itemHeight

  return {
    visibleItems,
    totalHeight,
    offsetY,
    setScrollTop
  }
}
