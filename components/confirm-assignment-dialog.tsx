"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"

interface ConfirmAssignmentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  assignmentData: {
    type: string
    location: string
    start_date?: string
    due_date: string
    completion_date?: string
    team_lead: string
    members: string[]
  }
  onConfirm: () => void
  isSubmitting: boolean
}

export function ConfirmAssignmentDialog({
  open,
  onOpenChange,
  assignmentData,
  onConfirm,
  isSubmitting,
}: ConfirmAssignmentDialogProps) {
  const formatDate = (date: string) => {
    try {
      return format(new Date(date), "dd/MM/yyyy HH:mm")
    } catch {
      return "N/A"
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Confirm Assignment Details</DialogTitle>
          <DialogDescription>Please review the assignment details before creating.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="font-medium">Type:</div>
            <div>{assignmentData.type}</div>

            <div className="font-medium">Location:</div>
            <div>{assignmentData.location}</div>

            <div className="font-medium">Start Date:</div>
            <div>{assignmentData.start_date ? formatDate(assignmentData.start_date) : "N/A"}</div>

            <div className="font-medium">Due Date:</div>
            <div>{formatDate(assignmentData.due_date)}</div>

            <div className="font-medium">Completion Date:</div>
            <div>{assignmentData.completion_date ? formatDate(assignmentData.completion_date) : "N/A"}</div>

            <div className="font-medium">Team Lead:</div>
            <div>{assignmentData.team_lead}</div>

            <div className="font-medium">Team Members:</div>
            <div>{assignmentData.members.filter((m) => m !== "None").join(", ") || "No members"}</div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Back to Edit
          </Button>
          <Button onClick={onConfirm} disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Confirm & Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

