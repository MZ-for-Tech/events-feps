"use client"

import React, { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Check, X, Edit2 } from 'lucide-react'
import toast from 'react-hot-toast'

interface InlineEditProps {
  value: string
  field: string
  eventId: string
  isAdmin: boolean
  type?: 'text' | 'textarea' | 'datetime-local' | 'select'
  options?: { label: string; value: string }[]
  children: React.ReactNode
  className?: string
}

export default function InlineEdit({
  value,
  field,
  eventId,
  isAdmin,
  type = 'text',
  options,
  children,
  className = ''
}: InlineEditProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [currentValue, setCurrentValue] = useState(value)
  const [isSaving, setIsSaving] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const isEditMode = searchParams.get('edit') === 'true'

  if (!isAdmin || !isEditMode) {
    return <>{children}</>
  }

  const handleSave = async () => {
    if (currentValue === value) {
      setIsEditing(false)
      return
    }

    setIsSaving(true)
    try {
      let payloadValue: string | null = currentValue
      if (type === 'datetime-local' && currentValue) {
        payloadValue = new Date(currentValue).toISOString()
      }

      const res = await fetch(`/api/events/${eventId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: payloadValue })
      })

      if (!res.ok) throw new Error('Failed to update')
      
      toast.success('Updated successfully')
      setIsEditing(false)
      router.refresh()
    } catch (error) {
      toast.error('Failed to update field')
      console.error(error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setCurrentValue(value)
    setIsEditing(false)
  }

  if (isEditing) {
    return (
      <div className={`relative flex items-start gap-2 w-full ${className}`} onClick={(e) => e.stopPropagation()}>
        <div className="flex-grow w-full">
          {type === 'textarea' ? (
            <textarea
              className="w-full bg-feps-surface-alt/50 border-2 border-feps-gold outline-none p-2 min-h-[150px] font-inherit text-inherit resize-y shadow-sm"
              value={currentValue}
              onChange={(e) => setCurrentValue(e.target.value)}
              autoFocus
            />
          ) : type === 'select' ? (
            <select
              className="w-full bg-feps-surface-alt border-2 border-feps-gold outline-none p-1 font-inherit text-inherit text-base shadow-sm"
              value={currentValue}
              onChange={(e) => setCurrentValue(e.target.value)}
              autoFocus
            >
              {options?.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          ) : type === 'datetime-local' ? (
             <input
              type="datetime-local"
              className="w-full bg-feps-surface-alt border-2 border-feps-gold outline-none p-1 font-inherit text-inherit text-base shadow-sm"
              value={currentValue || ''}
              onChange={(e) => setCurrentValue(e.target.value)}
              autoFocus
            />
          ) : (
            <input
              type="text"
              className="w-full bg-feps-surface-alt/50 border-b-2 border-feps-gold outline-none px-1 py-0.5 font-inherit text-inherit shadow-sm"
              value={currentValue}
              onChange={(e) => setCurrentValue(e.target.value)}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSave()
                if (e.key === 'Escape') handleCancel()
              }}
            />
          )}
        </div>
        <div className="flex gap-1 flex-shrink-0 z-10 sticky top-4">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="p-1.5 bg-green-600 hover:bg-green-700 text-white shadow transition-colors disabled:opacity-50"
            title="Save"
          >
            <Check size={16} />
          </button>
          <button
            onClick={handleCancel}
            disabled={isSaving}
            className="p-1.5 bg-red-600 hover:bg-red-700 text-white shadow transition-colors disabled:opacity-50"
            title="Cancel"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div 
      className={`relative group inline-block cursor-pointer outline-dashed outline-2 outline-transparent hover:outline-feps-gold/40 hover:bg-feps-gold/5 transition-all w-full ${className}`}
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        setIsEditing(true)
      }}
      title="Click to edit"
    >
      {children}
      <div className="absolute -top-2 -right-2 bg-feps-gold text-feps-ink p-1 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none hidden md:block">
        <Edit2 size={12} />
      </div>
    </div>
  )
}
