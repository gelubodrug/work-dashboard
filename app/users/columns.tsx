"use client"

import type { ColumnDef } from "@tanstack/react-table"
import type { User } from "@/lib/db"
import { Badge } from "@/components/ui/badge"

export const columns: ColumnDef<User>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "role",
    header: "Role",
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
                  : "bg-gray-100 text-gray-800 hover:bg-gray-200"
          }
        >
          {status}
        </Badge>
      )
    },
  },
  {
    accessorKey: "totalHours",
    header: "Total Hours",
  },
  {
    accessorKey: "currentAssignment",
    header: "Current Assignment",
    cell: ({ row }) => row.getValue("currentAssignment") || "None",
  },
]

