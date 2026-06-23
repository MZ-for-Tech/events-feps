import React from 'react'
import { LucideIcon } from 'lucide-react'

interface AdminPageHeaderProps {
  title: string
  description?: string
  icon?: LucideIcon
  action?: React.ReactNode
  breadcrumbs?: React.ReactNode
}

export function AdminPageHeader({
  title,
  description,
  icon: Icon,
  action,
  breadcrumbs
}: AdminPageHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
      <div className="max-w-3xl">
        {breadcrumbs && (
          <div className="mb-4">
            {breadcrumbs}
          </div>
        )}
        <h1 className="text-3xl font-serif text-feps-navy flex items-center gap-3 mb-1">
          {Icon && <Icon size={28} className="text-feps-gold shrink-0" />}
          {title}
        </h1>
        {description && (
          <p className="text-feps-ink-secondary text-sm font-sans leading-relaxed">
            {description}
          </p>
        )}
      </div>
      
      {action && (
        <div className="shrink-0 mt-2 md:mt-0">
          {action}
        </div>
      )}
    </div>
  )
}
