import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import AdminLogsClient from './AdminLogsClient'
import { hasPermission, PERMISSIONS } from '@/lib/permissions'

interface PageProps {
  params: Promise<{ locale: string }>
}

export default async function AdminLogsPage({ params }: PageProps) {
  const session = await auth()
  
  if (!session?.user || (!hasPermission(session, PERMISSIONS.LOGS_VIEW) && session.user.role !== 'SUPERADMIN')) {
    redirect('/')
  }

  const { locale } = await params
  return <AdminLogsClient locale={locale} />
}
