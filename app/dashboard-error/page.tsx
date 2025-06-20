"use client"

import { AppShell } from "@/components/layout/app-shell"
import { AlertCircle } from "lucide-react"

export default function DashboardErrorPage() {
  return (
    <AppShell>
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <AlertCircle className="h-16 w-16 text-red-500" />
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Erroare de încărcarea datelor</h1>
        <p className="text-gray-600 dark:text-gray-400 text-center max-w-md">
          Nu s-au putut încărca datele pentru dashboard. Vă rugăm să încercați din nou mai târziu.
        </p>
      </div>
    </AppShell>
  )
}
