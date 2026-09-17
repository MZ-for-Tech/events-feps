/**
 * In-memory rate limiter using a sliding window counter.
 * No Redis required — suitable for a single-instance university portal.
 * Resets automatically on server restart.
 */

interface RateLimitEntry {
  count: number
  windowStart: number
}

// Outer map: key = limiter name, Inner map: key = identifier (IP/userId)
const store = new Map<string, Map<string, RateLimitEntry>>()

interface RateLimitResult {
  limited: boolean
  remaining: number
  resetInMs: number
}

/**
 * Check and increment a rate limit for the given identifier.
 *
 * @param namespace   A unique key for this rate limit rule (e.g. 'registration-post')
 * @param identifier  Usually the client IP address
 * @param maxRequests Maximum requests allowed in the window
 * @param windowMs    Window duration in milliseconds
 */
export function rateLimit(
  namespace: string,
  identifier: string,
  maxRequests: number,
  windowMs: number
): RateLimitResult {
  if (!store.has(namespace)) {
    store.set(namespace, new Map())
  }

  const nsStore = store.get(namespace)!
  const now = Date.now()

  const entry = nsStore.get(identifier)

  if (!entry || now - entry.windowStart > windowMs) {
    // New window
    nsStore.set(identifier, { count: 1, windowStart: now })
    return { limited: false, remaining: maxRequests - 1, resetInMs: windowMs }
  }

  entry.count++

  if (entry.count > maxRequests) {
    const resetInMs = windowMs - (now - entry.windowStart)
    return { limited: true, remaining: 0, resetInMs }
  }

  return {
    limited: false,
    remaining: maxRequests - entry.count,
    resetInMs: windowMs - (now - entry.windowStart),
  }
}

// ─── Pre-configured limiters ──────────────────────────────────────────────────

/**
 * Public read endpoints (events list, categories, trivia).
 * 60 requests per minute per IP.
 */
export function publicApiLimiter(ip: string): RateLimitResult {
  return rateLimit('public-api', ip, 60, 60_000)
}

/**
 * Public submission endpoints (registration, survey).
 * 5 submissions per minute per IP — aggressive to stop spam.
 */
export function submissionLimiter(ip: string): RateLimitResult {
  return rateLimit('submission', ip, 5, 60_000)
}

/**
 * Authentication endpoint.
 * 10 attempts per minute per IP.
 */
export function authLimiter(ip: string): RateLimitResult {
  return rateLimit('auth', ip, 10, 60_000)
}

/**
 * Extract client IP from a Next.js Request object.
 * Falls back to '127.0.0.1' for local dev.
 */
export function getClientIp(req: Request): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    '127.0.0.1'
  )
}

/**
 * Build a 429 Too Many Requests response.
 */
export function rateLimitResponse(resetInMs: number): Response {
  return new Response('Too Many Requests', {
    status: 429,
    headers: {
      'Retry-After': String(Math.ceil(resetInMs / 1000)),
      'X-RateLimit-Limit': '0',
    },
  })
}
