"use client"

import React from "react"
import { cn } from "@/lib/utils"

// Enhanced Card Component
export function EnhancedCard({ 
  children, 
  className = "", 
  variant = "default",
  hover = false,
  gradient = false
}: {
  children: React.ReactNode
  className?: string
  variant?: "default" | "elevated" | "outlined" | "glass"
  hover?: boolean
  gradient?: boolean
}) {
  const baseClasses = "rounded-xl transition-all duration-300"
  
  const variantClasses = {
    default: "bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700",
    elevated: "bg-white dark:bg-gray-800 shadow-lg border-0",
    outlined: "bg-transparent border-2 border-gray-200 dark:border-gray-700",
    glass: "bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-white/20 dark:border-gray-700/50"
  }
  
  const hoverClasses = hover ? "hover:shadow-xl hover:scale-[1.02] hover:-translate-y-1" : ""
  const gradientClasses = gradient ? "bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900" : ""
  
  return (
    <div className={cn(
      baseClasses,
      variantClasses[variant],
      hoverClasses,
      gradientClasses,
      className
    )}>
      {children}
    </div>
  )
}

// Enhanced Button Component
export function EnhancedButton({
  children,
  className = "",
  variant = "default",
  size = "default",
  gradient = false,
  glow = false,
  ...props
}: {
  children: React.ReactNode
  className?: string
  variant?: "default" | "primary" | "secondary" | "success" | "warning" | "danger" | "ghost"
  size?: "sm" | "default" | "lg" | "xl"
  gradient?: boolean
  glow?: boolean
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const baseClasses = "font-medium transition-all duration-200 transform active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2"
  
  const variantClasses = {
    default: "bg-gray-900 text-white hover:bg-gray-800 focus:ring-gray-500",
    primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
    secondary: "bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600",
    success: "bg-green-600 text-white hover:bg-green-700 focus:ring-green-500",
    warning: "bg-yellow-600 text-white hover:bg-yellow-700 focus:ring-yellow-500",
    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
    ghost: "bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-500 dark:text-gray-300 dark:hover:bg-gray-800"
  }
  
  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm rounded-md",
    default: "px-4 py-2 text-sm rounded-lg",
    lg: "px-6 py-3 text-base rounded-lg",
    xl: "px-8 py-4 text-lg rounded-xl"
  }
  
  const gradientClasses = gradient ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700" : ""
  const glowClasses = glow ? "shadow-lg hover:shadow-xl" : ""
  
  return (
    <button
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        gradientClasses,
        glowClasses,
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}

// Enhanced Input Component
export function EnhancedInput({
  className = "",
  variant = "default",
  size = "default",
  ...props
}: {
  className?: string
  variant?: "default" | "filled" | "outlined" | "floating"
  size?: "sm" | "default" | "lg"
} & React.InputHTMLAttributes<HTMLInputElement>) {
  const baseClasses = "transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1"
  
  const variantClasses = {
    default: "border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-blue-500 focus:border-blue-500",
    filled: "border-0 bg-gray-100 dark:bg-gray-700 focus:ring-blue-500 focus:bg-white dark:focus:bg-gray-600",
    outlined: "border-2 border-gray-300 dark:border-gray-600 bg-transparent focus:ring-blue-500 focus:border-blue-500",
    floating: "border-0 border-b-2 border-gray-300 dark:border-gray-600 bg-transparent focus:ring-blue-500 focus:border-blue-500 rounded-none"
  }
  
  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm rounded-md",
    default: "px-3 py-2 text-sm rounded-lg",
    lg: "px-4 py-3 text-base rounded-lg"
  }
  
  return (
    <input
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    />
  )
}

// Enhanced Badge Component
export function EnhancedBadge({
  children,
  className = "",
  variant = "default",
  size = "default",
  animated = false
}: {
  children: React.ReactNode
  className?: string
  variant?: "default" | "success" | "warning" | "danger" | "info" | "outline"
  size?: "sm" | "default" | "lg"
  animated?: boolean
}) {
  const baseClasses = "font-medium transition-all duration-200"
  
  const variantClasses = {
    default: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
    success: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    warning: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    danger: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    info: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    outline: "border border-gray-300 text-gray-700 dark:border-gray-600 dark:text-gray-300"
  }
  
  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs rounded",
    default: "px-2.5 py-0.5 text-sm rounded-md",
    lg: "px-3 py-1 text-base rounded-lg"
  }
  
  const animatedClasses = animated ? "animate-pulse" : ""
  
  return (
    <span className={cn(
      baseClasses,
      variantClasses[variant],
      sizeClasses[size],
      animatedClasses,
      className
    )}>
      {children}
    </span>
  )
}

// Enhanced Progress Component
export function EnhancedProgress({
  value,
  className = "",
  variant = "default",
  size = "default",
  animated = false,
  showLabel = false
}: {
  value: number
  className?: string
  variant?: "default" | "success" | "warning" | "danger" | "gradient"
  size?: "sm" | "default" | "lg"
  animated?: boolean
  showLabel?: boolean
}) {
  const baseClasses = "overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700"
  
  const sizeClasses = {
    sm: "h-1",
    default: "h-2",
    lg: "h-3"
  }
  
  const variantClasses = {
    default: "bg-blue-600",
    success: "bg-green-600",
    warning: "bg-yellow-600",
    danger: "bg-red-600",
    gradient: "bg-gradient-to-r from-blue-600 to-purple-600"
  }
  
  const animatedClasses = animated ? "animate-pulse" : ""
  
  return (
    <div className={cn(baseClasses, sizeClasses[size], className)}>
      <div
        className={cn(
          "h-full transition-all duration-500 ease-out",
          variantClasses[variant],
          animatedClasses
        )}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
      {showLabel && (
        <div className="mt-1 text-sm text-gray-600 dark:text-gray-400 text-center">
          {Math.round(value)}%
        </div>
      )}
    </div>
  )
}

