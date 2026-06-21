import { getTranslations } from 'next-intl/server'
import { prisma } from '@/lib/prisma'
import ReportGenerator from '@/components/admin/ReportGenerator'

export const dynamic = 'force-dynamic'

export default async function AdminReportsPage() {

  const t = await getTranslations('AdminReports')
  
  // Fetch all events for the report generator. In a real system you'd fetch by year to save payload size, 
  // but for the demo fetching all is fine or we can let the client fetch. For SEO/SSR, we fetch all.
  const rawEvents = await prisma.event.findMany({
    orderBy: { startDate: 'asc' },
    include: { category: true }
  })

  const events = rawEvents.map(ev => ({
    id: ev.id,
    title: ev.title,
    titleAr: ev.titleAr,
    category: ev.category,
    startDate: ev.startDate.toISOString(),
    endDate: ev.endDate?.toISOString() || null,
    location: ev.location,
    description: ev.description,
    agendaText: ev.agendaText,
    published: ev.published,
    imageUrl: ev.imageUrl
  }))

  const categories = await prisma.eventCategory.findMany({
    orderBy: { nameEn: 'asc' }
  })

  return (
    <div>
      <div className="mb-8 border-b border-feps-ink/20 pb-4">
        <h1 className="text-3xl font-serif text-feps-ink mb-2">
          {t('pageTitle')}
        </h1>
        <p className="font-mono text-sm text-feps-ink-secondary">
          {t('pageDesc')}
        </p>
      </div>

      <ReportGenerator events={events} categories={categories} />
    </div>
  )
}
