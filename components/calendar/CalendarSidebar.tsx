'use client'

import React from 'react'
import Link from 'next/link'
import { X, Calendar, MapPin, Clock, ExternalLink } from 'lucide-react'
import { CalendarEvent } from './types'

interface Props {
  selectedDay: number
  currentMonth: number
  currentYear: number
  selectedEvents: CalendarEvent[]
  setSelectedDay: (day: number | null) => void
  sidebarRef: React.RefObject<HTMLDivElement | null>
  locale: string
  isAr: boolean
  isFr: boolean
  monthNames: {
    EN: string[],
    AR: string[],
    FR: string[]
  }
}

export default function CalendarSidebar({
  selectedDay,
  currentMonth,
  currentYear,
  selectedEvents,
  setSelectedDay,
  sidebarRef,
  locale,
  isAr,
  isFr,
  monthNames
}: Props) {
  return (
    <div className="event-sidebar" ref={sidebarRef}>
      <div className="sidebar-header">
        <div>
          <div className="sidebar-title-date">{selectedDay}</div>
          <div className="sidebar-title-month">
            {isAr ? monthNames.AR[currentMonth] : isFr ? monthNames.FR[currentMonth] : monthNames.EN[currentMonth]} {currentYear}
          </div>
        </div>
        <button className="sidebar-close-btn" onClick={() => setSelectedDay(null)} aria-label="Close sidebar">
          <X size={14} />
        </button>
      </div>

      <div className="sidebar-event-list">
        {selectedEvents.length === 0 ? (
          <div className="sidebar-empty-state">
            <div className="empty-icon-wrapper">
              <Calendar size={32} />
            </div>
            <div className="empty-state-title">
              {isAr ? 'لا توجد فعاليات' : isFr ? 'Aucun événement' : 'No Events'}
            </div>
            <div className="empty-state-desc">
              {isAr 
                ? 'لم يتم تحديد أي فعاليات أو أنشطة لهذا اليوم.' 
                : isFr 
                ? 'Aucune activité n\'est prévue pour cette journée.' 
                : 'No activities or events scheduled for this day.'}
            </div>
          </div>
        ) : (
          selectedEvents.map(ev => {
            const meta = ev.category || { nameAr: 'غير محدد', nameEn: 'Unknown', nameFr: 'Inconnu', color: 'var(--feps-navy)', bg: 'rgba(26,58,110,0.1)' }
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
                className="sidebar-event-card"
                style={{
                  borderLeft: isAr ? 'none' : `3px solid ${meta.color}`,
                  borderRight: isAr ? `3px solid ${meta.color}` : 'none'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem', gap: '0.5rem' }}>
                  <span style={{
                    fontFamily: 'var(--font-mono, monospace)',
                    fontSize: '0.65rem',
                    fontWeight: 600,
                    color: meta.color,
                    background: meta.bg,
                    padding: '0.2rem 0.5rem',
                    borderRadius: 'var(--radius-feps, 2px)',
                    border: `1px solid ${meta.color}`,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em'
                  }}>
                    {locale === 'ar' ? meta.nameAr : locale === 'fr' ? meta.nameFr : meta.nameEn}
                  </span>
                  <ExternalLink size={12} style={{ color: 'var(--feps-ink-tertiary)' }} />
                </div>

                <div style={{ fontWeight: 'normal', fontFamily: 'var(--font-serif, serif)', color: 'var(--feps-ink)', fontSize: '1.25rem', lineHeight: 1.2, marginBottom: '0.25rem' }}>
                  {isAr && ev.titleAr ? ev.titleAr : ev.title}
                </div>

                {ev.titleAr && !isAr && (
                  <div className="arabic" style={{ fontSize: '0.78rem', color: 'var(--feps-ink-secondary)', marginBottom: '0.25rem' }}>
                    {ev.titleAr}
                  </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', marginTop: '0.5rem' }}>
                  {ev.location && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', color: 'var(--feps-ink-secondary)', fontFamily: 'var(--font-mono, monospace)' }}>
                      <MapPin size={12} style={{ color: 'var(--feps-ink-tertiary)' }} />
                      <span>{ev.location}</span>
                    </div>
                  )}
                  {eventTime && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', color: 'var(--feps-ink-secondary)', fontFamily: 'var(--font-mono, monospace)' }}>
                      <Clock size={12} style={{ color: 'var(--feps-ink-tertiary)' }} />
                      <span>{eventTime}</span>
                    </div>
                  )}
                </div>
              </Link>
            )
          })
        )}
      </div>
    </div>
  )
}
