"\"use server"

import { format, startOfMonth, endOfMonth } from "date-fns"
import { query } from "@/lib/db"

export async function getTopWorkersByHours(limit = 5, startDate?: Date, endDate?: Date) {
  try {
    const start = startDate || startOfMonth(new Date())
    const end = endDate || endOfMonth(new Date())
    const startFormatted = format(start, "yyyy-MM-dd")
    const endFormatted = format(end, "yyyy-MM-dd")

    const result = await query(
      `
      SELECT 
        u.id,
        u.name,
        u.profile_photo,
        COALESCE(SUM(a.hours), 0) as total_hours,
        COUNT(DISTINCT a.id) as assignment_count,
        COUNT(DISTINCT a.store_number) as store_count,
        jsonb_agg(
          jsonb_build_object(
            'id', a.id,
            'type', a.type,
            'hours', a.hours,
            'store_number', a.store_number
          )
        ) FILTER (WHERE a.id IS NOT NULL) as assignments
      FROM users u
      LEFT JOIN 
        assignments a ON (
          (a.team_lead = u.name OR 
          (a.members::jsonb @> to_jsonb(u.name::text) OR 
           a.members::text LIKE '%' || u.name || '%'))
          AND a.start_date >= $1 AND a.start_date <= $2
          AND a.status = 'Finalizat'
        )
      GROUP BY u.id, u.name, u.profile_photo
      ORDER BY total_hours DESC
      ${limit > 0 ? "LIMIT $3" : ""}
    `,
      limit > 0 ? [startFormatted, endFormatted, limit] : [startFormatted, endFormatted],
    )

    return result.rows
  } catch (error) {
    console.error("Error fetching top workers by hours:", error)
    return []
  }
}

export async function getWorkDistributionByType(startDate?: Date, endDate?: Date) {
  try {
    const start = startDate || startOfMonth(new Date())
    const end = endDate || endOfMonth(new Date())
    const startFormatted = format(start, "yyyy-MM-dd")
    const endFormatted = format(end, "yyyy-MM-dd")

    const result = await query(
      `
      SELECT 
        type,
        COALESCE(SUM(hours), 0) as total_hours,
        COUNT(DISTINCT id) as assignment_count,
        COUNT(DISTINCT store_number) as store_count,
        array_agg(DISTINCT store_number) as unique_store_ids
      FROM assignments
      WHERE start_date >= $1 AND start_date <= $2
      GROUP BY type
      ORDER BY total_hours DESC
    `,
      [startFormatted, endFormatted],
    )

    return result.rows
  } catch (error) {
    console.error("Error fetching work distribution by type:", error)
    return []
  }
}

export async function getTopRidersByKilometers(limit = 5, startDate?: Date, endDate?: Date) {
  try {
    const start = startDate || startOfMonth(new Date())
    const end = endDate || endOfMonth(new Date())
    const startFormatted = format(start, "yyyy-MM-dd")
    const endFormatted = format(end, "yyyy-MM-dd")

    const result = await query(
      `
      WITH user_kilometers AS (
        SELECT 
          u.id,
          u.name,
          u.profile_photo,
          COALESCE(SUM(a.km), 0) as total_kilometers,
          COUNT(DISTINCT a.id) as assignment_count,
          COUNT(DISTINCT a.store_number) as store_count,
          jsonb_agg(
            jsonb_build_object(
              'id', a.id,
              'type', a.type,
              'km', a.km,
              'store_number', a.store_number
            )
          ) FILTER (WHERE a.id IS NOT NULL) as assignments
        FROM users u
        LEFT JOIN 
        assignments a ON (
          (a.team_lead = u.name OR 
          (a.members::jsonb @> to_jsonb(u.name::text) OR 
           a.members::text LIKE '%' || u.name || '%'))
          AND a.start_date >= $1 AND a.start_date <= $2
          AND a.status = 'Finalizat'
        )
        GROUP BY u.id, u.name, u.profile_photo
      )
      SELECT 
        id,
        name,
        profile_photo,
        total_kilometers,
        assignment_count,
        store_count,
        assignments
      FROM user_kilometers
      WHERE total_kilometers > 0
      ORDER BY total_kilometers DESC
      ${limit > 0 ? "LIMIT $3" : ""}
    `,
      limit > 0 ? [startFormatted, endFormatted, limit] : [startFormatted, endFormatted],
    )

    return result.rows
  } catch (error) {
    console.error("Error fetching top riders by kilometers:", error)
    return []
  }
}

