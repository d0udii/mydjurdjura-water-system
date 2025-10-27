"use client"

import React, { useEffect, useState, useRef } from "react"
import { cn } from "@/lib/utils"

// Optimized animation variants - reduced set for better performance
export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 }
}

export const slideIn = {
  initial: { y: 20, opacity: 0 },
  animate: { y: 0, opacity: 1 },
  exit: { y: -20, opacity: 0 }
}

export const scaleIn = {
  initial: { scale: 0.9, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  exit: { scale: 0.9, opacity: 0 }
}

// Optimized AnimatedDiv component
interface AnimatedDivProps {
  children: React.ReactNode
  className?: string
  delay?: number
  duration?: number
  direction?: 'up' | 'down' | 'left' | 'right'
  intensity?: 'low' | 'medium' | 'high'
}

export function AnimatedDiv({ 
  children, 
  className = '', 
  delay = 0, 
  duration = 300,
  direction = 'up',
  intensity = 'medium'
}: AnimatedDivProps) {
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), delay)
        }
      },
      { threshold: 0.1 }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [delay])

  const directionClasses = {
    up: 'translate-y-4',
    down: '-translate-y-4',
    left: 'translate-x-4',
    right: '-translate-x-4'
  }

  const intensityClasses = {
    low: 'opacity-0',
    medium: 'opacity-0',
    high: 'opacity-0'
  }

  return (
    <div
      ref={ref}
      className={cn(
        'transition-all ease-out',
        isVisible 
          ? 'opacity-100 translate-y-0 translate-x-0' 
          : `${intensityClasses[intensity]} ${directionClasses[direction]}`,
        className
      )}
      style={{ transitionDuration: `${duration}ms` }}
    >
      {children}
    </div>
  )
}

// Optimized FloatingElement component
interface FloatingElementProps {
  children: React.ReactNode
  intensity?: 'low' | 'medium' | 'high'
  className?: string
}

export function FloatingElement({ 
  children, 
  intensity = 'medium',
  className = ''
}: FloatingElementProps) {
  const intensityClasses = {
    low: 'animate-float-low',
    medium: 'animate-float-medium',
    high: 'animate-float-high'
  }

  return (
    <div className={cn(intensityClasses[intensity], className)}>
      {children}
    </div>
  )
}

// Optimized GradientText component
interface GradientTextProps {
  children: React.ReactNode
  gradient?: 'blue-purple' | 'green-blue' | 'red-orange' | 'purple-pink'
  className?: string
}

export function GradientText({ 
  children, 
  gradient = 'blue-purple',
  className = ''
}: GradientTextProps) {
  const gradientClasses = {
    'blue-purple': 'bg-gradient-to-r from-blue-600 to-purple-600',
    'green-blue': 'bg-gradient-to-r from-green-600 to-blue-600',
    'red-orange': 'bg-gradient-to-r from-red-600 to-orange-600',
    'purple-pink': 'bg-gradient-to-r from-purple-600 to-pink-600'
  }

  return (
    <span className={cn('bg-clip-text text-transparent', gradientClasses[gradient], className)}>
      {children}
    </span>
  )
}

// Optimized GlowEffect component
interface GlowEffectProps {
  children: React.ReactNode
  color?: 'blue' | 'purple' | 'green' | 'red'
  intensity?: 'low' | 'medium' | 'high'
  className?: string
}

export function GlowEffect({ 
  children, 
  color = 'blue',
  intensity = 'medium',
  className = ''
}: GlowEffectProps) {
  const colorClasses = {
    blue: 'shadow-blue-500/25',
    purple: 'shadow-purple-500/25',
    green: 'shadow-green-500/25',
    red: 'shadow-red-500/25'
  }

  const intensityClasses = {
    low: 'shadow-lg',
    medium: 'shadow-xl',
    high: 'shadow-2xl'
  }

  return (
    <div className={cn(intensityClasses[intensity], colorClasses[color], className)}>
      {children}
    </div>
  )
}

// Optimized RevealOnScroll component
interface RevealOnScrollProps {
  children: React.ReactNode
  direction?: 'up' | 'down' | 'left' | 'right'
  delay?: number
  className?: string
}

export function RevealOnScroll({ 
  children, 
  direction = 'up',
  delay = 0,
  className = ''
}: RevealOnScrollProps) {
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), delay)
        }
      },
      { threshold: 0.1 }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [delay])

  const directionClasses = {
    up: 'translate-y-8',
    down: '-translate-y-8',
    left: 'translate-x-8',
    right: '-translate-x-8'
  }

  return (
    <div
      ref={ref}
      className={cn(
        'transition-all duration-500 ease-out',
        isVisible 
          ? 'opacity-100 translate-y-0 translate-x-0' 
          : `opacity-0 ${directionClasses[direction]}`,
        className
      )}
    >
      {children}
    </div>
  )
}

// Optimized RevealTableRow component
interface RevealTableRowProps {
  children: React.ReactNode
  delay?: number
  className?: string
}

export function RevealTableRow({ 
  children, 
  delay = 0,
  className = ''
}: RevealTableRowProps) {
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef<HTMLTableRowElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), delay)
        }
      },
      { threshold: 0.1 }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [delay])

  return (
    <tr
      ref={ref}
      className={cn(
        'transition-all duration-300 ease-out',
        isVisible 
          ? 'opacity-100 translate-y-0' 
          : 'opacity-0 translate-y-4',
        className
      )}
    >
      {children}
    </tr>
  )
}

// Optimized ShakeElement component
interface ShakeElementProps {
  children: React.ReactNode
  intensity?: 'low' | 'medium' | 'high'
  className?: string
}

export function ShakeElement({ 
  children, 
  intensity = 'medium',
  className = ''
}: ShakeElementProps) {
  const intensityClasses = {
    low: 'animate-shake-low',
    medium: 'animate-shake-medium',
    high: 'animate-shake-high'
  }

  return (
    <div className={cn(intensityClasses[intensity], className)}>
      {children}
    </div>
  )
}