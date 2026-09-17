import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { submissionLimiter, getClientIp, rateLimitResponse } from '@/lib/rateLimit'

// Verify attendee registration status for the survey
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Rate limit this endpoint — used for survey gate verification
  const ip = getClientIp(req)
  const rl = submissionLimiter(ip)
  if (rl.limited) return rateLimitResponse(rl.resetInMs)

  const { id } = await params
  try {
    const data = await req.json()
    const { identifier } = data

    if (!identifier || typeof identifier !== 'string') {
      return NextResponse.json({ valid: false, message: 'Identifier is required' }, { status: 400 })
    }

    const trimmed = identifier.trim()

    // Basic sanity check — identifiers are digits only and 7, 11, or 14 digits
    if (!/^\d{7}$|^\d{11}$|^\d{14}$/.test(trimmed)) {
      return NextResponse.json({ valid: false, message: 'Invalid identifier format' }, { status: 400 })
    }

    const registration = await prisma.eventRegistration.findUnique({
      where: {
        eventId_identifier: {
          eventId: id,
          identifier: trimmed
        }
      }
    })

    if (!registration) {
      return NextResponse.json({ valid: false, message: 'No registration found with this identifier' })
    }

    // ⚠ Do NOT return the email — prevents email harvesting attacks.
    // Only return the registrationId and name (needed for survey flow).
    return NextResponse.json({
      valid: true,
      registrationId: registration.id,
      name: registration.name,
    })
  } catch (error) {
    console.error(error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
