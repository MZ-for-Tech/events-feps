import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import path from 'path'
import fs from 'fs'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const type = formData.get('type') as string // 'image' | 'agenda'

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const uploadDir = path.join(process.cwd(), 'public', 'events')
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true })

    const ext = path.extname(file.name)
    const safeFilename = `${Date.now()}-${type}${ext}`
    const fullPath = path.join(uploadDir, safeFilename)

    const buffer = Buffer.from(await file.arrayBuffer())
    fs.writeFileSync(fullPath, buffer)

    // Return the public URL path
    const publicUrl = `/api/events/files/${safeFilename}`
    return NextResponse.json({ url: publicUrl }, { status: 201 })
  } catch (error) {
    console.error('Event file upload error:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
