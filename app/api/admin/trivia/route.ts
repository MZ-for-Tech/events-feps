import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { hasPermission, PERMISSIONS } from '@/lib/permissions'
import { translate } from 'google-translate-api-x'
import { logAction } from '@/lib/logger'

export async function GET() {
  const session = await auth()
  
  if (!session?.user || !hasPermission(session, PERMISSIONS.TRIVIA_MANAGE)) {
    return new NextResponse('Forbidden', { status: 403 })
  }

  try {
    const questions = await prisma.triviaQuestion.findMany({
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json(questions)
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
    if (!baseText || !data.options) {
      return new NextResponse('Missing required fields', { status: 400 })
    }

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

    const question = await prisma.triviaQuestion.create({
      data: {
        textEn: textEn || '',
        textAr: textAr || '',
        textFr: textFr || '',
        categoryId: data.categoryId || null,
        options: data.options,
        explanation: explanationEn || null,
        explanationAr: explanationAr || null,
        explanationFr: explanationFr || null,
      }
    })

    await logAction(session.user.id, 'CREATE', 'TRIVIA', question.id, JSON.stringify({ action: `Created trivia question: ${question.textEn}` }))

    return NextResponse.json(question)
  } catch (error) {
    console.error('Create trivia error:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
