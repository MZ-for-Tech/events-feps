// Shared application-level types mirrored from the Prisma schema.
// Used everywhere so we don't depend on the generated @prisma/client enums at TS compile time.

export type Role = 'EDITOR' | 'MANAGER' | 'SUPERADMIN'
