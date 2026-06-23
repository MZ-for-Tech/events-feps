'use client'

import React, { useState, useOptimistic, useTransition } from 'react'
import { Shield, Plus, Edit2, Trash2, AlertCircle, Loader, Check } from 'lucide-react'
import toast from 'react-hot-toast'
import { PERMISSION_DEF } from '@/lib/permissions'

import { useTranslations } from 'next-intl'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/admin/AdminTable'
import { AdminButton } from '@/components/admin/AdminButton'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { AdminModal } from '@/components/admin/AdminModal'

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
  
  const [error, setError] = useState<string | null>(null)

  const [isPending, startTransition] = useTransition()

  type OptimisticAction = 
    | { type: 'ADD'; payload: User }
    | { type: 'UPDATE'; payload: User }
    | { type: 'DELETE'; id: string }

  const [optimisticUsers, updateOptimisticUsers] = useOptimistic(
    users,
    (state, action: OptimisticAction) => {
      switch (action.type) {
        case 'ADD':
          return [action.payload, ...state]
        case 'UPDATE':
          return state.map(u => u.id === action.payload.id ? action.payload : u)
        case 'DELETE':
          return state.filter(u => u.id !== action.id)
        default:
          return state
      }
    }
  )

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    
    const optimisticUser: User = {
      id: editingUser ? editingUser.id : `temp-${Date.now()}`,
      name: formData.name,
      email: formData.email,
      role: formData.role,
      permissions: formData.permissions,
      createdAt: editingUser ? editingUser.createdAt : new Date().toISOString()
    }

    startTransition(async () => {
      updateOptimisticUsers({
        type: editingUser ? 'UPDATE' : 'ADD',
        payload: optimisticUser
      })
      setIsModalOpen(false)

      try {
        const url = editingUser ? `/api/users/${editingUser.id}` : `/api/users`
        const method = editingUser ? 'PATCH' : 'POST'
        
        const payload: Record<string, unknown> = { ...formData }
        if (editingUser && !payload.password) {
          delete payload.password
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
        savedUser.permissions = typeof savedUser.permissions === 'string' ? JSON.parse(savedUser.permissions) : savedUser.permissions
        
        if (editingUser) {
          setUsers(prev => prev.map(u => u.id === savedUser.id ? { ...u, ...savedUser } : u))
          toast.success(isAr ? 'تم تحديث المستخدم' : 'User updated')
        } else {
          setUsers(prev => [savedUser, ...prev])
          toast.success(isAr ? 'تم إضافة المستخدم' : 'User added')
        }
      } catch (err: unknown) {
        if (err instanceof Error) {
          toast.error(err.message)
        } else {
          toast.error(String(err))
        }
      }
    })
  }

  const handleDelete = (id: string) => {
    if (!confirm(t('confirmDelete'))) return
    
    startTransition(async () => {
      updateOptimisticUsers({ type: 'DELETE', id })
      try {
        const res = await fetch(`/api/users/${id}`, { method: 'DELETE' })
        if (!res.ok) throw new Error('Failed to delete')
        setUsers(prev => prev.filter(u => u.id !== id))
        toast.success(isAr ? 'تم حذف المستخدم' : 'User deleted')
      } catch (err: unknown) {
        if (err instanceof Error) {
          toast.error(err.message)
        } else {
          toast.error(String(err))
        }
      }
    })
  }

  return (
    <div dir={isAr ? 'rtl' : 'ltr'}>
      <AdminPageHeader
        title={t('systemAndPermissions')}
        description={t('subtitle')}
        icon={Shield}
        action={
          <AdminButton onClick={handleOpenCreate} icon={Plus}>
            {t('addUser')}
          </AdminButton>
        }
      />

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('user')}</TableHead>
            <TableHead>{t('permissions')}</TableHead>
            <TableHead className="text-center">{t('actions')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {optimisticUsers.map(user => (
            <TableRow key={user.id}>
              <TableCell>
                <div className="font-bold text-feps-ink">{user.name}</div>
                <div className="text-xs text-feps-ink-secondary mt-1">{user.email}</div>
                {user.role === 'SUPERADMIN' ? (
                  <span className="inline-block mt-2 bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                    {t.has(`roles.${user.role}`) ? t(`roles.${user.role}` as Parameters<typeof t>[0]) : user.role}
                  </span>
                ) : (
                  <span className="inline-block mt-2 bg-slate-100 text-slate-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                    {t.has(`roles.${user.role}`) ? t(`roles.${user.role}` as Parameters<typeof t>[0]) : user.role}
                  </span>
                )}
              </TableCell>
              <TableCell>
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
              </TableCell>
              <TableCell className="text-center">
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
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <AdminModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingUser ? t('editUser') : t('newUser')}
        maxWidthClass="max-w-2xl"
      >
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
              disabled={isPending}
              className="flex-1 bg-feps-navy text-white py-3 font-bold uppercase tracking-widest hover:bg-black transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isPending && <Loader size={16} className="animate-spin" />}
              {t('save')}
            </button>
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              disabled={isPending}
              className="flex-1 bg-feps-ink/10 text-feps-ink py-3 font-bold uppercase tracking-widest hover:bg-feps-ink/20 transition-colors disabled:opacity-50"
            >
              {t('cancel')}
            </button>
          </div>
        </form>
      </AdminModal>
    </div>
  )
}
