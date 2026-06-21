'use client'

import React, { useState } from 'react'
import { Shield, Plus, Edit2, Trash2, AlertCircle, Loader, Check } from 'lucide-react'
import { PERMISSION_DEF } from '@/lib/permissions'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'

interface User {
  id: string
  name: string
  email: string
  role: string
  permissions: string[]
  createdAt: string
}

interface Props {
  initialUsers: User[]
  locale: string
  currentUserRole: string
}

export default function AdminUsersClient({ initialUsers, locale, currentUserRole }: Props) {
  const isAr = locale === 'ar'
  const router = useRouter()
  const t = useTranslations('AdminUsers')
  
  const [users, setUsers] = useState<User[]>(initialUsers)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'EDITOR',
    permissions: [] as string[]
  })
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleOpenCreate = () => {
    setEditingUser(null)
    setFormData({ name: '', email: '', password: '', role: 'EDITOR', permissions: [PERMISSION_DEF[0].id] })
    setError(null)
    setIsModalOpen(true)
  }

  const handleOpenEdit = (user: User) => {
    setEditingUser(user)
    setFormData({ 
      name: user.name, 
      email: user.email, 
      password: '', // Blank implies no change
      role: user.role, 
      permissions: user.permissions 
    })
    setError(null)
    setIsModalOpen(true)
  }

  const handleTogglePermission = (permId: string) => {
    setFormData(prev => {
      const perms = prev.permissions.includes(permId)
        ? prev.permissions.filter(p => p !== permId)
        : [...prev.permissions, permId]
      return { ...prev, permissions: perms }
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const url = editingUser ? `/api/users/${editingUser.id}` : `/api/users`
      const method = editingUser ? 'PATCH' : 'POST'
      
      const payload: Record<string, unknown> = { ...formData }
      if (editingUser && !payload.password) {
        delete payload.password // don't send empty password
      }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!res.ok) {
        const txt = await res.text()
        throw new Error(txt || 'Failed to save user')
      }

      const savedUser = await res.json()
      // ensure permissions is parsed
      savedUser.permissions = typeof savedUser.permissions === 'string' ? JSON.parse(savedUser.permissions) : savedUser.permissions
      
      if (editingUser) {
        setUsers(users.map(u => u.id === savedUser.id ? { ...u, ...savedUser } : u))
      } else {
        setUsers([savedUser, ...users])
      }
      
      setIsModalOpen(false)
      router.refresh()
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError(String(err))
      }
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm(t('confirmDelete'))) return
    try {
      const res = await fetch(`/api/users/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete')
      setUsers(users.filter(u => u.id !== id))
    } catch (err: unknown) {
      if (err instanceof Error) {
        alert(err.message)
      } else {
        alert(String(err))
      }
    }
  }

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto" dir={isAr ? 'rtl' : 'ltr'}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-serif text-feps-navy flex items-center gap-3">
            <Shield size={28} />
            {t('systemAndPermissions')}
          </h1>
          <p className="text-feps-ink-secondary mt-2 text-sm">
            {t('subtitle')}
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="bg-feps-navy text-white px-6 py-3 font-bold uppercase tracking-widest text-sm flex items-center gap-2 hover:bg-black transition-colors"
        >
          <Plus size={18} />
          {t('addUser')}
        </button>
      </div>

      <div className="bg-white border border-feps-ink/20 overflow-x-auto shadow-sm">
        <table className="w-full text-left rtl:text-right">
          <thead>
            <tr className="bg-feps-ink/5 border-b border-feps-ink/20">
              <th className="p-4 font-bold text-xs uppercase tracking-widest text-feps-ink-secondary">{t('user')}</th>
              <th className="p-4 font-bold text-xs uppercase tracking-widest text-feps-ink-secondary">{t('permissions')}</th>
              <th className="p-4 font-bold text-xs uppercase tracking-widest text-feps-ink-secondary text-center">{t('actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-feps-ink/10">
            {users.map(user => (
              <tr key={user.id} className="hover:bg-feps-ink/5 transition-colors">
                <td className="p-4">
                  <div className="font-bold text-feps-ink">{user.name}</div>
                  <div className="text-xs text-feps-ink-secondary mt-1">{user.email}</div>
                  {user.role === 'SUPERADMIN' && (
                    <span className="inline-block mt-2 bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                      SUPERADMIN
                    </span>
                  )}
                </td>
                <td className="p-4">
                  <div className="flex flex-wrap gap-2">
                    {user.role === 'SUPERADMIN' ? (
                      <span className="text-xs text-feps-ink font-bold px-2 py-1 bg-feps-ink/10 border border-feps-ink/20">
                        {t('fullAccess')}
                      </span>
                    ) : (
                      user.permissions.map(perm => {
                        const def = PERMISSION_DEF.find(p => p.id === perm)
                        if (!def) return null
                        return (
                          <span key={perm} className="text-xs text-feps-navy px-2 py-1 bg-feps-navy/10 border border-feps-navy/20">
                            {isAr ? def.labelAr : def.labelEn}
                          </span>
                        )
                      })
                    )}
                  </div>
                </td>
                <td className="p-4 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => handleOpenEdit(user)}
                      className="text-feps-ink/50 hover:text-feps-navy transition-colors p-1"
                      disabled={user.role === 'SUPERADMIN' && currentUserRole !== 'SUPERADMIN'}
                      title={t('edit')}
                    >
                      <Edit2 size={16} />
                    </button>
                    {user.role !== 'SUPERADMIN' && (
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="text-feps-ink/50 hover:text-red-600 transition-colors p-1"
                        title={t('delete')}
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-feps-navy/50 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-2xl border-t-4 border-feps-navy shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 md:p-8">
              <h2 className="text-2xl font-serif text-feps-navy mb-6">
                {editingUser ? t('editUser') : (t('newUser'))}
              </h2>

              {error && (
                <div className="mb-6 bg-red-50 text-red-600 p-4 border-l-4 border-red-600 flex items-center gap-3 text-sm">
                  <AlertCircle size={18} /> {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-feps-ink-secondary mb-2">{t('name')}</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      className="w-full border border-feps-ink/20 bg-transparent p-3 focus:outline-none focus:border-feps-navy text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-feps-ink-secondary mb-2">{t('email')}</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                      className="w-full border border-feps-ink/20 bg-transparent p-3 focus:outline-none focus:border-feps-navy text-sm text-left"
                      dir="ltr"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-feps-ink-secondary mb-2">
                    {t('password')} {editingUser && (isAr ? '(اتركه فارغاً لعدم التغيير)' : '(Leave blank to keep unchanged)')}
                  </label>
                  <input
                    type="password"
                    required={!editingUser}
                    value={formData.password}
                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                    className="w-full border border-feps-ink/20 bg-transparent p-3 focus:outline-none focus:border-feps-navy text-sm"
                    dir="ltr"
                  />
                </div>

                <div className="border-t border-feps-ink/10 pt-6">
                  <label className="block text-xs font-bold uppercase tracking-widest text-feps-ink-secondary mb-4">{t('granularPermissions')}</label>
                  
                  <div className="space-y-3 bg-feps-ink/5 p-4 border border-feps-ink/10">
                    {PERMISSION_DEF.map(perm => (
                      <label key={perm.id} className="flex items-center gap-3 cursor-pointer group">
                        <div className="relative flex items-center justify-center">
                          <input
                            type="checkbox"
                            checked={formData.permissions.includes(perm.id) || formData.role === 'SUPERADMIN'}
                            onChange={() => handleTogglePermission(perm.id)}
                            disabled={formData.role === 'SUPERADMIN'}
                            className="peer sr-only"
                          />
                          <div className={`w-5 h-5 border-2 flex items-center justify-center transition-colors ${formData.role === 'SUPERADMIN' ? 'border-feps-ink/30 bg-feps-ink/10 cursor-not-allowed' : 'border-feps-ink/20 peer-checked:border-feps-navy peer-checked:bg-feps-navy'}`}>
                            {(formData.permissions.includes(perm.id) || formData.role === 'SUPERADMIN') && <Check size={14} className="text-white" />}
                          </div>
                        </div>
                        <span className={`text-sm ${formData.role === 'SUPERADMIN' ? 'text-feps-ink/50' : 'text-feps-ink group-hover:text-feps-navy'} transition-colors`}>
                          {isAr ? perm.labelAr : perm.labelEn}
                        </span>
                      </label>
                    ))}
                  </div>
                  {formData.role === 'SUPERADMIN' && (
                    <p className="text-xs text-amber-600 mt-2 font-bold flex items-center gap-1">
                      <AlertCircle size={12} /> {t('allPermissionsAlert')}
                    </p>
                  )}
                </div>

                <div className="flex gap-4 pt-6">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-feps-navy text-white py-3 font-bold uppercase tracking-widest hover:bg-black transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading && <Loader size={16} className="animate-spin" />}
                    {t('save')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    disabled={loading}
                    className="flex-1 bg-feps-ink/10 text-feps-ink py-3 font-bold uppercase tracking-widest hover:bg-feps-ink/20 transition-colors disabled:opacity-50"
                  >
                    {t('cancel')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
