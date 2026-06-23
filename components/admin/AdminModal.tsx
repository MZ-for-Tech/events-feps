import React from 'react'
import { X } from 'lucide-react'

interface AdminModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  footer?: React.ReactNode
  maxWidthClass?: string
}

export function AdminModal({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  footer, 
  maxWidthClass = 'max-w-lg' 
}: AdminModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-feps-navy/50 backdrop-blur-sm overflow-y-auto">
      <div className={`bg-white w-full ${maxWidthClass} shadow-2xl border-t-4 border-feps-gold flex flex-col max-h-[90vh] my-8`}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-feps-border bg-feps-paper/50">
          <h2 className="text-xl font-serif text-feps-navy font-bold">{title}</h2>
          <button 
            onClick={onClose}
            className="text-feps-ink-secondary hover:text-feps-navy transition-colors p-1"
          >
            <X size={20} />
          </button>
        </div>
        
        {/* Body */}
        <div className="p-6 flex-1 overflow-y-auto bg-white">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="p-6 border-t border-feps-border bg-feps-paper/50 flex justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}
