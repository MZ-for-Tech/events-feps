import { Session } from 'next-auth'

export const PERMISSIONS = {
  EVENTS_CREATE: 'events:create',
  EVENTS_PUBLISH: 'events:publish',
  EVENTS_DELETE: 'events:delete',
  EVENTS_REPORTS: 'events:reports',
  USERS_MANAGE: 'users:manage',
  CATEGORIES_MANAGE: 'categories:manage',
  LOGS_VIEW: 'logs:view',
  TRIVIA_MANAGE: 'trivia:manage',
} as const

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS]

export function hasPermission(session: Session | null, permission: Permission): boolean {
  if (!session?.user) return false
  
  // Superadmins automatically have all permissions
  if (session.user.role === 'SUPERADMIN') return true

  const userPermissions = (session.user as { permissions?: string[] }).permissions || []
  return userPermissions.includes(permission)
}

// Available permission definitions for the UI
export const PERMISSION_DEF = [
  { id: PERMISSIONS.EVENTS_CREATE, labelAr: 'إنشاء فعاليات (كمسودة)', labelEn: 'Create Events (Drafts)' },
  { id: PERMISSIONS.EVENTS_PUBLISH, labelAr: 'نشر الفعاليات وتعديلها', labelEn: 'Publish & Edit Events' },
  { id: PERMISSIONS.EVENTS_DELETE, labelAr: 'حذف الفعاليات', labelEn: 'Delete Events' },
  { id: PERMISSIONS.EVENTS_REPORTS, labelAr: 'إدارة التقارير والاستبيانات', labelEn: 'Manage Reports & Surveys' },
  { id: PERMISSIONS.USERS_MANAGE, labelAr: 'إدارة المستخدمين', labelEn: 'Manage Users' },
  { id: PERMISSIONS.CATEGORIES_MANAGE, labelAr: 'إدارة التصنيفات', labelEn: 'Manage Categories' },
  { id: PERMISSIONS.LOGS_VIEW, labelAr: 'الاطلاع على سجل النشاطات', labelEn: 'View Audit Logs' },
  { id: PERMISSIONS.TRIVIA_MANAGE, labelAr: 'إدارة مسابقة المعلومات', labelEn: 'Manage Trivia' },
]