// Enhanced Loading Component
export function EnhancedLoader({
  size = "default",
  variant = "spinner",
  className = ""
}: {
  size?: "sm" | "default" | "lg" | "xl"
  variant?: "spinner" | "dots" | "pulse" | "bars"
  className?: string
}) {
  const sizeClasses = {
    sm: "w-4 h-4",
    default: "w-6 h-6",
    lg: "w-8 h-8",
    xl: "w-12 h-12"
  }
  
  const spinnerClasses = "animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"
  const dotsClasses = "flex space-x-1"
  const pulseClasses = "animate-pulse rounded-full bg-blue-600"
  const barsClasses = "flex space-x-1"
  
  if (variant === "spinner") {
    return (
      <div className={cn(spinnerClasses, sizeClasses[size], className)} />
    )
  }
  
  if (variant === "dots") {
    return (
      <div className={cn(dotsClasses, className)}>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={cn(
              "rounded-full bg-blue-600 animate-pulse",
              size === "sm" ? "w-1 h-1" : size === "lg" ? "w-3 h-3" : "w-2 h-2"
            )}
            style={{ animationDelay: `${i * 0.2}s` }}
          />
        ))}
      </div>
    )
  }
  
  if (variant === "pulse") {
    return (
      <div className={cn(pulseClasses, sizeClasses[size], className)} />
    )
  }
  
  if (variant === "bars") {
    return (
      <div className={cn(barsClasses, className)}>
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-blue-600 animate-pulse"
            style={{
              width: size === "sm" ? "2px" : size === "lg" ? "6px" : "4px",
              height: size === "sm" ? "12px" : size === "lg" ? "24px" : "16px",
              animationDelay: `${i * 0.1}s`
            }}
          />
        ))}
      </div>
    )
  }
  
  return null
}

// Enhanced Table Component
export function EnhancedTable({
  children,
  className = "",
  variant = "default",
  hover = true,
  striped = false
}: {
  children: React.ReactNode
  className?: string
  variant?: "default" | "bordered" | "striped" | "hover"
  hover?: boolean
  striped?: boolean
}) {
  const baseClasses = "w-full"
  
  const variantClasses = {
    default: "border-collapse",
    bordered: "border-collapse border border-gray-300 dark:border-gray-600",
    striped: "border-collapse",
    hover: "border-collapse"
  }
  
  const hoverClasses = hover ? "hover:bg-gray-50 dark:hover:bg-gray-800" : ""
  const stripedClasses = striped ? "even:bg-gray-50 dark:even:bg-gray-800" : ""
  
  return (
    <table className={cn(
      baseClasses,
      variantClasses[variant],
      className
    )}>
      <tbody className={cn(hoverClasses, stripedClasses)}>
        {children}
      </tbody>
    </table>
  )
}

// Enhanced Modal Component
export function EnhancedModal({
  isOpen,
  onClose,
  children,
  className = "",
  size = "default",
  variant = "default"
}: {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
  className?: string
  size?: "sm" | "default" | "lg" | "xl" | "full"
  variant?: "default" | "centered" | "slide" | "fade"
}) {
  if (!isOpen) return null
  
  const sizeClasses = {
    sm: "max-w-md",
    default: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
    full: "max-w-full mx-4"
  }
  
  const variantClasses = {
    default: "animate-in fade-in-0 zoom-in-95",
    centered: "animate-in fade-in-0 zoom-in-95",
    slide: "animate-in slide-in-from-bottom-4",
    fade: "animate-in fade-in-0"
  }
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className={cn(
        "bg-white dark:bg-gray-800 rounded-xl shadow-xl",
        sizeClasses[size],
        variantClasses[variant],
        className
      )}>
        {children}
      </div>
    </div>
  )
}

// Enhanced Tooltip Component
export function EnhancedTooltip({
  children,
  content,
  position = "top",
  className = ""
}: {
  children: React.ReactNode
  content: string
  position?: "top" | "bottom" | "left" | "right"
  className?: string
}) {
  const positionClasses = {
    top: "bottom-full left-1/2 transform -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 transform -translate-x-1/2 mt-2",
    left: "right-full top-1/2 transform -translate-y-1/2 mr-2",
    right: "left-full top-1/2 transform -translate-y-1/2 ml-2"
  }
  
  const arrowClasses = {
    top: "top-full left-1/2 transform -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent border-t-gray-900",
    bottom: "bottom-full left-1/2 transform -translate-x-1/2 border-l-transparent border-r-transparent border-t-transparent border-b-gray-900",
    left: "left-full top-1/2 transform -translate-y-1/2 border-t-transparent border-b-transparent border-r-transparent border-l-gray-900",
    right: "right-full top-1/2 transform -translate-y-1/2 border-t-transparent border-b-transparent border-l-transparent border-r-gray-900"
  }
  
  return (
    <div className="relative group">
      {children}
      <div className={cn(
        "absolute z-50 px-2 py-1 text-sm text-white bg-gray-900 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none",
        positionClasses[position],
        className
      )}>
        {content}
        <div className={cn(
          "absolute w-0 h-0 border-4",
          arrowClasses[position]
        )} />
      </div>
    </div>
  )
}
