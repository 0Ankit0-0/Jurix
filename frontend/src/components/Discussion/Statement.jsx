import { useState } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Statement({ content }) {
  const [isThinkingVisible, setIsThinkingVisible] = useState(false)

  // The thinking process is separated by "***" or "---"
  const parts = content.split(/\n---\n|\n\*\*\*\n/)
  const statement = parts[0]
  const thinkingProcess = parts.length > 1 ? parts[1] : null

  const toggleThinkingVisibility = () => {
    setIsThinkingVisible(!isThinkingVisible)
  }

  return (
    <div>
      <p className="text-foreground leading-relaxed whitespace-pre-wrap">
        {statement}
      </p>
      {thinkingProcess && (
        <div className="mt-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleThinkingVisibility}
            className="gap-2 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all duration-200"
          >
            {isThinkingVisible ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
            <span>Thinking Process</span>
          </Button>
          {isThinkingVisible && (
            <div className="mt-2 p-4 bg-primary/5 rounded-lg border border-primary/10">
              <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {thinkingProcess}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}