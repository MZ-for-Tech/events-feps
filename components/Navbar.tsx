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

  return (
    <nav className="fixed top-0 left-0 right-0 h-16 bg-feps-navy-dark border-b-2 border-feps-navy z-50 flex items-center" role="navigation" aria-label="Main navigation">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-full relative">
        {/* Brand */}
        <Link data-tour="nav-brand" href={`/${locale}`} className="flex items-center gap-3 sm:gap-4 text-white hover:text-feps-gold transition-colors shrink-0" aria-label="FEPS Home" onClick={() => setMenuOpen(false)}>
          <Image src="/feps-logo.png" alt="FEPS Logo" width={32} height={32} priority className="object-contain brightness-0 invert w-7 h-7 sm:w-8 sm:h-8 opacity-90" />
          <div className="flex flex-col">
            <span className="font-serif font-bold text-base sm:text-lg leading-tight tracking-tight uppercase">FEPS Events</span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden lg:flex flex-1 items-center justify-center gap-4 xl:gap-6 whitespace-nowrap px-4">
          {!isLoginPage && (
            <>
              <Link 
                href={`/${locale}`} 
                className={`flex items-center gap-2 font-sans text-xs uppercase tracking-widest font-bold transition-all px-3 py-1.5 border-2 ${isActive('/') ? 'bg-feps-gold text-feps-navy-dark border-feps-gold' : 'text-white border-transparent hover:border-feps-gold hover:text-feps-gold'}`}
              >
                <Home size={14} />
                {t('home')}
              </Link>
              <Link 
                href={`/${locale}/events`} 
                data-tour="nav-events"
                className={`flex items-center gap-2 font-sans text-xs uppercase tracking-widest font-bold transition-all px-3 py-1.5 border-2 ${isActive('/events') ? 'bg-feps-gold text-feps-navy-dark border-feps-gold' : 'text-white border-transparent hover:border-feps-gold hover:text-feps-gold'}`}
              >
                <CalendarDays size={14} />
                {f('events')}
              </Link>

              {isEditor && (
                <Link 
                  href={`/${locale}/admin/events`} 
                  className={`flex items-center gap-2 font-sans text-xs uppercase tracking-widest font-bold transition-all px-3 py-1.5 border-2 ${isActive('/admin') ? 'bg-feps-gold text-feps-navy-dark border-feps-gold' : 'text-white border-transparent hover:border-feps-gold hover:text-feps-gold'}`}
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
              className="hidden sm:flex border-2 border-feps-gold text-feps-gold px-3 py-1.5 font-sans text-xs font-bold hover:bg-feps-gold hover:!text-feps-navy-dark transition-colors items-center justify-center uppercase tracking-widest"
            >
              {t('tour')}
            </button>
          )}
          
          {/* Language Switcher */}
          <div data-tour="nav-lang" className="relative group border-2 border-feps-gold hover:bg-feps-gold transition-colors" aria-live="polite">
            <select
              value={locale}
              onChange={e => {
                const next = e.target.value
                window.location.href = `/${next}${currentPathWithoutLocale}`
              }}
              aria-label="Select language"
              className="appearance-none bg-transparent text-feps-gold group-hover:!text-feps-navy-dark font-sans text-xs font-bold uppercase tracking-widest px-2 sm:px-3 py-1.5 pr-6 sm:pr-8 cursor-pointer outline-none w-full h-full transition-colors"
            >
              <option value="en" className="text-feps-ink bg-feps-paper">EN</option>
              <option value="ar" className="text-feps-ink bg-feps-paper">عربي</option>
              <option value="fr" className="text-feps-ink bg-feps-paper">FR</option>
            </select>
            <span className="absolute right-1.5 sm:right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-feps-gold group-hover:!text-feps-navy-dark text-[10px] sm:text-xs font-bold transition-colors">▾</span>
          </div>

          {/* Desktop Auth */}
          <div className="hidden lg:flex items-center gap-4 border-s-2 border-feps-navy ps-6">
            {session ? (
              <>
                <span className="font-sans text-xs font-bold text-white/70 truncate max-w-[150px]">
                  {session.user?.name}
                </span>
                <button 
                  onClick={() => signOut()} 
                  className="flex items-center gap-2 font-sans text-xs uppercase tracking-widest font-bold text-white hover:text-feps-error transition-colors border-b-2 border-transparent hover:border-feps-error"
                >
                  <LogOut size={14} />
                  {t('signOut')}
                </button>
              </>
            ) : (
              !isLoginPage && (
                <Link 
                  href={`/${locale}/login`} 
                  className="flex items-center gap-2 font-sans text-xs uppercase tracking-widest font-bold text-white border-b-2 border-transparent hover:border-feps-gold hover:text-feps-gold transition-colors"
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
        <div className="lg:hidden fixed top-16 left-0 right-0 bottom-0 bg-feps-navy-dark border-t-2 border-feps-navy p-6 flex flex-col gap-6 z-40 overflow-y-auto">
          <Link href={`/${locale}`} className="font-serif font-bold text-2xl text-white pb-4 border-b-2 border-white/10 flex items-center gap-3 hover:text-feps-gold transition-colors" onClick={toggleMenu}>
            <Home size={20} className="text-white/50" />
            {t('home')}
          </Link>
          <Link href={`/${locale}/events`} className="font-serif font-bold text-2xl text-white pb-4 border-b-2 border-white/10 flex items-center gap-3 hover:text-feps-gold transition-colors" onClick={toggleMenu}>
            <CalendarDays size={20} className="text-white/50" />
            {f('events')}
          </Link>
          {isEditor && (
            <Link href={`/${locale}/admin/events`} className="font-serif font-bold text-2xl text-white pb-4 border-b-2 border-white/10 flex items-center gap-3 hover:text-feps-gold transition-colors" onClick={toggleMenu}>
              <Settings size={20} className="text-white/50" />
              {t('admin')}
            </Link>
          )}
          
          <div className="mt-auto flex flex-col gap-4 pt-8 border-t-2 border-white/10">
            {session ? (
              <>
                <span className="font-sans text-sm font-bold text-white/70 text-center">
                  {session.user?.name}
                </span>
                <button onClick={() => signOut()} className="w-full py-3 flex items-center justify-center gap-2 border-2 border-feps-error text-feps-error font-sans text-xs uppercase tracking-widest font-bold hover:bg-feps-error hover:text-white transition-colors">
                  <LogOut size={16} />
                  {t('signOut')}
                </button>
              </>
            ) : (
              <Link href={`/${locale}/login`} className="w-full py-3 flex items-center justify-center gap-2 border-2 border-feps-gold text-feps-gold text-center font-sans text-xs uppercase tracking-widest font-bold hover:bg-feps-gold hover:text-feps-navy-dark transition-colors" onClick={toggleMenu}>
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
