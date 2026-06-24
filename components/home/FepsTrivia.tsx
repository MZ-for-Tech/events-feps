'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Brain, X, Trophy, Share2, Download, ChevronRight, ChevronLeft, Loader, Layers, CircleCheck, CircleX } from 'lucide-react'
import { useTranslations, useLocale } from 'next-intl'
import { playClickSound, playCorrectSound, playWrongSound, playStartSound } from '@/lib/audio'
import confetti from 'canvas-confetti'
import { createPortal } from 'react-dom'

interface TriviaCategory {
  id: string
  nameEn: string
  nameAr: string
  nameFr: string
  color: string
  bg: string
  _count?: { questions: number }
}

interface TriviaOption {
  textEn: string
  textAr: string
  textFr: string
  isCorrect: boolean
}

interface TriviaQuestion {
  id: string
  textEn: string
  textAr: string
  textFr: string
  options: string // JSON
  explanation: string | null
  explanationAr: string | null
  explanationFr: string | null
}

export default function FepsTrivia() {
  const t = useTranslations('FepsTrivia')
  const locale = useLocale()
  const isAr = locale === 'ar'
  const isFr = locale === 'fr'

  const [isOpen, setIsOpen] = useState(false)
  const [gameState, setGameState] = useState<'welcome' | 'categories' | 'playing' | 'finished'>('welcome')
  const [categories, setCategories] = useState<TriviaCategory[]>([])
  const [selectedCategory, setSelectedCategory] = useState<TriviaCategory | null>(null)
  const [questions, setQuestions] = useState<TriviaQuestion[]>([])
  const [loading, setLoading] = useState(false)
  
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null)
  const [isAnswered, setIsAnswered] = useState(false)
  const [score, setScore] = useState(0)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [shareImageUrl, setShareImageUrl] = useState<string | null>(null)

  const fetchCategories = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/trivia/categories')
      if (res.ok) {
        const data = await res.json()
        setCategories(data.filter((c: TriviaCategory) => c._count && c._count.questions > 0))
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const fetchQuestionsForCategory = async (categoryId: string) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/trivia?categoryId=${categoryId}`)
      if (res.ok) {
        const data = await res.json()
        setQuestions(data)
        setGameState('playing')
        playStartSound()
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen && categories.length === 0 && !loading && gameState === 'welcome') {
      fetchCategories()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen])

  const handleSelectOption = (index: number) => {
    if (isAnswered) return
    setSelectedOptionIndex(index)
    setIsAnswered(true)
    
    const opts: TriviaOption[] = JSON.parse(questions[currentIndex].options)
    if (opts[index].isCorrect) {
      setScore(s => s + 1)
      playCorrectSound()
    } else {
      playWrongSound()
    }
  }

  const triggerConfetti = () => {
    const duration = 3000
    const end = Date.now() + duration
    const colors = selectedCategory ? [selectedCategory.color, '#f5a800', '#0b1930'] : ['#f5a800', '#0b1930']

    ;(function frame() {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: colors,
        disableForReducedMotion: true
      })
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: colors,
        disableForReducedMotion: true
      })

      if (Date.now() < end) {
        requestAnimationFrame(frame)
      }
    }())
  }

  const handleNext = () => {
    playClickSound()
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(c => c + 1)
      setSelectedOptionIndex(null)
      setIsAnswered(false)
    } else {
      setGameState('finished')
      triggerConfetti()
      generateScoreImage()
    }
  }



  const handleSelectCategory = (cat: TriviaCategory) => {
    playClickSound()
    setSelectedCategory(cat)
    fetchQuestionsForCategory(cat.id)
  }

  const resetGame = () => {
    playClickSound()
    setCurrentIndex(0)
    setScore(0)
    setGameState('welcome')
    setSelectedOptionIndex(null)
    setIsAnswered(false)
    setShareImageUrl(null)
    setSelectedCategory(null)
  }

  const getLocalizedText = (q: TriviaQuestion | TriviaCategory, field: 'text' | 'explanation' | 'name') => {
    if (field === 'text') {
      const qObj = q as TriviaQuestion
      if (isAr) return qObj.textAr
      if (isFr) return qObj.textFr || qObj.textEn
      return qObj.textEn
    } else if (field === 'explanation') {
      const qObj = q as TriviaQuestion
      if (isAr) return qObj.explanationAr
      if (isFr) return qObj.explanationFr || qObj.explanation
      return qObj.explanation
    } else {
      const cObj = q as TriviaCategory
      if (isAr) return cObj.nameAr
      if (isFr) return cObj.nameFr || cObj.nameEn
      return cObj.nameEn
    }
  }

  const getLocalizedOption = (opt: TriviaOption) => {
    if (isAr) return opt.textAr
    if (isFr) return opt.textFr || opt.textEn
    return opt.textEn
  }

  // Generates an academic editorial style certificate image
  const generateScoreImage = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = 1080
    canvas.height = 1080

    // Paper background
    ctx.fillStyle = '#f8f9fa'
    ctx.fillRect(0, 0, 1080, 1080)

    // Outer border
    ctx.strokeStyle = '#0b1930'
    ctx.lineWidth = 12
    ctx.strokeRect(40, 40, 1000, 1000)
    ctx.lineWidth = 2
    ctx.strokeRect(55, 55, 970, 970)

    // Category Color Spine Indicator on the left
    if (selectedCategory) {
      ctx.fillStyle = selectedCategory.color
      ctx.fillRect(40, 40, 20, 1000)
    }

    ctx.fillStyle = '#0b1930'
    ctx.font = 'bold 24px system-ui, -apple-system, sans-serif'
    ctx.textAlign = 'center'
    
    // Header
    ;(ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = '8px'
    ctx.fillText((isAr ? 'اختبار المعرفة' : 'KNOWLEDGE ASSESSMENT').toUpperCase(), 540, 140)
    ;(ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = '0px'

    // Separator line
    ctx.beginPath()
    ctx.moveTo(340, 180)
    ctx.lineTo(740, 180)
    ctx.lineWidth = 1
    ctx.strokeStyle = '#0b1930'
    ctx.stroke()

    // Category Name
    ctx.font = 'italic 36px Georgia, serif'
    const catName = selectedCategory ? getLocalizedText(selectedCategory, 'name') : ''
    ctx.fillText(catName || '', 540, 240)

    // Score Label
    ctx.font = '600 20px system-ui, -apple-system, sans-serif'
    ;(ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = '4px'
    ctx.fillText((isAr ? 'النتيجة النهائية' : 'FINAL RESULT').toUpperCase(), 540, 400)
    ;(ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = '0px'

    // Score Numbers
    ctx.font = 'bold 240px Georgia, serif'
    ctx.fillText(`${score}`, 540, 620)
    
    // Out of
    ctx.font = 'italic 32px Georgia, serif'
    ctx.fillText(isAr ? `من ${questions.length}` : `out of ${questions.length}`, 540, 700)

    // Assessment Text
    ctx.font = 'bold 32px system-ui, -apple-system, sans-serif'
    let perfText = ''
    if (score === questions.length) perfText = isAr ? 'امتياز مع مرتبة الشرف' : 'DISTINCTION WITH HONORS'
    else if (score >= questions.length * 0.7) perfText = isAr ? 'جيد جداً' : 'HIGHLY COMMENDED'
    else if (score >= questions.length * 0.5) perfText = isAr ? 'مقبول' : 'SATISFACTORY'
    else perfText = isAr ? 'يستلزم المراجعة' : 'REQUIRES REVIEW'
    
    ;(ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = '2px'
    ctx.fillText(perfText, 540, 850)
    ;(ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = '0px'

    // Footer
    ctx.fillStyle = 'rgba(11, 25, 48, 0.65)'
    ctx.font = '18px system-ui, -apple-system, sans-serif'
    ctx.fillText(isAr ? 'كلية الاقتصاد والعلوم السياسية • جامعة القاهرة' : 'Faculty of Economics and Political Science • Cairo University', 540, 980)

    const dataUrl = canvas.toDataURL('image/png')
    setShareImageUrl(dataUrl)
  }

  const handleShare = async () => {
    playClickSound()
    if (!shareImageUrl) return

    try {
      if (navigator.share) {
        const blob = await (await fetch(shareImageUrl)).blob()
        const file = new File([blob], 'feps-assessment-result.png', { type: 'image/png' })
        
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: 'FEPS Knowledge Assessment',
            text: `I scored ${score}/${questions.length} on the FEPS Trivia.`,
            files: [file]
          })
          return
        }
      }

      const blob = await (await fetch(shareImageUrl)).blob()
      if (navigator.clipboard && window.ClipboardItem) {
        const item = new ClipboardItem({ 'image/png': blob })
        await navigator.clipboard.write([item])
        alert('Result certificate copied to clipboard.')
        return
      }

      const a = document.createElement('a')
      a.href = shareImageUrl
      a.download = 'feps-assessment-result.png'
      a.click()
    } catch (err) {
      console.error(err)
      if (err instanceof Error && err.name !== 'AbortError') {
        const a = document.createElement('a')
        a.href = shareImageUrl
        a.download = 'feps-assessment-result.png'
        a.click()
      }
    }
  }

  const handleDownload = () => {
    playClickSound()
    if (!shareImageUrl) return
    const a = document.createElement('a')
    a.href = shareImageUrl
    a.download = 'feps-assessment-result.png'
    a.click()
  }

  const handleClose = () => {
    playClickSound()
    setIsOpen(false)
  }

  // Enhanced floating trigger button that acts as the entry point for the Knowledge Hub
  if (!isOpen) {
    return (
      <button 
        onClick={() => { playClickSound(); setIsOpen(true) }}
        className="fixed bottom-6 right-6 lg:bottom-10 lg:right-10 z-50 flex items-center justify-center gap-3 px-6 h-14 bg-feps-navy-dark border-2 border-feps-gold text-feps-gold shadow-[4px_4px_0px_#B29A6C] hover:shadow-[2px_2px_0px_#B29A6C] hover:translate-y-[2px] hover:translate-x-[2px] transition-all duration-200 group rounded-none"
        aria-label={t('trigger')}
      >
        <div className="relative flex items-center justify-center w-6 h-6">
          <Brain size={20} className="text-feps-gold group-hover:scale-110 group-hover:rotate-12 transition-transform duration-300 relative z-10" />
          <div className="absolute inset-0 rounded-full border border-feps-gold opacity-0 group-hover:animate-ping group-hover:opacity-100 z-0" />
        </div>
        <span className="font-sans font-bold uppercase tracking-widest text-xs hidden sm:block">
          {t('welcomeTitle') || 'Knowledge Hub'}
        </span>
        
        {/* Tooltip for mobile where text is hidden */}
        <span className={`sm:hidden absolute ${isAr ? 'left-full ml-4' : 'right-full mr-4'} top-1/2 -translate-y-1/2 bg-feps-navy-dark text-feps-gold font-sans uppercase tracking-widest px-4 py-2 text-xs font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all duration-200 ${isAr ? '-translate-x-4 group-hover:translate-x-0' : 'translate-x-4 group-hover:translate-x-0'} pointer-events-none border border-feps-gold`}>
          {t('trigger')}
        </span>
      </button>
    )
  }

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex flex-col overflow-hidden bg-feps-paper text-feps-ink font-sans" dir={isAr ? 'rtl' : 'ltr'}>
      
      {/* Editorial Top Border line indicating category */}
      {selectedCategory && (
        <div 
          className="absolute top-0 left-0 right-0 h-2 z-40"
          style={{ backgroundColor: selectedCategory.color }}
        />
      )}

      {/* Progress Bar for Playing state */}
      {gameState === 'playing' && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-feps-border z-40">
          <div 
            className="h-full transition-all duration-300 ease-out"
            style={{ width: `${((currentIndex) / questions.length) * 100}%`, backgroundColor: selectedCategory ? selectedCategory.color : 'var(--feps-navy)' }}
          />
        </div>
      )}

      {/* Controls Container */}
      <div className={`fixed top-4 ${isAr ? 'left-6' : 'right-6'} z-50 flex gap-2`}>
        {gameState === 'playing' && (
          <button 
            onClick={() => {
              playClickSound()
              setGameState('welcome')
            }}
            className="p-2 text-feps-ink-secondary hover:text-feps-ink transition-colors bg-feps-surface border border-feps-border flex items-center gap-2 font-sans text-sm font-bold uppercase tracking-widest"
          >
            <ChevronLeft size={20} className={isAr ? 'rotate-180' : ''} />
            <span className="hidden md:inline">{isAr ? 'العودة' : 'Back'}</span>
          </button>
        )}
        <button 
          onClick={handleClose}
          className="p-2 text-feps-ink-secondary hover:text-feps-ink transition-colors bg-feps-surface border border-feps-border"
          aria-label="Close"
        >
          <X size={24} />
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto flex flex-col relative z-10 w-full px-6 py-24 md:px-12 md:py-32">
        <div className="flex flex-col items-center max-w-5xl mx-auto w-full m-auto">
          
          {/* Knowledge Hub Menu Screen */}
          {gameState === 'welcome' && (
            <div className="w-full max-w-5xl fade-in-up">
              <div className="text-center md:text-start border-b-2 border-feps-ink pb-8 mb-10">
                <div className="inline-flex items-center justify-center w-16 h-16 border-2 border-feps-ink bg-feps-surface mb-6 shadow-academic">
                  <Brain size={32} className="text-feps-ink" />
                </div>
                <h2 className={`text-4xl md:text-5xl lg:text-6xl font-bold text-feps-ink mb-4 ${isAr ? 'font-arabic' : 'font-serif'} leading-tight`}>
                  {t('welcomeTitle')}
                </h2>
                <p className="text-feps-ink-secondary text-lg max-w-2xl leading-relaxed font-sans">
                  {t('welcomeDesc')}
                </p>
              </div>

              {loading ? (
                <div className="flex justify-center p-12">
                  <Loader size={32} className="animate-spin text-feps-ink" />
                </div>
              ) : categories.length === 0 ? (
                <div className="p-8 border-2 border-dashed border-feps-border text-center bg-feps-surface/50">
                  <p className="text-feps-ink-secondary font-sans uppercase tracking-widest text-sm font-semibold">
                    {isAr ? 'لا توجد مواضيع متاحة' : 'No topics available'}
                  </p>
                </div>
              ) : (
                <div className="w-full fade-in-up">
                  <div className="mb-8 flex items-end justify-between border-b border-feps-border pb-4">
                    <div>
                      <h3 className={`text-2xl md:text-3xl font-bold text-feps-ink mb-2 ${isAr ? 'font-arabic' : 'font-serif'}`}>
                        {isAr ? 'المواضيع المتاحة' : 'Available Topics'}
                      </h3>
                      <p className="text-feps-ink-secondary font-sans uppercase tracking-widest text-xs font-semibold">
                        {isAr ? 'اختر موضوعاً لبدء التقييم' : 'Select a topic to begin assessment'}
                      </p>
                    </div>
                    <div className="hidden md:block font-sans text-xs uppercase tracking-widest font-bold text-feps-ink-secondary">
                      {categories.length} {isAr ? 'وحدات' : 'Modules'}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
                    {categories.map((cat, idx) => (
                      <button
                        key={cat.id}
                        onClick={() => handleSelectCategory(cat)}
                        className="group flex flex-col bg-feps-surface border border-feps-border relative overflow-hidden transition-all duration-300 hover:shadow-academic hover:-translate-y-1 hover:border-feps-ink text-start h-full min-h-[180px]"
                      >
                        <div 
                          className="absolute start-0 top-0 bottom-0 w-[4px] z-10 transition-all duration-300 group-hover:w-[8px]"
                          style={{ backgroundColor: cat.color }}
                        />
                        <div className="p-6 flex flex-col h-full pl-8 w-full relative z-20">
                          <div className="flex items-center justify-between mb-4 border-b border-feps-border pb-4">
                             <span 
                              className="font-sans text-xs uppercase tracking-widest font-bold"
                              style={{ color: cat.color }}
                            >
                              {isAr ? 'وحدة تقييم' : 'Assessment Module'} {String(idx + 1).padStart(2, '0')}
                            </span>
                            <Layers size={18} className="text-feps-ink/40 group-hover:text-feps-ink transition-colors duration-300" />
                          </div>
                          <h4 className={`text-2xl md:text-3xl font-bold leading-tight text-feps-ink mb-4 group-hover:text-feps-navy transition-colors ${isAr ? 'font-arabic' : 'font-serif'}`}>
                            {getLocalizedText(cat, 'name')}
                          </h4>
                          <div className="mt-auto flex items-center justify-between pt-4">
                            <span className="font-sans text-xs uppercase tracking-widest font-semibold text-feps-ink-secondary group-hover:text-feps-ink transition-colors duration-300">
                              {cat._count?.questions} {isAr ? 'عنصر' : 'Items'}
                            </span>
                            <span className="font-sans text-xs uppercase tracking-widest font-bold text-feps-ink opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                              {isAr ? 'البدء' : 'Begin'} →
                            </span>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Playing Screen */}
          {gameState === 'playing' && questions.length > 0 && selectedCategory && (
            <div className="w-full max-w-3xl fade-in-up flex flex-col">
              
              <div className="mb-8 border-b-2 border-feps-ink pb-4 flex items-center justify-between">
                <span className="font-sans text-xs uppercase tracking-widest font-semibold text-feps-ink-secondary">
                  {getLocalizedText(selectedCategory, 'name')}
                </span>
                <span className="font-sans text-xs uppercase tracking-widest font-semibold text-feps-ink">
                  {t('question')} {currentIndex + 1} / {questions.length}
                </span>
              </div>
              
              <h3 className={`text-3xl md:text-4xl font-bold text-feps-ink mb-12 leading-relaxed ${isAr ? 'font-arabic' : 'font-serif'}`}>
                {getLocalizedText(questions[currentIndex], 'text')}
              </h3>

              <div className="flex flex-col gap-4 w-full">
                {JSON.parse(questions[currentIndex].options).map((opt: TriviaOption, idx: number) => {
                  const isSelected = selectedOptionIndex === idx
                  const isCorrect = opt.isCorrect
                  
                  let btnClass = 'bg-feps-surface border-feps-border hover:bg-feps-surface-alt text-feps-ink'
                  let circleClass = 'border-feps-border text-feps-ink-secondary'
                  let indicatorClass = 'opacity-0'
                  
                  if (isAnswered) {
                    btnClass = 'bg-feps-surface border-feps-border text-feps-ink-tertiary cursor-default'
                    circleClass = 'border-feps-border text-feps-ink-tertiary'
                    
                    if (isCorrect) {
                      btnClass = 'bg-feps-surface border-2 border-feps-success text-feps-ink'
                      circleClass = 'border-feps-success bg-feps-success text-white'
                      indicatorClass = 'opacity-100 text-feps-success'
                    } else if (isSelected) {
                      btnClass = 'bg-feps-surface border-2 border-feps-error text-feps-ink'
                      circleClass = 'border-feps-error bg-feps-error text-white'
                      indicatorClass = 'opacity-100 text-feps-error'
                    }
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectOption(idx)}
                      disabled={isAnswered}
                      className={`relative w-full flex items-center p-5 border transition-colors ${btnClass} text-start`}
                    >
                      <div className={`w-8 h-8 shrink-0 flex items-center justify-center font-sans font-bold text-sm border ${circleClass} mr-4 ${isAr ? 'ml-4 mr-0' : ''}`}>
                         {String.fromCharCode(65 + idx)}
                      </div>
                      <span className={`text-lg font-medium leading-relaxed ${isAr ? 'font-arabic' : 'font-sans'}`}>
                        {getLocalizedOption(opt)}
                      </span>
                      
                      {isAnswered && (isCorrect || isSelected) && (
                         <div className={`absolute ${isAr ? 'left-5' : 'right-5'} ${indicatorClass}`}>
                            {isCorrect ? <CircleCheck size={24} /> : <CircleX size={24} />}
                         </div>
                      )}
                    </button>
                  )
                })}
              </div>

              {isAnswered && (
                <div className="mt-10 border-2 border-feps-ink bg-feps-surface p-8 fade-in-up">
                  <div className={`inline-flex items-center gap-2 mb-4 font-sans text-sm uppercase tracking-widest font-bold ${JSON.parse(questions[currentIndex].options)[selectedOptionIndex!].isCorrect ? 'text-feps-success' : 'text-feps-error'}`}>
                    {JSON.parse(questions[currentIndex].options)[selectedOptionIndex!].isCorrect ? t('correct') : t('wrong')}
                  </div>
                  
                  {getLocalizedText(questions[currentIndex], 'explanation') && (
                    <p className={`text-feps-ink-secondary text-lg leading-relaxed mb-8 ${isAr ? 'font-arabic' : 'font-serif'}`}>
                      {getLocalizedText(questions[currentIndex], 'explanation')}
                    </p>
                  )}
                  
                  <div className="flex justify-end pt-4 border-t border-feps-border">
                    <button 
                      onClick={handleNext}
                      className="btn btn-primary"
                    >
                      <span>{currentIndex < questions.length - 1 ? t('next') : t('finish')}</span>
                      {isAr ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Finished Screen */}
          {gameState === 'finished' && (
            <div className="w-full max-w-4xl mx-auto fade-in-up">
              <div className="text-center">
                <div className="flex justify-center mb-6">
                  <Trophy size={48} className="text-feps-ink" />
                </div>
                
                <h4 className="font-sans text-sm uppercase tracking-widest font-semibold text-feps-ink-secondary mb-4">
                  {isAr ? 'النتيجة النهائية' : 'Final Assessment Result'}
                </h4>
                
                <h2 className={`text-7xl md:text-8xl lg:text-9xl font-bold mb-4 ${isAr ? 'font-arabic' : 'font-serif'} text-feps-ink`}>
                  {score} <span className="text-3xl md:text-5xl text-feps-ink-tertiary">/ {questions.length}</span>
                </h2>
                
                <p className="text-feps-ink-secondary text-xl mb-12 font-sans">
                  {score === questions.length ? t('scoreBands.perfect') : 
                   score >= questions.length * 0.7 ? t('scoreBands.good') : 
                   score >= questions.length * 0.5 ? t('scoreBands.average') : 
                   t('scoreBands.poor')}
                </p>

                {shareImageUrl && (
                  <div className="flex justify-center mb-12 w-full">
                    <div className="bg-feps-surface border-2 border-feps-ink p-4 md:p-8 max-w-2xl w-full shadow-academic relative">
                      {/* Decorative elements */}
                      <div className="absolute top-2 left-2 right-2 bottom-2 border border-feps-ink/20 pointer-events-none" />
                      
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={shareImageUrl} alt="Score Certificate" className="w-full h-auto border border-feps-border shadow-sm mb-6" />
                      <div className="grid grid-cols-2 gap-4">
                        <button onClick={handleShare} className="btn btn-outline btn-lg w-full flex items-center justify-center gap-3" title={t('shareScore')}>
                          <Share2 size={20} /> <span className="font-sans uppercase tracking-widest text-sm font-bold">Share</span>
                        </button>
                        <button onClick={handleDownload} className="btn btn-outline btn-lg w-full flex items-center justify-center gap-3" title={t('downloadImage')}>
                          <Download size={20} /> <span className="font-sans uppercase tracking-widest text-sm font-bold">Save</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row justify-center gap-6 border-t-2 border-feps-ink pt-10 mt-8">
                  <button onClick={resetGame} className="btn btn-primary btn-lg min-w-[200px]">
                    {isAr ? 'العودة للمواضيع' : 'Back to Topics'}
                  </button>
                  <button onClick={handleClose} className="btn btn-outline btn-lg min-w-[200px]">
                    {t('close')}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  )

  return typeof window !== 'undefined' ? createPortal(modalContent, document.body) : null
}
