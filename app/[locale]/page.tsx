import { prisma } from '@/lib/prisma'
import { getTranslations } from 'next-intl/server'
import HeroHeader from '@/components/home/HeroHeader'
import EventsFeed from '@/components/home/EventsFeed'

async function getStats() {
  const now = new Date()
  const [upcoming, total] = await Promise.all([
    prisma.event.count({
      where: { published: true, startDate: { gte: now } }
    }),
    prisma.event.count({
      where: { published: true }
    }),
  ])
  return { upcoming, total }
}

async function getUpcomingEvents() {
  return prisma.event.findMany({
    where: { published: true, startDate: { gte: new Date() } },
    orderBy: { startDate: 'asc' },
    take: 5,
    include: { category: true },
  })
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  
  // We keep translations here if needed or pass them down, 
  // but next-intl works seamlessly in components too.
  await getTranslations('Home')
  
  const [upcomingEvents, stats] = await Promise.all([
    getUpcomingEvents(),
    getStats(),
  ])

  return (
    <div className="bg-feps-paper min-h-screen relative overflow-hidden">
      <HeroHeader locale={locale} stats={stats} />
      <EventsFeed locale={locale} upcomingEvents={upcomingEvents} />
    </div>
  )
}
