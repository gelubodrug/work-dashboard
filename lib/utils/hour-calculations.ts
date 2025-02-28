import type { Assignment } from "@/lib/db/types"
import { addHours, differenceInMinutes, isWithinInterval, parseISO, subMinutes } from "date-fns"

export function calculateTotalHours(assignments: Assignment[], dateRange: { from: Date; to: Date }): number {
  const now = new Date()
  const thirtyMinutesAgo = subMinutes(now, 30)

  return assignments.reduce((total, assignment) => {
    // Check if the assignment is within the date range
    const startDate = parseISO(assignment.start_date)
    if (!isWithinInterval(startDate, dateRange)) {
      return total
    }

    // Adjust dates for Romania time (UTC+2)
    const adjustedStartDate = addHours(startDate, 2)
    let endDate: Date

    if (assignment.status === "Finalizat" && assignment.completion_date) {
      endDate = addHours(parseISO(assignment.completion_date), 2)
    } else if (assignment.status === "In Deplasare") {
      endDate = thirtyMinutesAgo
    } else {
      return total // Skip assignments that are not Finalizat or In Deplasare
    }

    // Ensure end date is not before start date
    if (endDate < adjustedStartDate) {
      console.warn(`Invalid date range for assignment ${assignment.id}`)
      return total
    }

    // Calculate hours, converting from minutes to hours
    const hours = differenceInMinutes(endDate, adjustedStartDate) / 60

    return total + (hours > 0 ? hours : 0)
  }, 0)
}

export function calculateHoursByType(
  assignments: Assignment[],
  dateRange: { from: Date; to: Date },
): {
  deschidere: number
  interventie: number
  optimizare: number
} {
  const hoursByType = {
    deschidere: 0,
    interventie: 0,
    optimizare: 0,
  }

  assignments.forEach((assignment) => {
    const startDate = parseISO(assignment.start_date)
    if (!isWithinInterval(startDate, dateRange)) {
      return
    }

    const hours = calculateTotalHours([assignment], dateRange)

    switch (assignment.type.toLowerCase()) {
      case "deschidere":
        hoursByType.deschidere += hours
        break
      case "interventie":
        hoursByType.interventie += hours
        break
      case "optimizare":
        hoursByType.optimizare += hours
        break
      default:
        console.warn(`Unknown assignment type: ${assignment.type}`)
    }
  })

  return hoursByType
}

