import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { hasPermission, PERMISSIONS } from '@/lib/permissions'
import bcrypt from 'bcryptjs'
import { logAction } from '@/lib/logger'
import { UserUpdateSchema, formatZodError } from '@/lib/validators'

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
    const body = await req.json()

    // Validate with Zod — whitelists role and permission values
    const parsed = UserUpdateSchema.safeParse(body)
    if (!parsed.success) {
      return new NextResponse(formatZodError(parsed.error), { status: 400 })
    }

    const { name, email, password, role, permissions } = parsed.data

    const updateData: Record<string, unknown> = {
      name:        name        ?? undefined,
      email:       email       ?? undefined,
      role:        role        ?? undefined,
      permissions: permissions ? JSON.stringify(permissions) : undefined,
    }

    if (password) {
      // Use bcrypt rounds of 12 for stronger hashing
      updateData.password = await bcrypt.hash(password, 12)
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
