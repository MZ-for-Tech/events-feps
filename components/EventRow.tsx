import React from 'react'
import Link from 'next/link'
import { MapPin, Clock, ArrowRight } from 'lucide-react'
import { EventCategoryData } from './EventCard'

export interface EventRowProps {
  id: string
  title: string
  titleAr?: string | null
  titleFr?: string | null
  category: EventCategoryData
  startDate: string | Date
  endDate?: string | Date | null
  location?: string | null
  locationAr?: string | null
  locationFr?: string | null
  description?: string | null
  locale?: string
  index?: number
}

export default function EventRow({
  id,
  title,
  titleAr,
  titleFr,
  category,
  startDate,
  location,
  locationAr,
  locationFr,
  locale = 'en',
  index = 0,
}: EventRowProps) {
  const start = new Date(startDate)
  const isAr = locale === 'ar'
  const categoryLabel = locale === 'ar' ? category.nameAr : locale === 'fr' ? category.nameFr : category.nameEn
  const localizedLocation = isAr && locationAr ? locationAr : (locale === 'fr' && locationFr ? locationFr : location)

  const month = start.toLocaleDateString(isAr ? 'ar-EG-u-nu-latn' : locale === 'fr' ? 'fr-FR' : 'en-US', { month: 'short' })
  const day = start.toLocaleDateString(isAr ? 'ar-EG-u-nu-latn' : locale === 'fr' ? 'fr-FR' : 'en-US', { day: '2-digit' })
  const year = start.getFullYear()

  const formattedTime = start.toLocaleTimeString(isAr ? 'ar-EG-u-nu-latn' : locale === 'fr' ? 'fr-FR' : 'en-US', {
    hour: '2-digit',
    minute: '2-digit',
  })

  // Calculate animation delay based on index (cap at 5 items for the delay classes we have)
  const delayClass = `delay-${Math.min((index + 1) * 100, 500)}`

  return (
    <Link
      href={`/${locale}/events/${id}`}
      className={`group block relative p-4 sm:p-6 bg-white/60 backdrop-blur-sm border border-feps-border/50 hover:bg-white hover:border-feps-gold/30 hover:shadow-academic hover:-translate-y-[2px] transition-all duration-500 fade-in-up ${delayClass}`}
    >
      <div className="flex flex-col sm:flex-row w-full gap-5 sm:gap-8 items-start sm:items-center">
        
        {/* Stark Editorial Date Box */}
        <div className="flex-shrink-0 w-24 h-24 flex flex-col items-center justify-center p-3 border border-feps-border/60 bg-feps-paper shadow-sm group-hover:border-feps-gold/50 group-hover:shadow-md transition-all duration-500 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-feps-navy/10 group-hover:bg-feps-gold transition-colors duration-500"></div>
          <div className="font-sans text-[0.6rem] uppercase tracking-[0.2em] text-feps-ink-secondary mb-1 font-bold">
            {month} {year}
          </div>
          <div className="font-serif text-4xl text-feps-navy leading-none tracking-tight group-hover:scale-105 transition-transform duration-500">
            {day}
          </div>
        </div>

        {/* Title & Metadata */}
        <div className="flex-grow flex flex-col justify-center">
          <div className="flex flex-wrap items-center gap-3 mb-3">
            <span className="font-sans text-[0.6rem] uppercase tracking-[0.15em] font-bold text-feps-navy bg-feps-gold/10 px-2.5 py-1 rounded-[2px] border border-feps-gold/20 group-hover:border-feps-gold/40 group-hover:bg-feps-gold/15 transition-colors duration-300">
              {categoryLabel}
            </span>
            <div className="w-[4px] h-[4px] bg-feps-border rounded-full group-hover:bg-feps-navy/20 transition-colors duration-300"></div>
            <div className="font-sans text-[0.65rem] uppercase tracking-[0.15em] text-feps-ink-secondary flex items-center gap-1.5 font-semibold">
              <Clock size={12} className="text-feps-gold/70" />
              {formattedTime}
            </div>
            {localizedLocation && (
              <>
                <div className="w-[4px] h-[4px] bg-feps-border rounded-full group-hover:bg-feps-navy/20 transition-colors duration-300"></div>
                <div className="font-sans text-[0.65rem] uppercase tracking-[0.15em] text-feps-ink-secondary flex items-center gap-1.5 font-semibold">
                  <MapPin size={12} className="text-feps-gold/70" />
                  <span className="line-clamp-1">{localizedLocation}</span>
                </div>
              </>
            )}
          </div>
          
          <h4 className="font-serif text-2xl md:text-[1.7rem] leading-snug text-feps-ink group-hover:text-feps-navy transition-colors duration-300">
            {isAr && titleAr ? titleAr : (locale === 'fr' && titleFr ? titleFr : title)}
          </h4>
        </div>

        {/* Action Arrow */}
        <div className={`flex items-center flex-shrink-0 mt-4 sm:mt-0 transition-transform duration-500 ${isAr ? 'group-hover:-translate-x-3' : 'group-hover:translate-x-3'}`}>
          <div className="w-10 h-10 rounded-full border border-transparent group-hover:border-feps-navy/10 flex items-center justify-center bg-transparent group-hover:bg-feps-navy/5 transition-all duration-500">
            <ArrowRight size={20} className={`text-feps-ink opacity-30 group-hover:opacity-100 group-hover:text-feps-navy transition-all duration-500 ${isAr ? "rotate-180" : ""}`} />
          </div>
        </div>
      </div>
    </Link>
  )
}

