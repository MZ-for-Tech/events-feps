import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { hasPermission, PERMISSIONS } from '@/lib/permissions'
import { logAction } from '@/lib/logger'
import translate from 'google-translate-api-x'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const event = await prisma.event.findUnique({ where: { id } })
    if (!event) return new NextResponse('Not Found', { status: 404 })
    // Public can see published; admins can see drafts too
    return NextResponse.json(event)
  } catch {
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) {
    return new NextResponse('Unauthorized', { status: 401 })
  }
  
  if (!hasPermission(session, PERMISSIONS.EVENTS_CREATE) && 
      !hasPermission(session, PERMISSIONS.EVENTS_PUBLISH) &&
      !hasPermission(session, PERMISSIONS.EVENTS_REPORTS)) {
    return new NextResponse('Forbidden', { status: 403 })
  }
  const { id } = await params
  try {
    const data = await req.json()
    
    if (!hasPermission(session, PERMISSIONS.EVENTS_PUBLISH)) {
      delete data.published
      delete data.status
    }
    
    let titleEn = data.title
    let titleAr = data.titleAr
    let titleFr = data.titleFr
    if (titleEn !== undefined || titleAr !== undefined || titleFr !== undefined) {
      const baseTitle = (titleEn || titleAr || titleFr) || undefined
      if (baseTitle && typeof baseTitle === 'string') {
        if (titleEn === '') { try { titleEn = ((await translate(baseTitle, { to: 'en' })) as { text: string }).text } catch (e) { console.error(e) } }
        if (titleAr === '') { try { titleAr = ((await translate(baseTitle, { to: 'ar' })) as { text: string }).text } catch (e) { console.error(e) } }
        if (titleFr === '') { try { titleFr = ((await translate(baseTitle, { to: 'fr' })) as { text: string }).text } catch (e) { console.error(e) } }
      }
    }

    let locationEn = data.location
    let locationAr = data.locationAr
    let locationFr = data.locationFr
    if (locationEn !== undefined || locationAr !== undefined || locationFr !== undefined) {
      const baseLoc = (locationEn || locationAr || locationFr) || undefined
      if (baseLoc && typeof baseLoc === 'string') {
        if (locationEn === '') { try { locationEn = ((await translate(baseLoc, { to: 'en' })) as { text: string }).text } catch (e) { console.error(e) } }
        if (locationAr === '') { try { locationAr = ((await translate(baseLoc, { to: 'ar' })) as { text: string }).text } catch (e) { console.error(e) } }
        if (locationFr === '') { try { locationFr = ((await translate(baseLoc, { to: 'fr' })) as { text: string }).text } catch (e) { console.error(e) } }
      }
    }

    let descriptionEn = data.description
    let descriptionAr = data.descriptionAr
    let descriptionFr = data.descriptionFr
    if (descriptionEn !== undefined || descriptionAr !== undefined || descriptionFr !== undefined) {
      const baseDesc = (descriptionEn || descriptionAr || descriptionFr) || undefined
      if (baseDesc && typeof baseDesc === 'string') {
        if (descriptionEn === '') { try { descriptionEn = ((await translate(baseDesc, { to: 'en' })) as { text: string }).text } catch (e) { console.error(e) } }
        if (descriptionAr === '') { try { descriptionAr = ((await translate(baseDesc, { to: 'ar' })) as { text: string }).text } catch (e) { console.error(e) } }
        if (descriptionFr === '') { try { descriptionFr = ((await translate(baseDesc, { to: 'fr' })) as { text: string }).text } catch (e) { console.error(e) } }
      }
    }

    let agendaTextEn = data.agendaText
    let agendaTextAr = data.agendaTextAr
    let agendaTextFr = data.agendaTextFr
    if (agendaTextEn !== undefined || agendaTextAr !== undefined || agendaTextFr !== undefined) {
      const baseAgenda = (agendaTextEn || agendaTextAr || agendaTextFr) || undefined
      if (baseAgenda && typeof baseAgenda === 'string') {
        if (agendaTextEn === '') { try { agendaTextEn = ((await translate(baseAgenda, { to: 'en' })) as { text: string }).text } catch (e) { console.error(e) } }
        if (agendaTextAr === '') { try { agendaTextAr = ((await translate(baseAgenda, { to: 'ar' })) as { text: string }).text } catch (e) { console.error(e) } }
        if (agendaTextFr === '') { try { agendaTextFr = ((await translate(baseAgenda, { to: 'fr' })) as { text: string }).text } catch (e) { console.error(e) } }
      }
    }
    
    const updateData: Record<string, unknown> = {
        title: titleEn !== undefined ? titleEn : undefined,
        titleAr: titleAr !== undefined ? (titleAr ?? null) : undefined,
        titleFr: titleFr !== undefined ? (titleFr ?? null) : undefined,
        categoryId: data.categoryId,
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        endDate: data.endDate !== undefined ? (data.endDate ? new Date(data.endDate) : null) : undefined,
        location: locationEn !== undefined ? (locationEn ?? null) : undefined,
        locationAr: locationAr !== undefined ? (locationAr ?? null) : undefined,
        locationFr: locationFr !== undefined ? (locationFr ?? null) : undefined,
        description: descriptionEn !== undefined ? (descriptionEn ?? null) : undefined,
        descriptionAr: descriptionAr !== undefined ? (descriptionAr ?? null) : undefined,
        descriptionFr: descriptionFr !== undefined ? (descriptionFr ?? null) : undefined,
        agendaText: agendaTextEn !== undefined ? (agendaTextEn ?? null) : undefined,
        agendaTextAr: agendaTextAr !== undefined ? (agendaTextAr ?? null) : undefined,
        agendaTextFr: agendaTextFr !== undefined ? (agendaTextFr ?? null) : undefined,
        agendaFile: data.agendaFile !== undefined ? (data.agendaFile ?? null) : undefined,
        imageUrl: data.imageUrl !== undefined ? (data.imageUrl ?? null) : undefined,
        published: data.published ?? undefined,
        status: data.status ?? undefined,
        reportSummary: data.reportSummary !== undefined ? (data.reportSummary ?? null) : undefined,
        reportResults: data.reportResults !== undefined ? (data.reportResults ?? null) : undefined,
        reportRecommendations: data.reportRecommendations !== undefined ? (data.reportRecommendations ?? null) : undefined,
        reportCustomFields: data.reportCustomFields !== undefined ? (data.reportCustomFields ?? null) : undefined,
        surveyQuestions: data.surveyQuestions !== undefined ? (data.surveyQuestions ?? null) : undefined,
        surveyEnabled: data.surveyEnabled !== undefined ? data.surveyEnabled : undefined,
    }
    // Fetch current event to compare
    const currentEvent = await prisma.event.findUnique({ where: { id } })
    
    // Clean updateData (remove undefined fields)
    const cleanUpdateData = Object.fromEntries(Object.entries(updateData).filter(([, v]) => v !== undefined))

    const updated = await prisma.event.update({
      where: { id },
      data: cleanUpdateData,
    })

    // Calculate Diffs for Audit Log
    const diffs: string[] = []
    if (currentEvent) {
      if (cleanUpdateData.title && currentEvent.title !== cleanUpdateData.title) diffs.push(`Title changed`)
      if (cleanUpdateData.status && currentEvent.status !== cleanUpdateData.status) diffs.push(`Status changed to ${cleanUpdateData.status}`)
      if (cleanUpdateData.published !== undefined && currentEvent.published !== cleanUpdateData.published) diffs.push(`Visibility changed to ${cleanUpdateData.published ? 'Published' : 'Draft'}`)
      if (cleanUpdateData.surveyEnabled !== undefined && currentEvent.surveyEnabled !== cleanUpdateData.surveyEnabled) diffs.push(`Survey ${cleanUpdateData.surveyEnabled ? 'Opened' : 'Closed'}`)
      if (cleanUpdateData.categoryId && currentEvent.categoryId !== cleanUpdateData.categoryId) diffs.push(`Category changed`)
      if (cleanUpdateData.startDate && new Date(currentEvent.startDate).getTime() !== new Date(cleanUpdateData.startDate as Date).getTime()) diffs.push(`Start Date changed`)
    }

    const actionText = diffs.length > 0 ? `Updated: ${diffs.join(', ')}` : 'Updated event details'

    await logAction(session!.user!.id, 'EVENT_UPDATED', 'EVENT', id, JSON.stringify({ action: actionText }))

    return NextResponse.json(updated)
  } catch {
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user || !hasPermission(session, PERMISSIONS.EVENTS_DELETE)) {
    return new NextResponse('Forbidden', { status: 403 })
  }
  const { id } = await params
  try {
    await prisma.event.delete({ where: { id } })

    await logAction(session!.user!.id, 'EVENT_DELETED', 'EVENT', id, JSON.stringify({ action: 'Deleted event' }))

    return new NextResponse(null, { status: 204 })
  } catch {
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
