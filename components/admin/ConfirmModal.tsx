'use client'

import React from 'react'
import { AlertTriangle, CheckCircle, Info, X } from 'lucide-react'

interface ConfirmModalProps {
  isOpen: boolean
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  isAlert?: boolean // If true, hides the Cancel button and acts like a window.alert
  onConfirm: () => void
  onCancel?: () => void
  type?: 'danger' | 'info' | 'success' | 'warning'
  isAr?: boolean
}

export function ConfirmModal({
  isOpen,
  title,
  message,
  confirmText,
  cancelText,
  isAlert = false,
  onConfirm,
  onCancel,
  type = 'info',
  isAr = true
}: ConfirmModalProps) {
  if (!isOpen) return null

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="text-green-600 w-8 h-8 shrink-0" />
      case 'danger':
        return <AlertTriangle className="text-red-600 w-8 h-8 shrink-0" />
      case 'warning':
        return <AlertTriangle className="text-amber-500 w-8 h-8 shrink-0" />
      default:
        return <Info className="text-feps-navy w-8 h-8 shrink-0" />
    }
  }

  const getBorderColor = () => {
    switch (type) {
      case 'success':
        return 'border-green-600'
      case 'danger':
        return 'border-red-600'
      case 'warning':
        return 'border-amber-500'
      default:
        return 'border-feps-navy'
    }
  }

  const getConfirmButtonStyles = () => {
    switch (type) {
      case 'danger':
        return 'bg-red-600 hover:bg-red-700 text-white'
      case 'success':
        return 'bg-green-600 hover:bg-green-700 text-white'
      case 'warning':
        return 'bg-feps-gold hover:bg-feps-gold/90 text-feps-navy'
      default:
        return 'bg-feps-navy hover:bg-feps-navy/90 text-white'
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={() => {
          if (isAlert) {
            onConfirm()
          } else if (onCancel) {
            onCancel()
          }
        }}
      />

      {/* Modal card */}
      <div 
        className={`relative w-full max-w-md bg-white p-6 shadow-2xl border-2 ${getBorderColor()} animate-[scaleIn_0.2s_ease-out] z-10`}
        dir={isAr ? 'rtl' : 'ltr'}
      >
        {/* Close Button */}
        <button 
          onClick={isAlert ? onConfirm : onCancel}
          className="absolute top-4 right-4 rtl:left-4 rtl:right-auto text-feps-ink-secondary hover:text-feps-ink transition-colors"
        >
          <X size={18} />
        </button>

        {/* Content */}
        <div className="flex gap-4 items-start mt-2">
          {getIcon()}
          <div className="space-y-2 flex-1">
            <h3 className="font-serif text-lg font-bold text-feps-navy leading-none">
              {title}
            </h3>
            <p className="text-sm text-feps-ink-secondary whitespace-pre-line leading-relaxed">
              {message}
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-6 flex justify-end gap-3 border-t border-feps-ink/10 pt-4">
          {!isAlert && (
            <button
              onClick={onCancel}
              className="px-4 py-2 border border-feps-ink/20 text-xs font-bold uppercase tracking-wider text-feps-ink-secondary hover:bg-feps-ink/5 transition-colors"
            >
              {cancelText || (isAr ? 'إلغاء' : 'Cancel')}
            </button>
          )}
          <button
            onClick={onConfirm}
            className={`px-5 py-2 text-xs font-bold uppercase tracking-wider transition-colors ${getConfirmButtonStyles()}`}
          >
            {confirmText || (isAlert ? (isAr ? 'موافق' : 'OK') : (isAr ? 'تأكيد' : 'Confirm'))}
          </button>
        </div>
      </div>
    </div>
  )
}
