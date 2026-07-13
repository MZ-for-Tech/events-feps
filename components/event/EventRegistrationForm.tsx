'use client'

import React, { useState, useEffect } from 'react'
import { CheckCircle, AlertCircle, Loader, KeyRound, Mail, User, ShieldCheck } from 'lucide-react'

interface Props {
  eventId: string
  registrationMode: string // CREDIT_CODE | NATIONAL_ID | BOTH
  isAr: boolean
}

export default function EventRegistrationForm({ eventId, registrationMode, isAr }: Props) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [identifier, setIdentifier] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [registeredInfo, setRegisteredInfo] = useState<Record<string, string> | null>(null)
  
  // Re-verification state
  const [showVerify, setShowVerify] = useState(false)
  const [verifyIdentifier, setVerifyIdentifier] = useState('')
  const [verifyLoading, setVerifyLoading] = useState(false)
  const [verifyError, setVerifyError] = useState<string | null>(null)

  useEffect(() => {
    // Check if user is already registered in local storage
    const stored = localStorage.getItem(`feps_event_registration_${eventId}`)
    if (stored) {
      try {
        setRegisteredInfo(JSON.parse(stored))
      } catch {
        // Clear corrupt data
        localStorage.removeItem(`feps_event_registration_${eventId}`)
      }
    }
  }, [eventId])

  const validateIdentifier = (val: string): boolean => {
    const clean = val.trim()
    const isCredit = /^\d{7}$/.test(clean)
    const isNational = /^\d{14}$/.test(clean)

    if (registrationMode === 'CREDIT_CODE') {
      return isCredit
    } else if (registrationMode === 'NATIONAL_ID') {
      return isNational
    } else if (registrationMode === 'BOTH') {
      return isCredit || isNational
    }
    return false
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!email.trim() || !identifier.trim()) {
      setError(
        isAr 
          ? 'البريد الإلكتروني والرمز مطلوبان' 
          : 'Email and registration identifier are required'
      )
      return
    }

    if (!validateIdentifier(identifier)) {
      setError(
        registrationMode === 'CREDIT_CODE'
          ? (isAr ? 'كود الساعات المعتمدة يجب أن يتكون من 7 أرقام بالضبط' : 'Credit hour code must be exactly 7 digits')
          : registrationMode === 'NATIONAL_ID'
            ? (isAr ? 'الرقم القومي يجب أن يتكون من 14 رقماً بالضبط' : 'National ID must be exactly 14 digits')
            : (isAr ? 'الرمز يجب أن يكون كود ساعات (7 أرقام) أو رقم قومي (14 رقماً)' : 'Identifier must be either a 7-digit credit code or 14-digit national ID')
      )
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`/api/events/${eventId}/registrations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim() || null,
          email: email.trim(),
          identifier: identifier.trim()
        })
      })

      if (res.ok) {
        const registration = await res.json()
        const info = {
          registrationId: registration.id,
          name: registration.name || '',
          email: registration.email,
          identifier: registration.identifier
        }
        localStorage.setItem(`feps_event_registration_${eventId}`, JSON.stringify(info))
        setRegisteredInfo(info)
        setSuccess(true)
        // Refresh page so survey form mounts
        setTimeout(() => {
          window.location.reload()
        }, 1500)
      } else {
        const errMsg = await res.text()
        if (res.status === 409) {
          setError(
            isAr 
              ? 'هذا الرمز مسجل بالفعل في هذه الفعالية' 
              : 'This identifier is already registered for this event'
          )
        } else {
          setError(isAr ? `فشل التسجيل: ${errMsg}` : `Registration failed: ${errMsg}`)
        }
      }
    } catch {
      setError(isAr ? 'خطأ في الاتصال بالخادم' : 'Server connection error')
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    setVerifyError(null)

    if (!verifyIdentifier.trim()) {
      setVerifyError(isAr ? 'الرمز مطلوب للتحقق' : 'Identifier code is required')
      return
    }

    setVerifyLoading(true)
    try {
      const res = await fetch(`/api/events/${eventId}/registrations/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: verifyIdentifier.trim() })
      })

      const data = await res.json()
      if (res.ok && data.valid) {
        const info = {
          registrationId: data.registrationId,
          name: data.name || '',
          email: data.email,
          identifier: verifyIdentifier.trim()
        }
        localStorage.setItem(`feps_event_registration_${eventId}`, JSON.stringify(info))
        setRegisteredInfo(info)
        setSuccess(true)
        setTimeout(() => {
          window.location.reload()
        }, 1500)
      } else {
        setVerifyError(
          isAr 
            ? 'الرمز غير مسجل في هذه الفعالية. يرجى إدخال الرمز الصحيح أو التسجيل أولاً.' 
            : 'Code not found. Please register first or enter the correct code.'
        )
      }
    } catch {
      setVerifyError(isAr ? 'خطأ في الاتصال بالخادم' : 'Server connection error')
    } finally {
      setVerifyLoading(false)
    }
  }

  const handleSignOutRegistration = () => {
    localStorage.removeItem(`feps_event_registration_${eventId}`)
    setRegisteredInfo(null)
    setSuccess(false)
    // Refresh page so survey form unmounts/guards
    window.location.reload()
  }

  const getIdentifierPlaceholder = () => {
    if (registrationMode === 'CREDIT_CODE') return isAr ? 'كود الساعات المعتمدة (7 أرقام)' : 'Credit Hour Code (7 digits)'
    if (registrationMode === 'NATIONAL_ID') return isAr ? 'الرقم القومي (14 رقم)' : 'National ID (14 digits)'
    return isAr ? 'كود الساعات (7 أرقام) أو الرقم القومي (14 رقماً)' : 'Credit code (7 digits) or National ID (14 digits)'
  }

  if (registeredInfo) {
    return (
      <div className="bg-green-50 border-2 border-green-600 p-6 my-8 font-sans">
        <div className="flex items-center gap-3 text-green-800 font-bold mb-2">
          <ShieldCheck size={24} />
          <span>
            {isAr ? 'أنت مسجل بالفعل في هذه الفعالية' : 'You are registered for this event'}
          </span>
        </div>
        <p className="text-sm text-green-700 mb-4">
          {isAr 
            ? `الاسم: ${registeredInfo.name || 'مشارك'} | الرمز المسجل: ${registeredInfo.identifier}`
            : `Name: ${registeredInfo.name || 'Attendee'} | Code: ${registeredInfo.identifier}`}
        </p>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <span className="text-xs text-green-600 font-bold">
            {isAr 
              ? '✓ تم تفعيل استبيان التقييم في أسفل الصفحة.' 
              : '✓ Feedback survey is now enabled at the bottom of the page.'}
          </span>
          <button 
            onClick={handleSignOutRegistration}
            className="text-xs text-red-600 hover:text-red-800 underline font-bold uppercase tracking-wider"
          >
            {isAr ? 'إلغاء التسجيل على هذا الجهاز' : 'Forget registration on this device'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-feps-surface border-2 border-feps-navy p-8 my-8">
      <div className="border-b-2 border-feps-navy pb-4 mb-6">
        <h2 className="text-2xl font-serif text-feps-navy font-bold uppercase tracking-wide">
          {isAr ? 'التسجيل لحضور الفعالية' : 'Event Attendance Registration'}
        </h2>
        <p className="text-xs text-feps-ink-secondary mt-1">
          {isAr 
            ? 'يرجى التسجيل لتتمكن من ملء نموذج التقييم واستلام تأكيد الحضور.' 
            : 'Please register to attend and participate in the feedback evaluation.'}
        </p>
      </div>

      {success ? (
        <div className="bg-green-50 text-green-800 border border-green-200 p-4 font-bold flex items-center gap-3">
          <CheckCircle className="text-green-600 animate-bounce" />
          <span>
            {isAr 
              ? 'تم التسجيل بنجاح! جاري تحويلك للتقييم...' 
              : 'Registered successfully! Preparing evaluation form...'}
          </span>
        </div>
      ) : showVerify ? (
        /* Re-verification Form */
        <form onSubmit={handleVerify} className="space-y-4">
          <div className="bg-blue-50 border-l-4 border-blue-500 p-3 text-sm text-blue-700">
            {isAr 
              ? 'تحقق من كود التسجيل الخاص بك إذا قمت بالتسجيل مسبقاً من جهاز آخر.'
              : 'Verify your registration code if you have already registered from another device.'}
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-feps-ink-secondary mb-2">
              {isAr ? 'أدخل رمز التسجيل الخاص بك' : 'Enter your registration code'}
            </label>
            <div className="relative">
              <KeyRound size={16} className="absolute left-3 top-3.5 text-feps-ink-secondary" />
              <input
                type="text"
                value={verifyIdentifier}
                onChange={(e) => setVerifyIdentifier(e.target.value)}
                placeholder={getIdentifierPlaceholder()}
                className="w-full border border-feps-ink/20 bg-white p-3 pl-10 focus:outline-none focus:border-feps-navy text-sm font-mono"
              />
            </div>
          </div>

          {verifyError && (
            <div className="text-red-600 text-xs font-bold flex items-center gap-1.5">
              <AlertCircle size={14} /> {verifyError}
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() => {
                setShowVerify(false)
                setVerifyError(null)
              }}
              className="text-xs text-feps-navy hover:underline font-bold"
            >
              {isAr ? '← العودة للتسجيل الجديد' : '← Back to new registration'}
            </button>
            
            <button
              type="submit"
              disabled={verifyLoading}
              className="bg-feps-navy text-white px-6 py-2.5 text-xs font-bold uppercase tracking-wider hover:bg-black transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {verifyLoading && <Loader size={12} className="animate-spin" />}
              {isAr ? 'التحقق وتفعيل الاستبيان' : 'Verify & Enable Survey'}
            </button>
          </div>
        </form>
      ) : (
        /* Standard Registration Form */
        <form onSubmit={handleRegister} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-feps-ink-secondary mb-2">
                {isAr ? 'الاسم بالكامل (اختياري)' : 'Full Name (Optional)'}
              </label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-3.5 text-feps-ink-secondary" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={isAr ? 'أدخل اسمك الكريم' : 'e.g. Aly Samahy'}
                  className="w-full border border-feps-ink/20 bg-white p-3 pl-10 focus:outline-none focus:border-feps-navy text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-feps-ink-secondary mb-2">
                {isAr ? 'البريد الإلكتروني (إلزامي)' : 'Email Address (Mandatory)'}
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-3.5 text-feps-ink-secondary" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  className="w-full border border-feps-ink/20 bg-white p-3 pl-10 focus:outline-none focus:border-feps-navy text-sm font-mono"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-feps-ink-secondary mb-2">
              {getIdentifierPlaceholder()}
            </label>
            <div className="relative">
              <KeyRound size={16} className="absolute left-3 top-3.5 text-feps-ink-secondary" />
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder={isAr ? 'أدخل الرمز الخاص بك للتحقق' : 'Enter your identifier code'}
                required
                className="w-full border border-feps-ink/20 bg-white p-3 pl-10 focus:outline-none focus:border-feps-navy text-sm font-mono"
              />
            </div>
            <span className="text-[10px] text-feps-ink-secondary mt-1 block">
              {isAr
                ? '* كود التسجيل سيتم تأكيده وإرساله إلى بريدك الإلكتروني.'
                : '* This code will be sent to your email to confirm registration.'}
            </span>
          </div>

          {error && (
            <div className="text-red-600 text-xs font-bold flex items-center gap-1.5 bg-red-50 p-2.5 border border-red-200">
              <AlertCircle size={14} className="shrink-0" /> 
              <span>{error}</span>
            </div>
          )}

          <div className="flex items-center justify-between pt-2 flex-wrap gap-4">
            <button
              type="button"
              onClick={() => {
                setShowVerify(true)
                setError(null)
              }}
              className="text-xs text-feps-navy hover:underline font-bold"
            >
              {isAr ? 'مسجل بالفعل؟ تحقق من الكود الخاص بك' : 'Already registered? Verify your code'}
            </button>

            <button
              type="submit"
              disabled={loading}
              className="bg-feps-navy text-white px-8 py-3 text-xs font-bold uppercase tracking-wider hover:bg-black transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {loading && <Loader size={12} className="animate-spin" />}
              {isAr ? 'إرسال وتسجيل الحضور' : 'Register & Confirm Attendance'}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
