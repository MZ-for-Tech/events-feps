import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import AdminCategoriesClient from './AdminCategoriesClient'
import { hasPermission, PERMISSIONS } from '@/lib/permissions'

interface PageProps {
  params: Promise<{ locale: string }>
}

export default async function AdminCategoriesPage({ params }: PageProps) {
  const session = await auth()
  
  if (!session?.user || !hasPermission(session, PERMISSIONS.CATEGORIES_MANAGE)) {
    redirect('/')
  }

  const { locale } = await params

  const categories = await prisma.eventCategory.findMany({
    orderBy: { nameEn: 'asc' },
  })

  return <AdminCategoriesClient initialCategories={categories} locale={locale} />
}
