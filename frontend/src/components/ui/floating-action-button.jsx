import { Button } from "./button"
import { cn } from "@/lib/utils"

export function FloatingActionButton({ 
  children, 
  className, 
  position = "bottom-right",
  ...props 
}) {
  const positionClasses = {
    "bottom-right": "bottom-6 right-6",
    "bottom-left": "bottom-6 left-6",
    "top-right": "top-6 right-6",
    "top-left": "top-6 left-6",
  }

  return (
    <Button
      size="icon"
      className={cn(
        "fixed z-50 h-14 w-14 rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-110 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90",
        positionClasses[position],
        className
      )}
      {...props}
    >
      {children}
    </Button>
  )
}

export default FloatingActionButton