import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { hasPermission, PERMISSIONS } from '@/lib/permissions'
import { logAction } from '@/lib/logger'

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
    const updateData: Record<string, unknown> = {
        title: data.title,
        titleAr: data.titleAr !== undefined ? (data.titleAr ?? null) : undefined,
        titleFr: data.titleFr !== undefined ? (data.titleFr ?? null) : undefined,
        categoryId: data.categoryId,
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        endDate: data.endDate !== undefined ? (data.endDate ? new Date(data.endDate) : null) : undefined,
        location: data.location !== undefined ? (data.location ?? null) : undefined,
        description: data.description !== undefined ? (data.description ?? null) : undefined,
        agendaText: data.agendaText !== undefined ? (data.agendaText ?? null) : undefined,
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
