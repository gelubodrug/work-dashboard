"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { UserCard } from "@/components/user-card"
import { useUsers } from "@/hooks/use-users"
import { EditUserDialog } from "@/components/edit-user-dialog"
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { User } from "@/lib/db/types"

export default function UsersPage() {
  const { users, updateUser, deleteUser } = useUsers()
  const [isEditUserDialogOpen, setIsEditUserDialogOpen] = useState(false)
  const [isDeleteUserDialogOpen, setIsDeleteUserDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  const filteredUsers = users.filter(
    (user) =>
      (user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchQuery.toLowerCase())) &&
      (statusFilter === "all" || user.status === statusFilter),
  )

  const handleEditUser = (user: User) => {
    setSelectedUser(user)
    setIsEditUserDialogOpen(true)
  }

  const handleDeleteUser = (userId: number) => {
    const userToDelete = users.find((user) => user.id === userId)
    if (userToDelete) {
      setSelectedUser(userToDelete)
      setIsDeleteUserDialogOpen(true)
    }
  }

  const confirmDeleteUser = async () => {
    if (selectedUser) {
      await deleteUser(selectedUser.id)
      setIsDeleteUserDialogOpen(false)
      setSelectedUser(null)
    }
  }

  const handleUserUpdated = (updatedUser: User) => {
    updateUser(updatedUser)
    setIsEditUserDialogOpen(false)
    setSelectedUser(null)
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Users</h1>
        <div className="flex items-center gap-4">
          <Input
            placeholder="Search users..."
            className="w-[300px]"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <Tabs defaultValue="all" className="w-full mb-6" onValueChange={setStatusFilter}>
        <TabsList className="w-full justify-start">
          <TabsTrigger value="all">All Users</TabsTrigger>
          <TabsTrigger value="Asigned">Asigned</TabsTrigger>
          <TabsTrigger value="Liber">Liber</TabsTrigger>
          <TabsTrigger value="In Deplasare">In Deplasare</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredUsers.map((user) => (
          <UserCard key={user.id} user={user} onEdit={handleEditUser} onDelete={handleDeleteUser} />
        ))}
      </div>

      {selectedUser && (
        <EditUserDialog
          open={isEditUserDialogOpen}
          onOpenChange={setIsEditUserDialogOpen}
          user={selectedUser}
          onUserUpdated={handleUserUpdated}
        />
      )}

      <AlertDialog open={isDeleteUserDialogOpen} onOpenChange={setIsDeleteUserDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this user?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the user and remove their data from our
              servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteUser}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

