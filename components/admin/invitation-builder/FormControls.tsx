import type { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from 'react'
import type { LucideIcon } from 'lucide-react'

export function Label({ children }: { children: ReactNode }) {
  return <label className="mb-2 block text-sm font-bold text-feps-ink">{children}</label>
}

export function Field({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={`mb-4 ${className ?? ''}`}>{children}</div>
}

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full border border-feps-ink/20 bg-white px-3 py-2.5 text-sm text-feps-ink transition-colors placeholder:text-feps-ink-tertiary focus:border-feps-navy focus:outline-none ${props.className ?? ''}`}
    />
  )
}

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`w-full resize-none border border-feps-ink/20 bg-white px-3 py-2.5 text-sm text-feps-ink transition-colors placeholder:text-feps-ink-tertiary focus:border-feps-navy focus:outline-none ${props.className ?? ''}`}
    />
  )
}

export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (value: boolean) => void; label: string }) {
  return (
    <label className="mb-5 flex cursor-pointer select-none items-center gap-3 border border-feps-ink/10 bg-feps-ink/[0.03] p-4">
      <span className="relative block h-6 w-11 shrink-0">
        <input type="checkbox" className="peer sr-only" checked={checked} onChange={event => onChange(event.target.checked)} />
        <span aria-hidden="true" className={`absolute inset-0 rounded-full transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-feps-gold peer-focus-visible:ring-offset-2 ${checked ? 'bg-feps-navy' : 'bg-feps-ink/15'}`} />
        <span aria-hidden="true" className={`absolute start-0.5 top-0.5 h-5 w-5 rounded-full border border-feps-ink/20 bg-white shadow-sm transition-transform ${checked ? 'translate-x-5 rtl:-translate-x-5' : ''}`} />
      </span>
      <span className="text-sm font-bold text-feps-ink">{label}</span>
    </label>
  )
}

export function SectionTitle({ icon: Icon, title, description }: { icon: LucideIcon; title: string; description?: string }) {
  return (
    <div className="mb-5 flex items-start gap-3 border-b border-feps-ink/10 pb-4">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center bg-feps-navy/10 text-feps-navy">
        <Icon size={18} />
      </span>
      <div>
        <h3 className="text-base font-bold text-feps-navy">{title}</h3>
        {description && <p className="mt-1 text-xs text-feps-ink-secondary">{description}</p>}
      </div>
    </div>
  )
}
