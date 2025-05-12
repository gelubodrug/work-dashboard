"use server"

import { query } from "@/lib/db"

export async function debugVehicleData(carPlate: string) {
  try {
    console.log(`🔍 [DEBUG] Starting debug for car ${carPlate}`)

    // 1. Get assignment data
    const assignmentResult = await query(
      `SELECT id, car_plate, created_at, start_date, gps_start_date, return_time, status 
       FROM assignments 
       WHERE car_plate = $1 
       ORDER BY created_at DESC 
       LIMIT 1`,
      [carPlate],
    )

    const assignment = assignmentResult.rows[0] || null
    console.log(`🔍 [DEBUG] Assignment data:`, assignment)

    // 2. Get vehicle presence data
    const presenceResult = await query(
      `SELECT detected_at, distance_from_chitila, was_near_chitila 
       FROM vehicle_presence 
       WHERE car_plate = $1 
       ORDER BY detected_at DESC 
       LIMIT 10`,
      [carPlate],
    )

    const presenceData = presenceResult.rows || []
    console.log(`🔍 [DEBUG] Found ${presenceData.length} vehicle presence records`)

    // 3. Check for return data specifically
    const returnResult = await query(
      `
      SELECT detected_at, distance_from_chitila 
      FROM vehicle_presence 
      WHERE car_plate = $1 
        AND (
          CASE 
            WHEN distance_from_chitila ~ E'^\\d+(\\.\\d+)?$' THEN 
              CAST(distance_from_chitila AS DECIMAL) < 6
            ELSE 
              was_near_chitila = TRUE
          END
        )
      ORDER BY detected_at DESC 
      LIMIT 5
      `,
      [carPlate],
    )

    const returnData = returnResult.rows || []
    console.log(`🔍 [DEBUG] Found ${returnData.length} return records:`, returnData)

    return {
      assignment,
      presenceData: presenceData.map((d) => ({
        detected_at: d.detected_at,
        distance: d.distance_from_chitila,
        was_near_chitila: d.was_near_chitila,
      })),
      returnData: returnData.map((d) => ({
        detected_at: d.detected_at,
        distance: d.distance_from_chitila,
        adjusted: new Date(new Date(d.detected_at).getTime() + 3 * 60 * 60 * 1000).toISOString(),
      })),
    }
  } catch (error) {
    console.error(`🔍 [DEBUG] Error:`, error)
    return { error: String(error) }
  }
}
