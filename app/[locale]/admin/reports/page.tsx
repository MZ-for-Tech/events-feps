export const dynamic = 'force-dynamic'

import { getTranslations } from 'next-intl/server'
import { supabase } from '@/lib/supabase'
import ReportGenerator from '@/components/admin/ReportGenerator'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { FileText } from 'lucide-react'

export default async function AdminReportsPage() {

  const t = await getTranslations('AdminReports')
  
  const { data: rawEvents } = await supabase
    .from('events')
    .select('*, event_categories(*)')
    .order('start_date', { ascending: true })

  const { data: rawCategories } = await supabase
    .from('event_categories')
    .select('*')
    .order('name_en', { ascending: true })

  const categories = (rawCategories ?? []).map(c => ({
    id: c.id,
    nameEn: c.name_en,
    nameAr: c.name_ar,
    nameFr: c.name_fr,
    color: c.color,
    bg: c.bg
  }))

  const events = []
  for (const ev of (rawEvents ?? [])) {
    const { count } = await supabase
      .from('event_registrations')
      .select('*', { count: 'exact', head: true })
      .eq('event_id', ev.id)

    const cat = ev.event_categories as Record<string, any> | null
    events.push({
      id: ev.id,
      title: ev.title,
      titleAr: ev.title_ar,
      category: cat ? { id: cat.id, nameEn: cat.name_en, nameAr: cat.name_ar, nameFr: cat.name_fr, color: cat.color, bg: cat.bg } : null,
      startDate: ev.start_date,
      endDate: ev.end_date || null,
      location: ev.location,
      description: ev.description,
      agendaText: ev.agenda_text,
      published: ev.published,
      imageUrl: ev.image_url,
      registrationCount: count ?? 0
    })
  }

  return (
    <div>
      <AdminPageHeader 
        title={t('pageTitle')}
        description={t('pageDesc')}
        icon={FileText}
      />

      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <ReportGenerator events={events as any} categories={categories} />
    </div>
  )
}
