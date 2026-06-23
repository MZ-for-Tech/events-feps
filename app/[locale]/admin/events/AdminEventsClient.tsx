'use client'

import React, { useState, useEffect } from 'react'
import { Plus, Calendar } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { EventCategoryData } from '@/components/EventCard'
import { AdminEvent, EventPayload } from '@/components/admin/events/types'
import { AdminEventsTable } from '@/components/admin/events/AdminEventsTable'
import { EventFormModal } from '@/components/admin/events/EventFormModal'
import { EventReportModal } from '@/components/admin/events/EventReportModal'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { AdminButton } from '@/components/admin/AdminButton'

interface Props {
  initialEvents: AdminEvent[]
  categories: EventCategoryData[]
  locale: string
  permissions: string[]
  role?: string
}

export default function AdminEventsClient({ initialEvents, categories, locale, permissions, role }: Props) {
  const router = useRouter()
  const isAr = locale === 'ar'
  const t = useTranslations('AdminEvents')

  const [events, setEvents] = useState<AdminEvent[]>(initialEvents)
  const [activeTab, setActiveTab] = useState<'active' | 'archived'>('active')

  // Form Modal state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<AdminEvent | null>(null)

  // Report Modal state
  const [reportModalEvent, setReportModalEvent] = useState<AdminEvent | null>(null)

  const canPublish = role === 'SUPERADMIN' || permissions.includes('events:publish')
  const canDelete = role === 'SUPERADMIN' || permissions.includes('events:delete')

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const editId = params.get('edit')
    if (editId) {
      const ev = events.find(e => e.id === editId)
      if (ev) {
        setTimeout(() => {
          setEditingEvent(ev)
          setIsModalOpen(true)
        }, 0)
        // Clean up URL without triggering navigation
        window.history.replaceState(null, '', window.location.pathname)
      }
    }
  }, [events])

  function handleOpenCreate() {
    setEditingEvent(null)
    setIsModalOpen(true)
  }

  function handleOpenEdit(ev: AdminEvent) {
    setEditingEvent(ev)
    setIsModalOpen(true)
  }

  function handleOpenReport(ev: AdminEvent) {
    setReportModalEvent(ev)
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

  // Save Event (Create or Edit)
  async function handleSaveEvent(payload: EventPayload, imageFile: File | null, agendaFile: File | null) {
    // 1. Upload files if selected
    let finalImageUrl = payload.imageUrl || (editingEvent?.imageUrl || null)
    let finalAgendaFile = payload.agendaFile || (editingEvent?.agendaFile || null)

    if (imageFile) {
      finalImageUrl = await uploadFile(imageFile, 'image')
    }

    if (agendaFile) {
      finalAgendaFile = await uploadFile(agendaFile, 'agenda')
    }

    // 2. Prepare payload with files
    const fullPayload = {
      ...payload,
      imageUrl: finalImageUrl,
      agendaFile: finalAgendaFile,
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
      body: JSON.stringify(fullPayload),
    })

    if (!res.ok) {
      const errorText = await res.text()
      throw new Error(errorText || 'Server request failed')
    }

    const savedEvent = await res.json()

    // 4. Update state
    if (editingEvent) {
      setEvents(events.map(item => item.id === editingEvent.id ? savedEvent : item))
    } else {
      setEvents([savedEvent, ...events])
    }
  }

  // Save report data to DB
  async function handleSaveReport(eventId: string, payload: { summary: string | null; results: string | null; recommendations: string | null }) {
    const res = await fetch(`/api/events/${eventId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        reportSummary: payload.summary,
        reportResults: payload.results,
        reportRecommendations: payload.recommendations,
      }),
    })
    
    if (!res.ok) {
      throw new Error('Failed to save report')
    }
    
    const updated = await res.json()
    setEvents(events.map(item => item.id === eventId ? {
      ...item,
      reportSummary: updated.reportSummary,
      reportResults: updated.reportResults,
      reportRecommendations: updated.reportRecommendations,
    } : item))
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

  return (
    <div dir={isAr ? 'rtl' : 'ltr'}>
      <AdminPageHeader
        title={t('pageTitle')}
        description={t('pageDesc')}
        icon={Calendar}
        action={
          <AdminButton onClick={handleOpenCreate} icon={Plus} data-tour="admin-create-event">
            {t('addNew')}
          </AdminButton>
        }
      />

      <AdminEventsTable
        events={events}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        locale={locale}
        isAr={isAr}
        canPublish={canPublish}
        canDelete={canDelete}
        onTogglePublish={handleTogglePublish}
        onEdit={handleOpenEdit}
        onDelete={handleDelete}
        onArchive={handleArchive}
        onRestore={handleRestore}
        onOpenReport={handleOpenReport}
      />

      <EventFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editingEvent={editingEvent}
        categories={categories}
        locale={locale}
        isAr={isAr}
        onSave={handleSaveEvent}
      />

      <EventReportModal
        isOpen={!!reportModalEvent}
        onClose={() => setReportModalEvent(null)}
        event={reportModalEvent}
        locale={locale}
        isAr={isAr}
        onSaveReport={handleSaveReport}
      />
    </div>
  )
}
