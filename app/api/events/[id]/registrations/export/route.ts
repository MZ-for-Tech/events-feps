import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import * as xlsx from '@e965/xlsx'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) {
    return new NextResponse('Unauthorized', { status: 401 })
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

    // Format data for Excel
    const formattedData = registrations.map((r, index) => ({
      '#': index + 1,
      'Name / الاسم': r.name || 'N/A',
      'Email / البريد الإلكتروني': r.email,
      'Identifier / الكود': r.identifier,
      'Type / النوع': r.identifierType === 'CREDIT_CODE' ? 'Credit hour code / ساعات معتمدة' : 'National ID / رقم قومي',
      'Registration Date / تاريخ التسجيل': new Date(r.createdAt).toLocaleString('en-US')
    }))

    // Create workbook and sheet
    const worksheet = xlsx.utils.json_to_sheet(formattedData)
    const workbook = xlsx.utils.book_new()
    xlsx.utils.book_append_sheet(workbook, worksheet, 'Registrations')
    
    // Write Excel workbook to buffer
    const buf = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' })

    // Return XLSX buffer as a file download response
    const filename = `Event_Registrations_${event.title.replace(/\s+/g, '_')}.xlsx`
    
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
