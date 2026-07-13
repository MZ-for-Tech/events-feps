'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

/**
 * PageTransitionBar — a slim gold progress bar at the top of the viewport
 * that plays on every client-side navigation. No external libraries.
 */
export default function PageTransitionBar() {
  const pathname = usePathname()
  const [phase, setPhase] = useState<'idle' | 'filling' | 'done'>('idle')

  useEffect(() => {
    // Start the fill animation on every path change
    setPhase('filling')

    // After the bar finishes, trigger fade-out phase
    const fadeTimer = setTimeout(() => setPhase('done'), 480)
    // Then reset so it's ready for next navigation
    const resetTimer = setTimeout(() => setPhase('idle'), 700)

    return () => {
      clearTimeout(fadeTimer)
      clearTimeout(resetTimer)
    }
  }, [pathname])

  if (phase === 'idle') return null

  return (
    <div
      aria-hidden="true"
      className={`page-progress-bar ${phase === 'filling' ? 'filling' : 'fading'}`}
    />
  )
}
