import { useMemo } from "react"
import { cn } from "@/lib/utils"
import { Check, X } from "lucide-react"

const getPasswordStrength = (password) => {
  let score = 0
  const checks = {
    length: password.length >= 8,
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    number: /\d/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
  }

  Object.values(checks).forEach(check => {
    if (check) score++
  })

  let strength = 'weak'
  let color = 'bg-destructive'
  
  if (score >= 4) {
    strength = 'strong'
    color = 'bg-success'
  } else if (score >= 3) {
    strength = 'medium'
    color = 'bg-warning'
  }

  return { score, strength, color, checks }
}

export function PasswordStrength({ password, className }) {
  const { score, strength, color, checks } = useMemo(() => 
    getPasswordStrength(password), [password]
  )

  if (!password) return null

  return (
    <div className={cn("space-y-3 p-3 rounded-lg bg-muted/30 border border-border/50", className)}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-foreground">Password Strength</span>
        <span className={cn(
          "text-xs font-semibold px-2 py-1 rounded-full",
          strength === 'strong' && "bg-success/10 text-success",
          strength === 'medium' && "bg-warning/10 text-warning", 
          strength === 'weak' && "bg-destructive/10 text-destructive"
        )}>
          {strength.toUpperCase()}
        </span>
      </div>
      
      <div className="flex gap-1">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className={cn(
              "h-2 flex-1 rounded-full transition-colors duration-200",
              i < score ? color : "bg-muted"
            )}
          />
        ))}
      </div>

      <div className="space-y-1">
        {Object.entries({
          length: "At least 8 characters",
          lowercase: "One lowercase letter",
          uppercase: "One uppercase letter", 
          number: "One number",
          special: "One special character"
        }).map(([key, label]) => (
          <div key={key} className="flex items-center gap-2 text-xs">
            {checks[key] ? (
              <Check className="h-3 w-3 text-success" />
            ) : (
              <X className="h-3 w-3 text-muted-foreground" />
            )}
            <span className={cn(
              "transition-colors",
              checks[key] ? "text-success" : "text-muted-foreground"
            )}>
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}