export const dynamic = 'force-dynamic'

import { supabase } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import AdminEventDetailClient from './AdminEventDetailClient'
import { mapEventFromDb } from '@/app/api/events/route'

interface PageProps {
  params: Promise<{ locale: string; id: string }>
}

export default async function AdminEventDetailPage({ params }: PageProps) {
  const { locale, id } = await params

  const { data: event } = await supabase
    .from('events')
    .select('*, event_categories(*)')
    .eq('id', id)
    .single()

  if (!event) notFound()

  // Fetch survey responses
  const { data: surveyResponsesRaw } = await supabase
    .from('survey_responses')
    .select('*')
    .eq('event_id', id)

  // Fetch registration count
  const { count } = await supabase
    .from('event_registrations')
    .select('*', { count: 'exact', head: true })
    .eq('event_id', id)

  const surveyResponses = (surveyResponsesRaw ?? []).map(r => ({
    id: r.id,
    eventId: r.event_id,
    registrationId: r.registration_id,
    answers: r.answers,
    createdAt: r.created_at,
  }))

  // Map category
  const cat = event.event_categories as Record<string, unknown> | null
  const category = cat ? { id: cat.id, nameEn: cat.name_en, nameAr: cat.name_ar, nameFr: cat.name_fr, color: cat.color, bg: cat.bg } : null

  const mappedEvent = {
    ...mapEventFromDb({ ...event, _count: { registrations: count ?? 0 } }),
    category,
  }

  return (
    <AdminEventDetailClient
      event={mappedEvent as Parameters<typeof AdminEventDetailClient>[0]['event']}
      locale={locale}
      surveyResponses={surveyResponses as Parameters<typeof AdminEventDetailClient>[0]['surveyResponses']}
    />
  )
}
