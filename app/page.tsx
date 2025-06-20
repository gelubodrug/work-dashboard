import { redirect } from "next/navigation"

export default function Home() {
  redirect("/assignments")
  return null
}
