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

interface ConfirmFinalizatDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  teamLead: string
  members: string[]
  onConfirm: () => void
  isSubmitting: boolean
}

export function ConfirmFinalizatDialog({
  open,
  onOpenChange,
  teamLead,
  members,
  onConfirm,
  isSubmitting,
}: ConfirmFinalizatDialogProps) {
  const allMembers = [teamLead, ...members.filter((member) => member !== "None")]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm Status Update</DialogTitle>
          <DialogDescription>
            Setting a completion date will mark this assignment as &quot;Finalizat&quot; and update the following team
            members&apos; status to &quot;Liber&quot;:
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <ul className="list-disc pl-4 space-y-1">
            {allMembers.map((member) => (
              <li key={member} className="text-sm">
                {member}
              </li>
            ))}
          </ul>
        </div>
        <DialogFooter>
          <Button onClick={onConfirm} disabled={isSubmitting}>
            {isSubmitting ? "Se finalizează..." : "Confirmă"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

