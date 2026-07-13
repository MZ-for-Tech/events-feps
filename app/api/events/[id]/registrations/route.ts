import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { hasPermission, PERMISSIONS } from '@/lib/permissions'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

// Fetch all registrations for an event (Admin only)
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
    const registrations = await prisma.eventRegistration.findMany({
      where: { eventId: id },
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json(registrations)
  } catch (error) {
    console.error(error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

// Register a new attendee
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const data = await req.json()
    const { name, email, identifier } = data

    if (!identifier || !email) {
      return new NextResponse('Identifier and Email are required', { status: 400 })
    }

    const event = await prisma.event.findUnique({
      where: { id }
    })

    if (!event) {
      return new NextResponse('Event not found', { status: 404 })
    }

    if (!event.registrationEnabled) {
      return new NextResponse('Registration is not enabled for this event', { status: 400 })
    }

    if (!event.registrationOpen) {
      return new NextResponse('Registration period has ended for this event', { status: 400 })
    }

    // Validation rules
    const isCredit = /^\d{7}$/.test(identifier)
    const isNational = /^\d{14}$/.test(identifier)

    let detectedType: 'CREDIT_CODE' | 'NATIONAL_ID' | null = null

    if (event.registrationMode === 'CREDIT_CODE') {
      if (!isCredit) {
        return new NextResponse('Credit code must be exactly 7 digits', { status: 400 })
      }
      detectedType = 'CREDIT_CODE'
    } else if (event.registrationMode === 'NATIONAL_ID') {
      if (!isNational) {
        return new NextResponse('National ID must be exactly 14 digits', { status: 400 })
      }
      detectedType = 'NATIONAL_ID'
    } else if (event.registrationMode === 'BOTH') {
      if (isCredit) {
        detectedType = 'CREDIT_CODE'
      } else if (isNational) {
        detectedType = 'NATIONAL_ID'
      } else {
        return new NextResponse('Identifier must be either a 7-digit Credit Code or a 14-digit National ID', { status: 400 })
      }
    }

    // Check duplicate
    const existing = await prisma.eventRegistration.findUnique({
      where: {
        eventId_identifier: {
          eventId: id,
          identifier
        }
      }
    })

    if (existing) {
      return new NextResponse('Attendee is already registered for this event', { status: 409 })
    }

    const registration = await prisma.eventRegistration.create({
      data: {
        eventId: id,
        identifier,
        identifierType: detectedType || 'CREDIT_CODE',
        name: name || null,
        email: email
      }
    })

    return NextResponse.json(registration, { status: 201 })
  } catch (error) {
    console.error(error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

// Delete registration (Admin only)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user || !hasPermission(session, PERMISSIONS.EVENTS_CREATE)) {
    return new NextResponse('Forbidden', { status: 403 })
  }
  
  try {
    const url = new URL(req.url)
    const registrationId = url.searchParams.get('registrationId')
    
    if (!registrationId) {
      return new NextResponse('Registration ID is required', { status: 400 })
    }

    await prisma.eventRegistration.delete({
      where: { id: registrationId }
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error(error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
