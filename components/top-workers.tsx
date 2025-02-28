"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export function TopWorkers({ className }: { className?: string }) {
  const workers = [
    {
      name: "RAZVAN MIHAILA",
      hours: 48,
      assignments: 2,
      status: "Liber",
    },
    {
      name: "CREATA VALENTIN",
      hours: 24,
      assignments: 1,
      status: "Liber",
    },
    {
      name: "BADEA STEFAN-ADRIAN",
      hours: 16,
      assignments: 1,
      status: "In deplasare",
    },
    {
      name: "CONSTANTIN IONUT COSMIN",
      hours: 12,
      assignments: 1,
      status: "In deplasare",
    },
  ]

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Top Workers</CardTitle>
        <CardDescription>Workers with most hours this month</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Hours</TableHead>
              <TableHead>Assignments</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {workers.map((worker) => (
              <TableRow key={worker.name}>
                <TableCell>{worker.name}</TableCell>
                <TableCell>{worker.hours}</TableCell>
                <TableCell>{worker.assignments}</TableCell>
                <TableCell>
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                      worker.status === "Liber" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {worker.status}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

