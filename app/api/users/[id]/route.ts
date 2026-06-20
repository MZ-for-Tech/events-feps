import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { hasPermission, PERMISSIONS } from '@/lib/permissions'
import bcrypt from 'bcryptjs'
import { logAction } from '@/lib/logger'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user || !hasPermission(session, PERMISSIONS.USERS_MANAGE)) {
    return new NextResponse('Forbidden', { status: 403 })
  }

  const { id } = await params
  
  // Don't allow modifying the superadmin by someone else, or a superadmin editing their own permissions to empty
  const targetUser = await prisma.user.findUnique({ where: { id } })
  if (!targetUser) return new NextResponse('Not Found', { status: 404 })
  if (targetUser.role === 'SUPERADMIN' && session.user.role !== 'SUPERADMIN') {
    return new NextResponse('Forbidden to modify SuperAdmin', { status: 403 })
  }

  try {
    const data = await req.json()
    const updateData: Record<string, unknown> = {
      name: data.name ?? undefined,
      email: data.email ?? undefined,
      role: data.role ?? undefined,
      permissions: data.permissions ? JSON.stringify(data.permissions) : undefined
    }

    if (data.password) {
      updateData.password = await bcrypt.hash(data.password, 10)
    }

    const updated = await prisma.user.update({
      where: { id },
      data: updateData,
      select: { id: true, name: true, email: true, role: true, permissions: true }
    })

    await logAction(session.user.id, 'USER_UPDATED', 'USER', id, JSON.stringify({ action: 'Updated user details' }))

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
  if (!session?.user || !hasPermission(session, PERMISSIONS.USERS_MANAGE)) {
    return new NextResponse('Forbidden', { status: 403 })
  }

  const { id } = await params
  if (session.user.id === id) {
    return new NextResponse('Cannot delete yourself', { status: 400 })
  }

  try {
    const targetUser = await prisma.user.findUnique({ where: { id } })
    if (targetUser?.role === 'SUPERADMIN') {
      return new NextResponse('Forbidden to delete SuperAdmin', { status: 403 })
    }

    await prisma.user.delete({ where: { id } })
    
    await logAction(session.user.id, 'USER_DELETED', 'USER', id, JSON.stringify({ action: 'Deleted user' }))

    return new NextResponse(null, { status: 204 })
  } catch {
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
