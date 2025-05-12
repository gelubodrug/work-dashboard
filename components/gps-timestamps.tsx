import { format, parseISO, addHours } from "date-fns"

interface GPSTimestampsProps {
  gpsStartDate: string | null
  gpsCompletionDate: string | null
  returnTime?: string | null
}

export function GPSTimestamps({ gpsStartDate, gpsCompletionDate, returnTime }: GPSTimestampsProps) {
  const formatGPSTime = (dateString: string | null) => {
    if (!dateString) return "NA"
    try {
      const date = addHours(parseISO(dateString), 3)
      return format(date, "HH:mm") // ✅ 24-hour format
    } catch (e) {
      return "Invalid"
    }
  }

  const formatDay = (dateString: string | null) => {
    if (!dateString) return "-"
    try {
      const date = addHours(parseISO(dateString), 3)
      return format(date, "d") // Only Day
    } catch (e) {
      return "-"
    }
  }

  const displayReturnTime = returnTime || gpsCompletionDate

  return (
    <div className="flex flex-col items-end text-xs gap-1 mt-1">
      {/* GPS OUT Row */}
      <div className="flex items-center gap-1">
        {/* Grey GPS icon */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-3 w-3 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
          />
          <circle cx="12" cy="9" r="2.5" />
        </svg>

        {/* Day badge */}
        <div className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-[11px] font-medium">
          {formatDay(gpsStartDate)}
        </div>

        {/* GO time */}
        <div className="min-w-[80px] px-2 py-0.5 bg-green-50 text-green-700 rounded border border-green-200 font-medium text-[11px] text-center">
          GO {formatGPSTime(gpsStartDate)}
        </div>
      </div>

      {/* GPS IN Row */}
      <div className="flex items-center gap-1">
        {/* Empty space instead of icon */}
        <div className="w-3" />

        {/* Day badge */}
        <div className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-[11px] font-medium">
          {formatDay(displayReturnTime)}
        </div>

        {/* IN time (AMBER now) */}
        <div className="min-w-[80px] px-2 py-0.5 bg-amber-50 text-amber-700 rounded border border-amber-200 font-medium text-[11px] text-center">
          IN {formatGPSTime(displayReturnTime)}
        </div>
      </div>
    </div>
  )
}
