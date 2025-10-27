// Comprehensive API wrapper with automatic validation and error handling

import { validateData, validateDatabaseIntegrity, ValidationResult } from './validation'

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  validation?: ValidationResult
  timestamp: string
}

export interface ApiOptions {
  validate?: boolean
  validationRules?: any[]
  showToast?: boolean
  timeout?: number
  retries?: number
}

class ApiClient {
  private baseUrl: string
  private defaultOptions: ApiOptions

  constructor(baseUrl: string = '', defaultOptions: ApiOptions = {}) {
    this.baseUrl = baseUrl
    this.defaultOptions = {
      validate: true,
      showToast: true,
      timeout: 10000,
      retries: 3,
      ...defaultOptions
    }
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {},
    apiOptions: ApiOptions = {}
  ): Promise<ApiResponse<T>> {
    const opts = { ...this.defaultOptions, ...apiOptions }
    const url = `${this.baseUrl}${endpoint}`
    
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), opts.timeout)

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      
      // Validate response data if requested
      let validation: ValidationResult | undefined
      if (opts.validate && opts.validationRules) {
        validation = validateData(data, opts.validationRules)
        if (!validation.isValid) {
          throw new Error(`Validation failed: ${validation.errors.join(', ')}`)
        }
      }

      return {
        success: true,
        data,
        validation,
        timestamp: new Date().toISOString()
      }
    } catch (error) {
      clearTimeout(timeoutId)
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      
      return {
        success: false,
        error: errorMessage,
        timestamp: new Date().toISOString()
      }
    }
  }

  async get<T>(endpoint: string, options: ApiOptions = {}): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, { method: 'GET' }, options)
  }

  async post<T>(endpoint: string, data: any, options: ApiOptions = {}): Promise<ApiResponse<T>> {
    // Validate input data if requested
    if (options.validate && options.validationRules) {
      const validation = validateData(data, options.validationRules)
      if (!validation.isValid) {
        return {
          success: false,
          error: `Validation failed: ${validation.errors.join(', ')}`,
          validation,
          timestamp: new Date().toISOString()
        }
      }
    }

    return this.makeRequest<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data)
    }, options)
  }

  async put<T>(endpoint: string, data: any, options: ApiOptions = {}): Promise<ApiResponse<T>> {
    // Validate input data if requested
    if (options.validate && options.validationRules) {
      const validation = validateData(data, options.validationRules)
      if (!validation.isValid) {
        return {
          success: false,
          error: `Validation failed: ${validation.errors.join(', ')}`,
          validation,
          timestamp: new Date().toISOString()
        }
      }
    }

    return this.makeRequest<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data)
    }, options)
  }

  async patch<T>(endpoint: string, data: any, options: ApiOptions = {}): Promise<ApiResponse<T>> {
    // Validate input data if requested
    if (options.validate && options.validationRules) {
      const validation = validateData(data, options.validationRules)
      if (!validation.isValid) {
        return {
          success: false,
          error: `Validation failed: ${validation.errors.join(', ')}`,
          validation,
          timestamp: new Date().toISOString()
        }
      }
    }

    return this.makeRequest<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data)
    }, options)
  }

  async delete<T>(endpoint: string, options: ApiOptions = {}): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, { method: 'DELETE' }, options)
  }
}

// Create API client instance
export const apiClient = new ApiClient()

// Specific API functions for different data types
export const ordersApi = {
  async getAll(userRole?: string, userId?: string): Promise<ApiResponse> {
    const params = new URLSearchParams()
    if (userRole) params.append('user_role', userRole)
    if (userId) params.append('user_id', userId)
    
    return apiClient.get(`/api/orders?${params.toString()}`)
  },

  async getById(id: string): Promise<ApiResponse> {
    return apiClient.get(`/api/orders/${id}`)
  },

  async create(order: any): Promise<ApiResponse> {
    return apiClient.post('/api/orders', order, {
      validate: true,
      validationRules: [
        { field: 'client_id', validator: (v: any) => v ? null : 'Client is required', required: true },
        { field: 'region_id', validator: (v: any) => v ? null : 'Region is required', required: true },
        { field: 'total_price', validator: (v: any) => v > 0 ? null : 'Total price must be positive', required: true },
        { field: 'delivery_date', validator: (v: any) => v ? null : 'Delivery date is required', required: true }
      ]
    })
  },

  async update(id: string, order: any): Promise<ApiResponse> {
    return apiClient.patch(`/api/orders/${id}`, order, {
      validate: true,
      validationRules: [
        { field: 'client_id', validator: (v: any) => v ? null : 'Client is required', required: true },
        { field: 'total_price', validator: (v: any) => v > 0 ? null : 'Total price must be positive', required: true }
      ]
    })
  },

  async delete(id: string): Promise<ApiResponse> {
    return apiClient.delete(`/api/orders/${id}`)
  },

  async approve(id: string, approvedBy: string): Promise<ApiResponse> {
    return apiClient.patch(`/api/orders/${id}`, {
      action: 'approve',
      approved_by: approvedBy,
      user_role: 'operations',
      user_id: approvedBy
    })
  },

  async reject(id: string, reason: string, rejectedBy: string): Promise<ApiResponse> {
    return apiClient.patch(`/api/orders/${id}`, {
      action: 'reject',
      rejection_reason: reason,
      user_role: 'operations',
      user_id: rejectedBy
    })
  },

  async updateStatus(id: string, status: string, updatedBy: string): Promise<ApiResponse> {
    return apiClient.patch(`/api/orders/${id}`, {
      action: 'update_status',
      status,
      user_role: 'operations',
      user_id: updatedBy
    })
  },

  async updateBLNumber(id: string, blNumber: string, updatedBy: string): Promise<ApiResponse> {
    return apiClient.patch(`/api/orders/${id}`, {
      action: 'update_bl_number',
      bl_number: blNumber,
      user_role: 'operations',
      user_id: updatedBy
    })
  }
}

