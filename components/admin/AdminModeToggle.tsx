'use client'

import React from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { Shield, Edit3 } from 'lucide-react'

interface Props {
  isAdmin: boolean
  isAr: boolean
  label: string
}

export default function AdminModeToggle({ isAdmin, isAr, label }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const isEditMode = searchParams.get('edit') === 'true'

  if (!isAdmin) return null

  const toggleEditMode = () => {
    const newParams = new URLSearchParams(searchParams.toString())
    if (isEditMode) {
      newParams.delete('edit')
    } else {
      newParams.set('edit', 'true')
    }
    
    // Create new URL
    const query = newParams.toString()
    const newUrl = query ? `${pathname}?${query}` : pathname
    
    router.push(newUrl, { scroll: false })
  }

  return (
    <button 
      onClick={toggleEditMode}
      className={`flex items-center gap-2 px-4 py-2 shadow-lg transition-colors duration-300 cursor-pointer ${
        isEditMode 
          ? 'bg-feps-gold text-feps-navy font-bold' 
          : 'bg-feps-navy text-white hover:bg-feps-navy/90'
      }`}
      title={isAr ? 'تفعيل وضع التعديل' : 'Toggle Edit Mode'}
    >
      {isEditMode ? <Edit3 size={16} /> : <Shield size={14} />}
      <span className="font-sans text-xs font-medium tracking-wide uppercase hidden sm:inline">
        {isEditMode ? (isAr ? 'وضع التعديل مفعل' : 'Edit Mode Active') : label}
      </span>
    </button>
  )
}
