"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Edit, Trash2, Mail, MapPin } from "lucide-react"
import { ConfirmDeleteDialog } from "./confirm-delete-dialog"
import type { User } from "@/lib/db/types"

export function UserCard({
  user,
  onEdit,
  onDelete,
}: {
  user: User
  onEdit: (user: User) => void
  onDelete: (userId: number) => void
}) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case "Liber":
        return "bg-green-100 text-green-800"
      case "In Deplasare":
        return "bg-blue-100 text-blue-800"
      case "Asigned":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <Card className="overflow-hidden w-full">
      <CardHeader className="pb-2">
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CardTitle className="text-base font-medium">{user.name || "N/A"}</CardTitle>
              <Badge className={getStatusColor(user.status)}>{user.status || "N/A"}</Badge>
            </div>
          </div>
          {user.email && (
            <div className="flex items-center text-xs text-muted-foreground">
              <Mail className="h-3 w-3 mr-1 shrink-0" />
              <span className="truncate">{user.email}</span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="pb-2 space-y-2">
        {user.current_assignment && (
          <div className="flex items-center text-sm">
            <MapPin className="h-4 w-4 mr-1.5 text-muted-foreground shrink-0" />
            <span className="text-muted-foreground truncate">{user.current_assignment}</span>
          </div>
        )}

        <div className="flex items-center justify-between pt-2">
          <Badge
            variant="outline"
            className={user.role === "Admin" ? "bg-primary/10 text-primary border-primary" : "bg-muted/50"}
          >
            {user.role || "User"}
          </Badge>
        </div>

        <div className="flex gap-1 pt-2">
          <Button variant="ghost" size="sm" onClick={() => onEdit(user)} className="h-8 w-8">
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsDeleteDialogOpen(true)}
            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        <ConfirmDeleteDialog
          isOpen={isDeleteDialogOpen}
          onClose={() => setIsDeleteDialogOpen(false)}
          onConfirm={() => onDelete(user.id)}
          itemType="user"
        />
      </CardContent>
    </Card>
  )
}

