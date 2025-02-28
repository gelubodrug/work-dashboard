"use client"

import type { ColumnDef } from "@tanstack/react-table"
import type { Assignment } from "@/lib/db"
import { Badge } from "@/components/ui/badge"
import { format, parseISO } from "date-fns"

export const columns: ColumnDef<Assignment>[] = [
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "type",
    header: "Type",
  },
  {
    accessorKey: "location",
    header: "Location",
  },
  {
    accessorKey: "teamLead",
    header: "Team Lead",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string
      return (
        <Badge
          variant="outline"
          className={
            status === "Liber"
              ? "bg-green-100 text-green-800 hover:bg-green-200"
              : status === "In Deplasare"
                ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                : status === "Finalizat"
                  ? "bg-blue-100 text-blue-800 hover:bg-blue-200"
                  : status === "Asignat"
                    ? "bg-gray-100 text-gray-800 hover:bg-gray-200"
                    : "bg-gray-100 text-gray-800 hover:bg-gray-200"
          }
        >
          {status}
        </Badge>
      )
    },
  },
  {
    accessorKey: "startDate",
    header: "Start Date",
    cell: ({ row }) => {
      const date = row.getValue("startDate") as string
      if (!date) return "N/A"
      return format(parseISO(date), "dd/MM/yyyy")
    },
  },
  {
    accessorKey: "dueDate",
    header: "Due Date",
    cell: ({ row }) => {
      const date = row.getValue("dueDate") as string
      if (!date) return "N/A"
      return format(parseISO(date), "dd/MM/yyyy")
    },
  },
  {
    accessorKey: "completionDate",
    header: "Completion Date",
    cell: ({ row }) => {
      const date = row.getValue("completionDate") as string
      if (!date) return "N/A"
      return format(parseISO(date), "dd/MM/yyyy")
    },
  },
  {
    accessorKey: "hours",
    header: "Hours",
  },
  {
    accessorKey: "members",
    header: "Team Members",
    cell: ({ row }) => {
      const members = row.getValue("members") as string[]
      return members.join(", ")
    },
  },
]

