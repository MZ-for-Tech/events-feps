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
      <span className="relative">
        <input type="checkbox" className="peer sr-only" checked={checked} onChange={event => onChange(event.target.checked)} />
        <span className="block h-6 w-11 rounded-full bg-feps-ink/15 transition-colors after:absolute after:right-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-feps-ink/20 after:bg-white after:content-[''] after:transition-all peer-checked:bg-feps-navy peer-checked:after:-translate-x-full rtl:peer-checked:after:translate-x-full" />
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
