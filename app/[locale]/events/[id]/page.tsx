import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { Calendar, MapPin, Clock, ArrowLeft, Download, FileText, Map } from 'lucide-react'
import { EVENT_TYPE_META } from '@/components/EventCard'
import ShareButton from '@/components/ShareButton'

interface PageProps {
  params: Promise<{ locale: string; id: string }>
}

export default async function EventDetailPage({ params }: PageProps) {
  const { locale, id } = await params
  const isAr = locale === 'ar'
  const t = await getTranslations({ locale, namespace: 'EventDetail' })

  const session = await auth()
  const isAdmin = !!session?.user

  const event = await prisma.event.findUnique({
    where: { id },
  })

  // If not found, or not published and the user is not an admin, 404
  if (!event || (!event.published && !isAdmin)) {
    notFound()
  }

  const meta = EVENT_TYPE_META[event.type] || {
    label: event.type,
    labelAr: event.type,
    labelFr: event.type,
    color: 'var(--feps-navy)',
    bg: 'rgba(26,58,110,0.12)',
  }

  const start = new Date(event.startDate)
  const end = event.endDate ? new Date(event.endDate) : null

  const formattedStartDate = start.toLocaleDateString(isAr ? 'ar-EG' : 'en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  const formattedStartTime = start.toLocaleTimeString(isAr ? 'ar-EG' : 'en-US', {
    hour: '2-digit',
    minute: '2-digit',
  })

  const formattedEndDate = end
    ? end.toLocaleDateString(isAr ? 'ar-EG' : 'en-GB', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : null

  const formattedEndTime = end
    ? end.toLocaleTimeString(isAr ? 'ar-EG' : 'en-US', {
        hour: '2-digit',
        minute: '2-digit',
      })
    : null

  // Agenda parser for interactive timeline
  interface AgendaTimelineItem {
    day?: string
    time: string
    text: string
  }

  let parsedAgenda: AgendaTimelineItem[] = []

  if (event.agendaText) {
    const trimmed = event.agendaText.trim()
    if (trimmed.startsWith('[')) {
      try {
        const cells = JSON.parse(trimmed) as { day?: string; startTime: string; endTime: string; text: string }[]
        parsedAgenda = cells.map(c => {
          let timeStr = ''
          if (c.startTime && c.endTime) {
            timeStr = `${c.startTime} - ${c.endTime}`
          } else {
            timeStr = c.startTime || c.endTime || ''
          }
          return {
            day: c.day,
            time: timeStr,
            text: c.text
          }
        })
      } catch (e) {
        // Fallback
      }
    }

    if (parsedAgenda.length === 0) {
      const agendaLines = event.agendaText.split('\n').filter((line) => line.trim() !== '')
      parsedAgenda = agendaLines.map((line) => {
        const separators = [' - ', ' – ', ' : ', ' | ']
        let timePart = ''
        let textPart = line

        for (const sep of separators) {
          const idx = line.indexOf(sep)
          if (idx !== -1) {
            timePart = line.substring(0, idx).trim()
            textPart = line.substring(idx + sep.length).trim()
            break
          }
        }

        if (!timePart) {
          const timeRegex = /^(\d{1,2}:\d{2}\s*(?:AM|PM|ص|م)?)\s+(.*)$/i
          const match = line.match(timeRegex)
          if (match) {
            timePart = match[1]
            textPart = match[2]
          }
        }

        return { time: timePart, text: textPart }
      })
    }
  }

  const direction = isAr ? 'rtl' : 'ltr'

  return (
    <div className={`min-h-screen bg-transparent ${direction} pb-16`}>
      <style dangerouslySetInnerHTML={{ __html: `
        .event-page-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 1.5rem;
        }
        .back-link {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--feps-ink);
          text-decoration: none;
          font-weight: 700;
          font-family: var(--font-mono);
          text-transform: uppercase;
          font-size: 0.85rem;
          transition: all 0.2s ease;
          border-bottom: 2px solid transparent;
        }
        .back-link:hover {
          border-bottom-color: var(--feps-ink);
        }
        .cover-banner-wrapper {
          position: relative;
          width: 100%;
          height: 380px;
          overflow: hidden;
          border: 2px solid var(--feps-ink);
          background: var(--feps-surface);
          margin-top: 1.5rem;
        }
        @media (max-width: 768px) {
          .cover-banner-wrapper {
            height: 220px;
          }
        }
        .cover-banner-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          filter: grayscale(20%) contrast(110%);
        }
        .event-title-main {
          font-size: 3rem;
          font-family: var(--font-serif);
          font-weight: 700;
          color: var(--feps-ink);
          margin: 1rem 0;
          line-height: 1.1;
          letter-spacing: -0.01em;
        }
        @media (max-width: 768px) {
          .event-title-main {
            font-size: 2rem;
          }
        }
        .meta-pills-row {
          display: flex;
          flex-wrap: wrap;
          gap: 0;
          margin-top: 1.5rem;
          border-top: 2px solid var(--feps-ink);
          border-bottom: 2px solid var(--feps-ink);
        }
        .info-pill-item {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.25rem;
          font-family: var(--font-mono);
          font-size: 0.85rem;
          color: var(--feps-ink);
          font-weight: 600;
          text-transform: uppercase;
          border-right: 2px solid var(--feps-ink);
        }
        .rtl .info-pill-item {
          border-right: none;
          border-left: 2px solid var(--feps-ink);
        }
        .info-pill-item:last-child {
          border: none;
        }
        .event-main-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 3rem;
          margin-top: 3rem;
        }
        @media (min-width: 992px) {
          .event-main-grid {
            grid-template-columns: 2.5fr 1fr;
          }
          .sticky-sidebar {
            position: sticky;
            top: 2rem;
            height: fit-content;
          }
        }
        .editorial-section {
          background: var(--feps-surface);
          border: 2px solid var(--feps-ink);
          padding: 2.5rem;
          margin-bottom: 2rem;
        }
        .editorial-section-title {
          font-family: var(--font-serif);
          font-size: 1.8rem;
          font-weight: 700;
          color: var(--feps-ink);
          margin-bottom: 1.5rem;
          padding-bottom: 1rem;
          border-bottom: 2px solid var(--feps-ink);
        }
        .timeline {
          position: relative;
          padding-left: 1.5rem;
          margin-top: 1.5rem;
        }
        .rtl .timeline {
          padding-left: 0;
          padding-right: 1.5rem;
        }
        .timeline::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 2px;
          background: var(--feps-ink);
        }
        .rtl .timeline::before {
          left: auto;
          right: 0;
        }
        .timeline-item {
          position: relative;
          margin-bottom: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }
        .timeline-item::before {
          content: '';
          position: absolute;
          left: -1.5rem;
          top: 8px;
          width: 12px;
          height: 2px;
          background: var(--feps-ink);
        }
        .rtl .timeline-item::before {
          left: auto;
          right: -1.5rem;
        }
        .timeline-time {
          font-family: var(--font-mono);
          font-size: 0.85rem;
          font-weight: 700;
          color: var(--feps-ink);
          text-transform: uppercase;
        }
        .timeline-text {
          font-size: 1rem;
          color: var(--feps-ink);
          font-weight: 500;
        }
        .btn-editorial {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          background: var(--feps-ink);
          color: var(--feps-surface) !important;
          font-family: var(--font-mono);
          font-weight: 700;
          text-transform: uppercase;
          padding: 1rem 1.5rem;
          border: 2px solid var(--feps-ink);
          cursor: pointer;
          transition: all 0.2s ease;
          text-align: center;
          text-decoration: none;
          width: 100%;
        }
        .btn-editorial:hover {
          background: var(--feps-surface);
          color: var(--feps-ink) !important;
        }
        .pdf-preview-container {
          position: relative;
          width: 100%;
          height: 600px;
          overflow: hidden;
          border: 2px solid var(--feps-ink);
          background-color: var(--feps-surface);
        }
        @media (max-width: 768px) {
          .pdf-preview-container {
            height: 400px;
          }
        }
        .editorial-sidebar-box {
          border: 2px solid var(--feps-ink);
          padding: 1.5rem;
          margin-bottom: 1.5rem;
        }
        .editorial-sidebar-title {
          font-family: var(--font-serif);
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--feps-ink);
          margin: 0 0 1rem 0;
          padding-bottom: 0.5rem;
          border-bottom: 2px solid var(--feps-ink);
        }
        .sidebar-item {
          display: flex;
          flex-direction: column;
          margin-bottom: 1.25rem;
        }
        .sidebar-item-label {
          font-family: var(--font-mono);
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--feps-ink);
          text-transform: uppercase;
          margin-bottom: 0.25rem;
        }
        .sidebar-item-value {
          font-size: 0.95rem;
          font-weight: 600;
          color: var(--feps-ink);
        }
        .btn-outline-editorial {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          width: 100%;
          padding: 0.85rem;
          border: 2px solid var(--feps-ink);
          background: var(--feps-surface);
          color: var(--feps-ink);
          font-family: var(--font-mono);
          font-size: 0.85rem;
          font-weight: 700;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 0.2s ease;
          text-decoration: none;
        }
        .btn-outline-editorial:hover {
          background: var(--feps-ink);
          color: var(--feps-surface);
        }
      ` }} />

      <div className="event-page-container pt-8">
        {/* Back Link & Admin Mode */}
        <div className="flex justify-between items-center mb-6">
          <Link href={`/${locale}/events`} className="back-link">
            <ArrowLeft size={16} className={isAr ? 'rotate-180' : ''} />
            <span>{t('backToEvents')}</span>
          </Link>

          {isAdmin && (
            <span className="font-mono text-xs font-bold bg-feps-ink text-feps-surface px-3 py-1 uppercase tracking-wider">
              {t('adminMode')}
            </span>
          )}
        </div>

        {/* Large wide cover banner */}
        {event.imageUrl && (
          <div className="cover-banner-wrapper">
            <img
              src={event.imageUrl}
              className="cover-banner-img"
              alt={isAr && event.titleAr ? event.titleAr : event.title}
            />
          </div>
        )}

        {/* Event Header Info (Title, Category, Quick Stats) */}
        <div className="mt-8 mb-8 text-left rtl:text-right">
          {/* Event Type Badge */}
          <div className="mb-4">
            <span className="inline-flex items-center gap-2 border-2 border-feps-ink text-feps-ink px-4 py-1.5 font-mono text-xs font-bold uppercase tracking-wider">
              <span className="w-2 h-2 bg-feps-ink" />
              {isAr ? meta.labelAr : locale === 'fr' ? meta.labelFr : meta.label}
            </span>
          </div>

          {/* Event Title */}
          <h1 className={`event-title-main ${isAr ? 'arabic' : ''}`}>
            {isAr && event.titleAr ? event.titleAr : event.title}
          </h1>

          {/* Secondary Title in English if Arabic is default, or vice versa */}
          {event.titleAr && !isAr && (
            <p className="arabic text-xl font-serif text-feps-ink opacity-80 mt-2 mb-4 font-semibold">
              {event.titleAr}
            </p>
          )}

          {/* Quick Info Pills */}
          <div className="meta-pills-row">
            <div className="info-pill-item">
              <Calendar size={16} />
              <span>{formattedStartDate}</span>
            </div>
            <div className="info-pill-item">
              <Clock size={16} />
              <span>
                {formattedStartTime} {formattedEndTime && `- ${formattedEndTime}`}
              </span>
            </div>
            {event.location && (
              <div className="info-pill-item">
                <MapPin size={16} />
                <span>{event.location}</span>
              </div>
            )}
          </div>
        </div>

        {/* Draft Notice Banner */}
        {!event.published && (
          <div className="bg-feps-surface border-2 border-dashed border-feps-ink p-4 text-feps-ink font-mono text-sm font-bold mb-8 flex items-center gap-3">
            <span className="w-3 h-3 bg-feps-ink inline-block" />
            {t('draftPreview')}
          </div>
        )}

        {/* Main Content Layout Grid */}
        <div className="event-main-grid">
          {/* Main Column */}
          <div className="flex flex-col gap-8">
            {/* About / Description Card */}
            {event.description && (
              <div className="editorial-section">
                <h2 className="editorial-section-title">
                  {t('eventDetails')}
                </h2>
                <p className={`text-lg text-feps-ink leading-relaxed whitespace-pre-line m-0 ${isAr ? 'arabic' : ''}`}>
                  {event.description}
                </p>
              </div>
            )}

            {/* Interactive Timeline Agenda Card */}
            {event.agendaText && (
              <div className="editorial-section">
                <h2 className="editorial-section-title">
                  {t('eventProgram')}
                </h2>

                {parsedAgenda.length > 0 ? (
                  <div className="timeline">
                    {parsedAgenda.map((item, idx) => (
                      <div className="timeline-item" key={idx}>
                        <div className="flex justify-between items-center flex-wrap gap-2">
                          {item.time && (
                            <span className="timeline-time">{item.time}</span>
                          )}
                          {item.day && (
                            <span className="text-xs font-mono font-bold bg-feps-ink text-feps-surface px-2 py-0.5 uppercase tracking-wider">
                              {item.day}
                            </span>
                          )}
                        </div>
                        <span className="timeline-text">{item.text}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className={`p-6 border-2 border-feps-ink text-base leading-relaxed text-feps-ink whitespace-pre-line ${isAr ? 'arabic' : ''}`}>
                    {event.agendaText}
                  </div>
                )}
              </div>
            )}

            {/* PDF Agenda Preview Card */}
            {event.agendaFile && (
              <div className="editorial-section">
                <h2 className="editorial-section-title">
                  {t('officialAgenda')}
                </h2>

                <div className="pdf-preview-container">
                  <iframe
                    src={`${event.agendaFile}#toolbar=0&navpanes=0`}
                    width="100%"
                    height="100%"
                    className="border-none block"
                    title={t('officialAgenda')}
                  />
                </div>
                
                <div className="flex justify-between items-center mt-6 gap-4 flex-wrap border-t-2 border-feps-ink pt-4">
                  <span className="text-sm font-mono text-feps-ink font-bold">
                    {t('downloadFallback')}
                  </span>
                  <a
                    href={event.agendaFile}
                    download
                    className="btn-editorial inline-flex w-auto"
                  >
                    <Download size={16} />
                    <span>{t('downloadFile')}</span>
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Sticky Sidebar Column */}
          <div className="sticky-sidebar flex flex-col gap-6">
            {/* Quick Ledger Info Box */}
            <div className="editorial-sidebar-box">
              <h3 className="editorial-sidebar-title">
                {t('quickFacts')}
              </h3>

              <div className="flex flex-col">
                {/* Date Ledger */}
                <div className="sidebar-item">
                  <div className="sidebar-item-label flex items-center gap-2">
                    <Calendar size={14} /> {t('date')}
                  </div>
                  <div className="sidebar-item-value">
                    {formattedStartDate}
                    {formattedEndDate && formattedEndDate !== formattedStartDate && (
                      <div className="text-sm mt-1 opacity-80">
                        {t('until')} {formattedEndDate}
                      </div>
                    )}
                  </div>
                </div>

                {/* Time Ledger */}
                <div className="sidebar-item">
                  <div className="sidebar-item-label flex items-center gap-2">
                    <Clock size={14} /> {t('time')}
                  </div>
                  <div className="sidebar-item-value">
                    {formattedStartTime}
                    {formattedEndTime && (
                      <span className="opacity-80">
                        {' '}
                        - {formattedEndTime}
                      </span>
                    )}
                  </div>
                </div>

                {/* Location Ledger */}
                {event.location && (
                  <div className="sidebar-item mb-0">
                    <div className="sidebar-item-label flex items-center gap-2">
                      <MapPin size={14} /> {t('location')}
                    </div>
                    <div className="sidebar-item-value">
                      {event.location}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Agenda File Download Card */}
            {event.agendaFile && (
              <div className="editorial-sidebar-box flex flex-col gap-4">
                <div className="flex items-center gap-3 p-3 bg-feps-surface border-2 border-feps-ink">
                  <FileText size={24} className="text-feps-ink shrink-0" />
                  <div className="overflow-hidden text-ellipsis whitespace-nowrap flex-1">
                    <div className="text-sm font-bold text-feps-ink">
                      {t('officialAgenda')}
                    </div>
                  </div>
                </div>

                <a
                  href={event.agendaFile}
                  download
                  className="btn-editorial"
                >
                  <Download size={16} />
                  <span>{t('downloadFile')}</span>
                </a>
              </div>
            )}

            {/* Sharing / Actions Widget */}
            <div className="editorial-sidebar-box flex flex-col gap-3">
              <ShareButton 
                title={event.title} 
                date={formattedStartDate}
                time={formattedStartTime}
                location={event.location}
                isAr={isAr} 
              />

              {event.location && (
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-outline-editorial"
                >
                  <Map size={16} />
                  <span>{t('location')}</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
