import type { Metadata, Viewport } from 'next'
import '../globals.css'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import Providers from '@/components/Providers'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'FEPS Hub — Faculty of Economics & Political Science',
  description: 'The official academic materials platform for FEPS, Cairo University. Access lecture slides, section notes, assignments, past papers, and datasets.',
  keywords: ['FEPS', 'Cairo University', 'economics', 'political science', 'academic materials'],
  appleWebApp: {
    title: 'FEPS Events',
    statusBarStyle: 'default',
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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Merriweather:ital,wght@0,300;0,400;0,700;0,900;1,400&family=Cairo:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <link rel="icon" href="/feps-logo.png" />
        <link rel="apple-touch-icon" href="/feps-logo.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body dir={locale === 'ar' ? 'rtl' : 'ltr'}>
        <NextIntlClientProvider messages={messages} locale={locale}>
          <Providers>
            <Navbar />
            <main className="page-content">
              {children}
            </main>
            <Footer />
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
