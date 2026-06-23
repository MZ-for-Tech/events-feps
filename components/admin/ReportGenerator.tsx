'use client'

import React, { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { CalendarEvent } from '../calendar/types'
import { Download, Eye, FileSpreadsheet, Settings2 } from 'lucide-react'
import { EventCategoryData } from '../EventCard'

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
  categories: EventCategoryData[]
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

export default function ReportGenerator({ events, categories }: Props) {
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
  
  const [showTextConfig, setShowTextConfig] = useState(false)
  
  const [customReportTitle, setCustomReportTitle] = useState(t('reportTitle'))
  const [customUniversity, setCustomUniversity] = useState(t('university'))
  const [customFaculty, setCustomFaculty] = useState(t('faculty'))
  const [customDepartment, setCustomDepartment] = useState(t('department'))
  const [customDescription, setCustomDescription] = useState(t('description'))
  const [customSummaryPrefix, setCustomSummaryPrefix] = useState(t('summaryPrefix'))
  const [customDetailedPrefix, setCustomDetailedPrefix] = useState(tAdmin('detailedAgendaPrefix') || 'Event Agenda & Details:')
  const [customDatePrefix, setCustomDatePrefix] = useState(t('datePrefix'))
  const [customColDateTime, setCustomColDateTime] = useState(t('colDateTime'))
  const [customColEventLocation, setCustomColEventLocation] = useState(t('colEventLocation'))
  const [customColCategory, setCustomColCategory] = useState(t('colCategory'))
  const [customLocPrefix, setCustomLocPrefix] = useState(t('locPrefix'))
  const [customFooter, setCustomFooter] = useState(t('footer'))

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsClient(true)
  }, [])

  const filteredEvents = events.filter(ev => {
    // 1. Date filter
    const evDate = new Date(ev.startDate).getTime()
    if (startDate && evDate < new Date(startDate).getTime()) return false
    if (endDate && evDate > new Date(endDate).getTime() + 86400000) return false
    
    // 2. Type filter
    if (selectedType !== 'ALL' && ev.category?.id !== selectedType) return false
    
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

  const reportTitle = customReportTitle
  const filename = `FEPS_Report_${new Date().toISOString().split('T')[0]}.pdf`

  const translations: ReportTranslations = {
    university: customUniversity,
    faculty: customFaculty,
    department: customDepartment,
    datePrefix: customDatePrefix,
    summaryPrefix: customSummaryPrefix,
    description: customDescription,
    colDateTime: customColDateTime,
    colEventLocation: customColEventLocation,
    colCategory: customColCategory,
    noEvents: t('noEvents'),
    locPrefix: customLocPrefix,
    footer: customFooter,
    pagePrefix: t('pagePrefix'),
    pageOf: t('pageOf'),
    detailedAgendaPrefix: customDetailedPrefix
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
      const typeMeta = ev.category
      const typeStr = `"${isAr ? typeMeta?.nameAr : typeMeta?.nameEn}"`
      const titleStr = `"${(ev.titleAr || ev.title).replace(/"/g, '""')}"`
      const dateStr = `"${new Date(ev.startDate).toLocaleString(isAr ? 'ar-EG-u-nu-latn' : 'en-US')}"`
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
        <p className="font-sans text-sm text-feps-ink-secondary">
          {tAdmin('generateDesc')}
        </p>
      </div>

      <div data-tour="admin-report-filters" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8 bg-feps-ink/5 p-6 border border-feps-ink/10">
        
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
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{isAr ? cat.nameAr : locale === 'fr' ? cat.nameFr : cat.nameEn}</option>
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
            onChange={e => setSelectedStatus(e.target.value as 'ALL' | 'PUBLISHED' | 'DRAFT')}
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
            onChange={e => setReportFormat(e.target.value as 'SUMMARY' | 'DETAILED')}
            className="w-full p-2 border border-feps-ink/20 bg-feps-paper text-sm text-feps-ink focus:outline-none focus:border-feps-ink font-bold"
          >
            <option value="SUMMARY">{tAdmin('templateSummary')}</option>
            <option value="DETAILED">{tAdmin('templateDetailed')}</option>
          </select>
        </div>

      </div>

      {/* Text Configuration Toggle */}
      <div className="mb-4">
        <button 
          onClick={() => setShowTextConfig(!showTextConfig)}
          className={`flex items-center gap-2 px-6 py-3 font-bold text-sm transition-colors border ${
            showTextConfig 
              ? 'bg-feps-ink text-feps-paper border-feps-ink hover:bg-black' 
              : 'bg-transparent text-feps-ink border-feps-ink/20 hover:bg-feps-ink/5'
          } cursor-pointer w-full md:w-auto justify-center`}
        >
          <Settings2 size={16} />
          {showTextConfig ? (isAr ? 'إخفاء إعدادات النصوص' : 'Hide Text Configuration') : (isAr ? 'تخصيص نصوص التقرير' : 'Customize Report Text')}
        </button>
      </div>

      {showTextConfig && (
        <div className="mb-8 p-6 bg-feps-ink/5 border border-feps-ink/10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-feps-ink uppercase tracking-wider">{isAr ? 'عنوان التقرير' : 'Report Title'}</label>
              <input type="text" value={customReportTitle} onChange={e => setCustomReportTitle(e.target.value)} className="w-full p-2 border border-feps-ink/20 bg-feps-paper text-sm text-feps-ink focus:outline-none focus:border-feps-ink" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-feps-ink uppercase tracking-wider">{isAr ? 'الجامعة' : 'University'}</label>
              <input type="text" value={customUniversity} onChange={e => setCustomUniversity(e.target.value)} className="w-full p-2 border border-feps-ink/20 bg-feps-paper text-sm text-feps-ink focus:outline-none focus:border-feps-ink" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-feps-ink uppercase tracking-wider">{isAr ? 'الكلية' : 'Faculty'}</label>
              <input type="text" value={customFaculty} onChange={e => setCustomFaculty(e.target.value)} className="w-full p-2 border border-feps-ink/20 bg-feps-paper text-sm text-feps-ink focus:outline-none focus:border-feps-ink" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-feps-ink uppercase tracking-wider">{isAr ? 'القسم / الجهة' : 'Department'}</label>
              <input type="text" value={customDepartment} onChange={e => setCustomDepartment(e.target.value)} className="w-full p-2 border border-feps-ink/20 bg-feps-paper text-sm text-feps-ink focus:outline-none focus:border-feps-ink" />
            </div>
            <div className="flex flex-col gap-2 md:col-span-2">
              <label className="text-xs font-bold text-feps-ink uppercase tracking-wider">{isAr ? 'وصف التقرير' : 'Description'}</label>
              <textarea rows={3} value={customDescription} onChange={e => setCustomDescription(e.target.value)} className="w-full p-2 border border-feps-ink/20 bg-feps-paper text-sm text-feps-ink focus:outline-none focus:border-feps-ink resize-none" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-feps-ink uppercase tracking-wider">{isAr ? 'عنوان الملخص' : 'Summary Subtitle'}</label>
              <input type="text" value={customSummaryPrefix} onChange={e => setCustomSummaryPrefix(e.target.value)} className="w-full p-2 border border-feps-ink/20 bg-feps-paper text-sm text-feps-ink focus:outline-none focus:border-feps-ink" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-feps-ink uppercase tracking-wider">{isAr ? 'عنوان التفاصيل' : 'Detailed Subtitle'}</label>
              <input type="text" value={customDetailedPrefix} onChange={e => setCustomDetailedPrefix(e.target.value)} className="w-full p-2 border border-feps-ink/20 bg-feps-paper text-sm text-feps-ink focus:outline-none focus:border-feps-ink" />
            </div>

            {/* Additional fields */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-feps-ink uppercase tracking-wider">{isAr ? 'بادئة التاريخ' : 'Date Prefix'}</label>
              <input type="text" value={customDatePrefix} onChange={e => setCustomDatePrefix(e.target.value)} className="w-full p-2 border border-feps-ink/20 bg-feps-paper text-sm text-feps-ink focus:outline-none focus:border-feps-ink" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-feps-ink uppercase tracking-wider">{isAr ? 'بادئة المكان' : 'Location Prefix'}</label>
              <input type="text" value={customLocPrefix} onChange={e => setCustomLocPrefix(e.target.value)} className="w-full p-2 border border-feps-ink/20 bg-feps-paper text-sm text-feps-ink focus:outline-none focus:border-feps-ink" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-feps-ink uppercase tracking-wider">{isAr ? 'عمود الوقت/التاريخ' : 'Time/Date Column'}</label>
              <input type="text" value={customColDateTime} onChange={e => setCustomColDateTime(e.target.value)} className="w-full p-2 border border-feps-ink/20 bg-feps-paper text-sm text-feps-ink focus:outline-none focus:border-feps-ink" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-feps-ink uppercase tracking-wider">{isAr ? 'عمود المكان' : 'Location Column'}</label>
              <input type="text" value={customColEventLocation} onChange={e => setCustomColEventLocation(e.target.value)} className="w-full p-2 border border-feps-ink/20 bg-feps-paper text-sm text-feps-ink focus:outline-none focus:border-feps-ink" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-feps-ink uppercase tracking-wider">{isAr ? 'عمود الفئة' : 'Category Column'}</label>
              <input type="text" value={customColCategory} onChange={e => setCustomColCategory(e.target.value)} className="w-full p-2 border border-feps-ink/20 bg-feps-paper text-sm text-feps-ink focus:outline-none focus:border-feps-ink" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-feps-ink uppercase tracking-wider">{isAr ? 'تذييل الصفحة' : 'Footer Text'}</label>
              <input type="text" value={customFooter} onChange={e => setCustomFooter(e.target.value)} className="w-full p-2 border border-feps-ink/20 bg-feps-paper text-sm text-feps-ink focus:outline-none focus:border-feps-ink" />
            </div>
          </div>
        </div>
      )}

      <div className="bg-feps-ink/5 p-4 mb-8 border border-feps-ink/10 border-l-4 border-l-feps-ink">
        <div className="font-bold text-sm text-feps-ink mb-2">{tAdmin('reportSummary')}</div>
        <div className="font-sans text-xs text-feps-ink-secondary space-y-1">
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
                data-tour="admin-report-generate"
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

