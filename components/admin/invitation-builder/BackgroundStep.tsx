import { useRef, type ChangeEvent } from 'react'
import Image from 'next/image'
import { Check, Palette, Upload, X } from 'lucide-react'
import type { InvitationConfig, InvitationLocale } from '@/types/invitation'
import { PRESET_BG_COLORS } from '@/types/invitation'
import { Label, SectionTitle } from './FormControls'
import type { InvitationConfigUpdate } from './types'
import { getInvitationCopy } from './i18n'

export function BackgroundStep({ config, update, locale }: { config: InvitationConfig; update: InvitationConfigUpdate; locale: InvitationLocale }) {
  const fileRef = useRef<HTMLInputElement>(null)
  const t = getInvitationCopy(locale)

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = loadEvent => update('bgImageUrl', loadEvent.target?.result as string)
    reader.readAsDataURL(file)
  }

  return (
    <div className="space-y-6">
      <SectionTitle icon={Palette} title={t.backgroundTitle} description={t.backgroundDescription} />

      <div>
        <Label>{t.uploadBackground}</Label>
        <div onClick={() => fileRef.current?.click()} className="mt-2 cursor-pointer border-2 border-dashed border-feps-ink/20 bg-white p-8 text-center transition-colors hover:border-feps-navy">
          {config.bgImageUrl ? (
            <div className="relative">
              <Image src={config.bgImageUrl} alt={t.backgroundPreview} width={640} height={160} unoptimized className="mx-auto h-auto max-h-40 w-auto object-cover" />
              <button type="button" onClick={event => { event.stopPropagation(); update('bgImageUrl', undefined) }} aria-label={t.removeBackground} className="absolute end-1 top-1 bg-red-600 p-1 text-white hover:bg-red-700">
                <X size={12} />
              </button>
            </div>
          ) : (
            <>
              <Upload size={24} className="mx-auto mb-2 text-feps-navy" />
              <p className="text-sm font-bold text-feps-ink">{t.chooseImage}</p>
              <p className="mt-1 text-xs text-feps-ink-secondary">{t.imageTypes}</p>
            </>
          )}
        </div>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
      </div>

      <div>
        <Label>{t.chooseColor}</Label>
        <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {PRESET_BG_COLORS.map((color, index) => {
            const isSelected = !config.bgImageUrl && config.bgColor === color.value
            const colorLabel = t.colors[index]
            return (
              <button
                key={color.value}
                type="button"
                onClick={() => { update('bgColor', color.value); update('bgImageUrl', undefined) }}
                aria-label={`${t.chooseBackground} ${colorLabel}`}
                className={`relative flex h-16 flex-col items-center justify-center border-2 transition-colors ${isSelected ? 'border-feps-navy' : 'border-feps-ink/10 hover:border-feps-navy/50'}`}
                style={{ background: color.value }}
              >
                <span className="text-[10px] font-bold" style={{ color: color.text }}>{colorLabel}</span>
                {isSelected && <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center bg-feps-navy"><Check size={10} className="text-white" /></span>}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
