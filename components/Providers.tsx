'use client'
import { SessionProvider } from 'next-auth/react'
import PageTransitionBar from './PageTransitionBar'

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <PageTransitionBar />
      {children}
    </SessionProvider>
  )
}
