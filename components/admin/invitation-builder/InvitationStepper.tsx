import { Check, Crown, Eye, Handshake, Mail, Palette, type LucideIcon } from 'lucide-react'
import type { InvitationLocale } from '@/types/invitation'
import { getInvitationCopy } from './i18n'

export type InvitationStepId = 1 | 2 | 3 | 4 | 5

export const INVITATION_STEPS: Array<{ id: InvitationStepId; icon: LucideIcon }> = [
  { id: 1, icon: Crown },
  { id: 2, icon: Handshake },
  { id: 3, icon: Mail },
  { id: 4, icon: Palette },
  { id: 5, icon: Eye },
]

export function InvitationStepper({ step, onChange, locale }: { step: InvitationStepId; onChange: (step: InvitationStepId) => void; locale: InvitationLocale }) {
  const t = getInvitationCopy(locale)
  return (
    <nav aria-label={t.stepsAria} className="border-b border-feps-ink/20 bg-white">
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5">
        {INVITATION_STEPS.map(item => {
          const Icon = item.icon
          const isActive = step === item.id
          const isComplete = step > item.id

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onChange(item.id)}
              aria-current={isActive ? 'step' : undefined}
              className={`relative flex min-h-20 items-center gap-3 border-b border-e border-feps-ink/10 px-4 py-3 text-start transition-colors ${isActive ? 'bg-feps-navy/5 text-feps-navy' : 'bg-white text-feps-ink-secondary hover:bg-feps-ink/[0.03] hover:text-feps-ink'}`}
            >
              <span className={`flex h-9 w-9 shrink-0 items-center justify-center border ${isActive ? 'border-feps-navy bg-feps-navy text-white' : isComplete ? 'border-feps-success bg-feps-success text-white' : 'border-feps-ink/20 bg-feps-paper'}`}>
                {isComplete ? <Check size={17} /> : <Icon size={17} />}
              </span>
              <span>
                <span className="block text-[10px] font-bold text-feps-ink-tertiary">{t.stepWord} {item.id}</span>
                <span className="mt-0.5 block text-xs font-bold">{t.steps[item.id - 1]}</span>
              </span>
              {isActive && <span className="absolute inset-x-0 bottom-0 h-0.5 bg-feps-navy" />}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
