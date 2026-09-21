import { Mail } from 'lucide-react'
import type { InvitationConfig, InvitationLocale } from '@/types/invitation'
import { Field, Input, Label, SectionTitle, Textarea } from './FormControls'
import type { InvitationConfigUpdate } from './types'
import { getInvitationCopy } from './i18n'

export function DetailsStep({ config, update, locale }: { config: InvitationConfig; update: InvitationConfigUpdate; locale: InvitationLocale }) {
  const t = getInvitationCopy(locale)
  return (
    <div className="space-y-1">
      <SectionTitle icon={Mail} title={t.detailsTitle} description={t.detailsDescription} />

      <Field>
        <Label>{t.eventType}</Label>
        <div className="flex flex-wrap gap-2">
          {t.eventTypes.map(eventType => (
            <button
              key={eventType}
              type="button"
              onClick={() => update('eventType', eventType)}
              className={`border px-4 py-2 text-sm font-bold transition-colors ${config.eventType === eventType ? 'border-feps-navy bg-feps-navy text-white' : 'border-feps-ink/20 bg-white text-feps-ink-secondary hover:border-feps-navy hover:text-feps-navy'}`}
            >
              {eventType}
            </button>
          ))}
        </div>
        {config.eventType === t.otherEventType && (
          <Input className="mt-2" placeholder={t.customEventType} onChange={event => update('eventType', event.target.value)} />
        )}
      </Field>

      <Field><Label>{t.introText}</Label><Textarea value={config.bodyText} onChange={event => update('bodyText', event.target.value)} rows={2} /></Field>
      <Field><Label>{t.eventTitle}</Label><Textarea value={config.eventTitleOnCard} onChange={event => update('eventTitleOnCard', event.target.value)} rows={2} /></Field>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <Field>
          <Label>{t.day}</Label>
          <select value={config.eventDay} onChange={event => update('eventDay', event.target.value)} className="w-full border border-feps-ink/20 bg-white px-3 py-2.5 text-sm text-feps-ink focus:border-feps-navy focus:outline-none">
            <option value="">{t.chooseDay}</option>
            {t.days.map(day => <option key={day} value={day}>{day}</option>)}
          </select>
        </Field>
        <Field><Label>{t.displayDate}</Label><Input value={config.eventDateDisplay} onChange={event => update('eventDateDisplay', event.target.value)} placeholder={t.displayDatePlaceholder} /></Field>
      </div>

      <Field><Label>{t.displayTime}</Label><Input value={config.eventTimeDisplay} onChange={event => update('eventTimeDisplay', event.target.value)} placeholder={t.displayTimePlaceholder} /></Field>
      <Field><Label>{t.displayLocation}</Label><Input value={config.eventLocationDisplay} onChange={event => update('eventLocationDisplay', event.target.value)} placeholder={t.displayLocationPlaceholder} /></Field>
    </div>
  )
}
