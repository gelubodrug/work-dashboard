"use client"

import { useState, useEffect, useCallback } from "react"
import { fetchUsers, updateUser, createUser, deleteUser } from "@/app/actions"
import type { User } from "@/lib/db/types"

export function useUsers() {
  const [users, setUsers] = useState<User[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function initializeUsers() {
      try {
        console.log("Fetching users...")
        const fetchedUsers = await fetchUsers()
        console.log("Users fetched successfully:", fetchedUsers.length)
        setUsers(fetchedUsers)
      } catch (err) {
        console.error("Error fetching users:", err)
        setError(err instanceof Error ? err.message : String(err))
      }
    }
    initializeUsers()
  }, [])

  const addUser = useCallback(async (newUser: Omit<User, "id">) => {
    try {
      const createdUser = await createUser(newUser)
      setUsers((prevUsers) => [...prevUsers, createdUser])
    } catch (err) {
      console.error("Error adding user:", err)
      setError(err instanceof Error ? err.message : String(err))
    }
  }, [])

  const updateUserState = useCallback(async (updatedUser: User) => {
    try {
      const result = await updateUser(updatedUser)
      setUsers((prevUsers) => prevUsers.map((user) => (user.id === result.id ? result : user)))
    } catch (err) {
      console.error("Error updating user:", err)
      setError(err instanceof Error ? err.message : String(err))
    }
  }, [])

  const deleteUserState = useCallback(async (userId: number) => {
    try {
      await deleteUser(userId)
      setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId))
    } catch (err) {
      console.error("Error deleting user:", err)
      setError(err instanceof Error ? err.message : String(err))
    }
  }, [])

  const getAvailableUsers = useCallback(() => {
    return users.filter((user) => user.status === "Liber")
  }, [users])

  const getAvailableUsersForEdit = useCallback(
    (currentAssignment?: {
      team_lead?: string
      members?: string[]
    }) => {
      if (!currentAssignment) {
        return users.filter((user) => user.status === "Liber")
      }

      return users.filter((user) => {
        // Always include current team members and lead
        const isCurrentTeamLead = user.name === currentAssignment.team_lead
        const isCurrentMember = currentAssignment.members?.includes(user.name || "")

        // Include if they're either part of current assignment OR available
        return isCurrentTeamLead || isCurrentMember || user.status === "Liber"
      })
    },
    [users],
  )

  return {
    users,
    addUser,
    updateUser: updateUserState,
    deleteUser: deleteUserState,
    getAvailableUsers,
    getAvailableUsersForEdit,
    error,
  }
}

