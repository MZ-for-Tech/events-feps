import { prisma } from '@/lib/prisma'
import EventCalendar from '@/components/EventCalendar'
import { getTranslations } from 'next-intl/server'

interface PageProps {
  params: Promise<{ locale: string }>
}

export default async function EventsPage({ params }: PageProps) {
  const { locale } = await params

  const t = await getTranslations({ locale, namespace: 'EventsPage' })
  // Fetch initial events for current month
  const today = new Date()
  const currentYear = today.getFullYear()
  const currentMonth = today.getMonth() // 0-indexed

  const start = new Date(currentYear, currentMonth, 1)
  const end = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59)

  const rawEvents = await prisma.event.findMany({
    where: {
      published: true,
      startDate: {
        gte: start,
        lte: end,
      },
    },
    include: { category: true },
    orderBy: { startDate: 'asc' },
  })

  const categories = await prisma.eventCategory.findMany({
    orderBy: { nameEn: 'asc' }
  })

  // Format dates to string for serialization across Server Component boundary
  const initialEvents = rawEvents.map(ev => ({
    id: ev.id,
    title: ev.title,
    titleAr: ev.titleAr,
    category: ev.category,
    startDate: ev.startDate.toISOString(),
    endDate: ev.endDate ? ev.endDate.toISOString() : null,
    location: ev.location,
    description: ev.description,
    imageUrl: ev.imageUrl,
  }))

  return (
    <div className="min-h-screen bg-feps-paper pb-24">
      {/* Editorial Header */}
      <div className="border-b border-feps-border pt-8 pb-16 bg-grid-pattern relative overflow-hidden">
        {/* Subtle light bloom for depth */}
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

      {/* Main Content (Calendar Wrapper) */}
      <div className="container max-w-7xl py-12">
        <div className="bg-feps-paper">
          <EventCalendar initialEvents={initialEvents} categories={categories} />
        </div>
      </div>
    </div>
  )
}
