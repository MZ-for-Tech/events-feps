
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { hasPermission, PERMISSIONS } from '@/lib/permissions'
import AdminTriviaClient from './AdminTriviaClient'

export default async function AdminTriviaPage({ params }: { params: Promise<{ locale: string }> }) {
  const session = await auth()
  const { locale } = await params

  if (!session?.user || !hasPermission(session, PERMISSIONS.TRIVIA_MANAGE)) {
    redirect(`/${locale}/admin/login`)
  }

  // Next-intl translations are handled in the client component or passed down
  return <AdminTriviaClient locale={locale} />
}
