"use server"

import { query } from "@/lib/db"
import { format } from "date-fns"

interface VehicleTimestamps {
  realStartDate: string | null
  realCompletionDate: string | null
}

export async function getVehicleTimestamps(carPlate: string, assignmentCreatedAt: string): Promise<VehicleTimestamps> {
  try {
    console.log(`🚙 [VEHICLE-TIMESTAMPS] FUNCTION CALLED for car ${carPlate} after ${assignmentCreatedAt}`)
    if (!carPlate) {
      console.log("🚙 [VEHICLE-TIMESTAMPS] No car plate provided, skipping GPS check")
      return { realStartDate: null, realCompletionDate: null }
    }

    const createdDate = new Date(assignmentCreatedAt)
    const formattedCreatedDate = format(createdDate, "MMM d, HH:mm")

    // STEP 1: Find first departure (was_near_chitila = false)
    const departureResult = await query(
      `
     SELECT id, detected_at, distance_from_chitila 
     FROM vehicle_presence 
     WHERE car_plate = $1 
       AND detected_at > $2 
       AND was_near_chitila = FALSE 
     ORDER BY detected_at ASC 
     LIMIT 1
     `,
      [carPlate, assignmentCreatedAt],
    )

    if (departureResult.rows.length === 0) {
      console.log(`🚙 [VEHICLE-TIMESTAMPS] No departure found after assignment for ${carPlate}`)
      return { realStartDate: null, realCompletionDate: null }
    }

    const rawStartDate = departureResult.rows[0].detected_at
    const realStartDate = new Date(rawStartDate).toISOString()
    const formattedDepartureDate = format(new Date(rawStartDate), "MMM d, HH:mm")
    const departureDistance = departureResult.rows[0].distance_from_chitila || "unknown"
    const departureId = departureResult.rows[0].id

    console.log(
      `🚙 [VEHICLE-TIMESTAMPS] Found realStartDate: ${realStartDate} (raw UTC: ${rawStartDate}) with ID: ${departureId}`,
    )

    // STEP 2: Look for return: was_near_chitila = true or distance < 6
    const returnResult = await query(
      `
     SELECT id, detected_at, distance_from_chitila 
     FROM vehicle_presence 
     WHERE car_plate = $1 
       AND (
         CAST(NULLIF(regexp_replace(distance_from_chitila, '[^0-9.]', '', 'g'), '') AS DECIMAL) < 6 
         OR was_near_chitila = TRUE
       )
     ORDER BY detected_at ASC
     `,
      [carPlate],
    )

    let realCompletionDate: string | null = null
    let formattedReturnDate = "Not yet"
    let returnDistance = "unknown"
    let returnId: number | null = null

    for (const row of returnResult.rows) {
      const detectedAt = new Date(row.detected_at)
      if (detectedAt > new Date(rawStartDate)) {
        realCompletionDate = detectedAt.toISOString()
        formattedReturnDate = format(detectedAt, "MMM d, HH:mm")
        returnDistance = row.distance_from_chitila || "unknown"
        returnId = row.id
        console.log(
          `🚙 [VEHICLE-TIMESTAMPS] Found realCompletionDate: ${realCompletionDate} (raw UTC: ${row.detected_at}) with ID: ${returnId}`,
        )
        break
      }
    }

    console.log(
      `🚙 [VEHICLE-TIMESTAMPS] ${carPlate} | Created: ${formattedCreatedDate} | GPS departure: ${formattedDepartureDate} (${departureDistance}) ID: ${departureId} | GPS return: ${formattedReturnDate} (${returnDistance}) ID: ${returnId}`,
    )

    return {
      realStartDate,
      realCompletionDate,
    }
  } catch (error) {
    console.error("🚙 [VEHICLE-TIMESTAMPS] ERROR during timestamp lookup:", error)
    return { realStartDate: null, realCompletionDate: null }
  }
}
