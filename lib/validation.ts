// Comprehensive data validation system for all forms and operations

export interface ValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
}

export interface ValidationRule {
  field: string
  validator: (value: any, data?: any) => string | null
  required?: boolean
}

// Common validation functions
export const validators = {
  required: (fieldName: string) => (value: any) => {
    if (value === null || value === undefined || value === '' || 
        (Array.isArray(value) && value.length === 0)) {
      return `${fieldName} is required`
    }
    return null
  },

  email: (value: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (value && !emailRegex.test(value)) {
      return 'Please enter a valid email address'
    }
    return null
  },

  phone: (value: string) => {
    const phoneRegex = /^[\+]?[0-9\s\-\(\)]{8,}$/
    if (value && !phoneRegex.test(value)) {
      return 'Please enter a valid phone number'
    }
    return null
  },

  minLength: (min: number) => (value: string) => {
    if (value && value.length < min) {
      return `Must be at least ${min} characters long`
    }
    return null
  },

  maxLength: (max: number) => (value: string) => {
    if (value && value.length > max) {
      return `Must be no more than ${max} characters long`
    }
    return null
  },

  min: (min: number) => (value: number) => {
    if (value !== null && value !== undefined && value < min) {
      return `Must be at least ${min}`
    }
    return null
  },

  max: (max: number) => (value: number) => {
    if (value !== null && value !== undefined && value > max) {
      return `Must be no more than ${max}`
    }
    return null
  },

  positive: (value: number) => {
    if (value !== null && value !== undefined && value <= 0) {
      return 'Must be a positive number'
    }
    return null
  },

  date: (value: string) => {
    if (value && isNaN(Date.parse(value))) {
      return 'Please enter a valid date'
    }
    return null
  },

  futureDate: (value: string) => {
    if (value && new Date(value) <= new Date()) {
      return 'Date must be in the future'
    }
    return null
  },

  pastDate: (value: string) => {
    if (value && new Date(value) >= new Date()) {
      return 'Date must be in the past'
    }
    return null
  },

  alphanumeric: (value: string) => {
    if (value && !/^[a-zA-Z0-9\s\-_]+$/.test(value)) {
      return 'Only letters, numbers, spaces, hyphens, and underscores are allowed'
    }
    return null
  },

  url: (value: string) => {
    try {
      if (value && new URL(value)) {
        return null
      }
    } catch {
      return 'Please enter a valid URL'
    }
    return null
  }
}

// Order validation rules
export const orderValidationRules: ValidationRule[] = [
  {
    field: 'client_id',
    validator: validators.required('Client'),
    required: true
  },
  {
    field: 'region_id',
    validator: validators.required('Region'),
    required: true
  },
  {
    field: 'assigned_to',
    validator: validators.required('Assigned To'),
    required: true
  },
  {
    field: 'total_price',
    validator: (value) => {
      const requiredError = validators.required('Total Price')(value)
      if (requiredError) return requiredError
      return validators.positive(value)
    },
    required: true
  },
  {
    field: 'product_5_5L_pallets',
    validator: (value) => {
      const requiredError = validators.required('5.5L Pallets')(value)
      if (requiredError) return requiredError
      return validators.min(0)(value)
    },
    required: true
  },
  {
    field: 'product_1_5L_pallets',
    validator: (value) => {
      const requiredError = validators.required('1.5L Pallets')(value)
      if (requiredError) return requiredError
      return validators.min(0)(value)
    },
    required: true
  },
  {
    field: 'truck_type',
    validator: validators.required('Truck Type'),
    required: true
  },
  {
    field: 'truck_capacity',
    validator: (value) => {
      const requiredError = validators.required('Truck Capacity')(value)
      if (requiredError) return requiredError
      return validators.positive(value)
    },
    required: true
  },
  {
    field: 'delivery_date',
    validator: (value) => {
      const requiredError = validators.required('Delivery Date')(value)
      if (requiredError) return requiredError
      return validators.futureDate(value)
    },
    required: true
  }
]

