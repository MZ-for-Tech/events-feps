import { getTranslations } from 'next-intl/server'


export default async function FAQPage({ params }: { params: Promise<{ locale: string }> }) {
  const t = await getTranslations('FAQ')
  const { locale } = await params
  const isAr = locale === 'ar'

  

  const title = t('title')
  const subtitle = t('subtitle')

  return (
    <div className="min-h-screen bg-feps-paper pb-24">
      <div className="border-b border-feps-border pt-8 pb-6">
        <div className="container max-w-5xl">
          <div className="flex items-center gap-4 mb-4">
            <div className="h-[40px] w-[3px] bg-feps-gold"></div>
            <span className="font-mono text-xs uppercase tracking-widest font-semibold text-feps-ink-secondary">FAQ</span>
          </div>
          <h1 className="font-serif text-5xl md:text-6xl font-normal tracking-tight text-feps-ink leading-[1.1] mb-4">
            {title}
          </h1>
          <p className="text-lg text-feps-ink-secondary max-w-2xl leading-relaxed">{subtitle}</p>
        </div>
      </div>

      <div className="container max-w-5xl py-8">
        <div className="flex flex-col gap-4">
          {(t.raw('faqs') as {q: string, a: string}[]).map((faq, i) => (
            <div key={i} className="bg-feps-surface border border-feps-border p-6 md:p-8">
              <h3 className={`font-serif text-xl font-bold text-feps-ink mb-3 ${isAr ? 'arabic' : ''}`}>{faq.q}</h3>
              <p className={`text-feps-ink-secondary leading-relaxed ${isAr ? 'arabic' : ''}`}>{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
