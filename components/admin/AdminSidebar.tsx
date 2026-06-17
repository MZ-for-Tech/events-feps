'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Calendar, FileText, Users, Settings, Menu, X, ChevronRight, ChevronLeft } from 'lucide-react'
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
    setIsMobileOpen(false)
  }, [pathname])

  const canManageUsers = role === 'SUPERADMIN' || role === 'MANAGER'

  const navItems = [
    {
      label: t('eventsManagement'),
      href: '/admin/events',
      icon: <Calendar size={20} />,
      active: pathname.includes('/admin/events')
    },
    {
      label: t('reports'),
      href: '/admin/reports',
      icon: <FileText size={20} />,
      active: pathname.includes('/admin/reports')
    },
    ...(canManageUsers ? [
      {
        label: t('userManagement'),
        href: '/admin/users',
        icon: <Users size={20} />,
        active: pathname.includes('/admin/users')
      }
    ] : [])
  ]

  // Desktop Sidebar
  const DesktopSidebar = () => (
    <div className={`hidden lg:flex flex-col bg-feps-navy border-e border-feps-navy-dark px-4 py-6 shrink-0 transition-all duration-300 sticky top-16 h-[calc(100vh-4rem)] z-20 ${isCollapsed ? 'w-[80px]' : 'w-[280px]'}`}>
      
      {/* Collapse Toggle */}
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className={`absolute top-6 bg-feps-gold text-feps-navy rounded-full p-1 shadow-md hover:scale-110 transition-transform z-10 ${isAr ? '-left-3' : '-right-3'}`}
      >
        {isCollapsed 
          ? (isAr ? <ChevronLeft size={14} /> : <ChevronRight size={14} />) 
          : (isAr ? <ChevronRight size={14} /> : <ChevronLeft size={14} />)}
      </button>

      <div className={`flex items-center mb-8 ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
        {!isCollapsed && (
          <h3 className="font-mono text-xs uppercase tracking-widest text-white/60">
            {t('controlPanel')}
          </h3>
        )}
        {isCollapsed && (
          <div className="w-8 h-8 rounded bg-white/10 flex items-center justify-center text-white/60">
            <Settings size={16} />
          </div>
        )}
      </div>

      <nav className="flex flex-col gap-2">
        {navItems.map(item => (
          <Link
            key={item.href}
            href={item.href}
            title={isCollapsed ? item.label : undefined}
            className={`
              flex items-center px-3 py-3 transition-all rounded-md group
              ${item.active 
                ? 'bg-white/10 text-feps-gold font-bold shadow-inner' 
                : 'bg-transparent text-white/70 font-medium hover:bg-white/5 hover:text-white'}
              ${isCollapsed ? 'justify-center' : 'gap-3'}
            `}
          >
            <div className={`${item.active ? 'text-feps-gold' : 'text-white/50 group-hover:text-white/70'}`}>
              {item.icon}
            </div>
            {!isCollapsed && <span className="text-sm truncate">{item.label}</span>}
          </Link>
        ))}
      </nav>

      <div className={`mt-auto p-4 border border-feps-navy-dark bg-feps-navy-dark/50 rounded-sm transition-all ${isCollapsed ? 'text-center px-2' : ''}`}>
        {!isCollapsed ? (
          <>
            <div className="font-mono text-[10px] uppercase tracking-wider text-white/60 mb-1">{t('loggedInAs')}</div>
            <div className="font-bold text-white text-sm truncate">{session?.user?.name}</div>
            <div className="font-mono text-xs font-bold text-feps-gold mt-2 uppercase truncate">
              {role}
            </div>
          </>
        ) : (
          <div className="w-full flex justify-center text-feps-gold" title={session?.user?.name || ''}>
            <div className="w-8 h-8 rounded-full bg-feps-navy flex items-center justify-center font-bold text-sm border border-feps-gold/30">
              {session?.user?.name?.charAt(0).toUpperCase()}
            </div>
          </div>
        )}
      </div>
    </div>
  )

  // Mobile Top Bar
  const MobileHeader = () => (
    <div className="lg:hidden flex items-center justify-between bg-feps-navy px-4 py-3 border-b border-feps-navy-dark w-full shrink-0">
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
  const MobileDrawer = () => {
    // Determine translation class based on language
    const slideClass = isMobileOpen 
      ? 'translate-x-0' 
      : (isAr ? 'translate-x-full' : '-translate-x-full')

    return (
      <>
        <div 
          className={`fixed inset-0 bg-black/60 z-[100] transition-opacity duration-300 lg:hidden ${isMobileOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
          onClick={() => setIsMobileOpen(false)}
        />
        <div 
          className={`fixed top-0 bottom-0 ${isAr ? 'right-0' : 'left-0'} w-[280px] bg-feps-navy z-[101] flex flex-col p-6 shadow-2xl transition-transform duration-300 lg:hidden ${slideClass}`}
        >
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-mono text-xs uppercase tracking-widest text-white/60">
              {t('controlPanel')}
            </h3>
            <button 
              onClick={() => setIsMobileOpen(false)}
              className="text-white/60 hover:text-white"
            >
              <X size={24} />
            </button>
          </div>

          <nav className="flex flex-col gap-2">
            {navItems.map(item => (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex items-center gap-3 px-4 py-3 transition-all rounded-md
                  ${item.active 
                    ? 'bg-white/10 text-feps-gold font-bold' 
                    : 'text-white/70 font-medium hover:bg-white/5 hover:text-white'}
                `}
              >
                <div className={item.active ? 'text-feps-gold' : 'text-white/50'}>
                  {item.icon}
                </div>
                <span className="text-sm">{item.label}</span>
              </Link>
            ))}
          </nav>

          <div className="mt-auto p-4 border border-feps-navy-dark bg-feps-navy-dark/50 rounded-sm">
            <div className="font-mono text-[10px] uppercase tracking-wider text-white/60 mb-1">{t('loggedInAs')}</div>
            <div className="font-bold text-white text-sm">{session?.user?.name}</div>
            <div className="font-mono text-xs font-bold text-feps-gold mt-2 uppercase">
              {role}
            </div>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <MobileHeader />
      <MobileDrawer />
      <DesktopSidebar />
    </>
  )
}
