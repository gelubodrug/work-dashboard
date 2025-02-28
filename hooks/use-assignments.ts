"use client"

import { useState, useEffect } from "react"
import type { Assignment } from "@/types/assignment"
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

export function useAssignments() {
  const [assignments, setAssignments] = useState<Assignment[]>([])

  useEffect(() => {
    async function fetchAssignments() {
      try {
        const response = await fetch("/api/assignments")
        const data = await response.json()

        // Validate the data using Zod
        const validatedData = AssignmentsArraySchema.parse(data)
        setAssignments(validatedData)
      } catch (error) {
        console.error("Error fetching assignments:", error)
        // Handle the error appropriately (e.g., show an error message to the user)
      }
    }

    fetchAssignments()
  }, [])

  const addAssignment = async (newAssignment: Omit<Assignment, "id">) => {
    try {
      const response = await fetch("/api/assignments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify([...assignments, { ...newAssignment, id: Date.now() }]),
      })

      if (!response.ok) {
        throw new Error("Failed to add assignment")
      }

      const updatedAssignments = await response.json()
      const validatedAssignments = AssignmentsArraySchema.parse(updatedAssignments)
      setAssignments(validatedAssignments)
    } catch (error) {
      console.error("Error adding assignment:", error)
      // Handle the error appropriately
    }
  }

  const updateAssignment = async (updatedAssignment: Assignment) => {
    try {
      const updatedAssignments = assignments.map((assignment) =>
        assignment.id === updatedAssignment.id ? updatedAssignment : assignment,
      )

      const response = await fetch("/api/assignments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedAssignments),
      })

      if (!response.ok) {
        throw new Error("Failed to update assignment")
      }

      const validatedAssignments = AssignmentsArraySchema.parse(updatedAssignments)
      setAssignments(validatedAssignments)
    } catch (error) {
      console.error("Error updating assignment:", error)
      // Handle the error appropriately
    }
  }

  const deleteAssignment = async (id: number) => {
    try {
      const updatedAssignments = assignments.filter((assignment) => assignment.id !== id)

      const response = await fetch("/api/assignments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedAssignments),
      })

      if (!response.ok) {
        throw new Error("Failed to delete assignment")
      }

      const validatedAssignments = AssignmentsArraySchema.parse(updatedAssignments)
      setAssignments(validatedAssignments)
    } catch (error) {
      console.error("Error deleting assignment:", error)
      // Handle the error appropriately
    }
  }

  return { assignments, addAssignment, updateAssignment, deleteAssignment }
}

