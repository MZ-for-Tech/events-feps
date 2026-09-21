import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import translate from 'google-translate-api-x'
import { publicApiLimiter, getClientIp, rateLimitResponse } from '@/lib/rateLimit'
import { EventsQuerySchema } from '@/lib/validators'
import { hasPermission, PERMISSIONS } from '@/lib/permissions'
import { logAction } from '@/lib/logger'

export async function GET(req: NextRequest) {
  const ip = getClientIp(req)
  const rl = publicApiLimiter(ip)
  if (rl.limited) return rateLimitResponse(rl.resetInMs)

  try {
    const { searchParams } = new URL(req.url)

    const parsed = EventsQuerySchema.safeParse({
      month: searchParams.get('month') ?? undefined,
      year:  searchParams.get('year')  ?? undefined,
    })

    if (!parsed.success) {
      return new NextResponse('Invalid query parameters', { status: 400 })
    }

    const { month, year } = parsed.data

    let query = supabase
      .from('events')
      .select('*')
      .eq('published', true)
      .order('start_date', { ascending: true })

    if (month !== undefined && year !== undefined) {
      const start = new Date(year, month - 1, 1).toISOString()
      const end   = new Date(year, month, 0, 23, 59, 59).toISOString()
      query = query.gte('start_date', start).lte('start_date', end)
    }

    const { data: events, error } = await query
    if (error) throw error

    // Map snake_case → camelCase for frontend compatibility
    const mapped = (events ?? []).map(mapEventFromDb)
    return NextResponse.json(mapped)
  } catch (error) {
    console.error('Failed to fetch events:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

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
      if (!title)   { try { title   = ((await translate(baseTitle, { to: 'en' })) as { text: string }).text } catch (e) { console.error(e) } }
      if (!titleAr) { try { titleAr = ((await translate(baseTitle, { to: 'ar' })) as { text: string }).text } catch (e) { console.error(e) } }
      if (!titleFr) { try { titleFr = ((await translate(baseTitle, { to: 'fr' })) as { text: string }).text } catch (e) { console.error(e) } }
    }

    const baseLoc = location || locationAr || locationFr
    if (baseLoc) {
      if (!location)   { try { location   = ((await translate(baseLoc, { to: 'en' })) as { text: string }).text } catch (e) { console.error(e) } }
      if (!locationAr) { try { locationAr = ((await translate(baseLoc, { to: 'ar' })) as { text: string }).text } catch (e) { console.error(e) } }
      if (!locationFr) { try { locationFr = ((await translate(baseLoc, { to: 'fr' })) as { text: string }).text } catch (e) { console.error(e) } }
    }

    const baseDesc = description || descriptionAr || descriptionFr
    if (baseDesc) {
      if (!description)   { try { description   = ((await translate(baseDesc, { to: 'en' })) as { text: string }).text } catch (e) { console.error(e) } }
      if (!descriptionAr) { try { descriptionAr = ((await translate(baseDesc, { to: 'ar' })) as { text: string }).text } catch (e) { console.error(e) } }
      if (!descriptionFr) { try { descriptionFr = ((await translate(baseDesc, { to: 'fr' })) as { text: string }).text } catch (e) { console.error(e) } }
    }

    const baseAgenda = agendaText || agendaTextAr || agendaTextFr
    if (baseAgenda) {
      if (!agendaText)   { try { agendaText   = ((await translate(baseAgenda, { to: 'en' })) as { text: string }).text } catch (e) { console.error(e) } }
      if (!agendaTextAr) { try { agendaTextAr = ((await translate(baseAgenda, { to: 'ar' })) as { text: string }).text } catch (e) { console.error(e) } }
      if (!agendaTextFr) { try { agendaTextFr = ((await translate(baseAgenda, { to: 'fr' })) as { text: string }).text } catch (e) { console.error(e) } }
    }

    const { data: event, error } = await supabase
      .from('events')
      .insert({
        title,
        title_ar:        titleAr    || null,
        title_fr:        titleFr    || null,
        category_id:     categoryId,
        start_date:      new Date(startDate).toISOString(),
        end_date:        endDate ? new Date(endDate).toISOString() : null,
        location:        location   || null,
        location_ar:     locationAr || null,
        location_fr:     locationFr || null,
        description:     description   || null,
        description_ar:  descriptionAr || null,
        description_fr:  descriptionFr || null,
        agenda_text:     agendaText    || null,
        agenda_text_ar:  agendaTextAr  || null,
        agenda_text_fr:  agendaTextFr  || null,
        image_url:       imageUrl   || null,
        agenda_file:     agendaFile || null,
        published:       hasPermission(session, PERMISSIONS.EVENTS_PUBLISH) ? (published ?? false) : false,
      })
      .select()
      .single()

    if (error) throw error

    await logAction(session!.user!.id, 'EVENT_CREATED', 'EVENT', event.id, JSON.stringify({ title: event.title }))

    return NextResponse.json(mapEventFromDb(event), { status: 201 })
  } catch (error) {
    console.error('Failed to create event:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

// Maps snake_case DB columns → camelCase for frontend
export function mapEventFromDb(e: Record<string, unknown>) {
  return {
    id:                     e.id,
    title:                  e.title,
    titleAr:                e.title_ar,
    titleFr:                e.title_fr,
    categoryId:             e.category_id,
    category:               e.category,
    startDate:              e.start_date,
    endDate:                e.end_date,
    location:               e.location,
    locationAr:             e.location_ar,
    locationFr:             e.location_fr,
    description:            e.description,
    descriptionAr:          e.description_ar,
    descriptionFr:          e.description_fr,
    agendaText:             e.agenda_text,
    agendaTextAr:           e.agenda_text_ar,
    agendaTextFr:           e.agenda_text_fr,
    agendaFile:             e.agenda_file,
    imageUrl:               e.image_url,
    published:              e.published,
    status:                 e.status,
    reportSummary:          e.report_summary,
    reportResults:          e.report_results,
    reportRecommendations:  e.report_recommendations,
    reportCustomFields:     e.report_custom_fields,
    surveyQuestions:        e.survey_questions,
    surveyEnabled:          e.survey_enabled,
    registrationEnabled:    e.registration_enabled,
    registrationOpen:       e.registration_open,
    registrationMode:       e.registration_mode,
    invitationConfig:       e.invitation_config,
    createdAt:              e.created_at,
    updatedAt:              e.updated_at,
    _count:                 e._count,
  }
}
