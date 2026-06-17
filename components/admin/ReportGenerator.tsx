'use client'

import React, { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { CalendarEvent } from '../calendar/types'
import { Download, Eye, FileSpreadsheet } from 'lucide-react'
import { EVENT_TYPE_META, EventType } from '../EventCard'

// Dynamically import react-pdf components to avoid SSR issues
const PDFViewer = dynamic(() => import('@react-pdf/renderer').then(mod => mod.PDFViewer), {
  ssr: false,
  loading: () => <div className="loading-pdf">Loading PDF Viewer...</div>
})

const PDFDownloadLink = dynamic(() => import('@react-pdf/renderer').then(mod => mod.PDFDownloadLink), {
  ssr: false
})

import AcademicReportDocument, { ReportTranslations } from './AcademicReportDocument'
import { useTranslations, useLocale } from 'next-intl'

interface AdminReportEvent extends CalendarEvent {
  agendaText?: string | null
  published?: boolean
}

interface Props {
  events: AdminReportEvent[]
}

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

export default function ReportGenerator({ events }: Props) {
  const t = useTranslations('Report')
  const tAdmin = useTranslations('AdminReports')
  const tAdminEvents = useTranslations('AdminEvents')
  const locale = useLocale()
  const isAr = locale === 'ar'
  
  const [startDate, setStartDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string>('')
  const [selectedType, setSelectedType] = useState<string>('ALL')
  const [selectedStatus, setSelectedStatus] = useState<'ALL' | 'PUBLISHED' | 'DRAFT'>('ALL')
  const [selectedLocation, setSelectedLocation] = useState<string>('ALL')
  const [reportFormat, setReportFormat] = useState<'SUMMARY' | 'DETAILED'>('SUMMARY')
  
  const [showPreview, setShowPreview] = useState(false)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const filteredEvents = events.filter(ev => {
    // 1. Date filter
    const evDate = new Date(ev.startDate).getTime()
    if (startDate && evDate < new Date(startDate).getTime()) return false
    if (endDate && evDate > new Date(endDate).getTime() + 86400000) return false
    
    // 2. Type filter
    if (selectedType !== 'ALL' && ev.type !== selectedType) return false
    
    // 3. Status filter
    if (selectedStatus === 'PUBLISHED' && !ev.published) return false
    if (selectedStatus === 'DRAFT' && ev.published) return false
    
    // 4. Location filter
    if (selectedLocation !== 'ALL') {
      if (!ev.location || !ev.location.includes(selectedLocation)) return false
    }
    
    return true
  }).sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())

  // Calculate period string for display
  let periodDisplay = ''
  if (startDate && endDate) {
    periodDisplay = `${startDate} ${isAr ? 'إلى' : 'to'} ${endDate}`
  } else if (startDate) {
    periodDisplay = `${isAr ? 'من' : 'From'} ${startDate}`
  } else if (endDate) {
    periodDisplay = `${isAr ? 'حتى' : 'Until'} ${endDate}`
  } else {
    periodDisplay = tAdmin('statusAll')
  }

  const reportTitle = t('reportTitle')
  const filename = `FEPS_Report_${new Date().toISOString().split('T')[0]}.pdf`

  const translations: ReportTranslations = {
    university: t('university'),
    faculty: t('faculty'),
    department: t('department'),
    datePrefix: t('datePrefix'),
    summaryPrefix: t('summaryPrefix'),
    description: t('description'),
    colDateTime: t('colDateTime'),
    colEventLocation: t('colEventLocation'),
    colCategory: t('colCategory'),
    noEvents: t('noEvents'),
    locPrefix: t('locPrefix'),
    footer: t('footer'),
    pagePrefix: t('pagePrefix'),
    pageOf: t('pageOf'),
    detailedAgendaPrefix: tAdmin('detailedAgendaPrefix') || 'Event Agenda & Details:'
  }

  const downloadCSV = () => {
    if (filteredEvents.length === 0) return

    const BOM = '\uFEFF'
    const headers = [
      tAdminEvents('colType'),
      tAdminEvents('colTitle'),
      tAdminEvents('colDateTime'),
      tAdminEvents('colLocation'),
      tAdminEvents('colPublished')
    ].join(',')

    const rows = filteredEvents.map(ev => {
      const typeMeta = EVENT_TYPE_META[ev.type as EventType]
      const typeStr = `"${isAr ? typeMeta?.labelAr : typeMeta?.label}"`
      const titleStr = `"${(ev.titleAr || ev.title).replace(/"/g, '""')}"`
      const dateStr = `"${new Date(ev.startDate).toLocaleString(isAr ? 'ar-EG' : 'en-US')}"`
      const locStr = `"${(ev.location || '').replace(/"/g, '""')}"`
      const pubStr = ev.published ? tAdmin('statusPublished') : tAdmin('statusDraft')
      
      return [typeStr, titleStr, dateStr, locStr, pubStr].join(',')
    })

    const csvContent = BOM + [headers, ...rows].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `FEPS_Report_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="bg-feps-paper border border-feps-ink/20 p-8" dir={isAr ? 'rtl' : 'ltr'}>
      <div className="mb-8">
        <h2 className="text-xl font-serif text-feps-ink mb-2">
          {tAdmin('generateReport')}
        </h2>
        <p className="font-mono text-sm text-feps-ink-secondary">
          {tAdmin('generateDesc')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8 bg-feps-ink/5 p-6 border border-feps-ink/10">
        
        {/* Date Filters */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-feps-ink uppercase tracking-wider">{tAdmin('filterStartDate')}</label>
          <input 
            type="date"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
            className="w-full p-2 border border-feps-ink/20 bg-feps-paper text-sm text-feps-ink focus:outline-none focus:border-feps-ink"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-feps-ink uppercase tracking-wider">{tAdmin('filterEndDate')}</label>
          <input 
            type="date"
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
            className="w-full p-2 border border-feps-ink/20 bg-feps-paper text-sm text-feps-ink focus:outline-none focus:border-feps-ink"
          />
        </div>

        {/* Type Filter */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-feps-ink uppercase tracking-wider">{tAdmin('filterType')}</label>
          <select 
            value={selectedType}
            onChange={e => setSelectedType(e.target.value)}
            className="w-full p-2 border border-feps-ink/20 bg-feps-paper text-sm text-feps-ink focus:outline-none focus:border-feps-ink"
          >
            <option value="ALL">{tAdmin('statusAll')}</option>
            {Object.entries(EVENT_TYPE_META).map(([key, meta]) => (
              <option key={key} value={key}>{isAr ? meta.labelAr : meta.label}</option>
            ))}
          </select>
        </div>

        {/* Location Filter */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-feps-ink uppercase tracking-wider">{tAdmin('filterLocation')}</label>
          <select 
            value={selectedLocation}
            onChange={e => setSelectedLocation(e.target.value)}
            className="w-full p-2 border border-feps-ink/20 bg-feps-paper text-sm text-feps-ink focus:outline-none focus:border-feps-ink"
          >
            <option value="ALL">{tAdmin('statusAll')}</option>
            {HALL_OPTIONS.map(hall => (
              <option key={hall} value={hall}>{hall}</option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-feps-ink uppercase tracking-wider">{tAdmin('filterStatus')}</label>
          <select 
            value={selectedStatus}
            onChange={e => setSelectedStatus(e.target.value as any)}
            className="w-full p-2 border border-feps-ink/20 bg-feps-paper text-sm text-feps-ink focus:outline-none focus:border-feps-ink"
          >
            <option value="ALL">{tAdmin('statusAll')}</option>
            <option value="PUBLISHED">{tAdmin('statusPublished')}</option>
            <option value="DRAFT">{tAdmin('statusDraft')}</option>
          </select>
        </div>

        {/* Report Format */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-feps-ink uppercase tracking-wider">{tAdmin('templateType')}</label>
          <select 
            value={reportFormat}
            onChange={e => setReportFormat(e.target.value as any)}
            className="w-full p-2 border border-feps-ink/20 bg-feps-paper text-sm text-feps-ink focus:outline-none focus:border-feps-ink font-bold"
          >
            <option value="SUMMARY">{tAdmin('templateSummary')}</option>
            <option value="DETAILED">{tAdmin('templateDetailed')}</option>
          </select>
        </div>

      </div>

      <div className="bg-feps-ink/5 p-4 mb-8 border border-feps-ink/10 border-l-4 border-l-feps-ink">
        <div className="font-bold text-sm text-feps-ink mb-2">{tAdmin('reportSummary')}</div>
        <div className="font-mono text-xs text-feps-ink-secondary space-y-1">
          <div>{tAdmin('selectedPeriod')}: <strong className="text-feps-ink">{periodDisplay}</strong></div>
          <div>{tAdmin('totalEvents')}: <strong className="text-feps-ink">{filteredEvents.length}</strong></div>
        </div>
      </div>

      <div className="flex flex-wrap gap-4">
        {isClient && (
          <PDFDownloadLink
            document={<AcademicReportDocument events={filteredEvents} reportTitle={reportTitle} monthYear={periodDisplay} translations={translations} locale={locale} format={reportFormat} />}
            fileName={filename}
            className="no-underline"
          >
            {({ loading }) => (
              <button 
                disabled={loading || filteredEvents.length === 0}
                className={`flex items-center gap-2 px-6 py-3 font-bold text-sm transition-colors border ${
                  (loading || filteredEvents.length === 0)
                    ? 'bg-feps-ink/10 text-feps-ink/50 border-feps-ink/10 cursor-not-allowed' 
                    : 'bg-feps-ink text-feps-paper border-feps-ink hover:bg-black cursor-pointer'
                }`}
              >
                <Download size={16} />
                {loading ? tAdmin('preparingPdf') : tAdmin('downloadPdf')}
              </button>
            )}
          </PDFDownloadLink>
        )}

        <button 
          onClick={downloadCSV}
          disabled={filteredEvents.length === 0}
          className="flex items-center gap-2 px-6 py-3 font-bold text-sm bg-transparent text-feps-ink border border-feps-ink/20 hover:bg-feps-ink/5 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FileSpreadsheet size={16} />
          {tAdmin('exportCsv')}
        </button>

        <button 
          onClick={() => setShowPreview(!showPreview)}
          disabled={filteredEvents.length === 0}
          className="flex items-center gap-2 px-6 py-3 font-bold text-sm bg-transparent text-feps-ink border border-feps-ink/20 hover:bg-feps-ink/5 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ml-auto"
        >
          <Eye size={16} />
          {showPreview ? tAdmin('hidePreview') : tAdmin('previewDocument')}
        </button>
      </div>

      {showPreview && isClient && filteredEvents.length > 0 && (
        <div className="mt-8 h-[800px] border border-feps-ink/20">
          <PDFViewer width="100%" height="100%">
            <AcademicReportDocument events={filteredEvents} reportTitle={reportTitle} monthYear={periodDisplay} translations={translations} locale={locale} format={reportFormat} />
          </PDFViewer>
        </div>
      )}
    </div>
  )
}

