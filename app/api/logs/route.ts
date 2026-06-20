import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { hasPermission, PERMISSIONS } from '@/lib/permissions'

export async function GET() {
  const session = await auth()
  // Super Admin inherently has all permissions if handled logically, 
  // but to be safe we use the explicit hasPermission check.
  if (!session?.user || (!hasPermission(session, PERMISSIONS.LOGS_VIEW) && session.user.role !== 'SUPERADMIN')) {
    return new NextResponse('Forbidden', { status: 403 })
  }

  try {
    const logs = await prisma.auditLog.findMany({
      orderBy: { timestamp: 'desc' },
      take: 1000,
      include: {
        user: {
          select: { name: true, email: true, role: true }
        }
      }
    })

    return NextResponse.json(logs)
  } catch {
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  try {
    const data = await req.json()
    if (data.action === 'PAGE_VIEW') {
      await prisma.auditLog.create({
        data: {
          action: 'PAGE_VIEW',
          userId: session.user.id,
          entityType: 'SYSTEM',
          details: JSON.stringify({ path: data.details })
        }
      })
      return new NextResponse(null, { status: 204 })
    }
    return new NextResponse('Invalid action', { status: 400 })
  } catch {
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
