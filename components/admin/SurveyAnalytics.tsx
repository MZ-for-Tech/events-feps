'use client'

import React from 'react'
import { useTranslations } from 'next-intl'
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import type { SurveyQuestion } from '@/app/[locale]/admin/events/[id]/AdminEventDetailClient'

interface Props {
  responses: Array<{ id: string, answers: string | Record<string, string>, createdAt: string | Date }>
  questions: SurveyQuestion[]
}

const COLORS = ['#1a3a6e', '#bc9c65', '#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

export default function SurveyAnalytics({ responses, questions }: Props) {
  const t = useTranslations('AdminEvents')
  if (responses.length === 0) {
    return (
      <div className="text-center py-12 text-feps-ink-secondary border-2 border-dashed border-feps-ink/20">
        {t('noResponses')}
      </div>
    )
  }

  // Parse all answers
  const parsedResponses = responses.map(r => ({
    id: r.id,
    answers: typeof r.answers === 'string' ? JSON.parse(r.answers) : r.answers,
    date: r.createdAt
  }))

  return (
    <div className="space-y-12">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-feps-ink/5 p-4 border border-feps-ink/10 text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-feps-ink-secondary mb-1">{t('totalResponses')}</p>
          <p className="text-3xl font-serif text-feps-navy">{responses.length}</p>
        </div>
      </div>

      {questions.map((q, index) => {
        // Aggregate data for this question
        if (q.type === 'choice') {
          const counts: Record<string, number> = {}
          q.options?.forEach(opt => counts[opt] = 0)
          
          parsedResponses.forEach(r => {
            const ans = r.answers[q.id]
            if (ans && counts[ans] !== undefined) {
              counts[ans]++
            } else if (ans) {
              counts[ans] = 1 // in case answer isn't in options anymore
            }
          })

          const data = Object.entries(counts).map(([name, value]) => ({ name, value }))

          return (
            <div key={q.id} className="border border-feps-ink/20 p-6 bg-white">
              <h3 className="font-bold text-lg mb-6">{index + 1}. {q.text}</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      paddingAngle={5}
                    >
                      {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          )
        } else {
          // Text question: Just list the latest answers
          const textAnswers = parsedResponses
            .map(r => r.answers[q.id])
            .filter(a => a && a.trim() !== '')

          return (
            <div key={q.id} className="border border-feps-ink/20 p-6 bg-white">
              <h3 className="font-bold text-lg mb-4">{index + 1}. {q.text}</h3>
              {textAnswers.length === 0 ? (
                <p className="text-sm text-feps-ink-secondary italic">{t('noTextAnswers')}</p>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto pr-4">
                  {textAnswers.map((ans, i) => (
                    <div key={i} className="p-3 bg-feps-ink/5 text-sm border-l-2 border-feps-navy rtl:border-l-0 rtl:border-r-2">
                      {ans}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        }
      })}
    </div>
  )
}
