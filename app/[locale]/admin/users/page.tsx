import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import AdminUsersClient from './AdminUsersClient'
import { hasPermission, PERMISSIONS } from '@/lib/permissions'

interface PageProps {
  params: Promise<{ locale: string }>
}

export default async function AdminUsersPage({ params }: PageProps) {
  const session = await auth()
  
  if (!session?.user || !hasPermission(session, PERMISSIONS.USERS_MANAGE)) {
    redirect('/')
  }

  const { locale } = await params

  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      permissions: true,
      createdAt: true
    }
  })

  // Format dates and JSON for client
  const formattedUsers = users.map(user => ({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    permissions: user.permissions ? JSON.parse(user.permissions) : [],
    createdAt: user.createdAt.toISOString()
  }))

  return <AdminUsersClient initialUsers={formattedUsers} locale={locale} currentUserRole={session.user.role} />
}
