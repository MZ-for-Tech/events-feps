import React from 'react'
import Link from 'next/link'
import { MapPin, Clock, ArrowRight } from 'lucide-react'
import { EventCategoryData } from './EventCard'

export interface EventRowProps {
  id: string
  title: string
  titleAr?: string | null
  category: EventCategoryData
  startDate: string | Date
  endDate?: string | Date | null
  location?: string | null
  description?: string | null
  locale?: string
}

export default function EventRow({
  id,
  title,
  titleAr,
  category,
  startDate,
  location,
  locale = 'en',
}: EventRowProps) {
  const start = new Date(startDate)
  const isAr = locale === 'ar'
  const categoryLabel = locale === 'ar' ? category.nameAr : locale === 'fr' ? category.nameFr : category.nameEn

  const month = start.toLocaleDateString(isAr ? 'ar-EG' : 'en-US', { month: 'short' })
  const day = start.toLocaleDateString(isAr ? 'ar-EG' : 'en-US', { day: '2-digit' })
  const year = start.getFullYear()

  const formattedTime = start.toLocaleTimeString(isAr ? 'ar-EG' : 'en-US', {
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <Link
      href={`/${locale}/events/${id}`}
      className="group block relative py-6 border-b border-feps-border hover:bg-white transition-colors"
    >
      <div className="flex flex-col sm:flex-row w-full gap-6 sm:gap-10 items-start sm:items-center">
        
        {/* Stark Editorial Date Box */}
        <div className="flex-shrink-0 w-24 flex flex-col items-center justify-center p-3 border border-feps-border bg-feps-paper shadow-sm group-hover:border-feps-navy transition-colors">
          <div className="font-mono text-[0.65rem] uppercase tracking-widest text-feps-ink-secondary mb-1 font-bold">
            {month} {year}
          </div>
          <div className="font-serif text-4xl text-feps-navy leading-none">
            {day}
          </div>
        </div>

        {/* Title & Metadata */}
        <div className="flex-grow flex flex-col justify-center">
          <div className="flex flex-wrap items-center gap-3 mb-3">
            <span className="font-mono text-[0.65rem] uppercase tracking-widest font-bold text-feps-navy bg-feps-gold/10 px-2 py-1 rounded-sm border border-feps-gold/30">
              {categoryLabel}
            </span>
            <div className="w-[3px] h-[3px] bg-feps-border rounded-full"></div>
            <div className="font-mono text-[0.65rem] uppercase tracking-widest text-feps-ink-secondary flex items-center gap-1.5">
              <Clock size={12} />
              {formattedTime}
            </div>
            {location && (
              <>
                <div className="w-[3px] h-[3px] bg-feps-border rounded-full"></div>
                <div className="font-mono text-[0.65rem] uppercase tracking-widest text-feps-ink-secondary flex items-center gap-1.5">
                  <MapPin size={12} />
                  <span className="line-clamp-1">{location}</span>
                </div>
              </>
            )}
          </div>
          
          <h4 className="font-serif text-2xl md:text-3xl leading-snug text-feps-ink group-hover:text-feps-navy transition-colors">
            {isAr && titleAr ? titleAr : title}
          </h4>
        </div>

        {/* Action Arrow */}
        <div className={`flex items-center flex-shrink-0 mt-4 sm:mt-0 transition-transform duration-300 ${isAr ? 'group-hover:-translate-x-2' : 'group-hover:translate-x-2'}`}>
          <ArrowRight size={24} className={`text-feps-ink opacity-40 group-hover:opacity-100 transition-opacity ${isAr ? "rotate-180" : ""}`} />
        </div>
      </div>
    </Link>
  )
}
