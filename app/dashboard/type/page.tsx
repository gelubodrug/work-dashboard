"use client"

import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { AppShell } from "@/components/layout/app-shell"
import { DashboardTypeContent } from "./dashboard-type-content"

function TypePageContent() {
  const searchParams = useSearchParams()
  const type = searchParams.get("type") || "Interventie"

  return <DashboardTypeContent initialType={type} />
}

export default function TypeDashboardPage() {
  return (
    <AppShell>
      <div className="container mx-auto py-6">
        <Suspense
          fallback={
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          }
        >
          <TypePageContent />
        </Suspense>
      </div>
    </AppShell>
  )
}
