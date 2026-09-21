import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { hasPermission, PERMISSIONS } from '@/lib/permissions'
import { logAction } from '@/lib/logger'
import { TriviaCategoryUpdateSchema, formatZodError } from '@/lib/validators'

export async function PATCH(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const session = await auth()
  
  if (!session?.user || !hasPermission(session, PERMISSIONS.TRIVIA_MANAGE)) {
    return new NextResponse('Forbidden', { status: 403 })
  }

  try {
    const body = await req.json()

    const parsed = TriviaCategoryUpdateSchema.safeParse(body)
    if (!parsed.success) {
      return new NextResponse(formatZodError(parsed.error), { status: 400 })
    }

    const { nameEn, nameAr, nameFr, color, bg } = parsed.data
    
    const updates: Record<string, any> = {
      name_en: nameEn,
      name_ar: nameAr,
      name_fr: nameFr
    }
    if (color !== undefined) updates.color = color
    if (bg !== undefined) updates.bg = bg

    const { data: category } = await supabase
      .from('trivia_categories')
      .update(updates)
      .eq('id', params.id)
      .select()
      .single()

    if (category) {
      await logAction(session.user.id, 'UPDATE', 'TRIVIA_CATEGORY', category.id, JSON.stringify({ action: `Updated trivia category: ${category.name_en}` }))
    }

    return NextResponse.json({
      id: category.id,
      nameEn: category.name_en,
      nameAr: category.name_ar,
      nameFr: category.name_fr,
      color: category.color,
      bg: category.bg,
      createdAt: category.created_at,
      updatedAt: category.updated_at
    })
  } catch (error) {
    console.error('Update trivia category error:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

export async function DELETE(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const session = await auth()
  
  if (!session?.user || !hasPermission(session, PERMISSIONS.TRIVIA_MANAGE)) {
    return new NextResponse('Forbidden', { status: 403 })
  }

  try {
    const { data: category } = await supabase
      .from('trivia_categories')
      .delete()
      .eq('id', params.id)
      .select()
      .single()

    if (category) {
      await logAction(session.user.id, 'DELETE', 'TRIVIA_CATEGORY', category.id, JSON.stringify({ action: `Deleted trivia category: ${category.name_en}` }))
    }

    return new NextResponse('OK', { status: 200 })
  } catch (error) {
    console.error('Delete trivia category error:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
