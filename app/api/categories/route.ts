import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { hasPermission, PERMISSIONS } from '@/lib/permissions'
import { translate } from 'google-translate-api-x'
import { logAction } from '@/lib/logger'
import { publicApiLimiter, getClientIp, rateLimitResponse } from '@/lib/rateLimit'

export async function GET(req: NextRequest) {
  const ip = getClientIp(req)
  const rl = publicApiLimiter(ip)
  if (rl.limited) return rateLimitResponse(rl.resetInMs)

  try {
    const { data: categories, error } = await supabase.from('event_categories').select('*')
    if (error) throw error

    const mapped = (categories ?? []).map(c => ({
      id: c.id, nameEn: c.name_en, nameAr: c.name_ar, nameFr: c.name_fr,
      color: c.color, bg: c.bg
    }))
    return NextResponse.json(mapped)
  } catch {
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user || !hasPermission(session, PERMISSIONS.CATEGORIES_MANAGE)) {
    return new NextResponse('Forbidden', { status: 403 })
  }

  try {
    const data = await req.json()
    const baseName = data.nameEn || data.nameAr || data.nameFr
    if (!baseName) return new NextResponse('Missing required fields', { status: 400 })

    let nameEn = data.nameEn
    let nameAr = data.nameAr
    let nameFr = data.nameFr

    if (!nameEn) { try { nameEn = ((await translate(baseName, { to: 'en' })) as { text: string }).text } catch (e) { console.error(e) } }
    if (!nameAr) { try { nameAr = ((await translate(baseName, { to: 'ar' })) as { text: string }).text } catch (e) { console.error(e) } }
    if (!nameFr) { try { nameFr = ((await translate(baseName, { to: 'fr' })) as { text: string }).text } catch (e) { console.error(e) } }

    const { data: category, error } = await supabase
      .from('event_categories')
      .insert({
        name_en: nameEn || '',
        name_ar: nameAr || '',
        name_fr: nameFr || '',
        color:   data.color || '#1A3A6E',
        bg:      data.bg || 'rgba(26,58,110,0.12)',
      })
      .select()
      .single()

    if (error) throw error

    await logAction(session.user.id, 'CATEGORY_CREATED', 'CATEGORY', category.id, JSON.stringify({ action: `Created category: ${category.name_en}` }))

    return NextResponse.json({ id: category.id, nameEn: category.name_en, nameAr: category.name_ar, nameFr: category.name_fr, color: category.color, bg: category.bg })
  } catch {
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
