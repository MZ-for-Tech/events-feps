import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import path from 'path'

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

    const mimeType = file.type
    if (!ALLOWED_MIME_TYPES[mimeType]) {
      return NextResponse.json(
        { error: `File type "${mimeType}" is not allowed. Allowed types: JPEG, PNG, GIF, WebP, PDF, DOC, DOCX.` },
        { status: 400 }
      )
    }

    const maxSize = IMAGE_MIME_TYPES.has(mimeType) ? MAX_IMAGE_SIZE : MAX_DOC_SIZE
    if (file.size > maxSize) {
      const limitMb = maxSize / 1024 / 1024
      return NextResponse.json(
        { error: `File is too large. Maximum allowed size is ${limitMb}MB.` },
        { status: 400 }
      )
    }

    const rawExt = file.name ? path.extname(file.name).toLowerCase() : ''
    const safeType = sanitizeFilename(type).slice(0, 20)
    const safeFilename = `${Date.now()}-${safeType}${rawExt}`

    const buffer = Buffer.from(await file.arrayBuffer())

    // Upload to Supabase Storage
    const { data, error } = await supabase
      .storage
      .from('events')
      .upload(safeFilename, buffer, {
        contentType: mimeType,
        upsert: false
      })

    if (error) {
      console.error('Supabase upload error:', error)
      return NextResponse.json({ error: 'Failed to upload file to storage.' }, { status: 500 })
    }

    // Get public URL
    const { data: publicUrlData } = supabase
      .storage
      .from('events')
      .getPublicUrl(safeFilename)

    return NextResponse.json({ url: publicUrlData.publicUrl }, { status: 201 })
  } catch (error) {
    console.error('Event file upload error:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
