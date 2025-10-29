/**
 * Form Validation Utilities
 * Provides consistent validation for all forms
 */

export interface ValidationRule {
  required?: boolean
  min?: number
  max?: number
  minLength?: number
  maxLength?: number
  pattern?: RegExp
  email?: boolean
  custom?: (value: any) => string | null
}

export interface ValidationResult {
  isValid: boolean
  errors: Record<string, string>
}

export class FormValidator {
  static validateField(value: any, rules: ValidationRule = {}, fieldName: string = ''): string | null {
    // Required validation
    if (rules.required && (!value || (typeof value === 'string' && !value.trim()))) {
      return `${fieldName || 'This field'} is required`
    }

    // Skip other validations if field is empty and not required
    if (!value && !rules.required) {
      return null
    }

    // String length validations
    if (typeof value === 'string') {
      if (rules.minLength && value.length < rules.minLength) {
        return `${fieldName || 'This field'} must be at least ${rules.minLength} characters`
      }
      if (rules.maxLength && value.length > rules.maxLength) {
        return `${fieldName || 'This field'} must be no more than ${rules.maxLength} characters`
      }
    }

    // Number validations
    if (typeof value === 'number' || !isNaN(Number(value))) {
      const numValue = Number(value)
      if (rules.min !== undefined && numValue < rules.min) {
        return `${fieldName || 'This field'} must be at least ${rules.min}`
      }
      if (rules.max !== undefined && numValue > rules.max) {
        return `${fieldName || 'This field'} must be no more than ${rules.max}`
      }
    }

    // Email validation
    if (rules.email && typeof value === 'string') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(value)) {
        return `${fieldName || 'This field'} must be a valid email address`
      }
    }

    // Pattern validation
    if (rules.pattern && typeof value === 'string' && !rules.pattern.test(value)) {
      return `${fieldName || 'This field'} format is invalid`
    }

    // Custom validation
    if (rules.custom) {
      const customError = rules.custom(value)
      if (customError) {
        return customError
      }
    }

    return null
  }

  static validateForm(formData: Record<string, any>, rules: Record<string, ValidationRule>): ValidationResult {
    const errors: Record<string, string> = {}

    for (const [fieldName, fieldRules] of Object.entries(rules)) {
      const value = formData[fieldName]
      const error = this.validateField(value, fieldRules, fieldName)
      if (error) {
        errors[fieldName] = error
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    }
  }

  // Common validation rules
  static rules = {
    required: (fieldName?: string): ValidationRule => ({
      required: true,
      custom: (value) => {
        if (!value || (typeof value === 'string' && !value.trim())) {
          return `${fieldName || 'This field'} is required`
        }
        return null
      }
    }),
    email: (fieldName?: string): ValidationRule => ({
      required: true,
      email: true
    }),
    minLength: (min: number, fieldName?: string): ValidationRule => ({
      required: true,
      minLength: min
    }),
    min: (min: number, fieldName?: string): ValidationRule => ({
      required: true,
      min
    }),
    phone: (fieldName?: string): ValidationRule => ({
      required: true,
      pattern: /^[\d\s\+\-\(\)]+$/,
      custom: (value) => {
        if (!value || typeof value !== 'string') {
          return `${fieldName || 'Phone'} is required`
        }
        const cleaned = value.replace(/\D/g, '')
        if (cleaned.length < 8) {
          return `${fieldName || 'Phone'} must be at least 8 digits`
        }
        return null
      }
    }),
    positiveNumber: (fieldName?: string): ValidationRule => ({
      required: true,
      min: 0.01,
      custom: (value) => {
        if (!value || Number(value) <= 0) {
          return `${fieldName || 'This field'} must be greater than 0`
        }
        return null
      }
    }),
    uuid: (fieldName?: string): ValidationRule => ({
      required: true,
      pattern: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    })
  }
}
