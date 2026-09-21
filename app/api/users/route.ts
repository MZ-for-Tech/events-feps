import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { hasPermission, PERMISSIONS } from '@/lib/permissions'
import bcrypt from 'bcryptjs'
import { logAction } from '@/lib/logger'
import { UserCreateSchema, formatZodError } from '@/lib/validators'

export async function GET() {
  const session = await auth()
  if (!session?.user || !hasPermission(session, PERMISSIONS.USERS_MANAGE)) {
    return new NextResponse('Forbidden', { status: 403 })
  }

  try {
    const { data: users, error } = await supabase
      .from('users')
      .select('id, name, email, role, permissions, created_at')
      .order('created_at', { ascending: false })

    if (error) throw error

    const mapped = (users ?? []).map(u => ({
      id: u.id, name: u.name, email: u.email, role: u.role,
      permissions: u.permissions ? JSON.parse(u.permissions) : [],
      createdAt: u.created_at,
    }))
    return NextResponse.json(mapped)
  } catch {
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user || !hasPermission(session, PERMISSIONS.USERS_MANAGE)) {
    return new NextResponse('Forbidden', { status: 403 })
  }

  try {
    const body = await req.json()
    const parsed = UserCreateSchema.safeParse(body)
    if (!parsed.success) return new NextResponse(formatZodError(parsed.error), { status: 400 })

    const { name, email, password, role, permissions } = parsed.data

    const { data: exists } = await supabase.from('users').select('id').eq('email', email).single()
    if (exists) return new NextResponse('User already exists', { status: 400 })

    const hashedPassword = await bcrypt.hash(password, 12)

    const { data: user, error } = await supabase
      .from('users')
      .insert({ name, email, password: hashedPassword, role, permissions: JSON.stringify(permissions) })
      .select('id, name, email, role, permissions')
      .single()

    if (error) throw error

    await logAction(session.user.id, 'USER_CREATED', 'USER', user.id, JSON.stringify({ email: user.email, role: user.role }))
    return NextResponse.json({ id: user.id, name: user.name, email: user.email, role: user.role, permissions: JSON.parse(user.permissions || '[]') }, { status: 201 })
  } catch {
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
