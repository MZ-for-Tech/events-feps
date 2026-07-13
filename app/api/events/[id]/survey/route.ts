import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Submit a survey response
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const data = await req.json()
    const { registrationId, answers } = data

    const event = await prisma.event.findUnique({
      where: { id }
    })

    if (!event) {
      return new NextResponse('Event not found', { status: 404 })
    }

    if (event.registrationEnabled) {
      if (!registrationId) {
        return new NextResponse('Registration is required to submit feedback for this event', { status: 400 })
      }

      // Check if registration exists
      const reg = await prisma.eventRegistration.findFirst({
        where: { id: registrationId, eventId: id }
      })

      if (!reg) {
        return new NextResponse('Invalid registration code', { status: 400 })
      }
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
