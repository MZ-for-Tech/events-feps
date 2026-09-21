import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { hasPermission, PERMISSIONS } from '@/lib/permissions'
import * as xlsx from '@e965/xlsx'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user || (
    !hasPermission(session, PERMISSIONS.EVENTS_REPORTS) &&
    !hasPermission(session, PERMISSIONS.EVENTS_PUBLISH)
  )) {
    return new NextResponse('Forbidden', { status: 403 })
  }

  const { id } = await params
  try {
    const { data: event } = await supabase.from('events').select('title').eq('id', id).single()
    if (!event) return new NextResponse('Event not found', { status: 404 })

    const { data: registrations } = await supabase
      .from('event_registrations')
      .select('*')
      .eq('event_id', id)
      .order('created_at', { ascending: false })

    const formatIdentifierType = (type: string) => {
      if (type === 'CREDIT_CODE') return 'ساعات معتمدة / Credit Hours'
      if (type === 'NATIONAL_ID') return 'رقم قومي / National ID'
      if (type === 'PHONE')       return 'رقم هاتف / Phone Number'
      return type
    }

    const formattedData = (registrations ?? []).map((r, index) => ({
      '#': index + 1,
      'Name / الاسم': r.name || 'N/A',
      'Email / البريد الإلكتروني': r.email,
      'Identifier / الكود': r.identifier,
      'Type / النوع': formatIdentifierType(r.identifier_type),
      'Registration Date / تاريخ التسجيل': new Date(r.created_at).toLocaleString('en-US')
    }))

    const worksheet = xlsx.utils.json_to_sheet(formattedData)
    const workbook  = xlsx.utils.book_new()
    xlsx.utils.book_append_sheet(workbook, worksheet, 'Registrations')
    const buf = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' })

    const safeTitle = event.title
      .replace(/[\r\n]/g, '')
      .replace(/[^a-zA-Z0-9_\- ]/g, '')
      .replace(/\s+/g, '_')
      .slice(0, 80)
    const filename = `Event_Registrations_${safeTitle}.xlsx`

    return new NextResponse(buf, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${encodeURIComponent(filename)}"`
      }
    })
  } catch (error) {
    console.error(error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
