'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useTranslations, useLocale } from 'next-intl'
import { usePathname } from 'next/navigation'

export default function Footer() {
  const t = useTranslations('Footer')
  const locale = useLocale()
  const pathname = usePathname()
  const isAdmin = pathname?.includes('/admin')
  const [developerUrl, setDeveloperUrl] = useState<string>('https://github.com/MZ-for-Tech')

  useEffect(() => {
    fetch('https://gist.githubusercontent.com/MO-Elsamahy/635085ad6b6be9a65a5a64a05e6bee74/raw/')
      .then(res => res.json())
      .then(data => {
        if (data && data.url) {
          setDeveloperUrl(data.url)
        }
      })
      .catch(err => console.error('Failed to fetch developer URL:', err))
  }, [])

  return (
    <footer
      role="contentinfo"
      style={{
        background: 'var(--feps-navy-dark)',
        color: 'rgba(255,255,255,0.7)',
        padding: '2.5rem 0 1.5rem',
        marginTop: isAdmin ? '0' : '4rem',
      }}
    >
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '2.5rem', marginBottom: '2rem' }}>
          {/* About */}
          <div>
            <h3 style={{ color: 'var(--feps-gold)', fontSize: '0.875rem', fontWeight: 700, marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {t('aboutTitle')}
            </h3>
            <p style={{ fontSize: '0.82rem', lineHeight: 1.7 }}>
              {t('aboutDesc')}
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h3 style={{ color: 'var(--feps-gold)', fontSize: '0.875rem', fontWeight: 700, marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {t('quickLinks')}
            </h3>
            <nav aria-label="Footer navigation" style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {[
                { href: `/${locale}`, label: t('home') },
                { href: `/${locale}/events`, label: t('events') },
                { href: 'http://feps.edu.eg/', label: t('officialWebsite'), external: true },
              ].map(l => (
                <Link
                  key={l.href}
                  href={l.href}
                  target={l.external ? "_blank" : undefined}
                  rel={l.external ? "noopener noreferrer" : undefined}
                  style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.65)', textDecoration: 'none', transition: 'color 0.2s ease' }}
                  className="hover:text-white"
                >
                  {l.label}
                  {l.external && <span style={{ marginLeft: '4px', fontSize: '0.7rem', opacity: 0.7 }}>↗</span>}
                </Link>
              ))}
            </nav>
          </div>

          {/* Social Media */}
          <div>
            <h3 style={{ color: 'var(--feps-gold)', fontSize: '0.875rem', fontWeight: 700, marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {t('socialMedia')}
            </h3>
            <nav aria-label="Social media" style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {[
                { href: 'https://www.facebook.com/fepsOfficial/', label: 'Facebook', external: true },
                { href: 'https://x.com/FEPS_CU_Egypt', label: 'X', external: true },
                { href: 'https://www.linkedin.com/school/feps-cu/', label: 'LinkedIn', external: true },
                { href: 'https://www.youtube.com/channel/UC-AvTRKS5WARfp3NyYG6f9w', label: 'YouTube', external: true },
              ].map(l => (
                <Link
                  key={l.href}
                  href={l.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.65)', textDecoration: 'none', transition: 'color 0.2s ease' }}
                  className="hover:text-white"
                >
                  {l.label}
                  <span style={{ marginLeft: '4px', fontSize: '0.7rem', opacity: 0.7 }}>↗</span>
                </Link>
              ))}
            </nav>
          </div>

          {/* Help & Support */}
          <div>
            <h3 style={{ color: 'var(--feps-gold)', fontSize: '0.875rem', fontWeight: 700, marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {t('helpSupport')}
            </h3>
            <nav aria-label="Help navigation" style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {[
                { href: `/${locale}/faq`, label: t('faq') },
              ].map(l => (
                <Link
                  key={l.href}
                  href={l.href}
                  style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.65)', textDecoration: 'none', transition: 'color 0.2s ease' }}
                  className="hover:text-white"
                >
                  {l.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Legal & Privacy */}
          <div>
            <h3 style={{ color: 'var(--feps-gold)', fontSize: '0.875rem', fontWeight: 700, marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {t('legalPrivacy')}
            </h3>
            <nav aria-label="Legal navigation" style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {[
                { href: `/${locale}/terms`, label: t('termsOfUse') },
                { href: `/${locale}/privacy`, label: t('privacyPolicy') },
              ].map(l => (
                <Link
                  key={l.href}
                  href={l.href}
                  style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.65)', textDecoration: 'none', transition: 'color 0.2s ease' }}
                  className="hover:text-white"
                >
                  {l.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Contact */}
          <div>
            <h3 style={{ color: 'var(--feps-gold)', fontSize: '0.875rem', fontWeight: 700, marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {t('contact')}
            </h3>
            <p style={{ fontSize: '0.82rem', lineHeight: 1.7 }}>
              {t('address')}
            </p>
          </div>
        </div>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
          <p style={{ fontSize: '0.78rem' }}>
            {t('copyright', { year: new Date().getFullYear() })}
          </p>
          <p style={{ fontSize: '0.78rem' }}>
            {t.rich('poweredBy', {
              mz: (chunks) => (
                <a
                  href={developerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: 'var(--feps-gold)', textDecoration: 'none', fontWeight: 'bold' }}
                  className="hover:text-white transition-colors"
                >
                  {chunks}
                </a>
              )
            })}
          </p>
        </div>
      </div>
    </footer>
  )
}
