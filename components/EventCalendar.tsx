'use client'

import React, { useState, useMemo, useRef } from 'react'
import { ChevronLeft, ChevronRight, Filter, Grid, List as ListIcon, Search } from 'lucide-react'
import { useParams } from 'next/navigation'
import './EventCalendar.css'

import { EventCategoryData } from './EventCard'
import { CalendarEvent } from './calendar/types'
import CalendarAgenda from './calendar/CalendarAgenda'
import CalendarGrid from './calendar/CalendarGrid'
import CalendarSidebar from './calendar/CalendarSidebar'

const DAYS_OF_WEEK_EN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const DAYS_OF_WEEK_AR = ['أحد', 'إثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت']
const DAYS_OF_WEEK_FR = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam']

const MONTH_NAMES_EN = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]
const MONTH_NAMES_AR = [
  'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
  'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
]
const MONTH_NAMES_FR = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
]

interface Props {
  initialEvents: CalendarEvent[]
  categories: EventCategoryData[]
}

export default function EventCalendar({ initialEvents, categories }: Props) {
  const params = useParams()
  const locale = (params?.locale as string) || 'en'
  const isAr = locale === 'ar'
  const isFr = locale === 'fr'

  const today = new Date()
  const [currentYear, setCurrentYear] = useState(today.getFullYear())
  const [currentMonth, setCurrentMonth] = useState(today.getMonth()) // 0-indexed
  const [selectedDay, setSelectedDay] = useState<number | null>(null)
  const [events, setEvents] = useState<CalendarEvent[]>(initialEvents)
  const [loading, setLoading] = useState(false)
  const [selectedType, setSelectedType] = useState<string>('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'GRID' | 'LIST'>('GRID')

  const sidebarRef = useRef<HTMLDivElement>(null)

  // Build calendar grid parameters
  const firstDay = new Date(currentYear, currentMonth, 1).getDay()
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()

  // Search filter helper
  const matchesSearch = (ev: CalendarEvent, query: string) => {
    if (!query) return true
    const q = query.toLowerCase()
    return (
      (ev.title && ev.title.toLowerCase().includes(q)) ||
      (ev.titleAr && ev.titleAr.toLowerCase().includes(q))
    )
  }

  // Map events to days, applying category filter
  const eventsByDay = useMemo(() => {
    const map = new Map<number, CalendarEvent[]>()
    events.forEach(ev => {
      if (selectedType !== 'ALL' && ev.category.id !== selectedType) return
      if (!matchesSearch(ev, searchQuery)) return

      const d = new Date(ev.startDate)
      if (d.getFullYear() === currentYear && d.getMonth() === currentMonth) {
        const day = d.getDate()
        if (!map.has(day)) map.set(day, [])
        map.get(day)!.push(ev)
      }
    })
    return map
  }, [events, currentYear, currentMonth, selectedType, searchQuery])

  // Get chronological filtered events list for Agenda (LIST) view
  const agendaEvents = useMemo(() => {
    return events
      .filter(ev => {
        if (selectedType !== 'ALL' && ev.category.id !== selectedType) return false
        if (!matchesSearch(ev, searchQuery)) return false
        const d = new Date(ev.startDate)
        return d.getFullYear() === currentYear && d.getMonth() === currentMonth
      })
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
  }, [events, currentYear, currentMonth, selectedType, searchQuery])

  const selectedEvents = selectedDay ? (eventsByDay.get(selectedDay) ?? []) : []

  async function navigate(delta: number) {
    let newMonth = currentMonth + delta
    let newYear = currentYear
    if (newMonth > 11) { newMonth = 0; newYear++ }
    if (newMonth < 0) { newMonth = 11; newYear-- }
    setCurrentMonth(newMonth)
    setCurrentYear(newYear)
    setSelectedDay(null)
    setLoading(true)
    try {
      const res = await fetch(`/api/events?month=${newMonth + 1}&year=${newYear}`)
      if (res.ok) setEvents(await res.json())
    } finally {
      setLoading(false)
    }
  }

  function handleResetToday() {
    setCurrentMonth(today.getMonth())
    setCurrentYear(today.getFullYear())
    setSelectedDay(null)
  }

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]
  // Pad cells to complete rows of 7
  while (cells.length % 7 !== 0) cells.push(null)

  const daysOfWeek = isAr ? DAYS_OF_WEEK_AR : isFr ? DAYS_OF_WEEK_FR : DAYS_OF_WEEK_EN
  const monthName = isAr ? MONTH_NAMES_AR[currentMonth] : isFr ? MONTH_NAMES_FR[currentMonth] : MONTH_NAMES_EN[currentMonth]

  return (
    <div>
      {/* Category Filters Container */}
      <div data-tour="events-filters" style={{ marginBottom: '2rem' }}>
        <div className="filter-header-row" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.6rem', color: 'var(--feps-ink-secondary)', fontSize: '0.75rem', fontWeight: 600, fontFamily: 'var(--font-sans, sans-serif)', textTransform: 'uppercase', letterSpacing: '0.05em', direction: isAr ? 'rtl' : 'ltr' }}>
          <Filter size={12} />
          <span>{isAr ? 'تصفية حسب التصنيف' : isFr ? 'Filtrer par catégorie' : 'Filter by Category'}</span>
        </div>
      
      <div className="calendar-filters-scroll" style={{ direction: isAr ? 'rtl' : 'ltr' }}>
        <button
          onClick={() => setSelectedType('ALL')}
          className="filter-pill"
          style={
            selectedType === 'ALL'
              ? {
                  backgroundColor: 'var(--feps-surface)',
                  color: 'var(--feps-ink)',
                  borderColor: 'var(--feps-ink)',
                  fontWeight: 700,
                }
              : {}
          }
        >
          {isAr ? 'الكل' : isFr ? 'Tout' : 'All'}
        </button>
        {categories.map((cat) => {
          const isActive = selectedType === cat.id
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedType(cat.id)}
              className="filter-pill"
              style={
                isActive
                  ? {
                      backgroundColor: cat.bg,
                      color: cat.color,
                      borderColor: cat.color,
                      fontWeight: 800,
                    }
                  : {}
              }
            >
              {locale === 'ar' ? cat.nameAr : locale === 'fr' ? cat.nameFr : cat.nameEn}
            </button>
          )
        })}
        </div>
      </div>

      {/* Calendar Toolbar */}
      <div data-tour="events-search" className="calendar-toolbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem', direction: isAr ? 'rtl' : 'ltr' }}>
        
        {/* Search Bar */}
        <div style={{ flex: '1 1 250px', maxWidth: '400px', position: 'relative' }}>
          <div style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', [isAr ? 'right' : 'left']: '1rem', color: 'var(--feps-ink-secondary)', display: 'flex', alignItems: 'center' }}>
            <Search size={16} />
          </div>
          <input
            type="text"
            placeholder={isAr ? 'ابحث عن الفعاليات...' : isFr ? 'Rechercher des événements...' : 'Search events...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: `0.5rem ${isAr ? '2.5rem' : '1rem'} 0.5rem ${isAr ? '1rem' : '2.5rem'}`,
              border: '1px solid var(--feps-border)',
              borderRadius: 'var(--radius-feps, 2px)',
              background: 'transparent',
              fontFamily: 'var(--font-sans, sans-serif)',
              fontSize: '0.875rem',
              color: 'var(--feps-ink)',
              outline: 'none',
              transition: 'border-color 0.2s ease'
            }}
            onFocus={(e) => e.target.style.borderColor = 'var(--feps-gold)'}
            onBlur={(e) => e.target.style.borderColor = 'var(--feps-border)'}
          />
        </div>

        {/* Month Navigation */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button className="nav-chevron-btn" onClick={() => navigate(isAr ? 1 : -1)} aria-label="Previous Month">
            <ChevronLeft size={16} style={{ transform: isAr ? 'rotate(180deg)' : 'none' }} />
          </button>
          <div style={{ minWidth: '120px', textAlign: 'center' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'normal', fontFamily: 'var(--font-serif, serif)', color: 'var(--feps-ink)', margin: 0 }}>
              {monthName} {currentYear}
            </h2>
          </div>
          <button className="nav-chevron-btn" onClick={() => navigate(isAr ? -1 : 1)} aria-label="Next Month">
            <ChevronRight size={16} style={{ transform: isAr ? 'rotate(180deg)' : 'none' }} />
          </button>
          
          {(currentMonth !== today.getMonth() || currentYear !== today.getFullYear()) && (
            <button className="today-btn" onClick={handleResetToday}>
              {isAr ? 'اليوم' : isFr ? "Aujourd'hui" : 'Today'}
            </button>
          )}
        </div>

        {/* View Mode Toggle */}
        <div className="view-toggle-container">
          <button
            className={`view-toggle-btn ${viewMode === 'GRID' ? 'active' : ''}`}
            onClick={() => setViewMode('GRID')}
          >
            <Grid size={14} />
            <span>{isAr ? 'تقويم' : isFr ? 'Grille' : 'Grid'}</span>
          </button>
          <button
            className={`view-toggle-btn ${viewMode === 'LIST' ? 'active' : ''}`}
            onClick={() => setViewMode('LIST')}
          >
            <ListIcon size={14} />
            <span>{isAr ? 'أجندة' : isFr ? 'Agenda' : 'Agenda'}</span>
          </button>
        </div>
      </div>

      {loading && (
        <div style={{ textAlign: 'center', padding: '1rem 0', color: 'var(--feps-ink-secondary)', fontSize: '0.85rem', fontWeight: 500, fontFamily: 'var(--font-sans, sans-serif)' }}>
          {isAr ? 'جاري تحميل الفعاليات...' : isFr ? 'Chargement des événements...' : 'Loading events...'}
        </div>
      )}

      {/* Main View Container */}
      {!loading && (
        viewMode === 'LIST' ? (
          <CalendarAgenda 
            events={agendaEvents} 
            locale={locale} 
            isAr={isAr} 
            isFr={isFr} 
          />
        ) : (
          <div data-tour="events-calendar" className={`calendar-container ${selectedDay ? 'has-sidebar' : ''}`} style={{ direction: isAr ? 'rtl' : 'ltr' }}>
            {/* Calendar Grid Side */}
            <CalendarGrid
              cells={cells}
              today={today}
              currentMonth={currentMonth}
              currentYear={currentYear}
              eventsByDay={eventsByDay}
              selectedDay={selectedDay}
              setSelectedDay={setSelectedDay}
              sidebarRef={sidebarRef}
              isAr={isAr}
              isFr={isFr}
              daysOfWeek={daysOfWeek}
            />

            {/* Sidebar displaying details for selected day */}
            {selectedDay && (
              <CalendarSidebar
                selectedDay={selectedDay}
                currentMonth={currentMonth}
                currentYear={currentYear}
                selectedEvents={selectedEvents}
                setSelectedDay={setSelectedDay}
                sidebarRef={sidebarRef}
                locale={locale}
                isAr={isAr}
                isFr={isFr}
                monthNames={{ EN: MONTH_NAMES_EN, AR: MONTH_NAMES_AR, FR: MONTH_NAMES_FR }}
              />
            )}
          </div>
        )
      )}
    </div>
  )
}
