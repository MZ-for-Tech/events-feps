'use client'

import React, { useState, useEffect, useOptimistic, useTransition } from 'react'
import { Plus, Loader, AlertCircle, Edit, Trash2, LibraryBig } from 'lucide-react'
import toast from 'react-hot-toast'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/admin/AdminTable'
import { AdminModal } from '@/components/admin/AdminModal'
import { useTranslations } from 'next-intl'

interface TriviaCategory {
  id: string
  nameEn: string
  nameAr: string
  nameFr: string
  color: string
  bg: string
}

export default function AdminTriviaCategoriesClient({ locale }: { locale: string }) {
  const isAr = locale === 'ar'
  const t = useTranslations('Admin')

  const [categories, setCategories] = useState<TriviaCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const [isPending, startTransition] = useTransition()

  type OptimisticAction = 
    | { type: 'ADD'; payload: TriviaCategory }
    | { type: 'UPDATE'; payload: TriviaCategory }
    | { type: 'DELETE'; id: string }

  const [optimisticCategories, updateOptimisticCategories] = useOptimistic(
    categories,
    (state, action: OptimisticAction) => {
      switch (action.type) {
        case 'ADD':
          return [action.payload, ...state]
        case 'UPDATE':
          return state.map(c => c.id === action.payload.id ? action.payload : c)
        case 'DELETE':
          return state.filter(c => c.id !== action.id)
        default:
          return state
      }
    }
  )

  const [nameEn, setNameEn] = useState('')
  const [nameAr, setNameAr] = useState('')
  const [nameFr, setNameFr] = useState('')
  const [color, setColor] = useState('#1A3A6E')
  const [bg, setBg] = useState('rgba(26,58,110,0.12)')

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/admin/trivia/categories')
      if (!res.ok) throw new Error('Failed to fetch categories')
      const data = await res.json()
      setCategories(data)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  const handleOpenModal = (c?: TriviaCategory) => {
    if (c) {
      setEditingId(c.id)
      setNameEn(c.nameEn)
      setNameAr(c.nameAr)
      setNameFr(c.nameFr)
      setColor(c.color)
      setBg(c.bg)
    } else {
      setEditingId(null)
      setNameEn('')
      setNameAr('')
      setNameFr('')
      setColor('#1A3A6E')
      setBg('rgba(26,58,110,0.12)')
    }
    setIsModalOpen(true)
  }

  const handleSave = () => {
    if (!nameEn || !nameAr) {
      toast.error('Please fill at least EN and AR names')
      return
    }

    const payload = {
      nameEn, nameAr, nameFr, color, bg
    }

    const optimisticCategory: TriviaCategory = {
      id: editingId || `temp-${Date.now()}`,
      ...payload,
    }

    startTransition(async () => {
      updateOptimisticCategories({
        type: editingId ? 'UPDATE' : 'ADD',
        payload: optimisticCategory
      })
      setIsModalOpen(false)

      try {
        const url = editingId ? `/api/admin/trivia/categories/${editingId}` : '/api/admin/trivia/categories'
        const method = editingId ? 'PATCH' : 'POST'

        const res = await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })

        if (!res.ok) throw new Error('Failed to save')
        
        const saved = await res.json()
        if (editingId) {
          setCategories(prev => prev.map(c => c.id === saved.id ? saved : c))
          toast.success(isAr ? 'تم التعديل' : 'Updated successfully')
        } else {
          setCategories(prev => [saved, ...prev])
          toast.success(isAr ? 'تمت الإضافة' : 'Added successfully')
        }
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : String(err))
      }
    })
  }

  const handleDelete = (id: string) => {
    if (!confirm(isAr ? 'هل أنت متأكد؟' : 'Are you sure?')) return
    
    startTransition(async () => {
      updateOptimisticCategories({ type: 'DELETE', id })
      try {
        const res = await fetch(`/api/admin/trivia/categories/${id}`, { method: 'DELETE' })
        if (!res.ok) throw new Error('Failed to delete')
        setCategories(prev => prev.filter(c => c.id !== id))
        toast.success(isAr ? 'تم الحذف' : 'Deleted successfully')
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : String(err))
      }
    })
  }

  return (
    <div>
      <AdminPageHeader
        title={isAr ? "إدارة تصنيفات الأسئلة" : "Trivia Categories"}
        description={isAr ? "إضافة وتعديل التصنيفات المختلفة." : "Manage categories for trivia questions."}
        icon={LibraryBig}
        action={
          <button onClick={() => handleOpenModal()} className="flex items-center gap-2 px-4 py-2 bg-feps-navy text-white text-sm hover:bg-feps-navy-dark transition-colors font-bold uppercase tracking-wider">
            <Plus size={16} />
            {isAr ? "إضافة تصنيف" : "Add Category"}
          </button>
        }
      />

      {loading ? (
        <div className="flex justify-center py-20 text-feps-gold"><Loader className="animate-spin" size={40} /></div>
      ) : error ? (
        <div className="bg-red-50 text-red-600 p-6 flex items-center gap-3 border border-red-200">
          <AlertCircle size={24} /> {error}
        </div>
      ) : optimisticCategories.length === 0 ? (
        <div className="text-center py-20 text-feps-ink-secondary bg-white border border-feps-ink/10">
          <LibraryBig size={40} className="mx-auto mb-4 opacity-20" />
          <p>{isAr ? "لا توجد تصنيفات مسجلة" : "No categories found"}</p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{isAr ? "التصنيف" : "Category"}</TableHead>
              <TableHead>{isAr ? "اللون" : "Color"}</TableHead>
              <TableHead className="text-end">{isAr ? "الإجراءات" : "Actions"}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {optimisticCategories.map(c => (
              <TableRow key={c.id}>
                <TableCell>
                  <div className="font-bold text-feps-navy">{isAr ? c.nameAr : c.nameEn}</div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded border border-black/10" style={{ backgroundColor: c.color }} />
                    <span className="text-xs font-mono">{c.color}</span>
                  </div>
                </TableCell>
                <TableCell className="text-end">
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => handleOpenModal(c)} className="p-2 text-feps-navy hover:bg-feps-paper border border-transparent hover:border-feps-border transition-all">
                      <Edit size={16} />
                    </button>
                    <button onClick={() => handleDelete(c.id)} className="p-2 text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 transition-all">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* Modal */}
      <AdminModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? (isAr ? 'تعديل التصنيف' : 'Edit Category') : (isAr ? 'إضافة تصنيف' : 'Add Category')}
      >
        <div className="flex flex-col gap-6" dir={isAr ? 'rtl' : 'ltr'}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-bold text-feps-navy mb-2">Name (EN)</label>
              <input type="text" value={nameEn} onChange={e => setNameEn(e.target.value)} className="w-full p-3 border border-feps-border bg-feps-paper focus:outline-none focus:border-feps-navy" dir="ltr" />
            </div>
            <div>
              <label className="block text-sm font-bold text-feps-navy mb-2">Name (AR)</label>
              <input type="text" value={nameAr} onChange={e => setNameAr(e.target.value)} className="w-full p-3 border border-feps-border bg-feps-paper focus:outline-none focus:border-feps-navy" dir="rtl" />
            </div>
            <div>
              <label className="block text-sm font-bold text-feps-navy mb-2">Name (FR)</label>
              <input type="text" value={nameFr} onChange={e => setNameFr(e.target.value)} className="w-full p-3 border border-feps-border bg-feps-paper focus:outline-none focus:border-feps-navy" dir="ltr" />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-feps-border pt-4">
            <div>
              <label className="block text-sm font-bold text-feps-navy mb-2">Primary Color (Hex)</label>
              <div className="flex items-center gap-2">
                <input type="color" value={color} onChange={e => setColor(e.target.value)} className="w-12 h-12 p-1 bg-white border border-feps-border cursor-pointer" />
                <input type="text" value={color} onChange={e => setColor(e.target.value)} className="flex-1 p-3 border border-feps-border bg-feps-paper focus:outline-none focus:border-feps-navy" dir="ltr" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-feps-navy mb-2">Background Color (rgba)</label>
              <input type="text" value={bg} onChange={e => setBg(e.target.value)} className="w-full p-3 border border-feps-border bg-feps-paper focus:outline-none focus:border-feps-navy" dir="ltr" placeholder="rgba(26,58,110,0.12)" />
            </div>
          </div>

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
