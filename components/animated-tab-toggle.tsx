"use client"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

type Tab = {
  label: string
  value: string
}

interface AnimatedTabToggleProps {
  options: Tab[]
  value: string
  onChange: (value: string) => void
  className?: string
}

export function AnimatedTabToggle({ options, value, onChange, className }: AnimatedTabToggleProps) {
  return (
    <div
      className={cn(
        "relative flex w-full max-w-md mx-auto bg-muted rounded-full border border-border overflow-hidden",
        className,
      )}
    >
      {options.map((option) => {
        const isActive = option.value === value
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={cn(
              "relative z-10 flex-1 text-sm font-medium text-center py-2 px-3 transition-all min-w-[120px]",
              isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {option.label}
            {isActive && (
              <motion.div
                layoutId="toggle"
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                className="absolute inset-0 bg-background rounded-full z-[-1] shadow-sm"
              />
            )}
          </button>
        )
      })}
    </div>
  )
}
