"use client"
import { Edit, Trash2, Users, Clock, MapPin, Calendar } from "lucide-react"
import { useState } from "react"
import { format, isValid, parseISO, differenceInHours, formatDistanceToNow, isToday, isTomorrow } from "date-fns"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { EditAssignmentDialog } from "./edit-assignment-dialog"
import { ConfirmDeleteDialog } from "./confirm-delete-dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface Assignment {
  id: number
  type: string
  start_date: string
  due_date: string
  location: string
  team_lead: string
  completion_date?: string
  members?: string[]
  status: string
  hours?: number
}

interface AssignmentCardProps {
  assignment: Assignment
  onUpdate: (updatedAssignment: Assignment) => void
  onDelete: (id: number) => void
}

export function AssignmentCard({ assignment, onUpdate, onDelete }: AssignmentCardProps) {
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)

  const getStatusColor = (status: string, variant: "solid" | "outline" = "solid") => {
    const colors = {
      Finalizat: variant === "solid" ? "bg-green-100 text-green-800" : "border-green-800 text-green-800",
      "In Deplasare": variant === "solid" ? "bg-blue-100 text-blue-800" : "border-blue-800 text-blue-800",
      Asigned: variant === "solid" ? "bg-yellow-100 text-yellow-800" : "border-yellow-800 text-yellow-800",
    }
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800"
  }

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "N/A"
    const date = parseISO(dateString)
    return isValid(date) ? format(date, "MMM dd, yyyy") : "Invalid Date"
  }

  const formatTime = (dateString: string | undefined) => {
    if (!dateString) return "N/A"
    const date = parseISO(dateString)
    return isValid(date) ? format(date, "HH:mm") : "Invalid Date"
  }

  const calculateWorkingHours = (assignment: Assignment) => {
    if (assignment.status === "Asigned" || !assignment.start_date) {
      return null
    }

    const startDate = parseISO(assignment.start_date)
    const endDate =
      assignment.status === "Finalizat" && assignment.completion_date
        ? parseISO(assignment.completion_date)
        : new Date()

    if (!isValid(startDate) || !isValid(endDate)) {
      console.error("Invalid date encountered")
      return null
    }

    return differenceInHours(endDate, startDate)
  }

  const workingHours = calculateWorkingHours(assignment)

  const handleDelete = () => {
    if (assignment.status === "Asigned") {
      setConfirmDialogOpen(true)
    } else {
      setDeleteDialogOpen(true)
    }
  }

  const getRelativeTime = (dateString: string | undefined): string => {
    if (!dateString) return "N/A"
    const date = parseISO(dateString)

    if (!isValid(date)) {
      return "Invalid Date"
    }

    if (isToday(date)) {
      return `Today at ${format(date, "HH:mm")}`
    } else if (isTomorrow(date)) {
      return `Tomorrow at ${format(date, "HH:mm")}`
    } else {
      return formatDistanceToNow(date, { addSuffix: true })
    }
  }

  return (
    <>
      <Card className="overflow-hidden">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <CardTitle className="text-lg">
              {assignment.type}{" "}
              <span className="text-sm font-normal">- termen: {getRelativeTime(assignment.due_date)}</span>
            </CardTitle>
            <div className="flex flex-col items-end space-y-1">
              <Badge className={getStatusColor(assignment.status, "solid")}>{assignment.status}</Badge>
              {workingHours !== null && (
                <Badge variant="outline" className={getStatusColor(assignment.status, "outline")}>
                  <Clock className="h-3 w-3 mr-1" />
                  {workingHours} hour{workingHours !== 1 ? "s" : ""}
                </Badge>
              )}
            </div>
          </div>
          <div className="space-y-1 text-sm">
            <div className="flex items-center text-muted-foreground">
              <Calendar className="h-3 w-3 mr-1" />
              {formatDate(assignment.start_date)} - {formatDate(assignment.completion_date)}
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              <Clock className="h-3 w-3 mr-1" />
              {formatTime(assignment.start_date)} -
              {assignment.status === "In Deplasare" ? (
                <span className="ml-1">
                  <Badge variant="outline" className={getStatusColor(assignment.status, "outline")}>
                    (ongoing)
                  </Badge>
                </span>
              ) : (
                formatTime(assignment.completion_date)
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="pb-2">
          <div className="space-y-2 text-sm">
            {assignment.location && (
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <div className="text-muted-foreground">{assignment.location}</div>
              </div>
            )}
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <div className="text-muted-foreground">
                <span className="font-medium text-foreground">{assignment.team_lead}</span>
                {assignment.members && assignment.members.length > 0 && (
                  <span className="ml-1 text-xs text-muted-foreground">- {assignment.members.join(", ")}</span>
                )}
              </div>
            </div>
          </div>
        </CardContent>
        <div className="flex justify-end px-4 py-2 bg-muted/50">
          <Button variant="ghost" size="icon" onClick={() => setEditDialogOpen(true)} className="h-8 w-8">
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDelete}
            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </Card>

      <EditAssignmentDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        assignment={{ ...assignment, id: assignment.id }}
        onSave={onUpdate}
      />

      {assignment.status === "Asigned" ? (
        <AlertDialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the assignment.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  onDelete(assignment.id)
                  setConfirmDialogOpen(false)
                }}
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      ) : (
        <ConfirmDeleteDialog
          isOpen={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
          onConfirm={() => onDelete(assignment.id)}
          itemType="assignment"
        />
      )}
    </>
  )
}

