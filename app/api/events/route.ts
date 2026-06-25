import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import translate from 'google-translate-api-x'

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
    const { categoryId, startDate, endDate, imageUrl, agendaFile, published } = data
    let { title, titleAr, titleFr, location, locationAr, locationFr, description, descriptionAr, descriptionFr, agendaText, agendaTextAr, agendaTextFr } = data

    if (!title || !categoryId || !startDate) {
      return new NextResponse('Missing required fields', { status: 400 })
    }

    const baseTitle = title || titleAr || titleFr
    if (baseTitle) {
      if (!title) { try { title = ((await translate(baseTitle, { to: 'en' })) as { text: string }).text } catch (e) { console.error(e) } }
      if (!titleAr) { try { titleAr = ((await translate(baseTitle, { to: 'ar' })) as { text: string }).text } catch (e) { console.error(e) } }
      if (!titleFr) { try { titleFr = ((await translate(baseTitle, { to: 'fr' })) as { text: string }).text } catch (e) { console.error(e) } }
    }

    const baseLoc = location || locationAr || locationFr
    if (baseLoc) {
      if (!location) { try { location = ((await translate(baseLoc, { to: 'en' })) as { text: string }).text } catch (e) { console.error(e) } }
      if (!locationAr) { try { locationAr = ((await translate(baseLoc, { to: 'ar' })) as { text: string }).text } catch (e) { console.error(e) } }
      if (!locationFr) { try { locationFr = ((await translate(baseLoc, { to: 'fr' })) as { text: string }).text } catch (e) { console.error(e) } }
    }

    const baseDesc = description || descriptionAr || descriptionFr
    if (baseDesc) {
      if (!description) { try { description = ((await translate(baseDesc, { to: 'en' })) as { text: string }).text } catch (e) { console.error(e) } }
      if (!descriptionAr) { try { descriptionAr = ((await translate(baseDesc, { to: 'ar' })) as { text: string }).text } catch (e) { console.error(e) } }
      if (!descriptionFr) { try { descriptionFr = ((await translate(baseDesc, { to: 'fr' })) as { text: string }).text } catch (e) { console.error(e) } }
    }

    const baseAgenda = agendaText || agendaTextAr || agendaTextFr
    if (baseAgenda) {
      if (!agendaText) { try { agendaText = ((await translate(baseAgenda, { to: 'en' })) as { text: string }).text } catch (e) { console.error(e) } }
      if (!agendaTextAr) { try { agendaTextAr = ((await translate(baseAgenda, { to: 'ar' })) as { text: string }).text } catch (e) { console.error(e) } }
      if (!agendaTextFr) { try { agendaTextFr = ((await translate(baseAgenda, { to: 'fr' })) as { text: string }).text } catch (e) { console.error(e) } }
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
        locationAr: locationAr || null,
        locationFr: locationFr || null,
        description: description || null,
        descriptionAr: descriptionAr || null,
        descriptionFr: descriptionFr || null,
        agendaText: agendaText || null,
        agendaTextAr: agendaTextAr || null,
        agendaTextFr: agendaTextFr || null,
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
