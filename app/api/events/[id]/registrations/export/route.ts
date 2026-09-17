import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { hasPermission, PERMISSIONS } from '@/lib/permissions'
import * as xlsx from '@e965/xlsx'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  // Require EVENTS_REPORTS or EVENTS_PUBLISH to export registrations
  if (!session?.user || (
    !hasPermission(session, PERMISSIONS.EVENTS_REPORTS) &&
    !hasPermission(session, PERMISSIONS.EVENTS_PUBLISH)
  )) {
    return new NextResponse('Forbidden', { status: 403 })
  }

  const { id } = await params
  try {
    const event = await prisma.event.findUnique({
      where: { id }
    })

    if (!event) {
      return new NextResponse('Event not found', { status: 404 })
    }

    const registrations = await prisma.eventRegistration.findMany({
      where: { eventId: id },
      orderBy: { createdAt: 'desc' }
    })

    // Map internal types to readable labels
    const formatIdentifierType = (type: string) => {
      if (type === 'CREDIT_CODE') return 'ساعات معتمدة / Credit Hours'
      if (type === 'NATIONAL_ID') return 'رقم قومي / National ID'
      if (type === 'PHONE') return 'رقم هاتف / Phone Number'
      return type
    }

    // Format data for Excel
    const formattedData = registrations.map((r, index) => ({
      '#': index + 1,
      'Name / الاسم': r.name || 'N/A',
      'Email / البريد الإلكتروني': r.email,
      'Identifier / الكود': r.identifier,
      'Type / النوع': formatIdentifierType(r.identifierType),
      'Registration Date / تاريخ التسجيل': new Date(r.createdAt).toLocaleString('en-US')
    }))

    // Create workbook and sheet
    const worksheet = xlsx.utils.json_to_sheet(formattedData)
    const workbook = xlsx.utils.book_new()
    xlsx.utils.book_append_sheet(workbook, worksheet, 'Registrations')
    
    // Write Excel workbook to buffer
    const buf = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' })

    // Return XLSX buffer as a file download response
    // Sanitize title: strip newlines and non-safe characters to prevent header injection
    const safeTitle = event.title
      .replace(/[\r\n]/g, '')          // no newlines in headers
      .replace(/[^a-zA-Z0-9_\- ]/g, '') // only safe chars
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
