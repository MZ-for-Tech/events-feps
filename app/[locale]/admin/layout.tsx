import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import AdminSidebar from '@/components/admin/AdminSidebar'

interface AdminLayoutProps {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

export default async function AdminLayout({ children, params }: AdminLayoutProps) {
  const session = await auth()

  // Any logged-in user has access to the admin shell, role gating happens per-page/sidebar
  if (!session?.user) {
    redirect('/login')
  }

  await params
  
  return (
    <div className="flex flex-col lg:flex-row w-full flex-1 min-h-[calc(100vh-4rem)] bg-feps-paper relative lg:-mt-4 lg:md:-mt-8">
      <AdminSidebar />
      <div className="flex-1 w-full min-w-0 p-4 lg:p-8 overflow-x-hidden">
        {children}
      </div>
    </div>
  )
}
