import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { hasPermission, PERMISSIONS } from '@/lib/permissions'
import { logAction } from '@/lib/logger'
import translate from 'google-translate-api-x'
import { mapEventFromDb } from '@/app/api/events/route'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const { data: event, error } = await supabase
      .from('events')
      .select('*, event_categories(*)')
      .eq('id', id)
      .single()

    if (error || !event) return new NextResponse('Not Found', { status: 404 })

    if (!event.published) {
      const session = await auth()
      const canView = session?.user && (
        hasPermission(session, PERMISSIONS.EVENTS_CREATE) ||
        hasPermission(session, PERMISSIONS.EVENTS_PUBLISH)
      )
      if (!canView) return new NextResponse('Not Found', { status: 404 })
    }

    // Attach registration count
    const { count } = await supabase
      .from('event_registrations')
      .select('*', { count: 'exact', head: true })
      .eq('event_id', id)

    const mapped = mapEventFromDb({ ...event, _count: { registrations: count ?? 0 } })
    // Also map the joined category
    if (event.event_categories) {
      const cat = event.event_categories as Record<string, unknown>
      ;(mapped as Record<string, unknown>).category = {
        id: cat.id, nameEn: cat.name_en, nameAr: cat.name_ar, nameFr: cat.name_fr,
        color: cat.color, bg: cat.bg
      }
    }

    return NextResponse.json(mapped)
  } catch {
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) return new NextResponse('Unauthorized', { status: 401 })

  if (!hasPermission(session, PERMISSIONS.EVENTS_CREATE) &&
      !hasPermission(session, PERMISSIONS.EVENTS_PUBLISH) &&
      !hasPermission(session, PERMISSIONS.EVENTS_REPORTS) &&
      !hasPermission(session, PERMISSIONS.EVENTS_INVITATION)) {
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

    // Fetch current for audit diff
    const { data: currentEvent } = await supabase.from('events').select('*').eq('id', id).single()

    const updateData: Record<string, unknown> = {}
    if (titleEn !== undefined)        updateData.title                   = titleEn
    if (titleAr !== undefined)        updateData.title_ar                = titleAr ?? null
    if (titleFr !== undefined)        updateData.title_fr                = titleFr ?? null
    if (data.categoryId !== undefined)updateData.category_id             = data.categoryId
    if (data.startDate !== undefined) updateData.start_date              = new Date(data.startDate).toISOString()
    if (data.endDate !== undefined)   updateData.end_date                = data.endDate ? new Date(data.endDate).toISOString() : null
    if (locationEn !== undefined)     updateData.location                = locationEn ?? null
    if (locationAr !== undefined)     updateData.location_ar             = locationAr ?? null
    if (locationFr !== undefined)     updateData.location_fr             = locationFr ?? null
    if (descriptionEn !== undefined)  updateData.description             = descriptionEn ?? null
    if (descriptionAr !== undefined)  updateData.description_ar          = descriptionAr ?? null
    if (descriptionFr !== undefined)  updateData.description_fr          = descriptionFr ?? null
    if (agendaTextEn !== undefined)   updateData.agenda_text             = agendaTextEn ?? null
    if (agendaTextAr !== undefined)   updateData.agenda_text_ar          = agendaTextAr ?? null
    if (agendaTextFr !== undefined)   updateData.agenda_text_fr          = agendaTextFr ?? null
    if (data.agendaFile !== undefined)updateData.agenda_file             = data.agendaFile ?? null
    if (data.imageUrl !== undefined)  updateData.image_url               = data.imageUrl ?? null
    if (data.published !== undefined) updateData.published               = data.published
    if (data.status !== undefined)    updateData.status                  = data.status
    if (data.reportSummary !== undefined)          updateData.report_summary          = data.reportSummary ?? null
    if (data.reportResults !== undefined)          updateData.report_results          = data.reportResults ?? null
    if (data.reportRecommendations !== undefined)  updateData.report_recommendations  = data.reportRecommendations ?? null
    if (data.reportCustomFields !== undefined)     updateData.report_custom_fields    = data.reportCustomFields ?? null
    if (data.surveyQuestions !== undefined)        updateData.survey_questions        = data.surveyQuestions ?? null
    if (data.surveyEnabled !== undefined)          updateData.survey_enabled          = data.surveyEnabled
    if (data.registrationEnabled !== undefined)    updateData.registration_enabled    = data.registrationEnabled
    if (data.registrationOpen !== undefined)       updateData.registration_open       = data.registrationOpen
    if (data.registrationMode !== undefined)       updateData.registration_mode       = data.registrationMode
    if (data.invitationConfig !== undefined)       updateData.invitation_config       = data.invitationConfig ?? null

    const { data: updated, error } = await supabase
      .from('events')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    // Audit diff
    const diffs: string[] = []
    if (currentEvent) {
      if (updateData.title && currentEvent.title !== updateData.title) diffs.push('Title changed')
      if (updateData.status && currentEvent.status !== updateData.status) diffs.push(`Status changed to ${updateData.status}`)
      if (updateData.published !== undefined && currentEvent.published !== updateData.published) diffs.push(`Visibility changed to ${updateData.published ? 'Published' : 'Draft'}`)
      if (updateData.survey_enabled !== undefined && currentEvent.survey_enabled !== updateData.survey_enabled) diffs.push(`Survey ${updateData.survey_enabled ? 'Opened' : 'Closed'}`)
      if (updateData.category_id && currentEvent.category_id !== updateData.category_id) diffs.push('Category changed')
      if (updateData.start_date && new Date(currentEvent.start_date).getTime() !== new Date(updateData.start_date as string).getTime()) diffs.push('Start Date changed')
    }

    const actionText = diffs.length > 0 ? `Updated: ${diffs.join(', ')}` : 'Updated event details'
    await logAction(session!.user!.id, 'EVENT_UPDATED', 'EVENT', id, JSON.stringify({ action: actionText }))

    return NextResponse.json(mapEventFromDb(updated))
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
    const { error } = await supabase.from('events').delete().eq('id', id)
    if (error) throw error

    await logAction(session!.user!.id, 'EVENT_DELETED', 'EVENT', id, JSON.stringify({ action: 'Deleted event' }))
    return new NextResponse(null, { status: 204 })
  } catch {
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
