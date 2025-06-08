"use client"

import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { format } from "date-fns"

interface MonthSelectorProps {
  selectedDate: Date
  onPreviousMonth: () => void
  onNextMonth: () => void
  onSelectMonth: (date: Date) => void
}

export function MonthSelector({ selectedDate, onPreviousMonth, onNextMonth, onSelectMonth }: MonthSelectorProps) {
  return (
    <div className="flex items-center space-x-2">
      <Button variant="outline" size="sm" onClick={onPreviousMonth}>
        <ChevronLeft className="w-4 h-4" />
      </Button>

      <div className="px-4 py-2 bg-gray-50 rounded-md min-w-[140px] text-center">
        <span className="text-sm font-medium">{format(selectedDate, "MMMM yyyy")}</span>
      </div>

      <Button variant="outline" size="sm" onClick={onNextMonth}>
        <ChevronRight className="w-4 h-4" />
      </Button>
    </div>
  )
}
