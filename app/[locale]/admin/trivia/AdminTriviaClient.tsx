'use client'

import React, { useState, useEffect, useOptimistic, useTransition } from 'react'
import { Brain, Plus, Loader, AlertCircle, Edit, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/admin/AdminTable'
import { AdminModal } from '@/components/admin/AdminModal'
import { useTranslations } from 'next-intl'

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
  categoryId?: string | null
}

export default function AdminTriviaClient({ locale }: { locale: string }) {
  const isAr = locale === 'ar'
  const t = useTranslations('Admin') // Assuming general admin translations

  const [questions, setQuestions] = useState<TriviaQuestion[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const [isPending, startTransition] = useTransition()

  type OptimisticAction = 
    | { type: 'ADD'; payload: TriviaQuestion }
    | { type: 'UPDATE'; payload: TriviaQuestion }
    | { type: 'DELETE'; id: string }

  const [optimisticQuestions, updateOptimisticQuestions] = useOptimistic(
    questions,
    (state, action: OptimisticAction) => {
      switch (action.type) {
        case 'ADD':
          return [action.payload, ...state]
        case 'UPDATE':
          return state.map(q => q.id === action.payload.id ? action.payload : q)
        case 'DELETE':
          return state.filter(q => q.id !== action.id)
        default:
          return state
      }
    }
  )

  // Form State
  const [textEn, setTextEn] = useState('')
  const [textAr, setTextAr] = useState('')
  const [textFr, setTextFr] = useState('')
  const [explanationEn, setExplanationEn] = useState('')
  const [explanationAr, setExplanationAr] = useState('')
  const [explanationFr, setExplanationFr] = useState('')
  const [options, setOptions] = useState<TriviaOption[]>([
    { textEn: '', textAr: '', textFr: '', isCorrect: true },
    { textEn: '', textAr: '', textFr: '', isCorrect: false },
    { textEn: '', textAr: '', textFr: '', isCorrect: false },
    { textEn: '', textAr: '', textFr: '', isCorrect: false },
  ])

  const [categories, setCategories] = useState<{id: string, nameEn: string, nameAr: string}[]>([])
  const [filterCategoryId, setFilterCategoryId] = useState<string>('ALL')

  const fetchQuestions = async () => {
    try {
      const res = await fetch('/api/admin/trivia')
      if (!res.ok) throw new Error('Failed to fetch trivia questions')
      const data = await res.json()
      setQuestions(data)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/admin/trivia/categories')
      if (res.ok) {
        const data = await res.json()
        setCategories(data)
      }
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    fetchQuestions()
    fetchCategories()
  }, [])

  const [categoryId, setCategoryId] = useState<string>('')

  const handleOpenModal = (q?: TriviaQuestion) => {
    if (q) {
      setEditingId(q.id)
      setCategoryId(q.categoryId || 'uncategorized')
      setTextEn(q.textEn)
      setTextAr(q.textAr)
      setTextFr(q.textFr)
      setExplanationEn(q.explanation || '')
      setExplanationAr(q.explanationAr || '')
      setExplanationFr(q.explanationFr || '')
      setOptions(JSON.parse(q.options))
    } else {
      setEditingId(null)
      setCategoryId('')
      setTextEn('')
      setTextAr('')
      setTextFr('')
      setExplanationEn('')
      setExplanationAr('')
      setExplanationFr('')
      setOptions([
        { textEn: '', textAr: '', textFr: '', isCorrect: true },
        { textEn: '', textAr: '', textFr: '', isCorrect: false },
        { textEn: '', textAr: '', textFr: '', isCorrect: false },
        { textEn: '', textAr: '', textFr: '', isCorrect: false },
      ])
    }
    setIsModalOpen(true)
  }

  const handleOptionChange = (index: number, field: keyof TriviaOption, value: string | boolean) => {
    const newOptions = [...options]
    if (field === 'isCorrect') {
      newOptions.forEach(opt => opt.isCorrect = false)
      newOptions[index].isCorrect = true
    } else {
      newOptions[index] = { ...newOptions[index], [field]: value }
    }
    setOptions(newOptions)
  }

  const handleSave = () => {
    if (!textEn || !textAr || !categoryId) {
      toast.error(isAr ? 'يرجى إدخال السؤال وتحديد التصنيف' : 'Please fill EN, AR text and select a category')
      return
    }

    const payload = {
      categoryId: categoryId === 'uncategorized' ? null : categoryId,
      textEn, textAr, textFr,
      explanation: explanationEn,
      explanationAr,
      explanationFr,
      options: JSON.stringify(options)
    }

    const optimisticQuestion: TriviaQuestion = {
      id: editingId || `temp-${Date.now()}`,
      ...payload,
    }

    startTransition(async () => {
      updateOptimisticQuestions({
        type: editingId ? 'UPDATE' : 'ADD',
        payload: optimisticQuestion
      })
      setIsModalOpen(false)

      try {
        const url = editingId ? `/api/admin/trivia/${editingId}` : '/api/admin/trivia'
        const method = editingId ? 'PATCH' : 'POST'

        const res = await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })

        if (!res.ok) throw new Error('Failed to save')
        
        const saved = await res.json()
        if (editingId) {
          setQuestions(prev => prev.map(q => q.id === saved.id ? saved : q))
          toast.success(isAr ? 'تم تعديل السؤال' : 'Question updated')
        } else {
          setQuestions(prev => [saved, ...prev])
          toast.success(isAr ? 'تمت إضافة السؤال' : 'Question added')
        }
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : String(err))
      }
    })
  }

  const handleDelete = (id: string) => {
    if (!confirm(isAr ? 'هل أنت متأكد من حذف هذا السؤال؟' : 'Are you sure you want to delete this question?')) return
    
    startTransition(async () => {
      updateOptimisticQuestions({ type: 'DELETE', id })
      try {
        const res = await fetch(`/api/admin/trivia/${id}`, { method: 'DELETE' })
        if (!res.ok) throw new Error('Failed to delete')
        setQuestions(prev => prev.filter(q => q.id !== id))
        toast.success(isAr ? 'تم حذف السؤال' : 'Question deleted')
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : String(err))
      }
    })
  }

  const filteredQuestions = optimisticQuestions.filter(q => 
    filterCategoryId === 'ALL' ? true : (q.categoryId || 'uncategorized') === filterCategoryId
  )

  return (
    <div>
      <AdminPageHeader
        title={isAr ? "إدارة الأسئلة والاختبارات" : "Trivia Management"}
        description={isAr ? "أضف وعدل أسئلة اختبار المعلومات للكلية." : "Manage FEPS trivia questions."}
        icon={Brain}
        action={
          <button onClick={() => handleOpenModal()} className="flex items-center gap-2 px-4 py-2 bg-feps-navy text-white text-sm hover:bg-feps-navy-dark transition-colors font-bold uppercase tracking-wider">
            <Plus size={16} />
            {isAr ? "إضافة سؤال" : "Add Question"}
          </button>
        }
      />

      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <label className="text-sm font-bold text-feps-navy">{isAr ? 'تصفية حسب التصنيف:' : 'Filter by Category:'}</label>
          <select 
            value={filterCategoryId} 
            onChange={(e) => setFilterCategoryId(e.target.value)}
            className="p-2 border border-feps-border bg-white text-sm focus:outline-none focus:border-feps-navy"
          >
            <option value="ALL">{isAr ? 'الكل' : 'All Categories'}</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{isAr ? c.nameAr : c.nameEn}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20 text-feps-gold"><Loader className="animate-spin" size={40} /></div>
      ) : error ? (
        <div className="bg-red-50 text-red-600 p-6 flex items-center gap-3 border border-red-200">
          <AlertCircle size={24} /> {error}
        </div>
      ) : filteredQuestions.length === 0 ? (
        <div className="text-center py-20 text-feps-ink-secondary bg-white border border-feps-ink/10">
          <Brain size={40} className="mx-auto mb-4 opacity-20" />
          <p>{isAr ? "لا توجد أسئلة مسجلة" : "No questions found"}</p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{isAr ? "السؤال" : "Question"}</TableHead>
              <TableHead>{isAr ? "التصنيف" : "Category"}</TableHead>
              <TableHead>{isAr ? "عدد الخيارات" : "Options"}</TableHead>
              <TableHead className="text-end">{isAr ? "الإجراءات" : "Actions"}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredQuestions.map(q => {
              const opts = JSON.parse(q.options)
              const cat = categories.find(c => c.id === (q.categoryId || 'uncategorized'))
              return (
                <TableRow key={q.id}>
                  <TableCell>
                    <div className="font-bold text-feps-navy">{isAr ? q.textAr : q.textEn}</div>
                    {q.explanation && <div className="text-xs text-feps-ink-secondary mt-1 max-w-lg truncate">{isAr ? q.explanationAr : q.explanation}</div>}
                  </TableCell>
                  <TableCell>
                    <span className="text-sm font-medium text-feps-ink-secondary">
                      {cat ? (isAr ? cat.nameAr : cat.nameEn) : '-'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="px-2 py-1 bg-feps-paper border border-feps-border text-xs font-sans font-bold">
                      {opts.length}
                    </span>
                  </TableCell>
                  <TableCell className="text-end">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => handleOpenModal(q)} className="p-2 text-feps-navy hover:bg-feps-paper border border-transparent hover:border-feps-border transition-all">
                        <Edit size={16} />
                      </button>
                      <button onClick={() => handleDelete(q.id)} className="p-2 text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 transition-all">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      )}

      {/* Modal */}
      <AdminModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? (isAr ? 'تعديل السؤال' : 'Edit Question') : (isAr ? 'إضافة سؤال' : 'Add Question')}
        maxWidthClass="max-w-4xl"
      >
        <div className="flex flex-col gap-6" dir={isAr ? 'rtl' : 'ltr'}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-feps-navy mb-2">{isAr ? 'التصنيف' : 'Category'}</label>
              <select
                value={categoryId}
                onChange={e => setCategoryId(e.target.value)}
                className="w-full p-3 border border-feps-border bg-feps-paper focus:outline-none focus:border-feps-navy"
                dir={isAr ? 'rtl' : 'ltr'}
              >
                <option value="" disabled>{isAr ? 'اختر التصنيف' : 'Select Category'}</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{isAr ? c.nameAr : c.nameEn}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-feps-navy mb-2">Question (EN)</label>
              <input type="text" value={textEn} onChange={e => setTextEn(e.target.value)} className="w-full p-3 border border-feps-border bg-feps-paper focus:outline-none focus:border-feps-navy" dir="ltr" />
            </div>
            <div>
              <label className="block text-sm font-bold text-feps-navy mb-2">Question (AR)</label>
              <input type="text" value={textAr} onChange={e => setTextAr(e.target.value)} className="w-full p-3 border border-feps-border bg-feps-paper focus:outline-none focus:border-feps-navy" dir="rtl" />
            </div>
            <div>
              <label className="block text-sm font-bold text-feps-navy mb-2">Question (FR)</label>
              <input type="text" value={textFr} onChange={e => setTextFr(e.target.value)} className="w-full p-3 border border-feps-border bg-feps-paper focus:outline-none focus:border-feps-navy" dir="ltr" />
            </div>
          </div>

          <div className="border-t border-feps-border pt-6">
            <h3 className="font-bold text-feps-navy mb-4">{isAr ? 'الخيارات (اختر الإجابة الصحيحة)' : 'Options (Select correct one)'}</h3>
            <div className="space-y-4">
              {options.map((opt, i) => (
                <div key={i} className={`p-4 border ${opt.isCorrect ? 'border-green-500 bg-green-50' : 'border-feps-border bg-white'} flex items-start gap-4`}>
                  <input 
                    type="radio" 
                    name="correctAnswer" 
                    checked={opt.isCorrect} 
                    onChange={() => handleOptionChange(i, 'isCorrect', true)}
                    className="mt-3 w-4 h-4 text-feps-navy focus:ring-feps-navy cursor-pointer"
                  />
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-2">
                    <input type="text" placeholder="Option (EN)" value={opt.textEn} onChange={e => handleOptionChange(i, 'textEn', e.target.value)} className="w-full p-2 border border-feps-border focus:outline-none bg-white text-sm" dir="ltr" />
                    <input type="text" placeholder="Option (AR)" value={opt.textAr} onChange={e => handleOptionChange(i, 'textAr', e.target.value)} className="w-full p-2 border border-feps-border focus:outline-none bg-white text-sm" dir="rtl" />
                    <input type="text" placeholder="Option (FR)" value={opt.textFr} onChange={e => handleOptionChange(i, 'textFr', e.target.value)} className="w-full p-2 border border-feps-border focus:outline-none bg-white text-sm" dir="ltr" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-feps-border pt-6">
            <h3 className="font-bold text-feps-navy mb-4">{isAr ? 'معلومة إضافية تظهر بعد الإجابة (اختياري)' : 'Explanation / Fun Fact (Optional)'}</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <textarea placeholder="Explanation (EN)" value={explanationEn} onChange={e => setExplanationEn(e.target.value)} className="w-full p-3 border border-feps-border bg-feps-paper focus:outline-none focus:border-feps-navy" rows={2} dir="ltr" />
              <textarea placeholder="Explanation (AR)" value={explanationAr} onChange={e => setExplanationAr(e.target.value)} className="w-full p-3 border border-feps-border bg-feps-paper focus:outline-none focus:border-feps-navy" rows={2} dir="rtl" />
              <textarea placeholder="Explanation (FR)" value={explanationFr} onChange={e => setExplanationFr(e.target.value)} className="w-full p-3 border border-feps-border bg-feps-paper focus:outline-none focus:border-feps-navy" rows={2} dir="ltr" />
            </div>
          </div>

          {/* Actions Button */}
          <div className="flex justify-end gap-3 mt-4 border-t border-feps-ink/20 pt-5">
            <button
              onClick={() => setIsModalOpen(false)}
              className="bg-transparent border-2 border-feps-ink/20 text-feps-ink-secondary px-6 py-2.5 font-bold text-sm uppercase tracking-widest cursor-pointer transition-colors hover:border-feps-ink hover:text-feps-ink"
            >
              {t('cancel')}
            </button>
            <button
              onClick={handleSave}
              disabled={isPending}
              className="bg-feps-navy text-white border-2 border-feps-navy px-6 py-2.5 font-bold text-sm uppercase tracking-widest cursor-pointer flex items-center gap-2 transition-colors hover:bg-feps-gold hover:text-feps-navy hover:border-feps-gold disabled:opacity-50"
            >
              {isPending && <Loader size={16} className="animate-spin" />}
              {t('save')}
            </button>
          </div>
        </div>
      </AdminModal>
    </div>
  )
}