export async function getTotalHoursInDateRange(startDate?: Date, endDate?: Date): Promise<number> {
  try {
    const start = startDate || startOfMonth(new Date())
    const end = endDate || endOfMonth(new Date())
    const startFormatted = format(start, "yyyy-MM-dd")
    const endFormatted = format(end, "yyyy-MM-dd")

    const result = await query(
      `
      SELECT COALESCE(SUM(hours), 0) as total_hours
      FROM assignments
      WHERE start_date >= $1 AND start_date <= $2
    `,
      [startFormatted, endFormatted],
    )

    return result.rows[0]?.total_hours || 0
  } catch (error) {
    console.error("Error fetching total hours in date range:", error)
    return 0
  }
}

export async function getTotalKilometersInDateRange(startDate?: Date, endDate?: Date): Promise<number> {
  try {
    const start = startDate || startOfMonth(new Date())
    const end = endDate || endOfMonth(new Date())
    const startFormatted = format(start, "yyyy-MM-dd")
    const endFormatted = format(end, "yyyy-MM-dd")

    const result = await query(
      `
      SELECT COALESCE(SUM(km), 0) as total_kilometers
      FROM assignments
      WHERE start_date >= $1 AND start_date <= $2
    `,
      [startFormatted, endFormatted],
    )

    return result.rows[0]?.total_kilometers || 0
  } catch (error) {
    console.error("Error fetching total kilometers in date range:", error)
    return 0
  }
}

export async function exportWorkLogs(startDate?: Date, endDate?: Date): Promise<string> {
  try {
    const start = startDate || startOfMonth(new Date())
    const end = endDate || endOfMonth(new Date())
    const startFormatted = format(start, "yyyy-MM-dd")
    const endFormatted = format(end, "yyyy-MM-dd")

    const result = await query(
      `
      SELECT 
        a.id,
        a.type,
        a.location,
        a.team_lead,
        a.members,
        a.start_date,
        a.due_date,
        a.completion_date,
        a.status,
        a.hours,
        a.store_number,
        a.county,
        a.city,
        a.magazin,
        a.county_code
      FROM assignments a
      WHERE a.start_date >= $1 AND a.start_date <= $2
    `,
      [startFormatted, endFormatted],
    )

    // CSV Header
    const header =
      "ID,Type,Location,Team Lead,Members,Start Date,Due Date,Completion Date,Status,Hours,Store Number,County,City,Magazin,County Code\n"

    // CSV Rows
    const csvRows = result.rows.map((row) => {
      return [
        row.id,
        row.type,
        row.location,
        row.team_lead,
        row.members,
        row.start_date,
        row.due_date,
        row.completion_date,
        row.status,
        row.hours,
        row.store_number,
        row.county,
        row.city,
        row.magazin,
        row.county_code,
      ].join(",")
    })

    return header + csvRows.join("\n")
  } catch (error) {
    console.error("Error exporting work logs:", error)
    return ""
  }
}

export async function getAssignmentsByTypeAndDateRange(type: string, startDate?: Date, endDate?: Date) {
  try {
    const start = startDate || startOfMonth(new Date())
    const end = endDate || endOfMonth(new Date())
    const startFormatted = format(start, "yyyy-MM-dd")
    const endFormatted = format(end, "yyyy-MM-dd")

    const result = await query(
      `
      SELECT *
      FROM assignments
      WHERE type = $1 AND start_date >= $2 AND start_date <= $3
    `,
      [type, startFormatted, endFormatted],
    )

    return result.rows
  } catch (error) {
    console.error("Error fetching assignments by type and date range:", error)
    return []
  }
}

