import * as React from "react"
import { cn } from "@/lib/utils"
import { Check, X, AlertCircle } from "lucide-react"

const EnhancedInput = React.forwardRef(
  ({ className, type, error, success, icon: Icon, ...props }, ref) => {
    const [isFocused, setIsFocused] = React.useState(false)

    return (
      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            <Icon className="h-4 w-4" />
          </div>
        )}
        <input
          type={type}
          className={cn(
            "flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-base shadow-xs transition-all duration-200 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
            Icon && "pl-10",
            (error || success) && "pr-10",
            error && "border-destructive focus-visible:ring-destructive/20",
            success && "border-success focus-visible:ring-success/20",
            isFocused && "shadow-md",
            className
          )}
          ref={ref}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />
        {error && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-destructive">
            <AlertCircle className="h-4 w-4" />
          </div>
        )}
        {success && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-success">
            <Check className="h-4 w-4" />
          </div>
        )}
      </div>
    )
  }
)

EnhancedInput.displayName = "EnhancedInput"

export { EnhancedInput }
export default EnhancedInput