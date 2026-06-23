import type { Metadata, Viewport } from 'next'
import { Amiri, Cairo } from 'next/font/google'
import '../globals.css'

const amiri = Amiri({
  subsets: ['latin', 'arabic'],
  weight: ['400', '700'],
  style: ['normal', 'italic'],
  variable: '--font-amiri',
  display: 'swap',
})

const cairo = Cairo({
  subsets: ['latin', 'arabic'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-cairo',
  display: 'swap',
})
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import Providers from '@/components/Providers'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import GuidedTour from '@/components/GuidedTour'
import { Toaster } from 'react-hot-toast'

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  title: 'FEPS Events — Faculty of Economics & Political Science',
  description: 'The official academic materials platform for FEPS, Cairo University. Access lecture slides, section notes, assignments, past papers, and datasets.',
  keywords: ['FEPS', 'Cairo University', 'economics', 'political science', 'academic materials'],
  appleWebApp: {
    title: 'FEPS Events',
    statusBarStyle: 'default',
  },
  openGraph: {
    images: ['/api/og'],
  },
}

export const viewport: Viewport = {
  themeColor: '#faf9f6',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const messages = await getMessages()

  return (
    <html lang={locale} dir="ltr" suppressHydrationWarning>
      <head>

        <link rel="icon" href="/feps-logo.png" />
        <link rel="apple-touch-icon" href="/feps-logo.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body dir={locale === 'ar' ? 'rtl' : 'ltr'} className={`${amiri.variable} ${cairo.variable}`}>
        <NextIntlClientProvider messages={messages} locale={locale}>
          <Providers>
            <Navbar />
            <main className="page-content">
              {children}
            </main>
            <Footer />
            <GuidedTour />
            <Toaster position="bottom-right" toastOptions={{ style: { background: 'var(--feps-paper)', color: 'var(--feps-navy)', border: '1px solid var(--feps-border)', fontFamily: 'var(--font-sans)', borderRadius: '0' } }} />
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
