import React from 'react'
import InlineEdit from '../admin/InlineEdit'

interface EventAboutProps {
  description: string | null
  descriptionAr?: string | null
  descriptionFr?: string | null
  isAr: boolean
  isFr?: boolean
  title: string
  isAdmin?: boolean
  eventId?: string
}

export default function EventAbout({ description, descriptionAr, descriptionFr, isAr, isFr, title, isAdmin, eventId }: EventAboutProps) {
  const localizedDescription = isAr && descriptionAr ? descriptionAr : (isFr && descriptionFr ? descriptionFr : description)
  const fieldName = isAr ? 'descriptionAr' : (isFr ? 'descriptionFr' : 'description')

  if (!localizedDescription && !isAdmin) return null

  return (
    <div className="mb-12 border-t-4 border-feps-ink pt-8">
      <h2 className={`text-xl md:text-2xl font-sans uppercase tracking-widest font-bold text-feps-ink mb-6 ${isAr ? 'font-arabic' : ''}`}>
        {title}
      </h2>
      <div className={`text-lg md:text-xl font-serif text-feps-ink leading-loose whitespace-pre-line m-0 ${isAr ? 'font-arabic' : ''}`}>
        <InlineEdit field={fieldName} value={localizedDescription || ''} eventId={eventId!} isAdmin={!!isAdmin} type="textarea">
          {localizedDescription || (isAr ? 'إضافة تفاصيل الفعالية' : 'Add event details...')}
        </InlineEdit>
      </div>
    </div>
  )
}
