import { NextRequest, NextResponse } from 'next/server'
import path from 'path'
import fs from 'fs'

// Only characters safe for filenames: alphanumerics, dash, underscore, dot
const SAFE_FILENAME_RE = /^[a-zA-Z0-9_.-]+$/

const ALLOWED_EXTENSIONS: Record<string, string> = {
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png':  'image/png',
  '.gif':  'image/gif',
  '.webp': 'image/webp',
  '.svg':  'image/svg+xml',
  '.pdf':  'application/pdf',
  '.doc':  'application/msword',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  const { filename } = await params

  // ── 1. Block path traversal attempts ──────────────────────────────────────
  // Reject anything that isn't a clean alphanumeric filename
  if (!SAFE_FILENAME_RE.test(filename)) {
    return new NextResponse('Invalid filename', { status: 400 })
  }

  // Extra guard: no double-dots, no slashes even after decoding
  const decoded = decodeURIComponent(filename)
  if (decoded.includes('..') || decoded.includes('/') || decoded.includes('\\')) {
    return new NextResponse('Invalid filename', { status: 400 })
  }

  // ── 2. Validate extension ──────────────────────────────────────────────────
  const ext = path.extname(filename).toLowerCase()
  const contentType = ALLOWED_EXTENSIONS[ext]
  if (!contentType) {
    return new NextResponse('File type not served', { status: 400 })
  }

  // ── 3. Resolve path and ensure it stays inside /public/events ─────────────
  const uploadDir = path.resolve(process.cwd(), 'public', 'events')
  const filePath  = path.resolve(uploadDir, filename)

  if (!filePath.startsWith(uploadDir)) {
    return new NextResponse('Invalid file path', { status: 400 })
  }

  if (!fs.existsSync(filePath)) {
    return new NextResponse('File Not Found', { status: 404 })
  }

  try {
    const fileBuffer = fs.readFileSync(filePath)
    const isImage = contentType.startsWith('image/')

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        // Images: inline display; documents: force download
        'Content-Disposition': isImage ? 'inline' : `attachment; filename="${encodeURIComponent(filename)}"`,
        'Cache-Control': 'public, max-age=31536000, immutable',
        // Prevent SVG-based XSS
        ...(ext === '.svg' ? { 'Content-Security-Policy': "default-src 'none'" } : {}),
      },
    })
  } catch (error) {
    console.error('Error serving file:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
