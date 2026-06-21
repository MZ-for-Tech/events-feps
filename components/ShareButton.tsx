'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useTranslations } from 'next-intl'
import { Mail, Check, Share2, Facebook, Twitter, MessageCircle, Link as LinkIcon, Send } from 'lucide-react'

interface ShareButtonProps {
  title: string
  date?: string | null
  time?: string | null
  location?: string | null
}

export default function ShareButton({ title, date, time, location }: ShareButtonProps) {
  const t = useTranslations('Share')
  const [isOpen, setIsOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const canNativeShare = typeof navigator !== 'undefined' && !!navigator.share

  const getShareText = () => {
    let text = `I would like to share this event with you:\n\n`
    text += `Title: ${title}\n`
    if (date) text += `Date: ${date}\n`
    if (time) text += `Time: ${time}\n`
    if (location) text += `Location: ${location}\n`
    return text
  }

  const shareUrl = typeof window !== 'undefined' ? window.location.href : ''

  const handleNativeShare = async () => {
    try {
      await navigator.share({
        title,
        text: getShareText(),
        url: shareUrl
      })
      setIsOpen(false)
    } catch (err) {
      console.log('Share error', err)
    }
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => {
      setCopied(false)
      setIsOpen(false)
    }, 2000)
  }

  const handleEmailShare = () => {
    const body = getShareText() + `\nView more details here: ${shareUrl}`
    const subject = `Event Invitation: ${title}`
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    window.open(gmailUrl, '_blank')
    setIsOpen(false)
  }

  // URLs
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`
  const twitterUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(title)}`
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(getShareText() + '\n\n' + shareUrl)}`
  const smsUrl = `sms:?&body=${encodeURIComponent(getShareText() + '\n\n' + shareUrl)}`

  return (
    <div className="relative w-full" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center gap-2 w-full py-3 bg-feps-navy text-white font-bold hover:bg-feps-navy/90 transition-colors border-2 border-feps-navy"
      >
        <Share2 size={18} />
        <span>{t('shareEvent')}</span>
      </button>

      {isOpen && (
        <div className="absolute bottom-full left-0 w-full mb-2 bg-white border-2 border-feps-navy shadow-lg z-50 flex flex-col">
          {canNativeShare && (
            <button onClick={handleNativeShare} className="flex items-center gap-3 px-4 py-3 hover:bg-feps-gold/10 border-b border-feps-border text-left w-full text-sm font-semibold text-feps-navy transition-colors">
              <Share2 size={16} />
              {t('shareDevice')}
            </button>
          )}
          
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-4 py-3 hover:bg-feps-gold/10 border-b border-feps-border text-left w-full text-sm font-semibold text-feps-navy transition-colors" onClick={() => setIsOpen(false)}>
            <MessageCircle size={16} />
            WhatsApp
          </a>

          <a href={smsUrl} className="flex items-center gap-3 px-4 py-3 hover:bg-feps-gold/10 border-b border-feps-border text-left w-full text-sm font-semibold text-feps-navy transition-colors" onClick={() => setIsOpen(false)}>
            <Send size={16} />
            iMessage / SMS
          </a>
          
          <a href={facebookUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-4 py-3 hover:bg-feps-gold/10 border-b border-feps-border text-left w-full text-sm font-semibold text-feps-navy transition-colors" onClick={() => setIsOpen(false)}>
            <Facebook size={16} />
            Facebook
          </a>
          
          <a href={twitterUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-4 py-3 hover:bg-feps-gold/10 border-b border-feps-border text-left w-full text-sm font-semibold text-feps-navy transition-colors" onClick={() => setIsOpen(false)}>
            <Twitter size={16} />
            X (Twitter)
          </a>
          
          <button onClick={handleEmailShare} className="flex items-center gap-3 px-4 py-3 hover:bg-feps-gold/10 border-b border-feps-border text-left w-full text-sm font-semibold text-feps-navy transition-colors">
            <Mail size={16} />
            {t('email')}
          </button>
          
          <button onClick={handleCopyLink} className="flex items-center gap-3 px-4 py-3 hover:bg-feps-gold/10 text-left w-full text-sm font-semibold text-feps-navy transition-colors">
            {copied ? <Check size={16} className="text-green-600" /> : <LinkIcon size={16} />}
            <span className={copied ? "text-green-600" : ""}>
              {copied ? (t('copied')) : (t('copyLink'))}
            </span>
          </button>
        </div>
      )}
    </div>
  )
}
