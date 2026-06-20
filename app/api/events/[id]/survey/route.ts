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
    const response = await prisma.surveyResponse.create({
      data: {
        eventId: id,
        answers: typeof data.answers === 'string' ? data.answers : JSON.stringify(data.answers)
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
