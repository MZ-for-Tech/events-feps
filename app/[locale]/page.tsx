import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import Image from 'next/image'
import { getTranslations, getLocale } from 'next-intl/server'
import { ArrowRight, Activity, Calendar, MapPin } from 'lucide-react'
import EventRow from '@/components/EventRow'

async function getStats() {
  const now = new Date()
  const [upcoming, total] = await Promise.all([
    prisma.event.count({
      where: { published: true, startDate: { gte: now } }
    }),
    prisma.event.count({
      where: { published: true }
    }),
  ])
  return { upcoming, total }
}

async function getUpcomingEvents() {
  return prisma.event.findMany({
    where: { published: true, startDate: { gte: new Date() } },
    orderBy: { startDate: 'asc' },
    take: 5,
  })
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations('Home')
  const [upcomingEvents, stats] = await Promise.all([
    getUpcomingEvents(),
    getStats(),
  ])

  return (
    <div className="bg-feps-paper min-h-screen relative overflow-hidden">

      {/* Editorial Hero Header */}
      <div className="border-b border-feps-border pt-8 pb-16">
        <div className="container max-w-5xl">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-[40px] w-[3px] bg-feps-gold"></div>
            <span className="font-mono text-xs uppercase tracking-widest font-semibold text-feps-ink-secondary">
              {t('directoryOverview')}
            </span>
          </div>
          <h1 className="font-serif text-5xl md:text-7xl lg:text-[5.5rem] font-normal tracking-tight text-feps-ink leading-[1.05] mb-8">
            {t('systemName')}
          </h1>
          <p className="text-xl text-feps-ink-secondary max-w-3xl leading-relaxed mb-10">
            {t('heroSubtitle')}
          </p>
          
          <div className="flex flex-wrap items-center gap-6">
            <Link
              href={`/${locale}/events`}
              className="inline-flex items-center gap-3 px-8 py-4 bg-feps-navy text-white font-mono text-sm uppercase tracking-widest font-bold hover:bg-feps-gold hover:text-feps-navy transition-colors"
            >
              <Calendar size={18} />
              {t('viewCalendar')}
            </Link>

            <div className="flex gap-8 border-t sm:border-t-0 sm:border-l border-feps-border pt-4 sm:pt-0 sm:pl-8 w-full sm:w-auto">
              <div>
                <div className="text-3xl font-serif text-feps-ink leading-none mb-2">{stats.upcoming}</div>
                <div className="font-mono text-[0.65rem] uppercase tracking-widest text-feps-ink-secondary">{t('upcomingSeminars')}</div>
              </div>
              <div>
                <div className="text-3xl font-serif text-feps-ink leading-none mb-2">{stats.total}</div>
                <div className="font-mono text-[0.65rem] uppercase tracking-widest text-feps-ink-secondary">{t('activeRecords')}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Directory Layout - Events Feed */}
      <div className="container max-w-5xl py-12 md:py-16 relative z-10">
        <div className="flex justify-between items-end mb-8 pb-4 border-b border-feps-border">
          <div>
            <h2 className="font-serif text-3xl font-normal text-feps-ink mb-2">{t('upcomingEntries')}</h2>
            <p className="font-mono text-xs uppercase tracking-widest text-feps-ink-secondary">{t('latestActivities')}</p>
          </div>
          <Link href={`/${locale}/events`} className="group hidden sm:flex items-center gap-2 font-mono text-xs uppercase tracking-widest font-bold text-feps-navy hover:text-feps-gold transition-colors">
            {t('seeAll')} <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {upcomingEvents.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {upcomingEvents.map(event => (
              <EventRow
                key={event.id}
                id={event.id}
                title={event.title}
                titleAr={event.titleAr}
                type={event.type as any}
                startDate={event.startDate}
                endDate={event.endDate}
                location={event.location}
                description={event.description}
                locale={locale}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-feps-paper border border-feps-border">
            <Calendar className="mx-auto text-feps-border mb-4" size={48} />
            <h3 className="text-xl font-serif text-feps-ink mb-2">{t('noEvents')}</h3>
            <p className="font-mono text-xs uppercase tracking-widest text-feps-ink-secondary">{t('noEventsHint')}</p>
          </div>
        )}
        
        <Link href={`/${locale}/events`} className="group sm:hidden mt-8 flex justify-center items-center gap-2 font-mono text-xs uppercase tracking-widest font-bold text-feps-navy hover:text-feps-gold border border-feps-border py-4 transition-colors w-full">
          {t('seeAll')} <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  )
}
