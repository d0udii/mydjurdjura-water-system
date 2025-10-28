import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { AlertCircle, XCircle, AlertTriangle, Info } from "lucide-react"

const errorVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background",
  {
    variants: {
      variant: {
        default: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground",
        secondary: "bg-destructive/10 text-destructive hover:bg-destructive/20",
        ghost: "hover:bg-destructive/10 hover:text-destructive",
        link: "underline-offset-4 hover:underline text-destructive",
      },
      size: {
        default: "h-10 py-2 px-4",
        sm: "h-9 px-3 rounded-md",
        lg: "h-11 px-8 rounded-md",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ErrorComponentProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof errorVariants> {
  title?: string
  message?: string
  type?: "error" | "warning" | "info" | "success"
  showIcon?: boolean
  dismissible?: boolean
  onDismiss?: () => void
}

const ErrorComponent = React.forwardRef<HTMLDivElement, ErrorComponentProps>(
  ({ 
    className, 
    variant, 
    size, 
    title, 
    message, 
    type = "error", 
    showIcon = true, 
    dismissible = false, 
    onDismiss,
    ...props 
  }, ref) => {
    const getIcon = () => {
      switch (type) {
        case "error":
          return <XCircle className="h-4 w-4" />
        case "warning":
          return <AlertTriangle className="h-4 w-4" />
        case "info":
          return <Info className="h-4 w-4" />
        case "success":
          return <AlertCircle className="h-4 w-4" />
        default:
          return <AlertCircle className="h-4 w-4" />
      }
    }

    const getTypeClasses = () => {
      switch (type) {
        case "error":
          return "border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-200"
        case "warning":
          return "border-yellow-200 bg-yellow-50 text-yellow-800 dark:border-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200"
        case "info":
          return "border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-200"
        case "success":
          return "border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-900/20 dark:text-green-200"
        default:
          return "border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-200"
      }
    }

    return (
      <div
        ref={ref}
        className={cn(
          "flex items-start space-x-3 p-4 border rounded-lg",
          getTypeClasses(),
          className
        )}
        {...props}
      >
        {showIcon && (
          <div className="flex-shrink-0">
            {getIcon()}
          </div>
        )}
        
        <div className="flex-1 min-w-0">
          {title && (
            <h3 className="text-sm font-medium mb-1">
              {title}
            </h3>
          )}
          {message && (
            <p className="text-sm">
              {message}
            </p>
          )}
        </div>

        {dismissible && onDismiss && (
          <button
            onClick={onDismiss}
            className="flex-shrink-0 ml-2 text-current hover:opacity-70 transition-opacity"
          >
            <XCircle className="h-4 w-4" />
          </button>
        )}
      </div>
    )
  }
)
ErrorComponent.displayName = "ErrorComponent"

// Error message component
export interface ErrorMessageProps extends React.HTMLAttributes<HTMLDivElement> {
  error?: string | Error | null
  fallback?: string
  showIcon?: boolean
}

const ErrorMessage = React.forwardRef<HTMLDivElement, ErrorMessageProps>(
  ({ className, error, fallback = "An error occurred", showIcon = true, ...props }, ref) => {
    const errorMessage = React.useMemo(() => {
      if (!error) return null
      if (typeof error === "string") return error
      if (error instanceof Error) return error.message
      return fallback
    }, [error, fallback])

    if (!errorMessage) return null

    return (
      <div
        ref={ref}
        className={cn(
          "flex items-center space-x-2 text-sm text-destructive",
          className
        )}
        {...props}
      >
        {showIcon && <AlertCircle className="h-4 w-4 flex-shrink-0" />}
        <span>{errorMessage}</span>
      </div>
    )
  }
)
ErrorMessage.displayName = "ErrorMessage"

// Error state component
export interface ErrorStateProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string
  message?: string
  action?: React.ReactNode
  icon?: React.ReactNode
}

const ErrorState = React.forwardRef<HTMLDivElement, ErrorStateProps>(
  ({ className, title = "Something went wrong", message, action, icon, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex flex-col items-center justify-center p-8 text-center",
          className
        )}
        {...props}
      >
        {icon || <XCircle className="h-12 w-12 text-destructive mb-4" />}
        <h3 className="text-lg font-semibold text-foreground mb-2">
          {title}
        </h3>
        {message && (
          <p className="text-muted-foreground mb-4 max-w-md">
            {message}
          </p>
        )}
        {action}
      </div>
    )
  }
)
ErrorState.displayName = "ErrorState"

// Loading error component
export interface LoadingErrorProps extends React.HTMLAttributes<HTMLDivElement> {
  error?: string | Error | null
  onRetry?: () => void
  retryText?: string
}

const LoadingError = React.forwardRef<HTMLDivElement, LoadingErrorProps>(
  ({ className, error, onRetry, retryText = "Try again", ...props }, ref) => {
    const errorMessage = React.useMemo(() => {
      if (!error) return "Failed to load"
      if (typeof error === "string") return error
      if (error instanceof Error) return error.message
      return "An error occurred"
    }, [error])

    return (
      <div
        ref={ref}
        className={cn(
          "flex flex-col items-center justify-center p-8 text-center",
          className
        )}
        {...props}
      >
        <XCircle className="h-12 w-12 text-destructive mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">
          Failed to load
        </h3>
        <p className="text-muted-foreground mb-4 max-w-md">
          {errorMessage}
        </p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            {retryText}
          </button>
        )}
      </div>
    )
  }
)
LoadingError.displayName = "LoadingError"

export { 
  ErrorComponent, 
  ErrorMessage, 
  ErrorState, 
  LoadingError,
  errorVariants 
}