export async function getTopWorkersByKilometers(limit = 5, startDate?: Date, endDate?: Date) {
  try {
    const start = startDate || startOfMonth(new Date())
    const end = endDate || endOfMonth(new Date())
    const startFormatted = format(start, "yyyy-MM-dd")
    const endFormatted = format(end, "yyyy-MM-dd")

    const result = await query(
      `
      SELECT 
        u.id,
        u.name,
        u.profile_photo,
        COALESCE(SUM(a.km), 0) as total_kilometers,
        COUNT(DISTINCT a.id) as assignment_count,
        COUNT(DISTINCT a.store_number) as store_count,
        jsonb_agg(
          jsonb_build_object(
            'id', a.id,
            'type', a.type,
            'km', a.km,
            'store_number', a.store_number
          )
        ) FILTER (WHERE a.id IS NOT NULL) as assignments
      FROM users u
      LEFT JOIN 
        assignments a ON (
          (a.team_lead = u.name OR 
          (a.members::jsonb @> to_jsonb(u.name::text) OR 
           a.members::text LIKE '%' || u.name || '%'))
          AND a.start_date >= $1 AND a.start_date <= $2
          AND a.status = 'Finalizat'
        )
      GROUP BY u.id, u.name, u.profile_photo
      ORDER BY total_kilometers DESC
      ${limit > 0 ? "LIMIT $3" : ""}
    `,
      limit > 0 ? [startFormatted, endFormatted, limit] : [startFormatted, endFormatted],
    )

    return result.rows
  } catch (error) {
    console.error("Error fetching top workers by kilometers:", error)
    return []
  }
}

export async function getUserWorkLogs(userId: number) {
  try {
    const result = await query(
      `
      SELECT 
        wl.id,
        wl.work_date,
        a.type,
        a.location,
        a.store_number,
        a.county,
        a.city,
        wl.hours,
        a.km,
        a.status,
        a.team_lead,
        a.store_points,
        u.name as user_name
      FROM work_logs wl
      JOIN assignments a ON wl.assignment_id = a.id
      JOIN users u ON wl.user_id = u.id
      WHERE wl.user_id = $1
      ORDER BY wl.work_date DESC
    `,
      [userId],
    )

    return result.rows
  } catch (error) {
    console.error("Error fetching user work logs:", error)
    return []
  }
}

export async function getTopWorkerById(userId: string) {
  try {
    // Validate userId
    if (!userId || isNaN(Number(userId))) {
      throw new Error(`Invalid userId: ${userId}`)
    }

    const result = await query(
      `
      SELECT 
        u.id,
        u.name,
        u.profile_photo,
        COALESCE(SUM(a.hours), 0) as total_hours,
        COALESCE(SUM(a.km), 0) as total_kilometers,
        COUNT(DISTINCT a.id) as assignment_count,
        COUNT(DISTINCT a.store_number) as store_count,
        jsonb_agg(
          jsonb_build_object(
            'id', a.id,
            'type', a.type,
            'hours', a.hours,
            'km', a.km,
            'store_number', a.store_number,
            'start_date', a.start_date,
            'completion_date', a.completion_date,
            'location', a.location
          )
        ) FILTER (WHERE a.id IS NOT NULL) as assignments
      FROM users u
      LEFT JOIN 
        assignments a ON (
          (a.team_lead = u.name OR 
          (a.members::jsonb @> to_jsonb(u.name::text) OR 
           a.members::text LIKE '%' || u.name || '%'))
        )
      WHERE u.id = $1
      GROUP BY u.id, u.name, u.profile_photo
    `,
      [userId],
    )

    if (!result || result.rows.length === 0) {
      return null
    }

    return result.rows[0]
  } catch (error) {
    console.error("Error fetching top worker by ID:", error)
    return null
  }
}
