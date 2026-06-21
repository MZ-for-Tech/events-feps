import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { hasPermission, PERMISSIONS } from '@/lib/permissions'
import { logAction } from '@/lib/logger'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  
  if (!session?.user || !hasPermission(session, PERMISSIONS.CATEGORIES_MANAGE)) {
    return new NextResponse('Forbidden', { status: 403 })
  }

  const { id } = await params

  try {
    const data = await req.json()
    
    const category = await prisma.eventCategory.update({
      where: { id },
      data: {
        nameEn: data.nameEn !== undefined ? data.nameEn : undefined,
        nameAr: data.nameAr !== undefined ? data.nameAr : undefined,
        nameFr: data.nameFr !== undefined ? data.nameFr : undefined,
        color: data.color !== undefined ? data.color : undefined,
        bg: data.bg !== undefined ? data.bg : undefined,
      }
    })

    await logAction(session.user.id, 'CATEGORY_UPDATED', 'CATEGORY', category.id, JSON.stringify({ action: `Updated category: ${category.nameEn}` }))

    return NextResponse.json(category)
  } catch {
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  
  if (!session?.user || !hasPermission(session, PERMISSIONS.CATEGORIES_MANAGE)) {
    return new NextResponse('Forbidden', { status: 403 })
  }

  const { id } = await params

  try {
    // Check if category is used
    const eventsWithCategory = await prisma.event.count({ where: { categoryId: id } })
    if (eventsWithCategory > 0) {
      return new NextResponse('Cannot delete category that is assigned to events.', { status: 400 })
    }

    await prisma.eventCategory.delete({ where: { id } })
    await logAction(session.user.id, 'CATEGORY_DELETED', 'CATEGORY', id, JSON.stringify({ action: 'Deleted category' }))

    return new NextResponse(null, { status: 204 })
  } catch {
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
