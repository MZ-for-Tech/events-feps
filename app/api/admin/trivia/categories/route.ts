import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { hasPermission, PERMISSIONS } from '@/lib/permissions'
import { logAction } from '@/lib/logger'
import { TriviaCategoryCreateSchema, formatZodError } from '@/lib/validators'

export async function GET() {
  const session = await auth()
  
  if (!session?.user || !hasPermission(session, PERMISSIONS.TRIVIA_MANAGE)) {
    return new NextResponse('Forbidden', { status: 403 })
  }

  try {
    const { data: rawCategories } = await supabase
      .from('trivia_categories')
      .select('*')
      .order('created_at', { ascending: false })

    const { count } = await supabase
      .from('trivia_questions')
      .select('*', { count: 'exact', head: true })
      .is('category_id', null)

    const categories = (rawCategories ?? []).map(c => ({
      id: c.id,
      nameEn: c.name_en,
      nameAr: c.name_ar,
      nameFr: c.name_fr,
      color: c.color,
      bg: c.bg,
      createdAt: c.created_at,
      updatedAt: c.updated_at
    }))
    
    const uncategorizedCount = count ?? 0

    const result = [...categories]

    if (uncategorizedCount > 0) {
      result.push({
        id: 'uncategorized',
        nameEn: 'FEPS Knowledge',
        nameAr: 'معلومات الكلية',
        nameFr: 'Connaissances FEPS',
        color: '#102649',
        bg: '#f8f9fa',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
    }

    return NextResponse.json(result)
  } catch {
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const session = await auth()
  
  if (!session?.user || !hasPermission(session, PERMISSIONS.TRIVIA_MANAGE)) {
    return new NextResponse('Forbidden', { status: 403 })
  }

  try {
    const body = await req.json()

    const parsed = TriviaCategoryCreateSchema.safeParse(body)
    if (!parsed.success) {
      return new NextResponse(formatZodError(parsed.error), { status: 400 })
    }

    const { nameEn, nameAr, nameFr, color, bg } = parsed.data

    const { data: category } = await supabase
      .from('trivia_categories')
      .insert({
        name_en: nameEn,
        name_ar: nameAr,
        name_fr: nameFr,
        color,
        bg
      })
      .select()
      .single()

    if (category) {
      await logAction(session.user.id, 'CREATE', 'TRIVIA_CATEGORY', category.id, JSON.stringify({ action: `Created trivia category: ${category.name_en}` }))
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
    console.error('Create trivia category error:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
