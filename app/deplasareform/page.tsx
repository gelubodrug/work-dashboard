"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertCircle, Loader2, PlayCircle, X, Edit, Wrench, Sparkles, Store, Sandwich, TrendingUp } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { createAssignment, updateAssignment } from "@/app/actions/assignments"
import { getAvailableUsers, checkUserAvailability } from "@/app/actions/users"
import { getAvailableCars } from "@/app/actions/cars"
import { useUser } from "@/context/UserContext"
import { cn } from "@/lib/utils"
import { AppShell } from "@/components/layout/app-shell"
import { StoreSelector } from "@/app/components/StoreSelector"
import { normalizeCountyName, equalsIgnoreCase } from "@/utils/string-utils"

const TabsTrigger = () => null // placeholder if needed

// Fixed headquarters location
const HQ_LOCATION = {
  address: "Șoseaua Banatului 109a",
  city: "Chitila",
  county: "Ilfov",
  coordinates: [25.984056, 44.5062199] as [number, number],
  description: "Headquarters",
}

export default function DeplasareFormPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useUser()

  // Get assignment ID from URL if present (for edit mode)
  const assignmentId = searchParams.get("id")
  const isEditMode = !!assignmentId

  // Form state
  const [type, setType] = useState("")
  const [teamLead, setTeamLead] = useState("")
  const [members, setMembers] = useState<string[]>(["", "", "", ""]) // Changed from string[] to handle user IDs
  const [storeNumber, setStoreNumber] = useState("")
  const [selectedCounty, setSelectedCounty] = useState("")
  const [cityName, setCityName] = useState("")
  const [storeName, setStoreName] = useState("")
  const [storeAddress, setStoreAddress] = useState("")
  const [availableUsers, setAvailableUsers] = useState([])
  const [activeTab, setActiveTab] = useState("details")
  const [activeStoreTab, setActiveStoreTab] = useState("existing")
  const [hasVisitedTeamTab, setHasVisitedTeamTab] = useState(false)
  const [selectedStore, setSelectedStore] = useState<any>(null)
  const [isCreatingNewStore, setIsCreatingNewStore] = useState(false)
  const [originalAssignment, setOriginalAssignment] = useState<any>(null)
  const [carPlate, setCarPlate] = useState("")
  const [availableCars, setAvailableCars] = useState<string[]>([]) // Added for car selection
  const [teamMembers, setTeamMembers] = useState<string[]>([]) // Added for team members

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [processingStep, setProcessingStep] = useState("")
  const [loading, setLoading] = useState(false)

  // First, add a new state for localities list and loading state
  // Add these near the other state declarations (around line 60)

  const [localities, setLocalities] = useState<string[]>([])
  const [isLoadingLocalities, setIsLoadingLocalities] = useState(false)
  const [localityError, setLocalityError] = useState("")

  const [showNewStoreForm, setShowNewStoreForm] = useState(false)

  const [showMagazin, setShowMagazin] = useState(false)
  const [showEchipa, setShowEchipa] = useState(false)

  const magazinSectionRef = useRef<HTMLDivElement>(null)

  // Fetch assignment data if in edit mode
  useEffect(() => {
    const fetchAssignmentData = async () => {
      if (!assignmentId) return

      setLoading(true)
      try {
        // Fetch the assignment data
        const response = await fetch(`/api/assignments/${assignmentId}`)

        // Check if response is ok
        if (!response.ok) {
          const errorText = await response.text()
          console.error("API Response Error:", response.status, errorText)
          throw new Error(`Failed to fetch assignment: ${response.status} - ${errorText}`)
        }

        // Check if response is JSON
        const contentType = response.headers.get("content-type")
        if (!contentType || !contentType.includes("application/json")) {
          const responseText = await response.text()
          console.error("Non-JSON Response:", responseText)
          throw new Error("Server returned non-JSON response")
        }

        const assignment = await response.json()

        // Check if assignment data is valid
        if (!assignment || !assignment.id) {
          throw new Error("Invalid assignment data received")
        }

        setOriginalAssignment(assignment)

        // Populate form fields
        setType(assignment.type || "")
        setTeamLead(assignment.team_lead || "")

        // Parse members array (now expects IDs)
        let membersList: string[] = []
        try {
          if (typeof assignment.members === "string") {
            membersList = JSON.parse(assignment.members)
          } else if (Array.isArray(assignment.members)) {
            membersList = assignment.members
          }
        } catch (e) {
          console.error("Error parsing members:", e)
        }
        setTeamMembers(membersList)

        // Set store information
        setStoreNumber(assignment.store_number || "")
        setSelectedCounty(assignment.county || "")
        setCityName(assignment.city || "")
        setCarPlate(assignment.car_plate || "")

        // If we have a store number, try to fetch store details
        if (assignment.store_number) {
          try {
            const storeResponse = await fetch(`/api/stores/${assignment.store_number}`)
            if (storeResponse.ok) {
              const storeData = await storeResponse.json()
              setSelectedStore(storeData)
              setActiveStoreTab("existing")
            }
          } catch (storeError) {
            console.error("Error fetching store:", storeError)
          }
        }

        // Mark team tab as visited to enable form submission
        setHasVisitedTeamTab(true)
      } catch (error) {
        console.error("Error fetching assignment:", error)
        setError(`Failed to load assignment: ${error.message}`)
      } finally {
        setLoading(false)
      }
    }

    fetchAssignmentData()
  }, [assignmentId])

  useEffect(() => {
    const fetchUsersAndCars = async () => {
      try {
        console.log("[v0] Fetching available users and cars...")
        const users = await getAvailableUsers()
        console.log("[v0] Available users fetched:", users)
        setAvailableUsers(users)

        const cars = await getAvailableCars()
        console.log("[v0] Available cars fetched:", cars)
        const carPlates = cars.map((c) => c.car_plate)
        // Add missing cars if not in database
        if (!carPlates.includes("IF 30 XOX")) {
          carPlates.push("IF 30 XOX")
        }
        // Ensure "Altă mașină" is displayed properly
        const sortedCars = carPlates.filter((plate) => plate !== "alta_masina").sort()
        sortedCars.push("Altă mașină")
        setAvailableCars(sortedCars)
      } catch (error) {
        console.error("Error fetching users or cars:", error)
        setAvailableUsers([])
        setAvailableCars([
          "B 15 XOX",
          "B 116 XOX",
          "B 118 XOX",
          "B 126 XOX",
          "B 127 XOX",
          "B 129 XOX",
          "B 135 XOX",
          "IF 01 XOX",
          "IF 09 XOX",
          "IF 12 XOX",
          "IF 14 XOX",
          "IF 24 XOX",
          "IF 30 XOX",
          "IF 32 XOX",
          "IF 46 XOX",
          "IF 65 XOX",
          "Altă mașină",
        ])
      }
    }
    fetchUsersAndCars()
  }, [])

  // Now add a useEffect to fetch localities when county changes
  // Add this after the other useEffect hooks

  useEffect(() => {
    const fetchLocalities = async () => {
      if (!selectedCounty) {
        setLocalities([])
        setLocalityError("")
        return
      }

      setIsLoadingLocalities(true)
      setLocalityError("")

      try {
        const response = await fetch(`/api/localities/by-county?county=${encodeURIComponent(selectedCounty)}`)
        const data = await response.json()

        if (data.success && data.localities.length > 0) {
          setLocalities(data.localities)
        } else {
          setLocalities([])
          if (data.success && data.localities.length === 0) {
            setLocalityError(
              `Nu s-au găsit localități pentru județul "${selectedCounty}". Verificați dacă numele județului este corect.`,
            )
          } else if (data.suggestions && data.suggestions.length > 0) {
            // Show suggestions if available
            setLocalityError(
              `Nu s-au găsit localități pentru "${selectedCounty}". Încercați: ${data.suggestions.join(", ")}`,
            )
          }
        }
      } catch (error) {
        console.error("Error fetching localities:", error)
        setLocalityError("Eroare la încărcarea localităților. Încercați din nou.")
        setLocalities([])
      } finally {
        setIsLoadingLocalities(false)
      }
    }

    // Add a small delay to avoid too many requests while typing
    const timeoutId = setTimeout(() => {
      fetchLocalities()
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [selectedCounty])

  const handleDeploymentTypeSelect = (deploymentType: string) => {
    setType(deploymentType)
    setShowMagazin(true)

    // Smooth scroll to Magazin section after a short delay to allow the section to render
    setTimeout(() => {
      magazinSectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      })
    }, 100)
  }

  useEffect(() => {
    if (selectedStore || showNewStoreForm || ["Froo", "BurgerKing"].includes(type)) {
      setShowEchipa(true)
    } else {
      setShowEchipa(false)
    }
  }, [selectedStore, showNewStoreForm, type])

  // Function to validate store number format
  const validateStoreNumber = (storeNum: string): boolean => {
    return storeNum.length === 4 && /^\d+$/.test(storeNum)
  }

  const handleStoreSelect = (storeId: number | null, storeData?: any) => {
    setSelectedStore(storeData)
    setIsCreatingNewStore(false)
    setShowNewStoreForm(false)

    if (storeData) {
      setStoreNumber(storeData.store_id?.toString() || "")
      setCityName(storeData.city || "")
      setSelectedCounty(storeData.county || "")
      setStoreName("")
      setStoreAddress("")

      toast({
        title: "Magazin selectat",
        description: `Magazinul ${storeData.store_id} a fost selectat și detaliile au fost completate automat.`,
      })
    } else {
      setStoreNumber("")
      setCityName("")
      setSelectedCounty("")
      setStoreName("")
      setStoreAddress("")
    }
  }

  const handleStoreNotFound = () => {
    setShowNewStoreForm(true)
    setIsCreatingNewStore(true)
    setSelectedStore(null)

    toast({
      title: "Magazin negăsit",
      description: "Vă rugăm completați formularul pentru magazin nou.",
      variant: "default",
    })
  }

  const validateUserAvailability = async (userId: string) => {
    if (!userId || userId === "None") return true

    // If we're in edit mode and this user was already assigned to this assignment,
    // we don't need to check availability
    if (isEditMode && originalAssignment) {
      if (userId === originalAssignment.team_lead) return true

      // Check if user was in the original members list
      let originalMembers: string[] = []
      try {
        if (typeof originalAssignment.members === "string") {
          originalMembers = JSON.parse(originalAssignment.members)
        } else if (Array.isArray(originalAssignment.members)) {
          originalMembers = originalAssignment.members
        }
      } catch (e) {
        console.error("Error parsing original members:", e)
      }

      if (originalMembers.includes(userId)) return true
    }

    try {
      return await checkUserAvailability(userId)
    } catch (error) {
      console.error("Error checking user availability:", error)
      return true // Allow the operation to proceed if the check fails
    }
  }

  // Handlers for team members
  const handleAddTeamMember = (memberId: string) => {
    if (!memberId || memberId === "None") return
    setTeamMembers((prev) => {
      if (prev.includes(memberId)) return prev
      return [...prev, memberId]
    })
  }

  const handleRemoveTeamMember = (memberId: string) => {
    setTeamMembers((prev) => prev.filter((id) => id !== memberId))
  }

  const handleCancel = () => {
    router.push("/assignments")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (isSubmitting) return
    setIsSubmitting(true)
    setError("")
    setProcessingStep("Validating form...")

    try {
      // Validate required fields
      if (!type) {
        setError("Tipul deplasării este obligatoriu")
        setIsSubmitting(false)
        return
      }

      if (!teamLead) {
        setError("Driver este obligatoriu")
        setIsSubmitting(false)
        return
      }

      if (!carPlate) {
        setError("Mașina este obligatorie")
        setIsSubmitting(false)
        return
      }

      // Skip store validation for Froo and BurgerKing
      if (!["Froo", "BurgerKing"].includes(type)) {
        // Validate store selection or creation
        if (!selectedStore && !isCreatingNewStore) {
          setError("Trebuie să selectați un magazin existent sau să creați unul nou")
          setIsSubmitting(false)
          return
        }

        // If creating a new store, validate required fields
        if (isCreatingNewStore) {
          if (!storeNumber) {
            setError("Numarul magazinului este obligatoriu pentru un magazin nou")
            setIsSubmitting(false)
            return
          }

          if (!validateStoreNumber(storeNumber)) {
            setError("Numarul magazinului format din 4 cifre")
            setIsSubmitting(false)
            return
          }

          if (!storeName) {
            setError("Denumirea magazinului este obligatorie pentru un magazin nou")
            setIsSubmitting(false)
            return
          }

          if (!selectedCounty) {
            setError("Județul este obligatoriu pentru un magazin nou")
            setIsSubmitting(false)
            return
          }

          if (!cityName) {
            setError("Localitatea este obligatorie pentru un magazin nou")
            setIsSubmitting(false)
            return
          }

          if (!storeAddress) {
            setError("Adresa: strada, numar este obligatorie pentru un magazin nou")
            setIsSubmitting(false)
            return
          }
        }
      }

      const teamLeadName = availableUsers.find((u) => u.id === Number(teamLead))?.name || teamLead
      const memberNames = teamMembers
        .filter((memberId) => memberId && memberId !== "None") // Filter out empty strings and "None"
        .map((memberId) => {
          const user = availableUsers.find((u) => u.id === Number(memberId))
          return user?.name || memberId
        })

      console.log("[v0] Team lead ID:", teamLead, "-> Name:", teamLeadName)
      console.log("[v0] Member IDs:", teamMembers, "-> Names:", memberNames)

      setProcessingStep("Checking user availability...")
      try {
        if (teamLead && !(await validateUserAvailability(teamLead))) {
          setError(
            `${availableUsers.find((u) => u.id === Number(teamLead))?.name} is already assigned to another active assignment`,
          )
          setIsSubmitting(false)
          return
        }

        for (const memberId of teamMembers) {
          if (memberId && memberId !== "None" && !(await validateUserAvailability(memberId))) {
            setError(
              `${availableUsers.find((u) => u.id === Number(memberId))?.name} is already assigned to another active assignment`,
            )
            setIsSubmitting(false)
            return
          }
        }
      } catch (error) {
        console.error("Error validating user availability:", error)
        // Continue with the submission even if validation fails
      }

      // Get location data from selected store or new store fields or use default for Froo/BurgerKing
      const countyValue = ["Froo", "BurgerKing"].includes(type)
        ? "N/A"
        : selectedStore
          ? selectedStore.county
          : selectedCounty

      const cityValue = ["Froo", "BurgerKing"].includes(type)
        ? type // Use the type name as the city for Froo/BurgerKing
        : selectedStore
          ? selectedStore.city
          : cityName

      const storeNumberValue = ["Froo", "BurgerKing"].includes(type)
        ? null
        : selectedStore
          ? selectedStore.store_id
          : storeNumber

      // Construct the location string
      const formattedLocation = ["Froo", "BurgerKing"].includes(type)
        ? type // Just use the type name for Froo/BurgerKing
        : `${cityValue}, ${countyValue}${storeNumberValue ? ` (Nr. ${storeNumberValue})` : ""}`

      // Use hardcoded Chitila coordinates
      const startLocationValue = "44.509892,25.9845856" // Hardcoded Chitila coordinates

      // If we're creating a new store
      if (isCreatingNewStore && validateStoreNumber(storeNumber)) {
        setProcessingStep("Creating/updating store in database...")

        // Normalize the county name before submission
        const normalizedCounty = normalizeCountyName(selectedCounty)

        try {
          // Create a default address from county and city
          const defaultAddress = `${cityName}, ${selectedCounty}`

          // Add the store to the database
          const response = await fetch("/api/stores/create", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              store_id: storeNumber,
              description: storeName,
              city: cityName,
              county: normalizedCounty, // Use normalized county
              address: defaultAddress, // Use county and city for address instead of storeAddress
            }),
          })

          if (!response.ok) {
            console.warn("Failed to create store, but continuing with assignment creation")
          } else {
            console.log("Successfully created/updated store:", storeNumber)
          }
        } catch (error) {
          console.error("Error creating store:", error)
          // Continue with assignment creation even if store creation fails
        }
      }

      setProcessingStep(isEditMode ? "Updating assignment..." : "Creating assignment...")

      // Create dates and convert them to ISO strings
      const currentDate = new Date()
      const currentDateISOString = currentDate.toISOString()

      const data = {
        id: isEditMode ? Number(assignmentId) : undefined,
        type,
        location: formattedLocation,
        team_lead: teamLeadName, // Use user name instead of ID
        due_date: currentDateISOString, // Convert to ISO string
        members: memberNames, // Use user names instead of IDs
        start_date: isEditMode ? originalAssignment?.start_date : currentDateISOString,
        status: isEditMode ? originalAssignment?.status : "In Deplasare",
        hours: isEditMode ? originalAssignment?.hours : 0,
        completion_date: isEditMode ? originalAssignment?.completion_date : null,
        // Store details
        store_number: storeNumberValue?.toString() || "",
        county: selectedStore ? selectedStore.county : normalizeCountyName(selectedCounty), // Use normalized county
        city: cityValue || "",
        // Location coordinates
        start_location: startLocationValue,
        end_location: "Chitila, Romania", // Always set end location to Chitila
        // Add store_points array with the storeId if available
        store_points: storeNumberValue ? [Number(storeNumberValue)] : [],
        // Preserve existing km and driving_time if in edit mode
        km: isEditMode ? originalAssignment?.km : 0,
        driving_time: isEditMode ? originalAssignment?.driving_time : 0,
        // Add car_plate field
        car_plate: carPlate,
      }

      const location = { latitude: 44.509892, longitude: 25.9845856 }
      const newData = {
        ...data,
        start_location: `${location.latitude},${location.longitude}`,
        end_location: isEditMode ? originalAssignment?.end_location : null,
      }

      let result
      if (isEditMode) {
        result = await updateAssignment(newData)
      } else {
        result = await createAssignment(newData)
      }

      if (!result.success) {
        throw new Error(result.error || `Failed to ${isEditMode ? "update" : "create"} assignment`)
      }

      toast({
        title: "Success",
        description: isEditMode ? "Assignment has been updated successfully." : "New assignment has been created.",
      })

      // Redirect back to assignments page
      router.push("/assignments")
    } catch (error) {
      console.error(`Error ${isEditMode ? "updating" : "submitting"} form:`, error)
      setError(`An error occurred: ${error.message || "Please try again."}`)
    } finally {
      setIsSubmitting(false)
      setProcessingStep("")
    }
  }

  // Check if at least team lead or one member is selected
  const hasTeamMember = teamLead !== "" || teamMembers.length > 0

  const canSubmit = () => {
    if (!type) return false
    if (!teamLead) return false
    if (!carPlate) return false

    // For Froo and BurgerKing, skip store validation
    if (!["Froo", "BurgerKing"].includes(type)) {
      // Validate store selection or creation
      if (!selectedStore && !isCreatingNewStore) return false
      if (isCreatingNewStore) {
        if (!storeNumber || !validateStoreNumber(storeNumber)) return false
        if (!storeName) return false
        if (!selectedCounty) return false
        if (!cityName) return false
        if (!storeAddress) return false
      }
    }
    return true
  }

  // Debug information
  console.log("Form state:", {
    isSubmitting,
    type,
    hasTeamMember,
    carPlate,
    activeStoreTab,
    selectedStore,
    isCreatingNewStore,
    storeNumber,
    validateStoreNumber: storeNumber ? validateStoreNumber(storeNumber) : false,
    selectedCounty,
    cityName,
    storeName,
    showNewStoreForm, // Added for debugging
    teamMembers,
    teamLead,
    carPlate,
    canSubmit: canSubmit(),
  })

  return (
    <AppShell>
      <div className="container mx-auto px-4 py-6 md:py-8 max-w-2xl">
        {error && (
          <Alert variant="destructive" className="mb-6 rounded-2xl border-2">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {processingStep && (
          <Alert className="mb-6 bg-blue-50 border-blue-200 rounded-2xl border-2">
            <div className="flex items-center">
              <Loader2 className="h-4 w-4 mr-2 animate-spin text-[#3A63F0]" />
              <AlertTitle>Processing</AlertTitle>
              <AlertDescription>{processingStep}</AlertDescription>
            </div>
          </Alert>
        )}

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-[#3A63F0]" />
            <span className="ml-2">Loading assignment data...</span>
          </div>
        ) : (
          <div className="w-full">
            <Card className="rounded-2xl border-2 shadow-sm">
              <CardContent className="p-6">
                <form id="deplasareForm" onSubmit={handleSubmit} className="space-y-8">
                  {/* Step 1: Tip Deplasare */}
                  <div>
                    <Label className="text-lg font-semibold mb-3 flex items-center gap-1">
                      Tip Deplasare <span className="text-red-500">*</span>
                    </Label>

                    <div className="grid grid-cols-2 gap-4">
                      {[
                        {
                          value: "Interventie",
                          icon: Wrench,
                          label: "Intervenție",
                          bg: "bg-gradient-to-br from-blue-500/90 to-blue-600/90",
                        },
                        {
                          value: "Deschidere",
                          icon: Store,
                          label: "Deschidere",
                          bg: "bg-gradient-to-br from-slate-600/90 to-slate-700/90",
                        },
                        {
                          value: "Optimizare",
                          icon: TrendingUp,
                          label: "Optimizare",
                          bg: "bg-gradient-to-br from-slate-600/90 to-slate-700/90",
                        },
                        {
                          value: "Froo",
                          icon: Sparkles,
                          label: "Froo",
                          bg: "bg-gradient-to-br from-green-500/90 to-green-600/90",
                        },
                        {
                          value: "BurgerKing",
                          icon: Sandwich,
                          label: "BurgerKing",
                          bg: "bg-gradient-to-br from-orange-500/90 to-orange-600/90",
                        },
                      ].map((option) => {
                        const Icon = option.icon
                        const isSelected = type === option.value

                        return (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => handleDeploymentTypeSelect(option.value)}
                            disabled={isSubmitting}
                            className={cn(
                              "group relative flex flex-col items-center justify-center p-6 rounded-2xl transition-all duration-300 h-32 overflow-hidden",
                              "backdrop-blur-xl border shadow-lg",
                              isSelected
                                ? `${option.bg} border-white/30 shadow-xl scale-[1.02]`
                                : "bg-white/60 border-gray-200/50 hover:bg-white/80 hover:scale-[1.01] hover:shadow-xl",
                              isSubmitting && "opacity-50 cursor-not-allowed",
                            )}
                          >
                            <div
                              className={cn(
                                "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300",
                                !isSelected && "bg-gradient-to-br from-white/50 to-transparent",
                              )}
                            />

                            <Icon
                              className={cn(
                                "h-10 w-10 mb-2 relative z-10 transition-transform duration-300 group-hover:scale-110",
                                isSelected ? "text-white" : "text-gray-700",
                              )}
                            />
                            <span
                              className={cn(
                                "font-semibold text-base relative z-10",
                                isSelected ? "text-white" : "text-gray-800",
                              )}
                            >
                              {option.label}
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Step 2: Magazin (only show after selecting deployment type, and only for Interventie, Deschidere, Optimizare) */}
                  {showMagazin && type && !["Froo", "BurgerKing"].includes(type) && (
                    <div ref={magazinSectionRef} className="animate-in slide-in-from-top-2 duration-300">
                      <Separator className="mb-6" />
                      <Label className="text-sm font-semibold text-foreground mb-3 block">
                        Magazin <span className="text-red-500">*</span>
                      </Label>

                      <div className="space-y-3">
                        <StoreSelector
                          onStoreSelect={handleStoreSelect}
                          onStoreNotFound={handleStoreNotFound}
                          initialStoreId={selectedStore?.store_id || null}
                        />

                        {showNewStoreForm && !selectedStore && (
                          // Applied glassmorphism to new store form
                          <div className="space-y-4 p-5 bg-blue-500/10 backdrop-blur-xl rounded-2xl border border-blue-200/50 shadow-lg animate-in slide-in-from-top-2 duration-300">
                            <div className="flex items-center justify-between mb-2">
                              <p className="text-sm font-semibold text-blue-900">Magazin nou - Completați detaliile</p>
                              <button
                                type="button"
                                onClick={() => {
                                  setShowNewStoreForm(false)
                                  setIsCreatingNewStore(false)
                                  setStoreNumber("")
                                  setCityName("")
                                  setSelectedCounty("")
                                  setStoreName("")
                                  setStoreAddress("")
                                }}
                                className="text-red-500 hover:text-red-700 p-1.5 rounded-lg hover:bg-red-50/80 backdrop-blur-sm transition-colors"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>

                            <div>
                              <Label htmlFor="storeNumber" className="text-sm font-medium text-foreground">
                                Nr. Magazin <span className="text-red-500">*</span>
                              </Label>
                              <Input
                                id="storeNumber"
                                value={storeNumber}
                                onChange={(e) => {
                                  const value = e.target.value
                                  if (/^\d*$/.test(value) && value.length <= 4) {
                                    setStoreNumber(value)
                                  }
                                }}
                                disabled={isSubmitting}
                                className="mt-2 border-2 border-gray-200 focus-visible:ring-2 focus-visible:ring-[#3A63F0] rounded-lg"
                                placeholder="Ex: 3868"
                                maxLength={4}
                              />
                              <p className="text-xs text-muted-foreground mt-1.5">Format: 4 cifre</p>
                            </div>

                            <div>
                              <Label htmlFor="storeName" className="text-sm font-medium text-foreground">
                                Denumire Magazin <span className="text-red-500">*</span>
                              </Label>
                              <Input
                                id="storeName"
                                value={storeName}
                                onChange={(e) => setStoreName(e.target.value)}
                                disabled={isSubmitting}
                                className="mt-2 border-2 border-gray-200 focus-visible:ring-2 focus-visible:ring-[#3A63F0] rounded-lg"
                                placeholder="Ex: Profi Deva Constructorilor"
                              />
                            </div>

                            <div>
                              <Label htmlFor="county" className="text-sm font-medium text-foreground">
                                Județ <span className="text-red-500">*</span>
                              </Label>
                              <Input
                                id="county"
                                value={selectedCounty}
                                onChange={(e) => {
                                  const value = e.target.value
                                  setSelectedCounty(value)
                                  if (!equalsIgnoreCase(value, selectedCounty)) {
                                    setCityName("")
                                  }
                                }}
                                onBlur={() => {
                                  const normalized = normalizeCountyName(selectedCounty)
                                  setSelectedCounty(normalized)
                                }}
                                disabled={isSubmitting}
                                className="mt-2 border-2 border-gray-200 focus-visible:ring-2 focus-visible:ring-[#3A63F0] rounded-lg"
                                placeholder="Ex: București, Ilfov, Cluj"
                              />
                            </div>

                            <div>
                              <Label htmlFor="city" className="text-sm font-medium text-foreground">
                                Oraș/Comună <span className="text-red-500">*</span>
                              </Label>
                              {localities.length > 0 ? (
                                <Select
                                  onValueChange={(value) => setCityName(value)}
                                  value={cityName}
                                  disabled={isSubmitting || !selectedCounty || isLoadingLocalities}
                                >
                                  <SelectTrigger
                                    id="city"
                                    className="mt-2 border-2 border-gray-200 focus-visible:ring-2 focus-visible:ring-[#3A63F0] rounded-lg"
                                  >
                                    <SelectValue placeholder="Selectați localitatea" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {localities.map((locality) => (
                                      <SelectItem key={locality} value={locality}>
                                        {locality}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              ) : (
                                <Input
                                  id="city"
                                  value={cityName}
                                  onChange={(e) => setCityName(e.target.value)}
                                  disabled={isSubmitting || !selectedCounty || isLoadingLocalities}
                                  className="mt-2 border-2 border-gray-200 focus-visible:ring-2 focus-visible:ring-[#3A63F0] rounded-lg"
                                  placeholder={
                                    isLoadingLocalities
                                      ? "Se încarcă..."
                                      : selectedCounty
                                        ? "Introduceți localitatea"
                                        : "Selectați județul mai întâi"
                                  }
                                />
                              )}
                              {isLoadingLocalities && (
                                <p className="text-xs text-muted-foreground mt-1.5 flex items-center">
                                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                  Se încarcă localitățile...
                                </p>
                              )}
                              {localityError && <p className="text-xs text-amber-600 mt-1.5">{localityError}</p>}
                            </div>

                            <div>
                              <Label htmlFor="storeAddress" className="text-sm font-medium text-foreground">
                                Adresa <span className="text-red-500">*</span>
                              </Label>
                              <Input
                                id="storeAddress"
                                value={storeAddress}
                                onChange={(e) => setStoreAddress(e.target.value)}
                                disabled={isSubmitting}
                                className="mt-2 border-2 border-gray-200 focus-visible:ring-2 focus-visible:ring-[#3A63F0] rounded-lg"
                                placeholder="Ex: Strada Principală, nr. 10"
                              />
                              <p className="text-xs text-muted-foreground mt-1.5">Strada și numărul</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Show info message for Froo and BurgerKing */}
                  {showMagazin && type && ["Froo", "BurgerKing"].includes(type) && (
                    <Alert
                      ref={magazinSectionRef}
                      className="bg-blue-50 border-2 border-blue-200 rounded-xl animate-in slide-in-from-top-2 duration-300"
                    >
                      <AlertDescription className="text-blue-700 text-sm">
                        Pentru {type}, nu este necesară selectarea magazinului.
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Step 3: Echipă (only show after store selection or for Froo/BurgerKing) */}
                  {showEchipa && (
                    <div className="animate-in slide-in-from-top-2 duration-300">
                      <Separator className="mb-6" />
                      <Label className="text-sm font-semibold text-foreground mb-3 block">
                        Echipă <span className="text-red-500">*</span>
                      </Label>

                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="teamLead" className="text-sm font-medium text-foreground">
                            Driver <span className="text-red-500">*</span>
                          </Label>
                          {console.log("[v0] Rendering driver select, availableUsers count:", availableUsers.length)}
                          <Select
                            onValueChange={(value) => {
                              setTeamLead(value)
                              setCarPlate("") // Reset car plate when driver changes
                              setTeamMembers([]) // Reset team members when driver changes
                              // Also reset the members array to ensure correct filtering
                              setMembers(["", "", "", ""])
                            }}
                            value={teamLead}
                            disabled={isSubmitting}
                          >
                            <SelectTrigger
                              id="teamLead"
                              className="mt-2 border-2 border-gray-200 focus-visible:ring-2 focus-visible:ring-[#3A63F0] rounded-lg"
                            >
                              <SelectValue placeholder="Selectează șef de echipă" />
                            </SelectTrigger>
                            <SelectContent>
                              {availableUsers.length === 0 && (
                                <div className="p-2 text-sm text-muted-foreground">Se încarcă utilizatori...</div>
                              )}
                              {availableUsers.map((user) => (
                                <SelectItem key={user.id} value={String(user.id)}>
                                  {user.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label htmlFor="carPlate" className="text-sm font-medium text-foreground">
                            Mașină <span className="text-red-500">*</span>
                          </Label>
                          <Select
                            onValueChange={(value) => setCarPlate(value)}
                            value={carPlate}
                            disabled={isSubmitting || !teamLead}
                          >
                            <SelectTrigger
                              id="carPlate"
                              className="mt-2 border-2 border-gray-200 focus-visible:ring-2 focus-visible:ring-[#3A63F0] rounded-lg"
                            >
                              <SelectValue
                                placeholder={teamLead ? "Selectează mașina" : "Selectați driver mai întâi"}
                              />
                            </SelectTrigger>
                            <SelectContent>
                              {availableCars.map((car) => (
                                <SelectItem key={car} value={car === "Altă mașină" ? "alta_masina" : car}>
                                  {car}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label className="text-sm font-medium text-foreground">Membru 1</Label>
                          <Select
                            onValueChange={(value) => {
                              const newMembers = [...members]
                              newMembers[0] = value
                              setMembers(newMembers)
                              // Update teamMembers state as well if it's not 'None'
                              if (value && value !== "None") {
                                setTeamMembers((prev) => {
                                  const updated = [...prev]
                                  updated[0] = value
                                  return updated
                                })
                              } else {
                                // Remove if 'None' or empty
                                setTeamMembers((prev) => {
                                  const updated = [...prev]
                                  updated[0] = ""
                                  return updated
                                })
                              }
                            }}
                            value={members[0]}
                            disabled={isSubmitting || !teamLead}
                          >
                            <SelectTrigger className="mt-2 border-2 border-gray-200 focus-visible:ring-2 focus-visible:ring-[#3A63F0] rounded-lg">
                              <SelectValue
                                placeholder={teamLead ? "Selectează membru 1" : "Selectați driver mai întâi"}
                              />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="None">Niciunul</SelectItem>
                              {availableUsers
                                .filter(
                                  (user) =>
                                    String(user.id) !== teamLead &&
                                    !members.slice(1).includes(String(user.id)) &&
                                    !members.slice(0, 1).includes(String(user.id)), // Ensure not already selected in current members array
                                )
                                .map((user) => (
                                  <SelectItem key={user.id} value={String(user.id)}>
                                    {user.name}
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label className="text-sm font-medium text-foreground">Membru 2</Label>
                          <Select
                            onValueChange={(value) => {
                              const newMembers = [...members]
                              newMembers[1] = value
                              setMembers(newMembers)
                              if (value && value !== "None") {
                                setTeamMembers((prev) => {
                                  const updated = [...prev]
                                  updated[1] = value
                                  return updated
                                })
                              } else {
                                setTeamMembers((prev) => {
                                  const updated = [...prev]
                                  updated[1] = ""
                                  return updated
                                })
                              }
                            }}
                            value={members[1]}
                            disabled={isSubmitting || !teamLead}
                          >
                            <SelectTrigger className="mt-2 border-2 border-gray-200 focus-visible:ring-2 focus-visible:ring-[#3A63F0] rounded-lg">
                              <SelectValue
                                placeholder={teamLead ? "Selectează membru 2" : "Selectați driver mai întâi"}
                              />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="None">Niciunul</SelectItem>
                              {availableUsers
                                .filter(
                                  (user) =>
                                    String(user.id) !== teamLead &&
                                    String(user.id) !== members[0] && // Exclude member 1
                                    !members.slice(2).includes(String(user.id)) &&
                                    !members.slice(1, 2).includes(String(user.id)), // Ensure not already selected
                                )
                                .map((user) => (
                                  <SelectItem key={user.id} value={String(user.id)}>
                                    {user.name}
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label className="text-sm font-medium text-foreground">Membru 3</Label>
                          <Select
                            onValueChange={(value) => {
                              const newMembers = [...members]
                              newMembers[2] = value
                              setMembers(newMembers)
                              if (value && value !== "None") {
                                setTeamMembers((prev) => {
                                  const updated = [...prev]
                                  updated[2] = value
                                  return updated
                                })
                              } else {
                                setTeamMembers((prev) => {
                                  const updated = [...prev]
                                  updated[2] = ""
                                  return updated
                                })
                              }
                            }}
                            value={members[2]}
                            disabled={isSubmitting || !teamLead}
                          >
                            <SelectTrigger className="mt-2 border-2 border-gray-200 focus-visible:ring-2 focus-visible:ring-[#3A63F0] rounded-lg">
                              <SelectValue
                                placeholder={teamLead ? "Selectează membru 3" : "Selectați driver mai întâi"}
                              />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="None">Niciunul</SelectItem>
                              {availableUsers
                                .filter(
                                  (user) =>
                                    String(user.id) !== teamLead &&
                                    String(user.id) !== members[0] && // Exclude member 1
                                    String(user.id) !== members[1] && // Exclude member 2
                                    !members.slice(3).includes(String(user.id)) &&
                                    !members.slice(2, 3).includes(String(user.id)), // Ensure not already selected
                                )
                                .map((user) => (
                                  <SelectItem key={user.id} value={String(user.id)}>
                                    {user.name}
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label className="text-sm font-medium text-foreground">Membru 4</Label>
                          <Select
                            onValueChange={(value) => {
                              const newMembers = [...members]
                              newMembers[3] = value
                              setMembers(newMembers)
                              if (value && value !== "None") {
                                setTeamMembers((prev) => {
                                  const updated = [...prev]
                                  updated[3] = value
                                  return updated
                                })
                              } else {
                                setTeamMembers((prev) => {
                                  const updated = [...prev]
                                  updated[3] = ""
                                  return updated
                                })
                              }
                            }}
                            value={members[3]}
                            disabled={isSubmitting || !teamLead}
                          >
                            <SelectTrigger className="mt-2 border-2 border-gray-200 focus-visible:ring-2 focus-visible:ring-[#3A63F0] rounded-lg">
                              <SelectValue
                                placeholder={teamLead ? "Selectează membru 4" : "Selectați driver mai întâi"}
                              />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="None">Niciunul</SelectItem>
                              {availableUsers
                                .filter(
                                  (user) =>
                                    String(user.id) !== teamLead &&
                                    String(user.id) !== members[0] && // Exclude member 1
                                    String(user.id) !== members[1] && // Exclude member 2
                                    String(user.id) !== members[2] && // Exclude member 3
                                    !members.slice(3, 4).includes(String(user.id)), // Ensure not already selected
                                )
                                .map((user) => (
                                  <SelectItem key={user.id} value={String(user.id)}>
                                    {user.name}
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCancel}
                      disabled={isSubmitting}
                      className="flex-1 flex items-center justify-center py-3.5 border-2 border-gray-300/50 rounded-full font-semibold text-center bg-white/60 backdrop-blur-xl hover:bg-white/80 shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      <X className="h-4 w-4 mr-1" />
                      Anulează
                    </Button>

                    <Button
                      type="submit"
                      disabled={isSubmitting || !canSubmit()}
                      className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-full bg-gradient-to-r from-[#4285F4] to-[#3374E4] backdrop-blur-xl hover:from-[#3374E4] hover:to-[#2A5FD4] text-white font-semibold disabled:opacity-50 shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          {processingStep || "Se procesează..."}
                        </>
                      ) : (
                        <>
                          {isEditMode ? (
                            <>
                              <Edit className="h-4 w-4" />
                              Actualizează
                            </>
                          ) : (
                            <>
                              <PlayCircle className="h-4 w-4" />
                              START
                            </>
                          )}
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </AppShell>
  )
}
