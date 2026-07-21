import type { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { ArrowLeft, Ban } from 'lucide-react'
import EventSurveyForm from '@/components/event/EventSurveyForm'

interface PageProps {
  params: Promise<{ locale: string; id: string }>
}

export async function generateMetadata(
  { params }: PageProps
): Promise<Metadata> {
  const { locale, id } = await params
  const t = await getTranslations({ locale, namespace: 'SurveyPage' })
  const event = await prisma.event.findUnique({ where: { id } })
  if (!event) return {}

  const isAr = locale === 'ar'
  const isFr = locale === 'fr'
  const title = isAr && event.titleAr ? event.titleAr : (isFr && event.titleFr ? event.titleFr : event.title)

  return {
    title: `${t('pageTitle', { fallback: 'Event Survey' })} | ${title}`,
  }
}

export default async function SurveyPage({ params }: PageProps) {
  const { locale, id } = await params
  const isAr = locale === 'ar'
  const t = await getTranslations({ locale, namespace: 'SurveyPage' })

  const session = await auth()
  const isAdmin = !!session?.user

  const event = await prisma.event.findUnique({ where: { id } })

  if (!event || (!event.published && !isAdmin)) {
    notFound()
  }

  const direction = isAr ? 'rtl' : 'ltr'
  
  const questions = event.surveyQuestions ? JSON.parse(event.surveyQuestions) : []
  const isSurveyOpen = event.surveyEnabled && questions.length > 0

  return (
    <div className={`min-h-screen bg-feps-paper ${direction} pb-16`}>
      <div className="container max-w-3xl mx-auto pt-12">
        {/* Navigation */}
        <div className="flex items-center gap-4 mb-8">
          <Link href={`/${locale}/events/${event.id}`} className="back-link">
            <ArrowLeft size={16} className={isAr ? 'rotate-180' : ''} />
            <span>{t('backToEvent', { fallback: 'Back to Event' })}</span>
          </Link>
        </div>

        {isSurveyOpen ? (
          <div>
             <div className="text-center mb-8">
                <h1 className={`text-3xl font-sans uppercase tracking-wider font-bold text-feps-navy mb-4 ${isAr ? 'font-arabic' : ''}`}>
                  {t('pageTitle', { fallback: 'Event Survey' })}
                </h1>
                <p className="text-feps-ink/70">
                  {t('pageDesc', { fallback: 'Please take a moment to answer our survey.' })}
                </p>
             </div>
             <EventSurveyForm
               eventId={event.id}
               questions={questions}
               isAr={isAr}
               registrationEnabled={event.registrationEnabled}
             />
          </div>
        ) : (
          <div className="bg-feps-surface border-2 border-feps-navy p-12 text-center shadow-solid-sm">
            <div className="flex justify-center mb-6 text-feps-navy">
              <Ban size={48} strokeWidth={1.5} />
            </div>
            <h2 className={`text-2xl font-sans uppercase tracking-wider font-bold text-feps-navy mb-4 ${isAr ? 'font-arabic' : ''}`}>
              {t('surveyClosed', { fallback: 'Survey Closed' })}
            </h2>
            <p className="text-feps-ink/70 mb-8 max-w-lg mx-auto">
              {t('surveyClosedDesc', { fallback: 'The survey for this event is currently closed.' })}
            </p>
            <Link href={`/${locale}/events/${event.id}`} className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-feps-navy hover:bg-black text-white font-bold transition-colors shadow-solid uppercase tracking-widest">
              <span>{t('backToEvent', { fallback: 'Back to Event' })}</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
