import React from 'react'
import Link from 'next/link'
import { MapPin, Clock, Calendar, ChevronRight } from 'lucide-react'

export type EventType =
  | 'CULTURAL'
  | 'SCIENTIFIC'
  | 'LITERARY'
  | 'HONORS'
  | 'GRADUATION_PROJECT'
  | 'VISIT'
  | 'SEMINAR'
  | 'WORKSHOP'
  | 'PRACTICAL_TRAINING'
  | 'EXHIBITION'
  | 'CONFERENCE'

export interface EventCardProps {
  id: string
  title: string
  titleAr?: string | null
  type: EventType
  startDate: string | Date
  endDate?: string | Date | null
  location?: string | null
  description?: string | null
  imageUrl?: string | null
  locale?: string
}

export const EVENT_TYPE_META: Record<EventType, { label: string; labelAr: string; labelFr: string; color: string; bg: string }> = {
  CULTURAL:           { label: 'Cultural',           labelAr: 'ثقافي',           labelFr: 'Culturel',             color: '#7C3AED', bg: 'rgba(124,58,237,0.12)' },
  SCIENTIFIC:         { label: 'Scientific',         labelAr: 'علمي',            labelFr: 'Scientifique',          color: '#0EA5E9', bg: 'rgba(14,165,233,0.12)' },
  LITERARY:           { label: 'Literary',           labelAr: 'أدبي',            labelFr: 'Littéraire',            color: '#D97706', bg: 'rgba(217,119,6,0.12)'  },
  HONORS:             { label: 'Honors',             labelAr: 'تكريم',           labelFr: 'Distinctions',          color: '#F5A800', bg: 'rgba(245,168,0,0.12)'  },
  GRADUATION_PROJECT: { label: 'Graduation Project', labelAr: 'مشروع تخرج',     labelFr: 'Projet de Fin d’Études', color: '#1A3A6E', bg: 'rgba(26,58,110,0.12)' },
  VISIT:              { label: 'Campus Visit',       labelAr: 'زيارة',           labelFr: 'Visite de Campus',      color: '#059669', bg: 'rgba(5,150,105,0.12)'  },
  SEMINAR:            { label: 'Seminar',            labelAr: 'ندوة',            labelFr: 'Séminaire',             color: '#DC2626', bg: 'rgba(220,38,38,0.12)'  },
  WORKSHOP:           { label: 'Workshop',           labelAr: 'ورشة عمل',        labelFr: 'Atelier',               color: '#EA580C', bg: 'rgba(234,88,12,0.12)'  },
  PRACTICAL_TRAINING: { label: 'Practical Training', labelAr: 'تدريب عملي',      labelFr: 'Formation Pratique',     color: '#0D9488', bg: 'rgba(13,148,136,0.12)' },
  EXHIBITION:         { label: 'Exhibition',         labelAr: 'معرض',            labelFr: 'Exposition',            color: '#DB2777', bg: 'rgba(219,39,119,0.12)'  },
  CONFERENCE:         { label: 'Conference',         labelAr: 'مؤتمر',           labelFr: 'Conférence',            color: '#6366F1', bg: 'rgba(99,102,241,0.12)'  },
}

export default function EventCard({
  id,
  title,
  titleAr,
  type,
  startDate,
  endDate,
  location,
  description,
  imageUrl,
  locale = 'en',
}: EventCardProps) {
  const meta = EVENT_TYPE_META[type] || { label: type, labelAr: type, labelFr: type, color: 'var(--feps-navy)', bg: 'rgba(26,58,110,0.12)' }
  const start = new Date(startDate)
  const isAr = locale === 'ar'
  const categoryLabel = locale === 'ar' ? meta.labelAr : locale === 'fr' ? meta.labelFr : meta.label

  const formattedDate = start.toLocaleDateString(isAr ? 'ar-EG' : 'en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })

  const formattedTime = start.toLocaleTimeString(isAr ? 'ar-EG' : 'en-US', {
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <Link
      href={`/events/${id}`}
      className="group flex flex-col bg-feps-paper border border-feps-border relative overflow-hidden transition-colors hover:bg-feps-surface h-full"
    >
      {/* Spine Effect */}
      <div 
        className="absolute start-0 top-0 bottom-0 w-[3px] z-10"
        style={{ backgroundColor: meta.color }}
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
            className="font-mono text-xs uppercase tracking-widest font-semibold"
            style={{ color: meta.color }}
          >
            {categoryLabel}
          </span>
          <span className="font-mono text-xs text-feps-ink-tertiary">
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
          <div className="flex items-center gap-2 text-xs text-feps-ink-secondary font-mono">
            <Clock size={14} className="opacity-50" />
            <span>{formattedTime}</span>
          </div>
          {location && (
            <div className="flex items-center gap-2 text-xs text-feps-ink-secondary font-mono">
              <MapPin size={14} className="opacity-50" />
              <span className="truncate">{location}</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}
