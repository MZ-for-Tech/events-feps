import React from 'react'
import AdminTriviaCategoriesClient from './AdminTriviaCategoriesClient'

export default async function AdminTriviaCategoriesPage({
  params
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  return <AdminTriviaCategoriesClient locale={locale} />
}
