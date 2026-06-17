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

  const { locale } = await params
  
  return (
    <div className="flex flex-col lg:flex-row w-full flex-1 min-h-[calc(100vh-6rem)] bg-feps-paper relative">
      <AdminSidebar />
      <div className="flex-1 w-full p-4 lg:p-8">
        {children}
      </div>
    </div>
  )
}
