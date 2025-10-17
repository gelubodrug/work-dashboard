"use client"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { AlertTriangle, MapPin, Info } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"

interface ConfirmFinalizeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => Promise<void>
  isSubmitting: boolean
  title: string
  description: string
  assignmentId: number
  km: number | string
  realStartDate?: string | null
  realCompletionDate?: string | null
  assignmentType?: string
}

export function ConfirmFinalizeDialog({
  open,
  onOpenChange,
  assignmentId,
  km,
  assignmentType,
  onConfirm,
}: ConfirmFinalizeDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  // Check if this is a type that allows 0 km
  const isZeroKmAllowed = assignmentType === "Froo" || assignmentType === "BurgerKing"
  const hasZeroKm = km === 0

  const handleConfirm = async () => {
    setIsLoading(true)
    try {
      await onConfirm()
    } finally {
      setIsLoading(false)
    }
  }

  const handleCalculateRoute = () => {
    onOpenChange(false)
    router.push(`/test/assignment-route?id=${assignmentId}&autoFinalize=true`)
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Finalize Assignment</AlertDialogTitle>
          <AlertDialogDescription className="space-y-3">
            <p>Are you sure you want to finalize assignment {assignmentId}?</p>

            {hasZeroKm && !isZeroKmAllowed && (
              <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
                <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold text-red-900 text-sm">Route not calculated</p>
                  <p className="text-red-700 text-sm">
                    The km distance is 0. You must calculate the route before finalizing for accurate records.
                  </p>
                </div>
              </div>
            )}

            {hasZeroKm && isZeroKmAllowed && (
              <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
                <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold text-blue-900 text-sm">Zero km expected</p>
                  <p className="text-blue-700 text-sm">
                    This is a {assignmentType} assignment where 0 km is acceptable.
                  </p>
                </div>
              </div>
            )}

            {!hasZeroKm && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                <p className="text-green-900 text-sm">
                  ✓ Route calculated: <span className="font-semibold">{km} km</span>
                </p>
              </div>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>

          {hasZeroKm && !isZeroKmAllowed ? (
            <Button onClick={handleCalculateRoute} className="bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
              <MapPin className="h-4 w-4 mr-2" />
              Calculate Route First
            </Button>
          ) : (
            <AlertDialogAction onClick={handleConfirm} disabled={isLoading}>
              {isLoading ? "Finalizing..." : "Confirm Finalization"}
            </AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
