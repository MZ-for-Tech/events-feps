'use client'

import React, { useState, useRef, useCallback } from 'react'
import { Plus, Trash2, ChevronRight, ChevronLeft, Check, Download, Printer, Upload, X, Loader } from 'lucide-react'
import dynamic from 'next/dynamic'
import InvitationCard from './InvitationCard'
import type { InvitationConfig, InvitationMinister, InvitationPartner } from '@/types/invitation'
import { DEFAULT_INVITATION_CONFIG, PRESET_BG_COLORS, EVENT_TYPES, DAYS_OF_WEEK, SUPERVISION_LABELS } from '@/types/invitation'
import InvitationPDFDocument from './InvitationPDFDocument'

const PDFDownloadLink = dynamic(() => import('@react-pdf/renderer').then(m => m.PDFDownloadLink), { ssr: false })

// ──────────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────────
interface Props {
  eventId: string
  eventTitleAr?: string
  eventLocation?: string
  eventStartDate?: string
  isAr?: boolean
  initialConfig?: InvitationConfig | null
}

const STEPS = [
  { id: 1, label: 'الرعاة',           icon: '👑' },
  { id: 2, label: 'الجهات الشريكة',  icon: '🤝' },
  { id: 3, label: 'تفاصيل الدعوة',   icon: '📝' },
  { id: 4, label: 'الخلفية',          icon: '🎨' },
  { id: 5, label: 'معاينة وتحميل',   icon: '👁️' },
]

// ──────────────────────────────────────────────────────────────
// Helper components
// ──────────────────────────────────────────────────────────────
function Label({ children }: { children: React.ReactNode }) {
  return <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-1">{children}</label>
}

function Field({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={`mb-4 ${className ?? ''}`}>{children}</div>
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1A3A6E] bg-white transition-colors ${props.className ?? ''}`}
    />
  )
}

function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1A3A6E] bg-white transition-colors resize-none ${props.className ?? ''}`}
    />
  )
}

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer select-none mb-4">
      <div className="relative">
        <input type="checkbox" className="peer sr-only" checked={checked} onChange={e => onChange(e.target.checked)} />
        <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#1A3A6E]" />
      </div>
      <span className="text-sm font-bold text-gray-700">{label}</span>
    </label>
  )
}

