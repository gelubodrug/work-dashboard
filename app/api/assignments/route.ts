import { NextResponse } from "next/server"
import { getAssignments, setAssignments } from "@/lib/db/operations"
import { z } from "zod"

const AssignmentSchema = z.object({
  id: z.number(),
  type: z.string().nullable(),
  start_date: z.string().nullable(),
  due_date: z.string().nullable(),
  completion_date: z.string().nullable(),
  location: z.string().nullable(),
  team_lead: z.string().nullable(),
  members: z.array(z.string()),
  status: z.string().nullable(),
  hours: z.number().nullable(),
})

const AssignmentsArraySchema = z.array(AssignmentSchema)

export async function GET() {
  try {
    const assignments = await getAssignments()
    const validatedAssignments = AssignmentsArraySchema.parse(assignments)
    return NextResponse.json(validatedAssignments)
  } catch (error) {
    console.error("Error fetching assignments:", error)
    return NextResponse.json({ error: "Failed to fetch assignments" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const assignments = await request.json()
    const validatedAssignments = AssignmentsArraySchema.parse(assignments)
    await setAssignments(validatedAssignments)
    return NextResponse.json(validatedAssignments)
  } catch (error) {
    console.error("Error setting assignments:", error)
    return NextResponse.json({ error: "Failed to set assignments" }, { status: 500 })
  }
}

