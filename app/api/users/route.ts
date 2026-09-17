import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
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
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, permissions: true, createdAt: true },
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json(users)
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

    // Validate with Zod — enforces password min length, email format, role whitelist, permission whitelist
    const parsed = UserCreateSchema.safeParse(body)
    if (!parsed.success) {
      return new NextResponse(formatZodError(parsed.error), { status: 400 })
    }

    const { name, email, password, role, permissions } = parsed.data

    const exists = await prisma.user.findUnique({ where: { email } })
    if (exists) {
      return new NextResponse('User already exists', { status: 400 })
    }

    // Use bcrypt rounds of 12 for stronger hashing
    const hashedPassword = await bcrypt.hash(password, 12)

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        permissions: JSON.stringify(permissions)
      },
      select: { id: true, name: true, email: true, role: true, permissions: true }
    })

    await logAction(session.user.id, 'USER_CREATED', 'USER', user.id, JSON.stringify({ email: user.email, role: user.role }))

    return NextResponse.json(user, { status: 201 })
  } catch {
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
