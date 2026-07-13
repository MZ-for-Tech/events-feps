import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Verify attendee registration status for the survey
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const data = await req.json()
    const { identifier } = data

    if (!identifier) {
      return NextResponse.json({ valid: false, message: 'Identifier is required' }, { status: 400 })
    }

    const registration = await prisma.eventRegistration.findUnique({
      where: {
        eventId_identifier: {
          eventId: id,
          identifier: identifier.trim()
        }
      }
    })

    if (!registration) {
      return NextResponse.json({ valid: false, message: 'No registration found with this identifier' })
    }

    return NextResponse.json({
      valid: true,
      registrationId: registration.id,
      name: registration.name,
      email: registration.email
    })
  } catch (error) {
    console.error(error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
