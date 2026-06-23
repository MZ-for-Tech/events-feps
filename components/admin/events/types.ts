import { EventCategoryData } from '@/components/EventCard'

export interface AdminEvent {
  id: string
  title: string
  titleAr?: string | null
  categoryId: string
  category: EventCategoryData
  startDate: string
  endDate?: string | null
  location?: string | null
  description?: string | null
  agendaText?: string | null
  agendaFile?: string | null
  imageUrl?: string | null
  published: boolean
  status?: string | null
  reportSummary?: string | null
  reportResults?: string | null
  reportRecommendations?: string | null
}

export interface AgendaCell {
  day?: string
  startTime: string
  endTime: string
  text: string
}

export interface EventPayload {
  title: string
  titleAr: string | null
  categoryId: string
  startDate: string
  endDate: string | null
  location: string | null
  description: string | null
  agendaText: string | null
  imageUrl?: string | null
  agendaFile?: string | null
  published: boolean
}
