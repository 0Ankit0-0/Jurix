import { cn } from "@/lib/utils"

export function LoadingSpinner({ className, size = "default", ...props }) {
  const sizeClasses = {
    sm: "h-4 w-4",
    default: "h-6 w-6", 
    lg: "h-8 w-8",
    xl: "h-12 w-12"
  }

  return (
    <div
      className={cn(
        "animate-spin rounded-full border-2 border-current border-t-transparent",
        sizeClasses[size],
        className
      )}
      {...props}
    >
      <span className="sr-only">Loading...</span>
    </div>
  )
}

export function LoadingDots({ className, ...props }) {
  return (
    <div className={cn("flex space-x-1", className)} {...props}>
      <div className="h-2 w-2 bg-current rounded-full animate-bounce [animation-delay:-0.3s]"></div>
      <div className="h-2 w-2 bg-current rounded-full animate-bounce [animation-delay:-0.15s]"></div>
      <div className="h-2 w-2 bg-current rounded-full animate-bounce"></div>
    </div>
  )
}

export function LoadingPulse({ className, ...props }) {
  return (
    <div className={cn("flex space-x-2", className)} {...props}>
      <div className="h-3 w-3 bg-current rounded-full animate-pulse"></div>
      <div className="h-3 w-3 bg-current rounded-full animate-pulse [animation-delay:0.2s]"></div>
      <div className="h-3 w-3 bg-current rounded-full animate-pulse [animation-delay:0.4s]"></div>
    </div>
  )
}

export function LoadingOverlay({ children, loading, className, spinnerSize = "lg" }) {
  if (!loading) {
    return children;
  }

  return (
    <div className={cn("relative", className)}>
      {children}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
        <LoadingSpinner size={spinnerSize} className="text-primary" />
      </div>
    </div>
  )
}

export function LoadingScreen({ message = "Loading...", className }) {
  return (
    <div className={cn(
      "min-h-screen bg-background flex flex-col items-center justify-center space-y-4",
      className
    )}>
      <LoadingSpinner size="xl" className="text-primary" />
      {message && (
        <p className="text-muted-foreground animate-pulse-soft">{message}</p>
      )}
    </div>
  )
}

export function LoadingCard({ className }) {
  return (
    <div className={cn("rounded-lg border bg-card p-6 space-y-4 animate-pulse", className)}>
      <div className="h-4 bg-muted rounded w-3/4"></div>
      <div className="h-4 bg-muted rounded w-1/2"></div>
      <div className="h-4 bg-muted rounded w-5/6"></div>
    </div>
  )
}