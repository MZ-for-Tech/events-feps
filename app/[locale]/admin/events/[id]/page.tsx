export const dynamic = 'force-dynamic'

import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import AdminEventDetailClient from './AdminEventDetailClient'

interface PageProps {
  params: Promise<{ locale: string; id: string }>
}

export default async function AdminEventDetailPage({ params }: PageProps) {
  const { locale, id } = await params
  
  const event = await prisma.event.findUnique({
    where: { id },
    include: {
      surveyResponses: true,
      category: true
    }
  })

  if (!event) {
    notFound()
  }

  return (
    <AdminEventDetailClient 
      event={event} 
      locale={locale} 
      surveyResponses={event.surveyResponses} 
    />
  )
}
