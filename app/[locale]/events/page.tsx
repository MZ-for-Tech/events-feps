import { prisma } from '@/lib/prisma'
import EventCalendar from '@/components/EventCalendar'
import { Calendar, ShieldAlert } from 'lucide-react'
import { auth } from '@/lib/auth'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'

interface PageProps {
  params: Promise<{ locale: string }>
}

export default async function EventsPage({ params }: PageProps) {
  const { locale } = await params
  const isAr = locale === 'ar'
  const t = await getTranslations({ locale, namespace: 'EventsPage' })
  const session = await auth()
  const isAdmin = !!session?.user

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
      <div className="border-b border-feps-border pt-8 pb-6">
        <div className="container max-w-5xl">
          <div className="flex items-center gap-4 mb-4">
            <div className="h-[40px] w-[3px] bg-feps-ink"></div>
            <span className="font-mono text-xs uppercase tracking-widest font-semibold text-feps-ink-secondary">
              {t('pageLabel')}
            </span>
          </div>
          <h1 className="font-serif text-5xl md:text-6xl font-normal tracking-tight text-feps-ink leading-[1.1] mb-4">
            {t('pageTitle')}
          </h1>
          <p className="text-lg text-feps-ink-secondary max-w-2xl leading-relaxed mb-4">
            {t('pageDescription')}
          </p>
          
          {isAdmin && (
            <Link
              href={`/admin/events`}
              className="inline-flex items-center gap-2 px-6 py-3 bg-feps-ink text-feps-paper font-mono text-xs uppercase tracking-widest font-semibold hover:bg-feps-navy transition-colors"
            >
              <ShieldAlert size={16} />
              {t('manageEvents')}
            </Link>
          )}
        </div>
      </div>

      {/* Main Content (Calendar Wrapper) */}
      <div className="container max-w-5xl py-6">
        <div className="bg-feps-surface border border-feps-border p-8">
          <EventCalendar initialEvents={initialEvents} categories={categories} />
        </div>
      </div>
    </div>
  )
}
