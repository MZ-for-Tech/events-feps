'use client'

import React from 'react'
import Link from 'next/link'
import { MapPin, Clock, ExternalLink } from 'lucide-react'
import { CalendarEvent } from './types'
import { EVENT_TYPE_META } from '../EventCard'

interface Props {
  events: CalendarEvent[]
  locale: string
  isAr: boolean
  isFr: boolean
}

export default function CalendarAgenda({ events, locale, isAr, isFr }: Props) {
  return (
    <div className="agenda-view" style={{ direction: isAr ? 'rtl' : 'ltr' }}>
      {events.length === 0 ? (
        <div style={{ padding: '4rem 1rem', textAlign: 'center', color: 'var(--feps-ink-secondary)' }}>
          <p style={{ fontWeight: 'normal', fontFamily: 'var(--font-serif, serif)', fontSize: '1.25rem', margin: 0, color: 'var(--feps-ink)' }}>
            {isAr ? 'لا توجد فعاليات مجدولة هذا الشهر' : isFr ? 'Aucun événement prévu ce mois-ci' : 'No events scheduled for this month'}
          </p>
          <p style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>
            {isAr ? 'اختر تصنيفًا آخر أو تصفح الأشهر القادمة.' : isFr ? 'Essayez de sélectionner une autre catégorie ou parcourez les autres mois.' : 'Try selecting another category or browse other months.'}
          </p>
        </div>
      ) : (
        <div className="agenda-list">
          {events.map(ev => {
            const meta = EVENT_TYPE_META[ev.type]
            const dateObj = new Date(ev.startDate)
            const dayNum = dateObj.getDate()
            const dayName = dateObj.toLocaleDateString(locale, { weekday: 'short' })
            const monthShort = dateObj.toLocaleDateString(locale, { month: 'short' })
            const eventTime = ev.startDate
              ? new Date(ev.startDate).toLocaleTimeString(locale, {
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : null

            return (
              <Link
                key={ev.id}
                href={`/events/${ev.id}`}
                className="agenda-item-card"
              >
                <div className="agenda-date-badge">
                  <span className="agenda-day-num">{dayNum}</span>
                  <span className="agenda-month-name">{monthShort}</span>
                  <span className="agenda-day-name">{dayName}</span>
                </div>
                
                <div className="agenda-details">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                    <span
                      className="category-indicator-tag"
                      style={{
                        color: meta.color,
                        background: meta.bg,
                      }}
                    >
                      {locale === 'ar' ? meta.labelAr : locale === 'fr' ? meta.labelFr : meta.label}
                    </span>
                  </div>
                  
                  <h3 className="agenda-event-title">
                    {isAr && ev.titleAr ? ev.titleAr : ev.title}
                  </h3>
                  
                  {ev.description && (
                    <p className="agenda-event-desc">
                      {ev.description}
                    </p>
                  )}
                  
                  <div className="agenda-meta-row">
                    {ev.location && (
                      <span className="meta-item">
                        <MapPin size={12} />
                        {ev.location}
                      </span>
                    )}
                    {eventTime && (
                      <span className="meta-item">
                        <Clock size={12} />
                        {eventTime}
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="agenda-action" style={{ transform: isAr ? 'rotate(180deg)' : 'none' }}>
                  <ExternalLink size={16} />
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
