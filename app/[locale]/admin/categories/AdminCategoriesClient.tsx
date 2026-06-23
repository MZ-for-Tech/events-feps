'use client'

import React, { useState, useOptimistic, useTransition } from 'react'
import { useTranslations } from 'next-intl'
import toast from 'react-hot-toast'
import { Plus, Edit2, Trash2, Save, Loader, Tags } from 'lucide-react'
import { EventCategoryData } from '@/components/EventCard'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/admin/AdminTable'
import { AdminButton } from '@/components/admin/AdminButton'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { AdminModal } from '@/components/admin/AdminModal'

interface Props {
  initialCategories: EventCategoryData[]
  locale: string
}

export default function AdminCategoriesClient({ initialCategories, locale }: Props) {
  const isAr = locale === 'ar'
  const t = useTranslations('AdminCategories')

  const [categories, setCategories] = useState(initialCategories)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<EventCategoryData | null>(null)

  const [isPending, startTransition] = useTransition()

  type OptimisticAction = 
    | { type: 'ADD'; payload: EventCategoryData }
    | { type: 'UPDATE'; payload: EventCategoryData }
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

  const [form, setForm] = useState({
    nameEn: '',
    nameAr: '',
    nameFr: '',
    color: '#1A3A6E',
    bg: 'rgba(26,58,110,0.12)'
  })

  function handleOpenCreate() {
    setEditingCategory(null)
    setForm({
      nameEn: '',
      nameAr: '',
      nameFr: '',
      color: '#1A3A6E',
      bg: 'rgba(26,58,110,0.12)'
    })
    setIsModalOpen(true)
  }

  function handleOpenEdit(cat: EventCategoryData) {
    setEditingCategory(cat)
    setForm({
      nameEn: cat.nameEn,
      nameAr: cat.nameAr,
      nameFr: cat.nameFr,
      color: cat.color,
      bg: cat.bg
    })
    setIsModalOpen(true)
  }

  function handleDelete(id: string) {
    if (!confirm(isAr ? 'هل أنت متأكد من حذف هذا التصنيف؟' : 'Are you sure you want to delete this category?')) return

    startTransition(async () => {
      updateOptimisticCategories({ type: 'DELETE', id })
      try {
        const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' })
        if (res.ok) {
          setCategories(prev => prev.filter(c => c.id !== id))
          toast.success(isAr ? 'تم الحذف بنجاح' : 'Category deleted successfully')
        } else {
          toast.error(isAr ? 'خطأ في الحذف' : 'Failed to delete category')
        }
      } catch (err) {
        console.error(err)
        toast.error('Network error')
      }
    })
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    const optimisticCategory: EventCategoryData = {
      id: editingCategory ? editingCategory.id : `temp-${Date.now()}`,
      nameEn: form.nameEn,
      nameAr: form.nameAr,
      nameFr: form.nameFr,
      color: form.color,
      bg: form.bg
    }

    startTransition(async () => {
      updateOptimisticCategories({
        type: editingCategory ? 'UPDATE' : 'ADD',
        payload: optimisticCategory
      })
      setIsModalOpen(false) // Close instantly

      try {
        const url = editingCategory ? `/api/categories/${editingCategory.id}` : '/api/categories'
        const method = editingCategory ? 'PATCH' : 'POST'
        
        const res = await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form)
        })

        if (res.ok) {
          const saved = await res.json()
          if (editingCategory) {
            setCategories(prev => prev.map(c => c.id === saved.id ? saved : c))
            toast.success(isAr ? 'تم تحديث التصنيف' : 'Category updated')
          } else {
            setCategories(prev => [saved, ...prev])
            toast.success(isAr ? 'تم إنشاء التصنيف' : 'Category created')
          }
        } else {
          toast.error(isAr ? 'حدث خطأ أثناء الحفظ' : 'Error saving category')
        }
      } catch (err) {
        console.error(err)
        toast.error('Network error')
      }
    })
  }

  return (
    <div>
      <AdminPageHeader
        title={isAr ? 'إدارة التصنيفات' : 'Categories Management'}
        description={isAr ? 'إضافة وتعديل وحذف تصنيفات الفعاليات المتاحة بالنظام.' : 'Add, edit, and remove available event categories.'}
        icon={Tags}
        action={
          <AdminButton onClick={handleOpenCreate} icon={Plus}>
            {isAr ? 'تصنيف جديد' : 'New Category'}
          </AdminButton>
        }
      />

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{isAr ? 'الاسم (عربي)' : 'Name (Arabic)'}</TableHead>
              <TableHead>{isAr ? 'الاسم (إنجليزي)' : 'Name (English)'}</TableHead>
              <TableHead>{isAr ? 'الاسم (فرنسي)' : 'Name (French)'}</TableHead>
              <TableHead>{isAr ? 'اللون' : 'Color'}</TableHead>
              <TableHead className="text-center">{isAr ? 'إجراءات' : 'Actions'}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {optimisticCategories.map((cat) => (
              <TableRow key={cat.id}>
                <TableCell className="font-bold text-feps-ink">{cat.nameAr}</TableCell>
                <TableCell className="text-feps-ink">{cat.nameEn}</TableCell>
                <TableCell className="text-feps-ink">{cat.nameFr}</TableCell>
                <TableCell>
                  <span 
                    className="px-3 py-1 font-sans text-xs font-bold uppercase tracking-widest inline-block"
                    style={{ color: cat.color, backgroundColor: cat.bg }}
                  >
                    {cat.color}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => handleOpenEdit(cat)}
                      className="bg-feps-paper text-feps-ink border border-feps-border w-8 h-8 flex items-center justify-center hover:bg-feps-ink hover:text-white transition-colors"
                      title={isAr ? 'تعديل' : 'Edit'}
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(cat.id)}
                      className="bg-red-50 text-red-600 border border-red-100 w-8 h-8 flex items-center justify-center hover:bg-red-600 hover:text-white transition-colors"
                      title={isAr ? 'حذف' : 'Delete'}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {optimisticCategories.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="px-6 py-8 text-center text-feps-ink-secondary">
                  {isAr ? 'لا يوجد تصنيفات.' : 'No categories found.'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

      <AdminModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCategory ? (isAr ? 'تعديل التصنيف' : 'Edit Category') : (isAr ? 'تصنيف جديد' : 'New Category')}
        maxWidthClass="max-w-lg"
      >
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-start text-xs font-bold text-feps-ink mb-2 uppercase tracking-wider">
                {isAr ? 'الاسم (إنجليزي)' : 'Name (English)'} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={form.nameEn}
                onChange={e => setForm({ ...form, nameEn: e.target.value })}
                className="w-full px-3 py-2 border border-feps-ink/20 bg-feps-paper text-feps-ink text-sm focus:outline-none focus:ring-1 focus:ring-feps-ink"
                dir="ltr"
              />
            </div>
            <div>
              <label className="block text-start text-xs font-bold text-feps-ink mb-2 uppercase tracking-wider">
                {isAr ? 'الاسم (عربي)' : 'Name (Arabic)'} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={form.nameAr}
                onChange={e => setForm({ ...form, nameAr: e.target.value })}
                className="w-full px-3 py-2 border border-feps-ink/20 bg-feps-paper text-feps-ink text-sm focus:outline-none focus:ring-1 focus:ring-feps-ink"
                dir="rtl"
              />
            </div>
            <div>
              <label className="block text-start text-xs font-bold text-feps-ink mb-2 uppercase tracking-wider">
                {isAr ? 'الاسم (فرنسي)' : 'Name (French)'} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={form.nameFr}
                onChange={e => setForm({ ...form, nameFr: e.target.value })}
                className="w-full px-3 py-2 border border-feps-ink/20 bg-feps-paper text-feps-ink text-sm focus:outline-none focus:ring-1 focus:ring-feps-ink"
                dir="ltr"
              />
            </div>
            <div>
              <label className="block text-start text-xs font-bold text-feps-ink mb-2 uppercase tracking-wider">
                {isAr ? 'لون التصنيف' : 'Category Color'}
              </label>
              <div className="flex gap-4 items-center">
                <input
                  type="color"
                  value={form.color}
                  onChange={e => {
                    const val = e.target.value;
                    const r = parseInt(val.slice(1, 3), 16) || 0;
                    const g = parseInt(val.slice(3, 5), 16) || 0;
                    const b = parseInt(val.slice(5, 7), 16) || 0;
                    setForm({ ...form, color: val, bg: `rgba(${r},${g},${b},0.12)` });
                  }}
                  className="w-12 h-12 cursor-pointer border border-feps-border p-1"
                />
                <div className="flex-1">
                  <p className="text-xs text-feps-ink-secondary leading-relaxed">
                    {t('colorHint')}
                  </p>
                </div>
              </div>
            </div>
            <div className="pt-4 border-t border-feps-border">
              <div className="mb-2 text-xs font-bold text-feps-ink-secondary uppercase">{t('preview')}</div>
              <span 
                className="px-3 py-1 font-sans text-xs font-bold uppercase tracking-widest inline-block"
                style={{ color: form.color, backgroundColor: form.bg }}
              >
                {isAr ? (form.nameAr || 'عينة') : (form.nameEn || 'Sample')}
              </span>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-feps-border flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-6 py-2 border border-feps-ink/20 text-feps-ink text-sm font-bold uppercase tracking-widest hover:bg-feps-ink/5 transition-colors"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex items-center gap-2 px-6 py-2 bg-feps-ink text-feps-paper text-sm font-bold uppercase tracking-widest hover:bg-feps-navy transition-colors disabled:opacity-50"
            >
              {isPending ? <Loader size={16} className="animate-spin" /> : <Save size={16} />}
              {t('save')}
            </button>
          </div>
        </form>
      </AdminModal>
    </div>
  )
}
