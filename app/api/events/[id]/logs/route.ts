import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logAction } from '@/lib/logger'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  // Anyone with access to the admin dashboard can see the event history, as agreed.
  if (!session?.user) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  const { id } = await params
  
  try {
    const logs = await prisma.auditLog.findMany({
      where: { entityId: id, entityType: 'EVENT' },
      orderBy: { timestamp: 'desc' },
      include: {
        user: { select: { name: true, email: true, role: true } }
      }
    })
    return NextResponse.json(logs)
  } catch {
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  const { id } = await params
  
  try {
    const { note } = await req.json()
    if (!note || note.trim() === '') {
      return new NextResponse('Note is required', { status: 400 })
    }

    await logAction(session.user.id, 'NOTE_ADDED', 'EVENT', id, JSON.stringify({ note: note.trim() }))

    // return the freshly created log or just success
    return new NextResponse('Created', { status: 201 })
  } catch {
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
