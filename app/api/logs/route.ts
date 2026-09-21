import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { hasPermission, PERMISSIONS } from '@/lib/permissions'

export async function GET() {
  const session = await auth()
  if (!session?.user || (!hasPermission(session, PERMISSIONS.LOGS_VIEW) && session.user.role !== 'SUPERADMIN')) {
    return new NextResponse('Forbidden', { status: 403 })
  }

  try {
    const { data: logs, error } = await supabase
      .from('audit_logs')
      .select('*, users(name, email, role)')
      .order('timestamp', { ascending: false })
      .limit(1000)

    if (error) throw error

    const mapped = (logs ?? []).map(l => ({
      id: l.id,
      timestamp: l.timestamp,
      action: l.action,
      userId: l.user_id,
      entityType: l.entity_type,
      entityId: l.entity_id,
      details: l.details,
      user: l.users ?? null,
    }))
    return NextResponse.json(mapped)
  } catch {
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return new NextResponse('Unauthorized', { status: 401 })

  try {
    const data = await req.json()
    if (data.action === 'PAGE_VIEW') {
      await supabase.from('audit_logs').insert({
        action: 'PAGE_VIEW',
        user_id: session.user.id,
        entity_type: 'SYSTEM',
        details: JSON.stringify({ path: data.details })
      })
      return new NextResponse(null, { status: 204 })
    }
    return new NextResponse('Invalid action', { status: 400 })
  } catch {
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
