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
    const categories = await prisma.triviaCategory.findMany({
      orderBy: { createdAt: 'desc' }
    })
    
    const uncategorizedCount = await prisma.triviaQuestion.count({
      where: { categoryId: null }
    })

    const result = [...categories]

    if (uncategorizedCount > 0) {
      result.push({
        id: 'uncategorized',
        nameEn: 'FEPS Knowledge',
        nameAr: 'معلومات الكلية',
        nameFr: 'Connaissances FEPS',
        color: '#102649',
        bg: '#f8f9fa',
        createdAt: new Date(),
        updatedAt: new Date()
      } as import('@prisma/client').TriviaCategory)
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
    const data = await req.json()
    
    if (!data.nameEn || !data.nameAr || !data.nameFr) {
      return new NextResponse('Missing required fields', { status: 400 })
    }

    const category = await prisma.triviaCategory.create({
      data: {
        nameEn: data.nameEn,
        nameAr: data.nameAr,
        nameFr: data.nameFr,
        color: data.color || '#1A3A6E',
        bg: data.bg || 'rgba(26,58,110,0.12)'
      }
    })

    await logAction(session.user.id, 'CREATE', 'TRIVIA_CATEGORY', category.id, JSON.stringify({ action: `Created trivia category: ${category.nameEn}` }))

    return NextResponse.json(category)
  } catch (error) {
    console.error('Create trivia category error:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
