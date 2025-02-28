"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import { CalendarIcon } from "lucide-react"
import { format, startOfMonth } from "date-fns"
import { cn } from "@/lib/utils"
import type { DateRange } from "react-day-picker"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { UserHoursTable } from "@/components/user-hours-table"

interface User {
  // Define the structure of a user object
  id: number
  name: string
  // Add other properties as needed
}

interface DashboardClientProps {
  initialStats: {
    freeUsers: number
    activeAssignments: number
    finishedWorks: number
    hours: {
      deschidere: number
      interventie: number
      optimizare: number
    }
  }
  initialUsers: User[]
}

export function DashboardClient({ initialStats, initialUsers }: DashboardClientProps) {
  const [date, setDate] = useState<DateRange | undefined>({
    from: startOfMonth(new Date()),
    to: new Date(),
  })
  const [stats] = useState(initialStats)
  const [users] = useState(initialUsers)

  return (
    <div className="container mx-auto py-6 px-4 sm:px-6">
      <div className="mb-6 space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">Work Dashboard</h1>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-full justify-start text-left font-normal sm:w-[300px]",
                !date && "text-muted-foreground",
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date?.from ? (
                date.to ? (
                  <>
                    {format(date.from, "MMM dd, yyyy")} - {format(date.to, "MMM dd, yyyy")}
                  </>
                ) : (
                  format(date.from, "MMM dd, yyyy")
                )
              ) : (
                <span>Pick a date range</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={date?.from}
              selected={date}
              onSelect={setDate}
              numberOfMonths={1}
            />
          </PopoverContent>
        </Popover>

        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-blue-100 text-blue-700 hover:bg-blue-100">
              Deschidere
            </Badge>
            <span>{stats.hours.deschidere.toFixed(2)} hours</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">
              Interventie
            </Badge>
            <span>{stats.hours.interventie.toFixed(2)} hours</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-green-100 text-green-700 hover:bg-green-100">
              Optimizare
            </Badge>
            <span>{stats.hours.optimizare.toFixed(2)} hours</span>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-2">Free Users</h2>
          <div className="text-4xl font-bold mb-1 text-green-600">{stats.freeUsers}</div>
          <p className="text-muted-foreground">Total number of free users</p>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-2">Active Assignments</h2>
          <div className="text-4xl font-bold mb-1 text-yellow-600">{stats.activeAssignments}</div>
          <p className="text-muted-foreground">Assigned or In Progress</p>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-2">Finished Works</h2>
          <div className="text-4xl font-bold mb-1 text-blue-600">{stats.finishedWorks}</div>
          <p className="text-muted-foreground">Completed assignments</p>
        </Card>
      </div>

      <UserHoursTable users={users} dateRange={date} />
    </div>
  )
}

