import { NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET() {
  try {
    console.log("🔍 Checking vehicle_presence indexes...")

    // First, verify the table exists
    const tableCheck = await query(
      `SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'vehicle_presence'
      )`,
      [],
    )

    const tableExists = tableCheck.rows[0]?.exists
    if (!tableExists) {
      return NextResponse.json(
        {
          success: false,
          error: "Table 'vehicle_presence' does not exist",
        },
        { status: 404 },
      )
    }

    console.log("✅ Table 'vehicle_presence' exists")

    // Check existing indexes
    const existingIndexes = await query(
      `SELECT indexname, indexdef
       FROM pg_indexes 
       WHERE tablename = 'vehicle_presence'
       ORDER BY indexname`,
      [],
    )

    console.log(`📊 Found ${existingIndexes.rows.length} existing indexes`)

    // Create the indexes one by one with detailed error reporting
    const results = []

    try {
      console.log("🔧 Creating index: idx_presence_car_plate_detected")
      const result1 = await query(
        `CREATE INDEX IF NOT EXISTS idx_presence_car_plate_detected 
         ON vehicle_presence (car_plate, detected_at)`,
        [],
      )
      results.push({
        index: "idx_presence_car_plate_detected",
        status: "Created successfully",
      })
    } catch (error) {
      console.error("❌ Error creating idx_presence_car_plate_detected:", error)
      results.push({
        index: "idx_presence_car_plate_detected",
        status: "Error",
        error: String(error),
      })
    }

    try {
      console.log("🔧 Creating index: idx_vehicle_departure")
      const result2 = await query(
        `CREATE INDEX IF NOT EXISTS idx_vehicle_departure 
         ON vehicle_presence (car_plate, detected_at, was_near_chitila)`,
        [],
      )
      results.push({
        index: "idx_vehicle_departure",
        status: "Created successfully",
      })
    } catch (error) {
      console.error("❌ Error creating idx_vehicle_departure:", error)
      results.push({
        index: "idx_vehicle_departure",
        status: "Error",
        error: String(error),
      })
    }

    try {
      console.log("🔧 Creating index: idx_vehicle_distance")
      // Note: distance_from_chitila is TEXT type, so we need to be careful with indexing
      const result3 = await query(
        `CREATE INDEX IF NOT EXISTS idx_vehicle_distance 
         ON vehicle_presence (car_plate, detected_at, distance_from_chitila)`,
        [],
      )
      results.push({
        index: "idx_vehicle_distance",
        status: "Created successfully",
      })
    } catch (error) {
      console.error("❌ Error creating idx_vehicle_distance:", error)
      results.push({
        index: "idx_vehicle_distance",
        status: "Error",
        error: String(error),
      })
    }

    // Check indexes again after creation attempts
    const updatedIndexes = await query(
      `SELECT indexname, indexdef
       FROM pg_indexes 
       WHERE tablename = 'vehicle_presence'
       ORDER BY indexname`,
      [],
    )

    console.log(`📊 Found ${updatedIndexes.rows.length} indexes after creation`)

    return NextResponse.json({
      success: true,
      tableExists,
      beforeCreation: existingIndexes.rows,
      creationResults: results,
      afterCreation: updatedIndexes.rows,
    })
  } catch (error) {
    console.error("❌ Top-level error:", error)
    return NextResponse.json(
      {
        success: false,
        error: String(error),
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}
