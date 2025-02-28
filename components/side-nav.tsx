"use client"

import { Frame, Users, Map, LayoutDashboard, ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

export function SideNav() {
  const [isOpen, setIsOpen] = useState(true)
  const pathname = usePathname()

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsOpen(false)
      } else {
        setIsOpen(true)
      }
    }

    window.addEventListener("resize", handleResize)
    handleResize()

    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const toggleMenu = () => setIsOpen(!isOpen)

  const navItems = [
    { href: "/", icon: LayoutDashboard, label: "Overview" },
    { href: "/users", icon: Users, label: "Users" },
    { href: "/deplasari", icon: Map, label: "Deplasari" },
  ]

  return (
    <div
      className={cn(
        "border-r bg-muted/40 h-screen transition-all duration-300 relative",
        isOpen ? "w-[240px]" : "w-[60px]",
      )}
    >
      <div className="flex items-center justify-between p-4">
        <div className={cn("flex items-center gap-2", !isOpen && "hidden")}>
          <Frame className="h-6 w-6" />
          <span className="text-lg font-semibold">Work Tracker</span>
        </div>
        <button
          onClick={toggleMenu}
          className="p-2 rounded-md hover:bg-muted absolute right-[-12px] top-4 bg-background border"
        >
          {isOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </button>
      </div>

      <nav className="space-y-2 p-2">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary p-2 rounded-md hover:bg-muted",
              pathname === item.href && "text-primary bg-muted",
              !isOpen && "justify-center",
            )}
          >
            <item.icon className="h-4 w-4" />
            {isOpen && <span>{item.label}</span>}
          </Link>
        ))}
      </nav>
    </div>
  )
}

