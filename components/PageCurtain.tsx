'use client'

import { usePathname } from 'next/navigation'

/**
 * PageCurtain — A white curtain that rises from the bottom on every
 * client-side navigation, covers the screen, then exits upward to
 * reveal the new page content. Pure CSS — zero JS animation logic.
 *
 * How it works:
 *   key={pathname} → React unmounts/remounts this div on every route change
 *   → the div re-enters the DOM and the CSS animation replays from scratch
 *   → Phase 1 (curtainIn):  translateY(100%) → translateY(0%)   [rises up, covers screen]
 *   → Phase 2 (curtainOut): translateY(0%)   → translateY(-100%) [exits upward, reveals page]
 */
export default function PageCurtain() {
  const pathname = usePathname()

  return (
    <div
      key={pathname}
      aria-hidden="true"
      className="page-curtain"
    />
  )
}
