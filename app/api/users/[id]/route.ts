import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
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

  const { data: targetUser } = await supabase.from('users').select('role').eq('id', id).single()
  if (!targetUser) return new NextResponse('Not Found', { status: 404 })
  if (targetUser.role === 'SUPERADMIN' && session.user.role !== 'SUPERADMIN') {
    return new NextResponse('Forbidden to modify SuperAdmin', { status: 403 })
  }

  try {
    const body = await req.json()
    const parsed = UserUpdateSchema.safeParse(body)
    if (!parsed.success) return new NextResponse(formatZodError(parsed.error), { status: 400 })

    const { name, email, password, role, permissions } = parsed.data

    const updateData: Record<string, unknown> = {
      name:        name        ?? undefined,
      email:       email       ?? undefined,
      role:        role        ?? undefined,
      permissions: permissions ? JSON.stringify(permissions) : undefined,
    }

    if (password) {
      updateData.password = await bcrypt.hash(password, 12)
    }

    // Remove undefined keys
    const clean = Object.fromEntries(Object.entries(updateData).filter(([, v]) => v !== undefined))

    const { data: updated, error } = await supabase
      .from('users')
      .update(clean)
      .eq('id', id)
      .select('id, name, email, role, permissions')
      .single()

    if (error) throw error

    await logAction(session.user.id, 'USER_UPDATED', 'USER', id, JSON.stringify({ action: 'Updated user details' }))
    return NextResponse.json({
      id: updated.id, name: updated.name, email: updated.email, role: updated.role,
      permissions: updated.permissions ? JSON.parse(updated.permissions) : [],
    })
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
  if (session.user.id === id) return new NextResponse('Cannot delete yourself', { status: 400 })

  try {
    const { data: targetUser } = await supabase.from('users').select('role').eq('id', id).single()
    if (targetUser?.role === 'SUPERADMIN') return new NextResponse('Forbidden to delete SuperAdmin', { status: 403 })

    const { error } = await supabase.from('users').delete().eq('id', id)
    if (error) throw error

    await logAction(session.user.id, 'USER_DELETED', 'USER', id, JSON.stringify({ action: 'Deleted user' }))
    return new NextResponse(null, { status: 204 })
  } catch {
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
