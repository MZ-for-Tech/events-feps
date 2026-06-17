import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const month = searchParams.get('month')
    const year = searchParams.get('year')

    let where: any = { published: true }

    if (month && year) {
      const start = new Date(parseInt(year), parseInt(month) - 1, 1)
      const end = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59)
      where.startDate = { gte: start, lte: end }
    }

    const events = await prisma.event.findMany({
      where,
      orderBy: { startDate: 'asc' },
    })

    return NextResponse.json(events)
  } catch (error) {
    console.error('Failed to fetch events:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  try {
    const data = await req.json()
    const { title, titleAr, type, startDate, endDate, location, description, agendaText, imageUrl, agendaFile, published } = data

    if (!title || !type || !startDate) {
      return new NextResponse('Missing required fields', { status: 400 })
    }

    const event = await prisma.event.create({
      data: {
        title,
        titleAr: titleAr || null,
        type,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        location: location || null,
        description: description || null,
        agendaText: agendaText || null,
        imageUrl: imageUrl || null,
        agendaFile: agendaFile || null,
        published: published ?? false,
      },
    })

    return NextResponse.json(event, { status: 201 })
  } catch (error) {
    console.error('Failed to create event:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
