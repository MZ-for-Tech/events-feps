'use client'

import React, { useEffect, useState } from 'react'
import { Activity, Clock, User, Filter, AlertCircle, Loader, Search } from 'lucide-react'
import { format } from 'date-fns'

interface LogUser {
  name: string
  email: string
  role: string
}

interface AuditLog {
  id: string
  timestamp: string
  action: string
  userId: string | null
  entityType: string | null
  entityId: string | null
  details: string | null
  user: LogUser | null
}

export default function AdminLogsClient({ locale }: { locale: string }) {
  const isAr = locale === 'ar'
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const [filterAction, setFilterAction] = useState<string>('ALL')
  const [searchQuery, setSearchQuery] = useState<string>('')

  useEffect(() => {
    fetch('/api/logs')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch logs')
        return res.json()
      })
      .then(data => setLogs(data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  const filteredLogs = logs.filter(log => {
    const matchAction = filterAction === 'ALL' || log.action === filterAction
    const searchString = `${log.user?.name || ''} ${log.action} ${log.details || ''}`.toLowerCase()
    const matchSearch = searchString.includes(searchQuery.toLowerCase())
    return matchAction && matchSearch
  })

  // Group actions to generate unique filter options
  const uniqueActions = Array.from(new Set(logs.map(l => l.action)))

  const formatDetails = (details: string | null) => {
    if (!details) return '-'
    try {
      const parsed = JSON.parse(details)
      return Object.entries(parsed).map(([k, v]) => `${k}: ${v}`).join(', ')
    } catch {
      return details
    }
  }

  const getActionColor = (action: string) => {
    if (action.includes('CREATE')) return 'text-green-600 bg-green-50 border-green-200'
    if (action.includes('DELETE')) return 'text-red-600 bg-red-50 border-red-200'
    if (action.includes('UPDATE')) return 'text-amber-600 bg-amber-50 border-amber-200'
    if (action.includes('NOTE')) return 'text-blue-600 bg-blue-50 border-blue-200'
    return 'text-feps-ink bg-feps-ink/5 border-feps-ink/10'
  }

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto" dir={isAr ? 'rtl' : 'ltr'}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-serif text-feps-navy flex items-center gap-3">
            <Activity size={28} />
            {isAr ? 'سجل النشاطات (Audit Logs)' : 'System Activity Logs'}
          </h1>
          <p className="text-feps-ink-secondary mt-2 text-sm">
            {isAr ? 'تتبع كامل لحركات المستخدمين وتعديلاتهم على النظام.' : 'Complete tracking of user actions and system modifications.'}
          </p>
        </div>
      </div>

      <div className="bg-white border border-feps-ink/20 shadow-sm p-4 mb-6 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search size={16} className={`absolute top-3 ${isAr ? 'right-3' : 'left-3'} text-feps-ink/40`} />
          <input 
            type="text" 
            placeholder={isAr ? 'ابحث في السجل...' : 'Search logs...'}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className={`w-full border border-feps-ink/20 bg-feps-ink/5 p-2 focus:outline-none focus:border-feps-navy text-sm ${isAr ? 'pr-10' : 'pl-10'}`}
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-feps-ink-secondary" />
          <select 
            value={filterAction}
            onChange={e => setFilterAction(e.target.value)}
            className="border border-feps-ink/20 bg-feps-ink/5 p-2 focus:outline-none text-sm"
          >
            <option value="ALL">{isAr ? 'جميع العمليات' : 'All Actions'}</option>
            {uniqueActions.map(act => <option key={act} value={act}>{act}</option>)}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20 text-feps-gold"><Loader className="animate-spin" size={40} /></div>
      ) : error ? (
        <div className="bg-red-50 text-red-600 p-6 flex items-center gap-3 border border-red-200">
          <AlertCircle size={24} /> {error}
        </div>
      ) : filteredLogs.length === 0 ? (
        <div className="text-center py-20 text-feps-ink-secondary bg-white border border-feps-ink/10">
          <Activity size={40} className="mx-auto mb-4 opacity-20" />
          <p>{isAr ? 'لا يوجد أي نشاط يطابق بحثك.' : 'No activity logs match your search.'}</p>
        </div>
      ) : (
        <div className="bg-white border border-feps-ink/20 overflow-x-auto shadow-sm">
          <table className="w-full text-left rtl:text-right text-sm">
            <thead>
              <tr className="bg-feps-ink/5 border-b border-feps-ink/20">
                <th className="p-4 font-bold uppercase tracking-wider text-feps-ink-secondary">{isAr ? 'التاريخ والوقت' : 'Timestamp'}</th>
                <th className="p-4 font-bold uppercase tracking-wider text-feps-ink-secondary">{isAr ? 'المستخدم' : 'User'}</th>
                <th className="p-4 font-bold uppercase tracking-wider text-feps-ink-secondary">{isAr ? 'العملية' : 'Action'}</th>
                <th className="p-4 font-bold uppercase tracking-wider text-feps-ink-secondary">{isAr ? 'التفاصيل' : 'Details'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-feps-ink/10">
              {filteredLogs.map(log => (
                <tr key={log.id} className="hover:bg-feps-ink/5 transition-colors">
                  <td className="p-4 whitespace-nowrap text-feps-ink-secondary flex items-center gap-2">
                    <Clock size={14} />
                    {format(new Date(log.timestamp), 'yyyy-MM-dd HH:mm:ss')}
                  </td>
                  <td className="p-4">
                    {log.user ? (
                      <div>
                        <div className="font-bold text-feps-navy">{log.user.name}</div>
                        <div className="text-xs text-feps-ink-secondary">{log.user.role}</div>
                      </div>
                    ) : (
                      <span className="text-feps-ink-secondary italic">System / Deleted User</span>
                    )}
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 text-xs font-bold border rounded-sm ${getActionColor(log.action)}`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="p-4 text-feps-ink-secondary max-w-md truncate" title={formatDetails(log.details)}>
                    {log.entityType && <span className="font-bold text-feps-ink mr-2">[{log.entityType}]</span>}
                    {formatDetails(log.details)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
