'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Calendar, FileText, Users, Settings, Menu, X, ChevronRight, ChevronLeft, Activity } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useTranslations, useLocale } from 'next-intl'

export default function AdminSidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const role = session?.user?.role
  const t = useTranslations('AdminSidebar')
  const locale = useLocale()
  const isAr = locale === 'ar'

  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  // Prevent scrolling when mobile menu is open
  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isMobileOpen])

  // Close mobile menu on route change
  useEffect(() => {
    if (isMobileOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsMobileOpen(false)
    }
  }, [pathname, isMobileOpen])

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
    ...(permissions.includes('logs:view') || role === 'SUPERADMIN' ? [
      {
        label: t('logs'),
        href: `/${locale}/admin/logs`,
        icon: <Activity size={20} />,
        active: pathname.includes('/admin/logs')
      }
    ] : [])
  ]

  // Desktop Sidebar
  const desktopSidebar = (
    <aside className={`hidden lg:block bg-feps-navy-dark border-e border-feps-navy shrink-0 transition-all duration-300 z-20 ${isCollapsed ? 'w-[80px]' : 'w-[280px]'}`}>
      <div data-tour="admin-sidebar" className={`flex flex-col py-6 sticky top-16 h-[calc(100vh-4rem)] w-full`}>
      
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
            <div className="w-10 h-1 bg-feps-gold"></div>
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
            <div className="font-mono text-[0.65rem] uppercase tracking-widest text-white/50 mb-3 pb-2 border-b border-white/10">{t('loggedInAs')}</div>
            <div className={`text-lg text-white truncate leading-tight ${isAr ? 'font-arabic font-bold' : 'font-serif'}`}>{session?.user?.name}</div>
            <div className="font-mono text-[0.70rem] tracking-widest font-bold text-feps-gold mt-2 uppercase truncate">
              {role}
            </div>
          </>
        ) : (
          <div className="w-full flex justify-center text-feps-navy" title={session?.user?.name || ''}>
            <div className="w-10 h-10 bg-feps-gold flex items-center justify-center font-bold text-lg border border-white/20">
              {session?.user?.name?.charAt(0).toUpperCase()}
            </div>
          </div>
        )}
      </div>
    </div>
    </aside>
  )

  // Mobile Top Bar
  const mobileTopBar = (
    <div className="lg:hidden flex items-center justify-between px-4 py-3 bg-feps-navy-dark border-b border-feps-navy z-30 relative shrink-0">
      <div className="font-bold text-white font-serif">{t('controlPanel')}</div>
      <button 
        onClick={() => setIsMobileOpen(true)}
        className="text-white hover:text-feps-gold transition-colors"
      >
        <Menu size={24} />
      </button>
    </div>
  )

  // Mobile Drawer Overlay
  // Determine translation class based on language
  const slideClass = isMobileOpen 
    ? 'translate-x-0' 
    : (isAr ? 'translate-x-full' : '-translate-x-full')

  const mobileDrawer = (
    <>
      <div 
        className={`fixed inset-0 bg-black/60 z-[100] transition-opacity duration-300 lg:hidden ${isMobileOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
        onClick={() => setIsMobileOpen(false)}
      />
      <div 
        className={`fixed top-0 bottom-0 ${isAr ? 'right-0' : 'left-0'} w-[280px] bg-feps-navy-dark z-[101] flex flex-col py-6 shadow-2xl transition-transform duration-300 lg:hidden ${slideClass}`}
      >
        <div className="flex items-center justify-between mb-8 px-6">
          <div className="flex flex-col">
            <h3 className={`text-xl text-white mb-2 ${isAr ? 'font-arabic font-bold' : 'font-serif'}`}>
              {t('controlPanel')}
            </h3>
            <div className="w-10 h-1 bg-feps-gold"></div>
          </div>
          <button 
            onClick={() => setIsMobileOpen(false)}
            className="text-white/60 hover:text-white"
          >
            <X size={24} />
          </button>
        </div>

        <nav className="flex flex-col border-t border-white/10">
          {navItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex items-center gap-4 px-6 py-4 transition-all group border-b border-white/10
                ${item.active 
                  ? `bg-white/5 text-feps-gold ${isAr ? 'border-r-4 border-r-feps-gold' : 'border-l-4 border-l-feps-gold'}` 
                  : `bg-transparent text-white/70 hover:bg-white/5 hover:text-white ${isAr ? 'border-r-4 border-r-transparent' : 'border-l-4 border-l-transparent'}`}
              `}
              onClick={() => setIsMobileOpen(false)}
            >
              <div className={item.active ? 'text-feps-gold' : 'text-white/50 group-hover:text-white'}>
                {item.icon}
              </div>
              <span className={`text-sm tracking-wide ${item.active ? 'font-bold' : 'font-medium'} ${isAr ? 'font-arabic' : ''}`}>
                {item.label}
              </span>
            </Link>
          ))}
        </nav>

        <div className="mt-auto mx-4 p-5 border border-white/10 bg-white/5 transition-all">
          <div className="font-mono text-[0.65rem] uppercase tracking-widest text-white/50 mb-3 pb-2 border-b border-white/10">{t('loggedInAs')}</div>
          <div className={`text-lg text-white truncate leading-tight ${isAr ? 'font-arabic font-bold' : 'font-serif'}`}>{session?.user?.name}</div>
          <div className="font-mono text-[0.70rem] tracking-widest font-bold text-feps-gold mt-2 uppercase truncate">
            {role}
          </div>
        </div>
      </div>
    </>
  )

  return (
    <>
      {mobileTopBar}
      {mobileDrawer}
      {desktopSidebar}
    </>
  )
}
