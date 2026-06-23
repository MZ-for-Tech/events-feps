'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Brain, X, Trophy, Share2, Download, ChevronRight, ChevronLeft, Loader } from 'lucide-react'
import { useTranslations, useLocale } from 'next-intl'

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
  const [gameState, setGameState] = useState<'welcome' | 'playing' | 'finished'>('welcome')
  const [questions, setQuestions] = useState<TriviaQuestion[]>([])
  const [loading, setLoading] = useState(false)
  
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null)
  const [isAnswered, setIsAnswered] = useState(false)
  const [score, setScore] = useState(0)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [shareImageUrl, setShareImageUrl] = useState<string | null>(null)

  const fetchQuestions = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/trivia')
      if (res.ok) {
        const data = await res.json()
        setQuestions(data)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  // Fetch when opened for the first time
  useEffect(() => {
    if (isOpen && questions.length === 0 && !loading) {
      fetchQuestions()
    }
  }, [isOpen, questions.length, loading])

  const handleSelectOption = (index: number) => {
    if (isAnswered) return
    setSelectedOptionIndex(index)
    setIsAnswered(true)
    
    const opts: TriviaOption[] = JSON.parse(questions[currentIndex].options)
    if (opts[index].isCorrect) {
      setScore(s => s + 1)
    }
  }

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(c => c + 1)
      setSelectedOptionIndex(null)
      setIsAnswered(false)
    } else {
      setGameState('finished')
      generateScoreImage()
    }
  }

  const handleStart = () => {
    if (loading) return
    if (questions.length > 0) {
      setGameState('playing')
    }
  }

  const resetGame = () => {
    setCurrentIndex(0)
    setScore(0)
    setGameState('welcome')
    setSelectedOptionIndex(null)
    setIsAnswered(false)
    setShareImageUrl(null)
    // Optionally fetch new questions
    fetchQuestions()
  }

  const getLocalizedText = (q: TriviaQuestion, field: 'text' | 'explanation') => {
    if (field === 'text') {
      if (isAr) return q.textAr
      if (isFr) return q.textFr || q.textEn
      return q.textEn
    } else {
      if (isAr) return q.explanationAr
      if (isFr) return q.explanationFr || q.explanation
      return q.explanation
    }
  }

  const getLocalizedOption = (opt: TriviaOption) => {
    if (isAr) return opt.textAr
    if (isFr) return opt.textFr || opt.textEn
    return opt.textEn
  }

  // Generate Score Image
  const generateScoreImage = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = 1080
    canvas.height = 1080

    // 1. Background Gradient
    const gradient = ctx.createRadialGradient(540, 540, 0, 540, 540, 800)
    gradient.addColorStop(0, '#1A3A6E') // feps-navy base
    gradient.addColorStop(1, '#0A1830') // deep navy
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, 1080, 1080)

    // 2. Grid Pattern (Academic touch)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)'
    ctx.lineWidth = 1
    for (let i = 0; i <= 1080; i += 60) {
      ctx.beginPath()
      ctx.moveTo(i, 0)
      ctx.lineTo(i, 1080)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(0, i)
      ctx.lineTo(1080, i)
      ctx.stroke()
    }

    // 3. Ornate Gold Frame
    ctx.strokeStyle = '#D4AF37'
    ctx.lineWidth = 4
    ctx.strokeRect(40, 40, 1000, 1000)
    ctx.lineWidth = 1
    ctx.strokeRect(52, 52, 976, 976)

    // Frame Corners
    ctx.fillStyle = '#D4AF37'
    const drawDiamond = (cx: number, cy: number) => {
      ctx.beginPath()
      ctx.moveTo(cx, cy - 8)
      ctx.lineTo(cx + 8, cy)
      ctx.lineTo(cx, cy + 8)
      ctx.lineTo(cx - 8, cy)
      ctx.fill()
    }
    drawDiamond(40, 40)
    drawDiamond(1040, 40)
    drawDiamond(40, 1040)
    drawDiamond(1040, 1040)

    // 4. Header Title
    ctx.fillStyle = '#D4AF37'
    ctx.font = 'bold 32px system-ui, -apple-system, sans-serif'
    ctx.textAlign = 'center'
    ;(ctx as CanvasRenderingContext2D & { letterSpacing?: string }).letterSpacing = '10px'
    ctx.fillText((isAr ? 'تحدي معلومات الكلية' : 'FEPS TRIVIA CHALLENGE'), 540, 160)
    ;(ctx as CanvasRenderingContext2D & { letterSpacing?: string }).letterSpacing = '0px'

    // 5. Central Score UI
    // Outer Glow
    ctx.shadowColor = 'rgba(212, 175, 55, 0.3)'
    ctx.shadowBlur = 60
    ctx.beginPath()
    ctx.arc(540, 520, 230, 0, Math.PI * 2)
    ctx.fillStyle = '#102447'
    ctx.fill()
    ctx.shadowBlur = 0

    // Solid Ring
    ctx.beginPath()
    ctx.arc(540, 520, 230, 0, Math.PI * 2)
    ctx.lineWidth = 4
    ctx.strokeStyle = '#D4AF37'
    ctx.stroke()

    // Dashed Inner Ring
    ctx.beginPath()
    ctx.setLineDash([8, 12])
    ctx.arc(540, 520, 205, 0, Math.PI * 2)
    ctx.lineWidth = 2
    ctx.strokeStyle = 'rgba(212, 175, 55, 0.6)'
    ctx.stroke()
    ctx.setLineDash([])

    // Score Number
    ctx.fillStyle = '#FFFFFF'
    ctx.shadowColor = 'rgba(0,0,0,0.5)'
    ctx.shadowBlur = 10
    ctx.font = 'bold 200px Georgia, serif'
    ctx.fillText(`${score}`, 540, 560)
    ctx.shadowBlur = 0

    // "Out of X" Text
    ctx.fillStyle = '#D4AF37'
    ctx.font = 'italic 40px Georgia, serif'
    ctx.fillText(isAr ? `من ${questions.length}` : `out of ${questions.length}`, 540, 650)

    // 6. Performance Band
    ctx.fillStyle = '#FFFFFF'
    ctx.font = 'bold 45px system-ui, -apple-system, sans-serif'
    let perfText = ''
    if (score === questions.length) perfText = isAr ? 'أداء مثالي!' : 'PERFECT SCORE'
    else if (score >= questions.length * 0.7) perfText = isAr ? 'أداء ممتاز!' : 'EXCELLENT'
    else if (score >= questions.length * 0.5) perfText = isAr ? 'محاولة جيدة' : 'GOOD EFFORT'
    else perfText = isAr ? 'حاول مرة أخرى' : 'KEEP LEARNING'
    ;(ctx as CanvasRenderingContext2D & { letterSpacing?: string }).letterSpacing = '4px'
    ctx.fillText(perfText, 540, 840)
    ;(ctx as CanvasRenderingContext2D & { letterSpacing?: string }).letterSpacing = '0px'

    // Subtle divider
    ctx.beginPath()
    ctx.moveTo(440, 910)
    ctx.lineTo(640, 910)
    ctx.strokeStyle = 'rgba(212, 175, 55, 0.5)'
    ctx.lineWidth = 2
    ctx.stroke()

    // 7. Footer
    ctx.fillStyle = 'rgba(255,255,255,0.6)'
    ctx.font = '28px system-ui, -apple-system, sans-serif'
    ctx.fillText(isAr ? 'كلية الاقتصاد والعلوم السياسية • جامعة القاهرة' : 'Faculty of Economics and Political Science • Cairo University', 540, 970)

    const dataUrl = canvas.toDataURL('image/png')
    setShareImageUrl(dataUrl)
  }

  const handleShare = async () => {
    if (!shareImageUrl) return

    try {
      // If Web Share API supports files
      if (navigator.share) {
        const blob = await (await fetch(shareImageUrl)).blob()
        const file = new File([blob], 'feps-trivia-score.png', { type: 'image/png' })
        
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: 'FEPS Trivia Score',
            text: `I scored ${score}/${questions.length} on the FEPS Trivia! Can you beat me?`,
            files: [file]
          })
          return
        }
      }

      // Fallback: Copy image to clipboard for Desktop users
      const blob = await (await fetch(shareImageUrl)).blob()
      if (navigator.clipboard && window.ClipboardItem) {
        const item = new ClipboardItem({ 'image/png': blob })
        await navigator.clipboard.write([item])
        alert('Score card copied to clipboard! You can now paste it anywhere.')
        return
      }

      // Final fallback
      const a = document.createElement('a')
      a.href = shareImageUrl
      a.download = 'feps-trivia-score.png'
      a.click()
    } catch (err) {
      console.error(err)
      // Fallback to download if clipboard/share fails, but ignore AbortError (user cancelled)
      if (err instanceof Error && err.name !== 'AbortError') {
        const a = document.createElement('a')
        a.href = shareImageUrl
        a.download = 'feps-trivia-score.png'
        a.click()
      }
    }
  }

  const handleDownload = () => {
    if (!shareImageUrl) return
    const a = document.createElement('a')
    a.href = shareImageUrl
    a.download = 'feps-trivia-score.png'
    a.click()
  }

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 lg:bottom-10 lg:right-10 z-50 flex items-center justify-center w-14 h-14 bg-feps-paper border-2 border-feps-navy text-feps-navy shadow-lg hover:bg-feps-navy hover:text-white hover:-translate-y-1 transition-all duration-200 group"
        aria-label={t('trigger')}
      >
        <Brain size={26} className="group-hover:scale-110 transition-transform duration-200" />
        <span className={`absolute ${isAr ? 'left-full ml-4' : 'right-full mr-4'} top-1/2 -translate-y-1/2 bg-feps-navy text-white font-serif px-4 py-2 text-sm shadow-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all duration-200 ${isAr ? '-translate-x-4 group-hover:translate-x-0' : 'translate-x-4 group-hover:translate-x-0'} pointer-events-none`}>
          {t('trigger')}
        </span>
      </button>
    )
  }

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-feps-navy/50 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-3xl shadow-2xl border-t-4 border-feps-gold flex flex-col max-h-[90vh] my-8 relative">
        
        {/* Header (System Design) */}
        <div className="flex items-center justify-between p-6 border-b border-feps-border bg-feps-paper/50">
          <div className="flex items-center gap-3 text-feps-navy font-serif font-bold text-xl">
            <Brain size={24} className="text-feps-gold" />
            {t('trigger')}
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="text-feps-ink-secondary hover:text-feps-navy transition-colors p-1"
          >
            <X size={20} />
          </button>
        </div>

        {/* Top Progress Line for Playing state */}
        {gameState === 'playing' && (
          <div className="absolute top-[81px] left-0 right-0 h-1 bg-slate-100 z-40">
            <div 
              className="h-full bg-feps-gold transition-all duration-700 ease-out"
              style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
            />
          </div>
        )}

        {/* Content */}
        <div className="p-6 md:p-8 flex-1 overflow-y-auto bg-white flex flex-col relative hide-scrollbar">
          
          {/* Welcome Screen */}
          {gameState === 'welcome' && (
            <div className="flex-1 flex flex-col items-center justify-center py-10 text-center animate-in fade-in zoom-in-95 duration-700 relative">
              <div className="relative z-10 w-24 h-24 bg-feps-paper rounded-2xl flex items-center justify-center mb-8 shadow-md border border-feps-border rotate-3 transition-transform duration-500">
                <Brain size={44} className="text-feps-navy" />
              </div>

              <h2 className={`text-4xl md:text-5xl font-bold text-feps-navy mb-6 tracking-tight ${isAr ? 'font-arabic' : 'font-serif'} leading-tight relative z-10`}>
                {t('welcomeTitle')}
              </h2>
              
              <p className="text-feps-ink-secondary text-lg max-w-lg mb-12 leading-relaxed relative z-10">
                {t('welcomeDesc')}
              </p>
              
              <button 
                onClick={handleStart}
                disabled={loading}
                className="group relative inline-flex items-center justify-center gap-4 px-10 py-4 bg-feps-navy text-white font-semibold text-lg overflow-hidden shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0 z-10"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-feps-navy to-[#1a2b4c] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                <span className="relative z-10 flex items-center gap-3">
                  {loading ? (
                    <>
                      <Loader size={24} className="animate-spin" />
                      <span>{t('loadingTrivia')}</span>
                    </>
                  ) : questions.length === 0 ? (
                    <span>No questions available</span>
                  ) : (
                    <>
                      <span>{t('startBtn')}</span>
                      {isAr ? <ChevronLeft size={22} className="group-hover:-translate-x-1.5 transition-transform duration-300" /> : <ChevronRight size={22} className="group-hover:translate-x-1.5 transition-transform duration-300" />}
                    </>
                  )}
                </span>
              </button>
            </div>
          )}

          {/* Playing Screen */}
          {gameState === 'playing' && questions.length > 0 && (
            <div className="flex-1 flex flex-col animate-in fade-in slide-in-from-right-8 duration-500 relative">
              
              {/* Question Meta */}
              <div className="flex items-center gap-4 mb-6">
                <span className="px-4 py-1.5 bg-feps-paper text-feps-gold font-bold text-sm tracking-widest uppercase border border-feps-border">
                  {t('question')} {currentIndex + 1}
                </span>
                <span className="text-feps-ink-secondary font-medium">
                  {t('of')} {questions.length}
                </span>
              </div>
              
              {/* The Question */}
              <h3 className={`text-2xl md:text-3xl font-bold text-feps-navy mb-8 leading-snug ${isAr ? 'font-arabic' : 'font-serif'}`}>
                {getLocalizedText(questions[currentIndex], 'text')}
              </h3>

              {/* Options */}
              <div className="space-y-4 flex-1">
                {JSON.parse(questions[currentIndex].options).map((opt: TriviaOption, idx: number) => {
                  const isSelected = selectedOptionIndex === idx
                  const isCorrect = opt.isCorrect
                  
                  let btnClass = 'bg-white border-feps-border text-feps-ink hover:border-feps-gold hover:shadow-md'
                  let circleClass = 'border-feps-border text-feps-ink-secondary group-hover:border-feps-gold group-hover:text-feps-gold group-hover:bg-feps-paper'
                  
                  if (isAnswered) {
                    btnClass = 'bg-white border-feps-border text-feps-ink opacity-60'
                    circleClass = 'border-feps-border text-feps-ink-secondary'
                    
                    if (isCorrect) {
                      btnClass = 'bg-green-50/50 border-green-500 text-green-900 shadow-sm ring-1 ring-green-500 opacity-100'
                      circleClass = 'border-green-500 bg-green-500 text-white'
                    } else if (isSelected) {
                      btnClass = 'bg-red-50/50 border-red-500 text-red-900 ring-1 ring-red-500 opacity-100'
                      circleClass = 'border-red-500 bg-red-500 text-white'
                    }
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectOption(idx)}
                      disabled={isAnswered}
                      className={`w-full flex items-center justify-between p-5 border transition-all duration-300 ${btnClass} group`}
                    >
                      <div className="flex items-center gap-5">
                        <div className={`w-10 h-10 shrink-0 flex items-center justify-center font-bold text-lg transition-colors duration-300 border ${circleClass}`}>
                          {isAnswered && isCorrect ? '✓' : isAnswered && isSelected && !isCorrect ? '✕' : String.fromCharCode(65 + idx)}
                        </div>
                        <span className={`text-lg font-medium text-start ${isAr ? 'font-arabic' : 'font-sans'}`}>
                          {getLocalizedOption(opt)}
                        </span>
                      </div>
                    </button>
                  )
                })}
              </div>

              {/* Answer Result & Next Button */}
              {isAnswered && (
                <div className="mt-8 animate-in fade-in slide-in-from-bottom-6 duration-500 bg-feps-paper p-6 border border-feps-border flex flex-col md:flex-row md:items-start gap-6">
                  <div className="flex-1">
                    <div className={`inline-flex items-center gap-2 px-4 py-1.5 mb-3 text-sm font-bold tracking-wide uppercase border ${JSON.parse(questions[currentIndex].options)[selectedOptionIndex!].isCorrect ? 'bg-green-100 text-green-800 border-green-200' : 'bg-red-100 text-red-800 border-red-200'}`}>
                      {JSON.parse(questions[currentIndex].options)[selectedOptionIndex!].isCorrect ? t('correct') : t('wrong')}
                    </div>
                    
                    {getLocalizedText(questions[currentIndex], 'explanation') && (
                      <p className="text-feps-ink text-lg leading-relaxed">
                        {getLocalizedText(questions[currentIndex], 'explanation')}
                      </p>
                    )}
                  </div>
                  
                  <button 
                    onClick={handleNext}
                    className="shrink-0 group relative inline-flex items-center justify-center gap-3 px-8 py-3 bg-feps-navy text-white font-semibold hover:bg-feps-navy-dark hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                  >
                    <span>{currentIndex < questions.length - 1 ? t('next') : t('finish')}</span>
                    {isAr ? <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> : <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Finished Screen */}
          {gameState === 'finished' && (
            <div className="flex-1 flex flex-col items-center justify-center py-10 animate-in fade-in zoom-in-95 duration-700 text-center relative">
              <div className="relative z-10 w-24 h-24 bg-feps-paper rounded-full flex items-center justify-center mb-8 shadow-md border border-feps-border">
                <Trophy size={40} className="text-feps-gold animate-in slide-in-from-bottom-8 duration-700" />
              </div>
              
              <h2 className={`text-4xl md:text-5xl font-bold text-feps-navy mb-4 ${isAr ? 'font-arabic' : 'font-serif'} relative z-10`}>
                {t('score')}: {score}/{questions.length}
              </h2>
              
              <p className="text-feps-ink-secondary text-xl mb-10 max-w-md font-medium relative z-10">
                {score === questions.length ? t('scoreBands.perfect') : 
                 score >= questions.length * 0.7 ? t('scoreBands.good') : 
                 score >= questions.length * 0.5 ? t('scoreBands.average') : 
                 t('scoreBands.poor')}
              </p>

              {shareImageUrl && (
                <div className="relative mb-12 group inline-block z-10">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={shareImageUrl} alt="Score" className="w-full max-w-[280px] h-auto relative shadow-xl border border-feps-border" />
                  <div className="absolute inset-0 bg-feps-navy/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-4 backdrop-blur-sm">
                    <button onClick={handleShare} className="p-4 bg-feps-gold text-white hover:scale-110 shadow-lg transition-all duration-300" title={t('shareScore')}>
                      <Share2 size={24} />
                    </button>
                    <button onClick={handleDownload} className="p-4 bg-white text-feps-navy hover:scale-110 shadow-lg transition-all duration-300" title={t('downloadImage')}>
                      <Download size={24} />
                    </button>
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md relative z-10">
                <button onClick={resetGame} className="flex-1 py-3 px-6 bg-white border border-feps-border text-feps-ink font-bold hover:border-feps-gold hover:-translate-y-1 transition-all duration-300 shadow-sm hover:shadow-md">
                  {t('playAgain')}
                </button>
                <button onClick={() => setIsOpen(false)} className="flex-1 py-3 px-6 bg-feps-navy text-white font-bold hover:bg-feps-navy-dark hover:-translate-y-1 transition-all duration-300 shadow-lg hover:shadow-xl">
                  {t('close')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Hidden Canvas for Score Generation */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  )
}
