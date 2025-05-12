"use client"

import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

export function ThemeTest() {
  // Keep the component implementation but don't render anything
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  // Return null instead of the theme display element
  return null
}
