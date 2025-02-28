"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { useUsers } from "@/hooks/use-users"
import { useState } from "react"

interface Assignment {
  id: number
  type: string
  dueDate: string
  location: string
  teamLead: string
  member1?: string
  member2?: string
  member3?: string
  member4?: string
  status: string
}

const formSchema = z.object({
  type: z.string().min(1, "Type is required"),
  dueDate: z.string().min(1, "Due date is required"),
  location: z.string().min(1, "Location is required"),
  teamLead: z.string().min(1, "Team lead is required"),
  member1: z.string().optional(),
  member2: z.string().optional(),
  member3: z.string().optional(),
  member4: z.string().optional(),
})

export function NewAssignmentForm({ onSubmit }: { onSubmit: (data: FormData) => void }) {
  const { getAvailableUsers } = useUsers()
  const availableUsers = getAvailableUsers()
  const [open, setOpen] = useState(false)
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: "",
      dueDate: "",
      location: "",
      teamLead: "",
      member1: "",
      member2: "",
      member3: "",
      member4: "",
    },
  })

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    const newAssignment = {
      ...values,
      status: "Asigned",
    }
    console.log("New assignment created:", newAssignment)
    setOpen(false)
    form.reset()
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>Create New Assignment</Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>New Assignment</DialogTitle>
            <DialogDescription>Create a new work assignment. Fill in all the required information.</DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Deplasare (la)</FormLabel>
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
                      <FormLabel>Locatiile</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g. 2023 3265 2245" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>De terminat la data</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="teamLead"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sef Echipa</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select team lead" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="None">None</SelectItem>
                        {availableUsers.map((user) => (
                          <SelectItem key={user.name} value={user.name}>
                            {user.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid gap-4 md:grid-cols-2">
                {[1, 2, 3, 4].map((num) => (
                  <FormField
                    key={num}
                    control={form.control}
                    name={`member${num}` as any}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Membru{num}</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select member" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="None">None</SelectItem>
                            {availableUsers.map((user) => (
                              <SelectItem key={user.name} value={user.name}>
                                {user.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))}
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" type="button" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Create Assignment</Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  )
}

