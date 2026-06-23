import React from 'react'
import Link from 'next/link'
import { MapPin, Clock } from 'lucide-react'

export interface EventCategoryData {
  id: string
  nameEn: string
  nameAr: string
  nameFr: string
  color: string
  bg: string
}

export interface EventCardProps {
  id: string
  title: string
  titleAr?: string | null
  category: EventCategoryData
  startDate: string | Date
  location?: string | null
  description?: string | null
  imageUrl?: string | null
  locale?: string
}

export default function EventCard({
  id,
  title,
  titleAr,
  category,
  startDate,
  location,
  description,
  imageUrl,
  locale = 'en',
}: EventCardProps) {
  const start = new Date(startDate)
  const isAr = locale === 'ar'
  const categoryLabel = locale === 'ar' ? category.nameAr : locale === 'fr' ? category.nameFr : category.nameEn

  const formattedDate = start.toLocaleDateString(isAr ? 'ar-EG-u-nu-latn' : 'en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })

  const formattedTime = start.toLocaleTimeString(isAr ? 'ar-EG-u-nu-latn' : 'en-US', {
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <Link
      href={`/${locale}/events/${id}`}
      className="group flex flex-col bg-feps-paper border border-feps-border relative overflow-hidden transition-colors hover:bg-feps-surface h-full"
    >
      {/* Spine Effect */}
      <div 
        className="absolute start-0 top-0 bottom-0 w-[3px] z-10"
        style={{ backgroundColor: category.color }}
      />
      
      {/* Image (Editorial B&W treatment) */}
      {imageUrl && (
        <div className="h-48 w-full relative border-b border-feps-border bg-feps-surface-alt">
          <div 
            className="absolute inset-0 bg-cover bg-center grayscale opacity-90 mix-blend-multiply transition-all group-hover:grayscale-0 group-hover:opacity-100" 
            style={{ backgroundImage: `url(${imageUrl})` }} 
          />
        </div>
      )}

      {/* Content */}
      <div className="p-6 flex flex-col h-full pl-8">
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-feps-border">
          <span 
            className="font-sans text-xs uppercase tracking-widest font-semibold"
            style={{ color: category.color }}
          >
            {categoryLabel}
          </span>
          <span className="font-sans text-xs text-feps-ink-tertiary">
            {formattedDate}
          </span>
        </div>
        
        <h4 className="font-serif text-2xl leading-tight text-feps-ink mb-3 group-hover:text-feps-navy transition-colors">
          {isAr && titleAr ? titleAr : title}
        </h4>
        
        {titleAr && !isAr && (
           <p className="arabic text-sm text-feps-ink-secondary mb-3">{titleAr}</p>
        )}
        
        {description && (
          <p className="text-sm text-feps-ink-secondary line-clamp-3 mb-6 leading-relaxed">
            {description}
          </p>
        )}
        
        <div className="mt-auto flex flex-col gap-2 pt-4">
          <div className="flex items-center gap-2 text-xs text-feps-ink-secondary font-sans">
            <Clock size={14} className="opacity-50" />
            <span>{formattedTime}</span>
          </div>
          {location && (
            <div className="flex items-center gap-2 text-xs text-feps-ink-secondary font-sans">
              <MapPin size={14} className="opacity-50" />
              <span className="truncate">{location}</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}
