import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { submissionLimiter, getClientIp, rateLimitResponse } from '@/lib/rateLimit'
import { SurveyResponseSchema, formatZodError } from '@/lib/validators'

// Submit a survey response
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Rate limit — prevent survey spam
  const ip = getClientIp(req)
  const rl = submissionLimiter(ip)
  if (rl.limited) return rateLimitResponse(rl.resetInMs)

  const { id } = await params
  try {
    const body = await req.json()

    // Validate input with Zod (includes size limit on answers)
    const parsed = SurveyResponseSchema.safeParse(body)
    if (!parsed.success) {
      return new NextResponse(formatZodError(parsed.error), { status: 400 })
    }

    const { registrationId, answers } = parsed.data

    const event = await prisma.event.findUnique({ where: { id } })

    if (!event) {
      return new NextResponse('Event not found', { status: 404 })
    }

    // Guard: only accept submissions when survey is actively enabled
    if (!event.surveyEnabled) {
      return new NextResponse('Survey is not currently open for this event', { status: 400 })
    }

    const response = await prisma.surveyResponse.create({
      data: {
        eventId: id,
        registrationId: registrationId || null,
        answers: typeof answers === 'string' ? answers : JSON.stringify(answers)
      }
    })
    return NextResponse.json(response, { status: 201 })
  } catch (error) {
    console.error(error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

// Fetch all survey responses for an event (Admin only)
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) {
    return new NextResponse('Unauthorized', { status: 401 })
  }
  const { id } = await params
  try {
    const responses = await prisma.surveyResponse.findMany({
      where: { eventId: id },
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json(responses)
  } catch (error) {
    console.error(error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