export const clientsApi = {
  async getAll(): Promise<ApiResponse> {
    return apiClient.get('/api/clients')
  },

  async getById(id: string): Promise<ApiResponse> {
    return apiClient.get(`/api/clients/${id}`)
  },

  async create(client: any): Promise<ApiResponse> {
    return apiClient.post('/api/clients', client, {
      validate: true,
      validationRules: [
        { field: 'name', validator: (v: any) => v && v.length >= 2 ? null : 'Name must be at least 2 characters', required: true },
        { field: 'phone', validator: (v: any) => v ? null : 'Phone is required', required: true },
        { field: 'address', validator: (v: any) => v && v.length >= 5 ? null : 'Address must be at least 5 characters', required: true },
        { field: 'region_id', validator: (v: any) => v ? null : 'Region is required', required: true }
      ]
    })
  },

  async update(id: string, client: any): Promise<ApiResponse> {
    return apiClient.put(`/api/clients/${id}`, client, {
      validate: true,
      validationRules: [
        { field: 'name', validator: (v: any) => v && v.length >= 2 ? null : 'Name must be at least 2 characters', required: true },
        { field: 'phone', validator: (v: any) => v ? null : 'Phone is required', required: true },
        { field: 'address', validator: (v: any) => v && v.length >= 5 ? null : 'Address must be at least 5 characters', required: true }
      ]
    })
  },

  async delete(id: string): Promise<ApiResponse> {
    return apiClient.delete(`/api/clients/${id}`)
  }
}

export const trackingApi = {
  async getAll(): Promise<ApiResponse> {
    return apiClient.get('/api/pallet-tracking')
  },

  async create(tracking: any): Promise<ApiResponse> {
    return apiClient.post('/api/pallet-tracking', tracking, {
      validate: true,
      validationRules: [
        { field: 'order_id', validator: (v: any) => v ? null : 'Order ID is required', required: true },
        { field: 'client_id', validator: (v: any) => v ? null : 'Client ID is required', required: true },
        { field: 'pallet_5_5L_quantity', validator: (v: any) => v >= 0 ? null : '5.5L quantity must be non-negative', required: true },
        { field: 'pallet_1_5L_quantity', validator: (v: any) => v >= 0 ? null : '1.5L quantity must be non-negative', required: true }
      ]
    })
  },

  async update(id: string, tracking: any): Promise<ApiResponse> {
    return apiClient.patch(`/api/pallet-tracking/${id}`, tracking, {
      validate: true,
      validationRules: [
        { field: 'pallet_5_5L_quantity', validator: (v: any) => v >= 0 ? null : '5.5L quantity must be non-negative', required: true },
        { field: 'pallet_1_5L_quantity', validator: (v: any) => v >= 0 ? null : '1.5L quantity must be non-negative', required: true }
      ]
    })
  },

  async delete(id: string): Promise<ApiResponse> {
    return apiClient.delete(`/api/pallet-tracking/${id}`)
  }
}

export const reportsApi = {
  async get(filters: any = {}): Promise<ApiResponse> {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        params.append(key, String(value))
      }
    })
    
    return apiClient.get(`/api/reports?${params.toString()}`)
  },

  async export(type: string, format: string, filters: any = {}): Promise<ApiResponse> {
    const params = new URLSearchParams()
    params.append('type', type)
    params.append('format', format)
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        params.append(key, String(value))
      }
    })
    
    return apiClient.get(`/api/export?${params.toString()}`)
  }
}

export const notificationsApi = {
  async getAll(userRole?: string, userId?: string): Promise<ApiResponse> {
    const params = new URLSearchParams()
    if (userRole) params.append('user_role', userRole)
    if (userId) params.append('user_id', userId)
    
    return apiClient.get(`/api/notifications?${params.toString()}`)
  },

  async markAsRead(notificationId: string, userId: string, userRole: string): Promise<ApiResponse> {
    return apiClient.put('/api/notifications/manage', {
      notificationId,
      userId,
      userRole
    })
  },

  async markAllAsRead(userId: string, userRole: string): Promise<ApiResponse> {
    return apiClient.post('/api/notifications/manage', {
      userId,
      userRole
    })
  },

  async getUnreadCount(userId: string, userRole: string): Promise<ApiResponse> {
    return apiClient.get(`/api/notifications/manage?user_id=${userId}&user_role=${userRole}`)
  }
}
