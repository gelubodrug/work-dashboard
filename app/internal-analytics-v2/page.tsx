"use client"

import { useState, useEffect, useCallback } from "react"
import { AppShell } from "@/components/layout/app-shell"
import { SmallCard } from "@/components/dashboard/small-card"
import { TopWorkers } from "@/components/dashboard/top-workers"
import { TopRiders } from "@/components/dashboard/top-riders"
import { WorkDistribution } from "@/components/dashboard/work-distribution"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, subMonths, format } from "date-fns"
import {
  getTopWorkersByHours,
  getTopRidersByKilometers,
  getWorkDistributionByType,
  getTotalHoursInDateRange,
  getTotalKilometersInDateRange,
  exportWorkLogs,
} from "../actions/work-logs"
import { cn } from "@/lib/utils"
import { Filter } from "@/components/icons/filter"
import { AlertTriangle } from "lucide-react"

export default function DashboardPage() {
  const [dateRange, setDateRange] = useState({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
    key: "this-month",
  })
  const [topWorkers, setTopWorkers] = useState([])
  const [topRiders, setTopRiders] = useState([])
  const [workDistribution, setWorkDistribution] = useState([])
  const [totalHours, setTotalHours] = useState(0)
  const [totalKilometers, setTotalKilometers] = useState(0)
  const [layout, setLayout] = useState<"grid" | "row">("grid")

  useEffect(() => {
    const savedLayout = localStorage.getItem("cardLayout") as "grid" | "row"
    setLayout(savedLayout || "grid")
  }, [])

  const fetchDashboardData = useCallback(async () => {
    if (!dateRange?.from || !dateRange?.to) return

    try {
      // Fetch all workers by passing -1 as the limit
      const workers = await getTopWorkersByHours(-1, dateRange.from, dateRange.to)
      setTopWorkers(workers)

      // Try to get all riders, but handle the case where the kilometers column doesn't exist yet
      try {
        const riders = await getTopRidersByKilometers(-1, dateRange.from, dateRange.to)
        setTopRiders(riders)
      } catch (error) {
        console.error("Error fetching top riders:", error)
        setTopRiders([])
      }

      const distribution = await getWorkDistributionByType(dateRange.from, dateRange.to)
      setWorkDistribution(distribution)

      const hours = await getTotalHoursInDateRange(dateRange.from, dateRange.to)
      setTotalHours(hours)

      // Try to get total kilometers, but handle the case where the kilometers column doesn't exist yet
      try {
        const kilometers = await getTotalKilometersInDateRange(dateRange.from, dateRange.to)
        setTotalKilometers(kilometers)
      } catch (error) {
        console.error("Error fetching total kilometers:", error)
        setTotalKilometers(0)
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    }
  }, [dateRange])

  useEffect(() => {
    fetchDashboardData()
  }, [fetchDashboardData])

  const formatDateRange = () => {
    if (
      dateRange.from.getMonth() === dateRange.to.getMonth() &&
      dateRange.from.getFullYear() === dateRange.to.getFullYear()
    ) {
      return `${format(dateRange.from, "MMMM yyyy")}`
    }
    return `${format(dateRange.from, "MMM d")} - ${format(dateRange.to, "MMM d, yyyy")}`
  }

  const handleExport = async () => {
    try {
      const csvData = await exportWorkLogs(dateRange.from, dateRange.to)
      const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" })
      const link = document.createElement("a")
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob)
        link.setAttribute("href", url)
        link.setAttribute(
          "download",
          `work_logs_${format(dateRange.from, "yyyy-MM-dd")}_to_${format(dateRange.to, "yyyy-MM-dd")}.csv`,
        )
        link.style.visibility = "hidden"
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }
    } catch (error) {
      console.error("Error exporting work logs:", error)
    }
  }

  const handleDateRangeSelect = (key: string) => {
    const now = new Date()
    let from, to
    switch (key) {
      case "last-12-months":
        from = startOfMonth(subMonths(now, 12))
        to = endOfMonth(now)
        break
      case "last-6-months":
        from = startOfMonth(subMonths(now, 6))
        to = endOfMonth(now)
        break
      case "last-month":
        from = startOfMonth(subMonths(now, 1))
        to = endOfMonth(subMonths(now, 1))
        break
      case "this-month":
        from = startOfMonth(now)
        to = endOfMonth(now)
        break
      case "this-week":
        from = startOfWeek(now)
        to = endOfWeek(now)
        break
      default:
        from = startOfMonth(now)
        to = endOfMonth(now)
    }
    setDateRange({ from, to, key })
  }

  const DateRangeFilters = ({ className = "" }) => (
    <div className={cn("flex flex-wrap gap-1 my-2", className)}>
      <Filter className="h-3 w-3 text-blue-400 mr-1 self-center" />
      {[
        { key: "last-12-months", label: "Last 12 Months" },
        { key: "last-6-months", label: "Last 6 Months" },
        { key: "last-month", label: "Last Month" },
        { key: "this-month", label: "This Month" },
        { key: "this-week", label: "This Week" },
      ].map(({ key, label }) => (
        <button
          key={key}
          onClick={() => handleDateRangeSelect(key)}
          className={cn(
            "h-6 px-2 text-xs rounded-full transition-colors",
            dateRange.key === key
              ? "bg-blue-100 text-blue-800 border-blue-200"
              : "bg-gray-50 text-gray-600 border-gray-200",
            "border shadow-sm",
          )}
        >
          {label}
        </button>
      ))}
    </div>
  )

  const handleLayoutChange = (newLayout: "grid" | "row") => {
    setLayout(newLayout)
    localStorage.setItem("cardLayout", newLayout)
  }

  return (
    <AppShell>
      {topWorkers.length === 0 && topRiders.length === 0 && workDistribution.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
          <AlertTriangle className="h-16 w-16 text-orange-500" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Pagina nu este disponibilă</h1>
          <p className="text-gray-600 dark:text-gray-400 text-center max-w-md">
            Această pagină nu mai este accesibilă. Vă rugăm să utilizați meniul de navigare.
          </p>
        </div>
      ) : (
        <div className="space-y-4 max-w-7xl mx-auto">
          <div className="flex flex-col gap-4 max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
            <div className="flex items-center">
              <DateRangeFilters />
            </div>
          </div>

          <div className="grid grid-cols-1 max-w-3xl mx-auto gap-4">
            {/* 1. Work Distribution */}
            <SmallCard
              title="Work Distribution"
              description={`Assignment types - ${formatDateRange()}`}
              customContent={<WorkDistribution distribution={workDistribution} />}
            />

            {/* 2. Combined Top Workers and Top Riders with tabs */}
            <Card className="col-span-1 md:col-span-1">
              <CardHeader className="pb-2">
                <div className="space-y-2">
                  <CardTitle className="text-sm font-medium">
                    Team Performance
                    <span className="ml-1 text-xs font-normal text-muted-foreground">- {formatDateRange()}</span>
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <Tabs defaultValue="workers" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-4">
                    <TabsTrigger value="workers">Top Workers</TabsTrigger>
                    <TabsTrigger value="riders">Top Riders</TabsTrigger>
                  </TabsList>
                  <TabsContent value="workers" className="mt-0">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-semibold">Top Workers by Hours</h2>
                    </div>
                    <TopWorkers workers={topWorkers} />
                  </TabsContent>
                  <TabsContent value="riders" className="mt-0">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-semibold">Top Riders by Kilometers</h2>
                    </div>
                    <TopRiders riders={topRiders} />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </AppShell>
  )
}
