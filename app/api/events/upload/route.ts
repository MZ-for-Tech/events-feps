import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import path from 'path'
import fs from 'fs'

// ─── Allowed file types ───────────────────────────────────────────────────────

const ALLOWED_MIME_TYPES: Record<string, string[]> = {
  'image/jpeg':    ['.jpg', '.jpeg'],
  'image/png':     ['.png'],
  'image/gif':     ['.gif'],
  'image/webp':    ['.webp'],
  'application/pdf': ['.pdf'],
  'application/msword': ['.doc'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
}

const IMAGE_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/gif', 'image/webp'])

const MAX_IMAGE_SIZE = 10 * 1024 * 1024   // 10 MB
const MAX_DOC_SIZE   = 20 * 1024 * 1024   // 20 MB

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Strip path traversal characters from a filename */
function sanitizeFilename(name: string): string {
  return path.basename(name).replace(/[^a-zA-Z0-9._-]/g, '_')
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const type = (formData.get('type') as string | null) || 'image'

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // ── 1. Validate MIME type ──────────────────────────────────────────────
    const mimeType = file.type
    if (!ALLOWED_MIME_TYPES[mimeType]) {
      return NextResponse.json(
        { error: `File type "${mimeType}" is not allowed. Allowed types: JPEG, PNG, GIF, WebP, PDF, DOC, DOCX.` },
        { status: 400 }
      )
    }

    // ── 2. Validate file size ──────────────────────────────────────────────
    const maxSize = IMAGE_MIME_TYPES.has(mimeType) ? MAX_IMAGE_SIZE : MAX_DOC_SIZE
    if (file.size > maxSize) {
      const limitMb = maxSize / 1024 / 1024
      return NextResponse.json(
        { error: `File is too large. Maximum allowed size is ${limitMb}MB.` },
        { status: 400 }
      )
    }

    // ── 3. Validate extension matches MIME (anti-spoofing) ────────────────
    const rawExt  = path.extname(file.name).toLowerCase()
    const allowedExts = ALLOWED_MIME_TYPES[mimeType]
    if (!allowedExts.includes(rawExt)) {
      return NextResponse.json(
        { error: `File extension "${rawExt}" does not match the declared file type "${mimeType}".` },
        { status: 400 }
      )
    }

    // ── 4. Build a safe filename ───────────────────────────────────────────
    const safeExt      = rawExt
    const safeType     = sanitizeFilename(type).slice(0, 20)
    const safeFilename = `${Date.now()}-${safeType}${safeExt}`

    // ── 5. Resolve upload path (no directory traversal possible) ──────────
    const uploadDir = path.join(process.cwd(), 'public', 'events')
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true })

    const fullPath = path.resolve(uploadDir, safeFilename)
    // Ensure the resolved path stays inside uploadDir
    if (!fullPath.startsWith(path.resolve(uploadDir))) {
      return NextResponse.json({ error: 'Invalid file path' }, { status: 400 })
    }

    // ── 6. Write file ──────────────────────────────────────────────────────
    const buffer = Buffer.from(await file.arrayBuffer())
    fs.writeFileSync(fullPath, buffer)

    const publicUrl = `/api/events/files/${safeFilename}`
    return NextResponse.json({ url: publicUrl }, { status: 201 })
  } catch (error) {
    console.error('Event file upload error:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
