"use client"

import { useEffect, useState, useCallback } from "react"

export function useToast() {
  const [toasts, setToasts] = useState<{ id: string; message: string; type: "success" | "error" }[]>([])

  const toast = (message: string, type: "success" | "error" = "success") => {
    const id = Math.random().toString(36).substr(2, 9)
    setToasts((prevToasts) => [...prevToasts, { id, message, type }])
  }

  const dismissToast = useCallback((id: string) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id))
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      if (toasts.length > 0) {
        dismissToast(toasts[0].id)
      }
    }, 3000)

    return () => clearTimeout(timer)
  }, [toasts, dismissToast])

  return { toast, toasts, dismissToast }
}

