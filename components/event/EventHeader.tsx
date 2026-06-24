import React from 'react'
import { Calendar, Clock, MapPin } from 'lucide-react'
import InlineEdit from '../admin/InlineEdit'

interface EventHeaderProps {
  isAr: boolean
  isFr: boolean
  title: string
  titleAr: string | null
  titleFr: string | null
  location: string | null
  locationAr?: string | null
  locationFr?: string | null
  formattedStartDate: string
  formattedStartTime: string
  formattedEndTime: string | null
  categoryLabel: string
  isAdmin?: boolean
  eventId?: string
  categoryId?: string
  categories?: { label: string; value: string }[]
  rawStartDate?: string | null
  rawEndDate?: string | null
}

export default function EventHeader({
  isAr,
  isFr,
  title,
  titleAr,
  titleFr,
  location,
  locationAr,
  locationFr,
  formattedStartDate,
  formattedStartTime,
  formattedEndTime,
  categoryLabel,
  isAdmin,
  eventId,
  categoryId,
  categories,
  rawStartDate,
  rawEndDate
}: EventHeaderProps) {
  const localizedLocation = isAr && locationAr ? locationAr : (isFr && locationFr ? locationFr : location)
  const locationFieldName = isAr ? 'locationAr' : (isFr ? 'locationFr' : 'location')

  return (
    <div className={`mt-4 mb-12 ${isAr ? 'text-right' : 'text-left'}`}>
      {/* Event Title - Massive Editorial Headline */}
      <h1 className={`text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-serif font-bold text-feps-ink leading-[1.1] tracking-tight mb-4 ${isAr ? 'font-arabic' : ''}`}>
        <InlineEdit 
          field={isAr ? 'titleAr' : isFr ? 'titleFr' : 'title'} 
          value={(isAr && titleAr ? titleAr : isFr && titleFr ? titleFr : title) || ''} 
          eventId={eventId!} 
          isAdmin={!!isAdmin} 
          type="text"
        >
          {isAr && titleAr ? titleAr : isFr && titleFr ? titleFr : title}
        </InlineEdit>
      </h1>

      {/* Secondary Title */}
      {(titleAr || isAdmin) && !isAr && (
        <div className="font-arabic text-2xl md:text-3xl text-feps-ink-secondary mt-2 mb-8 font-semibold">
          <InlineEdit field="titleAr" value={titleAr || ''} eventId={eventId!} isAdmin={!!isAdmin} type="text">
            {titleAr || 'إضافة عنوان بالعربية'}
          </InlineEdit>
        </div>
      )}

      {/* Editorial Byline / Metadata Block */}
      <div className="flex flex-wrap items-center mt-8 border-y-2 border-feps-ink divide-x-2 divide-feps-ink rtl:divide-x-reverse bg-feps-surface-alt">
        {/* Category Label */}
        <div className="flex items-center gap-2 font-sans text-xs md:text-sm text-feps-ink font-bold uppercase tracking-widest px-4 md:px-6 py-4">
          <span className="w-2 h-2 bg-feps-ink flex-shrink-0" />
          <InlineEdit field="categoryId" value={categoryId || ''} eventId={eventId!} isAdmin={!!isAdmin} type="select" options={categories}>
            <span>{categoryLabel}</span>
          </InlineEdit>
        </div>
        
        <div className="flex items-center gap-2 font-sans text-xs md:text-sm text-feps-ink font-bold uppercase tracking-widest px-4 md:px-6 py-4">
          <Calendar size={16} className="text-feps-ink-secondary flex-shrink-0" />
          <InlineEdit field="startDate" value={rawStartDate || ''} eventId={eventId!} isAdmin={!!isAdmin} type="datetime-local">
            <span>{formattedStartDate}</span>
          </InlineEdit>
        </div>
        
        <div className="flex items-center gap-2 font-sans text-xs md:text-sm text-feps-ink font-bold uppercase tracking-widest px-4 md:px-6 py-4">
          <Clock size={16} className="text-feps-ink-secondary flex-shrink-0" />
          <InlineEdit field="endDate" value={rawEndDate || ''} eventId={eventId!} isAdmin={!!isAdmin} type="datetime-local">
            <span>
              {formattedStartTime} {formattedEndTime && `- ${formattedEndTime}`}
            </span>
          </InlineEdit>
        </div>

        {(localizedLocation || isAdmin) && (
          <div className="flex items-center gap-2 font-sans text-xs md:text-sm text-feps-ink font-bold uppercase tracking-widest px-4 md:px-6 py-4">
            <MapPin size={16} className="text-feps-ink-secondary flex-shrink-0" />
            <InlineEdit field={locationFieldName} value={localizedLocation || ''} eventId={eventId!} isAdmin={!!isAdmin} type="text">
              <span>{localizedLocation || (isAr ? 'إضافة مكان' : 'Add Location')}</span>
            </InlineEdit>
          </div>
        )}
      </div>
    </div>
  )
}
