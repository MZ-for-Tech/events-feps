import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const categoryId = url.searchParams.get('categoryId')

    let query = supabase.from('trivia_questions').select('*')

    if (categoryId === 'uncategorized') {
      query = query.is('category_id', null)
    } else if (categoryId) {
      query = query.eq('category_id', categoryId)
    }

    const { data: questions, error } = await query
    if (error) throw error
    if (!questions || questions.length === 0) return NextResponse.json([])

    // Shuffle and pick 5
    const shuffled = [...questions].sort(() => 0.5 - Math.random())
    const selected = shuffled.slice(0, Math.min(5, questions.length))

    const mapped = selected.map(q => ({
      id: q.id,
      categoryId: q.category_id,
      textEn: q.text_en,
      textAr: q.text_ar,
      textFr: q.text_fr,
      options: q.options,
      explanation: q.explanation,
      explanationAr: q.explanation_ar,
      explanationFr: q.explanation_fr,
      createdAt: q.created_at,
    }))

    return NextResponse.json(mapped)
  } catch (error) {
    console.error('Failed to fetch trivia:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
