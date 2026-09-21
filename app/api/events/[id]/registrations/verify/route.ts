import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { submissionLimiter, getClientIp, rateLimitResponse } from '@/lib/rateLimit'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const ip = getClientIp(req)
  const rl = submissionLimiter(ip)
  if (rl.limited) return rateLimitResponse(rl.resetInMs)

  const { id } = await params
  try {
    const data = await req.json()
    const { identifier } = data

    if (!identifier || typeof identifier !== 'string') {
      return NextResponse.json({ valid: false, message: 'Identifier is required' }, { status: 400 })
    }

    const trimmed = identifier.trim()
    if (!/^\d{7}$|^\d{11}$|^\d{14}$/.test(trimmed)) {
      return NextResponse.json({ valid: false, message: 'Invalid identifier format' }, { status: 400 })
    }

    const { data: registration } = await supabase
      .from('event_registrations')
      .select('id, name')
      .eq('event_id', id)
      .eq('identifier', trimmed)
      .single()

    if (!registration) {
      return NextResponse.json({ valid: false, message: 'No registration found with this identifier' })
    }

    return NextResponse.json({
      valid: true,
      registrationId: registration.id,
      name: registration.name,
    })
  } catch (error) {
    console.error(error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
