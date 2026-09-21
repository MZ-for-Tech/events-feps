import { Crown, Plus, Trash2 } from 'lucide-react'
import type { InvitationConfig, InvitationLocale, InvitationMinister } from '@/types/invitation'
import { Field, Input, Label, SectionTitle, Toggle } from './FormControls'
import type { InvitationConfigUpdate } from './types'
import { getInvitationCopy } from './i18n'

export function PatronsStep({ config, update, locale }: { config: InvitationConfig; update: InvitationConfigUpdate; locale: InvitationLocale }) {
  const t = getInvitationCopy(locale)
  const addMinister = () => update('ministers', [...config.ministers, { fullTitle: locale === 'ar' ? 'د/' : locale === 'fr' ? 'Dr' : 'Dr.', name: '', position: '' }])
  const removeMinister = (index: number) => update('ministers', config.ministers.filter((_, itemIndex) => itemIndex !== index))
  const updateMinister = (index: number, field: keyof InvitationMinister, value: string) => {
    update('ministers', config.ministers.map((minister, itemIndex) => itemIndex === index ? { ...minister, [field]: value } : minister))
  }

  return (
    <div className="space-y-6">
      <SectionTitle
        icon={Crown}
        title={t.patronsTitle}
        description={t.patronsDescription}
      />

      <Toggle
        checked={config.hasMinistersPatronage}
        onChange={value => update('hasMinistersPatronage', value)}
        label={t.hasMinisters}
      />

      {config.hasMinistersPatronage && (
        <div className="mb-6 space-y-4">
          {config.ministers.map((minister, index) => (
            <div key={index} className="relative border border-feps-ink/15 bg-white p-4">
              <button type="button" onClick={() => removeMinister(index)} aria-label={`${t.deleteMinister} ${index + 1}`} className="absolute end-3 top-3 p-1 text-feps-ink-tertiary transition-colors hover:bg-red-50 hover:text-red-600">
                <Trash2 size={16} />
              </button>
              <p className="mb-3 text-xs font-bold text-feps-navy">{t.minister} {index + 1}</p>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                <div><Label>{t.title}</Label><Input value={minister.fullTitle} onChange={event => updateMinister(index, 'fullTitle', event.target.value)} /></div>
                <div className="md:col-span-2"><Label>{t.name}</Label><Input value={minister.name} onChange={event => updateMinister(index, 'name', event.target.value)} placeholder={t.ministerName} /></div>
              </div>
              <div className="mt-2"><Label>{t.position}</Label><Input value={minister.position} onChange={event => updateMinister(index, 'position', event.target.value)} placeholder={t.ministerPosition} /></div>
            </div>
          ))}
          <button type="button" onClick={addMinister} className="flex items-center gap-2 border border-feps-ink/20 px-4 py-2 text-sm font-bold text-feps-navy transition-colors hover:bg-feps-navy/5">
            <Plus size={14} /> {t.addMinister}
          </button>
        </div>
      )}

      <div className="border-t border-feps-ink/10 pt-5">
        <p className="mb-4 text-sm font-bold text-feps-navy">{t.universityPresident}</p>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <Field><Label>{t.title}</Label><Input value={config.universityPresidentTitle} onChange={event => update('universityPresidentTitle', event.target.value)} /></Field>
          <Field className="md:col-span-2"><Label>{t.name}</Label><Input value={config.universityPresidentName} onChange={event => update('universityPresidentName', event.target.value)} /></Field>
        </div>
        <Field><Label>{t.jobTitle}</Label><Input value={config.universityPresidentSuffix} onChange={event => update('universityPresidentSuffix', event.target.value)} /></Field>
      </div>

      <div className="border-t border-feps-ink/10 pt-5">
        <p className="mb-4 text-sm font-bold text-feps-navy">{t.dean}</p>
        <Field>
          <Label>{t.supervisionWording}</Label>
          <div className="flex flex-wrap gap-2">
            {t.supervisionLabels.map(label => (
              <button
                key={label}
                type="button"
                onClick={() => update('supervisionLabel', label)}
                className={`border px-4 py-2 text-sm font-bold transition-colors ${config.supervisionLabel === label ? 'border-feps-navy bg-feps-navy text-white' : 'border-feps-ink/20 bg-white text-feps-ink-secondary hover:border-feps-navy hover:text-feps-navy'}`}
              >
                {label}
              </button>
            ))}
          </div>
        </Field>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <Field><Label>{t.title}</Label><Input value={config.deanTitle} onChange={event => update('deanTitle', event.target.value)} /></Field>
          <Field className="md:col-span-2"><Label>{t.name}</Label><Input value={config.deanName} onChange={event => update('deanName', event.target.value)} /></Field>
        </div>
        <Field><Label>{t.position}</Label><Input value={config.deanPosition} onChange={event => update('deanPosition', event.target.value)} /></Field>
        <Field><Label>{t.extraLine}</Label><Input value={config.deanExtraLine ?? ''} onChange={event => update('deanExtraLine', event.target.value)} /></Field>
      </div>
    </div>
  )
}
