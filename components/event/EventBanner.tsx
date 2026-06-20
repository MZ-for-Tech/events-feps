import React from 'react'

interface EventBannerProps {
  imageUrl: string
  title: string
}

export default function EventBanner({ imageUrl, title }: EventBannerProps) {
  if (!imageUrl) return null

  return (
    <div className="relative w-full h-[220px] md:h-[380px] overflow-hidden border-2 border-feps-ink bg-feps-surface mt-6">
      <img
        src={imageUrl}
        className="w-full h-full object-cover"
        alt={title}
      />
    </div>
  )
}
