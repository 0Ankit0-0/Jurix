import { forwardRef } from "react"
import { cn } from "@/lib/utils"
import { Check } from "lucide-react"

const SimpleCheckbox = forwardRef(({ 
  className, 
  checked, 
  onCheckedChange, 
  disabled,
  ...props 
}, ref) => {
  const handleChange = (e) => {
    if (onCheckedChange) {
      onCheckedChange(e.target.checked)
    }
  }

  return (
    <div className="relative">
      <input
        ref={ref}
        type="checkbox"
        checked={checked}
        onChange={handleChange}
        disabled={disabled}
        className="sr-only"
        {...props}
      />
      <div
        className={cn(
          "h-4 w-4 shrink-0 rounded-sm border border-border ring-offset-background transition-all duration-200 cursor-pointer",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-50",
          checked && "bg-primary text-primary-foreground border-primary",
          !checked && "bg-background hover:bg-muted",
          disabled && "cursor-not-allowed opacity-50",
          className
        )}
        onClick={() => !disabled && onCheckedChange && onCheckedChange(!checked)}
      >
        {checked && (
          <div className="flex items-center justify-center text-current">
            <Check className="h-3 w-3" />
          </div>
        )}
      </div>
    </div>
  )
})

SimpleCheckbox.displayName = "SimpleCheckbox"

export { SimpleCheckbox }