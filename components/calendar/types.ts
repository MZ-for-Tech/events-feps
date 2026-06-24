import { EventCategoryData } from '../EventCard'

export interface CalendarEvent {
  id: string
  title: string
  titleAr?: string | null
  titleFr?: string | null
  category: EventCategoryData
  startDate: string
  endDate?: string | null
  location?: string | null
  locationAr?: string | null
  locationFr?: string | null
  description?: string | null
  descriptionAr?: string | null
  descriptionFr?: string | null
  imageUrl?: string | null
}
