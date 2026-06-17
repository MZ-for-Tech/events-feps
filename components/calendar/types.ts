import { EventType } from '../EventCard'

export interface CalendarEvent {
  id: string
  title: string
  titleAr?: string | null
  type: EventType
  startDate: string
  endDate?: string | null
  location?: string | null
  description?: string | null
  imageUrl?: string | null
}
