"use client"

import { PlayCircle, StopCircle } from "lucide-react"
import { formatGPSTimestamp } from "@/utils/date-utils"

interface GPSTimestampsProps {
  gpsStartDate?: string | null
  gpsCompletionDate?: string | null
  returnTime?: string | null
}

export function GPSTimestamps({ gpsStartDate, gpsCompletionDate, returnTime }: GPSTimestampsProps) {
  // Format the GPS start date
  const formattedStartDate = gpsStartDate ? formatGPSTimestamp(gpsStartDate) : null

  // Format the GPS completion date
  const formattedCompletionDate = gpsCompletionDate ? formatGPSTimestamp(gpsCompletionDate) : null

  // If we don't have GPS timestamps, don't render anything
  if (!formattedStartDate && !formattedCompletionDate) {
    return null
  }

  return (
    <div className="flex flex-col gap-1 text-xs">
      {formattedStartDate && (
        <div className="flex items-center">
          <PlayCircle className="h-3 w-3 mr-1 text-green-500" />
          <span className="text-green-600 font-medium">GO {formattedStartDate}</span>
        </div>
      )}
      {formattedCompletionDate && (
        <div className="flex items-center">
          <StopCircle className="h-3 w-3 mr-1 text-red-500" />
          <span className="text-red-600 font-medium">RETURN {formattedCompletionDate}</span>
        </div>
      )}
    </div>
  )
}
