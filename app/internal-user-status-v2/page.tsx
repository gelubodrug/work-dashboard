"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { AppShell } from "@/components/layout/app-shell"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { toast } from "@/components/ui/use-toast"
import { AlertCircle, Clock, Loader2, MapPin, Plus, RefreshCw, Search, User, Users } from "lucide-react"
import { cn } from "@/lib/utils"
import { UserAvatar } from "@/components/user-avatar"
import { formatDistanceToNow, parseISO, format } from "date-fns"
import { resetUserStatus } from "@/app/actions/users" // Import the new action
import { ConfirmResetDialog } from "@/components/ui/confirm-reset-dialog"

export default function UsersPage() {
  const router = useRouter()
  const [users, setUsers] = useState([])
  const [filteredUsers, setFilteredUsers] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("available")
  const [isFloatingVisible, setIsFloatingVisible] = useState(false)

  // Add scroll listener for floating button
  useEffect(() => {
    const handleScroll = () => {
      const st = window.pageYOffset || document.documentElement.scrollTop
      if (st > 100) {
        setIsFloatingVisible(true)
      } else {
        setIsFloatingVisible(false)
      }
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => {
      window.removeEventListener("scroll", handleScroll)
    }
  }, [])

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers()
  }, [])

  // Apply filters when users or search term change
  useEffect(() => {
    applyFilters()
  }, [users, searchTerm, activeTab])

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
      toast({
        title: "Error",
        description: `Failed to load users: ${err.message}`,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...users]

    // Filter by active/busy tab
    if (activeTab === "available") {
      filtered = filtered.filter((u) => u.status !== "In Deplasare")
    } else if (activeTab === "busy") {
      filtered = filtered.filter((u) => u.status === "In Deplasare")
    }

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

    // Sort by name
    filtered.sort((a, b) => {
      return a.name.localeCompare(b.name)
    })

    setFilteredUsers(filtered)
  }

  // Format time ago
  const formatTimeAgo = (dateString) => {
    if (!dateString) return "-"
    try {
      const date = parseISO(dateString)
      return formatDistanceToNow(date, { addSuffix: true })
    } catch (e) {
      console.error("Date format error:", e)
      return dateString
    }
  }

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "-"
    try {
      return format(parseISO(dateString), "dd MMM yyyy, HH:mm")
    } catch (e) {
      return dateString
    }
  }

  // Get status badge color
  const getStatusColor = (status) => {
    switch (status) {
      case "In Deplasare":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "Liber":
        return "bg-green-100 text-green-800 border-green-200"
      case "Concediu":
        return "bg-orange-100 text-orange-800 border-orange-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  // Get role badge color
  const getRoleColor = (role) => {
    switch (role) {
      case "Admin":
        return "bg-purple-100 text-purple-800 border-purple-200"
      case "Manager":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "Tehnician":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  // Add a new state variable to track if the reset operation is in progress
  const [resettingUserId, setResettingUserId] = useState<number | null>(null)

  // Add a new function to handle resetting the user status
  const handleResetStatus = async (userId: number, name: string) => {
    setSelectedUserId(userId)
    setSelectedUserName(name)
    setIsResetDialogOpen(true)
  }

  // Add state for reset confirm dialog
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null)
  const [selectedUserName, setSelectedUserName] = useState<string | null>(null)

  // Add functions to open and close the confirm dialog
  const onOpenChange = (open: boolean) => {
    setIsResetDialogOpen(open)
  }

  const onConfirm = async () => {
    try {
      setResettingUserId(selectedUserId) // Set the loading state for the specific user
      setIsResetDialogOpen(false)
      const result = await resetUserStatus(selectedUserId)

      if (result.success) {
        toast({
          title: "Success",
          description: `User status reset successfully`,
        })
        fetchUsers() // Refresh the user list
      } else {
        throw new Error(result.error || "Failed to reset user status")
      }
    } catch (error) {
      console.error("Error resetting user status:", error)
      toast({
        title: "Error",
        description: `Failed to reset user status: ${error.message}`,
        variant: "destructive",
      })
    } finally {
      setResettingUserId(null) // Reset the loading state
    }
  }

  return (
    <AppShell>
      <div className="container mx-auto py-6 max-w-3xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl md:text-2xl font-bold flex items-center">
            <Users className="h-5 w-5 mr-2" />
            Utilizatori
          </h1>
          <Button className="bg-blue-500 hover:bg-blue-600 text-white" onClick={() => router.push("/users/new")}>
            <Plus className="h-5 w-5 mr-2" />
            Adaugă Utilizator
          </Button>
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

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex justify-center mb-6">
            <TabsList className="grid grid-cols-2 gap-2">
              <TabsTrigger value="available">Liber</TabsTrigger>
              <TabsTrigger value="busy">In Deplasare</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="available" className="space-y-4">
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
                <p>No available users found</p>
                <p className="text-xs md:text-sm mt-2">Try changing your filters or add a new user</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredUsers.map((user) => (
                  <Card key={user.id} className="overflow-hidden shadow-sm border border-gray-100 rounded-lg w-full">
                    <CardContent className="p-4">
                      <div className="flex flex-col gap-2">
                        {/* Top Row: User Info and Status */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <UserAvatar name={user.name} size="md" showName={false} />
                            <div>
                              <CardTitle className="text-base font-semibold">{user.name}</CardTitle>
                              <div className="text-xs text-muted-foreground">{user.email}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={`${getRoleColor(user.role)} text-xs py-0.5 px-1.5`}>{user.role}</Badge>
                            <Badge className={`${getStatusColor(user.status)} text-xs py-0.5 px-1.5`}>
                              {user.status}
                            </Badge>
                          </div>
                        </div>

                        {/* User Details */}
                        <div className="grid grid-cols-1 gap-2 mt-2">
                          <div className="text-sm">
                            <span className="text-gray-500">Total ore luna curentă:</span>{" "}
                            {user.current_month_hours || 0} h
                          </div>
                          {user.last_completion_date && (
                            <div className="text-sm flex items-center">
                              <Clock className="h-4 w-4 text-gray-400 mr-1" />
                              <span className="text-gray-500">Liber din:</span>{" "}
                              {formatTimeAgo(user.last_completion_date)}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                    {/* Update the button style and remove the w-full class */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleResetStatus(user.id, user.name)}
                      disabled={resettingUserId === user.id}
                      className="justify-center w-auto"
                    >
                      Reset
                    </Button>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="busy" className="space-y-4">
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
                <MapPin className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No users currently on assignment</p>
                <p className="text-xs md:text-sm mt-2">All team members are available</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredUsers.map((user) => (
                  <Card key={user.id} className="overflow-hidden shadow-sm border border-gray-100 rounded-lg w-full">
                    <CardContent className="p-4">
                      <div className="flex flex-col gap-2">
                        {/* Top Row: User Info and Status */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <UserAvatar name={user.name} size="md" showName={false} />
                            <div>
                              <CardTitle className="text-base font-semibold">{user.name}</CardTitle>
                              <div className="text-xs text-muted-foreground">{user.email}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={`${getRoleColor(user.role)} text-xs py-0.5 px-1.5`}>{user.role}</Badge>
                            <Badge className={`${getStatusColor(user.status)} text-xs py-0.5 px-1.5`}>
                              {user.status}
                            </Badge>
                          </div>
                        </div>

                        {/* User Details */}
                        <div className="grid grid-cols-1 gap-2 mt-2">
                          <div className="text-sm">
                            <span className="text-gray-500">Total ore luna curentă:</span>{" "}
                            {user.current_month_hours || 0} h
                          </div>
                          {user.current_assignment && (
                            <div className="text-sm">
                              <span className="text-gray-500">Deplasare curentă:</span>{" "}
                              <Badge className="bg-blue-50 text-blue-600">{user.current_assignment}</Badge>
                            </div>
                          )}
                          {user.current_start_date && (
                            <div className="text-sm flex items-center">
                              <Clock className="h-4 w-4 text-gray-400 mr-1" />
                              <span className="text-gray-500">În deplasare de:</span>{" "}
                              {formatTimeAgo(user.current_start_date)}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                    {/* Update the button style and remove the w-full class */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleResetStatus(user.id, user.name)}
                      disabled={resettingUserId === user.id}
                      className="justify-center w-auto"
                    >
                      Reset
                    </Button>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Floating buttons positioned at middle right */}
      <div
        className={cn(
          "fixed right-4 flex flex-col gap-3 transition-all duration-300 ease-in-out",
          isFloatingVisible ? "translate-x-0 opacity-100" : "translate-x-10 opacity-0",
        )}
        style={{ top: "50%" }}
      >
        <Button
          className="rounded-full h-12 w-12 bg-blue-500 hover:bg-blue-600 text-white shadow-lg"
          onClick={() => router.push("/users/new")}
        >
          <Plus className="h-6 w-6" />
        </Button>

        <Button
          className="rounded-full h-12 w-12 bg-gray-100 hover:bg-gray-200 text-gray-600 shadow-lg"
          onClick={fetchUsers}
          disabled={isLoading}
        >
          {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : <RefreshCw className="h-6 w-6" />}
        </Button>
      </div>

      {/* Confirm Reset Status Dialog */}
      <ConfirmResetDialog
        isOpen={isResetDialogOpen}
        onOpenChange={onOpenChange}
        onConfirm={onConfirm}
        isSubmitting={resettingUserId !== null}
        name={selectedUserName || "this user"}
      />
    </AppShell>
  )
}
