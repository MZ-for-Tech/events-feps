import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { hasPermission, PERMISSIONS } from '@/lib/permissions'
import { logAction } from '@/lib/logger'

export async function GET() {
  try {
    const categories = await prisma.eventCategory.findMany()
    return NextResponse.json(categories)
  } catch {
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const session = await auth()
  
  if (!session?.user || !hasPermission(session, PERMISSIONS.CATEGORIES_MANAGE)) {
    return new NextResponse('Forbidden', { status: 403 })
  }

  try {
    const data = await req.json()
    
    if (!data.nameEn || !data.nameAr || !data.nameFr) {
      return new NextResponse('Missing required fields', { status: 400 })
    }

    const category = await prisma.eventCategory.create({
      data: {
        nameEn: data.nameEn,
        nameAr: data.nameAr,
        nameFr: data.nameFr,
        color: data.color || '#1A3A6E',
        bg: data.bg || 'rgba(26,58,110,0.12)'
      }
    })

    await logAction(session.user.id, 'CATEGORY_CREATED', 'CATEGORY', category.id, JSON.stringify({ action: `Created category: ${category.nameEn}` }))

    return NextResponse.json(category)
  } catch {
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
