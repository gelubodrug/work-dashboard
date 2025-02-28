import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"

interface User {
  id: number
  name: string
  total_hours: number
  status: string
}

interface UserHoursTableProps {
  users: User[]
  dateRange: { from: Date; to: Date }
}

export function UserHoursTable({ users, dateRange }: UserHoursTableProps) {
  const sortedUsers = [...users].sort((a, b) => b.total_hours - a.total_hours)

  const exportToCSV = () => {
    const headers = [
      "Name",
      `Total Hours (${format(dateRange.from, "dd/MM/yyyy")} - ${format(dateRange.to, "dd/MM/yyyy")})`,
      "Current Status",
    ]
    const csvContent =
      headers.join(",") + "\n" + sortedUsers.map((user) => `${user.name},${user.total_hours},${user.status}`).join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob)
      link.setAttribute("href", url)
      link.setAttribute(
        "download",
        `user_hours_${format(dateRange.from, "yyyy-MM-dd")}_${format(dateRange.to, "yyyy-MM-dd")}.csv`,
      )
      link.style.visibility = "hidden"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "liber":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-700">
            Liber
          </Badge>
        )
      case "in deplasare":
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-700">
            În Deplasare
          </Badge>
        )
      case "ocupat":
        return (
          <Badge variant="outline" className="bg-red-100 text-red-700">
            Ocupat
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">User Working Hours</h2>
        <Button onClick={exportToCSV}>
          <Download className="mr-2 h-4 w-4" /> Export to CSV
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead className="text-right">
              Total Hours ({format(dateRange.from, "dd/MM/yyyy")} - {format(dateRange.to, "dd/MM/yyyy")})
            </TableHead>
            <TableHead>Current Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedUsers.map((user) => (
            <TableRow key={user.id}>
              <TableCell className="font-medium">{user.name}</TableCell>
              <TableCell className="text-right">{user.total_hours}</TableCell>
              <TableCell>{getStatusBadge(user.status)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

