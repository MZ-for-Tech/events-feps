import React from 'react'
import Link from 'next/link'
import { Calendar } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface HeroHeaderProps {
  locale: string
  stats: {
    upcoming: number
    total: number
  }
}

export default function HeroHeader({ locale, stats }: HeroHeaderProps) {
  const t = useTranslations('Home')

  return (
    <div className="border-b border-feps-border pt-8 pb-16">
      <div className="container max-w-5xl">
        <div className="flex items-center gap-4 mb-6">
          <div className="h-[40px] w-[3px] bg-feps-gold"></div>
          <span className="font-mono text-xs uppercase tracking-widest font-semibold text-feps-ink-secondary">
            {t('directoryOverview')}
          </span>
        </div>
        <h1 data-tour="hero-system-name" className="font-serif text-5xl md:text-7xl lg:text-[5.5rem] font-normal tracking-tight text-feps-ink leading-[1.05] mb-8">
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

          <div data-tour="hero-stats" className="flex gap-8 border-t sm:border-t-0 sm:border-l border-feps-border pt-4 sm:pt-0 sm:pl-8 w-full sm:w-auto">
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
  )
}
