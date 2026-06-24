import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { hasPermission, PERMISSIONS } from '@/lib/permissions'
import { logAction } from '@/lib/logger'

export async function PATCH(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const session = await auth()
  
  if (!session?.user || !hasPermission(session, PERMISSIONS.TRIVIA_MANAGE)) {
    return new NextResponse('Forbidden', { status: 403 })
  }

  try {
    const data = await req.json()
    
    if (!data.nameEn || !data.nameAr || !data.nameFr) {
      return new NextResponse('Missing required fields', { status: 400 })
    }

    const category = await prisma.triviaCategory.update({
      where: { id: params.id },
      data: {
        nameEn: data.nameEn,
        nameAr: data.nameAr,
        nameFr: data.nameFr,
        color: data.color || '#1A3A6E',
        bg: data.bg || 'rgba(26,58,110,0.12)'
      }
    })

    await logAction(session.user.id, 'UPDATE', 'TRIVIA_CATEGORY', category.id, JSON.stringify({ action: `Updated trivia category: ${category.nameEn}` }))

    return NextResponse.json(category)
  } catch (error) {
    console.error('Update trivia category error:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

export async function DELETE(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const session = await auth()
  
  if (!session?.user || !hasPermission(session, PERMISSIONS.TRIVIA_MANAGE)) {
    return new NextResponse('Forbidden', { status: 403 })
  }

  try {
    const category = await prisma.triviaCategory.delete({
      where: { id: params.id }
    })

    await logAction(session.user.id, 'DELETE', 'TRIVIA_CATEGORY', category.id, JSON.stringify({ action: `Deleted trivia category: ${category.nameEn}` }))

    return new NextResponse('OK', { status: 200 })
  } catch (error) {
    console.error('Delete trivia category error:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
