'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'

export default function AdminActions({ materialId, courseId }: { materialId: string; courseId: string }) {
  const router = useRouter()
  const t = useTranslations('Admin')
  const [loading, setLoading] = useState<'approve' | 'reject' | null>(null)

  async function act(action: 'approve' | 'reject') {
    setLoading(action)
    await fetch(`/api/materials/${materialId}/${action}`, { method: 'POST' })
    setLoading(null)
    router.refresh()
  }

  return (
    <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
      <button
        className="btn btn-sm"
        style={{ background: 'var(--feps-green)', color: '#fff' }}
        onClick={() => act('approve')}
        disabled={loading !== null}
        aria-label="Approve material"
      >
        {loading === 'approve' ? t('approving') : t('approve')}
      </button>
      <button
        className="btn btn-sm btn-ghost"
        style={{ borderColor: 'var(--feps-crimson)', color: 'var(--feps-crimson)' }}
        onClick={() => act('reject')}
        disabled={loading !== null}
        aria-label="Reject material"
      >
        {loading === 'reject' ? t('rejecting') : t('reject')}
      </button>
    </div>
  )
}
