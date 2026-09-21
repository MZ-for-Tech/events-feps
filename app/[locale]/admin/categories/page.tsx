import { supabase } from '@/lib/supabase'
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

  const { data: rawCategories } = await supabase
    .from('event_categories')
    .select('*')
    .order('name_en', { ascending: true })

  const categories = (rawCategories ?? []).map(c => ({
    id: c.id,
    nameEn: c.name_en,
    nameAr: c.name_ar,
    nameFr: c.name_fr,
    color: c.color,
    bg: c.bg
  }))

  return <AdminCategoriesClient initialCategories={categories} locale={locale} />
}
