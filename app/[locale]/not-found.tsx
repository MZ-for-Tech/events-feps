import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { FileQuestion } from 'lucide-react'

export default function NotFound() {
  const t = useTranslations('NotFound')
  
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-20 text-center bg-feps-paper relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 inset-x-0 h-1 bg-feps-gold w-full" />
      <div className="absolute top-10 right-10 opacity-5 w-64 h-64 rounded-full border-2 border-feps-navy" />
      <div className="absolute -bottom-10 -left-10 opacity-5 w-96 h-96 rounded-full border-[10px] border-feps-gold" />
      
      <div className="relative z-10 flex flex-col items-center max-w-2xl mx-auto">
        <div className="w-24 h-24 bg-feps-surface-alt border-2 border-feps-border shadow-sm flex items-center justify-center mb-8 rotate-3">
          <FileQuestion size={40} className="text-feps-gold -rotate-3" />
        </div>
        
        <h1 className="text-6xl md:text-8xl font-serif font-bold text-feps-ink mb-4 tracking-tight">
          {t('title')}
        </h1>
        
        <h2 className="text-2xl md:text-3xl font-serif font-semibold text-feps-ink-secondary mb-6 leading-snug">
          {t('subtitle')}
        </h2>
        
        <p className="text-lg md:text-xl text-feps-ink-secondary/80 font-sans mb-12 max-w-lg leading-relaxed">
          {t('description')}
        </p>
        
        <Link 
          href="/" 
          className="group relative inline-flex items-center justify-center px-8 py-4 font-sans text-sm font-bold tracking-widest text-white uppercase bg-feps-navy transition-all hover:bg-feps-navy-light shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-feps-gold focus:ring-offset-2"
        >
          <span className="absolute inset-0 w-full h-full border-2 border-transparent group-hover:border-feps-gold/50 transition-colors" />
          {t('returnHome')}
        </Link>
      </div>
    </div>
  )
}
