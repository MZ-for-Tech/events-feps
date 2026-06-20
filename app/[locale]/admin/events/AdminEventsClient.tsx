/* eslint-disable @next/next/no-img-element */
'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Plus, Edit2, Trash2, Calendar, MapPin, Clock, ToggleLeft, ToggleRight, X, Image as ImageIcon, FileText, CheckCircle, AlertCircle, Loader, Check, Archive, FolderOpen, Printer, ChevronRight } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { EventCategoryData } from '@/components/EventCard'

interface AdminEvent {
  id: string
  title: string
  titleAr?: string | null
  categoryId: string
  category: EventCategoryData
  startDate: string
  endDate?: string | null
  location?: string | null
  description?: string | null
  agendaText?: string | null
  agendaFile?: string | null
  imageUrl?: string | null
  published: boolean
  status?: string | null
  reportSummary?: string | null
  reportResults?: string | null
  reportRecommendations?: string | null
}

interface Props {
  initialEvents: AdminEvent[]
  categories: EventCategoryData[]
  locale: string
  permissions: string[]
  role?: string
}

export interface AgendaCell {
  day?: string
  startTime: string
  endTime: string
  text: string
}

export default function AdminEventsClient({ initialEvents, categories, locale, permissions, role }: Props) {
  const router = useRouter()
  const isAr = locale === 'ar'
  const t = useTranslations('AdminEvents')

  const [events, setEvents] = useState<AdminEvent[]>(initialEvents)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<AdminEvent | null>(null)
  const [activeTab, setActiveTab] = useState<'active' | 'archived'>('active')

  const canPublish = role === 'SUPERADMIN' || permissions.includes('events:publish')
  const canDelete = role === 'SUPERADMIN' || permissions.includes('events:delete')

  // Report modal state
  const [reportModalEvent, setReportModalEvent] = useState<AdminEvent | null>(null)
  const [reportForm, setReportForm] = useState({ summary: '', results: '', recommendations: '' })
  const [reportSaving, setReportSaving] = useState(false)
  const [reportSaved, setReportSaved] = useState(false)

  const HALL_OPTIONS = [
    'مدرج أ.د. زكي شافعي',
    'مدرج قنديل',
    'مدرج العريان (أ)',
    'مدرج العريان (ب)',
    'مدرج خيري عيسى',
    'قاعة أ.د. عبد الملك عودة',
    'قاعات التدريس المرفقة (قاعة 5)',
    'قاعة ساويرس',
    'قاعة احمد الغندور',
  ]

  function LocationCombobox({ value, onChange, placeholder, isAr }: { value: string, onChange: (v: string) => void, placeholder?: string, isAr: boolean }) {
    const [isOpen, setIsOpen] = useState(false)
    const [search, setSearch] = useState('')
    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
      const handleClickOutside = (e: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
          setIsOpen(false)
        }
      }
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const getFilteredOptions = () => {
      let regex: RegExp
      try {
        regex = new RegExp(search, 'i')
        return HALL_OPTIONS.filter(opt => regex.test(opt))
      } catch {
        return HALL_OPTIONS.filter(opt => opt.toLowerCase().includes(search.toLowerCase()))
      }
    }

    const filteredOptions = getFilteredOptions()

    return (
      <div className="relative" ref={containerRef}>
        <input
          type="text"
          value={isOpen ? search : value}
          onChange={e => {
            setSearch(e.target.value)
            onChange(e.target.value)
            setIsOpen(true)
          }}
          onFocus={() => {
            setSearch(value)
            setIsOpen(true)
          }}
          placeholder={placeholder}
          className={`w-full px-3 py-2 border border-feps-ink/20 rounded bg-feps-paper text-feps-ink text-sm focus:outline-none focus:ring-1 focus:ring-feps-ink ${isAr ? 'text-right' : 'text-left'}`}
        />
        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-feps-paper border border-feps-ink/20 rounded shadow-lg max-h-60 overflow-y-auto" dir={isAr ? "rtl" : "ltr"}>
            {filteredOptions.length === 0 ? (
              <div className={`px-3 py-2 text-sm text-feps-ink/50 ${isAr ? 'text-right' : 'text-left'}`}>No matches found / لا توجد قاعات</div>
            ) : (
              <div className="py-1">
                {filteredOptions.map(opt => (
                  <button
                    key={opt}
                    type="button"
                    className={`w-full text-start px-3 py-2 text-sm hover:bg-feps-ink/5 focus:bg-feps-ink/5 outline-none transition-colors ${isAr ? 'text-right' : 'text-left'}`}
                    onClick={() => {
                      onChange(opt)
                      setIsOpen(false)
                    }}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    )
  }

  // Form state
  const [form, setForm] = useState({
    title: '',
    titleAr: '',
    categoryId: categories.length > 0 ? categories[0].id : '',
    startDate: '',
    endDate: '',
    location: '',
    description: '',
    agendaText: '',
    published: false,
  })

  const [agendaCells, setAgendaCells] = useState<AgendaCell[]>([])

  const [imageFile, setImageFile] = useState<File | null>(null)
  const [agendaFile, setAgendaFile] = useState<File | null>(null)
  const [imageUrlPreview, setImageUrlPreview] = useState<string | null>(null)
  const [agendaFileName, setAgendaFileName] = useState<string | null>(null)

  const [loading, setLoading] = useState(false)
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [isSingleDay, setIsSingleDay] = useState(true)

  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = 'hidden'
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') setIsModalOpen(false)
      }
      window.addEventListener('keydown', handleKeyDown)
      return () => {
        document.body.style.overflow = 'unset'
        window.removeEventListener('keydown', handleKeyDown)
      }
    } else {
      document.body.style.overflow = 'unset'
    }
  }, [isModalOpen])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const editId = params.get('edit')
    if (editId) {
      const ev = events.find(e => e.id === editId)
      if (ev) {
        handleOpenEdit(ev)
        // Clean up URL without triggering navigation
        window.history.replaceState(null, '', window.location.pathname)
      }
    }
  }, [events])

  // Open modal for Create
  function handleOpenCreate() {
    setEditingEvent(null)
    setForm({
      title: '',
      titleAr: '',
      categoryId: categories.length > 0 ? categories[0].id : '',
      startDate: '',
      endDate: '',
      location: '',
      description: '',
      agendaText: '',
      published: false,
    })
    setAgendaCells([{ startTime: '', endTime: '', text: '', day: '' }])
    setImageFile(null)
    setAgendaFile(null)
    setImageUrlPreview(null)
    setAgendaFileName(null)
    setStatusMsg(null)
    setIsSingleDay(true)
    setIsModalOpen(true)
  }

  // Open modal for Edit
  function handleOpenEdit(ev: AdminEvent) {
    setEditingEvent(ev)

    // Format dates to YYYY-MM-DDTHH:MM for datetime-local inputs
    const formatInputDate = (isoStr: string | null | undefined) => {
      if (!isoStr) return ''
      const d = new Date(isoStr)
      const pad = (num: number) => String(num).padStart(2, '0')
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
    }

    const startStr = formatInputDate(ev.startDate)
    const endStr = formatInputDate(ev.endDate)
    const startDatePart = startStr.split('T')[0]
    const endDatePart = endStr.split('T')[0]

    if (endStr && startDatePart !== endDatePart) {
      setIsSingleDay(false)
    } else {
      setIsSingleDay(true)
    }

    setForm({
      title: ev.title,
      titleAr: ev.titleAr || '',
      categoryId: ev.categoryId,
      startDate: startStr,
      endDate: endStr,
      location: ev.location || '',
      description: ev.description || '',
      agendaText: ev.agendaText || '',
      published: ev.published,
    })

    // Parse agendaText into agendaCells
    let initialCells: AgendaCell[] = []
    if (ev.agendaText) {
      const trimmed = ev.agendaText.trim()
      if (trimmed.startsWith('[')) {
        try {
          initialCells = JSON.parse(trimmed)
        } catch {}
      }

      if (initialCells.length === 0) {
        const lines = ev.agendaText.split('\n').filter(l => l.trim() !== '')
        initialCells = lines.map(line => {
          const separators = [' - ', ' – ', ' : ', ' | ']
          let timePart = ''
          let textPart = line

          for (const sep of separators) {
            const idx = line.indexOf(sep)
            if (idx !== -1) {
              timePart = line.substring(0, idx).trim()
              textPart = line.substring(idx + sep.length).trim()
              break
            }
          }

          if (!timePart) {
            const timeRegex = /^(\d{1,2}:\d{2}\s*(?:AM|PM|ص|م)?)\s+(.*)$/i
            const match = line.match(timeRegex)
            if (match) {
              timePart = match[1]
              textPart = match[2]
            }
          }

          let startTime = timePart
          let endTime = ''
          const timeRangeSep = [' - ', ' – ', '-']
          for (const trSep of timeRangeSep) {
            const trIdx = timePart.indexOf(trSep)
            if (trIdx !== -1) {
              startTime = timePart.substring(0, trIdx).trim()
              endTime = timePart.substring(trIdx + trSep.length).trim()
              break
            }
          }

          return {
            day: '',
            startTime,
            endTime,
            text: textPart
          }
        })
      }
    }

    if (initialCells.length === 0) {
      initialCells = [{ startTime: '', endTime: '', text: '', day: '' }]
    }
    setAgendaCells(initialCells)

    setImageFile(null)
    setAgendaFile(null)
    setImageUrlPreview(ev.imageUrl || null)
    setAgendaFileName(ev.agendaFile ? ev.agendaFile.split('/').pop() || null : null)
    setStatusMsg(null)
    setIsModalOpen(true)
  }

  // Handle file uploads helper
  async function uploadFile(file: File, type: 'image' | 'agenda'): Promise<string> {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('type', type)

    const res = await fetch('/api/events/upload', {
      method: 'POST',
      body: formData,
    })

    if (!res.ok) {
      throw new Error(`Failed to upload ${type}`)
    }

    const data = await res.json()
    return data.url
  }

  // Handle Publish/Unpublish Quick Toggle
  async function handleTogglePublish(ev: AdminEvent) {
    try {
      const res = await fetch(`/api/events/${ev.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ published: !ev.published }),
      })
      if (res.ok) {
        const updated = await res.json()
        setEvents(events.map(item => item.id === ev.id ? { ...item, published: updated.published } : item))
        router.refresh()
      } else {
        const text = await res.text()
        alert('Error toggling publish: ' + text)
      }
    } catch (err) {
      console.error(err)
      alert('Network error')
    }
  }

  // Handle Delete
  async function handleDelete(id: string) {
    if (!confirm(t('deleteConfirm'))) return

    try {
      const res = await fetch(`/api/events/${id}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        setEvents(events.filter(item => item.id !== id))
        router.refresh()
      } else {
        alert('Failed to delete event')
      }
    } catch (err) {
      console.error(err)
    }
  }

  // Mark event as Archived (completed)
  async function handleArchive(ev: AdminEvent) {
    try {
      const res = await fetch(`/api/events/${ev.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'ARCHIVED' }),
      })
      if (res.ok) {
        setEvents(events.map(item => item.id === ev.id ? { ...item, status: 'ARCHIVED' } : item))
        router.refresh()
      } else {
        const text = await res.text()
        alert('Error: ' + text)
        console.error('Archive failed', res.status, text)
      }
    } catch (err) {
      console.error(err)
      alert('Network error')
    }
  }

  // Restore event from Archive to Active
  async function handleRestore(ev: AdminEvent) {
    try {
      const res = await fetch(`/api/events/${ev.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'ACTIVE' }),
      })
      if (res.ok) {
        setEvents(events.map(item => item.id === ev.id ? { ...item, status: 'ACTIVE' } : item))
        router.refresh()
      } else {
        const text = await res.text()
        alert('Error restoring: ' + text)
        console.error('Restore failed', res.status, text)
      }
    } catch (err) {
      console.error(err)
      alert('Network error')
    }
  }

  // Open report modal for a specific event
  function handleOpenReport(ev: AdminEvent) {
    setReportModalEvent(ev)
    setReportForm({
      summary: ev.reportSummary || '',
      results: ev.reportResults || '',
      recommendations: ev.reportRecommendations || '',
    })
    setReportSaved(false)
  }

  // Save report data to DB
  async function handleSaveReport() {
    if (!reportModalEvent) return
    setReportSaving(true)
    try {
      const res = await fetch(`/api/events/${reportModalEvent.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportSummary: reportForm.summary || null,
          reportResults: reportForm.results || null,
          reportRecommendations: reportForm.recommendations || null,
        }),
      })
      if (res.ok) {
        const updated = await res.json()
        setEvents(events.map(item => item.id === reportModalEvent.id ? {
          ...item,
          reportSummary: updated.reportSummary,
          reportResults: updated.reportResults,
          reportRecommendations: updated.reportRecommendations,
        } : item))
        setReportSaved(true)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setReportSaving(false)
    }
  }

  // Submit Form (Create or Edit)
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setStatusMsg(null)

    try {
      // 1. Upload files if selected
      let finalImageUrl = imageUrlPreview
      let finalAgendaFile = editingEvent?.agendaFile || null

      if (imageFile) {
        finalImageUrl = await uploadFile(imageFile, 'image')
      }

      if (agendaFile) {
        finalAgendaFile = await uploadFile(agendaFile, 'agenda')
      }

      // 2. Prepare payload
      const filteredCells = agendaCells.filter(c => c.day || c.startTime || c.endTime || c.text)
      const agendaTextPayload = filteredCells.length > 0 ? JSON.stringify(filteredCells) : null

      const payload = {
        title: form.title,
        titleAr: form.titleAr || null,
        categoryId: form.categoryId,
        startDate: form.startDate,
        endDate: form.endDate || null,
        location: form.location || null,
        description: form.description || null,
        agendaText: agendaTextPayload,
        imageUrl: finalImageUrl,
        agendaFile: finalAgendaFile,
        published: form.published,
      }

      // 3. API request
      let url = '/api/events'
      let method = 'POST'
      if (editingEvent) {
        url = `/api/events/${editingEvent.id}`
        method = 'PATCH'
      }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const errorText = await res.text()
        throw new Error(errorText || 'Server request failed')
      }

      const savedEvent = await res.json()

      // 4. Update state
      if (editingEvent) {
        setEvents(events.map(item => item.id === editingEvent.id ? savedEvent : item))
        setStatusMsg({ type: 'success', text: t('eventUpdated') })
      } else {
        setEvents([savedEvent, ...events])
        setStatusMsg({ type: 'success', text: t('eventCreated') })
      }

      setTimeout(() => {
        setIsModalOpen(false)
      }, 1500)
    } catch (err: unknown) {
      console.error(err)
      setStatusMsg({ type: 'error', text: err instanceof Error ? err.message : 'An error occurred' })
    } finally {
      setLoading(false)
    }
  }

  const filteredEvents = events.filter(e =>
    activeTab === 'archived' ? e.status === 'ARCHIVED' : (e.status || 'ACTIVE') === 'ACTIVE'
  )

  return (
    <div className="p-6 md:p-8" dir={isAr ? 'rtl' : 'ltr'}>
      <div className="mb-8 border-b border-feps-ink/20 pb-6 flex items-start justify-between gap-6">
        <div>
          <h1 className="font-serif text-3xl text-feps-ink mb-1">
            {t('pageTitle')}
          </h1>
          <p className="font-mono text-sm text-feps-ink-secondary">
            {t('pageDesc')}
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          data-tour="admin-create-event"
          className="flex items-center gap-2 bg-feps-ink text-feps-paper px-4 py-2 font-mono text-sm tracking-widest uppercase hover:bg-black transition-colors"
        >
          <Plus size={16} />
          {t('addNew')}
        </button>
      </div>

      {/* Events Table Container */}
      <div className="border border-feps-ink/20 overflow-hidden bg-feps-paper">
        {/* Tabs */}
        <div className="flex border-b border-feps-ink/20">
          <button
            onClick={() => setActiveTab('active')}
            className={`flex items-center gap-2 px-6 py-3 text-xs font-bold uppercase tracking-widest border-b-2 transition-colors ${activeTab === 'active' ? 'border-feps-navy text-feps-navy bg-feps-navy/5' : 'border-transparent text-feps-ink-secondary hover:text-feps-ink'}`}
          >
            <FolderOpen size={14} />
            {isAr ? 'الفعاليات الحالية' : 'Active Events'}
            <span className="bg-feps-navy/10 text-feps-navy px-1.5 py-0.5 text-[10px]">
              {events.filter(e => (e.status || 'ACTIVE') === 'ACTIVE').length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('archived')}
            className={`flex items-center gap-2 px-6 py-3 text-xs font-bold uppercase tracking-widest border-b-2 transition-colors ${activeTab === 'archived' ? 'border-feps-gold text-feps-ink bg-feps-gold/10' : 'border-transparent text-feps-ink-secondary hover:text-feps-ink'}`}
          >
            <Archive size={14} />
            {isAr ? 'الأرشيف' : 'Archived'}
            <span className="bg-feps-gold/20 text-feps-ink px-1.5 py-0.5 text-[10px]">
              {events.filter(e => e.status === 'ARCHIVED').length}
            </span>
          </button>
        </div>

        {filteredEvents.length === 0 ? (
          <div className="p-12 text-center text-feps-ink-secondary">
            <Calendar size={48} className="opacity-20 mb-4 mx-auto" />
            <p className="font-mono text-sm uppercase tracking-wider">{t('noEvents')}</p>
          </div>
        ) : (
          <div>
            <table className="w-full border-collapse hidden md:table">
              <thead>
                <tr className={isAr ? 'text-right' : 'text-left'}>
                  <th className="p-4 border-b border-feps-ink/20 text-feps-ink-secondary font-bold text-[11px] uppercase tracking-widest">
                    {t('colType')}
                  </th>
                  <th className="p-4 border-b border-feps-ink/20 text-feps-ink-secondary font-bold text-[11px] uppercase tracking-widest">
                    {t('colTitle')}
                  </th>
                  <th className="p-4 border-b border-feps-ink/20 text-feps-ink-secondary font-bold text-[11px] uppercase tracking-widest">
                    {t('colDateTime')}
                  </th>
                  <th className="p-4 border-b border-feps-ink/20 text-feps-ink-secondary font-bold text-[11px] uppercase tracking-widest">
                    {t('colLocation')}
                  </th>
                  <th className="p-4 border-b border-feps-ink/20 text-feps-ink-secondary font-bold text-[11px] uppercase tracking-widest">
                    {t('colPublished')}
                  </th>
                  <th className="p-4 border-b border-feps-ink/20 text-feps-ink-secondary font-bold text-[11px] uppercase tracking-widest text-center">
                    {t('colActions')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredEvents.map(ev => {
                  const meta = ev.category || { nameAr: 'غير محدد', nameEn: 'Unknown', nameFr: 'Inconnu', color: 'var(--feps-navy)', bg: 'rgba(26,58,110,0.1)' }
                  const date = new Date(ev.startDate)
                  const formattedDate = date.toLocaleDateString(isAr ? 'ar-EG' : 'en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })
                  const formattedTime = date.toLocaleTimeString(isAr ? 'ar-EG' : 'en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })

                  return (
                    <tr key={ev.id} className="border-b border-feps-ink/10">
                      {/* Type Badge */}
                      <td className="p-4">
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2 py-0.5 rounded-full" style={{ color: meta.color, background: meta.bg }}>
                          <span className="w-1.5 h-1.5 rounded-full" style={{ background: meta.color }} />
                          {locale === 'ar' ? meta.nameAr : locale === 'fr' ? meta.nameFr : meta.nameEn}
                        </span>
                      </td>

                      {/* Title */}
                      <td className="p-4">
                        <div className="font-bold text-feps-ink text-sm">
                          {ev.title}
                        </div>
                        {ev.titleAr && (
                          <div className="arabic text-xs text-feps-ink-secondary mt-1">
                            {ev.titleAr}
                          </div>
                        )}
                      </td>

                      {/* Date & Time */}
                      <td className="p-4 text-sm text-feps-ink-secondary">
                        <div className="flex items-center gap-2 font-bold text-feps-ink">
                          <Calendar size={14} className="text-feps-ink/50" />
                          {formattedDate}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <Clock size={14} className="text-feps-ink/50" />
                          {formattedTime}
                        </div>
                      </td>

                      {/* Location */}
                      <td className="p-4 text-sm text-feps-ink-secondary">
                        {ev.location ? (
                          <div className="flex items-center gap-2">
                            <MapPin size={14} className="text-feps-ink/50 shrink-0" />
                            <span>{ev.location}</span>
                          </div>
                        ) : (
                          <span className="italic opacity-50">—</span>
                        )}
                      </td>

                      {/* Published State Quick-toggle */}
                      <td className="p-4">
                        {canPublish ? (
                          <button
                            data-tour="admin-publish-toggle"
                            onClick={() => handleTogglePublish(ev)}
                            className={`flex items-center gap-2 transition-colors ${ev.published ? 'text-green-700' : 'text-feps-ink-secondary hover:text-feps-ink'}`}
                            title={ev.published ? t('unpublish') : t('publish')}
                          >
                            {ev.published ? (
                              <>
                                <ToggleRight size={24} />
                                <span className="text-xs font-bold">{t('statusPublished')}</span>
                              </>
                            ) : (
                              <>
                                <ToggleLeft size={24} />
                                <span className="text-xs font-bold">{t('statusDraft')}</span>
                              </>
                            )}
                          </button>
                        ) : (
                          <div className={`flex items-center gap-2 ${ev.published ? 'text-green-700' : 'text-feps-ink-secondary'}`}>
                            <span className="text-xs font-bold">{ev.published ? t('statusPublished') : t('statusDraft')}</span>
                          </div>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-center">
                        <div data-tour="admin-actions" className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleOpenEdit(ev)}
                            className="bg-feps-ink/5 text-feps-ink w-8 h-8 flex items-center justify-center hover:bg-feps-ink hover:text-white transition-colors"
                            title={t('actionEdit')}
                          >
                            <Edit2 size={14} />
                          </button>

                          {canDelete && (
                            <button
                              onClick={() => handleDelete(ev.id)}
                              className="bg-red-50 text-red-600 w-8 h-8 flex items-center justify-center hover:bg-red-600 hover:text-white transition-colors"
                              title={t('actionDelete')}
                            >
                              <Trash2 size={14} />
                            </button>
                          )}

                          {activeTab === 'active' ? (
                            <button
                              onClick={() => handleArchive(ev)}
                              className="bg-amber-50 text-amber-700 w-8 h-8 flex items-center justify-center hover:bg-amber-600 hover:text-white transition-colors"
                              title={isAr ? 'إنهاء الفعالية وأرشفتها' : 'Mark as Completed & Archive'}
                            >
                              <Archive size={14} />
                            </button>
                          ) : (
                            <>
                              <button
                                onClick={() => router.push(`/${locale}/admin/events/${ev.id}`)}
                                className="bg-feps-navy text-white w-8 h-8 flex items-center justify-center hover:bg-feps-gold hover:text-feps-navy transition-colors"
                                title={isAr ? 'إدارة الفعالية (التقرير والاستبيان)' : 'Manage Event (Report & Survey)'}
                              >
                                <FileText size={14} />
                              </button>
                              <button
                                onClick={() => handleRestore(ev)}
                                className="bg-green-50 text-green-700 w-8 h-8 flex items-center justify-center hover:bg-green-600 hover:text-white transition-colors"
                                title={isAr ? 'استعادة للنشطة' : 'Restore to Active'}
                              >
                                <ChevronRight size={14} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            {/* Mobile Cards View */}
            <div className="md:hidden flex flex-col divide-y divide-feps-ink/10">
              {filteredEvents.map(ev => {
                const meta = ev.category || { nameAr: 'غير محدد', nameEn: 'Unknown', nameFr: 'Inconnu', color: 'var(--feps-navy)', bg: 'rgba(26,58,110,0.1)' }
                const date = new Date(ev.startDate)
                const formattedDate = date.toLocaleDateString(isAr ? 'ar-EG' : 'en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })
                const formattedTime = date.toLocaleTimeString(isAr ? 'ar-EG' : 'en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                })

                return (
                  <div key={ev.id} className="p-4 flex flex-col gap-3">
                    <div className="flex justify-between items-start gap-2">
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2 py-0.5 rounded-full" style={{ color: meta.color, background: meta.bg }}>
                        <span className="w-1.5 h-1.5 rounded-full" style={{ background: meta.color }} />
                        {locale === 'ar' ? meta.nameAr : locale === 'fr' ? meta.nameFr : meta.nameEn}
                      </span>
                      {canPublish ? (
                        <button
                          data-tour="admin-publish-toggle"
                          onClick={() => handleTogglePublish(ev)}
                          className={`flex items-center gap-1 transition-colors ${ev.published ? 'text-green-700' : 'text-feps-ink-secondary'}`}
                        >
                          {ev.published ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                          <span className="text-[10px] font-bold uppercase">{ev.published ? t('statusPublished') : t('statusDraft')}</span>
                        </button>
                      ) : (
                        <div className={`flex items-center gap-1 ${ev.published ? 'text-green-700' : 'text-feps-ink-secondary'}`}>
                          <span className="text-[10px] font-bold uppercase">{ev.published ? t('statusPublished') : t('statusDraft')}</span>
                        </div>
                      )}
                    </div>

                    <div>
                      <div className="font-bold text-feps-ink text-sm">
                        {ev.title}
                      </div>
                      {ev.titleAr && (
                        <div className="arabic text-xs text-feps-ink-secondary mt-1">
                          {ev.titleAr}
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs text-feps-ink-secondary">
                      <div className="flex items-center gap-1.5 font-bold text-feps-ink">
                        <Calendar size={12} className="text-feps-ink/50" />
                        {formattedDate} {formattedTime}
                      </div>
                      {ev.location && (
                        <div className="flex items-center gap-1.5">
                          <MapPin size={12} className="text-feps-ink/50 shrink-0" />
                          <span className="truncate">{ev.location}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 mt-2 pt-2 border-t border-feps-ink/5">
                      <button
                        onClick={() => handleOpenEdit(ev)}
                        className="bg-feps-ink/5 text-feps-ink flex-1 py-1.5 rounded flex items-center justify-center gap-2 hover:bg-feps-ink hover:text-white transition-colors text-xs font-bold uppercase tracking-wider"
                      >
                        <Edit2 size={12} /> {t('actionEdit')}
                      </button>
                      <button
                        onClick={() => handleDelete(ev.id)}
                        className="bg-red-50 text-red-600 flex-1 py-1.5 rounded flex items-center justify-center gap-2 hover:bg-red-600 hover:text-white transition-colors text-xs font-bold uppercase tracking-wider"
                      >
                        <Trash2 size={12} /> {t('actionDelete')}
                      </button>
                      {activeTab === 'active' ? (
                        <button
                          onClick={() => handleArchive(ev)}
                          className="bg-amber-50 text-amber-700 flex-1 py-1.5 rounded flex items-center justify-center gap-2 hover:bg-amber-600 hover:text-white transition-colors text-xs font-bold uppercase tracking-wider"
                        >
                          <Archive size={12} /> {isAr ? 'أرشفة' : 'Archive'}
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={() => handleOpenReport(ev)}
                            className="bg-feps-navy text-white flex-1 py-1.5 rounded flex items-center justify-center gap-2 hover:bg-feps-gold hover:text-feps-navy transition-colors text-xs font-bold uppercase tracking-wider"
                          >
                            <Printer size={12} /> {isAr ? 'تقرير' : 'Report'}
                          </button>
                          <button
                            onClick={() => handleRestore(ev)}
                            className="bg-green-50 text-green-700 flex-1 py-1.5 rounded flex items-center justify-center gap-2 hover:bg-green-600 hover:text-white transition-colors text-xs font-bold uppercase tracking-wider"
                          >
                            <ChevronRight size={12} /> {isAr ? 'استعادة' : 'Restore'}
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Create / Edit Modal Dialog */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-[1000] flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="bg-feps-paper border border-feps-ink/20 shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col"
            onClick={(e) => e.stopPropagation()}
            dir="ltr"
          >
            <div dir={isAr ? 'rtl' : 'ltr'} className="flex flex-col w-full">
              {/* Modal Header */}
              <div className="bg-feps-ink text-feps-paper px-6 py-5 flex items-center justify-between">
                <h3 className="m-0 font-serif font-bold text-xl">
                  {editingEvent
                    ? t('editModalTitle', { title: editingEvent.title })
                    : t('addModalTitle')}
                </h3>
                  <button
                  onClick={() => setIsModalOpen(false)}
                  className="bg-transparent hover:bg-feps-paper/10 border border-transparent hover:border-feps-paper/20 text-white w-8 h-8 flex items-center justify-center cursor-pointer transition-colors"
                >
                  <X size={18} strokeWidth={2.5} />
                </button>
              </div>

              {/* Modal Form */}
              <form onSubmit={handleSubmit} className="p-6 md:p-8 flex flex-col gap-6">

                {/* Feedback messages */}
                {statusMsg && (
                  <div className={`flex items-center gap-2 px-4 py-3 text-sm font-bold border ${statusMsg.type === 'success' ? 'bg-green-700/10 border-green-700/20 text-green-700' : 'bg-red-600/10 border-red-600/20 text-red-600'}`}>
                    {statusMsg.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                    <span>{statusMsg.text}</span>
                  </div>
                )}

                {/* Grid 2 Columns for Titles */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-start text-xs font-bold text-feps-ink mb-2 uppercase tracking-wider">
                      {t('formTitleEn')} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={form.title}
                      onChange={e => setForm({ ...form, title: e.target.value })}
                      placeholder={t('formTitleEnPlaceholder')}
                      className="w-full px-3 py-2 border border-feps-ink/20 bg-feps-paper text-feps-ink text-sm focus:outline-none focus:ring-1 focus:ring-feps-ink"
                    />
                  </div>
                  <div>
                    <label className="block text-start text-xs font-bold text-feps-ink mb-2 uppercase tracking-wider">
                      {t('formTitleAr')}
                    </label>
                    <input
                      type="text"
                      className={`w-full px-3 py-2 border border-feps-ink/20 bg-feps-paper text-feps-ink text-sm focus:outline-none focus:ring-1 focus:ring-feps-ink arabic ${locale === 'ar' ? 'text-right' : 'text-left'}`}
                      value={form.titleAr}
                      onChange={e => setForm({ ...form, titleAr: e.target.value })}
                      placeholder={t('formTitleArPlaceholder')}
                    />
                  </div>
                </div>

                {/* Grid 2 Columns for Type & Location */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-start text-xs font-bold text-feps-ink mb-2 uppercase tracking-wider">
                      {t('formType')} <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={form.categoryId}
                      onChange={e => setForm({ ...form, categoryId: e.target.value })}
                      className="w-full px-3 py-2 border border-feps-ink/20 bg-feps-paper text-feps-ink text-sm focus:outline-none focus:ring-1 focus:ring-feps-ink cursor-pointer"
                    >
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {locale === 'ar' ? cat.nameAr : locale === 'fr' ? cat.nameFr : cat.nameEn}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-start text-xs font-bold text-feps-ink mb-2 uppercase tracking-wider">
                      {t('formLocation')}
                    </label>
                    <LocationCombobox
                      value={form.location || ''}
                      onChange={val => setForm({ ...form, location: val })}
                      placeholder={t('formLocationPlaceholder')}
                      isAr={isAr}
                    />
                  </div>
                </div>

                {/* Date & Time Settings */}
                <div className="bg-white p-5 border border-feps-navy/20 shadow-sm">
                  <div className="flex items-center justify-between mb-5 border-b border-feps-navy/10 pb-3">
                    <label className="text-sm font-bold text-feps-navy uppercase tracking-widest">
                      {t('dateAndTime')}
                    </label>
                    <label className="flex items-center gap-3 text-xs font-bold text-feps-ink cursor-pointer bg-feps-navy/5 px-3 py-1.5 border border-feps-navy/10 hover:bg-feps-navy/10 transition-colors">
                      <input
                        type="checkbox"
                        checked={isSingleDay}
                        onChange={(e) => setIsSingleDay(e.target.checked)}
                        className="accent-feps-navy w-4 h-4 cursor-pointer"
                      />
                      <span>{t('singleDayEvent')}</span>
                    </label>
                  </div>

                  {isSingleDay ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-start text-[11px] font-bold text-feps-ink/80 mb-2 uppercase tracking-widest">
                          {t('date')}
                        </label>
                        <input
                          type="date"
                          required
                          value={form.startDate.split('T')[0] || ''}
                          onChange={e => {
                            const newDate = e.target.value
                            const oldStartTime = form.startDate.split('T')[1] || '09:00'
                            const oldEndTime = form.endDate ? form.endDate.split('T')[1] : ''
                            setForm({
                              ...form,
                              startDate: newDate ? `${newDate}T${oldStartTime}` : '',
                              endDate: (newDate && oldEndTime) ? `${newDate}T${oldEndTime}` : ''
                            })
                          }}
                          className="w-full px-3 py-2 border border-feps-ink/20 bg-feps-paper text-feps-ink text-sm focus:outline-none focus:ring-1 focus:ring-feps-ink"
                        />
                      </div>
                      <div>
                        <label className="block text-start text-[11px] font-bold text-feps-ink/80 mb-2 uppercase tracking-widest">
                          {t('startTime')}
                        </label>
                        <input
                          type="time"
                          required
                          value={form.startDate.split('T')[1] || ''}
                          onChange={e => {
                            const newTime = e.target.value
                            const datePart = form.startDate.split('T')[0] || ''
                            if (datePart) {
                              setForm({ ...form, startDate: `${datePart}T${newTime}` })
                            } else {
                              const today = new Date().toISOString().split('T')[0]
                              setForm({ ...form, startDate: `${today}T${newTime}` })
                            }
                          }}
                          className="w-full px-3 py-2 border border-feps-ink/20 bg-feps-paper text-feps-ink text-sm focus:outline-none focus:ring-1 focus:ring-feps-ink"
                        />
                      </div>
                      <div>
                        <label className="block text-start text-[11px] font-bold text-feps-ink/80 mb-2 uppercase tracking-widest">
                          {t('endTime')}
                        </label>
                        <input
                          type="time"
                          value={form.endDate ? form.endDate.split('T')[1] : ''}
                          onChange={e => {
                            const newTime = e.target.value
                            const datePart = form.startDate.split('T')[0] || ''
                            if (datePart && newTime) {
                              setForm({ ...form, endDate: `${datePart}T${newTime}` })
                            } else if (!newTime) {
                              setForm({ ...form, endDate: '' })
                            }
                          }}
                          className="w-full px-3 py-2 border border-feps-ink/20 bg-feps-paper text-feps-ink text-sm focus:outline-none focus:ring-1 focus:ring-feps-ink"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-start text-[11px] font-bold text-feps-ink/80 mb-2 uppercase tracking-widest">
                          {t('formStartDate')}
                        </label>
                        <input
                          type="datetime-local"
                          required
                          value={form.startDate}
                          onChange={e => setForm({ ...form, startDate: e.target.value })}
                          className="w-full px-3 py-2 border border-feps-ink/20 bg-feps-paper text-feps-ink text-sm focus:outline-none focus:ring-1 focus:ring-feps-ink"
                        />
                      </div>
                      <div>
                        <label className="block text-start text-[11px] font-bold text-feps-ink/80 mb-2 uppercase tracking-widest">
                          {t('formEndDate')}
                        </label>
                        <input
                          type="datetime-local"
                          value={form.endDate}
                          onChange={e => setForm({ ...form, endDate: e.target.value })}
                          className="w-full px-3 py-2 border border-feps-ink/20 bg-feps-paper text-feps-ink text-sm focus:outline-none focus:ring-1 focus:ring-feps-ink"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label className="block text-start text-xs font-bold text-feps-ink mb-2 uppercase tracking-wider">
                    {t('formDesc')}
                  </label>
                  <textarea
                    rows={3}
                    value={form.description}
                    onChange={e => setForm({ ...form, description: e.target.value })}
                    placeholder={t('formDescPlaceholder')}
                    className="w-full px-3 py-2 border border-feps-ink/20 bg-feps-paper text-feps-ink text-sm focus:outline-none focus:ring-1 focus:ring-feps-ink resize-y font-inherit"
                  />
                </div>

                {/* Agenda Cells (Dynamic Form Rows) */}
                <div>
                  <label className="block text-start text-sm font-bold text-feps-navy mb-4 border-b border-feps-navy/10 pb-2 uppercase tracking-widest">
                    {t('formAgenda')}
                  </label>

                  <div className="flex flex-col gap-3 mb-4">
                    {agendaCells.map((cell, idx) => (
                      <div
                        key={idx}
                        className={`grid grid-cols-1 sm:grid-cols-[100px_120px_120px_1fr_40px] gap-3 items-start bg-white p-4 border border-feps-navy/20 shadow-sm ${locale === 'ar' ? 'border-r-4 border-r-feps-navy' : 'border-l-4 border-l-feps-navy'}`}
                      >
                        {/* Day Column (Optional, e.g. Day 1, Day 2) */}
                        <div className="w-full">
                          <input
                            type="text"
                            value={cell.day || ''}
                            onChange={e => {
                              const newCells = [...agendaCells]
                              newCells[idx].day = e.target.value
                              setAgendaCells(newCells)
                            }}
                            placeholder={t('agendaDay')}
                            className="w-full h-9 px-2 py-1.5 border border-feps-ink/20 bg-feps-paper text-feps-ink text-sm focus:outline-none focus:border-feps-navy transition-colors"
                          />
                        </div>

                        {/* Start Time */}
                        <div className="w-full">
                          <input
                            type="time"
                            value={cell.startTime}
                            onChange={e => {
                              const newCells = [...agendaCells]
                              newCells[idx].startTime = e.target.value
                              setAgendaCells(newCells)
                            }}
                            className="w-full h-9 px-2 py-1.5 border border-feps-ink/20 bg-feps-paper text-feps-ink text-sm focus:outline-none focus:border-feps-navy transition-colors"
                          />
                        </div>

                        {/* End Time */}
                        <div className="w-full">
                          <input
                            type="time"
                            value={cell.endTime}
                            onChange={e => {
                              const newCells = [...agendaCells]
                              newCells[idx].endTime = e.target.value
                              setAgendaCells(newCells)
                            }}
                            className="w-full h-9 px-2 py-1.5 border border-feps-ink/20 bg-feps-paper text-feps-ink text-sm focus:outline-none focus:border-feps-navy transition-colors"
                          />
                        </div>

                        {/* Description / Text */}
                        <div className="w-full">
                          <input
                            type="text"
                            value={cell.text}
                            onChange={e => {
                              const newCells = [...agendaCells]
                              newCells[idx].text = e.target.value
                              setAgendaCells(newCells)
                            }}
                            placeholder={t('agendaText')}
                            className="w-full h-9 px-2 py-1.5 border border-feps-ink/20 bg-feps-paper text-feps-ink text-sm focus:outline-none focus:border-feps-navy transition-colors"
                          />
                        </div>

                        {/* Delete button */}
                        <button
                          type="button"
                          onClick={() => {
                            if (agendaCells.length > 1) {
                              setAgendaCells(agendaCells.filter((_, i) => i !== idx))
                            } else {
                              setAgendaCells([{ day: '', startTime: '', endTime: '', text: '' }])
                            }
                          }}
                          className="w-full h-9 bg-transparent border border-red-500 text-red-600 cursor-pointer flex items-center justify-center hover:bg-red-50 hover:text-red-700 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => setAgendaCells([...agendaCells, { day: '', startTime: '', endTime: '', text: '' }])}
                    className="inline-flex items-center gap-1.5 bg-feps-navy border border-feps-navy text-white px-4 py-2 text-xs font-bold uppercase tracking-widest cursor-pointer mt-2 hover:bg-feps-gold hover:border-feps-gold hover:text-feps-navy transition-colors"
                  >
                    <Plus size={14} />
                    <span>{t('addAgendaRow')}</span>
                  </button>
                     {/* Image Upload */}
                  <div className="relative border-2 border-feps-navy bg-white hover:bg-feps-navy/5 transition-colors overflow-hidden group h-32 flex flex-col items-center justify-center">
                    {!imageUrlPreview ? (
                      <>
                        <label htmlFor="image-upload" className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-xs font-bold text-feps-ink cursor-pointer z-10">
                          <ImageIcon size={24} className="text-feps-ink/50" />
                          <span>{t('uploadImage')}</span>
                          <span className="text-[10px] font-normal text-feps-ink-secondary mt-0.5">Click to browse</span>
                        </label>
                        <input
                          id="image-upload"
                          type="file"
                          accept="image/*"
                          onChange={e => {
                            if (e.target.files?.[0]) {
                              setImageFile(e.target.files[0])
                              setImageUrlPreview(URL.createObjectURL(e.target.files[0]))
                            }
                          }}
                          className="hidden"
                        />
                      </>
                    ) : (
                      <div className="absolute inset-0 w-full h-full z-20 group">
                        <img src={imageUrlPreview} alt="Preview" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                          <button
                            type="button"
                            onClick={(e) => { e.preventDefault(); setImageFile(null); setImageUrlPreview(null); }}
                            className="bg-red-600 text-white px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 hover:bg-red-700 transition-transform hover:scale-105 shadow-xl"
                          >
                            <X size={14} /> Remove Image
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Agenda File Upload */}
                  <div className="relative border-2 border-feps-navy bg-white hover:bg-feps-navy/5 transition-colors overflow-hidden h-32 flex flex-col items-center justify-center">
                    {!agendaFileName ? (
                      <>
                        <label htmlFor="agenda-upload" className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-xs font-bold text-feps-ink cursor-pointer z-10">
                          <FileText size={24} className="text-feps-ink/50" />
                          <span>{t('uploadAgenda')}</span>
                          <span className="text-[10px] font-normal text-feps-ink-secondary mt-0.5">PDF, DOC, DOCX, JPG</span>
                        </label>
                        <input
                          id="agenda-upload"
                          type="file"
                          accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                          onChange={e => {
                            if (e.target.files?.[0]) {
                              setAgendaFile(e.target.files[0])
                              setAgendaFileName(e.target.files[0].name)
                            }
                          }}
                          className="hidden"
                        />
                      </>
                    ) : (
                      <div className="absolute inset-0 z-20 flex items-center justify-center p-4">
                        <div className="bg-white border border-feps-navy shadow-sm p-3 flex items-center gap-3 w-full max-w-[200px]">
                          <div className="bg-feps-navy text-white p-2 shrink-0">
                            <FileText size={20} />
                          </div>
                          <div className="flex-1 overflow-hidden">
                            <p className="text-xs font-bold text-feps-ink truncate" title={agendaFileName}>{agendaFileName}</p>
                            <p className="text-[10px] text-feps-ink-secondary uppercase">Document Attached</p>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => { e.preventDefault(); setAgendaFile(null); setAgendaFileName(null); }}
                            className="shrink-0 w-6 h-6 bg-transparent border border-red-500 text-red-600 flex items-center justify-center hover:bg-red-600 hover:text-white transition-colors"
                          >
                            <X size={14} strokeWidth={3} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Published switch */}
                <div className="flex items-center gap-4 mt-4 bg-white border border-feps-navy/20 p-4">
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, published: !form.published })}
                    className={`shrink-0 w-8 h-8 flex items-center justify-center border-2 transition-colors ${form.published ? 'bg-feps-navy border-feps-navy text-feps-gold' : 'bg-transparent border-feps-ink/20 text-transparent hover:border-feps-navy'}`}
                  >
                    <Check size={20} strokeWidth={3} />
                  </button>
                  <div>
                    <span className="block text-sm font-bold text-feps-ink tracking-tight">
                      {t('publishImmediately')}
                    </span>
                    <span className="text-[11px] text-feps-ink-secondary mt-0.5 font-bold">
                      {t('publishDesc')}
                    </span>
                  </div>
                </div>

                {/* Actions Button */}
                <div className="flex justify-end gap-3 mt-4 border-t border-feps-ink/20 pt-5">
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => setIsModalOpen(false)}
                    className="bg-transparent border-2 border-feps-ink/20 text-feps-ink-secondary px-6 py-2.5 font-bold text-sm uppercase tracking-widest cursor-pointer transition-colors hover:border-feps-ink hover:text-feps-ink"
                  >
                    {t('cancel')}
                  </button>

                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-feps-navy text-white border-2 border-feps-navy px-6 py-2.5 font-bold text-sm uppercase tracking-widest cursor-pointer shadow-none flex items-center gap-2 transition-colors hover:bg-feps-gold hover:text-feps-navy hover:border-feps-gold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading && <Loader className="animate-spin" size={16} />}
                    <span>{editingEvent ? t('saveChanges') : t('createEvent')}</span>
                  </button>
                </div>

              </form>
            </div>
          </div>
        </div>
      )}
      {/* Report Modal */}
      {reportModalEvent && (
        <div
          className="fixed inset-0 bg-black/60 z-[1001] flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={() => setReportModalEvent(null)}
        >
          <div
            className="bg-feps-paper border border-feps-ink/20 shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col"
            onClick={e => e.stopPropagation()}
            dir={isAr ? 'rtl' : 'ltr'}
          >
            {/* Header */}
            <div className="bg-feps-navy text-white px-6 py-5 flex items-center justify-between">
              <div>
                <p className="font-mono text-xs uppercase tracking-widest text-white/60 mb-1">
                  {isAr ? 'تقرير الفعالية' : 'Event Report'}
                </p>
                <h3 className="m-0 font-serif font-bold text-lg leading-tight">
                  {isAr ? (reportModalEvent.titleAr || reportModalEvent.title) : reportModalEvent.title}
                </h3>
              </div>
              <button
                onClick={() => setReportModalEvent(null)}
                className="bg-transparent hover:bg-white/10 border border-transparent hover:border-white/20 text-white w-8 h-8 flex items-center justify-center cursor-pointer transition-colors"
              >
                <X size={18} strokeWidth={2.5} />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 md:p-8 flex flex-col gap-6">
              {/* Info Banner */}
              <div className="bg-feps-navy/5 border border-feps-navy/20 p-4 flex items-start gap-3">
                <FileText size={18} className="text-feps-navy shrink-0 mt-0.5" />
                <p className="text-xs text-feps-ink-secondary leading-relaxed">
                  {isAr
                    ? 'أدخل بيانات التقرير أدناه. سيتم حفظها تلقائياً مع الفعالية وستظهر في التقرير المطبوع والتقارير المجمعة.'
                    : 'Enter report data below. It will be saved with the event and reflected in printed and aggregated reports.'}
                </p>
              </div>

              {/* Summary */}
              <div>
                <label className="block text-start text-xs font-bold text-feps-ink mb-2 uppercase tracking-wider">
                  {isAr ? 'الملخص' : 'Summary'}
                </label>
                <textarea
                  rows={4}
                  value={reportForm.summary}
                  onChange={e => { setReportForm({ ...reportForm, summary: e.target.value }); setReportSaved(false) }}
                  placeholder={isAr ? 'اكتب ملخص الفعالية...' : 'Enter event summary...'}
                  className="w-full px-4 py-3 border border-feps-ink/20 bg-feps-paper text-feps-ink text-sm focus:outline-none focus:border-feps-navy transition-colors resize-y font-inherit"
                />
              </div>

              {/* Results */}
              <div>
                <label className="block text-start text-xs font-bold text-feps-ink mb-2 uppercase tracking-wider">
                  {isAr ? 'النتائج والمخرجات' : 'Results & Outcomes'}
                </label>
                <textarea
                  rows={4}
                  value={reportForm.results}
                  onChange={e => { setReportForm({ ...reportForm, results: e.target.value }); setReportSaved(false) }}
                  placeholder={isAr ? 'اكتب نتائج الفعالية...' : 'Enter event results...'}
                  className="w-full px-4 py-3 border border-feps-ink/20 bg-feps-paper text-feps-ink text-sm focus:outline-none focus:border-feps-navy transition-colors resize-y font-inherit"
                />
              </div>

              {/* Recommendations */}
              <div>
                <label className="block text-start text-xs font-bold text-feps-ink mb-2 uppercase tracking-wider">
                  {isAr ? 'التوصيات' : 'Recommendations'}
                </label>
                <textarea
                  rows={3}
                  value={reportForm.recommendations}
                  onChange={e => { setReportForm({ ...reportForm, recommendations: e.target.value }); setReportSaved(false) }}
                  placeholder={isAr ? 'اكتب التوصيات...' : 'Enter recommendations...'}
                  className="w-full px-4 py-3 border border-feps-ink/20 bg-feps-paper text-feps-ink text-sm focus:outline-none focus:border-feps-navy transition-colors resize-y font-inherit"
                />
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between gap-4 border-t border-feps-ink/20 pt-5">
                <div className="flex items-center gap-2 text-xs">
                  {reportSaved && (
                    <span className="flex items-center gap-1.5 text-green-700 font-bold">
                      <CheckCircle size={14} />
                      {isAr ? 'تم الحفظ' : 'Saved'}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setReportModalEvent(null)}
                    className="bg-transparent border-2 border-feps-ink/20 text-feps-ink-secondary px-6 py-2.5 font-bold text-sm uppercase tracking-widest cursor-pointer transition-colors hover:border-feps-ink hover:text-feps-ink"
                  >
                    {isAr ? 'إغلاق' : 'Close'}
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveReport}
                    disabled={reportSaving}
                    className="bg-feps-navy text-white border-2 border-feps-navy px-6 py-2.5 font-bold text-sm uppercase tracking-widest cursor-pointer flex items-center gap-2 transition-colors hover:bg-feps-gold hover:text-feps-navy hover:border-feps-gold disabled:opacity-50"
                  >
                    {reportSaving && <Loader size={14} className="animate-spin" />}
                    {isAr ? 'حفظ البيانات' : 'Save Data'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
