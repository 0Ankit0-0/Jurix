import { cn } from "@/lib/utils"
import { Button } from "./button"

export function EmptyState({ 
  icon: Icon, 
  title, 
  description, 
  action, 
  className,
  children,
  ...props 
}) {
  return (
    <div 
      className={cn(
        "flex flex-col items-center justify-center text-center py-16 px-4",
        className
      )}
      {...props}
    >
      {Icon && (
        <div className="relative mb-6">
          <div className="w-24 h-24 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Icon className="h-12 w-12 text-muted-foreground" />
          </div>
          <div className="absolute -top-2 -right-2 w-8 h-8 bg-accent/20 rounded-full animate-pulse"></div>
        </div>
      )}

      {title && (
        <h3 className="text-2xl font-heading font-semibold text-foreground mb-4">
          {title}
        </h3>
      )}

      {description && (
        <p className="text-muted-foreground mb-8 max-w-md mx-auto leading-relaxed">
          {description}
        </p>
      )}

      {action && (
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {action}
        </div>
      )}

      {children}
    </div>
  )
}

export function EmptySearchState({ searchTerm, onClear, onReset }) {
  return (
    <EmptyState
      title="No results found"
      description={`No cases match "${searchTerm}". Try adjusting your search terms or filters.`}
      action={
        <div className="flex flex-col sm:flex-row gap-3">
          {onClear && (
            <Button
              variant="outline"
              onClick={onClear}
              className="glass-card border-border/50 hover:border-primary/50"
            >
              Clear search
            </Button>
          )}
          {onReset && (
            <Button
              variant="outline"
              onClick={onReset}
              className="glass-card border-border/50 hover:border-primary/50"
            >
              Reset filters
            </Button>
          )}
        </div>
      }
    />
  )
}