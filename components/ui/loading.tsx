"use client"

import React from 'react'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  text?: string
  subtext?: string
  className?: string
}

export function LoadingSpinner({ 
  size = 'md', 
  text = 'Loading...', 
  subtext,
  className = ''
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  }

  const textSizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl'
  }

  return (
    <div className={`min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center ${className}`}>
      <div className="text-center space-y-4">
        <div className="relative">
          <div className={`${sizeClasses[size]} border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto`}></div>
          <div className={`absolute inset-0 ${sizeClasses[size]} border-4 border-transparent border-t-blue-400 rounded-full animate-spin mx-auto`} 
               style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
        </div>
        <div className="space-y-2">
          <h2 className={`${textSizeClasses[size]} font-semibold text-gray-900 dark:text-white`}>{text}</h2>
          {subtext && (
            <p className="text-gray-600 dark:text-gray-400">{subtext}</p>
          )}
        </div>
      </div>
    </div>
  )
}

interface LoadingCardProps {
  count?: number
  className?: string
}

export function LoadingCard({ count = 3, className = '' }: LoadingCardProps) {
  return (
    <div className={`space-y-3 ${className}`}>
      {[...Array(count)].map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="h-16 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded-lg"></div>
        </div>
      ))}
    </div>
  )
}

interface LoadingTableProps {
  rows?: number
  columns?: number
  className?: string
}

export function LoadingTable({ rows = 5, columns = 6, className = '' }: LoadingTableProps) {
  return (
    <div className={`space-y-3 ${className}`}>
      {/* Header */}
      <div className="animate-pulse">
        <div className="h-12 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded-lg"></div>
      </div>
      
      {/* Rows */}
      {[...Array(rows)].map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="h-16 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded-lg"></div>
        </div>
      ))}
    </div>
  )
}

interface LoadingButtonProps {
  className?: string
  children?: React.ReactNode
}

export function LoadingButton({ className = '', children }: LoadingButtonProps) {
  return (
    <button 
      disabled 
      className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 opacity-50 cursor-not-allowed ${className}`}
    >
      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
      {children || 'Loading...'}
    </button>
  )
}
