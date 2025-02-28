"use client"

import { Plus } from "lucide-react"
import { useState, useEffect, useCallback } from "react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { AssignmentCard } from "@/components/assignment-card"
import { NewAssignmentDialog } from "@/components/new-assignment-dialog"
import { useUsers } from "@/hooks/use-users"
import { fetchAssignments, updateAssignments, deleteAssignment } from "@/app/actions"
import type { Assignment } from "@/lib/db"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface Assignments {
  deschidere: Assignment[]
  interventie: Assignment[]
  optimizare: Assignment[]
}

export default function DeplasariPage() {
  const [open, setOpen] = useState(false)
  const [assignments, setAssignmentsState] = useState<Assignments>({
    deschidere: [],
    interventie: [],
    optimizare: [],
  })
  const [error, setError] = useState<string | null>(null)
  const { error: userError } = useUsers()
  const [typeFilter, setTypeFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isInitialLoad, setIsInitialLoad] = useState(true)

  useEffect(() => {
    async function loadAssignments() {
      try {
        const fetchedAssignments = await fetchAssignments()

        // Create a Map to track unique assignments by ID
        const uniqueAssignments = new Map<number, Assignment>()
        fetchedAssignments.forEach((assignment) => {
          uniqueAssignments.set(assignment.id, assignment)
        })

        // Group unique assignments by type
        const groupedAssignments: Assignments = {
          deschidere: [],
          interventie: [],
          optimizare: [],
        }

        Array.from(uniqueAssignments.values()).forEach((assignment) => {
          const type = assignment.type?.toLowerCase() as keyof Assignments
          if (type && type in groupedAssignments) {
            groupedAssignments[type].push(assignment)
          }
        })

        console.log("Grouped assignments:", groupedAssignments)
        setAssignmentsState(groupedAssignments)
        setIsInitialLoad(false)
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred while fetching assignments")
      }
    }
    loadAssignments()
  }, [])

  const handleUpdate = async (updatedAssignment: Assignment) => {
    try {
      console.log("Assignment being passed to edit dialog:", updatedAssignment)
      console.log("Due date value:", updatedAssignment.due_date)
      const newAssignments = {
        ...assignments,
        [updatedAssignment.type.toLowerCase()]: assignments[
          updatedAssignment.type.toLowerCase() as keyof Assignments
        ].map((assignment) => (assignment.id === updatedAssignment.id ? updatedAssignment : assignment)),
      }
      setAssignmentsState(newAssignments)
      await updateAssignments([updatedAssignment])
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred while updating the assignment")
    }
  }

  const handleDelete = async (id: number) => {
    try {
      const newAssignments = {
        deschidere: assignments.deschidere.filter((a) => a.id !== id),
        interventie: assignments.interventie.filter((a) => a.id !== id),
        optimizare: assignments.optimizare.filter((a) => a.id !== id),
      }
      setAssignmentsState(newAssignments)
      await deleteAssignment(id)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred while deleting the assignment")
    }
  }

  const handleCreate = useCallback(
    async (newAssignment: Assignment) => {
      try {
        // Check if assignment already exists in state
        const existingAssignment = Object.values(assignments)
          .flat()
          .find((a) => a.id === newAssignment.id)

        if (!existingAssignment) {
          const type = newAssignment.type.toLowerCase() as keyof Assignments
          setAssignmentsState((prev) => ({
            ...prev,
            [type]: [...prev[type], newAssignment],
          }))
          console.log("Assignment added to state:", newAssignment)
        } else {
          console.log("Assignment already exists in state, not adding:", newAssignment)
        }

        setOpen(false)
      } catch (err) {
        console.error("Error creating assignment:", err)
        setError(err instanceof Error ? err.message : "An error occurred while creating the assignment")
      }
    },
    [assignments],
  )

  const filteredAssignments = Object.values(assignments)
    .flat()
    .filter((assignment) => {
      const matchesType = typeFilter === "all" || assignment.type.toLowerCase() === typeFilter
      const matchesStatus = statusFilter === "all" || assignment.status === statusFilter
      return matchesType && matchesStatus
    })

  if (error || userError) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error || userError}</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Deplasari</h1>
        <Button onClick={() => setOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add New
        </Button>
      </div>

      <div className="space-y-4">
        <Tabs defaultValue="all" className="w-full" onValueChange={setTypeFilter}>
          <TabsList className="w-full justify-start">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="deschidere">Deschidere</TabsTrigger>
            <TabsTrigger value="interventie">Interventie</TabsTrigger>
            <TabsTrigger value="optimizare">Optimizare</TabsTrigger>
          </TabsList>
        </Tabs>

        <Tabs defaultValue="all" className="w-full" onValueChange={setStatusFilter}>
          <TabsList className="w-full justify-start">
            <TabsTrigger value="all">All Status</TabsTrigger>
            <TabsTrigger value="Asigned">Asigned</TabsTrigger>
            <TabsTrigger value="In Deplasare">In Deplasare</TabsTrigger>
            <TabsTrigger value="Finalizat">Finalizat</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="grid gap-4">
          {filteredAssignments.map((assignment) => (
            <AssignmentCard
              key={assignment.id}
              assignment={assignment}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
            />
          ))}
          {filteredAssignments.length === 0 && (
            <div className="text-center text-muted-foreground">No assignments found</div>
          )}
        </div>
      </div>

      <NewAssignmentDialog open={open} onOpenChange={setOpen} onCreate={handleCreate} />
    </div>
  )
}

