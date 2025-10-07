import { forwardRef } from "react"
import { cn } from "@/lib/utils"
import { Label } from "./label"
import { Input } from "./input"
import { AlertCircle, Check } from "lucide-react"

const FormField = forwardRef(({ 
  label, 
  error, 
  success,
  required, 
  className, 
  children,
  ...props 
}, ref) => {
  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <Label 
          htmlFor={props.id} 
          className={cn(
            "text-sm font-medium flex items-center gap-1",
            error && "text-destructive",
            success && "text-success"
          )}
        >
          {label}
          {required && <span className="text-destructive">*</span>}
        </Label>
      )}
      
      <div className="relative">
        {children || (
          <Input
            ref={ref}
            className={cn(
              "h-11 transition-all duration-200",
              error && "border-destructive focus:border-destructive focus:ring-destructive/20",
              success && "border-success focus:border-success focus:ring-success/20"
            )}
            {...props}
          />
        )}
        
        {(error || success) && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {error ? (
              <AlertCircle className="h-4 w-4 text-destructive" />
            ) : (
              <Check className="h-4 w-4 text-success" />
            )}
          </div>
        )}
      </div>
      
      {error && (
        <p className="text-sm text-destructive flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          {error}
        </p>
      )}
      
      {success && (
        <p className="text-sm text-success flex items-center gap-1">
          <Check className="h-3 w-3" />
          {success}
        </p>
      )}
    </div>
  )
})

FormField.displayName = "FormField"

export { FormField }