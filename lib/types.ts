export interface Assignment {
  id: number
  type: string
  start_date: string | null
  due_date: string
  completion_date: string | null
  location: string
  team_lead: string
  members: string[]
  status: string
  hours: number
}

export interface User {
  id: number
  name: string | null
  email: string | null
  role: string | null
  status: string
  total_hours: number
  current_assignment: string | null
}