// ──────────────────────────────────────────────────────────────
// Main component
// ──────────────────────────────────────────────────────────────
export default function InvitationBuilder({ eventId, eventTitleAr, eventLocation, eventStartDate, isAr = true, initialConfig }: Props) {
  const [step, setStep]   = useState(1)
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState<string | null>(null)
  const [config, setConfig] = useState<InvitationConfig>(() => {
    if (initialConfig) return initialConfig
    const d = new Date(eventStartDate || Date.now())
    const dayName = DAYS_OF_WEEK[d.getDay()]
    const dateStr = d.toLocaleDateString('ar-EG', { day: 'numeric', month: 'long', year: 'numeric' })
    return {
      ...DEFAULT_INVITATION_CONFIG,
      eventTitleOnCard: eventTitleAr || '',
      eventLocationDisplay: eventLocation || '',
      eventDay: dayName,
      eventDateDisplay: dateStr,
    }
  })

  const update = useCallback(<K extends keyof InvitationConfig>(key: K, value: InvitationConfig[K]) => {
    setConfig(prev => ({ ...prev, [key]: value }))
  }, [])

  const addMinister    = () => update('ministers', [...config.ministers, { fullTitle: 'د/', name: '', position: '' }])
  const removeMinister = (i: number) => update('ministers', config.ministers.filter((_, idx) => idx !== i))
  const updateMinister = (i: number, field: keyof InvitationMinister, val: string) =>
    update('ministers', config.ministers.map((m, idx) => idx === i ? { ...m, [field]: val } : m))

  const addPartner    = () => update('partnerEntities', [...config.partnerEntities, { name: '', logoUrl: undefined }])
  const removePartner = (i: number) => update('partnerEntities', config.partnerEntities.filter((_, idx) => idx !== i))
  const updatePartner = (i: number, field: keyof InvitationPartner, val: string) =>
    update('partnerEntities', config.partnerEntities.map((p, idx) => idx === i ? { ...p, [field]: val } : p))

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch(`/api/events/${eventId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invitationConfig: JSON.stringify(config) }),
      })
      setSaveMsg(res.ok ? '✅ تم الحفظ' : '❌ حدث خطأ')
    } catch {
      setSaveMsg('❌ حدث خطأ')
    } finally {
      setSaving(false)
      setTimeout(() => setSaveMsg(null), 3000)
    }
  }

  // ── STEP RENDERERS ──────────────────────────────────────────

  const Step1 = () => (
    <div className="space-y-2" dir="rtl">
      <p className="text-xs text-gray-400 mb-4">ترتيب الرعاة: الوزراء → رئيس الجامعة → العميد</p>

      <Toggle
        checked={config.hasMinistersPatronage}
        onChange={v => update('hasMinistersPatronage', v)}
        label="هل يوجد وزراء كرعاة؟ (يُذكرون قبل رئيس الجامعة)"
      />

      {config.hasMinistersPatronage && (
        <div className="space-y-4 mb-6">
          {config.ministers.map((m, i) => (
            <div key={i} className="bg-blue-50 border border-blue-100 rounded-xl p-4 relative">
              <button onClick={() => removeMinister(i)} className="absolute top-3 left-3 text-red-400 hover:text-red-600">
                <Trash2 size={14} />
              </button>
              <p className="text-xs font-bold text-blue-600 mb-3">وزير {i + 1}</p>
              <div className="grid grid-cols-3 gap-2">
                <div><Label>اللقب</Label><Input value={m.fullTitle} onChange={e => updateMinister(i, 'fullTitle', e.target.value)} placeholder="د/" /></div>
                <div className="col-span-2"><Label>الاسم</Label><Input value={m.name} onChange={e => updateMinister(i, 'name', e.target.value)} placeholder="اسم الوزير" /></div>
              </div>
              <div className="mt-2"><Label>المنصب</Label><Input value={m.position} onChange={e => updateMinister(i, 'position', e.target.value)} placeholder="وزير الخارجية والتعاون الدولي" /></div>
            </div>
          ))}
          <button onClick={addMinister} className="flex items-center gap-2 text-sm text-blue-600 font-bold hover:underline">
            <Plus size={14} /> إضافة وزير
          </button>
        </div>
      )}

      <div className="border-t border-gray-100 pt-4">
        <p className="text-sm font-black text-[#1A3A6E] mb-3">رئيس الجامعة</p>
        <div className="grid grid-cols-3 gap-2">
          <Field>
            <Label>اللقب</Label>
            <Input value={config.universityPresidentTitle} onChange={e => update('universityPresidentTitle', e.target.value)} />
          </Field>
          <Field className="col-span-2">
            <Label>الاسم</Label>
            <Input value={config.universityPresidentName} onChange={e => update('universityPresidentName', e.target.value)} />
          </Field>
        </div>
        <Field>
          <Label>المسمى الوظيفي</Label>
          <Input value={config.universityPresidentSuffix} onChange={e => update('universityPresidentSuffix', e.target.value)} />
        </Field>
      </div>

      <div className="border-t border-gray-100 pt-4">
        <p className="text-sm font-black text-[#1A3A6E] mb-3">عميد الكلية</p>
        <Field>
          <Label>صيغة الإشراف</Label>
          <div className="flex flex-wrap gap-2">
            {SUPERVISION_LABELS.map(lbl => (
              <button
                key={lbl}
                onClick={() => update('supervisionLabel', lbl)}
                className={`px-4 py-1.5 rounded-full text-sm font-bold border transition-colors ${config.supervisionLabel === lbl ? 'bg-[#1A3A6E] text-white border-[#1A3A6E]' : 'border-gray-300 text-gray-600 hover:border-[#1A3A6E]'}`}
              >
                {lbl}
              </button>
            ))}
          </div>
        </Field>
        <div className="grid grid-cols-3 gap-2">
          <Field><Label>اللقب</Label><Input value={config.deanTitle} onChange={e => update('deanTitle', e.target.value)} /></Field>
          <Field className="col-span-2"><Label>الاسم</Label><Input value={config.deanName} onChange={e => update('deanName', e.target.value)} /></Field>
        </div>
        <Field><Label>المنصب</Label><Input value={config.deanPosition} onChange={e => update('deanPosition', e.target.value)} /></Field>
        <Field><Label>سطر إضافي (اختياري)</Label><Input value={config.deanExtraLine ?? ''} onChange={e => update('deanExtraLine', e.target.value)} /></Field>
      </div>
    </div>
  )

  const Step2 = () => (
    <div className="space-y-4" dir="rtl">
      <Toggle
        checked={config.hasPartnerEntities}
        onChange={v => update('hasPartnerEntities', v)}
        label="هل توجد جهات أخرى مشاركة؟"
      />

      {config.hasPartnerEntities && (
        <>
          <p className="text-xs text-gray-400">لوجوهات الجهات ستظهر بين شعار جامعة القاهرة وشعار الكلية</p>
          <div className="space-y-3">
            {config.partnerEntities.map((p, i) => (
              <div key={i} className="bg-gray-50 border border-gray-200 rounded-xl p-4 relative">
                <button onClick={() => removePartner(i)} className="absolute top-3 left-3 text-red-400 hover:text-red-600">
                  <Trash2 size={14} />
                </button>
                <p className="text-xs font-bold text-gray-500 mb-2">جهة {i + 1}</p>
                <Field><Label>اسم الجهة</Label><Input value={p.name} onChange={e => updatePartner(i, 'name', e.target.value)} placeholder="اسم الجهة" /></Field>
                <Field><Label>رابط اللوجو (اختياري)</Label><Input value={p.logoUrl ?? ''} onChange={e => updatePartner(i, 'logoUrl', e.target.value)} placeholder="https://..." /></Field>
              </div>
            ))}
          </div>
          <button onClick={addPartner} className="flex items-center gap-2 text-sm text-[#1A3A6E] font-bold hover:underline">
            <Plus size={14} /> إضافة جهة
          </button>
        </>
      )}

      {/* Logo preview */}
      <div className="mt-6 bg-white border border-dashed border-gray-300 rounded-xl p-4">
        <p className="text-xs text-gray-400 mb-3 text-center">معاينة صف اللوجوهات</p>
        <div className="flex items-center justify-between">
          <div className="text-center"><div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-[10px] text-gray-400">CU</div><span className="text-[9px] text-gray-400">جامعة القاهرة</span></div>
          {config.hasPartnerEntities && config.partnerEntities.map((p, i) => (
            <div key={i} className="text-center">
              <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-[9px] text-gray-500 px-1 text-center">{p.name || `جهة ${i + 1}`}</div>
            </div>
          ))}
          <div className="text-center"><div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-[10px] text-gray-400">FEPS</div><span className="text-[9px] text-gray-400">الكلية</span></div>
        </div>
      </div>
    </div>
  )

  const Step3 = () => (
    <div className="space-y-1" dir="rtl">
      <Field>
        <Label>نوع الفعالية</Label>
        <div className="flex flex-wrap gap-2">
          {EVENT_TYPES.map(t => (
            <button
              key={t}
              onClick={() => update('eventType', t)}
              className={`px-4 py-1.5 rounded-full text-sm font-bold border transition-colors ${config.eventType === t ? 'bg-[#1A3A6E] text-white border-[#1A3A6E]' : 'border-gray-300 text-gray-600 hover:border-[#1A3A6E]'}`}
            >
              {t}
            </button>
          ))}
        </div>
        {config.eventType === 'أخرى' && (
          <Input className="mt-2" placeholder="اكتب نوع الفعالية" onChange={e => update('eventType', e.target.value)} />
        )}
      </Field>

      <Field>
        <Label>نص الدعوة (المقدمة)</Label>
        <Textarea value={config.bodyText} onChange={e => update('bodyText', e.target.value)} rows={2} />
      </Field>

      <Field>
        <Label>عنوان الفعالية على الدعوة</Label>
        <Textarea value={config.eventTitleOnCard} onChange={e => update('eventTitleOnCard', e.target.value)} rows={2} />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field>
          <Label>اليوم</Label>
          <select
            value={config.eventDay}
            onChange={e => update('eventDay', e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1A3A6E] bg-white"
          >
            <option value="">اختر اليوم</option>
            {DAYS_OF_WEEK.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </Field>
        <Field>
          <Label>التاريخ (للعرض)</Label>
          <Input value={config.eventDateDisplay} onChange={e => update('eventDateDisplay', e.target.value)} placeholder="28 أبريل 2026" />
        </Field>
      </div>

      <Field>
        <Label>الوقت (للعرض)</Label>
        <Input value={config.eventTimeDisplay} onChange={e => update('eventTimeDisplay', e.target.value)} placeholder="12:00 ص – 1:30 ظهراً" />
      </Field>

      <Field>
        <Label>المكان (للعرض)</Label>
        <Input value={config.eventLocationDisplay} onChange={e => update('eventLocationDisplay', e.target.value)} placeholder="قاعة ساويرس - كلية الاقتصاد..." />
      </Field>
    </div>
  )

  const Step4 = () => {
    const fileRef = useRef<HTMLInputElement>(null)

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return
      const reader = new FileReader()
      reader.onload = ev => update('bgImageUrl', ev.target?.result as string)
      reader.readAsDataURL(file)
    }

    return (
      <div className="space-y-6" dir="rtl">
        {/* Upload image */}
        <div>
          <Label>رفع صورة خلفية (اختياري)</Label>
          <div
            onClick={() => fileRef.current?.click()}
            className="mt-2 border-2 border-dashed border-gray-300 rounded-xl p-6 text-center cursor-pointer hover:border-[#1A3A6E] transition-colors"
          >
            {config.bgImageUrl ? (
              <div className="relative">
                <img src={config.bgImageUrl} alt="bg" className="max-h-32 mx-auto rounded-lg object-cover" />
                <button
                  onClick={e => { e.stopPropagation(); update('bgImageUrl', undefined) }}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600"
                >
                  <X size={12} />
                </button>
              </div>
            ) : (
              <>
                <Upload size={24} className="mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-500">اضغط لاختيار صورة</p>
                <p className="text-xs text-gray-400">PNG, JPG, WEBP</p>
              </>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
        </div>

        {/* Preset colors */}
        <div>
          <Label>أو اختر لون خلفية</Label>
          <div className="grid grid-cols-5 gap-3 mt-2">
            {PRESET_BG_COLORS.map(c => (
              <button
                key={c.value}
                onClick={() => { update('bgColor', c.value); update('bgImageUrl', undefined) }}
                className={`relative h-16 rounded-xl border-2 transition-all flex flex-col items-center justify-center ${(!config.bgImageUrl && config.bgColor === c.value) ? 'border-[#1A3A6E] scale-105 shadow-md' : 'border-transparent hover:border-gray-300'}`}
                style={{ background: c.value }}
              >
                <span className="text-[10px] font-bold" style={{ color: c.text }}>{c.label}</span>
                {!config.bgImageUrl && config.bgColor === c.value && (
                  <div className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-[#1A3A6E] rounded-full flex items-center justify-center">
                    <Check size={10} className="text-white" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const Step5 = () => (
    <div className="space-y-6" dir="rtl">
      <p className="text-xs text-gray-400">معاينة مباشرة للدعوة — تحقق من البيانات قبل التحميل</p>

      <div className="border border-gray-200 rounded-xl overflow-hidden shadow-lg">
        <InvitationCard
          config={config}
          eventTitle={eventTitleAr}
          eventLocation={eventLocation}
          eventDate={eventStartDate}
        />
      </div>

      <div className="flex gap-3 flex-wrap">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-[#1A3A6E] text-white px-5 py-2.5 rounded-lg font-bold text-sm hover:bg-[#122b52] transition-colors disabled:opacity-50"
        >
          {saving ? <Loader size={14} className="animate-spin" /> : <Check size={14} />}
          {saving ? 'جاري الحفظ...' : 'حفظ الدعوة'}
        </button>

        <PDFDownloadLink
          document={<InvitationPDFDocument config={config} />}
          fileName={`Invitation_${eventId}.pdf`}
          className="flex items-center gap-2 bg-[#D4AF37] text-[#1A3A6E] px-5 py-2.5 rounded-lg font-bold text-sm hover:bg-[#c9a72e] transition-colors"
        >
          {({ loading }) => <><Download size={14} />{loading ? 'جاري التجهيز...' : 'تحميل PDF'}</>}
        </PDFDownloadLink>

        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 bg-gray-100 text-gray-700 px-5 py-2.5 rounded-lg font-bold text-sm hover:bg-gray-200 transition-colors"
        >
          <Printer size={14} /> طباعة
        </button>
      </div>

      {saveMsg && (
        <p className="text-sm font-bold text-center py-2 rounded-lg bg-green-50 text-green-700">{saveMsg}</p>
      )}
    </div>
  )

  const stepComponents: Record<number, React.ReactNode> = {
    1: <Step1 />,
    2: <Step2 />,
    3: <Step3 />,
    4: <Step4 />,
    5: <Step5 />,
  }

  return (
    <div className="p-6" dir="rtl">
      {/* ── STEP INDICATORS ── */}
      <div className="flex items-center gap-0 mb-8 overflow-x-auto pb-2">
        {STEPS.map((s, idx) => (
          <React.Fragment key={s.id}>
            <button
              onClick={() => setStep(s.id)}
              className={`flex flex-col items-center gap-1 min-w-[80px] group`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg transition-all font-bold border-2 ${step === s.id ? 'bg-[#1A3A6E] text-white border-[#1A3A6E] scale-110 shadow-lg' : step > s.id ? 'bg-green-500 text-white border-green-500' : 'bg-white text-gray-400 border-gray-200 group-hover:border-[#1A3A6E]'}`}>
                {step > s.id ? <Check size={16} /> : s.icon}
              </div>
              <span className={`text-[11px] font-bold whitespace-nowrap ${step === s.id ? 'text-[#1A3A6E]' : 'text-gray-400'}`}>
                {s.label}
              </span>
            </button>
            {idx < STEPS.length - 1 && (
              <div className={`h-[2px] flex-1 mx-1 transition-colors ${step > s.id ? 'bg-green-400' : 'bg-gray-200'}`} />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* ── STEP CONTENT ── */}
      <div className="min-h-[400px]">
        {stepComponents[step]}
      </div>

      {/* ── NAVIGATION ── */}
      <div className="flex justify-between mt-8 pt-4 border-t border-gray-100">
        <button
          onClick={() => setStep(s => Math.max(1, s - 1))}
          disabled={step === 1}
          className="flex items-center gap-2 px-5 py-2.5 border border-gray-200 rounded-lg text-sm font-bold text-gray-600 hover:bg-gray-50 disabled:opacity-30 transition-colors"
        >
          <ChevronRight size={16} /> السابق
        </button>

        <div className="flex items-center gap-2">
          {step < 5 && (
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-bold hover:bg-gray-200 transition-colors"
            >
              {saving ? <Loader size={14} className="animate-spin" /> : null}
              حفظ
            </button>
          )}
          <button
            onClick={() => setStep(s => Math.min(5, s + 1))}
            disabled={step === 5}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#1A3A6E] text-white rounded-lg text-sm font-bold hover:bg-[#122b52] disabled:opacity-30 transition-colors"
          >
            التالي <ChevronLeft size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}
