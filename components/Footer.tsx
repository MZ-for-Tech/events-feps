'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useTranslations, useLocale } from 'next-intl'
import { usePathname } from 'next/navigation'
import { ExternalLink } from 'lucide-react'

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
      className="border-t-4 border-feps-gold bg-feps-navy-dark text-white relative overflow-hidden"
      style={{
        padding: '4rem 0 2rem',
        marginTop: isAdmin ? '0' : '4rem',
      }}
    >
      {/* Decorative Watermark for premium feel */}
      <div className="absolute -bottom-24 -right-24 opacity-[0.03] pointer-events-none select-none">
        <span className="font-serif text-[20rem] font-bold leading-none tracking-tighter text-white">FEPS</span>
      </div>

      <div className="container relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12 mb-12">
          {/* About */}
          <div className="lg:col-span-2 lg:pr-12 lg:border-r-2 border-white/10 rtl:lg:border-r-0 rtl:lg:border-l-2 rtl:lg:pl-12">
            <h3 className="font-sans font-bold uppercase tracking-widest text-feps-gold text-sm mb-4 border-b-2 border-white/10 pb-2">
              {t('aboutTitle')}
            </h3>
            <p className="font-serif text-base leading-relaxed text-white/70">
              {t('aboutDesc')}
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="font-sans font-bold uppercase tracking-widest text-feps-gold text-sm mb-4 border-b-2 border-white/10 pb-2">
              {t('quickLinks')}
            </h3>
            <nav aria-label="Footer navigation" className="flex flex-col gap-3">
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
                  className="group flex items-center font-sans text-sm font-medium text-white/70 hover:text-feps-gold hover:translate-x-1 rtl:hover:-translate-x-1 transition-transform"
                >
                  <span className="border-b border-transparent group-hover:border-feps-gold transition-colors">{l.label}</span>
                  {l.external && <ExternalLink size={12} className="ms-1.5 opacity-50" />}
                </Link>
              ))}
            </nav>
          </div>

          {/* Social Media */}
          <div>
            <h3 className="font-sans font-bold uppercase tracking-widest text-feps-gold text-sm mb-4 border-b-2 border-white/10 pb-2">
              {t('socialMedia')}
            </h3>
            <nav aria-label="Social media" className="flex flex-col gap-3">
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
                  className="group flex items-center font-sans text-sm font-medium text-white/70 hover:text-feps-gold hover:translate-x-1 rtl:hover:-translate-x-1 transition-transform"
                >
                  <span className="border-b border-transparent group-hover:border-feps-gold transition-colors">{l.label}</span>
                  {l.external && <ExternalLink size={12} className="ms-1.5 opacity-50" />}
                </Link>
              ))}
            </nav>
          </div>

          {/* Legal & Help */}
          <div>
            <h3 className="font-sans font-bold uppercase tracking-widest text-feps-gold text-sm mb-4 border-b-2 border-white/10 pb-2">
              {t('legalPrivacy')}
            </h3>
            <nav aria-label="Legal navigation" className="flex flex-col gap-3 mb-8">
              {[
                { href: `/${locale}/terms`, label: t('termsOfUse') },
                { href: `/${locale}/privacy`, label: t('privacyPolicy') },
              ].map(l => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="group flex items-center font-sans text-sm font-medium text-white/70 hover:text-feps-gold hover:translate-x-1 rtl:hover:-translate-x-1 transition-transform"
                >
                  <span className="border-b border-transparent group-hover:border-feps-gold transition-colors">{l.label}</span>
                </Link>
              ))}
            </nav>
            
            <h3 className="font-sans font-bold uppercase tracking-widest text-feps-gold text-sm mb-4 border-b-2 border-white/10 pb-2">
              {t('contact')}
            </h3>
            <p className="font-sans text-sm leading-relaxed text-white/70">
              {t('address')}
            </p>
          </div>
        </div>

        <div className="mt-16 pt-6 border-t-2 border-white/10 flex justify-between items-center flex-wrap gap-4 font-sans text-xs font-bold tracking-widest uppercase text-white/50">
          <p>
            {t('copyright', { year: new Date().getFullYear() })}
          </p>
          <p>
            {t.rich('poweredBy', {
              mz: (chunks) => (
                <a
                  href={developerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white hover:text-feps-gold border-b border-transparent hover:border-feps-gold transition-colors ms-1"
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
