import createNextIntlPlugin from 'next-intl/plugin'
import withPWAInit from '@ducanh2912/next-pwa'

const withNextIntl = createNextIntlPlugin('./i18n.ts')

const withPWA = withPWAInit({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        // Apply to ALL routes
        source: '/(.*)',
        headers: [
          // Prevent clickjacking — no iframes allowed from other origins
          { key: 'X-Frame-Options', value: 'DENY' },
          // Prevent MIME-type sniffing
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          // Legacy XSS filter for older browsers
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          // Limit referrer information sent to third parties
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          // Restrict browser feature access
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), payment=()',
          },
          // Enforce HTTPS (only active in production)
          ...(process.env.NODE_ENV === 'production'
            ? [{ key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' }]
            : []),
          // Content Security Policy
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              // Scripts: self + inline (Next.js needs inline) + Vercel/analytics
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              // Styles: self + inline (Tailwind/CSS-in-JS) + Google Fonts
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              // Fonts: Google Fonts CDN
              "font-src 'self' https://fonts.gstatic.com",
              // Images: self + data URIs (for base64 images)
              "img-src 'self' data: blob:",
              // Fetch/XHR: self + Supabase
              "connect-src 'self' https://ullguucwgaclitfitsvy.supabase.co",
              // Frames: nothing allowed
              "frame-src 'none'",
              // Media: self only
              "media-src 'self'",
              // Objects: nothing allowed (no Flash, etc.)
              "object-src 'none'",
              // Base URI: self only (prevent base tag injection)
              "base-uri 'self'",
              // Form actions: self only
              "form-action 'self'",
            ].join('; '),
          },
        ],
      },
    ]
  },
}

export default withPWA(withNextIntl(nextConfig))
