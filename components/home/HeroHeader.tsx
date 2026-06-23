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
    <div className="border-b border-feps-border pt-6 pb-20 bg-grid-pattern relative overflow-hidden">
      {/* Subtle light bloom for depth */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[500px] bg-feps-navy/5 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="container max-w-7xl relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 items-center">
          
          {/* Main Title Area */}
          <div className="lg:col-span-8 fade-in-up">
            <div className="flex items-center gap-4 mb-8">
              <div className="h-[40px] w-[3px] bg-feps-gold"></div>
              <span className="font-sans text-xs uppercase tracking-[0.2em] font-bold text-feps-navy">
                {t('directoryOverview')}
              </span>
            </div>
            
            <h1 data-tour="hero-system-name" className={`font-serif text-5xl md:text-7xl lg:text-[6.5rem] font-normal text-feps-navy leading-[1.05] mb-8 ${isAr ? 'tracking-normal' : 'tracking-[-0.03em]'}`}>
              {t('systemName')}
            </h1>
            
            <p className="text-xl md:text-2xl text-feps-ink-secondary max-w-3xl leading-relaxed font-serif">
              {t('heroSubtitle')}
            </p>
          </div>

          {/* Sidebar / Stats Area */}
          <div className="lg:col-span-4 lg:ps-8 flex flex-col gap-8 fade-in-up delay-200 relative">
            {/* Elegant divider line for desktop */}
            <div className="hidden lg:block absolute left-0 top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-feps-border to-transparent"></div>
            
            {/* CTA Button */}
            <Link
              href={`/${locale}/events`}
              className="group flex items-center justify-between w-full p-6 bg-feps-navy border-s-4 border-feps-gold text-white hover:bg-feps-navy-dark transition-colors shadow-sm"
            >
              <div className="flex items-center gap-4">
                <Calendar size={24} className="text-feps-gold" />
                <span className="font-sans text-sm uppercase tracking-widest font-bold">
                  {t('viewCalendar')}
                </span>
              </div>
              <ArrowRight size={20} className={`text-white/70 group-hover:text-white transition-colors ${isAr ? 'rotate-180' : ''}`} />
            </Link>

            {/* Stats */}
            <div data-tour="hero-stats" className="grid grid-cols-2 gap-5">
              <div className="p-6 border border-feps-border bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
                <div className="text-4xl md:text-5xl font-serif text-feps-navy leading-none mb-3">{stats.upcoming}</div>
                <div className="font-sans text-[0.65rem] uppercase tracking-[0.15em] text-feps-ink-tertiary font-bold">{t('upcomingSeminars')}</div>
              </div>
              <div className="p-6 border border-feps-border bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
                <div className="text-4xl md:text-5xl font-serif text-feps-navy leading-none mb-3">{stats.total}</div>
                <div className="font-sans text-[0.65rem] uppercase tracking-[0.15em] text-feps-ink-tertiary font-bold">{t('activeRecords')}</div>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  )
}
