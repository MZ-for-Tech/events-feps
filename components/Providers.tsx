'use client'
import { SessionProvider } from 'next-auth/react'
import PageCurtain from './PageCurtain'

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <PageCurtain />
      {children}
    </SessionProvider>
  )
}
