// Deprecated — replaced by PageCurtain.tsx overlay approach.
// The curtain now handles the transition; page content renders normally.
export default function PageTransitionWrapper({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
