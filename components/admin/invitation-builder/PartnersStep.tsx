import { Handshake, ImagePlus, Loader, Plus, Trash2, X } from 'lucide-react'
import Image from 'next/image'
import { useState, type ChangeEvent, type ReactNode } from 'react'
import type { InvitationConfig, InvitationLocale, InvitationPartner } from '@/types/invitation'
import { Field, Input, Label, SectionTitle, Toggle } from './FormControls'
import type { InvitationConfigUpdate } from './types'
import { getInvitationCopy, type InvitationCopy } from './i18n'

export function PartnersStep({ config, update, locale }: { config: InvitationConfig; update: InvitationConfigUpdate; locale: InvitationLocale }) {
  const t = getInvitationCopy(locale)
  const addPartner = () => update('partnerEntities', [...config.partnerEntities, { name: '', logoImage: undefined }])
  const removePartner = (index: number) => update('partnerEntities', config.partnerEntities.filter((_, itemIndex) => itemIndex !== index))
  const updatePartner = <K extends keyof InvitationPartner>(index: number, field: K, value: InvitationPartner[K]) => {
    update('partnerEntities', config.partnerEntities.map((partner, itemIndex) => itemIndex === index ? { ...partner, [field]: value } : partner))
  }

  return (
    <div className="space-y-5">
      <SectionTitle icon={Handshake} title={t.partnersTitle} description={t.partnersDescription} />
      <Toggle checked={config.hasPartnerEntities} onChange={value => update('hasPartnerEntities', value)} label={t.hasPartners} />

      {config.hasPartnerEntities && (
        <>
          <p className="text-xs text-feps-ink-secondary">{t.partnersHint}</p>
          <div className="space-y-3">
            {config.partnerEntities.map((partner, index) => (
              <div key={index} className="relative border border-feps-ink/15 bg-white p-4">
                <button type="button" onClick={() => removePartner(index)} aria-label={`${t.deleteEntity} ${index + 1}`} className="absolute end-3 top-3 p-1 text-feps-ink-tertiary transition-colors hover:bg-red-50 hover:text-red-600">
                  <Trash2 size={16} />
                </button>
                <p className="mb-3 text-xs font-bold text-feps-navy">{t.entity} {index + 1}</p>
                <Field><Label>{t.entityName}</Label><Input value={partner.name} onChange={event => updatePartner(index, 'name', event.target.value)} placeholder={t.entityName} /></Field>
                <Field>
                  <Label>{t.entityLogo}</Label>
                  <PartnerLogoUpload
                    partner={partner}
                    index={index}
                    onChange={value => updatePartner(index, 'logoImage', value)}
                    t={t}
                  />
                </Field>
              </div>
            ))}
          </div>
          <button type="button" onClick={addPartner} className="flex items-center gap-2 border border-feps-ink/20 px-4 py-2 text-sm font-bold text-feps-navy transition-colors hover:bg-feps-navy/5">
            <Plus size={14} /> {t.addEntity}
          </button>
        </>
      )}

      <div className="mt-6 border border-dashed border-feps-ink/25 bg-white p-5">
        <p className="mb-4 text-center text-xs font-bold text-feps-ink-secondary">{t.logosOrder}</p>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <LogoPlaceholder label={t.cairoUniversity}>CU</LogoPlaceholder>
          {config.hasPartnerEntities && config.partnerEntities.map((partner, index) => {
            const logoSource = partner.logoImage || partner.logoUrl
            return logoSource ? (
              <div key={index} className="text-center">
                <Image src={logoSource} alt={partner.name || `${t.entityLogoAlt} ${index + 1}`} width={48} height={48} unoptimized className="h-12 w-12 object-contain" />
                <span className="mt-1 block max-w-20 truncate text-[9px] text-feps-ink-secondary">{partner.name || `${t.entity} ${index + 1}`}</span>
              </div>
            ) : (
              <LogoPlaceholder key={index}>{partner.name || `${t.entity} ${index + 1}`}</LogoPlaceholder>
            )
          })}
          <LogoPlaceholder label={t.facultyShort}>FEPS</LogoPlaceholder>
        </div>
      </div>
    </div>
  )
}

function PartnerLogoUpload({ partner, index, onChange, t }: { partner: InvitationPartner; index: number; onChange: (value: string | undefined) => void; t: InvitationCopy }) {
  const [error, setError] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const logoSource = partner.logoImage || partner.logoUrl
  const inputId = `partner-logo-${index}`

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) {
      setError(t.logoTooLarge)
      event.target.value = ''
      return
    }

    setError(null)
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', 'invitation-logo')
      const response = await fetch('/api/events/upload', { method: 'POST', body: formData })
      if (!response.ok) throw new Error(await response.text())
      const data = await response.json() as { url: string }
      onChange(data.url)
    } catch (uploadError) {
      console.error('[Invitation logo upload]', uploadError)
      setError(t.logoUploadFailed)
    } finally {
      setUploading(false)
      event.target.value = ''
    }
  }

  return (
    <div>
      {logoSource ? (
        <div className="flex items-center gap-4 border border-feps-ink/15 bg-feps-paper p-3">
          <Image src={logoSource} alt={partner.name || `${t.entityLogoAlt} ${index + 1}`} width={64} height={64} unoptimized className="h-16 w-16 bg-white object-contain p-1" />
          <div className="flex flex-wrap gap-2">
            <label htmlFor={inputId} className={`border border-feps-ink/20 bg-white px-3 py-2 text-xs font-bold text-feps-navy transition-colors hover:bg-feps-navy/5 ${uploading ? 'pointer-events-none opacity-50' : 'cursor-pointer'}`}>
              {uploading ? t.uploading : t.changeLogo}
            </label>
            <button type="button" onClick={() => onChange(undefined)} className="flex items-center gap-1 border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-700 hover:bg-red-100">
              <X size={13} /> {t.remove}
            </button>
          </div>
        </div>
      ) : (
        <label htmlFor={inputId} className={`flex items-center justify-center gap-2 border-2 border-dashed border-feps-ink/20 bg-white px-4 py-6 text-sm font-bold text-feps-navy transition-colors hover:border-feps-navy ${uploading ? 'pointer-events-none opacity-50' : 'cursor-pointer'}`}>
          {uploading ? <Loader size={18} className="animate-spin" /> : <ImagePlus size={18} />}
          {uploading ? t.uploadingLogo : t.uploadLogo}
        </label>
      )}
      <input id={inputId} type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" disabled={uploading} onChange={handleFileChange} />
      <p className={`mt-2 text-xs ${error ? 'text-red-600' : 'text-feps-ink-tertiary'}`}>{error || t.logoRules}</p>
    </div>
  )
}

function LogoPlaceholder({ children, label }: { children: ReactNode; label?: string }) {
  return (
    <div className="text-center">
      <div className="flex h-12 w-12 items-center justify-center border border-feps-ink/10 bg-feps-ink/5 px-1 text-center text-[9px] text-feps-ink-secondary">{children}</div>
      {label && <span className="mt-1 block text-[9px] text-feps-ink-secondary">{label}</span>}
    </div>
  )
}
