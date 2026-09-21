import type { InvitationConfig, SavedInvitationConfig } from '@/types/invitation'

export interface InvitationBuilderProps {
  eventId: string
  eventTitle?: string
  eventLocation?: string
  eventStartDate?: string
  locale: string
  initialConfig?: SavedInvitationConfig | null
}

export type InvitationConfigUpdate = <K extends keyof InvitationConfig>(
  key: K,
  value: InvitationConfig[K],
) => void

export interface InvitationSaveResult {
  type: 'success' | 'error'
  message: string
}
