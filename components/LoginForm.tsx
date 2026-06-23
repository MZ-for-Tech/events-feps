'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'

import { useTranslations, useLocale } from 'next-intl'


export default function LoginForm() {
  const router = useRouter()
  const locale = useLocale()
  const t = useTranslations('Login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await signIn('credentials', {
      email,
      password,
      redirect: false,
    })

    setLoading(false)
    if (res?.error) {
      setError(t('error'))
    } else {
      router.push(`/${locale}`)
      router.refresh()
    }
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
          className="w-full mt-2 inline-flex justify-center items-center px-6 py-4 bg-feps-ink text-feps-paper font-sans text-xs uppercase tracking-widest font-semibold hover:bg-feps-navy transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? t('signingIn') : t('signIn')}
        </button>
      </form>

      {/* Quick Login for Testing */}
      <div className="mt-8 pt-6 border-t border-feps-border">
        <p className="font-sans text-xs uppercase tracking-widest text-feps-ink-secondary mb-4 text-center">
          {t('quickLogin')}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { label: 'Superadmin', email: 'admin@feps.edu.eg', pass: 'admin1234' },
            { label: 'Manager', email: 'manager@feps.edu.eg', pass: 'manager123' },
            { label: 'Editor', email: 'editor@feps.edu.eg', pass: 'editor123' },
          ].map(role => (
            <button
              key={role.label}
              type="button"
              disabled={loading}
              className="px-3 py-2 border border-feps-border text-feps-ink font-sans text-[0.65rem] uppercase tracking-widest hover:bg-feps-ink hover:text-feps-paper hover:border-feps-ink transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={async () => {
                setLoading(true)
                setError('')
                const res = await signIn('credentials', {
                  email: role.email,
                  password: role.pass,
                  redirect: false,
                })
                setLoading(false)
                if (res?.error) {
                  setError(t('error'))
                } else {
                  router.push(`/${locale}/admin/events`)
                  router.refresh()
                }
              }}
            >
              {role.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
