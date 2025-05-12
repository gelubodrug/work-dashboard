import { NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET() {
  try {
    // Get detailed information about all indexes on vehicle_presence
    const indexDetails = await query(
      `SELECT 
        i.relname as index_name,
        a.attname as column_name,
        idx.indisunique as is_unique,
        am.amname as index_type,
        pg_size_pretty(pg_relation_size(i.oid)) as index_size
      FROM 
        pg_index idx
        JOIN pg_class i ON i.oid = idx.indexrelid
        JOIN pg_class t ON t.oid = idx.indrelid
        JOIN pg_am am ON i.relam = am.oid
        JOIN pg_attribute a ON a.attrelid = t.oid AND a.attnum = ANY(idx.indkey)
      WHERE 
        t.relname = 'vehicle_presence'
      ORDER BY 
        i.relname, a.attnum`,
      [],
    )

    // Get query execution plans to see if indexes are being used
    const queryPlans = await query(
      `EXPLAIN (ANALYZE false, VERBOSE true, FORMAT JSON)
       SELECT * FROM vehicle_presence 
       WHERE car_plate = 'IF 65 XOX' AND detected_at > '2025-04-01'`,
      [],
    )

    // Get another query plan for a different type of query
    const nearChitilaQueryPlan = await query(
      `EXPLAIN (ANALYZE false, VERBOSE true, FORMAT JSON)
       SELECT * FROM vehicle_presence 
       WHERE car_plate = 'IF 65 XOX' AND was_near_chitila = true 
       ORDER BY detected_at DESC LIMIT 1`,
      [],
    )

    return NextResponse.json({
      success: true,
      indexDetails: indexDetails.rows,
      sampleQueryPlan: queryPlans.rows[0]["QUERY PLAN"],
      nearChitilaQueryPlan: nearChitilaQueryPlan.rows[0]["QUERY PLAN"],
    })
  } catch (error) {
    console.error("Error listing indexes:", error)
    return NextResponse.json(
      {
        success: false,
        error: String(error),
      },
      { status: 500 },
    )
  }
}
