import { NextResponse } from "next/server"
import { sql } from "@/lib/db/neon"

export async function GET() {
  try {
    // First check if the table exists
    const tableCheck = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'vehicle_presence'
      );
    `

    const tableExists = tableCheck[0]?.exists || false

    if (!tableExists) {
      return NextResponse.json(
        {
          success: false,
          error: "Table 'vehicle_presence' does not exist in the public schema",
        },
        { status: 404 },
      )
    }

    // Check existing indexes
    const existingIndexes = await sql`
      SELECT 
        indexname, 
        indexdef
      FROM 
        pg_indexes 
      WHERE 
        tablename = 'vehicle_presence' 
        AND schemaname = 'public'
      ORDER BY 
        indexname;
    `

    // Try to create the indexes again with explicit schema
    const createResults = []

    try {
      const result1 = await sql`
        CREATE INDEX IF NOT EXISTS idx_presence_car_plate_detected 
        ON public.vehicle_presence (car_plate, detected_at);
      `
      createResults.push({
        index: "idx_presence_car_plate_detected",
        result: "Created or already exists",
      })
    } catch (error) {
      createResults.push({
        index: "idx_presence_car_plate_detected",
        error: String(error),
      })
    }

    try {
      const result2 = await sql`
        CREATE INDEX IF NOT EXISTS idx_vehicle_departure 
        ON public.vehicle_presence (car_plate, detected_at, was_near_chitila);
      `
      createResults.push({
        index: "idx_vehicle_departure",
        result: "Created or already exists",
      })
    } catch (error) {
      createResults.push({
        index: "idx_vehicle_departure",
        error: String(error),
      })
    }

    try {
      const result3 = await sql`
        CREATE INDEX IF NOT EXISTS idx_vehicle_distance 
        ON public.vehicle_presence (car_plate, detected_at, distance_from_chitila);
      `
      createResults.push({
        index: "idx_vehicle_distance",
        result: "Created or already exists",
      })
    } catch (error) {
      createResults.push({
        index: "idx_vehicle_distance",
        error: String(error),
      })
    }

    // Check indexes again after creation attempts
    const updatedIndexes = await sql`
      SELECT 
        indexname, 
        indexdef
      FROM 
        pg_indexes 
      WHERE 
        tablename = 'vehicle_presence' 
        AND schemaname = 'public'
      ORDER BY 
        indexname;
    `

    return NextResponse.json({
      success: true,
      tableExists,
      beforeCreation: existingIndexes,
      creationAttempts: createResults,
      afterCreation: updatedIndexes,
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: String(error),
      },
      { status: 500 },
    )
  }
}
