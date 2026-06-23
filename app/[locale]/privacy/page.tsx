import { getTranslations } from 'next-intl/server'
export default async function PrivacyPage({ params }: { params: Promise<{ locale: string }> }) {
  const t = await getTranslations('Privacy')
  const { locale } = await params
  const isAr = locale === 'ar'

  const title = t('title')
  const lastUpdated = t('lastUpdated')

  

  return (
    <div className="min-h-screen bg-feps-paper pb-24">
      <div className="border-b border-feps-border pt-8 pb-6">
        <div className="container max-w-5xl">
          <div className="flex items-center gap-4 mb-4">
            <div className="h-[40px] w-[3px] bg-feps-ink"></div>
            <span className="font-sans text-xs uppercase tracking-widest font-semibold text-feps-ink-secondary">
              {t('privacy')}
            </span>
          </div>
          <h1 className="font-serif text-5xl md:text-6xl font-normal tracking-tight text-feps-ink leading-[1.1] mb-4">
            {title}
          </h1>
          <p className="text-sm text-feps-ink-secondary font-sans">{lastUpdated}</p>
        </div>
      </div>

      <div className="container max-w-5xl py-8">
        <div className="bg-feps-surface border border-feps-border p-8 md:p-10">
          <div className="flex flex-col gap-8">
            {(t.raw('sections') as {title: string, content: string}[]).map((section, i) => (
              <div key={i}>
                <h2 className={`font-serif text-xl font-bold text-feps-ink mb-3 ${isAr ? 'arabic' : ''}`}>{section.title}</h2>
                <p className={`text-feps-ink-secondary leading-relaxed ${isAr ? 'arabic' : ''}`}>{section.content}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
