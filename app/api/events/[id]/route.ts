import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const event = await prisma.event.findUnique({ where: { id } })
    if (!event) return new NextResponse('Not Found', { status: 404 })
    // Public can see published; admins can see drafts too
    return NextResponse.json(event)
  } catch {
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) {
    return new NextResponse('Unauthorized', { status: 401 })
  }
  const { id } = await params
  try {
    const data = await req.json()
    const updated = await prisma.event.update({
      where: { id },
      data: {
        title: data.title,
        titleAr: data.titleAr ?? null,
        type: data.type,
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        endDate: data.endDate ? new Date(data.endDate) : null,
        location: data.location ?? null,
        description: data.description ?? null,
        agendaText: data.agendaText ?? null,
        agendaFile: data.agendaFile ?? undefined,
        imageUrl: data.imageUrl ?? undefined,
        published: data.published ?? undefined,
      },
    })
    return NextResponse.json(updated)
  } catch {
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) {
    return new NextResponse('Unauthorized', { status: 401 })
  }
  const { id } = await params
  try {
    await prisma.event.delete({ where: { id } })
    return new NextResponse(null, { status: 204 })
  } catch {
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
