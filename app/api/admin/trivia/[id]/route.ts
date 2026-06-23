import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { hasPermission, PERMISSIONS } from '@/lib/permissions'
import { logAction } from '@/lib/logger'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  const { id } = await params
  
  if (!session?.user || !hasPermission(session, PERMISSIONS.TRIVIA_MANAGE)) {
    return new NextResponse('Forbidden', { status: 403 })
  }

  try {
    const data = await req.json()
    
    if (!data.textEn || !data.textAr || !data.textFr || !data.options) {
      return new NextResponse('Missing required fields', { status: 400 })
    }

    const question = await prisma.triviaQuestion.update({
      where: { id },
      data: {
        textEn: data.textEn,
        textAr: data.textAr,
        textFr: data.textFr,
        options: data.options,
        explanation: data.explanation || null,
        explanationAr: data.explanationAr || null,
        explanationFr: data.explanationFr || null,
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
