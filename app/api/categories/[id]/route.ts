import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { hasPermission, PERMISSIONS } from '@/lib/permissions'
import { translate } from 'google-translate-api-x'
import { logAction } from '@/lib/logger'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user || !hasPermission(session, PERMISSIONS.CATEGORIES_MANAGE)) {
    return new NextResponse('Forbidden', { status: 403 })
  }

  const { id } = await params
  try {
    const data = await req.json()

    let nameEn = data.nameEn
    let nameAr = data.nameAr
    let nameFr = data.nameFr

    const isUpdatingName = nameEn !== undefined || nameAr !== undefined || nameFr !== undefined
    if (isUpdatingName) {
      const baseName = (nameEn || nameAr || nameFr) || undefined
      if (baseName && typeof baseName === 'string') {
        if (nameEn === '') { try { nameEn = ((await translate(baseName, { to: 'en' })) as { text: string }).text } catch (e) { console.error(e) } }
        if (nameAr === '') { try { nameAr = ((await translate(baseName, { to: 'ar' })) as { text: string }).text } catch (e) { console.error(e) } }
        if (nameFr === '') { try { nameFr = ((await translate(baseName, { to: 'fr' })) as { text: string }).text } catch (e) { console.error(e) } }
      }
    }

    const updateData: Record<string, unknown> = {}
    if (nameEn !== undefined) updateData.name_en = nameEn
    if (nameAr !== undefined) updateData.name_ar = nameAr
    if (nameFr !== undefined) updateData.name_fr = nameFr
    if (data.color !== undefined) updateData.color = data.color
    if (data.bg !== undefined)    updateData.bg    = data.bg

    const { data: category, error } = await supabase
      .from('event_categories')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    await logAction(session.user.id, 'CATEGORY_UPDATED', 'CATEGORY', category.id, JSON.stringify({ action: `Updated category: ${category.name_en}` }))
    return NextResponse.json({ id: category.id, nameEn: category.name_en, nameAr: category.name_ar, nameFr: category.name_fr, color: category.color, bg: category.bg })
  } catch {
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user || !hasPermission(session, PERMISSIONS.CATEGORIES_MANAGE)) {
    return new NextResponse('Forbidden', { status: 403 })
  }

  const { id } = await params
  try {
    const { count } = await supabase
      .from('events')
      .select('*', { count: 'exact', head: true })
      .eq('category_id', id)

    if ((count ?? 0) > 0) {
      return new NextResponse('Cannot delete category that is assigned to events.', { status: 400 })
    }

    const { error } = await supabase.from('event_categories').delete().eq('id', id)
    if (error) throw error

    await logAction(session.user.id, 'CATEGORY_DELETED', 'CATEGORY', id, JSON.stringify({ action: 'Deleted category' }))
    return new NextResponse(null, { status: 204 })
  } catch {
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
