import React from 'react'
import { Calendar, Clock, MapPin } from 'lucide-react'

interface EventHeaderProps {
  isAr: boolean
  title: string
  titleAr: string | null
  location: string | null
  formattedStartDate: string
  formattedStartTime: string
  formattedEndTime: string | null
  categoryLabel: string
}

export default function EventHeader({
  isAr,
  title,
  titleAr,
  location,
  formattedStartDate,
  formattedStartTime,
  formattedEndTime,
  categoryLabel
}: EventHeaderProps) {
  return (
    <div className={`mt-8 mb-8 ${isAr ? 'text-right' : 'text-left'}`}>
      {/* Event Type Badge */}
      <div className="mb-4">
        <span className="inline-flex items-center gap-2 border-2 border-feps-navy bg-white text-feps-navy px-4 py-1.5 font-sans text-xs font-bold uppercase tracking-wider">
          <span className="w-2 h-2 bg-feps-navy" />
          {categoryLabel}
        </span>
      </div>

      {/* Event Title */}
      <h1 className={`text-3xl md:text-5xl font-serif font-bold text-feps-navy leading-tight mb-4 ${isAr ? 'font-arabic' : ''}`}>
        {isAr && titleAr ? titleAr : title}
      </h1>

      {/* Secondary Title in English if Arabic is default, or vice versa */}
      {titleAr && !isAr && (
        <p className="font-arabic text-xl md:text-2xl text-feps-navy/80 mt-2 mb-6 font-semibold">
          {titleAr}
        </p>
      )}

      {/* Quick Info Pills */}
      <div className="flex flex-wrap items-center mt-6 border-y-2 border-feps-navy divide-x-2 divide-feps-navy rtl:divide-x-reverse">
        <div className="flex items-center gap-2 font-sans text-sm text-feps-navy font-bold uppercase px-4 py-3">
          <Calendar size={18} />
          <span>{formattedStartDate}</span>
        </div>
        
        <div className="flex items-center gap-2 font-sans text-sm text-feps-navy font-bold uppercase px-4 py-3">
          <Clock size={18} />
          <span>
            {formattedStartTime} {formattedEndTime && `- ${formattedEndTime}`}
          </span>
        </div>

        {location && (
          <div className="flex items-center gap-2 font-sans text-sm text-feps-navy font-bold uppercase px-4 py-3">
            <MapPin size={18} />
            <span>{location}</span>
          </div>
        )}
      </div>
    </div>
  )
}
