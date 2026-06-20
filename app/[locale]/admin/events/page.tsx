import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import AdminEventsClient from './AdminEventsClient'

interface PageProps {
  params: Promise<{ locale: string }>
}

export default async function AdminEventsPage({ params }: PageProps) {
  const session = await auth()
  
  // Only Admin has access to events control panel
  if (!session?.user) {
    redirect('/')
  }

  const { locale } = await params

  // Fetch all events (both draft and published)
  const rawEvents = await prisma.event.findMany({
    orderBy: { startDate: 'desc' },
    include: { category: true }
  })

  // Fetch all categories for the dropdown
  const categories = await prisma.eventCategory.findMany()

  // Format dates to ISO strings for cross-boundary serialization
  const events = rawEvents.map(ev => ({
    id: ev.id,
    title: ev.title,
    titleAr: ev.titleAr,
    categoryId: ev.categoryId,
    category: ev.category,
    startDate: ev.startDate.toISOString(),
    endDate: ev.endDate ? ev.endDate.toISOString() : null,
    location: ev.location,
    description: ev.description,
    agendaText: ev.agendaText,
    agendaFile: ev.agendaFile,
    imageUrl: ev.imageUrl,
    published: ev.published,
    status: ev.status,
    reportSummary: ev.reportSummary,
    reportResults: ev.reportResults,
    reportRecommendations: ev.reportRecommendations,
  }))

  return <AdminEventsClient initialEvents={events} categories={categories} locale={locale} permissions={(session.user as { permissions?: string[] }).permissions || []} role={(session.user as { role?: string }).role} />
}
