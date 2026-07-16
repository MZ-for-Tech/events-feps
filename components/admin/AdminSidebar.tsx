'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Calendar, FileText, Users, Settings, Menu, X, ChevronRight, ChevronLeft, Activity, Brain } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useTranslations, useLocale } from 'next-intl'

export default function AdminSidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const role = session?.user?.role
  const t = useTranslations('AdminSidebar')
  const tRoles = useTranslations('AdminUsers.roles')
  const locale = useLocale()
  const isAr = locale === 'ar'

  const [isCollapsed, setIsCollapsed] = useState(false)

  // Refs for direct DOM control — bypasses React re-render & Tailwind CSS generation
  const drawerRef = useRef<HTMLDivElement>(null)
  const backdropRef = useRef<HTMLDivElement>(null)
  const isOpenRef = useRef(false)

  const openDrawer = useCallback(() => {
    isOpenRef.current = true
    const drawer = drawerRef.current
    const backdrop = backdropRef.current
    if (drawer) drawer.style.transform = 'translateX(0)'
    if (backdrop) {
      backdrop.style.opacity = '1'
      backdrop.style.visibility = 'visible'
      backdrop.style.pointerEvents = 'auto'
    }
    document.body.style.overflow = 'hidden'
  }, [])

  const closeDrawer = useCallback(() => {
    isOpenRef.current = false
    const drawer = drawerRef.current
    const backdrop = backdropRef.current
    if (drawer) drawer.style.transform = isAr ? 'translateX(100%)' : 'translateX(-100%)'
    if (backdrop) {
      backdrop.style.opacity = '0'
      backdrop.style.visibility = 'hidden'
      backdrop.style.pointerEvents = 'none'
    }
    document.body.style.overflow = ''
  }, [isAr])

  // Close drawer on route change
  useEffect(() => {
    closeDrawer()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  // Cleanup on unmount
  useEffect(() => {
    return () => { document.body.style.overflow = '' }
  }, [])

  // Track page views
  useEffect(() => {
    if (!session?.user) return
    fetch('/api/logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'PAGE_VIEW', details: pathname })
    }).catch(() => {})
  }, [pathname, session?.user])

  const permissions = (session?.user as { permissions?: string[] })?.permissions || []
  const canManageUsers = role === 'SUPERADMIN' || permissions.includes('users:manage')
  const canManageReports = role === 'SUPERADMIN' || role === 'MANAGER' || permissions.includes('events:reports')

  const navItems = [
    {
      label: t('eventsManagement'),
      href: `/${locale}/admin/events`,
      icon: <Calendar size={20} />,
      active: pathname.includes('/admin/events')
    },
    ...(canManageReports ? [{
      label: t('reports'),
      href: `/${locale}/admin/reports`,
      icon: <FileText size={20} />,
      active: pathname.includes('/admin/reports')
    }] : []),
    ...(canManageUsers ? [
      {
        label: t('userManagement'),
        href: `/${locale}/admin/users`,
        icon: <Users size={20} />,
        active: pathname.includes('/admin/users')
      }
    ] : []),
    ...(permissions.includes('categories:manage') || role === 'SUPERADMIN' ? [
      {
        label: t('categories'),
        href: `/${locale}/admin/categories`,
        icon: <Settings size={20} />,
        active: pathname.includes('/admin/categories')
      }
    ] : []),
    ...(permissions.includes('trivia:manage') || role === 'SUPERADMIN' ? [
      {
        label: t('trivia'),
        href: `/${locale}/admin/trivia`,
        icon: <Brain size={20} />,
        active: pathname.includes('/admin/trivia')
      }
    ] : []),
    ...(permissions.includes('logs:view') || role === 'SUPERADMIN' ? [
      {
        label: t('logs'),
        href: `/${locale}/admin/logs`,
        icon: <Activity size={20} />,
        active: pathname.includes('/admin/logs')
      }
    ] : [])
  ]

  return (
    <>
      {/* ── MOBILE: Fixed top bar ─────────────────────────────── */}
      {/* Spacer keeps content from going under the fixed bar */}
      <div className="lg:hidden h-[49px] shrink-0" aria-hidden="true" />

      {/* Fixed bar — z-40, always above page content */}
      <div className="lg:hidden fixed top-16 left-0 right-0 z-40 flex items-center justify-between px-4 py-3 bg-feps-navy-dark border-b border-feps-navy shadow-md">
        <div className={`text-white ${isAr ? 'font-arabic font-bold text-base' : 'font-serif font-bold'}`}>
          {t('controlPanel')}
        </div>
        <button
          type="button"
          onClick={openDrawer}
          aria-label="Open navigation menu"
          className="flex items-center justify-center text-white/70 hover:text-feps-gold transition-colors p-3 -mr-3"
          style={{ touchAction: 'manipulation', minWidth: 44, minHeight: 44 }}
        >
          <Menu size={22} />
        </button>
      </div>

      {/* ── MOBILE: Backdrop ─────────────────────────────────── */}
      {/* Controlled entirely via ref — initial state: hidden */}
      <div
        ref={backdropRef}
        onClick={closeDrawer}
        aria-hidden="true"
        className="lg:hidden fixed inset-0"
        style={{
          background: 'rgba(0,0,0,0.6)',
          zIndex: 200,
          opacity: 0,
          visibility: 'hidden',
          pointerEvents: 'none',
          transition: 'opacity 0.3s ease',
        }}
      />

      {/* ── MOBILE: Drawer panel ─────────────────────────────── */}
      {/* Controlled entirely via ref — initial state: off-screen */}
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label={t('controlPanel')}
        className={`lg:hidden fixed top-16 bottom-0 bg-feps-navy-dark flex flex-col shadow-2xl ${isAr ? 'right-0' : 'left-0'}`}
        style={{
          width: 300,
          maxWidth: '85vw',
          zIndex: 201,
          transform: isAr ? 'translateX(100%)' : 'translateX(-100%)',
          transition: 'transform 0.3s ease-in-out',
        }}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-feps-gold/10 border border-feps-gold/30 flex items-center justify-center">
              <Settings size={16} className="text-feps-gold" />
            </div>
            <div>
              <h3 className={`text-sm text-white leading-tight ${isAr ? 'font-arabic font-bold' : 'font-serif font-bold'}`}>
                {t('controlPanel')}
              </h3>
              <div className="w-6 h-0.5 bg-feps-gold mt-1" />
            </div>
          </div>
          <button
            type="button"
            onClick={closeDrawer}
            aria-label="Close menu"
            className="w-9 h-9 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-colors"
            style={{ touchAction: 'manipulation' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 overflow-y-auto py-2">
          {navItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              onClick={closeDrawer}
              className={`
                flex items-center gap-4 px-5 py-4 transition-colors
                ${item.active
                  ? `bg-feps-gold/10 text-feps-gold ${isAr ? 'border-r-[3px] border-r-feps-gold' : 'border-l-[3px] border-l-feps-gold'}`
                  : `text-white/70 hover:bg-white/5 hover:text-white ${isAr ? 'border-r-[3px] border-r-transparent' : 'border-l-[3px] border-l-transparent'}`}
              `}
            >
              <div className={`shrink-0 ${item.active ? 'text-feps-gold' : 'text-white/40'}`}>
                {item.icon}
              </div>
              <span className={`text-sm ${item.active ? 'font-bold' : 'font-medium'} ${isAr ? 'font-arabic' : ''}`}>
                {item.label}
              </span>
              {item.active && <div className="ms-auto w-1.5 h-1.5 rounded-full bg-feps-gold shrink-0" />}
            </Link>
          ))}
        </nav>

        {/* User Info Footer */}
        <div className="shrink-0 mx-4 mb-4 p-4 border border-white/10 bg-white/5">
          <div className="font-sans text-[0.6rem] uppercase tracking-widest text-white/40 mb-2">{t('loggedInAs')}</div>
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 bg-feps-gold flex items-center justify-center text-feps-navy font-bold text-sm shrink-0"
              suppressHydrationWarning
            >
              {session?.user?.name?.charAt(0)?.toUpperCase() ?? ''}
            </div>
            <div className="min-w-0">
              <div className={`text-sm text-white truncate leading-tight ${isAr ? 'font-arabic font-bold' : 'font-serif font-bold'}`} suppressHydrationWarning>
                {session?.user?.name ?? ''}
              </div>
              <div className="font-sans text-[0.65rem] tracking-widest font-bold text-feps-gold mt-0.5 uppercase truncate" suppressHydrationWarning>
                {role ? (tRoles.has(role) ? tRoles(role as Parameters<typeof tRoles>[0]) : role) : ''}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── DESKTOP: Sidebar ─────────────────────────────────── */}
      <aside className={`hidden lg:block bg-feps-navy-dark border-e border-feps-navy shrink-0 transition-all duration-300 z-20 ${isCollapsed ? 'w-[80px]' : 'w-[280px]'}`}>
        <div data-tour="admin-sidebar" className="flex flex-col py-6 sticky top-16 h-[calc(100vh-4rem)] w-full">

          {/* Collapse Toggle */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={`absolute top-8 bg-feps-gold text-feps-navy p-1.5 shadow-md hover:scale-105 transition-transform z-10 border border-feps-navy ${isAr ? '-left-3.5' : '-right-3.5'}`}
          >
            {isCollapsed
              ? (isAr ? <ChevronLeft size={16} strokeWidth={3} /> : <ChevronRight size={16} strokeWidth={3} />)
              : (isAr ? <ChevronRight size={16} strokeWidth={3} /> : <ChevronLeft size={16} strokeWidth={3} />)}
          </button>

          <div className={`flex items-center mb-8 px-6 ${isCollapsed ? 'justify-center px-0' : 'justify-between'}`}>
            {!isCollapsed && (
              <div className="flex flex-col">
                <h3 className={`text-xl text-white mb-2 ${isAr ? 'font-arabic font-bold' : 'font-serif'}`}>
                  {t('controlPanel')}
                </h3>
                <div className="w-10 h-1 bg-feps-gold" />
              </div>
            )}
            {isCollapsed && (
              <div className="w-10 h-10 border border-white/20 bg-white/5 flex items-center justify-center text-white/80">
                <Settings size={20} />
              </div>
            )}
          </div>

          <nav className="flex flex-col border-t border-white/10">
            {navItems.map(item => (
              <Link
                key={item.href}
                href={item.href}
                title={isCollapsed ? item.label : undefined}
                className={`
                  flex items-center px-6 py-4 transition-all group border-b border-white/10
                  ${item.active
                    ? `bg-white/5 text-feps-gold ${isAr ? 'border-r-4 border-r-feps-gold' : 'border-l-4 border-l-feps-gold'}`
                    : `bg-transparent text-white/70 hover:bg-white/5 hover:text-white ${isAr ? 'border-r-4 border-r-transparent' : 'border-l-4 border-l-transparent'}`}
                  ${isCollapsed ? 'justify-center px-0' : 'gap-4'}
                `}
              >
                <div className={`${item.active ? 'text-feps-gold' : 'text-white/50 group-hover:text-white'}`}>
                  {item.icon}
                </div>
                {!isCollapsed && (
                  <span className={`text-sm tracking-wide ${item.active ? 'font-bold' : 'font-medium'} ${isAr ? 'font-arabic' : ''}`}>
                    {item.label}
                  </span>
                )}
              </Link>
            ))}
          </nav>

          <div className={`mt-auto mx-4 p-5 border border-white/10 bg-white/5 transition-all ${isCollapsed ? 'text-center px-2 py-4' : ''}`}>
            {!isCollapsed ? (
              <>
                <div className="font-sans text-[0.65rem] uppercase tracking-widest text-white/50 mb-3 pb-2 border-b border-white/10">{t('loggedInAs')}</div>
                <div className={`text-lg text-white truncate leading-tight ${isAr ? 'font-arabic font-bold' : 'font-serif'}`} suppressHydrationWarning>{session?.user?.name}</div>
                <div className="font-sans text-[0.70rem] tracking-widest font-bold text-feps-gold mt-2 uppercase truncate" suppressHydrationWarning>
                  {role ? (tRoles.has(role) ? tRoles(role as Parameters<typeof tRoles>[0]) : role) : ''}
                </div>
              </>
            ) : (
              <div className="w-full flex justify-center text-feps-navy" title={session?.user?.name || ''}>
                <div className="w-10 h-10 bg-feps-gold flex items-center justify-center font-bold text-lg border border-white/20" suppressHydrationWarning>
                  {session?.user?.name?.charAt(0)?.toUpperCase()}
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  )
}
