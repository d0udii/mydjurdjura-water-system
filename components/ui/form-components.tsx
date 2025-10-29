/**
 * Consistent Form Components
 * Provides standardized form inputs, dropdowns, and buttons with validation
 */

'use client'

import React from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { AlertCircle, Loader2 } from 'lucide-react'
import { FormValidator, ValidationRule } from '@/lib/form-validation'
import { cn } from '@/lib/utils'

interface FormFieldProps {
  label: string
  name: string
  required?: boolean
  error?: string
  helperText?: string
  className?: string
  children: React.ReactNode
}

export function FormField({ 
  label, 
  name, 
  required = false, 
  error, 
  helperText,
  className,
  children 
}: FormFieldProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={name} className={cn(
        "text-sm font-medium",
        error ? "text-red-600 dark:text-red-400" : "text-gray-700 dark:text-gray-300"
      )}>
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      {children}
      {error && (
        <div className="flex items-center gap-1 text-sm text-red-600 dark:text-red-400">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}
      {helperText && !error && (
        <p className="text-xs text-gray-500 dark:text-gray-400">{helperText}</p>
      )}
    </div>
  )
}

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  name: string
  required?: boolean
  error?: string
  helperText?: string
  validation?: ValidationRule
  value: string | number
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void
}

export function FormInput({
  label,
  name,
  required = false,
  error,
  helperText,
  validation,
  value,
  onChange,
  onBlur,
  className,
  ...props
}: FormInputProps) {
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    if (validation && value !== undefined && value !== null && value !== '') {
      // Validate on blur
      const validationError = FormValidator.validateField(value, validation, label)
      if (validationError && onBlur) {
        // Could trigger error state update
      }
    }
    if (onBlur) {
      onBlur(e)
    }
  }

  return (
    <FormField label={label} name={name} required={required} error={error} helperText={helperText}>
      <Input
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        onBlur={handleBlur}
        className={cn(
          error && "border-red-500 focus:border-red-500 focus:ring-red-500",
          className
        )}
        required={required}
        {...props}
      />
    </FormField>
  )
}

interface FormSelectProps {
  label: string
  name: string
  required?: boolean
  error?: string
  helperText?: string
  value: string
  onValueChange: (value: string) => void
  options: Array<{ value: string; label: string }>
  placeholder?: string
  className?: string
}

export function FormSelect({
  label,
  name,
  required = false,
  error,
  helperText,
  value,
  onValueChange,
  options,
  placeholder = "Select an option",
  className
}: FormSelectProps) {
  return (
    <FormField label={label} name={name} required={required} error={error} helperText={helperText}>
      <Select value={value} onValueChange={onValueChange} required={required}>
        <SelectTrigger className={cn(
          error && "border-red-500 focus:border-red-500 focus:ring-red-500",
          className
        )}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </FormField>
  )
}

interface FormTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string
  name: string
  required?: boolean
  error?: string
  helperText?: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
}

export function FormTextarea({
  label,
  name,
  required = false,
  error,
  helperText,
  value,
  onChange,
  className,
  ...props
}: FormTextareaProps) {
  return (
    <FormField label={label} name={name} required={required} error={error} helperText={helperText}>
      <Textarea
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        className={cn(
          error && "border-red-500 focus:border-red-500 focus:ring-red-500",
          className
        )}
        required={required}
        {...props}
      />
    </FormField>
  )
}

interface FormButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
}

export function FormButton({
  children,
  loading = false,
  disabled,
  variant = 'default',
  size = 'default',
  className,
  ...props
}: FormButtonProps) {
  return (
    <Button
      variant={variant}
      size={size}
      disabled={disabled || loading}
      className={cn(className)}
      {...props}
    >
      {loading && (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      )}
      {children}
    </Button>
  )
}

// Form layout component
interface FormLayoutProps {
  children: React.ReactNode
  className?: string
  onSubmit?: (e: React.FormEvent) => void
}

export function FormLayout({ children, className, onSubmit }: FormLayoutProps) {
  return (
    <form onSubmit={onSubmit} className={cn("space-y-6", className)}>
      {children}
    </form>
  )
}

// Form actions component
interface FormActionsProps {
  children: React.ReactNode
  className?: string
}

export function FormActions({ children, className }: FormActionsProps) {
  return (
    <div className={cn("flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-700", className)}>
      {children}
    </div>
  )
}
