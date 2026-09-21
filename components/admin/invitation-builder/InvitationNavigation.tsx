import { AlertCircle, Check, CheckCircle2, ChevronLeft, ChevronRight, Loader } from 'lucide-react'
import type { InvitationSaveResult } from './types'
import type { InvitationStepId } from './InvitationStepper'
import type { InvitationLocale } from '@/types/invitation'
import { getInvitationCopy } from './i18n'

interface InvitationNavigationProps {
  step: InvitationStepId
  saving: boolean
  saveResult: InvitationSaveResult | null
  onChange: (step: InvitationStepId) => void
  onSave: () => void
  locale: InvitationLocale
}

export function InvitationNavigation({ step, saving, saveResult, onChange, onSave, locale }: InvitationNavigationProps) {
  const t = getInvitationCopy(locale)
  const PreviousIcon = locale === 'ar' ? ChevronRight : ChevronLeft
  const NextIcon = locale === 'ar' ? ChevronLeft : ChevronRight
  return (
    <>
      <div className="mt-8 flex flex-col-reverse justify-between gap-3 border-t border-feps-ink/10 pt-5 sm:flex-row">
        <button
          type="button"
          onClick={() => onChange((step - 1) as InvitationStepId)}
          disabled={step === 1}
          className="flex items-center justify-center gap-2 border border-feps-ink/20 bg-white px-5 py-2.5 text-sm font-bold text-feps-ink transition-colors hover:bg-feps-ink/5 disabled:cursor-not-allowed disabled:opacity-30"
        >
          <PreviousIcon size={16} /> {t.previous}
        </button>

        <div className="flex flex-col gap-2 sm:flex-row">
          {step < 5 && (
            <button type="button" onClick={onSave} disabled={saving} className="flex items-center justify-center gap-2 border border-feps-ink/20 bg-white px-4 py-2.5 text-sm font-bold text-feps-ink transition-colors hover:bg-feps-ink/5 disabled:opacity-50">
              {saving ? <Loader size={14} className="animate-spin" /> : <Check size={14} />}
              {t.save}
            </button>
          )}
          <button
            type="button"
            onClick={() => onChange((step + 1) as InvitationStepId)}
            disabled={step === 5}
            className="flex items-center justify-center gap-2 border border-feps-navy bg-feps-navy px-5 py-2.5 text-sm font-bold text-white transition-colors hover:border-feps-ink hover:bg-feps-ink disabled:cursor-not-allowed disabled:opacity-30"
          >
            {t.next} <NextIcon size={16} />
          </button>
        </div>
      </div>

      {saveResult && step < 5 && (
        <p className={`mt-4 flex items-center justify-center gap-2 border px-4 py-3 text-center text-sm font-bold ${saveResult.type === 'success' ? 'border-green-200 bg-green-50 text-green-700' : 'border-red-200 bg-red-50 text-red-700'}`}>
          {saveResult.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          {saveResult.message}
        </p>
      )}
    </>
  )
}
