'use client'

import { useCallback, useState } from 'react'
import type { InvitationConfig, InvitationLocale, LocalizedInvitationConfig, SavedInvitationConfig } from '@/types/invitation'
import { isLocalizedInvitationConfig } from '@/types/invitation'
import { BackgroundStep } from './invitation-builder/BackgroundStep'
import { DetailsStep } from './invitation-builder/DetailsStep'
import { InvitationNavigation } from './invitation-builder/InvitationNavigation'
import { InvitationStepper, INVITATION_STEPS, type InvitationStepId } from './invitation-builder/InvitationStepper'
import { PartnersStep } from './invitation-builder/PartnersStep'
import { PatronsStep } from './invitation-builder/PatronsStep'
import { PreviewStep } from './invitation-builder/PreviewStep'
import type { InvitationBuilderProps, InvitationConfigUpdate, InvitationSaveResult } from './invitation-builder/types'
import { createDefaultInvitationConfig, getInvitationCopy, normalizeInvitationLocale } from './invitation-builder/i18n'

export default function InvitationBuilder({
  eventId,
  eventTitle,
  eventLocation,
  eventStartDate,
  locale,
  initialConfig,
}: InvitationBuilderProps) {
  const invitationLocale = normalizeInvitationLocale(locale)
  const t = getInvitationCopy(invitationLocale)
  const [step, setStep] = useState<InvitationStepId>(1)
  const [saving, setSaving] = useState(false)
  const [saveResult, setSaveResult] = useState<InvitationSaveResult | null>(null)
  const [config, setConfig] = useState<InvitationConfig>(() => createInitialConfig({
    initialConfig,
    eventTitle,
    eventLocation,
    eventStartDate,
    locale: invitationLocale,
  }))

  const update = useCallback<InvitationConfigUpdate>((key, value) => {
    setConfig(previous => ({ ...previous, [key]: value }))
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      const response = await fetch(`/api/events/${eventId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invitationConfig: JSON.stringify(createSavedConfig(initialConfig, invitationLocale, config)) }),
      })
      setSaveResult(response.ok
        ? { type: 'success', message: t.saved }
        : { type: 'error', message: t.saveFailed })
    } catch {
      setSaveResult({ type: 'error', message: t.serverFailed })
    } finally {
      setSaving(false)
      window.setTimeout(() => setSaveResult(null), 3000)
    }
  }

  const activeStep = INVITATION_STEPS.find(item => item.id === step)

  return (
    <div dir={t.dir}>
      <InvitationStepper step={step} onChange={setStep} locale={invitationLocale} />

      <div className="p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-5xl">
          <div className="mb-6 flex items-start justify-between gap-4 border-b border-feps-ink/10 pb-5">
            <div>
              <p className="text-xs font-bold text-feps-ink-tertiary">{t.builderEyebrow}</p>
              <h2 className="mt-1 text-xl font-bold text-feps-navy">{activeStep ? t.steps[activeStep.id - 1] : ''}</h2>
            </div>
            <span dir="ltr" className="border border-feps-ink/15 bg-white px-3 py-1.5 text-xs font-bold text-feps-ink-secondary">
              {step} / {INVITATION_STEPS.length}
            </span>
          </div>

          <div className="min-h-[400px]">
            {step === 1 && <PatronsStep config={config} update={update} locale={invitationLocale} />}
            {step === 2 && <PartnersStep config={config} update={update} locale={invitationLocale} />}
            {step === 3 && <DetailsStep config={config} update={update} locale={invitationLocale} />}
            {step === 4 && <BackgroundStep config={config} update={update} locale={invitationLocale} />}
            {step === 5 && (
              <PreviewStep
                config={config}
                eventId={eventId}
                eventTitle={eventTitle}
                eventLocation={eventLocation}
                eventStartDate={eventStartDate}
                locale={invitationLocale}
                saving={saving}
                saveResult={saveResult}
                onSave={handleSave}
              />
            )}
          </div>

          <InvitationNavigation
            step={step}
            saving={saving}
            saveResult={saveResult}
            onChange={setStep}
            onSave={handleSave}
            locale={invitationLocale}
          />
        </div>
      </div>
    </div>
  )
}

function createInitialConfig({
  initialConfig,
  eventTitle,
  eventLocation,
  eventStartDate,
  locale,
}: Pick<InvitationBuilderProps, 'initialConfig' | 'eventTitle' | 'eventLocation' | 'eventStartDate'> & { locale: InvitationLocale }): InvitationConfig {
  if (initialConfig) {
    if (isLocalizedInvitationConfig(initialConfig) && initialConfig.locales[locale]) return initialConfig.locales[locale]
    if (!isLocalizedInvitationConfig(initialConfig) && locale === 'ar') return initialConfig
  }

  const eventDate = new Date(eventStartDate || Date.now())
  const t = getInvitationCopy(locale)
  return {
    ...createDefaultInvitationConfig(locale),
    eventTitleOnCard: eventTitle || '',
    eventLocationDisplay: eventLocation || '',
    eventDay: t.days[eventDate.getDay()],
    eventDateDisplay: eventDate.toLocaleDateString(t.localeCode, { day: 'numeric', month: 'long', year: 'numeric' }),
  }
}

function createSavedConfig(initialConfig: SavedInvitationConfig | null | undefined, locale: InvitationLocale, config: InvitationConfig): LocalizedInvitationConfig {
  const locales = initialConfig && isLocalizedInvitationConfig(initialConfig)
    ? { ...initialConfig.locales }
    : initialConfig
      ? { ar: initialConfig }
      : {}

  return { version: 2, locales: { ...locales, [locale]: config } }
}
