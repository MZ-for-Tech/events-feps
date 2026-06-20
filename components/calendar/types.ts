import { EventCategoryData } from '../EventCard'

export interface CalendarEvent {
  id: string
  title: string
  titleAr?: string | null
  category: EventCategoryData
  startDate: string
  endDate?: string | null
  location?: string | null
  description?: string | null
  imageUrl?: string | null
}
