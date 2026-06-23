import React from 'react'
import Link from 'next/link'
import { Calendar, ArrowRight } from 'lucide-react'
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
  const isAr = locale === 'ar'

  return (
    <div className="border-b border-feps-border pt-12 pb-16 bg-grid-pattern relative">
      <div className="container max-w-7xl relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-start">
          
          {/* Main Title Area */}
          <div className="lg:col-span-8">
            <div className="flex items-center gap-4 mb-8">
              <div className="h-[40px] w-[4px] bg-feps-navy"></div>
              <span className="font-sans text-xs uppercase tracking-widest font-bold text-feps-ink">
                {t('directoryOverview')}
              </span>
            </div>
            
            <h1 data-tour="hero-system-name" className="font-serif text-5xl md:text-7xl lg:text-[6rem] font-normal tracking-tight text-feps-navy leading-[1.05] mb-8">
              {t('systemName')}
            </h1>
            
            <p className="text-xl md:text-2xl text-feps-ink-secondary max-w-3xl leading-relaxed font-serif">
              {t('heroSubtitle')}
            </p>
          </div>

          {/* Sidebar / Stats Area */}
          <div className="lg:col-span-4 border-t lg:border-t-0 lg:border-s border-feps-border pt-8 lg:pt-0 lg:ps-8 flex flex-col gap-8">
            
            {/* CTA Button */}
            <Link
              href={`/${locale}/events`}
              className="group relative flex items-center justify-between w-full p-6 bg-feps-navy-dark border-s-4 border-feps-gold text-white hover:bg-feps-navy transition-colors overflow-hidden"
            >
              <div className="flex items-center gap-4 relative z-10">
                <Calendar size={24} className="text-feps-gold" />
                <span className="font-sans text-sm uppercase tracking-widest font-bold">
                  {t('viewCalendar')}
                </span>
              </div>
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center group-hover:scale-110 transition-transform relative z-10">
                <ArrowRight size={16} className={isAr ? 'rotate-180' : ''} />
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-feps-gold/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </Link>

            {/* Stats */}
            <div data-tour="hero-stats" className="grid grid-cols-2 gap-4">
              <div className="p-6 border border-feps-border bg-white shadow-sm">
                <div className="text-4xl font-serif text-feps-navy leading-none mb-3">{stats.upcoming}</div>
                <div className="font-sans text-[0.65rem] uppercase tracking-widest text-feps-ink-secondary font-bold">{t('upcomingSeminars')}</div>
              </div>
              <div className="p-6 border border-feps-border bg-white shadow-sm">
                <div className="text-4xl font-serif text-feps-navy leading-none mb-3">{stats.total}</div>
                <div className="font-sans text-[0.65rem] uppercase tracking-widest text-feps-ink-secondary font-bold">{t('activeRecords')}</div>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  )
}
