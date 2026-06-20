import { prisma } from '@/lib/prisma'

export async function logAction(
  userId: string | undefined,
  action: string,
  entityType?: string,
  entityId?: string,
  details?: string
) {
  try {
    await prisma.auditLog.create({
      data: {
        action,
        userId,
        entityType,
        entityId,
        details
      }
    })
  } catch (error) {
    console.error('Failed to write audit log:', error)
  }
}
