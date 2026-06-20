import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { hasPermission, PERMISSIONS } from '@/lib/permissions'
import bcrypt from 'bcryptjs'
import { logAction } from '@/lib/logger'

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
    const data = await req.json()
    const { name, email, password, role, permissions } = data

    if (!name || !email || !password) {
      return new NextResponse('Missing required fields', { status: 400 })
    }

    const exists = await prisma.user.findUnique({ where: { email } })
    if (exists) {
      return new NextResponse('User already exists', { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role || 'EDITOR',
        permissions: permissions ? JSON.stringify(permissions) : '[]'
      },
      select: { id: true, name: true, email: true, role: true, permissions: true }
    })

    await logAction(session.user.id, 'USER_CREATED', 'USER', user.id, JSON.stringify({ email: user.email, role: user.role }))

    return NextResponse.json(user, { status: 201 })
  } catch {
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
