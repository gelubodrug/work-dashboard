"use server"

import { sql } from "@vercel/postgres"

export async function createVehiclePresenceIndexes() {
  try {
    console.log("🔧 [DB-MIGRATION] Creating indexes on vehicle_presence table...")

    // Main index for car_plate and detected_at (most common query pattern)
    await sql`
      CREATE INDEX IF NOT EXISTS idx_presence_car_plate_detected 
      ON vehicle_presence (car_plate, detected_at)
    `
    console.log("🔧 [DB-MIGRATION] Created index: idx_presence_car_plate_detected")

    // Index for departure queries (includes the was_near_chitila condition)
    await sql`
      CREATE INDEX IF NOT EXISTS idx_vehicle_departure 
      ON vehicle_presence (car_plate, detected_at, was_near_chitila)
    `
    console.log("🔧 [DB-MIGRATION] Created index: idx_vehicle_departure")

    // Index for distance-based queries
    await sql`
      CREATE INDEX IF NOT EXISTS idx_vehicle_distance 
      ON vehicle_presence (car_plate, detected_at, distance_from_chitila)
    `
    console.log("🔧 [DB-MIGRATION] Created index: idx_vehicle_distance")

    return { success: true, message: "Vehicle presence indexes created successfully" }
  } catch (error) {
    console.error("🔧 [DB-MIGRATION] Error creating indexes:", error)
    return { success: false, error: String(error) }
  }
}
