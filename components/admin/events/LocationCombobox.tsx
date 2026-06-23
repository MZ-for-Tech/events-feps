'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useTranslations } from 'next-intl'

const HALL_OPTIONS = [
  'مدرج أ.د. زكي شافعي',
  'مدرج قنديل',
  'مدرج العريان (أ)',
  'مدرج العريان (ب)',
  'مدرج خيري عيسى',
  'قاعة أ.د. عبد الملك عودة',
  'قاعات التدريس المرفقة (قاعة 5)',
  'قاعة ساويرس',
  'قاعة احمد الغندور',
]

interface LocationComboboxProps {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  isAr: boolean
}

export function LocationCombobox({ value, onChange, placeholder, isAr }: LocationComboboxProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)
  const t = useTranslations('AdminEvents')

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const getFilteredOptions = () => {
    let regex: RegExp
    try {
      regex = new RegExp(search, 'i')
      return HALL_OPTIONS.filter(opt => regex.test(opt))
    } catch {
      return HALL_OPTIONS.filter(opt => opt.toLowerCase().includes(search.toLowerCase()))
    }
  }

  const filteredOptions = getFilteredOptions()

  return (
    <div className="relative" ref={containerRef}>
      <input
        type="text"
        value={isOpen ? search : value}
        onChange={e => {
          setSearch(e.target.value)
          onChange(e.target.value)
          setIsOpen(true)
        }}
        onFocus={() => {
          setSearch(value)
          setIsOpen(true)
        }}
        placeholder={placeholder}
        className={`w-full px-3 py-2 border border-feps-ink/20 rounded bg-feps-paper text-feps-ink text-sm focus:outline-none focus:ring-1 focus:ring-feps-ink ${isAr ? 'text-right' : 'text-left'}`}
      />
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-feps-paper border border-feps-ink/20 rounded shadow-lg max-h-60 overflow-y-auto" dir={isAr ? "rtl" : "ltr"}>
          {filteredOptions.length === 0 ? (
            <div className={`px-3 py-2 text-sm text-feps-ink/50 ${isAr ? 'text-right' : 'text-left'}`}>{t('noHalls')}</div>
          ) : (
            <div className="py-1">
              {filteredOptions.map(opt => (
                <button
                  key={opt}
                  type="button"
                  className={`w-full text-start px-3 py-2 text-sm hover:bg-feps-ink/5 focus:bg-feps-ink/5 outline-none transition-colors ${isAr ? 'text-right' : 'text-left'}`}
                  onClick={() => {
                    onChange(opt)
                    setIsOpen(false)
                  }}
                >
                  {opt}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
