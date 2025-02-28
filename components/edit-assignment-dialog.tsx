"use client"

import { DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import * as z from "zod"
import { useEffect, useState } from "react"
import { updateAssignment } from "@/app/actions"
import { useToast } from "@/components/ui/use-toast"
import { useUsers } from "@/hooks/use-users"
import { ConfirmFinalizatDialog } from "./confirm-finalizat-dialog"
import { Badge } from "@/components/ui/badge"
import { Play, Square } from "lucide-react"
import { format } from "date-fns"

const formSchema = z.object({
  members: z.array(z.string()),
})

type FormValues = z.infer<typeof formSchema>

interface Assignment {
  id: string
  type: string
  location: string
  due_date: string
  team_lead: string
  members: string[]
  start_date?: string
  completion_date?: string
  status: string
}

interface EditAssignmentDialogProps {
  assignment: Assignment
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (updatedAssignment: Assignment) => void
}

export function EditAssignmentDialog({ assignment, open, onOpenChange, onSave }: EditAssignmentDialogProps) {
  const { toast } = useToast()
  const { getAvailableUsersForEdit } = useUsers()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false)
  const [memberValues, setMemberValues] = useState<string[]>([])

  const availableUsers = getAvailableUsersForEdit(assignment)

  useEffect(() => {
    if (open) {
      const initialMembers = [...(assignment.members || []), "Niciunul", "Niciunul", "Niciunul", "Niciunul"].slice(0, 4)
      setMemberValues(initialMembers)
    }
  }, [open, assignment])

  const handleStart = async () => {
    setIsSubmitting(true)
    try {
      const now = new Date()
      const updatedAssignment = {
        ...assignment,
        start_date: now.toISOString(),
        status: "In Deplasare",
        members: memberValues.filter((member) => member !== "Niciunul"),
      }
      const result = await updateAssignment(updatedAssignment)
      onSave(result)
      toast({
        title: "Succes",
        description: "Deplasarea a început.",
      })
      onOpenChange(false)
    } catch (error) {
      console.error("Error starting assignment:", error)
      toast({
        title: "Eroare",
        description: "A apărut o eroare la începerea deplasării.",
        variant: "destructive",
      })
    }
    setIsSubmitting(false)
  }

  const handleFinish = async () => {
    setIsConfirmDialogOpen(true)
  }

  const formatDate = (date: string) => {
    try {
      return format(new Date(date), "dd.MM.yyyy, HH:mm")
    } catch {
      return "N/A"
    }
  }

  const getStatusBadge = () => {
    switch (assignment.status) {
      case "Asigned":
        return <Badge className="bg-yellow-100 text-yellow-800">Asigned</Badge>
      case "In Deplasare":
        return <Badge className="bg-blue-100 text-blue-800">In Deplasare</Badge>
      case "Finalizat":
        return <Badge className="bg-green-100 text-green-800">Finalizat</Badge>
      default:
        return null
    }
  }

  const handleMemberChange = (value: string, index: number) => {
    const newMembers = [...memberValues]
    newMembers[index] = value
    setMemberValues(newMembers)
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle>Editare Deplasare</DialogTitle>
              {getStatusBadge()}
            </div>
            <DialogDescription>Actualizați detaliile deplasării sau adăugați informații noi.</DialogDescription>
          </DialogHeader>

          {/* Assignment Details Section - Read Only */}
          <div className="space-y-2 mb-6">
            <h3 className="text-sm font-medium text-muted-foreground">Detalii Deplasare</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <Label className="text-xs text-muted-foreground">Deplasare (la)</Label>
                <div className="font-medium">{assignment.type}</div>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Locațiile</Label>
                <div className="font-medium">{assignment.location}</div>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">De terminat la data</Label>
                <div className="font-medium">{formatDate(assignment.due_date)}</div>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Șef Echipă</Label>
                <div className="font-medium">{assignment.team_lead}</div>
              </div>
            </div>
          </div>

          {assignment.status === "Asigned" && (
            <div className="space-y-4 mb-6">
              <h2 className="text-lg font-semibold">Pas 1: Adaugă membrii pentru deplasarea curentă</h2>
              <div className="grid grid-cols-2 gap-4">
                {[0, 1, 2, 3].map((index) => (
                  <div key={index} className="space-y-1">
                    <Label className="text-xs">Membru {index + 1}</Label>
                    <Select value={memberValues[index]} onValueChange={(value) => handleMemberChange(value, index)}>
                      <SelectTrigger className="h-8 text-sm">
                        <SelectValue placeholder="Selectați un membru" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Niciunul">Niciunul</SelectItem>
                        {availableUsers.map((user) => (
                          <SelectItem key={user.id} value={user.name}>
                            {user.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Start Assignment */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">
              {assignment.status === "Asigned" ? "Pas 2: Începe Deplasarea" : "Pas 2: Finalizează Deplasarea"}
            </h2>
            <div className="flex justify-center">
              {assignment.status === "Asigned" && (
                <Button
                  onClick={handleStart}
                  disabled={isSubmitting}
                  className="w-full bg-blue-100 text-blue-700 hover:bg-blue-200 h-12 text-lg font-semibold"
                  variant="ghost"
                >
                  <Play className="mr-2 h-5 w-5" />
                  START DEPLASARE
                </Button>
              )}
              {assignment.status === "In Deplasare" && (
                <Button
                  onClick={handleFinish}
                  disabled={isSubmitting}
                  className="w-full bg-[#dcfce7] text-green-700 hover:bg-[#bbf7d0] h-12 text-lg font-semibold"
                  variant="ghost"
                >
                  <Square className="mr-2 h-5 w-5" />
                  FINALIZARE
                </Button>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
              Anulare
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmFinalizatDialog
        open={isConfirmDialogOpen}
        onOpenChange={setIsConfirmDialogOpen}
        teamLead={assignment.team_lead}
        members={memberValues.filter((member) => member !== "Niciunul")}
        onConfirm={async () => {
          setIsSubmitting(true)
          try {
            const now = new Date()
            const updatedAssignment = {
              ...assignment,
              completion_date: now.toISOString(),
              members: memberValues.filter((member) => member !== "Niciunul"),
              status: "Finalizat",
            }
            console.log("Updating assignment:", JSON.stringify(updatedAssignment, null, 2))
            const result = await updateAssignment(updatedAssignment)
            console.log("Update result:", JSON.stringify(result, null, 2))
            if (!result) {
              throw new Error("Failed to update assignment: No result returned")
            }
            onSave(result)
            onOpenChange(false)
            toast({
              title: "Succes",
              description: "Deplasarea a fost finalizată cu succes.",
            })
          } catch (error) {
            console.error("Error finalizing assignment:", error)
            let errorMessage = "A apărut o eroare la finalizarea deplasării"
            if (error instanceof Error) {
              errorMessage += `: ${error.message}`
            } else if (typeof error === "object" && error !== null) {
              errorMessage += `: ${JSON.stringify(error)}`
            }
            toast({
              title: "Eroare",
              description: errorMessage,
              variant: "destructive",
            })
          } finally {
            setIsSubmitting(false)
            setIsConfirmDialogOpen(false)
          }
        }}
        isSubmitting={isSubmitting}
      />
    </>
  )
}

