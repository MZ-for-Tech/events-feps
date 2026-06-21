'use client'

import React, { useState } from 'react'
import { useTranslations } from 'next-intl'
import type { SurveyQuestion } from '@/app/[locale]/admin/events/[id]/AdminEventDetailClient'
import { Send, CheckCircle, Loader } from 'lucide-react'

interface Props {
  eventId: string
  questions: SurveyQuestion[]
  isAr: boolean
}

export default function EventSurveyForm({ eventId, questions, isAr }: Props) {
  const t = useTranslations('EventSurvey')
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  if (questions.length === 0) return null
  if (submitted) {
    return (
      <div className="bg-feps-navy/5 border-2 border-feps-navy p-8 text-center mt-12">
        <CheckCircle className="mx-auto text-feps-navy mb-4" size={48} />
        <h3 className="text-2xl font-serif text-feps-navy mb-2">
          {t('successTitle')}
        </h3>
        <p className="text-feps-ink-secondary">
          {t('successDesc')}
        </p>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res = await fetch(`/api/events/${eventId}/survey`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers })
      })
      if (res.ok) {
        setSubmitted(true)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mt-12 bg-feps-paper border-2 border-feps-navy p-6 md:p-10">
      <h3 className="text-2xl font-serif text-feps-navy mb-2 uppercase tracking-wider">
        {t('feedbackTitle')}
      </h3>
      <p className="text-sm text-feps-ink-secondary mb-8">
        {t('feedbackDesc')}
      </p>

      <form onSubmit={handleSubmit} className="space-y-8">
        {questions.map((q, i) => (
          <div key={q.id} className="space-y-4">
            <label className="block font-bold text-feps-ink text-lg">
              {i + 1}. {q.text} {!!q.required && <span className="text-red-500">*</span>}
            </label>
            
            {q.type === 'text' ? (
              <textarea
                required={!!q.required}
                value={answers[q.id] || ''}
                onChange={e => setAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
                className="w-full border border-feps-ink/20 p-4 min-h-[100px] focus:outline-none focus:border-feps-navy bg-white"
                placeholder={t('answerPlaceholder')}
              />
            ) : (
              <div className="space-y-3 pl-4 rtl:pr-4 rtl:pl-0">
                {q.options?.map((opt, oIndex) => (
                  <label key={oIndex} className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative flex items-center justify-center">
                      <input
                        type="radio"
                        name={q.id}
                        value={opt}
                        required={!!q.required}
                        checked={answers[q.id] === opt}
                        onChange={e => setAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
                        className="peer sr-only"
                      />
                      <div className="w-5 h-5 rounded-full border-2 border-feps-ink/20 peer-checked:border-feps-navy transition-colors" />
                      <div className="absolute w-2.5 h-2.5 rounded-full bg-feps-navy opacity-0 peer-checked:opacity-100 transition-opacity" />
                    </div>
                    <span className="text-feps-ink group-hover:text-feps-navy transition-colors">{opt}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        ))}

        <button
          type="submit"
          disabled={submitting}
          className="w-full md:w-auto mt-8 flex items-center justify-center gap-2 bg-feps-navy hover:bg-black text-white px-8 py-4 font-bold uppercase tracking-widest transition-colors disabled:opacity-50"
        >
          {submitting ? <Loader className="animate-spin" size={20} /> : <Send size={20} className={isAr ? 'rotate-180' : ''} />}
          {t('submitFeedback')}
        </button>
      </form>
    </div>
  )
}
