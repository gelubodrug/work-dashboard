"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { getWorkLogsByUser } from "@/lib/db/operations"
import { format } from "date-fns"

interface WorkLog {
  id: number
  date: string
  hours: number
}

export function UserWorkLogs({ userId }: { userId: number }) {
  const [workLogs, setWorkLogs] = useState<WorkLog[]>([])

  useEffect(() => {
    const fetchWorkLogs = async () => {
      const logs = await getWorkLogsByUser(userId, "2023-01-01", "2023-01-31")
      setWorkLogs(logs)
    }
    fetchWorkLogs()
  }, [userId])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Work Logs</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Assignment</TableHead>
              <TableHead>Hours</TableHead>
              <TableHead>Description</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {workLogs.map((log) => (
              <TableRow key={log.id}>
                <TableCell>{format(new Date(log.date), "dd/MM/yyyy")}</TableCell>
                <TableCell>{log.assignment_id}</TableCell>
                <TableCell>{log.hours}</TableCell>
                <TableCell>{log.description || "-"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

