import type { Role } from '@/lib/types'

export const ROLE_LABELS: Record<Role, { en: string; ar: string }> = {
  EDITOR:     { en: 'Editor',       ar: 'محرر'      },
  MANAGER:    { en: 'Manager',      ar: 'مدير'       },
  SUPERADMIN: { en: 'Super Admin',  ar: 'مسؤول عام' },
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
  })
}
