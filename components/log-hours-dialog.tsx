"use client"

import type React from "react"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createWorkLog } from "@/lib/db/operations"

interface LogHoursDialogProps {
  userId: number
  assignments: { id: number; name: string }[]
  onLogCreated: () => void
}

export function LogHoursDialog({ userId, assignments, onLogCreated }: LogHoursDialogProps) {
  const [open, setOpen] = useState(false)
  const [assignmentId, setAssignmentId] = useState<number | null>(null)
  const [hours, setHours] = useState("")
  const [description, setDescription] = useState("")
  const [workDate, setWorkDate] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (assignmentId && hours && workDate) {
      try {
        await createWorkLog({
          user_id: userId,
          assignment_id: assignmentId,
          work_date: workDate,
          hours: Number.parseFloat(hours),
          description: description || null,
        })
        onLogCreated()
        setOpen(false)
        // Reset form
        setAssignmentId(null)
        setHours("")
        setDescription("")
        setWorkDate("")
      } catch (error) {
        console.error("Error logging hours:", error)
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Log Hours</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Log Work Hours</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select onValueChange={(value) => setAssignmentId(Number.parseInt(value))} required>
            <SelectTrigger>
              <SelectValue placeholder="Select Assignment" />
            </SelectTrigger>
            <SelectContent>
              {assignments.map((assignment) => (
                <SelectItem key={assignment.id} value={assignment.id.toString()}>
                  {assignment.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input type="date" value={workDate} onChange={(e) => setWorkDate(e.target.value)} required />
          <Input
            type="number"
            placeholder="Hours"
            value={hours}
            onChange={(e) => setHours(e.target.value)}
            required
            min="0"
            step="0.5"
          />
          <Input
            type="text"
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <Button type="submit">Log Hours</Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

