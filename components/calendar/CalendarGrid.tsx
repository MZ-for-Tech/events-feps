'use client'

import React from 'react'
import { CalendarEvent } from './types'
import { EVENT_TYPE_META } from '../EventCard'

interface Props {
  cells: (number | null)[]
  today: Date
  currentMonth: number
  currentYear: number
  eventsByDay: Map<number, CalendarEvent[]>
  selectedDay: number | null
  setSelectedDay: (day: number | null) => void
  sidebarRef: React.RefObject<HTMLDivElement | null>
  isAr: boolean
  isFr: boolean
  daysOfWeek: string[]
}

export default function CalendarGrid({
  cells,
  today,
  currentMonth,
  currentYear,
  eventsByDay,
  selectedDay,
  setSelectedDay,
  sidebarRef,
  isAr,
  isFr,
  daysOfWeek,
}: Props) {
  return (
    <div>
      <div className="day-headers">
        {daysOfWeek.map(d => (
          <div key={d} className="day-header-cell">
            {d}
          </div>
        ))}
      </div>

      <div className="calendar-grid">
        {cells.map((day, i) => {
          const isToday = day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear()
          const dayEvents = day ? (eventsByDay.get(day) ?? []) : []
          const isSelected = day !== null && day === selectedDay
          const hasEvents = dayEvents.length > 0

          return (
            <div
              key={i}
              onClick={() => {
                if (day) {
                  if (isSelected) {
                    setSelectedDay(null)
                  } else {
                    setSelectedDay(day)
                    setTimeout(() => {
                      if (window.innerWidth <= 768) {
                        sidebarRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                      }
                    }, 100)
                  }
                }
              }}
              className={`calendar-cell ${!day ? 'empty' : ''} ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''} ${hasEvents ? 'has-events' : ''}`}
            >
              {day && (
                <>
                  <div className="cell-header">
                    <span className="cell-day-num">{day}</span>
                    {hasEvents && (
                      <span className="cell-mobile-count show-mobile-only">
                        {dayEvents.length}
                      </span>
                    )}
                  </div>

                  {/* Desktop Pill Stack */}
                  {hasEvents && (
                    <div className="cell-events-list hide-mobile-only">
                      {dayEvents.slice(0, 2).map((ev) => {
                        const meta = EVENT_TYPE_META[ev.type]
                        return (
                          <div
                            key={ev.id}
                            className="cell-event-pill"
                            style={{
                              background: meta.bg,
                              color: 'var(--feps-ink)',
                              borderLeft: isAr ? 'none' : `3px solid ${meta.color}`,
                              borderRight: isAr ? `3px solid ${meta.color}` : 'none',
                            }}
                            title={isAr && ev.titleAr ? ev.titleAr : ev.title}
                          >
                            {isAr && ev.titleAr ? ev.titleAr : ev.title}
                          </div>
                        )
                      })}
                      {dayEvents.length > 2 && (
                        <div className="cell-events-more">
                          {isAr 
                            ? `+ ${dayEvents.length - 2} إضافي` 
                            : isFr 
                            ? `+ ${dayEvents.length - 2} de plus` 
                            : `+ ${dayEvents.length - 2} more`}
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
