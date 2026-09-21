import { supabase } from '@/lib/supabase'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import AdminEventsClient from './AdminEventsClient'

interface PageProps {
  params: Promise<{ locale: string }>
}

export default async function AdminEventsPage({ params }: PageProps) {
  const session = await auth()

  if (!session?.user) redirect('/')

  const { locale } = await params

  const { data: rawEvents } = await supabase
    .from('events')
    .select('*, event_categories(*)')
    .order('start_date', { ascending: false })

  const { data: rawCategories } = await supabase
    .from('event_categories')
    .select('*')

  const events = (rawEvents ?? []).map(ev => {
    const cat = ev.event_categories as Record<string, unknown> | null
    return {
      id:                   ev.id,
      title:                ev.title,
      titleAr:              ev.title_ar,
      categoryId:           ev.category_id,
      category:             cat ? { id: cat.id, nameEn: cat.name_en, nameAr: cat.name_ar, nameFr: cat.name_fr, color: cat.color, bg: cat.bg } : null,
      startDate:            ev.start_date,
      endDate:              ev.end_date,
      location:             ev.location,
      description:          ev.description,
      agendaText:           ev.agenda_text,
      agendaFile:           ev.agenda_file,
      imageUrl:             ev.image_url,
      published:            ev.published,
      status:               ev.status,
      reportSummary:        ev.report_summary,
      reportResults:        ev.report_results,
      reportRecommendations: ev.report_recommendations,
    }
  })

  const categories = (rawCategories ?? []).map(c => ({
    id: c.id, nameEn: c.name_en, nameAr: c.name_ar, nameFr: c.name_fr, color: c.color, bg: c.bg
  }))

  return (
    <AdminEventsClient
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      initialEvents={events as any}
      categories={categories}
      locale={locale}
      permissions={(session.user as { permissions?: string[] }).permissions || []}
      role={(session.user as { role?: string }).role}
    />
  )
}
