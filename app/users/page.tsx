"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { AppShell } from "@/components/layout/app-shell"
import { Card, CardContent, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Search, User, Users } from "lucide-react"
import { UserAvatar } from "@/components/user-avatar"

export default function SimpleUsersPage() {
  const router = useRouter()
  const [users, setUsers] = useState([])
  const [filteredUsers, setFilteredUsers] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers()
  }, [])

  // Apply filters when users or search term change
  useEffect(() => {
    applyFilters()
  }, [users, searchTerm])

  const fetchUsers = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch("/api/users", {
        cache: "no-store",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error("API response error:", errorText)
        throw new Error(`Error fetching users: ${response.status}`)
      }

      const data = await response.json()
      console.log("Fetched users:", data.length, "users")
      setUsers(data)
    } catch (err) {
      console.error("Error fetching users:", err)
      setError(`Failed to load users: ${err.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...users]

    // Apply search term if present
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter((u) => {
        return (
          u.name?.toLowerCase().includes(term) ||
          u.email?.toLowerCase().includes(term) ||
          u.role?.toLowerCase().includes(term) ||
          u.id?.toString().includes(term)
        )
      })
    }

    // Sort alphabetically by name
    filtered.sort((a, b) => {
      return a.name.localeCompare(b.name)
    })

    setFilteredUsers(filtered)
  }

  return (
    <AppShell>
      <div className="container mx-auto py-6 max-w-3xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl md:text-2xl font-bold flex items-center">
            <Users className="h-5 w-5 mr-2" />
            Utilizatori
          </h1>
        </div>

        <div className="flex flex-col gap-2 mb-6">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Caută după nume, email, sau rol..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <User className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No users found</p>
            <p className="text-xs md:text-sm mt-2">Try changing your search term</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredUsers.map((user) => (
              <Card key={user.id} className="overflow-hidden shadow-sm border border-gray-100 rounded-lg w-full">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <UserAvatar name={user.name} size="md" showName={false} />
                    <div className="flex-1">
                      <CardTitle className="text-base font-semibold">{user.name}</CardTitle>
                      <div className="text-sm text-muted-foreground">{user.email}</div>
                      <div className="text-xs text-muted-foreground mt-1">{user.role}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  )
}
