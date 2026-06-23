'use client'

import React, { useState, useEffect } from 'react'
import { AdminModal } from '@/components/admin/AdminModal'
import { useTranslations } from 'next-intl'
import { CheckCircle, FileText, Loader } from 'lucide-react'
import { AdminEvent } from './types'

interface EventReportModalProps {
  isOpen: boolean
  onClose: () => void
  event: AdminEvent | null
  locale: string
  isAr: boolean
  onSaveReport: (eventId: string, payload: { summary: string | null; results: string | null; recommendations: string | null }) => Promise<void>
}

export function EventReportModal({
  isOpen,
  onClose,
  event,
  isAr,
  onSaveReport,
}: EventReportModalProps) {
  const t = useTranslations('AdminEvents')

  const [reportForm, setReportForm] = useState({ summary: '', results: '', recommendations: '' })
  const [reportSaving, setReportSaving] = useState(false)
  const [reportSaved, setReportSaved] = useState(false)

  useEffect(() => {
    if (isOpen && event) {
      setReportForm({
        summary: event.reportSummary || '',
        results: event.reportResults || '',
        recommendations: event.reportRecommendations || '',
      })
      setReportSaved(false)
    }
  }, [isOpen, event])

  async function handleSaveReport() {
    if (!event) return
    setReportSaving(true)
    try {
      await onSaveReport(event.id, {
        summary: reportForm.summary || null,
        results: reportForm.results || null,
        recommendations: reportForm.recommendations || null,
      })
      setReportSaved(true)
    } catch (err) {
      console.error(err)
    } finally {
      setReportSaving(false)
    }
  }

  return (
    <AdminModal
      isOpen={isOpen}
      onClose={onClose}
      title={`${t('eventReport')} - ${isAr ? (event?.titleAr || event?.title) : event?.title}`}
      maxWidthClass="max-w-2xl"
    >
      <div dir={isAr ? 'rtl' : 'ltr'} className="flex flex-col gap-6 p-6 md:p-8">
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
            {t('summary')}
          </label>
          <textarea
            rows={4}
            value={reportForm.summary}
            onChange={e => { setReportForm({ ...reportForm, summary: e.target.value }); setReportSaved(false) }}
            placeholder={t('summaryPlaceholder')}
            className="w-full px-4 py-3 border border-feps-ink/20 bg-feps-paper text-feps-ink text-sm focus:outline-none focus:border-feps-navy transition-colors resize-y font-inherit"
          />
        </div>

        {/* Results */}
        <div>
          <label className="block text-start text-xs font-bold text-feps-ink mb-2 uppercase tracking-wider">
            {t('resultsOutcomes')}
          </label>
          <textarea
            rows={4}
            value={reportForm.results}
            onChange={e => { setReportForm({ ...reportForm, results: e.target.value }); setReportSaved(false) }}
            placeholder={t('resultsPlaceholder')}
            className="w-full px-4 py-3 border border-feps-ink/20 bg-feps-paper text-feps-ink text-sm focus:outline-none focus:border-feps-navy transition-colors resize-y font-inherit"
          />
        </div>

        {/* Recommendations */}
        <div>
          <label className="block text-start text-xs font-bold text-feps-ink mb-2 uppercase tracking-wider">
            {t('recommendations')}
          </label>
          <textarea
            rows={3}
            value={reportForm.recommendations}
            onChange={e => { setReportForm({ ...reportForm, recommendations: e.target.value }); setReportSaved(false) }}
            placeholder={t('recommendationsPlaceholder')}
            className="w-full px-4 py-3 border border-feps-ink/20 bg-feps-paper text-feps-ink text-sm focus:outline-none focus:border-feps-navy transition-colors resize-y font-inherit"
          />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-4 border-t border-feps-ink/20 pt-5">
          <div className="flex items-center gap-2 text-xs">
            {reportSaved && (
              <span className="flex items-center gap-1.5 text-green-700 font-bold">
                <CheckCircle size={14} />
                {t('saved')}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="bg-transparent border-2 border-feps-ink/20 text-feps-ink-secondary px-6 py-2.5 font-bold text-sm uppercase tracking-widest cursor-pointer transition-colors hover:border-feps-ink hover:text-feps-ink"
            >
              {t('close')}
            </button>
            <button
              type="button"
              onClick={handleSaveReport}
              disabled={reportSaving}
              className="bg-feps-navy text-white border-2 border-feps-navy px-6 py-2.5 font-bold text-sm uppercase tracking-widest cursor-pointer flex items-center gap-2 transition-colors hover:bg-feps-gold hover:text-feps-navy hover:border-feps-gold disabled:opacity-50"
            >
              {reportSaving && <Loader size={14} className="animate-spin" />}
              {t('saveData')}
            </button>
          </div>
        </div>
      </div>
    </AdminModal>
  )
}
