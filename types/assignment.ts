export interface Assignment {
  id: number
  type: string
  startDate: string
  dueDate: string
  completionDate?: string
  location: string
  teamLead: string
  members: string[]
  status: string
  hours?: number
}

