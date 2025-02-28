import type React from "react"
import { validateEnvVars } from "@/lib/config"
import { MainNav } from "@/components/main-nav"
import { SideNav } from "@/components/side-nav"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "@/app/globals.css"
import ErrorBoundary from "@/components/error-boundary"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Work Dashboard",
  description: "Track and manage work assignments and team members",
    generator: 'v0.dev'
}

validateEnvVars()

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.className}>
      <body>
        <ErrorBoundary>
          <div className="flex min-h-screen">
            <SideNav />
            <div className="flex-1 flex flex-col">
              <MainNav />
              <main className="flex-1 p-8">{children}</main>
            </div>
          </div>
        </ErrorBoundary>
      </body>
    </html>
  )
}



import './globals.css'