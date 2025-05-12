"use server"

import { query } from "@/lib/db"
import { revalidatePath } from "next/cache"

export async function forceUpdateReturnTimeForIF65XOX() {
  try {
    console.log("🚙 [FORCE-UPDATE] Starting force update for IF 65 XOX")

    // Get the latest GPS data for IF 65 XOX where distance < 6km
    const gpsResult = await query(
      `
      SELECT detected_at, distance_from_chitila 
      FROM vehicle_presence 
      WHERE car_plate = 'IF 65 XOX' 
        AND (
          CASE 
            WHEN distance_from_chitila ~ E'^\\d+(\\.\\d+)?$' THEN 
              CAST(distance_from_chitila AS DECIMAL) < 6
            ELSE 
              was_near_chitila = TRUE
          END
        )
      ORDER BY detected_at DESC 
      LIMIT 1
      `,
      [],
    )

    if (gpsResult.rows.length === 0) {
      console.log("🚙 [FORCE-UPDATE] No return data found for IF 65 XOX")
      return { success: false, message: "No return data found" }
    }

    // Get the raw GPS return time
    const rawCompletionDate = gpsResult.rows[0].detected_at
    const returnDistance = gpsResult.rows[0].distance_from_chitila

    console.log(`🚙 [FORCE-UPDATE] Found raw return time: ${rawCompletionDate} (${returnDistance} km)`)

    // Adjust the return time by adding 3 hours
    const completionDate = new Date(rawCompletionDate)
    completionDate.setHours(completionDate.getHours() + 3)
    const realCompletionDate = completionDate.toISOString()

    console.log(`🚙 [FORCE-UPDATE] Adjusted return time: ${realCompletionDate}`)

    // Update all active assignments for IF 65 XOX
    const updateResult = await query(
      `
      UPDATE assignments 
      SET return_time = $1 
      WHERE car_plate = 'IF 65 XOX' AND status = 'In Deplasare'
      RETURNING id
      `,
      [realCompletionDate],
    )

    const updatedCount = updateResult.rowCount || 0
    console.log(`🚙 [FORCE-UPDATE] Updated ${updatedCount} assignments for IF 65 XOX`)

    revalidatePath("/assignments")

    return {
      success: true,
      message: `Updated return time for IF 65 XOX to ${realCompletionDate}`,
      updatedCount,
      returnTime: realCompletionDate,
    }
  } catch (error) {
    console.error("🚙 [FORCE-UPDATE] Error:", error)
    return { success: false, error: String(error) }
  }
}
