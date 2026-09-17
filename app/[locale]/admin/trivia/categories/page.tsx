import React from 'react'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { hasPermission, PERMISSIONS } from '@/lib/permissions'
import AdminTriviaCategoriesClient from './AdminTriviaCategoriesClient'

export default async function AdminTriviaCategoriesPage({
  params
}: {
  params: Promise<{ locale: string }>
}) {
  const session = await auth()
  const { locale } = await params

  // Enforce TRIVIA_MANAGE permission — same guard as the parent trivia page
  if (!session?.user || !hasPermission(session, PERMISSIONS.TRIVIA_MANAGE)) {
    redirect(`/${locale}/admin/trivia`)
  }

  return <AdminTriviaCategoriesClient locale={locale} />
}
