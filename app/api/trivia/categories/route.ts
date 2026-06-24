import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const categories = await prisma.triviaCategory.findMany({
      include: {
        _count: {
          select: { questions: true }
        }
      },
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
        color: '#102649', // feps-navy-dark
        bg: '#f8f9fa',
        _count: { questions: uncategorizedCount },
        createdAt: new Date()
      })
    }
    
    return NextResponse.json(result)
  } catch (error) {
    console.error('Failed to fetch trivia categories:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
