import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { hasPermission, PERMISSIONS } from '@/lib/permissions'
import { translate } from 'google-translate-api-x'
import { logAction } from '@/lib/logger'

export async function GET() {
  const session = await auth()
  if (!session?.user || !hasPermission(session, PERMISSIONS.TRIVIA_MANAGE)) {
    return new NextResponse('Forbidden', { status: 403 })
  }

  try {
    const { data: questions, error } = await supabase
      .from('trivia_questions')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    const mapped = (questions ?? []).map(q => ({
      id: q.id, categoryId: q.category_id,
      textEn: q.text_en, textAr: q.text_ar, textFr: q.text_fr,
      options: q.options,
      explanation: q.explanation, explanationAr: q.explanation_ar, explanationFr: q.explanation_fr,
      createdAt: q.created_at,
    }))
    return NextResponse.json(mapped)
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
    const data = await req.json()
    const baseText = data.textEn || data.textAr || data.textFr
    if (!baseText || !data.options) return new NextResponse('Missing required fields', { status: 400 })

    let textEn = data.textEn
    let textAr = data.textAr
    let textFr = data.textFr

    if (!textEn) { try { textEn = ((await translate(baseText, { to: 'en' })) as { text: string }).text } catch (e) { console.error(e) } }
    if (!textAr) { try { textAr = ((await translate(baseText, { to: 'ar' })) as { text: string }).text } catch (e) { console.error(e) } }
    if (!textFr) { try { textFr = ((await translate(baseText, { to: 'fr' })) as { text: string }).text } catch (e) { console.error(e) } }

    let explanationEn = data.explanation
    let explanationAr = data.explanationAr
    let explanationFr = data.explanationFr

    const baseExp = explanationEn || explanationAr || explanationFr
    if (baseExp) {
      if (!explanationEn) { try { explanationEn = ((await translate(baseExp, { to: 'en' })) as { text: string }).text } catch (e) { console.error(e) } }
      if (!explanationAr) { try { explanationAr = ((await translate(baseExp, { to: 'ar' })) as { text: string }).text } catch (e) { console.error(e) } }
      if (!explanationFr) { try { explanationFr = ((await translate(baseExp, { to: 'fr' })) as { text: string }).text } catch (e) { console.error(e) } }
    }

    const { data: question, error } = await supabase
      .from('trivia_questions')
      .insert({
        text_en:        textEn || '',
        text_ar:        textAr || '',
        text_fr:        textFr || '',
        category_id:    data.categoryId || null,
        options:        data.options,
        explanation:    explanationEn || null,
        explanation_ar: explanationAr || null,
        explanation_fr: explanationFr || null,
      })
      .select()
      .single()

    if (error) throw error

    await logAction(session.user.id, 'CREATE', 'TRIVIA', question.id, JSON.stringify({ action: `Created trivia question: ${question.text_en}` }))
    return NextResponse.json({
      id: question.id, categoryId: question.category_id,
      textEn: question.text_en, textAr: question.text_ar, textFr: question.text_fr,
      options: question.options,
    })
  } catch (error) {
    console.error('Create trivia error:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
