export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'

import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { ArrowLeft, Download } from 'lucide-react'

import EventBanner from '@/components/event/EventBanner'
import EventHeader from '@/components/event/EventHeader'
import EventAbout from '@/components/event/EventAbout'
import EventAgenda from '@/components/event/EventAgenda'
import EventSidebar from '@/components/event/EventSidebar'
import EventSurveyForm from '@/components/event/EventSurveyForm'
import AdminModeToggle from '@/components/admin/AdminModeToggle'

interface PageProps {
  params: Promise<{ locale: string; id: string }>
}

export async function generateMetadata(
  { params }: PageProps
): Promise<Metadata> {
  const { locale, id } = await params
  const t = await getTranslations({ locale, namespace: 'EventDetail' })

  const event = await prisma.event.findUnique({
    where: { id },
    include: { category: true }
  })

  if (!event) return {}

  const isAr = locale === 'ar'
  const isFr = locale === 'fr'
  const title = isAr && event.titleAr ? event.titleAr : (isFr && event.titleFr ? event.titleFr : event.title)
  const categoryLabel = event.category ? (isAr ? event.category.nameAr : locale === 'fr' ? event.category.nameFr : event.category.nameEn) : t('event')

  const searchParams = new URLSearchParams()
  searchParams.set('title', title)
  searchParams.set('category', categoryLabel)

  return {
    title: `${title} | FEPS Events`,
    description: event.description,
    openGraph: {
      images: [`/api/og?${searchParams.toString()}`],
    },
  }
}


