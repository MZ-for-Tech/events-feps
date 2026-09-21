'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useTranslations, useLocale } from 'next-intl'
import { Loader2 } from 'lucide-react'

const QUICK_ROLES = [
  { label: 'Superadmin', email: 'admin@feps.edu.eg', pass: 'admin123' },
  { label: 'Manager', email: 'manager@feps.edu.eg', pass: 'admin123' },
  { label: 'Editor', email: 'editor@feps.edu.eg', pass: 'admin123' },
]

export default function LoginForm() {
  const locale = useLocale()
  const t = useTranslations('Login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [activeRole, setActiveRole] = useState<string | null>(null)

  async function performLogin(targetEmail: string, targetPass: string, roleLabel?: string) {
    setEmail(targetEmail)
    setPassword(targetPass)
    setLoading(true)
    setError('')
    if (roleLabel) setActiveRole(roleLabel)

    try {
      const cleanEmail = targetEmail.trim().toLowerCase()
      const res = await signIn('credentials', {
        email: cleanEmail,
        password: targetPass,
        redirect: false,
      })

      if (res?.error) {
        console.error('[LoginForm] Sign in error:', res.error)
        setError(t('error'))
        setLoading(false)
        setActiveRole(null)
      } else {
        window.location.href = `/${locale}/admin/events`
      }
    } catch (err) {
      console.error('[LoginForm] Sign in exception:', err)
      setError(t('error'))
      setLoading(false)
      setActiveRole(null)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    await performLogin(email, password)
  }

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div>
          <label htmlFor="email" className="block font-sans text-xs uppercase tracking-widest font-semibold text-feps-ink mb-2">
            {t('emailLabel')}
          </label>
          <input
            id="email"
            type="email"
            className="w-full px-4 py-3 bg-feps-paper border border-feps-border focus:border-feps-ink focus:ring-1 focus:ring-feps-ink outline-none transition-colors font-sans"
            placeholder={t('emailPlaceholder')}
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </div>

        <div>
          <label htmlFor="password" className="block font-sans text-xs uppercase tracking-widest font-semibold text-feps-ink mb-2">
            {t('passwordLabel')}
          </label>
          <input
            id="password"
            type="password"
            className="w-full px-4 py-3 bg-feps-paper border border-feps-border focus:border-feps-ink focus:ring-1 focus:ring-feps-ink outline-none transition-colors font-sans"
            placeholder={t('passwordPlaceholder')}
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
        </div>

        {error && <p className="text-feps-error text-sm font-medium" role="alert">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-2 inline-flex justify-center items-center px-6 py-4 bg-feps-ink text-feps-paper font-sans text-xs uppercase tracking-widest font-semibold hover:bg-feps-navy transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {loading && !activeRole ? (
            <span className="inline-flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              {t('signingIn')}
            </span>
          ) : (
            t('signIn')
          )}
        </button>
      </form>

      {/* Quick Login for Testing */}
      <div className="mt-8 pt-6 border-t border-feps-border">
        <p className="font-sans text-xs uppercase tracking-widest text-feps-ink-secondary mb-4 text-center">
          {t('quickLogin')}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {QUICK_ROLES.map(role => {
            const isThisLoading = loading && activeRole === role.label
            return (
              <button
                key={role.label}
                type="button"
                disabled={loading}
                className="px-3 py-2.5 border border-feps-border text-feps-ink font-sans text-xs uppercase tracking-wider hover:bg-feps-ink hover:text-feps-paper hover:border-feps-ink transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-1.5 font-semibold"
                onClick={() => performLogin(role.email, role.pass, role.label)}
              >
                {isThisLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {isThisLoading ? t('signingIn') : role.label}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
