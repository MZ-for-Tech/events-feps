import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { hasPermission, PERMISSIONS } from '@/lib/permissions'
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
    
    if (!data.textEn || !data.textAr || !data.textFr || !data.options) {
      return new NextResponse('Missing required fields', { status: 400 })
    }

    const question = await prisma.triviaQuestion.create({
      data: {
        textEn: data.textEn,
        textAr: data.textAr,
        textFr: data.textFr,
        categoryId: data.categoryId || null,
        options: data.options,
        explanation: data.explanation || null,
        explanationAr: data.explanationAr || null,
        explanationFr: data.explanationFr || null,
      }
    })

    await logAction(session.user.id, 'CREATE', 'TRIVIA', question.id, JSON.stringify({ action: `Created trivia question: ${question.textEn}` }))

    return NextResponse.json(question)
  } catch (error) {
    console.error('Create trivia error:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
