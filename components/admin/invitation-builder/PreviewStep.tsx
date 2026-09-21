import { useEffect, useRef, useState } from 'react'
import { AlertCircle, Check, CheckCircle2, Eye, FileDown, ImageDown, Loader, Printer } from 'lucide-react'
import type { InvitationConfig, InvitationLocale } from '@/types/invitation'
import InvitationCard from '../InvitationCard'
import { downloadInvitationImage, downloadInvitationPdf } from './exportInvitation'
import { SectionTitle } from './FormControls'
import type { InvitationSaveResult } from './types'
import { getInvitationCopy } from './i18n'

interface PreviewStepProps {
  config: InvitationConfig
  eventId: string
  eventTitle?: string
  eventLocation?: string
  eventStartDate?: string
  saving: boolean
  saveResult: InvitationSaveResult | null
  onSave: () => void
  locale: InvitationLocale
}

export function PreviewStep({ config, eventId, eventTitle, eventLocation, eventStartDate, saving, saveResult, onSave, locale }: PreviewStepProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const t = getInvitationCopy(locale)
  const [exporting, setExporting] = useState<'image' | 'pdf' | null>(null)
  const [exportError, setExportError] = useState<string | null>(null)
  const [completedExport, setCompletedExport] = useState<{ type: 'image' | 'pdf'; url: string } | null>(null)
  const fileName = `invitation-${eventId}`

  useEffect(() => {
    return () => {
      if (completedExport) URL.revokeObjectURL(completedExport.url)
    }
  }, [completedExport])

  const handleExport = async (format: 'image' | 'pdf') => {
    if (!cardRef.current) return
    setExporting(format)
    setExportError(null)
    try {
      const url = format === 'image'
        ? await downloadInvitationImage(cardRef.current, fileName)
        : await downloadInvitationPdf(cardRef.current, fileName)
      setCompletedExport({ type: format, url })
    } catch (error) {
      console.error('[Invitation export]', error)
      setExportError(t.exportFailed)
    } finally {
      setExporting(null)
    }
  }

  return (
    <div className="space-y-6">
      <SectionTitle icon={Eye} title={t.previewTitle} description={t.previewDescription} />

      <div className="overflow-hidden border border-feps-ink/20 bg-white shadow-sm">
        <InvitationCard ref={cardRef} config={config} eventTitle={eventTitle} eventLocation={eventLocation} eventDate={eventStartDate} locale={locale} />
      </div>

      <div className="flex flex-wrap gap-3">
        <button type="button" onClick={onSave} disabled={saving} className="flex items-center gap-2 border border-feps-navy bg-feps-navy px-5 py-2.5 text-sm font-bold text-white transition-colors hover:border-feps-ink hover:bg-feps-ink disabled:opacity-50">
          {saving ? <Loader size={14} className="animate-spin" /> : <Check size={14} />}
          {saving ? t.saving : t.saveInvitation}
        </button>

        <button type="button" onClick={() => handleExport('image')} disabled={exporting !== null} className="flex items-center gap-2 border border-feps-gold bg-feps-gold px-5 py-2.5 text-sm font-bold text-feps-navy transition-colors hover:bg-feps-gold-light disabled:opacity-50">
          {exporting === 'image' ? <Loader size={14} className="animate-spin" /> : <ImageDown size={15} />}
          {exporting === 'image' ? t.preparingImage : t.downloadImage}
        </button>

        <button type="button" onClick={() => handleExport('pdf')} disabled={exporting !== null} className="flex items-center gap-2 border border-feps-navy/20 bg-feps-navy/5 px-5 py-2.5 text-sm font-bold text-feps-navy transition-colors hover:bg-feps-navy/10 disabled:opacity-50">
          {exporting === 'pdf' ? <Loader size={14} className="animate-spin" /> : <FileDown size={15} />}
          {exporting === 'pdf' ? t.preparingPdf : t.downloadPdf}
        </button>

        <button type="button" onClick={() => window.print()} className="flex items-center gap-2 border border-feps-ink/20 bg-white px-5 py-2.5 text-sm font-bold text-feps-ink transition-colors hover:bg-feps-ink/5">
          <Printer size={14} /> {t.print}
        </button>
      </div>

      {exportError && (
        <p className="flex items-center justify-center gap-2 border border-red-200 bg-red-50 px-4 py-3 text-center text-sm font-bold text-red-700">
          <AlertCircle size={16} /> {exportError}
        </p>
      )}

      {completedExport && !exportError && (
        <p className="flex flex-wrap items-center justify-center gap-2 border border-green-200 bg-green-50 px-4 py-3 text-center text-sm font-bold text-green-700">
          <CheckCircle2 size={16} />
          {completedExport.type === 'image' ? t.imageReady : t.pdfReady}
          <a href={completedExport.url} target="_blank" rel="noreferrer" className="text-feps-navy underline underline-offset-4">
            {t.previewFile}
          </a>
        </p>
      )}

      {saveResult && (
        <p className={`flex items-center justify-center gap-2 border px-4 py-3 text-center text-sm font-bold ${saveResult.type === 'success' ? 'border-green-200 bg-green-50 text-green-700' : 'border-red-200 bg-red-50 text-red-700'}`}>
          {saveResult.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          {saveResult.message}
        </p>
      )}
    </div>
  )
}
