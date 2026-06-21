import React from 'react'
import Link from 'next/link'
import { ArrowRight, Calendar } from 'lucide-react'
import { useTranslations } from 'next-intl'
import EventRow from '@/components/EventRow'
import type { Event } from '@prisma/client'
import type { EventCategoryData } from '@/components/EventCard'

interface EventsFeedProps {
  locale: string
  upcomingEvents: (Event & { category: EventCategoryData })[]
}

export default function EventsFeed({ locale, upcomingEvents }: EventsFeedProps) {
  const t = useTranslations('Home')

  return (
    <div className="container max-w-7xl py-16 md:py-24 relative z-10">
      <div data-tour="events-feed" className="flex justify-between items-end mb-12 pb-6 border-b-2 border-feps-navy">
        <div className="flex items-center gap-6">
          <div className="hidden sm:flex w-16 h-16 bg-feps-paper border border-feps-border items-center justify-center">
            <Calendar size={28} strokeWidth={1.5} className="text-feps-navy" />
          </div>
          <div>
            <h2 className="font-serif text-3xl md:text-4xl font-normal text-feps-navy mb-2">{t('upcomingEntries')}</h2>
            <p className="font-mono text-xs uppercase tracking-widest text-feps-ink-secondary font-bold">{t('latestActivities')}</p>
          </div>
        </div>
        <Link href={`/${locale}/events`} className="group hidden sm:flex items-center gap-3 font-mono text-xs uppercase tracking-widest font-bold text-feps-navy hover:text-feps-gold transition-colors pb-2">
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
              category={event.category}
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
  )
}
