'use client'

import React, { useState } from 'react'
import { Mail, Check } from 'lucide-react'

interface ShareButtonProps {
  title: string
  date?: string | null
  time?: string | null
  location?: string | null
  isAr: boolean
}

export default function ShareButton({ title, date, time, location, isAr }: ShareButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleShare = async () => {
    if (typeof window === 'undefined') return

    const shareUrl = window.location.href

    // Construct email body
    let body = `I would like to share this event with you:\n\n`
    body += `Title: ${title}\n`
    if (date) body += `Date: ${date}\n`
    if (time) body += `Time: ${time}\n`
    if (location) body += `Location: ${location}\n`
    body += `\nView more details here: ${shareUrl}`

    const subject = `Event Invitation: ${title}`
    
    // Construct Gmail compose URL
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    
    // Open in new tab
    window.open(gmailUrl, '_blank')
    
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={handleShare}
      className="btn-share"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        width: '100%',
        padding: '0.7rem',
        borderRadius: '8px',
        border: '1px solid var(--feps-border)',
        background: 'var(--feps-surface)',
        color: 'var(--feps-navy)',
        fontSize: '0.85rem',
        fontWeight: 700,
        cursor: 'pointer',
        transition: 'all 0.15s ease'
      }}
    >
      {copied ? (
        <>
          <Check size={15} style={{ color: 'var(--feps-gold)' }} />
          <span style={{ color: 'var(--feps-gold)' }}>
            {isAr ? 'تم فتح البريد!' : 'Mail Opened!'}
          </span>
        </>
      ) : (
        <>
          <Mail size={15} />
          <span>{isAr ? 'مشاركة عبر البريد' : 'Share via Email'}</span>
        </>
      )}
    </button>
  )
}
