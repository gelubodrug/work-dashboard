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

interface ConfirmResetDialogProps {
  name: string
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  isSubmitting: boolean
  isOpen: boolean // <-- add this prop
}

export function ConfirmResetDialog({
  name,
  onOpenChange,
  onConfirm,
  isSubmitting,
  isOpen, // <-- use it here
}: ConfirmResetDialogProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Esti sigur ca vrei sa te resetezi?</AlertDialogTitle>
          <AlertDialogDescription>
            {`Nu apasa reset daca nu esti ${name}. Foloseste acest button doar daca ai o deplasare incheiata si totusi nu te regasesti in lista de membri ca fiind "Liber".`}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => onOpenChange(false)}>Anuleaza</AlertDialogCancel>
          <AlertDialogAction disabled={isSubmitting} onClick={onConfirm}>
            {isSubmitting ? "Resetting..." : "Reseteaza"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
