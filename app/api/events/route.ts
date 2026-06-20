import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const month = searchParams.get('month')
    const year = searchParams.get('year')

    const where: Record<string, unknown> = { published: true }

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

import { hasPermission, PERMISSIONS } from '@/lib/permissions'
import { logAction } from '@/lib/logger'

export async function POST(req: NextRequest) {
  const session = await auth()
  
  if (!hasPermission(session, PERMISSIONS.EVENTS_CREATE)) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  try {
    const data = await req.json()
    const { title, titleAr, titleFr, categoryId, startDate, endDate, location, description, agendaText, imageUrl, agendaFile, published } = data

    if (!title || !categoryId || !startDate) {
      return new NextResponse('Missing required fields', { status: 400 })
    }

    const event = await prisma.event.create({
      data: {
        title,
        titleAr: titleAr || null,
        titleFr: titleFr || null,
        categoryId,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        location: location || null,
        description: description || null,
        agendaText: agendaText || null,
        imageUrl: imageUrl || null,
        agendaFile: agendaFile || null,
        published: hasPermission(session, PERMISSIONS.EVENTS_PUBLISH) ? (published ?? false) : false,
      },
    })

    await logAction(session!.user!.id, 'EVENT_CREATED', 'EVENT', event.id, JSON.stringify({ title: event.title }))

    return NextResponse.json(event, { status: 201 })
  } catch (error) {
    console.error('Failed to create event:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
