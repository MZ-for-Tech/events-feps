import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { hasPermission, PERMISSIONS } from '@/lib/permissions'
import { translate } from 'google-translate-api-x'
import { logAction } from '@/lib/logger'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  const { id } = await params
  
  if (!session?.user || !hasPermission(session, PERMISSIONS.TRIVIA_MANAGE)) {
    return new NextResponse('Forbidden', { status: 403 })
  }

  try {
    const data = await req.json()
    
    let textEn = data.textEn
    let textAr = data.textAr
    let textFr = data.textFr

    const isUpdatingText = textEn !== undefined || textAr !== undefined || textFr !== undefined
    if (isUpdatingText) {
      const baseText = (textEn || textAr || textFr) || undefined
      if (baseText && typeof baseText === 'string') {
        if (textEn === '') { try { textEn = ((await translate(baseText, { to: 'en' })) as { text: string }).text } catch (e) { console.error(e) } }
        if (textAr === '') { try { textAr = ((await translate(baseText, { to: 'ar' })) as { text: string }).text } catch (e) { console.error(e) } }
        if (textFr === '') { try { textFr = ((await translate(baseText, { to: 'fr' })) as { text: string }).text } catch (e) { console.error(e) } }
      }
    }

    let explanationEn = data.explanation
    let explanationAr = data.explanationAr
    let explanationFr = data.explanationFr

    const isUpdatingExp = explanationEn !== undefined || explanationAr !== undefined || explanationFr !== undefined
    if (isUpdatingExp) {
      const baseExp = (explanationEn || explanationAr || explanationFr) || undefined
      if (baseExp && typeof baseExp === 'string') {
        if (explanationEn === '') { try { explanationEn = ((await translate(baseExp, { to: 'en' })) as { text: string }).text } catch (e) { console.error(e) } }
        if (explanationAr === '') { try { explanationAr = ((await translate(baseExp, { to: 'ar' })) as { text: string }).text } catch (e) { console.error(e) } }
        if (explanationFr === '') { try { explanationFr = ((await translate(baseExp, { to: 'fr' })) as { text: string }).text } catch (e) { console.error(e) } }
      }
    }

    const question = await prisma.triviaQuestion.update({
      where: { id },
      data: {
        textEn: textEn !== undefined ? textEn : undefined,
        textAr: textAr !== undefined ? textAr : undefined,
        textFr: textFr !== undefined ? textFr : undefined,
        categoryId: data.categoryId !== undefined ? data.categoryId : undefined,
        options: data.options !== undefined ? data.options : undefined,
        explanation: explanationEn !== undefined ? explanationEn : undefined,
        explanationAr: explanationAr !== undefined ? explanationAr : undefined,
        explanationFr: explanationFr !== undefined ? explanationFr : undefined,
      }
    })

    await logAction(session.user.id, 'UPDATE', 'TRIVIA', question.id, JSON.stringify({ action: `Updated trivia question: ${question.textEn}` }))

    return NextResponse.json(question)
  } catch (error) {
    console.error('Update trivia error:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  const { id } = await params
  
  if (!session?.user || !hasPermission(session, PERMISSIONS.TRIVIA_MANAGE)) {
    return new NextResponse('Forbidden', { status: 403 })
  }

  try {
    const question = await prisma.triviaQuestion.delete({
      where: { id }
    })

    await logAction(session.user.id, 'DELETE', 'TRIVIA', id, JSON.stringify({ action: `Deleted trivia question: ${question.textEn}` }))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete trivia error:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
