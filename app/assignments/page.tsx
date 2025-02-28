"use client"

import { useState } from "react"
import { useAssignments } from "@/hooks/use-assignments"
import { AssignmentCard } from "@/components/assignment-card"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { NewAssignmentDialog } from "@/components/new-assignment-dialog"
import type { Assignment } from "@/types/assignment"

export default function AssignmentsPage() {
  const { assignments, addAssignment, updateAssignment, deleteAssignment } = useAssignments()
  const [isNewAssignmentDialogOpen, setIsNewAssignmentDialogOpen] = useState(false)

  const handleCreateAssignment = (newAssignment: Omit<Assignment, "id" | "status">) => {
    addAssignment({
      ...newAssignment,
      id: Date.now(), // This is a temporary ID. In a real app, this would be handled by the backend.
      status: "Asignat",
    } as Assignment)
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Assignments</h1>
        <Button onClick={() => setIsNewAssignmentDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> New Deplasare
        </Button>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {assignments.map((assignment) => (
          <AssignmentCard
            key={assignment.id}
            assignment={assignment}
            onUpdate={updateAssignment}
            onDelete={deleteAssignment}
          />
        ))}
      </div>
      <NewAssignmentDialog
        open={isNewAssignmentDialogOpen}
        onOpenChange={setIsNewAssignmentDialogOpen}
        onCreate={handleCreateAssignment}
      />
    </div>
  )
}

