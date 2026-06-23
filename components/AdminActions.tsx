'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import toast from 'react-hot-toast'

export default function AdminActions({ materialId }: { materialId: string }) {
  const router = useRouter()
  const t = useTranslations('Admin')
  const [isPending, startTransition] = useTransition()

  function act(action: 'approve' | 'reject') {
    startTransition(async () => {
      try {
        const res = await fetch(`/api/materials/${materialId}/${action}`, { method: 'POST' })
        if (res.ok) {
          toast.success(action === 'approve' ? 'Material approved' : 'Material rejected')
          router.refresh()
        } else {
          toast.error(action === 'approve' ? 'Failed to approve' : 'Failed to reject')
        }
      } catch (err) {
        console.error(err)
        toast.error('Network error')
      }
    })
  }

  return (
    <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
      <button
        className="btn btn-sm"
        style={{ background: 'var(--feps-green)', color: '#fff' }}
        onClick={() => act('approve')}
        disabled={isPending}
        aria-label="Approve material"
      >
        {t('approve')}
      </button>
      <button
        className="btn btn-sm btn-ghost"
        style={{ borderColor: 'var(--feps-crimson)', color: 'var(--feps-crimson)' }}
        onClick={() => act('reject')}
        disabled={isPending}
        aria-label="Reject material"
      >
        {t('reject')}
      </button>
    </div>
  )
}