export default async function EventDetailPage({ params }: PageProps) {
  const { locale, id } = await params
  const isAr = locale === 'ar'
  const isFr = locale === 'fr'
  const t = await getTranslations({ locale, namespace: 'EventDetail' })

  const session = await auth()
  const isAdmin = !!session?.user

  const event = await prisma.event.findUnique({
    where: { id },
    include: { category: true }
  })

  let categoryOptions: { label: string; value: string }[] = []
  if (isAdmin) {
    const categories = await prisma.eventCategory.findMany()
    categoryOptions = categories.map((c) => ({
      label: isAr ? c.nameAr : locale === 'fr' ? c.nameFr : c.nameEn,
      value: c.id
    }))
  }

  if (!event || (!event.published && !isAdmin)) {
    notFound()
  }

  const categoryLabel = event.category ? (isAr ? event.category.nameAr : locale === 'fr' ? event.category.nameFr : event.category.nameEn) : t('unknownCategory')

  const start = new Date(event.startDate)
  const end = event.endDate ? new Date(event.endDate) : null

  const formattedStartDate = start.toLocaleDateString(isAr ? 'ar-EG-u-nu-latn' : isFr ? 'fr-FR' : 'en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })
  const formattedStartTime = start.toLocaleTimeString(isAr ? 'ar-EG-u-nu-latn' : isFr ? 'fr-FR' : 'en-US', {
    hour: '2-digit', minute: '2-digit',
  })
  const formattedEndDate = end
    ? end.toLocaleDateString(isAr ? 'ar-EG-u-nu-latn' : isFr ? 'fr-FR' : 'en-GB', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    })
    : null
  const formattedEndTime = end
    ? end.toLocaleTimeString(isAr ? 'ar-EG-u-nu-latn' : isFr ? 'fr-FR' : 'en-US', {
      hour: '2-digit', minute: '2-digit',
    })
    : null

  // Helper to format Date for <input type="datetime-local"> in server's local time
  const toLocalDatetimeString = (date: Date | null) => {
    if (!date) return null
    const offset = date.getTimezoneOffset() * 60000
    return new Date(date.getTime() - offset).toISOString().slice(0, 16)
  }

  const direction = isAr ? 'rtl' : 'ltr'

  return (
    <div className={`min-h-screen bg-feps-paper ${direction} pb-16`}>
      <div className="container max-w-5xl pt-8">

        {/* Navigation & Admin Mode */}
        <div className="flex items-center gap-4 mb-6">
          <Link href={`/${locale}/events`} className="back-link">
            <ArrowLeft size={16} className={isAr ? 'rotate-180' : ''} />
            <span>{t('backToEvents')}</span>
          </Link>
          {isAdmin && (
            <div className="flex items-center gap-4 border-s-2 border-feps-border/50 ps-4">
              <AdminModeToggle isAdmin={isAdmin} isAr={isAr} label={t('adminMode')} />
            </div>
          )}
        </div>

        {/* Cover Image */}
        <EventBanner imageUrl={event.imageUrl || ''} title={event.title} />

        {/* Header Info */}
        <EventHeader
          isAr={isAr}
          isFr={isFr}
          title={event.title}
          titleAr={event.titleAr}
          titleFr={event.titleFr}
          location={event.location}
          locationAr={event.locationAr}
          locationFr={event.locationFr}
          formattedStartDate={formattedStartDate}
          formattedStartTime={formattedStartTime}
          formattedEndTime={formattedEndTime}
          categoryLabel={categoryLabel}
          isAdmin={isAdmin}
          eventId={event.id}
          categoryId={event.categoryId}
          categories={categoryOptions}
          rawStartDate={toLocalDatetimeString(event.startDate ? new Date(event.startDate) : null)}
          rawEndDate={toLocalDatetimeString(event.endDate ? new Date(event.endDate) : null)}
        />

        {/* Draft Notice */}
        {!event.published && (
          <div className="bg-feps-warning/10 border-l-4 border-feps-warning p-4 rounded-r-lg text-feps-warning-dark font-sans text-sm font-bold mb-8 flex items-center gap-3">
            <span className="w-2 h-2 bg-feps-warning rounded-full animate-pulse" />
            {t('draftPreview')}
          </div>
        )}

        {/* Main Content Layout Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 mt-12 pt-8">
          <div className="md:col-span-2 flex flex-col md:border-e-2 md:border-feps-ink/20 md:pe-8 lg:pe-12 rtl:md:border-e-0 rtl:md:border-s-2 rtl:md:ps-8 rtl:lg:ps-12">
            <EventAbout description={event.description} descriptionAr={event.descriptionAr} descriptionFr={event.descriptionFr} isAr={isAr} isFr={isFr} title={t('eventDetails')} isAdmin={isAdmin} eventId={event.id} />
            <EventAgenda agendaText={event.agendaText} agendaTextAr={event.agendaTextAr} agendaTextFr={event.agendaTextFr} isAr={isAr} isFr={isFr} title={t('eventProgram')} isAdmin={isAdmin} eventId={event.id} />

            {/* PDF Agenda Preview Card */}
            {event.agendaFile && (
              <div className="bg-feps-surface border-2 border-feps-navy p-8 md:p-12 mb-8">
                <div className="flex items-center gap-4 mb-8 border-b-2 border-feps-navy pb-4">
                  <h2 className={`text-2xl font-sans uppercase tracking-wider font-bold text-feps-navy ${isAr ? 'font-arabic' : ''}`}>
                    {t('officialAgenda')}
                  </h2>
                </div>
                <div className="w-full h-[500px] md:h-[700px] overflow-hidden border-2 border-feps-navy">
                  <iframe
                    src={`${event.agendaFile}#toolbar=0&navpanes=0`}
                    width="100%"
                    height="100%"
                    className="border-none block"
                    title={t('officialAgenda')}
                  />
                </div>
                <div className="flex justify-between items-center mt-8 pt-6 border-t-2 border-feps-navy/20 flex-wrap gap-4">
                  <span className="text-sm font-sans text-feps-navy font-bold uppercase tracking-wider">
                    {t('downloadFallback')}
                  </span>
                  <a href={event.agendaFile} download className="flex items-center justify-center gap-2 px-6 py-3 bg-feps-navy hover:bg-white border-2 border-feps-navy hover:text-feps-navy text-white font-bold transition-colors">
                    <Download size={18} />
                    <span>{t('downloadFile')}</span>
                  </a>
                </div>
              </div>
            )}
          </div>

          <div className="md:col-span-1">
            <EventSidebar
              isAr={isAr}
              isFr={isFr}
              title={event.title}
              formattedStartDate={formattedStartDate}
              formattedEndDate={formattedEndDate}
              formattedStartTime={formattedStartTime}
              formattedEndTime={formattedEndTime}
              location={event.location}
              locationAr={event.locationAr}
              locationFr={event.locationFr}
              agendaFile={event.agendaFile}
              labels={{
                quickFacts: t('quickFacts'),
                date: t('date'),
                until: t('until'),
                time: t('time'),
                location: t('location'),
                officialAgenda: t('officialAgenda'),
                downloadFile: t('downloadFile')
              }}
              isAdmin={isAdmin}
              eventId={event.id}
              rawStartDate={toLocalDatetimeString(event.startDate ? new Date(event.startDate) : null)}
              rawEndDate={toLocalDatetimeString(event.endDate ? new Date(event.endDate) : null)}
            />
          </div>
        </div>

        {event.surveyEnabled && event.surveyQuestions && JSON.parse(event.surveyQuestions).length > 0 && (
          <EventSurveyForm
            eventId={event.id}
            questions={JSON.parse(event.surveyQuestions)}
            isAr={isAr}
          />
        )}
        <div id="debug-dump" style={{ display: 'none' }}>{JSON.stringify({ enabled: event.surveyEnabled, qs: event.surveyQuestions })}</div>
      </div>
    </div>
  )
}
