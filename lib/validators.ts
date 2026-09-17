/**
 * Centralized Zod validation schemas for all API routes.
 * This is the single source of truth for input validation across the app.
 */
import { z } from 'zod'

// ─── Primitives ───────────────────────────────────────────────────────────────

/** Validates a CSS hex color string like #RRGGBB or #RGB */
export const ColorHexSchema = z
  .string()
  .regex(/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/, 'Must be a valid hex color (e.g. #1A3A6E)')

/** Validates a rgba/hex/keyword CSS background value with length limit */
export const BgColorSchema = z
  .string()
  .max(100, 'Background color string too long')

/** Validates a CUID (Prisma default IDs) */
export const CuidSchema = z.string().cuid('Must be a valid ID')

/** Allowed user roles */
export const RoleSchema = z.enum(['EDITOR', 'MANAGER', 'SUPERADMIN'])

/** Allowed permission strings */
export const PermissionSchema = z.enum([
  'events:create',
  'events:publish',
  'events:delete',
  'events:reports',
  'users:manage',
  'categories:manage',
  'logs:view',
  'trivia:manage',
])

// ─── Event Categories ─────────────────────────────────────────────────────────

export const EventCategoryCreateSchema = z.object({
  nameEn: z.string().min(1).max(100).optional(),
  nameAr: z.string().min(1).max(100).optional(),
  nameFr: z.string().min(1).max(100).optional(),
  color: ColorHexSchema.optional().default('#1A3A6E'),
  bg: BgColorSchema.optional().default('rgba(26,58,110,0.12)'),
}).refine(d => d.nameEn || d.nameAr || d.nameFr, {
  message: 'At least one name (EN, AR, or FR) is required',
})

export const EventCategoryUpdateSchema = z.object({
  nameEn: z.string().min(1).max(100).optional(),
  nameAr: z.string().min(1).max(100).optional(),
  nameFr: z.string().min(1).max(100).optional(),
  color: ColorHexSchema.optional(),
  bg: BgColorSchema.optional(),
})

// ─── Trivia Categories ────────────────────────────────────────────────────────

export const TriviaCategoryCreateSchema = z.object({
  nameEn: z.string().min(1, 'English name is required').max(100),
  nameAr: z.string().min(1, 'Arabic name is required').max(100),
  nameFr: z.string().min(1, 'French name is required').max(100),
  color: ColorHexSchema.optional().default('#1A3A6E'),
  bg: BgColorSchema.optional().default('rgba(26,58,110,0.12)'),
})

export const TriviaCategoryUpdateSchema = z.object({
  nameEn: z.string().min(1).max(100),
  nameAr: z.string().min(1).max(100),
  nameFr: z.string().min(1).max(100),
  color: ColorHexSchema.optional(),
  bg: BgColorSchema.optional(),
})

// ─── Registration ─────────────────────────────────────────────────────────────

export const RegistrationCreateSchema = z.object({
  identifier: z
    .string()
    .min(7, 'Identifier must be at least 7 digits')
    .max(14, 'Identifier must be at most 14 digits')
    .regex(/^\d+$/, 'Identifier must contain digits only'),
  email: z
    .string()
    .email('Must be a valid email address')
    .max(254, 'Email address too long'),
  name: z
    .string()
    .max(100, 'Name too long')
    .optional()
    .nullable(),
})

// ─── Survey ───────────────────────────────────────────────────────────────────

const MAX_SURVEY_BYTES = 50_000 // 50 KB

export const SurveyResponseSchema = z.object({
  registrationId: CuidSchema.optional().nullable(),
  answers: z.union([
    z.string().max(MAX_SURVEY_BYTES, 'Survey answer payload is too large'),
    z.record(z.string(), z.unknown()),
  ]),
})

// ─── Users ────────────────────────────────────────────────────────────────────

export const UserCreateSchema = z.object({
  name: z.string().min(2, 'Name is too short').max(100),
  email: z.string().email('Must be a valid email').max(254),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password is too long'),
  role: RoleSchema.optional().default('EDITOR'),
  permissions: z.array(PermissionSchema).optional().default([]),
})

export const UserUpdateSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  email: z.string().email().max(254).optional(),
  password: z.string().min(8).max(128).optional(),
  role: RoleSchema.optional(),
  permissions: z.array(PermissionSchema).optional(),
})

// ─── Query params ─────────────────────────────────────────────────────────────

export const EventsQuerySchema = z.object({
  month: z
    .string()
    .regex(/^\d+$/)
    .transform(Number)
    .pipe(z.number().int().min(1).max(12))
    .optional(),
  year: z
    .string()
    .regex(/^\d+$/)
    .transform(Number)
    .pipe(z.number().int().min(2000).max(2100))
    .optional(),
})

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Formats a Zod error into a readable string.
 */
export function formatZodError(error: z.ZodError): string {
  return error.issues.map(e => `${e.path.join('.')}: ${e.message}`).join('; ')
}
