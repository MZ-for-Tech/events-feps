'use client'

import React from 'react'
import {
  Calendar, MapPin, Clock, ToggleLeft, ToggleRight, FileText,
  Archive, FolderOpen, ChevronRight, Edit2, Trash2, Printer
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { AdminEvent } from './types'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/admin/AdminTable'

interface AdminEventsTableProps {
  events: AdminEvent[]
  activeTab: 'active' | 'archived'
  setActiveTab: (tab: 'active' | 'archived') => void
  locale: string
  isAr: boolean
  canPublish: boolean
  canDelete: boolean
  onTogglePublish: (ev: AdminEvent) => void
  onEdit: (ev: AdminEvent) => void
  onDelete: (id: string) => void
  onArchive: (ev: AdminEvent) => void
  onRestore: (ev: AdminEvent) => void
  onOpenReport: (ev: AdminEvent) => void
}

export function AdminEventsTable({
  events,
  activeTab,
  setActiveTab,
  locale,
  isAr,
  canPublish,
  canDelete,
  onTogglePublish,
  onEdit,
  onDelete,
  onArchive,
  onRestore,
  onOpenReport,
}: AdminEventsTableProps) {
  const router = useRouter()
  const t = useTranslations('AdminEvents')

  const filteredEvents = events.filter(e =>
    activeTab === 'archived' ? e.status === 'ARCHIVED' : (e.status || 'ACTIVE') === 'ACTIVE'
  )

  return (
    <div className="border border-feps-ink/20 overflow-hidden bg-feps-paper">
      {/* Tabs */}
      <div className="flex border-b border-feps-ink/20">
        <button
          onClick={() => setActiveTab('active')}
          className={`flex items-center gap-2 px-6 py-3 text-xs font-bold uppercase tracking-widest border-b-2 transition-colors ${activeTab === 'active' ? 'border-feps-navy text-feps-navy bg-feps-navy/5' : 'border-transparent text-feps-ink-secondary hover:text-feps-ink'}`}
        >
          <FolderOpen size={14} />
          {t('activeEvents')}
          <span className="bg-feps-navy/10 text-feps-navy px-1.5 py-0.5 text-[10px]">
            {events.filter(e => (e.status || 'ACTIVE') === 'ACTIVE').length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('archived')}
          className={`flex items-center gap-2 px-6 py-3 text-xs font-bold uppercase tracking-widest border-b-2 transition-colors ${activeTab === 'archived' ? 'border-feps-gold text-feps-ink bg-feps-gold/10' : 'border-transparent text-feps-ink-secondary hover:text-feps-ink'}`}
        >
          <Archive size={14} />
          {t('archived')}
          <span className="bg-feps-gold/20 text-feps-ink px-1.5 py-0.5 text-[10px]">
            {events.filter(e => e.status === 'ARCHIVED').length}
          </span>
        </button>
      </div>

      {filteredEvents.length === 0 ? (
        <div className="p-12 text-center text-feps-ink-secondary">
          <Calendar size={48} className="opacity-20 mb-4 mx-auto" />
          <p className="font-sans text-sm uppercase tracking-wider">{t('noEvents')}</p>
        </div>
      ) : (
        <div>
          <Table className="hidden md:table">
            <TableHeader>
              <TableRow>
                <TableHead>
                  {t('colType')}
                </TableHead>
                <TableHead>
                  {t('colTitle')}
                </TableHead>
                <TableHead>
                  {t('colDateTime')}
                </TableHead>
                <TableHead>
                  {t('colLocation')}
                </TableHead>
                <TableHead>
                  {t('colPublished')}
                </TableHead>
                <TableHead className="text-center">
                  {t('colActions')}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEvents.map(ev => {
                const meta = ev.category || { nameAr: 'غير محدد', nameEn: 'Unknown', nameFr: 'Inconnu', color: 'var(--feps-navy)', bg: 'rgba(26,58,110,0.1)' }
                const date = new Date(ev.startDate)
                const formattedDate = date.toLocaleDateString(isAr ? 'ar-EG-u-nu-latn' : 'en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })
                const formattedTime = date.toLocaleTimeString(isAr ? 'ar-EG-u-nu-latn' : 'en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                })

                return (
                  <TableRow key={ev.id}>
                    {/* Type Badge */}
                    <TableCell>
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2 py-0.5 rounded-full" style={{ color: meta.color, background: meta.bg }}>
                        <span className="w-1.5 h-1.5 rounded-full" style={{ background: meta.color }} />
                        {locale === 'ar' ? meta.nameAr : locale === 'fr' ? meta.nameFr : meta.nameEn}
                      </span>
                    </TableCell>

                    {/* Title */}
                    <TableCell>
                      <div className="font-bold text-feps-ink text-sm">
                        {ev.title}
                      </div>
                      {ev.titleAr && (
                        <div className="arabic text-xs text-feps-ink-secondary mt-1">
                          {ev.titleAr}
                        </div>
                      )}
                    </TableCell>

                    {/* Date & Time */}
                    <TableCell className="text-sm text-feps-ink-secondary">
                      <div className="flex items-center gap-2 font-bold text-feps-ink">
                        <Calendar size={14} className="text-feps-ink/50" />
                        {formattedDate}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Clock size={14} className="text-feps-ink/50" />
                        {formattedTime}
                      </div>
                    </TableCell>

                    {/* Location */}
                    <TableCell className="text-sm text-feps-ink-secondary">
                      {ev.location ? (
                        <div className="flex items-center gap-2">
                          <MapPin size={14} className="text-feps-ink/50 shrink-0" />
                          <span>{ev.location}</span>
                        </div>
                      ) : (
                        <span className="italic opacity-50">—</span>
                      )}
                    </TableCell>

                    {/* Published State Quick-toggle */}
                    <TableCell>
                      {canPublish ? (
                        <button
                          data-tour="admin-publish-toggle"
                          onClick={() => onTogglePublish(ev)}
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
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="text-center">
                      <div data-tour="admin-actions" className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => onEdit(ev)}
                          className="bg-feps-ink/5 text-feps-ink w-8 h-8 flex items-center justify-center hover:bg-feps-ink hover:text-white transition-colors"
                          title={t('actionEdit')}
                        >
                          <Edit2 size={14} />
                        </button>

                        {canDelete && (
                          <button
                            onClick={() => onDelete(ev.id)}
                            className="bg-red-50 text-red-600 w-8 h-8 flex items-center justify-center hover:bg-red-600 hover:text-white transition-colors"
                            title={t('actionDelete')}
                          >
                            <Trash2 size={14} />
                          </button>
                        )}

                        {activeTab === 'active' ? (
                          <button
                            onClick={() => onArchive(ev)}
                            className="bg-amber-50 text-amber-700 w-8 h-8 flex items-center justify-center hover:bg-amber-600 hover:text-white transition-colors"
                            title={t('markArchive')}
                          >
                            <Archive size={14} />
                          </button>
                        ) : (
                          <>
                            <button
                              onClick={() => router.push(`/${locale}/admin/events/${ev.id}`)}
                              className="bg-feps-navy text-white w-8 h-8 flex items-center justify-center hover:bg-feps-gold hover:text-feps-navy transition-colors"
                              title={t('manageEvent')}
                            >
                              <FileText size={14} />
                            </button>
                            <button
                              onClick={() => onRestore(ev)}
                              className="bg-green-50 text-green-700 w-8 h-8 flex items-center justify-center hover:bg-green-600 hover:text-white transition-colors"
                              title={t('restoreActive')}
                            >
                              <ChevronRight size={14} />
                            </button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
          {/* Mobile Cards View */}
          <div className="md:hidden flex flex-col divide-y divide-feps-ink/10">
            {filteredEvents.map(ev => {
              const meta = ev.category || { nameAr: 'غير محدد', nameEn: 'Unknown', nameFr: 'Inconnu', color: 'var(--feps-navy)', bg: 'rgba(26,58,110,0.1)' }
              const date = new Date(ev.startDate)
              const formattedDate = date.toLocaleDateString(isAr ? 'ar-EG-u-nu-latn' : 'en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })
              const formattedTime = date.toLocaleTimeString(isAr ? 'ar-EG-u-nu-latn' : 'en-US', {
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
                        onClick={() => onTogglePublish(ev)}
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
                      onClick={() => onEdit(ev)}
                      className="bg-feps-ink/5 text-feps-ink flex-1 py-1.5 rounded flex items-center justify-center gap-2 hover:bg-feps-ink hover:text-white transition-colors text-xs font-bold uppercase tracking-wider"
                    >
                      <Edit2 size={12} /> {t('actionEdit')}
                    </button>
                    {canDelete && (
                      <button
                        onClick={() => onDelete(ev.id)}
                        className="bg-red-50 text-red-600 flex-1 py-1.5 rounded flex items-center justify-center gap-2 hover:bg-red-600 hover:text-white transition-colors text-xs font-bold uppercase tracking-wider"
                      >
                        <Trash2 size={12} /> {t('actionDelete')}
                      </button>
                    )}
                    {activeTab === 'active' ? (
                      <button
                        onClick={() => onArchive(ev)}
                        className="bg-amber-50 text-amber-700 flex-1 py-1.5 rounded flex items-center justify-center gap-2 hover:bg-amber-600 hover:text-white transition-colors text-xs font-bold uppercase tracking-wider"
                      >
                        <Archive size={12} /> {t('archive')}
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() => onOpenReport(ev)}
                          className="bg-feps-navy text-white flex-1 py-1.5 rounded flex items-center justify-center gap-2 hover:bg-feps-gold hover:text-feps-navy transition-colors text-xs font-bold uppercase tracking-wider"
                        >
                          <Printer size={12} /> {t('report')}
                        </button>
                        <button
                          onClick={() => onRestore(ev)}
                          className="bg-green-50 text-green-700 flex-1 py-1.5 rounded flex items-center justify-center gap-2 hover:bg-green-600 hover:text-white transition-colors text-xs font-bold uppercase tracking-wider"
                        >
                          <ChevronRight size={12} /> {t('restore')}
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
  )
}
