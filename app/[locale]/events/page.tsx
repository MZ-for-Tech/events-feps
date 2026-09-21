import { supabase } from '@/lib/supabase'
import EventCalendar from '@/components/EventCalendar'
import { getTranslations } from 'next-intl/server'

interface PageProps {
  params: Promise<{ locale: string }>
}

export default async function EventsPage({ params }: PageProps) {
  const { locale } = await params

  const t = await getTranslations({ locale, namespace: 'EventsPage' })
  const today = new Date()
  const currentYear = today.getFullYear()
  const currentMonth = today.getMonth()

  const start = new Date(currentYear, currentMonth, 1).toISOString()
  const end = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59).toISOString()

  const { data: rawEvents } = await supabase
    .from('events')
    .select('*, event_categories(*)')
    .eq('published', true)
    .gte('start_date', start)
    .lte('start_date', end)
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

  const initialEvents = (rawEvents ?? []).map(ev => {
    const cat = ev.event_categories as Record<string, any> | null
    return {
      id: ev.id,
      title: ev.title,
      titleAr: ev.title_ar,
      titleFr: ev.title_fr,
      category: cat ? { id: cat.id, nameEn: cat.name_en, nameAr: cat.name_ar, nameFr: cat.name_fr, color: cat.color, bg: cat.bg } : null,
      startDate: ev.start_date,
      endDate: ev.end_date,
      location: ev.location,
      locationAr: ev.location_ar,
      locationFr: ev.location_fr,
      description: ev.description,
      descriptionAr: ev.description_ar,
      descriptionFr: ev.description_fr,
      imageUrl: ev.image_url,
    }
  })

  return (
    <div className="min-h-screen bg-feps-paper pb-24">
      <div className="border-b border-feps-border pt-8 pb-16 bg-grid-pattern relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[500px] bg-feps-navy/5 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="container max-w-7xl relative z-10">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-[40px] w-[3px] bg-feps-gold"></div>
            <span className="font-sans text-xs uppercase tracking-[0.2em] font-bold text-feps-navy">
              {t('pageLabel')}
            </span>
          </div>
          <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-normal tracking-tight text-feps-navy leading-tight mb-6">
            {t('pageTitle')}
          </h1>
          <p className="text-lg md:text-xl text-feps-ink-secondary max-w-3xl leading-relaxed font-sans">
            {t('pageDescription')}
          </p>
        </div>
      </div>

      <div className="container max-w-7xl py-12">
        <div className="bg-feps-paper">
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          <EventCalendar initialEvents={initialEvents as any} categories={categories} />
        </div>
      </div>
    </div>
  )
}
