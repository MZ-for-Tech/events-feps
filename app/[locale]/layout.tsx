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
  title: {
    default: 'بوابة فعاليات كلية الاقتصاد والعلوم السياسية | FEPS Events Hub',
    template: '%s | FEPS Events'
  },
  description: 'البوابة الرسمية لفعاليات كلية الاقتصاد والعلوم السياسية - جامعة القاهرة. سجل حضورك بالفعاليات، وشارك في تقييمها واستبياناتها، واعرض تقارير التوصيات الأكاديمية.',
  keywords: ['FEPS Events', 'كلية الاقتصاد والعلوم السياسية', 'جامعة القاهرة', 'استبيان الفعاليات', 'تسجيل حضور الفعاليات', 'Cairo University Events'],
  appleWebApp: {
    title: 'FEPS Events',
    statusBarStyle: 'default',
  },
  openGraph: {
    title: 'بوابة فعاليات كلية الاقتصاد والعلوم السياسية — جامعة القاهرة',
    description: 'البوابة الرسمية لتسجيل حضور وتقييم فعاليات كلية الاقتصاد والعلوم السياسية. سجل حضورك بكود الساعات المعتمدة أو الرقم القومي للمشاركة في التقييم واستعراض توصيات المؤتمرات.',
    url: './',
    siteName: 'FEPS Events Portal',
    images: [
      {
        url: '/api/og',
        width: 1200,
        height: 630,
        alt: 'FEPS Events Portal - جامعة القاهرة',
      },
    ],
    locale: 'ar_EG',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FEPS Events Portal — Cairo University',
    description: 'The official events and academic reporting portal of the Faculty of Economics and Political Science, Cairo University.',
    images: ['/api/og'],
  }
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
