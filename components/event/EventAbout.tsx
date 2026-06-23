import React from 'react'

interface EventAboutProps {
  description: string | null
  isAr: boolean
  title: string
}

export default function EventAbout({ description, isAr, title }: EventAboutProps) {
  if (!description) return null

  return (
    <div className="bg-feps-surface border-2 border-feps-navy p-8 mb-8">
      <div className="flex items-center gap-4 mb-6 border-b-2 border-feps-navy pb-4">
        <h2 className={`text-2xl font-sans uppercase tracking-wider font-bold text-feps-navy ${isAr ? 'font-arabic' : ''}`}>
          {title}
        </h2>
      </div>
      <p className={`text-lg text-feps-navy leading-relaxed whitespace-pre-line m-0 ${isAr ? 'font-arabic' : ''}`}>
        {description}
      </p>
    </div>
  )
}
