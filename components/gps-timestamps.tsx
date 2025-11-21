import { formatTime } from "@/utils/date-utils"

interface GPSTimestampsProps {
  gpsStartDate: string | null
  gpsCompletionDate: string | null
  returnTime?: string | null
}

export function GPSTimestamps({ gpsStartDate, gpsCompletionDate, returnTime }: GPSTimestampsProps) {
  // Use the formatTime function from utils/date-utils.ts
  const formatGPSTime = (dateString: string | null) => {
    if (!dateString) return "NA"
    return formatTime(dateString)
  }

  const formatDay = (dateString: string | null) => {
    if (!dateString) return "-"
    try {
      const date = new Date(dateString)
      // Use Romanian timezone for consistent display
      return new Intl.DateTimeFormat("en-GB", {
        day: "numeric",
        timeZone: "Europe/Bucharest",
      }).format(date)
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
          className="h-3 w-3 text-slate-400 dark:text-slate-400"
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

        <div className="px-2 py-0.5 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded text-[11px] font-medium">
          {formatDay(gpsStartDate)}
        </div>

        <div className="min-w-[80px] px-2 py-0.5 bg-emerald-100 dark:bg-emerald-600/20 text-emerald-700 dark:text-emerald-400 rounded border border-emerald-300 dark:border-emerald-500/30 font-medium text-[11px] text-center">
          GO {formatGPSTime(gpsStartDate)}
        </div>
      </div>

      {/* GPS IN Row */}
      <div className="flex items-center gap-1">
        {/* Empty space instead of icon */}
        <div className="w-3" />

        <div className="px-2 py-0.5 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded text-[11px] font-medium">
          {formatDay(displayReturnTime)}
        </div>

        <div className="min-w-[80px] px-2 py-0.5 bg-orange-100 dark:bg-orange-600/20 text-orange-700 dark:text-orange-400 rounded border border-orange-300 dark:border-orange-500/30 font-medium text-[11px] text-center">
          IN {formatGPSTime(displayReturnTime)}
        </div>
      </div>
    </div>
  )
}
