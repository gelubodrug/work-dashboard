"use client"

import { useState, useCallback, createContext, useContext } from "react"
import type React from "react"
import { usePathname, useRouter } from "next/navigation"
import { Search, MapPin, Route, Sun, Moon } from "lucide-react"
import { useTheme } from "next-themes"
import { VersionChecker } from "@/components/version-checker"
import { Input } from "@/components/ui/input"

// Create a context to share the refresh trigger with child components
export const RefreshContext = createContext<{
  refreshTrigger: number
  refreshGPSData: () => void
}>({
  refreshTrigger: 0,
  refreshGPSData: () => {},
})

// Custom hook to use the refresh context
export const useRefresh = () => useContext(RefreshContext)

interface AppShellProps {
  children: React.ReactNode
}

export function AppShell({ children }: AppShellProps) {
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const pathname = usePathname()
  const router = useRouter()
  const { theme, setTheme } = useTheme()

  const refreshGPSData = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1)
  }, [])

  return (
    <RefreshContext.Provider value={{ refreshTrigger, refreshGPSData }}>
      <div className="flex flex-col min-h-screen bg-background">
        <VersionChecker />

        <main className="flex-1 overflow-auto pb-24">
          <div className="container mx-auto px-1 sm:px-2 py-2 sm:py-4 min-w-[300px]">{children}</div>
        </main>

        <div className="fixed bottom-4 left-4 right-4 z-50">
          <div className="max-w-2xl mx-auto bg-background/95 backdrop-blur-lg border border-border rounded-full shadow-2xl px-4 py-3">
            <div className="flex items-center gap-3">
              <Search className="h-5 w-5 text-muted-foreground flex-shrink-0" />

              <Input
                type="text"
                placeholder="Search by store number, city, county, or team lead..."
                className="flex-1 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 h-8 px-2"
              />

              <button
                onClick={() => router.push("/assignments")}
                className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                  pathname === "/assignments"
                    ? "bg-blue-600 text-white"
                    : "bg-slate-700 dark:bg-slate-700 text-slate-300 hover:bg-slate-600"
                }`}
                aria-label="Deplasari"
              >
                <MapPin className="h-5 w-5" />
              </button>

              <button
                onClick={() => router.push("/test/assignment-route")}
                className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                  pathname === "/test/assignment-route"
                    ? "bg-blue-600 text-white"
                    : "bg-slate-700 dark:bg-slate-700 text-slate-300 hover:bg-slate-600"
                }`}
                aria-label="Route"
              >
                <Route className="h-5 w-5" />
              </button>

              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="flex-shrink-0 w-10 h-10 rounded-full bg-slate-700 dark:bg-slate-700 text-slate-300 hover:bg-slate-600 flex items-center justify-center transition-colors"
                aria-label="Toggle theme"
              >
                {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </RefreshContext.Provider>
  )
}
