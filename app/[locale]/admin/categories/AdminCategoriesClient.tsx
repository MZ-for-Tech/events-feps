'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Plus, Edit2, Trash2, X, Save, Loader } from 'lucide-react'
import { EventCategoryData } from '@/components/EventCard'

interface Props {
  initialCategories: EventCategoryData[]
  locale: string
}

export default function AdminCategoriesClient({ initialCategories, locale }: Props) {
  const router = useRouter()
  const isAr = locale === 'ar'
  const t = useTranslations('AdminCategories')

  const [categories, setCategories] = useState(initialCategories)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<EventCategoryData | null>(null)
  const [loading, setLoading] = useState(false)

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

  async function handleDelete(id: string) {
    if (!confirm(isAr ? 'هل أنت متأكد من حذف هذا التصنيف؟' : 'Are you sure you want to delete this category?')) return

    try {
      const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setCategories(categories.filter(c => c.id !== id))
        router.refresh()
      } else {
        const text = await res.text()
        alert((isAr ? 'خطأ في الحذف: ' : 'Delete error: ') + text)
      }
    } catch (err) {
      console.error(err)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    
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
          setCategories(categories.map(c => c.id === saved.id ? saved : c))
        } else {
          setCategories([saved, ...categories])
        }
        setIsModalOpen(false)
        router.refresh()
      } else {
        alert(isAr ? 'حدث خطأ أثناء الحفظ' : 'Error saving category')
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-serif text-feps-ink mb-2">
            {isAr ? 'إدارة التصنيفات' : 'Categories Management'}
          </h1>
          <p className="font-mono text-sm text-feps-ink-secondary">
            {isAr ? 'إضافة وتعديل وحذف تصنيفات الفعاليات المتاحة بالنظام.' : 'Add, edit, and remove available event categories.'}
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-feps-ink text-feps-paper font-mono text-xs uppercase tracking-widest font-semibold hover:bg-feps-navy transition-colors shrink-0"
        >
          <Plus size={16} />
          {isAr ? 'تصنيف جديد' : 'New Category'}
        </button>
      </div>

      <div className="bg-feps-surface border border-feps-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-feps-paper border-b border-feps-border font-mono text-xs uppercase tracking-wider text-feps-ink-secondary">
              <tr>
                <th className="px-6 py-4 font-semibold">{isAr ? 'الاسم (عربي)' : 'Name (Arabic)'}</th>
                <th className="px-6 py-4 font-semibold">{isAr ? 'الاسم (إنجليزي)' : 'Name (English)'}</th>
                <th className="px-6 py-4 font-semibold">{isAr ? 'الاسم (فرنسي)' : 'Name (French)'}</th>
                <th className="px-6 py-4 font-semibold">{isAr ? 'اللون' : 'Color'}</th>
                <th className="px-6 py-4 font-semibold text-center">{isAr ? 'إجراءات' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-feps-border/50">
              {categories.map((cat) => (
                <tr key={cat.id} className="hover:bg-feps-paper/50 transition-colors">
                  <td className="px-6 py-4 font-bold text-feps-ink">{cat.nameAr}</td>
                  <td className="px-6 py-4 text-feps-ink">{cat.nameEn}</td>
                  <td className="px-6 py-4 text-feps-ink">{cat.nameFr}</td>
                  <td className="px-6 py-4">
                    <span 
                      className="px-3 py-1 font-mono text-xs font-bold uppercase tracking-widest inline-block"
                      style={{ color: cat.color, backgroundColor: cat.bg }}
                    >
                      {cat.color}
                    </span>
                  </td>
                  <td className="px-6 py-4">
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
                  </td>
                </tr>
              ))}
              {categories.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-feps-ink-secondary">
                    {isAr ? 'لا يوجد تصنيفات.' : 'No categories found.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-feps-ink/50 backdrop-blur-sm">
          <div className="bg-feps-surface w-full max-w-lg shadow-2xl border border-feps-border flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-6 border-b border-feps-border bg-feps-paper">
              <h2 className="text-xl font-serif text-feps-ink">
                {editingCategory 
                  ? (isAr ? 'تعديل التصنيف' : 'Edit Category')
                  : (isAr ? 'تصنيف جديد' : 'New Category')}
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-feps-ink-secondary hover:text-feps-ink transition-colors p-1"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 flex-1 overflow-y-auto">
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
                    className="px-3 py-1 font-mono text-xs font-bold uppercase tracking-widest inline-block"
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
                  disabled={loading}
                  className="flex items-center gap-2 px-6 py-2 bg-feps-ink text-feps-paper text-sm font-bold uppercase tracking-widest hover:bg-feps-navy transition-colors disabled:opacity-50"
                >
                  {loading ? <Loader size={16} className="animate-spin" /> : <Save size={16} />}
                  {t('save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
