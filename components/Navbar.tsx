'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { CalendarDays, Home, Settings, LogOut, LogIn } from 'lucide-react'

export default function Navbar() {
  const { data: session } = useSession()
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)
  const t = useTranslations('Nav')
  const f = useTranslations('Footer')
  const locale = useLocale()

  const currentPathWithoutLocale = pathname.replace(`/${locale}`, '') || '/'
  const isLoginPage = currentPathWithoutLocale === '/login'

  const isAdmin = session?.user?.role === 'SUPERADMIN' || session?.user?.role === 'MANAGER'
  const isEditor = session?.user?.role === 'EDITOR' || isAdmin

  const isActive = (path: string) => {
    if (path === '/') return currentPathWithoutLocale === '/'
    return currentPathWithoutLocale.startsWith(path)
  }

  const toggleMenu = () => setMenuOpen(!menuOpen)

  useEffect(() => {
    if (isLoginPage) {
      document.body.classList.add('is-login-page')
    } else {
      document.body.classList.remove('is-login-page')
    }
    return () => document.body.classList.remove('is-login-page')
  }, [isLoginPage])

  const navLinkStyle = (path: string) => ({
    color: isActive(path) ? 'var(--feps-gold)' : 'rgba(255,255,255,0.85)',
    padding: '0.375rem 0.75rem',
    borderRadius: 'var(--radius)',
    fontWeight: 600,
    fontSize: '0.875rem',
    textDecoration: 'none',
    background: isActive(path) ? 'rgba(245,168,0,0.1)' : 'transparent',
    display: 'flex',
    alignItems: 'center',
    gap: '0.35rem',
    transition: 'all 0.15s',
  })

  return (
    <nav className="fixed top-0 left-0 right-0 h-16 bg-feps-navy border-b border-feps-navy-dark shadow-md z-50 flex items-center" role="navigation" aria-label="Main navigation">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-full relative">
        {/* Brand */}
        <Link data-tour="nav-brand" href={`/${locale}`} className="flex items-center gap-3 sm:gap-4 text-white hover:text-feps-gold transition-colors shrink-0" aria-label="FEPS Home" onClick={() => setMenuOpen(false)}>
          <Image src="/feps-logo.png" alt="FEPS Logo" width={32} height={32} priority className="object-contain brightness-0 invert w-7 h-7 sm:w-8 sm:h-8" />
          <div className="flex flex-col">
            <span className="font-serif font-semibold text-base sm:text-lg leading-tight tracking-tight">FEPS</span>
            <span className="font-mono text-[0.5rem] sm:text-[0.6rem] text-white/60 leading-tight tracking-widest uppercase hidden sm:block">Events System</span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden lg:flex flex-1 items-center justify-center gap-6 xl:gap-8 whitespace-nowrap px-4">
          {!isLoginPage && (
            <>
              <Link 
                href={`/${locale}`} 
                className={`flex items-center gap-2 font-mono text-xs uppercase tracking-widest font-semibold transition-colors ${isActive('/') ? 'text-feps-gold' : 'text-white/70 hover:text-white'}`}
              >
                <Home size={14} />
                {t('home')}
              </Link>
              <Link 
                href={`/${locale}/events`} 
                data-tour="nav-events"
                className={`flex items-center gap-2 font-mono text-xs uppercase tracking-widest font-semibold transition-colors ${isActive('/events') ? 'text-feps-gold' : 'text-white/70 hover:text-white'}`}
              >
                <CalendarDays size={14} />
                {f('events')}
              </Link>

              {isEditor && (
                <Link 
                  href={`/${locale}/admin/events`} 
                  className={`flex items-center gap-2 font-mono text-xs uppercase tracking-widest font-semibold transition-colors ${isActive('/admin') ? 'text-feps-gold' : 'text-white/70 hover:text-white'}`}
                >
                  <Settings size={14} />
                  {t('admin')}
                </Link>
              )}
            </>
          )}
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3 sm:gap-6 shrink-0">
          {/* Tour Trigger Button */}
          {!isLoginPage && (
            <button
              onClick={() => window.dispatchEvent(new Event('start-tour'))}
              className="hidden sm:flex bg-feps-gold text-feps-navy px-3 py-1 font-mono text-xs font-bold hover:bg-white hover:text-feps-navy transition-colors items-center justify-center uppercase"
            >
              {t('tour')}
            </button>
          )}
          {/* Language Switcher */}
          <div data-tour="nav-lang" className="relative" aria-live="polite">
            <select
              value={locale}
              onChange={e => {
                const next = e.target.value
                window.location.href = `/${next}${currentPathWithoutLocale}`
              }}
              aria-label="Select language"
              className="appearance-none bg-transparent border border-white/20 text-white font-mono text-xs px-2 sm:px-3 py-1.5 pr-6 sm:pr-8 rounded-sm cursor-pointer outline-none hover:border-feps-gold focus:border-feps-gold transition-colors"
            >
              <option value="en" className="text-feps-ink">EN</option>
              <option value="ar" className="text-feps-ink">عربي</option>
              <option value="fr" className="text-feps-ink">FR</option>
            </select>
            <span className="absolute right-1.5 sm:right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-feps-gold text-[10px] sm:text-xs">▾</span>
          </div>

          {/* Desktop Auth */}
          <div className="hidden lg:flex items-center gap-4">
            {session ? (
              <>
                <span className="font-mono text-xs text-white/70 truncate max-w-[150px]">
                  {session.user?.name}
                </span>
                <button 
                  onClick={() => signOut()} 
                  className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest font-semibold text-white hover:text-feps-gold transition-colors"
                >
                  <LogOut size={14} />
                  {t('signOut')}
                </button>
              </>
            ) : (
              !isLoginPage && (
                <Link 
                  href={`/${locale}/login`} 
                  className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest font-semibold text-white hover:text-feps-gold transition-colors"
                >
                  <LogIn size={14} />
                  {t('signIn')}
                </Link>
              )
            )}
          </div>

          {!isLoginPage && (
            <button 
              className="lg:hidden text-white hover:text-feps-gold p-2 -mr-2" 
              onClick={toggleMenu}
              aria-label="Toggle menu"
            >
              {menuOpen ? '✕' : '☰'}
            </button>
          )}
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {menuOpen && (
        <div className="lg:hidden fixed top-16 left-0 right-0 bottom-0 bg-feps-navy border-t border-feps-navy-dark p-6 flex flex-col gap-6 z-40 overflow-y-auto">
          <Link href={`/${locale}`} className="font-serif text-2xl text-white pb-4 border-b border-white/10 flex items-center gap-3 hover:text-feps-gold" onClick={toggleMenu}>
            <Home size={20} className="text-white/50" />
            {t('home')}
          </Link>
          <Link href={`/${locale}/events`} className="font-serif text-2xl text-white pb-4 border-b border-white/10 flex items-center gap-3 hover:text-feps-gold" onClick={toggleMenu}>
            <CalendarDays size={20} className="text-white/50" />
            {f('events')}
          </Link>
          {isEditor && (
            <Link href={`/${locale}/admin/events`} className="font-serif text-2xl text-white pb-4 border-b border-white/10 flex items-center gap-3 hover:text-feps-gold" onClick={toggleMenu}>
              <Settings size={20} className="text-white/50" />
              {t('admin')}
            </Link>
          )}
          
          <div className="mt-auto flex flex-col gap-4 pt-8">
            {session ? (
              <>
                <span className="font-mono text-xs text-white/70">
                  {session.user?.name}
                </span>
                <button onClick={() => signOut()} className="w-full py-3 flex items-center justify-center gap-2 bg-feps-gold text-feps-navy font-mono text-xs uppercase tracking-widest font-bold">
                  <LogOut size={16} />
                  {t('signOut')}
                </button>
              </>
            ) : (
              <Link href={`/${locale}/login`} className="w-full py-3 flex items-center justify-center gap-2 border border-feps-gold text-feps-gold text-center font-mono text-xs uppercase tracking-widest font-semibold hover:bg-feps-gold hover:text-feps-navy transition-colors" onClick={toggleMenu}>
                <LogIn size={16} />
                {t('signIn')}
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
