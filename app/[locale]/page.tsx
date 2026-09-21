import { supabase } from '@/lib/supabase'
import { getTranslations } from 'next-intl/server'
import HeroHeader from '@/components/home/HeroHeader'
import EventsFeed from '@/components/home/EventsFeed'
import FepsTrivia from '@/components/home/FepsTrivia'

async function getStats() {
  const now = new Date().toISOString()
  
  const [{ count: upcoming }, { count: total }] = await Promise.all([
    supabase
      .from('events')
      .select('*', { count: 'exact', head: true })
      .eq('published', true)
      .gte('start_date', now),
    supabase
      .from('events')
      .select('*', { count: 'exact', head: true })
      .eq('published', true),
  ])
  
  return { upcoming: upcoming ?? 0, total: total ?? 0 }
}

async function getUpcomingEvents() {
  const now = new Date().toISOString()
  const { data: rawEvents } = await supabase
    .from('events')
    .select('*, event_categories(*)')
    .eq('published', true)
    .gte('start_date', now)
    .order('start_date', { ascending: true })
    .limit(5)
    
  return (rawEvents ?? []).map(ev => {
    const cat = ev.event_categories as Record<string, any> | null
    return {
      id: ev.id,
      title: ev.title,
      titleAr: ev.title_ar,
      titleFr: ev.title_fr,
      startDate: ev.start_date,
      endDate: ev.end_date,
      location: ev.location,
      locationAr: ev.location_ar,
      locationFr: ev.location_fr,
      imageUrl: ev.image_url,
      published: ev.published,
      status: ev.status,
      category: cat ? {
        id: cat.id,
        nameEn: cat.name_en,
        nameAr: cat.name_ar,
        nameFr: cat.name_fr,
        color: cat.color,
        bg: cat.bg
      } : null
    }
  })
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  
  await getTranslations('Home')
  
  const [upcomingEvents, stats] = await Promise.all([
    getUpcomingEvents(),
    getStats(),
  ])

  return (
    <div className="bg-feps-paper min-h-screen relative overflow-hidden">
      <HeroHeader locale={locale} stats={stats} />
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <EventsFeed locale={locale} upcomingEvents={upcomingEvents as any} />
      <FepsTrivia />
    </div>
  )
}
