export function formatDate(dateString: string | null): string {
  if (!dateString) return "N/A"

  try {
    const date = new Date(dateString)

    // Check if the date is valid
    if (isNaN(date.getTime())) {
      console.error("Invalid date:", dateString)
      return dateString
    }

    // Use Romanian timezone (Europe/Bucharest) for consistent display
    return new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Europe/Bucharest", // Force Romanian timezone
      hour12: false, // Use 24-hour format
    }).format(date)
  } catch (error) {
    console.error("Error formatting date:", error)
    return dateString
  }
}

// Add a specific function for time-only display
export function formatTime(dateString: string | null): string {
  if (!dateString) return "N/A"

  try {
    const date = new Date(dateString)

    if (isNaN(date.getTime())) {
      console.error("Invalid date:", dateString)
      return dateString
    }

    // Use Romanian timezone for time display
    return new Intl.DateTimeFormat("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Europe/Bucharest",
      hour12: false,
    }).format(date)
  } catch (error) {
    console.error("Error formatting time:", error)
    return dateString
  }
}

// Add function for debugging timezone issues
export function debugTimezone(dateString: string | null): void {
  if (!dateString) return

  const date = new Date(dateString)
  console.log(`Original: ${dateString}`)
  console.log(`UTC: ${date.toISOString()}`)
  console.log(`Local: ${date.toLocaleString()}`)
  console.log(`Romania: ${date.toLocaleString("en-GB", { timeZone: "Europe/Bucharest" })}`)
}
