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
    <div className="bg-feps-gradient border-b border-feps-border relative">
      <div className="container max-w-7xl pt-32 pb-20 md:pt-40 md:pb-28 relative z-10">

        <div data-tour="events-feed" className="flex justify-between items-end mb-16 pb-6 border-b border-feps-border relative fade-in-up delay-300">
          {/* Subtle gold accent line below the header */}
          <div className="absolute bottom-0 left-0 w-32 h-[2px] bg-feps-gold"></div>

          <div className="flex items-center gap-6">
            <div className="hidden sm:flex items-center justify-center">
              <Calendar size={36} strokeWidth={1.5} className="text-feps-navy/80" />
            </div>
            <div className="pt-2">
              <h2 className="font-serif text-4xl md:text-5xl font-normal text-feps-navy mb-2 leading-normal md:leading-relaxed">{t('upcomingEntries')}</h2>
              <p className="font-sans text-xs uppercase tracking-[0.2em] text-feps-ink-tertiary font-bold">{t('latestActivities')}</p>
            </div>
          </div>
          <Link href={`/${locale}/events`} className="group hidden sm:flex items-center gap-3 font-sans text-xs uppercase tracking-[0.15em] font-bold text-feps-navy hover:text-feps-gold transition-colors pb-2">
            {t('seeAll')} <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform duration-300" />
          </Link>
        </div>

        {upcomingEvents.length > 0 ? (
          <div className="grid grid-cols-1 gap-2 fade-in-up delay-400">
            {upcomingEvents.map((event, index) => (
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
                index={index}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-24 bg-white/50 backdrop-blur-sm border border-feps-border fade-in-up delay-400">
            <Calendar className="mx-auto text-feps-border mb-6" size={56} strokeWidth={1} />
            <h3 className="text-2xl font-serif text-feps-ink mb-3">{t('noEvents')}</h3>
            <p className="font-sans text-xs uppercase tracking-[0.15em] text-feps-ink-secondary">{t('noEventsHint')}</p>
          </div>
        )}

        <Link href={`/${locale}/events`} className="group sm:hidden mt-10 flex justify-center items-center gap-2 font-sans text-xs uppercase tracking-[0.15em] font-bold text-feps-navy hover:text-feps-gold border border-feps-border bg-white shadow-sm hover:shadow-md py-4 transition-all w-full fade-in-up delay-500">
          {t('seeAll')} <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform duration-300" />
        </Link>
      </div>
    </div>
  )
}
