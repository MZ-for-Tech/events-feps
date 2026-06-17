'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Plus, Edit2, Trash2, Calendar, MapPin, Clock, ToggleLeft, ToggleRight, X, Image as ImageIcon, FileText, CheckCircle, AlertCircle, Loader } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { EVENT_TYPE_META, EventType } from '@/components/EventCard'

interface AdminEvent {
  id: string
  title: string
  titleAr?: string | null
  type: EventType
  startDate: string
  endDate?: string | null
  location?: string | null
  description?: string | null
  agendaText?: string | null
  agendaFile?: string | null
  imageUrl?: string | null
  published: boolean
}

interface Props {
  initialEvents: AdminEvent[]
  locale: string
}

export interface AgendaCell {
  day?: string
  startTime: string
  endTime: string
  text: string
}

export default function AdminEventsClient({ initialEvents, locale }: Props) {
  const router = useRouter()
  const isAr = locale === 'ar'
  const t = useTranslations('AdminEvents')

  const [events, setEvents] = useState<AdminEvent[]>(initialEvents)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<AdminEvent | null>(null)

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
    type: 'CULTURAL' as EventType,
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

  // Open modal for Create
  function handleOpenCreate() {
    setEditingEvent(null)
    setForm({
      title: '',
      titleAr: '',
      type: 'CULTURAL',
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
      type: ev.type,
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
        } catch (e) {
          // Ignore parse error, fallback to legacy text parsing
        }
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
      }
    } catch (err) {
      console.error(err)
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
      } else {
        alert('Failed to delete event')
      }
    } catch (err) {
      console.error(err)
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
        type: form.type,
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
    } catch (err: any) {
      console.error(err)
      setStatusMsg({ type: 'error', text: err.message || 'An error occurred' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-6xl">
      <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
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
          className="flex items-center gap-2 bg-feps-ink text-feps-paper px-4 py-2 font-mono text-sm tracking-widest uppercase hover:bg-black transition-colors"
        >
          <Plus size={16} />
          {t('addNew')}
        </button>
      </div>

      {/* Events Table Container */}
      <div className="border border-feps-ink/20 overflow-hidden bg-feps-paper">
        {events.length === 0 ? (
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
                {events.map(ev => {
                  const meta = EVENT_TYPE_META[ev.type] || { label: ev.type, labelAr: ev.type, labelFr: ev.type, color: 'var(--feps-navy)', bg: 'rgba(26,58,110,0.1)' }
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
                          {locale === 'ar' ? meta.labelAr : locale === 'fr' ? meta.labelFr : meta.label}
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
                        <button
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
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleOpenEdit(ev)}
                            className="bg-feps-ink/5 text-feps-ink w-8 h-8 flex items-center justify-center hover:bg-feps-ink hover:text-white transition-colors"
                            title={t('actionEdit')}
                          >
                            <Edit2 size={14} />
                          </button>

                          <button
                            onClick={() => handleDelete(ev.id)}
                            className="bg-red-50 text-red-600 w-8 h-8 flex items-center justify-center hover:bg-red-600 hover:text-white transition-colors"
                            title={t('actionDelete')}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            {/* Mobile Cards View */}
            <div className="md:hidden flex flex-col divide-y divide-feps-ink/10">
              {events.map(ev => {
                const meta = EVENT_TYPE_META[ev.type] || { label: ev.type, labelAr: ev.type, labelFr: ev.type, color: 'var(--feps-navy)', bg: 'rgba(26,58,110,0.1)' }
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
                        {locale === 'ar' ? meta.labelAr : locale === 'fr' ? meta.labelFr : meta.label}
                      </span>
                      <button
                        onClick={() => handleTogglePublish(ev)}
                        className={`flex items-center gap-1 transition-colors ${ev.published ? 'text-green-700' : 'text-feps-ink-secondary'}`}
                      >
                        {ev.published ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                        <span className="text-[10px] font-bold uppercase">{ev.published ? t('statusPublished') : t('statusDraft')}</span>
                      </button>
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
                  className="bg-white/10 hover:bg-white/20 border-none text-white rounded-full w-8 h-8 flex items-center justify-center cursor-pointer transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Modal Form */}
              <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">

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
                    <label className="block text-xs font-bold text-feps-ink mb-1.5 uppercase tracking-wider">
                      {t('formTitleEn')}
                    </label>
                    <input
                      type="text"
                      required
                      value={form.title}
                      onChange={e => setForm({ ...form, title: e.target.value })}
                      placeholder={t('formTitleEnPlaceholder')}
                      className="w-full px-3 py-2 border border-feps-ink/20 rounded bg-feps-paper text-feps-ink text-sm focus:outline-none focus:ring-1 focus:ring-feps-ink"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-feps-ink mb-1.5 uppercase tracking-wider">
                      {t('formTitleAr')}
                    </label>
                    <input
                      type="text"
                      className={`w-full px-3 py-2 border border-feps-ink/20 rounded bg-feps-paper text-feps-ink text-sm focus:outline-none focus:ring-1 focus:ring-feps-ink arabic ${locale === 'ar' ? 'text-right' : 'text-left'}`}
                      value={form.titleAr}
                      onChange={e => setForm({ ...form, titleAr: e.target.value })}
                      placeholder={t('formTitleArPlaceholder')}
                    />
                  </div>
                </div>

                {/* Grid 2 Columns for Type & Location */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-feps-ink mb-1.5 uppercase tracking-wider">
                      {t('formType')}
                    </label>
                    <select
                      value={form.type}
                      onChange={e => setForm({ ...form, type: e.target.value as EventType })}
                      className="w-full px-3 py-2 border border-feps-ink/20 rounded bg-feps-paper text-feps-ink text-sm focus:outline-none focus:ring-1 focus:ring-feps-ink cursor-pointer"
                    >
                      {Object.entries(EVENT_TYPE_META).map(([key, value]) => (
                        <option key={key} value={key}>
                          {locale === 'ar' ? value.labelAr : locale === 'fr' ? value.labelFr : value.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-feps-ink mb-1.5 uppercase tracking-wider">
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
                <div className="bg-feps-ink/5 p-4 rounded border border-feps-ink/10">
                  <div className="flex items-center justify-between mb-4">
                    <label className="text-xs font-bold text-feps-ink uppercase tracking-wider">
                      {t('dateAndTime')}
                    </label>
                    <label className="flex items-center gap-2 text-xs font-bold text-feps-ink cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isSingleDay}
                        onChange={(e) => setIsSingleDay(e.target.checked)}
                        className="accent-feps-ink w-4 h-4"
                      />
                      {t('singleDayEvent')}
                    </label>
                  </div>

                  {isSingleDay ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-feps-ink/70 mb-1.5 uppercase tracking-wider">
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
                          className="w-full px-3 py-2 border border-feps-ink/20 rounded bg-feps-paper text-feps-ink text-sm focus:outline-none focus:ring-1 focus:ring-feps-ink"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-feps-ink/70 mb-1.5 uppercase tracking-wider">
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
                          className="w-full px-3 py-2 border border-feps-ink/20 rounded bg-feps-paper text-feps-ink text-sm focus:outline-none focus:ring-1 focus:ring-feps-ink"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-feps-ink/70 mb-1.5 uppercase tracking-wider">
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
                          className="w-full px-3 py-2 border border-feps-ink/20 rounded bg-feps-paper text-feps-ink text-sm focus:outline-none focus:ring-1 focus:ring-feps-ink"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-feps-ink/70 mb-1.5 uppercase tracking-wider">
                          {t('formStartDate')}
                        </label>
                        <input
                          type="datetime-local"
                          required
                          value={form.startDate}
                          onChange={e => setForm({ ...form, startDate: e.target.value })}
                          className="w-full px-3 py-2 border border-feps-ink/20 rounded bg-feps-paper text-feps-ink text-sm focus:outline-none focus:ring-1 focus:ring-feps-ink"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-feps-ink/70 mb-1.5 uppercase tracking-wider">
                          {t('formEndDate')}
                        </label>
                        <input
                          type="datetime-local"
                          value={form.endDate}
                          onChange={e => setForm({ ...form, endDate: e.target.value })}
                          className="w-full px-3 py-2 border border-feps-ink/20 rounded bg-feps-paper text-feps-ink text-sm focus:outline-none focus:ring-1 focus:ring-feps-ink"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-bold text-feps-ink mb-1.5 uppercase tracking-wider">
                    {t('formDesc')}
                  </label>
                  <textarea
                    rows={3}
                    value={form.description}
                    onChange={e => setForm({ ...form, description: e.target.value })}
                    placeholder={t('formDescPlaceholder')}
                    className="w-full px-3 py-2 border border-feps-ink/20 rounded bg-feps-paper text-feps-ink text-sm focus:outline-none focus:ring-1 focus:ring-feps-ink resize-y font-inherit"
                  />
                </div>

                {/* Agenda Cells (Dynamic Form Rows) */}
                <div>
                  <label className="block text-xs font-bold text-feps-ink mb-1.5 uppercase tracking-wider">
                    {t('formAgenda')}
                  </label>

                  <div className="flex flex-col gap-2 mb-2">
                    {agendaCells.map((cell, idx) => (
                      <div
                        key={idx}
                        className="flex flex-wrap gap-2 items-center bg-feps-ink/5 p-3 rounded border border-feps-ink/10"
                      >
                        {/* Day Column (Optional, e.g. Day 1, Day 2) */}
                        <div className="flex-1 basis-[100px] min-w-[85px]">
                          <input
                            type="text"
                            value={cell.day || ''}
                            onChange={e => {
                              const newCells = [...agendaCells]
                              newCells[idx].day = e.target.value
                              setAgendaCells(newCells)
                            }}
                            placeholder={t('agendaDay')}
                            className="w-full px-2 py-1.5 border border-feps-ink/20 rounded bg-feps-paper text-feps-ink text-sm focus:outline-none focus:ring-1 focus:ring-feps-ink"
                          />
                        </div>

                        {/* Start Time */}
                        <div className="flex-1 basis-[120px] min-w-[110px]">
                          <input
                            type="text"
                            value={cell.startTime}
                            onChange={e => {
                              const newCells = [...agendaCells]
                              newCells[idx].startTime = e.target.value
                              setAgendaCells(newCells)
                            }}
                            placeholder={t('agendaStart')}
                            className="w-full px-2 py-1.5 border border-feps-ink/20 rounded bg-feps-paper text-feps-ink text-sm focus:outline-none focus:ring-1 focus:ring-feps-ink"
                          />
                        </div>

                        {/* End Time */}
                        <div className="flex-1 basis-[120px] min-w-[110px]">
                          <input
                            type="text"
                            value={cell.endTime}
                            onChange={e => {
                              const newCells = [...agendaCells]
                              newCells[idx].endTime = e.target.value
                              setAgendaCells(newCells)
                            }}
                            placeholder={t('agendaEnd')}
                            className="w-full px-2 py-1.5 border border-feps-ink/20 rounded bg-feps-paper text-feps-ink text-sm focus:outline-none focus:ring-1 focus:ring-feps-ink"
                          />
                        </div>

                        {/* Description / Text */}
                        <div className="flex-[2] basis-[200px] min-w-[180px]">
                          <input
                            type="text"
                            value={cell.text}
                            onChange={e => {
                              const newCells = [...agendaCells]
                              newCells[idx].text = e.target.value
                              setAgendaCells(newCells)
                            }}
                            placeholder={t('agendaText')}
                            className="w-full px-2 py-1.5 border border-feps-ink/20 rounded bg-feps-paper text-feps-ink text-sm focus:outline-none focus:ring-1 focus:ring-feps-ink"
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
                          className="bg-transparent border-none text-red-500 cursor-pointer flex items-center justify-center p-1.5 rounded-full hover:bg-red-50 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => setAgendaCells([...agendaCells, { day: '', startTime: '', endTime: '', text: '' }])}
                    className="inline-flex items-center gap-1.5 bg-feps-ink/5 border border-feps-ink/20 rounded text-feps-ink px-3 py-1.5 text-xs font-bold cursor-pointer mt-1 hover:bg-feps-ink/10 transition-colors"
                  >
                    <Plus size={14} />
                    <span>{t('addAgendaRow')}</span>
                  </button>
                </div>

                {/* Image & Agenda Uploads */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Image Upload */}
                  <div className="border border-dashed border-feps-ink/20 rounded p-4 bg-feps-ink/5">
                    <label className="flex items-center gap-2 text-xs font-bold text-feps-ink mb-2 cursor-pointer">
                      <ImageIcon size={16} className="text-feps-ink/50" />
                      <span>{t('uploadImage')}</span>
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={e => {
                        if (e.target.files?.[0]) {
                          setImageFile(e.target.files[0])
                          setImageUrlPreview(URL.createObjectURL(e.target.files[0]))
                        }
                      }}
                      className="text-xs text-feps-ink-secondary"
                    />
                    {imageUrlPreview && (
                      <div className="mt-3 relative w-[100px] h-[60px] rounded overflow-hidden border border-feps-ink/20">
                        <img src={imageUrlPreview} alt="Preview" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => { setImageFile(null); setImageUrlPreview(null) }}
                          className="absolute top-0.5 right-0.5 bg-black/50 border-none text-white rounded-full w-4 h-4 flex items-center justify-center cursor-pointer"
                        >
                          <X size={10} />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Agenda File Upload */}
                  <div className="border border-dashed border-feps-ink/20 rounded p-4 bg-feps-ink/5">
                    <label className="flex items-center gap-2 text-xs font-bold text-feps-ink mb-2 cursor-pointer">
                      <FileText size={16} className="text-feps-ink/50" />
                      <span>{t('uploadAgenda')}</span>
                    </label>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                      onChange={e => {
                        if (e.target.files?.[0]) {
                          setAgendaFile(e.target.files[0])
                          setAgendaFileName(e.target.files[0].name)
                        }
                      }}
                      className="text-xs text-feps-ink-secondary"
                    />
                    {agendaFileName && (
                      <div className="mt-3 flex items-center justify-between bg-feps-paper p-1.5 rounded border border-feps-ink/20">
                        <span className="text-xs text-feps-ink overflow-hidden text-ellipsis whitespace-nowrap max-w-[150px]">
                          {agendaFileName}
                        </span>
                        <button
                          type="button"
                          onClick={() => { setAgendaFile(null); setAgendaFileName(null) }}
                          className="bg-transparent border-none text-red-500 cursor-pointer flex items-center p-1 rounded-full hover:bg-red-50 transition-colors"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Published switch */}
                <div className="flex items-center gap-3 mt-2">
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, published: !form.published })}
                    className={`bg-transparent border-none cursor-pointer p-0 flex items-center transition-colors ${form.published ? 'text-green-700' : 'text-feps-ink-secondary'}`}
                  >
                    {form.published ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
                  </button>
                  <div>
                    <span className="block text-sm font-bold text-feps-ink">
                      {t('publishImmediately')}
                    </span>
                    <span className="text-xs text-feps-ink-secondary">
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
                    className="bg-transparent border border-feps-ink/20 text-feps-ink-secondary px-5 py-2 rounded font-bold text-sm cursor-pointer transition-colors hover:bg-feps-ink/5 hover:text-feps-ink"
                  >
                    {t('cancel')}
                  </button>

                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-feps-ink text-feps-paper border-none px-6 py-2 rounded font-bold text-sm cursor-pointer shadow-sm flex items-center gap-2 transition-colors hover:bg-black disabled:opacity-80 disabled:cursor-not-allowed"
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

    </div>
  )
}
