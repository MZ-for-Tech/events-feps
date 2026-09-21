import { supabase } from '@/lib/supabase'

export async function logAction(
  userId: string | undefined,
  action: string,
  entityType?: string,
  entityId?: string,
  details?: string
) {
  try {
    await supabase.from('audit_logs').insert({
      action,
      user_id: userId ?? null,
      entity_type: entityType ?? null,
      entity_id: entityId ?? null,
      details: details ?? null,
    })
  } catch (error) {
    console.error('Failed to write audit log:', error)
  }
}
