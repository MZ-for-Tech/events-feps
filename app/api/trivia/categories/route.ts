import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    const { data: categories, error } = await supabase
      .from('trivia_categories')
      .select('*, trivia_questions(count)')
      .order('created_at', { ascending: false })

    if (error) throw error

    const { count: uncategorizedCount } = await supabase
      .from('trivia_questions')
      .select('*', { count: 'exact', head: true })
      .is('category_id', null)

    const mapped = (categories ?? []).map(c => ({
      id: c.id,
      nameEn: c.name_en,
      nameAr: c.name_ar,
      nameFr: c.name_fr,
      color: c.color,
      bg: c.bg,
      createdAt: c.created_at,
      _count: { questions: Array.isArray(c.trivia_questions) ? c.trivia_questions.length : 0 },
    }))

    if ((uncategorizedCount ?? 0) > 0) {
      mapped.push({
        id: 'uncategorized',
        nameEn: 'FEPS Knowledge',
        nameAr: 'معلومات الكلية',
        nameFr: 'Connaissances FEPS',
        color: '#102649',
        bg: '#f8f9fa',
        createdAt: new Date().toISOString(),
        _count: { questions: uncategorizedCount ?? 0 },
      })
    }

    return NextResponse.json(mapped)
  } catch (error) {
    console.error('Failed to fetch trivia categories:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
