import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { hasPermission, PERMISSIONS } from '@/lib/permissions'
import { submissionLimiter, getClientIp, rateLimitResponse } from '@/lib/rateLimit'
import { RegistrationCreateSchema, formatZodError } from '@/lib/validators'

// Fetch all registrations for an event (Admin only)
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) return new NextResponse('Unauthorized', { status: 401 })

  const { id } = await params
  try {
    const { data: registrations, error } = await supabase
      .from('event_registrations')
      .select('*')
      .eq('event_id', id)
      .order('created_at', { ascending: false })

    if (error) throw error

    const mapped = (registrations ?? []).map(r => ({
      id: r.id,
      eventId: r.event_id,
      identifier: r.identifier,
      identifierType: r.identifier_type,
      name: r.name,
      email: r.email,
      createdAt: r.created_at,
    }))
    return NextResponse.json(mapped)
  } catch (error) {
    console.error(error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

// Register a new attendee
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

    const parsed = RegistrationCreateSchema.safeParse(body)
    if (!parsed.success) {
      return new NextResponse(formatZodError(parsed.error), { status: 400 })
    }

    const { identifier, email, name } = parsed.data

    const { data: event } = await supabase.from('events').select('*').eq('id', id).single()
    if (!event) return new NextResponse('Event not found', { status: 404 })
    if (!event.registration_enabled) return new NextResponse('Registration is not enabled for this event', { status: 400 })
    if (!event.registration_open)    return new NextResponse('Registration period has ended for this event', { status: 400 })

    const isCredit   = /^\d{7}$/.test(identifier)
    const isNational = /^\d{14}$/.test(identifier)
    const isPhone    = /^01\d{9}$/.test(identifier)

    let detectedType: 'CREDIT_CODE' | 'NATIONAL_ID' | 'PHONE' | null = null

    if (event.registration_mode === 'CREDIT_CODE') {
      if (!isCredit) return new NextResponse('Credit code must be exactly 7 digits', { status: 400 })
      detectedType = 'CREDIT_CODE'
    } else if (event.registration_mode === 'NATIONAL_ID') {
      if (!isNational) return new NextResponse('National ID must be exactly 14 digits', { status: 400 })
      detectedType = 'NATIONAL_ID'
    } else if (event.registration_mode === 'PHONE') {
      if (!isPhone) return new NextResponse('Phone number must be an 11-digit Egyptian number starting with 01', { status: 400 })
      detectedType = 'PHONE'
    } else if (event.registration_mode === 'BOTH' || event.registration_mode === 'ANY') {
      if (isCredit)        detectedType = 'CREDIT_CODE'
      else if (isNational) detectedType = 'NATIONAL_ID'
      else if (isPhone)    detectedType = 'PHONE'
      else return new NextResponse('Identifier must be a 7-digit Credit Code, 14-digit National ID, or 11-digit Egyptian Phone Number', { status: 400 })
    }

    // Check duplicate
    const { data: existing } = await supabase
      .from('event_registrations')
      .select('id')
      .eq('event_id', id)
      .eq('identifier', identifier)
      .single()

    if (existing) return new NextResponse('Attendee is already registered for this event', { status: 409 })

    const { data: registration, error } = await supabase
      .from('event_registrations')
      .insert({
        event_id:        id,
        identifier,
        identifier_type: detectedType || 'CREDIT_CODE',
        name:            name || null,
        email,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({
      id: registration.id,
      eventId: registration.event_id,
      identifier: registration.identifier,
      identifierType: registration.identifier_type,
      name: registration.name,
      email: registration.email,
      createdAt: registration.created_at,
    }, { status: 201 })
  } catch (error) {
    console.error(error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

// Delete registration (Admin only)
export async function DELETE(req: NextRequest) {
  const session = await auth()
  if (!session?.user || !hasPermission(session, PERMISSIONS.EVENTS_CREATE)) {
    return new NextResponse('Forbidden', { status: 403 })
  }

  try {
    const url = new URL(req.url)
    const registrationId = url.searchParams.get('registrationId')
    if (!registrationId) return new NextResponse('Registration ID is required', { status: 400 })

    const { error } = await supabase.from('event_registrations').delete().eq('id', registrationId)
    if (error) throw error

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error(error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
