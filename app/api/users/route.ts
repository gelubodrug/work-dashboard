import { NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET() {
  try {
    const result = await query(
      `
      SELECT 
        u.id,
        u.name,
        u.email,
        u.role,
        u.status,
        u.total_hours,
        u.current_assignment,
        COALESCE(
          (SELECT SUM(hours) 
           FROM work_logs 
           WHERE user_id = u.id 
             AND DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE)
          ), 0
        ) as current_month_hours,
        CASE 
          WHEN u.status = 'Liber' THEN 
            (SELECT completion_date 
             FROM assignments 
             WHERE team_lead = u.name 
                OR members::text LIKE '%' || u.name || '%' 
             ORDER BY completion_date DESC 
             LIMIT 1)
          ELSE NULL 
        END as last_completion_date,
        CASE 
          WHEN u.status = 'In Deplasare' THEN 
            (SELECT start_date 
             FROM assignments 
             WHERE (team_lead = u.name OR members::text LIKE '%' || u.name || '%')
               AND status != 'Finalizat' 
             LIMIT 1)
          ELSE NULL 
        END as current_start_date
      FROM users u
      ORDER BY u.name
      `,
    )

    return NextResponse.json(result.rows)
  } catch (error) {
    console.error("Error fetching users from database:", error)
    return NextResponse.json([])
  }
}
