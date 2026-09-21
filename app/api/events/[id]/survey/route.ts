import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { submissionLimiter, getClientIp, rateLimitResponse } from '@/lib/rateLimit'
import { SurveyResponseSchema, formatZodError } from '@/lib/validators'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const ip = getClientIp(req)
  const rl = submissionLimiter(ip)
  if (rl.limited) return rateLimitResponse(rl.resetInMs)

  const { id } = await params
  try {
    const body = await req.json()

    const parsed = SurveyResponseSchema.safeParse(body)
    if (!parsed.success) {
      return new NextResponse(formatZodError(parsed.error), { status: 400 })
    }

    const { registrationId, answers } = parsed.data

    const { data: event } = await supabase.from('events').select('survey_enabled').eq('id', id).single()
    if (!event) return new NextResponse('Event not found', { status: 404 })
    if (!event.survey_enabled) return new NextResponse('Survey is not currently open for this event', { status: 400 })

    const { data: response, error } = await supabase
      .from('survey_responses')
      .insert({
        event_id:        id,
        registration_id: registrationId || null,
        answers:         typeof answers === 'string' ? answers : JSON.stringify(answers),
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({
      id: response.id,
      eventId: response.event_id,
      registrationId: response.registration_id,
      answers: response.answers,
      createdAt: response.created_at,
    }, { status: 201 })
  } catch (error) {
    console.error(error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) return new NextResponse('Unauthorized', { status: 401 })

  const { id } = await params
  try {
    const { data: responses, error } = await supabase
      .from('survey_responses')
      .select('*')
      .eq('event_id', id)
      .order('created_at', { ascending: false })

    if (error) throw error

    const mapped = (responses ?? []).map(r => ({
      id: r.id,
      eventId: r.event_id,
      registrationId: r.registration_id,
      answers: r.answers,
      createdAt: r.created_at,
    }))
    return NextResponse.json(mapped)
  } catch (error) {
    console.error(error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
