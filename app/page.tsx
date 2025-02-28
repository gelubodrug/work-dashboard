import { Suspense } from "react"
import { getAssignments, getUsers, getWorkDistribution } from "@/lib/db/operations"
import { startOfMonth } from "date-fns"
import { DashboardClient } from "@/components/dashboard-client"
import { EnvStatus } from "@/components/env-status" // Add this import

export default async function DashboardPage() {
  // Fetch initial data
  const startDate = startOfMonth(new Date())
  const endDate = new Date()

  const assignments = await getAssignments()
  const users = await getUsers()
  const workDistribution = await getWorkDistribution(startDate, endDate)

  const initialStats = {
    freeUsers: users.filter((user) => user.status === "Liber").length,
    activeAssignments: assignments.filter((a) => a.status === "Asigned" || a.status === "In Deplasare").length,
    finishedWorks: assignments.filter((a) => a.status === "Finalizat").length,
    hours: workDistribution,
  }

  return (
    <Suspense fallback={<div>Loading dashboard...</div>}>
      <EnvStatus /> {/* Add the EnvStatus component here */}
      <DashboardClient initialStats={initialStats} initialUsers={users} />
    </Suspense>
  )
}

