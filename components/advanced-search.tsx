"use client"

import React, { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { 
  Search, 
  Filter, 
  X, 
  Calendar as CalendarIcon,
  MapPin,
  User,
  Package,
  DollarSign,
  Clock,
  SortAsc,
  SortDesc,
  Download,
  RefreshCw,
  Zap,
  Target,
  BarChart3
} from "lucide-react"
import { format } from "date-fns"
import { useAuth } from "@/lib/auth"
import { withAuth } from "@/lib/auth"

interface SearchFilter {
  id: string
  name: string
  type: 'text' | 'select' | 'date' | 'range' | 'checkbox' | 'multiselect'
  options?: string[]
  value: any
  operator?: 'equals' | 'contains' | 'starts_with' | 'ends_with' | 'greater_than' | 'less_than' | 'between'
}

interface SearchResult {
  id: string
  type: 'order' | 'client' | 'user' | 'product'
  title: string
  description: string
  metadata: any
  score: number
  created_at: string
  updated_at: string
}

interface AdvancedSearchProps {
  className?: string
  onResults?: (results: SearchResult[]) => void
}

export const AdvancedSearch: React.FC<AdvancedSearchProps> = ({ className, onResults }) => {
  const { user } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState<SearchFilter[]>([])
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [sortBy, setSortBy] = useState('relevance')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [searchHistory, setSearchHistory] = useState<string[]>([])

  const predefinedFilters: SearchFilter[] = [
    {
      id: 'status',
      name: 'Status',
      type: 'multiselect',
      options: ['pending', 'processing', 'in_transit', 'delivered', 'cancelled'],
      value: [],
      operator: 'equals'
    },
    {
      id: 'date_range',
      name: 'Date Range',
      type: 'date',
      value: null,
      operator: 'between'
    },
    {
      id: 'price_range',
      name: 'Price Range',
      type: 'range',
      value: [0, 1000000],
      operator: 'between'
    },
    {
      id: 'region',
      name: 'Region',
      type: 'select',
      options: ['East', 'West', 'North', 'South'],
      value: '',
      operator: 'equals'
    },
    {
      id: 'client_type',
      name: 'Client Type',
      type: 'select',
      options: ['individual', 'business', 'government'],
      value: '',
      operator: 'equals'
    },
    {
      id: 'truck_type',
      name: 'Truck Type',
      type: 'select',
      options: ['factory', 'client_own'],
      value: '',
      operator: 'equals'
    }
  ]

  const searchData = async () => {
    try {
      setLoading(true)
      
      // Fetch data from multiple sources
      const [ordersResponse, clientsResponse, usersResponse] = await Promise.all([
        fetch('/api/orders'),
        fetch('/api/clients'),
        fetch('/api/users')
      ])

      const ordersData = await ordersResponse.json()
      const clientsData = await clientsResponse.json()
      const usersData = await usersResponse.json()

      // Combine all data
      const allData: SearchResult[] = [
        ...(ordersData.orders || []).map((order: any) => ({
          id: order.id,
          type: 'order' as const,
          title: `Order ${order.id}`,
          description: `${order.clients?.name || 'Unknown Client'} - ${order.total_price.toLocaleString()} DA`,
          metadata: order,
          score: 0,
          created_at: order.created_at,
          updated_at: order.updated_at
        })),
        ...(clientsData.clients || []).map((client: any) => ({
          id: client.id,
          type: 'client' as const,
          title: client.name,
          description: `${client.address} - ${client.phone}`,
          metadata: client,
          score: 0,
          created_at: client.created_at || new Date().toISOString(),
          updated_at: client.updated_at || new Date().toISOString()
        })),
        ...(usersData.users || []).map((user: any) => ({
          id: user.id,
          type: 'user' as const,
          title: user.name,
          description: `${user.email} - ${user.role}`,
          metadata: user,
          score: 0,
          created_at: user.created_at || new Date().toISOString(),
          updated_at: user.updated_at || new Date().toISOString()
        }))
      ]

      // Apply search query and filters
      let filteredResults = allData

      // Apply text search
      if (searchQuery.trim()) {
        filteredResults = filteredResults.filter(item => {
          const searchText = `${item.title} ${item.description}`.toLowerCase()
          return searchText.includes(searchQuery.toLowerCase())
        })
      }

      // Apply filters
      filters.forEach(filter => {
        if (filter.value && filter.value !== '' && filter.value.length > 0) {
          filteredResults = filteredResults.filter(item => {
            const metadata = item.metadata
            
            switch (filter.id) {
              case 'status':
                return Array.isArray(filter.value) && filter.value.includes(metadata.status)
              case 'region':
                return metadata.regions?.name === filter.value || metadata.region === filter.value
              case 'client_type':
                return metadata.client_type === filter.value
              case 'truck_type':
                return metadata.truck_type === filter.value
              case 'price_range':
                const price = metadata.total_price || 0
                return price >= filter.value[0] && price <= filter.value[1]
              case 'date_range':
                if (!filter.value) return true
                const itemDate = new Date(item.created_at)
                const filterDate = new Date(filter.value)
                return itemDate >= filterDate
              default:
                return true
            }
          })
        }
      })

      // Calculate relevance scores
      filteredResults = filteredResults.map(item => ({
        ...item,
        score: calculateRelevanceScore(item, searchQuery)
      }))

      // Sort results
      filteredResults.sort((a, b) => {
        if (sortBy === 'relevance') {
          return sortOrder === 'desc' ? b.score - a.score : a.score - b.score
        } else if (sortBy === 'date') {
          const dateA = new Date(a.created_at).getTime()
          const dateB = new Date(b.created_at).getTime()
          return sortOrder === 'desc' ? dateB - dateA : dateA - dateB
        } else if (sortBy === 'title') {
          return sortOrder === 'desc' 
            ? b.title.localeCompare(a.title)
            : a.title.localeCompare(b.title)
        }
        return 0
      })

      setResults(filteredResults)
      onResults?.(filteredResults)

      // Add to search history
      if (searchQuery.trim()) {
        setSearchHistory(prev => {
          const newHistory = [searchQuery, ...prev.filter(h => h !== searchQuery)].slice(0, 10)
          return newHistory
        })
      }
    } catch (error) {
      console.error('Error searching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateRelevanceScore = (item: SearchResult, query: string): number => {
    if (!query.trim()) return 0

    const queryLower = query.toLowerCase()
    const titleLower = item.title.toLowerCase()
    const descLower = item.description.toLowerCase()

    let score = 0

    // Exact title match
    if (titleLower === queryLower) score += 100
    // Title starts with query
    else if (titleLower.startsWith(queryLower)) score += 80
    // Title contains query
    else if (titleLower.includes(queryLower)) score += 60
    // Description contains query
    else if (descLower.includes(queryLower)) score += 40

    // Boost score for recent items
    const daysSinceCreated = (Date.now() - new Date(item.created_at).getTime()) / (1000 * 60 * 60 * 24)
    if (daysSinceCreated < 7) score += 20
    else if (daysSinceCreated < 30) score += 10

    return score
  }

  const addFilter = (filterId: string) => {
    const predefinedFilter = predefinedFilters.find(f => f.id === filterId)
    if (predefinedFilter && !filters.find(f => f.id === filterId)) {
      setFilters(prev => [...prev, { ...predefinedFilter }])
    }
  }

  const removeFilter = (filterId: string) => {
    setFilters(prev => prev.filter(f => f.id !== filterId))
  }

  const updateFilter = (filterId: string, value: any) => {
    setFilters(prev => 
      prev.map(f => f.id === filterId ? { ...f, value } : f)
    )
  }

  const clearAllFilters = () => {
    setFilters([])
  }

  const exportResults = () => {
    const csvContent = [
      ['Type', 'Title', 'Description', 'Created At', 'Updated At'].join(','),
      ...results.map(result => [
        result.type,
        `"${result.title}"`,
        `"${result.description}"`,
        result.created_at,
        result.updated_at
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `search-results-${Date.now()}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'order':
        return <Package className="h-4 w-4 text-blue-500" />
      case 'client':
        return <User className="h-4 w-4 text-green-500" />
      case 'user':
        return <User className="h-4 w-4 text-purple-500" />
      case 'product':
        return <Package className="h-4 w-4 text-orange-500" />
      default:
        return <Search className="h-4 w-4 text-gray-500" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'order':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'client':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'user':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
      case 'product':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim() || filters.length > 0) {
        searchData()
      } else {
        setResults([])
      }
    }, 300) // Debounce search

    return () => clearTimeout(timeoutId)
  }, [searchQuery, filters, sortBy, sortOrder])

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Search Bar */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5 text-blue-600" />
            Advanced Search
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search orders, clients, users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button 
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
            <Button 
              onClick={searchData}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Search
            </Button>
          </div>

          {/* Search History */}
          {searchHistory.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Recent searches:</span>
              {searchHistory.slice(0, 5).map((term, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  size="sm"
                  onClick={() => setSearchQuery(term)}
                  className="text-xs"
                >
                  {term}
                </Button>
              ))}
            </div>
          )}

          {/* Active Filters */}
          {filters.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Active filters:</span>
              {filters.map((filter) => (
                <Badge key={filter.id} variant="secondary" className="flex items-center gap-1">
                  {filter.name}: {Array.isArray(filter.value) ? filter.value.join(', ') : filter.value}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFilter(filter.id)}
                    className="h-4 w-4 p-0 hover:bg-transparent"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="text-xs"
              >
                Clear all
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Filters Panel */}
      {showFilters && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-green-600" />
              Search Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {predefinedFilters.map((filter) => (
                <div key={filter.id} className="space-y-2">
                  <Label className="text-sm font-medium">{filter.name}</Label>
                  
                  {filter.type === 'text' && (
                    <Input
                      placeholder={`Search ${filter.name.toLowerCase()}...`}
                      value={filter.value || ''}
                      onChange={(e) => updateFilter(filter.id, e.target.value)}
                    />
                  )}
                  
                  {filter.type === 'select' && (
                    <Select value={filter.value || ''} onValueChange={(value) => updateFilter(filter.id, value)}>
                      <SelectTrigger>
                        <SelectValue placeholder={`Select ${filter.name.toLowerCase()}`} />
                      </SelectTrigger>
                      <SelectContent>
                        {filter.options?.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  
                  {filter.type === 'multiselect' && (
                    <div className="space-y-2">
                      {filter.options?.map((option) => (
                        <div key={option} className="flex items-center space-x-2">
                          <Checkbox
                            id={`${filter.id}-${option}`}
                            checked={filter.value?.includes(option) || false}
                            onCheckedChange={(checked) => {
                              const currentValue = filter.value || []
                              const newValue = checked
                                ? [...currentValue, option]
                                : currentValue.filter((v: string) => v !== option)
                              updateFilter(filter.id, newValue)
                            }}
                          />
                          <Label htmlFor={`${filter.id}-${option}`} className="text-sm">
                            {option}
                          </Label>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {filter.type === 'range' && (
                    <div className="space-y-2">
                      <Slider
                        value={filter.value || [0, 1000000]}
                        onValueChange={(value) => updateFilter(filter.id, value)}
                        max={1000000}
                        step={1000}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>{filter.value?.[0]?.toLocaleString()} DA</span>
                        <span>{filter.value?.[1]?.toLocaleString()} DA</span>
                      </div>
                    </div>
                  )}
                  
                  {filter.type === 'date' && (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left font-normal">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {filter.value ? format(new Date(filter.value), 'PPP') : 'Pick a date'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={filter.value ? new Date(filter.value) : undefined}
                          onSelect={(date) => updateFilter(filter.id, date?.toISOString())}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search Results */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-purple-600" />
              Search Results ({results.length})
            </CardTitle>
            <div className="flex items-center gap-2">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relevance">Relevance</SelectItem>
                  <SelectItem value="date">Date</SelectItem>
                  <SelectItem value="title">Title</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              >
                {sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
              </Button>
              {results.length > 0 && (
                <Button variant="outline" size="sm" onClick={exportResults}>
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-16 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          ) : results.length === 0 ? (
            <div className="text-center py-8">
              <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">No results found</p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                Try adjusting your search terms or filters
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {results.map((result) => (
                <div key={result.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      {getTypeIcon(result.type)}
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {result.title}
                          </h3>
                          <Badge className={getTypeColor(result.type)}>
                            {result.type}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          {result.description}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                          <span>Created: {new Date(result.created_at).toLocaleDateString()}</span>
                          <span>Updated: {new Date(result.updated_at).toLocaleDateString()}</span>
                          {result.score > 0 && (
                            <span>Relevance: {result.score}%</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default withAuth(AdvancedSearch)
