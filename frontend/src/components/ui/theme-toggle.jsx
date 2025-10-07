import { useState, useEffect } from "react"
import { Moon, Sun } from "lucide-react"
import { Button } from "./button"
import { cn } from "@/lib/utils"

export function ThemeToggle({ className }) {
  const [theme, setTheme] = useState(
    () => (typeof window !== "undefined" ? localStorage.getItem("theme") || "light" : "light")
  )
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    if (typeof window !== "undefined") {
      document.documentElement.classList.toggle("dark", theme === "dark")
      localStorage.setItem("theme", theme)
    }
  }, [theme])

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"))
  }

  if (!mounted) return null

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className={cn(
        "w-10 h-10 rounded-xl glass-card border border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-all duration-300 group",
        className
      )}
      aria-label="Toggle theme"
    >
      <Sun className="h-5 w-5 text-warning rotate-0 scale-100 transition-all duration-300 dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-5 w-5 text-primary rotate-90 scale-0 transition-all duration-300 dark:rotate-0 dark:scale-100" />
    </Button>
  )
}

export default ThemeToggle