// Client validation rules
export const clientValidationRules: ValidationRule[] = [
  {
    field: 'name',
    validator: (value) => {
      const requiredError = validators.required('Client Name')(value)
      if (requiredError) return requiredError
      return validators.minLength(2)(value)
    },
    required: true
  },
  {
    field: 'phone',
    validator: (value) => {
      const requiredError = validators.required('Phone Number')(value)
      if (requiredError) return requiredError
      return validators.phone(value)
    },
    required: true
  },
  {
    field: 'address',
    validator: (value) => {
      const requiredError = validators.required('Address')(value)
      if (requiredError) return requiredError
      return validators.minLength(5)(value)
    },
    required: true
  },
  {
    field: 'region_id',
    validator: validators.required('Region'),
    required: true
  }
]

// User validation rules
export const userValidationRules: ValidationRule[] = [
  {
    field: 'name',
    validator: (value) => {
      const requiredError = validators.required('Name')(value)
      if (requiredError) return requiredError
      return validators.minLength(2)(value)
    },
    required: true
  },
  {
    field: 'email',
    validator: (value) => {
      const requiredError = validators.required('Email')(value)
      if (requiredError) return requiredError
      return validators.email(value)
    },
    required: true
  },
  {
    field: 'role',
    validator: validators.required('Role'),
    required: true
  }
]

// Tracking validation rules
export const trackingValidationRules: ValidationRule[] = [
  {
    field: 'order_id',
    validator: validators.required('Order ID'),
    required: true
  },
  {
    field: 'client_id',
    validator: validators.required('Client ID'),
    required: true
  },
  {
    field: 'pallet_5_5L_quantity',
    validator: (value) => {
      const requiredError = validators.required('5.5L Pallet Quantity')(value)
      if (requiredError) return requiredError
      return validators.min(0)(value)
    },
    required: true
  },
  {
    field: 'pallet_1_5L_quantity',
    validator: (value) => {
      const requiredError = validators.required('1.5L Pallet Quantity')(value)
      if (requiredError) return requiredError
      return validators.min(0)(value)
    },
    required: true
  }
]

// Main validation function
export function validateData(data: any, rules: ValidationRule[]): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  for (const rule of rules) {
    const value = data[rule.field]
    const error = rule.validator(value, data)
    
    if (error) {
      if (rule.required) {
        errors.push(error)
      } else {
        warnings.push(error)
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  }
}

// Specific validation functions for different data types
export function validateOrder(order: any): ValidationResult {
  return validateData(order, orderValidationRules)
}

export function validateClient(client: any): ValidationResult {
  return validateData(client, clientValidationRules)
}

export function validateUser(user: any): ValidationResult {
  return validateData(user, userValidationRules)
}

export function validateTracking(tracking: any): ValidationResult {
  return validateData(tracking, trackingValidationRules)
}

// Database integrity validation
export function validateDatabaseIntegrity(data: any, type: string): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  // Check for required fields based on type
  switch (type) {
    case 'order':
      if (!data.id) errors.push('Order ID is missing')
      if (!data.created_at) errors.push('Creation timestamp is missing')
      if (!data.updated_at) errors.push('Update timestamp is missing')
      break
    
    case 'client':
      if (!data.id) errors.push('Client ID is missing')
      if (!data.created_at) errors.push('Creation timestamp is missing')
      break
    
    case 'user':
      if (!data.id) errors.push('User ID is missing')
      if (!data.created_at) errors.push('Creation timestamp is missing')
      break
    
    case 'tracking':
      if (!data.id) errors.push('Tracking ID is missing')
      if (!data.created_at) errors.push('Creation timestamp is missing')
      break
  }

  // Check for data corruption indicators
  if (data && typeof data === 'object') {
    for (const [key, value] of Object.entries(data)) {
      // Check for null values in critical fields
      if (value === null && ['id', 'name', 'email', 'phone'].includes(key)) {
        warnings.push(`Critical field '${key}' is null`)
      }
      
      // Check for invalid data types
      if (key === 'total_price' && typeof value !== 'number') {
        errors.push('Total price must be a number')
      }
      
      if (key === 'delivery_date' && value && isNaN(Date.parse(value))) {
        errors.push('Delivery date is invalid')
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  }
}
