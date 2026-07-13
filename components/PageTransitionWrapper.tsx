'use client'

import { usePathname } from 'next/navigation'

/**
 * PageTransitionWrapper — wraps page content so it plays a
 * fade-in + slide-up animation (Option A) on every navigation.
 *
 * The `key={pathname}` trick forces React to unmount/remount the
 * wrapper div on every route change, which re-triggers the CSS
 * @keyframes animation automatically — zero JS animation logic needed.
 */
export default function PageTransitionWrapper({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  return (
    <div key={pathname} className="page-enter">
      {children}
    </div>
  )
}
