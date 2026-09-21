'use client'

import React from 'react'
import Image from 'next/image'
import type { InvitationConfig } from '@/types/invitation'

interface InvitationCardProps {
  config: InvitationConfig
  eventTitle?: string
  eventLocation?: string
  eventDate?: string
  forPrint?: boolean
}

export default function InvitationCard({ config, eventTitle, eventLocation, eventDate, forPrint = false }: InvitationCardProps) {
  const {
    hasMinistersPatronage, ministers,
    universityPresidentTitle, universityPresidentName, universityPresidentSuffix,
    supervisionLabel, deanTitle, deanName, deanPosition, deanExtraLine,
    hasPartnerEntities, partnerEntities,
    eventType, bodyText,
    eventTitleOnCard, eventDay, eventDateDisplay, eventTimeDisplay, eventLocationDisplay,
    bgColor, bgImageUrl,
  } = config

  const displayTitle    = eventTitleOnCard || eventTitle || ''
  const displayLocation = eventLocationDisplay || eventLocation || ''
  const displayDate     = eventDateDisplay || eventDate || ''
  const hasPatrons      = hasMinistersPatronage && ministers.length > 0

  return (
    <div
      dir="rtl"
      className={`relative w-full overflow-hidden font-arabic select-none ${forPrint ? '' : 'rounded-xl shadow-2xl'}`}
      style={{
        background: bgImageUrl ? `url(${bgImageUrl}) center/cover no-repeat` : bgColor,
        minHeight: 520,
        fontFamily: "'Cairo', 'Amiri', Arial, sans-serif",
      }}
    >
      {/* Overlay for readability when bg image is set */}
      {bgImageUrl && (
        <div className="absolute inset-0 bg-white/70 backdrop-blur-[1px]" />
      )}

      <div className="relative z-10 flex flex-col" style={{ minHeight: 520 }}>

        {/* ── TOP LOGOS ROW ── */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3">
          {/* Cairo University logo — LEFT (in RTL = right side visually) */}
          <div className="flex flex-col items-center gap-1">
            <Image src="/cu-logo.png" alt="جامعة القاهرة" width={72} height={72} className="object-contain" />
            <span className="text-[10px] font-bold text-gray-600 tracking-wide">جامعة القاهرة</span>
          </div>

          {/* Partner logos in the center */}
          {hasPartnerEntities && partnerEntities.length > 0 && (
            <div className="flex items-center gap-4 flex-wrap justify-center">
              {partnerEntities.map((p, i) => (
                <div key={i} className="flex flex-col items-center gap-1">
                  {p.logoUrl ? (
                    <img src={p.logoUrl} alt={p.name} className="h-14 w-14 object-contain" />
                  ) : (
                    <div className="h-14 w-14 rounded-full border-2 border-gray-300 flex items-center justify-center bg-white/80">
                      <span className="text-[9px] text-center text-gray-500 leading-tight px-1">{p.name}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* FEPS logo — RIGHT (in RTL = left side visually) */}
          <div className="flex flex-col items-center gap-1">
            <Image src="/feps-logo.png" alt="كلية الاقتصاد والعلوم السياسية" width={72} height={72} className="object-contain" />
            <span className="text-[10px] font-bold text-gray-600 tracking-wide text-center">كلية الاقتصاد والعلوم السياسية</span>
          </div>
        </div>

        {/* ── GOLD SEPARATOR ── */}
        <div className="mx-6 h-[2px] bg-gradient-to-l from-[#bc9c65] via-[#D4AF37] to-[#bc9c65] rounded-full mb-4" />

        {/* ── CARD TITLE ── */}
        <div className="text-center mb-3 px-4">
          <h1 className="text-2xl font-black text-[#1A3A6E] tracking-wide">
            {hasPatrons ? 'دعوة عامة' : 'دعوة'}
          </h1>
          {eventType && (
            <p className="text-sm text-gray-500 mt-0.5">{eventType}</p>
          )}
        </div>

        {/* ── PATRONS SECTION ── */}
        <div className="flex-1 px-6 text-center space-y-2">

          {/* Ministers */}
          {hasPatrons && (
            <>
              <p className="text-sm font-bold text-gray-700">تحت رعاية وتشريف</p>
              {ministers.map((m, i) => (
                <div key={i} className="mb-1">
                  <p className="text-base font-bold text-[#1A3A6E]">{m.fullTitle} {m.name}</p>
                  <p className="text-[13px] text-gray-600">{m.position}</p>
                </div>
              ))}
              <div className="mx-auto w-16 h-[1px] bg-[#D4AF37] my-2" />
            </>
          )}

          {/* University President */}
          <p className="text-sm font-bold text-gray-700">
            {hasPatrons ? '' : 'تحت رعاية'}
          </p>
          <p className="text-base font-bold text-[#1A3A6E]">
            {universityPresidentTitle} {universityPresidentName}
          </p>
          <p className="text-[13px] text-gray-600">{universityPresidentSuffix}</p>

          {/* Dean */}
          <p className="text-sm font-bold text-gray-700 mt-2">{supervisionLabel}</p>
          <p className="text-base font-bold text-[#1A3A6E]">
            {deanTitle} {deanName}
          </p>
          <p className="text-[13px] text-gray-600">{deanPosition}</p>
          {deanExtraLine && <p className="text-[12px] text-gray-500">{deanExtraLine}</p>}

          {/* ── BODY TEXT + EVENT TITLE ── */}
          {(bodyText || displayTitle) && (
            <div className="mt-4 mb-2">
              {bodyText && <p className="text-[13px] text-gray-700">{bodyText}</p>}
              {displayTitle && (
                <p className="text-[15px] font-black text-[#C0392B] mt-1 leading-snug px-2">
                  &quot;{displayTitle}&quot;
                </p>
              )}
            </div>
          )}
        </div>

        {/* ── FOOTER BAR ── */}
        <div
          className="mt-4 px-6 py-3 flex items-center justify-between gap-2 flex-wrap"
          style={{ background: '#1A3A6E' }}
        >
          {/* Day + Date */}
          {(eventDay || displayDate) && (
            <div className="flex items-center gap-2 text-white text-[13px] font-bold">
              <span>📅</span>
              <span>{eventDay}{eventDay && displayDate ? ' ' : ''}{displayDate}</span>
            </div>
          )}

          {/* Time */}
          {eventTimeDisplay && (
            <div className="flex items-center gap-2 text-white text-[13px] font-bold">
              <span>🕐</span>
              <span>{eventTimeDisplay}</span>
            </div>
          )}

          {/* Location */}
          {displayLocation && (
            <div className="flex items-center gap-2 text-white text-[13px] font-bold">
              <span>📍</span>
              <span>{displayLocation}</span>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
