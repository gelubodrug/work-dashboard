"use server"

import { sql } from "@vercel/postgres"

export type Car = {
  car_plate: string
}

// Get all distinct car plates from assignments and vehicle_presence
export async function getAvailableCars(): Promise<Car[]> {
  try {
    const { rows } = await sql<Car>`
      SELECT DISTINCT car_plate
      FROM (
        SELECT car_plate FROM assignments WHERE car_plate IS NOT NULL AND car_plate != ''
        UNION
        SELECT car_plate FROM vehicle_presence WHERE car_plate IS NOT NULL AND car_plate != ''
      ) AS all_cars
      ORDER BY car_plate ASC
    `
    return rows
  } catch (error) {
    console.error("Error fetching available cars:", error)
    return []
  }
}
