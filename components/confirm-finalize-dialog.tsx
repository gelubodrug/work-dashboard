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
import { AlertTriangle, CheckCircle, RefreshCw, MapPin, Info } from "lucide-react"

interface ConfirmFinalizeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
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
  onConfirm,
  isSubmitting,
  title,
  description,
  assignmentId,
  km,
  realStartDate,
  realCompletionDate,
  assignmentType,
}: ConfirmFinalizeDialogProps) {
  // Check if this is a Froo or BurgerKing assignment that can skip km validation
  const skipKmValidation = assignmentType === "Froo" || assignmentType === "BurgerKing"
  const kmValue = typeof km === "string" ? Number.parseFloat(km) : km
  const hasKmCalculated = kmValue > 0

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            {hasKmCalculated || skipKmValidation ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-orange-500" />
            )}
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-3">
            <p>{description}</p>

            {/* Show info message for Froo/BurgerKing */}
            {skipKmValidation && !hasKmCalculated && (
              <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
                <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium">Deplasare tip {assignmentType} - km calculation not required</p>
                  <p className="text-xs mt-1">
                    This assignment will be finalized with 0 km as it's a {assignmentType} type deployment.
                  </p>
                </div>
              </div>
            )}

            {/* Show warning for non-Froo/BurgerKing with 0 km */}
            {!skipKmValidation && !hasKmCalculated && (
              <div className="flex items-start gap-2 p-3 bg-orange-50 border border-orange-200 rounded-md">
                <AlertTriangle className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-orange-800">
                  <p className="font-medium">Route not calculated</p>
                  <p className="text-xs mt-1">
                    The km distance is 0. Consider calculating the route before finalizing for accurate records.
                  </p>
                </div>
              </div>
            )}

            {/* Show GPS timestamps if available */}
            {(realStartDate || realCompletionDate) && (
              <div className="space-y-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-sm font-medium text-blue-900">GPS Timestamps:</p>
                {realStartDate && (
                  <div className="flex items-center gap-2 text-xs text-blue-800">
                    <MapPin className="h-3 w-3" />
                    <span>Departure: {new Date(realStartDate).toLocaleString()}</span>
                  </div>
                )}
                {realCompletionDate && (
                  <div className="flex items-center gap-2 text-xs text-blue-800">
                    <MapPin className="h-3 w-3" />
                    <span>Return: {new Date(realCompletionDate).toLocaleString()}</span>
                  </div>
                )}
              </div>
            )}

            {hasKmCalculated && (
              <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-md">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <div className="text-sm text-green-800">
                  <p className="font-medium">Route calculated: {kmValue.toFixed(1)} km</p>
                  <p className="text-xs mt-1">Ready to finalize with calculated distance.</p>
                </div>
              </div>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} disabled={isSubmitting} className="bg-blue-500 hover:bg-blue-600">
            {isSubmitting ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Finalizing...
              </>
            ) : (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Confirm Finalization
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
