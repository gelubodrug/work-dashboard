import { NextResponse } from "next/server"
import { getUsers, setUsers, initializeDefaultUsers, type User } from "@/lib/db"

export async function GET() {
  try {
    console.log("Fetching users...")
    let users = await getUsers()

    if (!users || users.length === 0) {
      console.log("No users found. Initializing default users...")
      await initializeDefaultUsers()
      users = await getUsers()
    }

    console.log("Users fetched successfully:", users.length)
    return NextResponse.json(users)
  } catch (error) {
    console.error("Error fetching or initializing users:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An unknown error occurred" },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  try {
    const users = (await request.json()) as User[]
    if (!Array.isArray(users)) {
      throw new Error("Invalid users data")
    }

    console.log("Setting users...")
    await setUsers(users)
    console.log("Users set successfully")
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error setting users:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An unknown error occurred" },
      { status: 500 },
    )
  }
}

