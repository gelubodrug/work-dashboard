"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { useUsers } from "@/hooks/use-users"
import { createAssignment } from "@/app/actions"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import type { Assignment } from "@/lib/db"

const formSchema = z.object({
  type: z.string().min(1, "Tipul deplasării este obligatoriu"),
  location: z.string().min(1, "Locația este obligatorie"),
  due_date: z.string().min(1, "Data de finalizare este obligatorie"),
  team_lead: z.string().min(1, "Șeful echipei este obligatoriu"),
})

export function NewAssignmentDialog({
  open,
  onOpenChange,
  onCreate,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreate: (newAssignment: Assignment) => void
}) {
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { getAvailableUsers } = useUsers()
  const availableUsers = getAvailableUsers()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: "",
      location: "",
      due_date: "",
      team_lead: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsSubmitting(true)
      setError(null)

      const formattedData = {
        type: values.type,
        location: values.location,
        due_date: new Date(values.due_date).toISOString(),
        team_lead: values.team_lead,
        members: [], // Initialize as empty array
        status: "Asigned",
        hours: 0,
        start_date: null,
        completion_date: null,
      }

      console.log("Submitting assignment data:", JSON.stringify(formattedData, null, 2))

      const newAssignment = await createAssignment(formattedData)
      console.log("New assignment created:", JSON.stringify(newAssignment, null, 2))
      onCreate(newAssignment)
      onOpenChange(false)
      form.reset()
    } catch (error) {
      console.error("Failed to create assignment:", error)
      setError(error instanceof Error ? error.message : JSON.stringify(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>New Assignment</DialogTitle>
          <DialogDescription>Create a new work assignment. Fill in all the required information.</DialogDescription>
        </DialogHeader>
        {error && (
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Deplasare (la) *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="deschidere">Deschidere</SelectItem>
                      <SelectItem value="interventie">Interventie</SelectItem>
                      <SelectItem value="optimizare">Optimizare</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Locatiile *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="e.g. 2020" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="due_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>De terminat la data *</FormLabel>
                  <FormControl>
                    <Input
                      type="datetime-local"
                      {...field}
                      value={field.value || ""}
                      onChange={(e) => {
                        const value = e.target.value || ""
                        field.onChange(value)
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="team_lead"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sef Echipa *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select team lead" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availableUsers.map((user) => (
                        <SelectItem key={user.id} value={user.name || ""}>
                          {user.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2">
              <Button variant="outline" type="button" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create Assignment"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

