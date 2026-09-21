import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { logAction } from '@/lib/logger'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) return new NextResponse('Unauthorized', { status: 401 })

  const { id } = await params
  try {
    const { data: logs, error } = await supabase
      .from('audit_logs')
      .select('*, users(name, email, role)')
      .eq('entity_id', id)
      .eq('entity_type', 'EVENT')
      .order('timestamp', { ascending: false })

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

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) return new NextResponse('Unauthorized', { status: 401 })

  const { id } = await params
  try {
    const { note } = await req.json()
    if (!note || note.trim() === '') return new NextResponse('Note is required', { status: 400 })

    await logAction(session.user.id, 'NOTE_ADDED', 'EVENT', id, JSON.stringify({ note: note.trim() }))
    return new NextResponse('Created', { status: 201 })
  } catch {
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
