'use client'

import React, { useState, useEffect } from 'react'
import { AdminModal } from '@/components/admin/AdminModal'
import { useTranslations } from 'next-intl'
import { CheckCircle, AlertCircle, Plus, Image as ImageIcon, FileText, X, Check, Loader, Trash2 } from 'lucide-react'
import { LocationCombobox } from './LocationCombobox'
import { AdminEvent, AgendaCell, EventPayload } from './types'
import { EventCategoryData } from '@/components/EventCard'

interface EventFormModalProps {
  isOpen: boolean
  onClose: () => void
  editingEvent: AdminEvent | null
  categories: EventCategoryData[]
  locale: string
  isAr: boolean
  onSave: (payload: EventPayload, imageFile: File | null, agendaFile: File | null) => Promise<void>
}

export function EventFormModal({
  isOpen,
  onClose,
  editingEvent,
  categories,
  locale,
  isAr,
  onSave,
}: EventFormModalProps) {
  const t = useTranslations('AdminEvents')

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

  // Initialize form when modal opens
  useEffect(() => {
    if (isOpen) {
      if (editingEvent) {
        const formatInputDate = (isoStr: string | null | undefined) => {
          if (!isoStr) return ''
          const d = new Date(isoStr)
          const pad = (num: number) => String(num).padStart(2, '0')
          return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
        }

        const startStr = formatInputDate(editingEvent.startDate)
        const endStr = formatInputDate(editingEvent.endDate)
        const startDatePart = startStr.split('T')[0]
        const endDatePart = endStr.split('T')[0]

        if (endStr && startDatePart !== endDatePart) {
          setIsSingleDay(false)
        } else {
          setIsSingleDay(true)
        }

        setForm({
          title: editingEvent.title,
          titleAr: editingEvent.titleAr || '',
          categoryId: editingEvent.categoryId,
          startDate: startStr,
          endDate: endStr,
          location: editingEvent.location || '',
          description: editingEvent.description || '',
          agendaText: editingEvent.agendaText || '',
          published: editingEvent.published,
        })

        // Parse agendaText into agendaCells
        let initialCells: AgendaCell[] = []
        if (editingEvent.agendaText) {
          const trimmed = editingEvent.agendaText.trim()
          if (trimmed.startsWith('[')) {
            try {
              initialCells = JSON.parse(trimmed)
            } catch {}
          }

          if (initialCells.length === 0) {
            const lines = editingEvent.agendaText.split('\n').filter(l => l.trim() !== '')
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
        setImageUrlPreview(editingEvent.imageUrl || null)
        setAgendaFileName(editingEvent.agendaFile ? editingEvent.agendaFile.split('/').pop() || null : null)
        setStatusMsg(null)
      } else {
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
      }
    }
  }, [isOpen, editingEvent, categories])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setStatusMsg(null)

    try {
      const filteredCells = agendaCells.filter(c => c.day || c.startTime || c.endTime || c.text)
      const agendaTextPayload = filteredCells.length > 0 ? JSON.stringify(filteredCells) : null

      const payload = {
        title: form.title,
        titleAr: form.titleAr || null,
        categoryId: form.categoryId,
        startDate: form.startDate ? new Date(form.startDate).toISOString() : '',
        endDate: form.endDate ? new Date(form.endDate).toISOString() : null,
        location: form.location || null,
        description: form.description || null,
        agendaText: agendaTextPayload,
        published: form.published,
      }

      await onSave(payload, imageFile, agendaFile)
      setStatusMsg({ type: 'success', text: editingEvent ? t('eventUpdated') : t('eventCreated') })
      setTimeout(() => {
        onClose()
      }, 1500)
    } catch (err: unknown) {
      console.error(err)
      setStatusMsg({ type: 'error', text: err instanceof Error ? err.message : 'An error occurred' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <AdminModal
      isOpen={isOpen}
      onClose={onClose}
      title={editingEvent ? t('editModalTitle', { title: editingEvent.title }) : t('addModalTitle')}
      maxWidthClass="max-w-2xl"
    >
      <div dir={isAr ? 'rtl' : 'ltr'} className="flex flex-col w-full">
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
                  {/* Day Column */}
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
            <div className="relative border-2 border-feps-navy bg-white hover:bg-feps-navy/5 transition-colors overflow-hidden group h-32 flex flex-col items-center justify-center mt-6">
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
                  {/* eslint-disable-next-line @next/next/no-img-element */}
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
            <div className="relative border-2 border-feps-navy bg-white hover:bg-feps-navy/5 transition-colors overflow-hidden h-32 flex flex-col items-center justify-center mt-4">
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
              onClick={onClose}
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
    </AdminModal>
  )
}
