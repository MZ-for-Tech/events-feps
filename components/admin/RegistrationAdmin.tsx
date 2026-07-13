'use client'

import React, { useState, useEffect } from 'react'
import { Users, Download, Trash2, CheckCircle, Save, Loader } from 'lucide-react'

interface Registration {
  id: string
  name: string | null
  email: string
  identifier: string
  identifierType: 'CREDIT_CODE' | 'NATIONAL_ID'
  createdAt: string
}

interface Props {
  eventId: string
  initialEnabled: boolean
  initialOpen: boolean
  initialMode: string
  isAr: boolean
  surveyResponsesCount: number
}

export default function RegistrationAdmin({
  eventId,
  initialEnabled,
  initialOpen,
  initialMode,
  isAr,
  surveyResponsesCount
}: Props) {
  const [enabled, setEnabled] = useState(initialEnabled)
  const [open, setOpen] = useState(initialOpen)
  const [mode, setMode] = useState(initialMode)
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<string | null>(null)

  useEffect(() => {
    fetchRegistrations()
  }, [eventId])

  const fetchRegistrations = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/events/${eventId}/registrations`)
      if (res.ok) {
        const data = await res.json()
        setRegistrations(data)
      }
    } catch (error) {
      console.error('Error fetching registrations:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveSettings = async () => {
    setSaving(true)
    setSaveStatus(null)
    try {
      const res = await fetch(`/api/events/${eventId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          registrationEnabled: enabled,
          registrationOpen: open,
          registrationMode: mode
        })
      })
      if (res.ok) {
        setSaveStatus(isAr ? 'تم حفظ الإعدادات بنجاح' : 'Settings saved successfully')
      } else {
        setSaveStatus(isAr ? 'خطأ أثناء الحفظ' : 'Error saving settings')
      }
    } catch {
      setSaveStatus(isAr ? 'خطأ أثناء الحفظ' : 'Error saving settings')
    } finally {
      setSaving(false)
      setTimeout(() => setSaveStatus(null), 3000)
    }
  }

  const handleDeleteRegistration = async (regId: string) => {
    const confirmed = window.confirm(
      isAr 
        ? 'هل أنت متأكد من رغبتك في حذف هذا التسجيل؟' 
        : 'Are you sure you want to delete this registration?'
    )
    if (!confirmed) return

    try {
      const res = await fetch(`/api/events/${eventId}/registrations?registrationId=${regId}`, {
        method: 'DELETE'
      })
      if (res.ok) {
        setRegistrations(registrations.filter((r) => r.id !== regId))
      }
    } catch (error) {
      console.error('Error deleting registration:', error)
    }
  }

  const handleExportExcel = () => {
    window.open(`/api/events/${eventId}/registrations/export`, '_blank')
  }

  // Stats calculation
  const totalReg = registrations.length
  const completionRate = totalReg > 0 ? Math.min(100, Math.round((surveyResponsesCount / totalReg) * 100)) : 0

  return (
    <div className="space-y-8 p-6">
      {/* Settings Section */}
      <div className="border border-feps-ink/20 p-6 bg-white shadow-sm">
        <h2 className="text-xl font-serif mb-6 text-feps-navy border-b border-feps-ink/10 pb-2">
          {isAr ? 'إعدادات التسجيل وحضور الفعالية' : 'Registration & Attendance Settings'}
        </h2>
        
        <div className="space-y-6">
          {/* Toggle Switch */}
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-bold text-feps-ink block mb-1">
                {isAr ? 'تفعيل التسجيل للفعالية' : 'Enable Event Registration'}
              </label>
              <span className="text-xs text-feps-ink-secondary">
                {isAr 
                  ? 'يتطلب من الحضور التسجيل للتمكن من تعبئة استبيان التقييم لاحقاً'
                  : 'Requires attendees to register to be eligible to submit the feedback survey'}
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={enabled}
                onChange={(e) => setEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[\'\'] after:absolute after:top-[2px] after:left-[2px] rtl:after:left-auto rtl:after:right-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
            </label>
          </div>

          {/* Open/Close Toggle */}
          {enabled && (
            <div className="flex items-center justify-between pt-4 border-t border-feps-ink/10">
              <div>
                <label className="text-sm font-bold text-feps-ink block mb-1">
                  {isAr ? 'حالة فترة التسجيل' : 'Registration Period Status'}
                </label>
                <span className="text-xs text-feps-ink-secondary">
                  {isAr 
                    ? 'عند الإغلاق، لا يمكن تسجيل حضور جديد ولكن يمكن للذين سجلوا سابقاً إتمام التقييم'
                    : 'When closed, no new attendees can register, but existing registrants can still complete the survey'}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs font-bold px-2 py-0.5 rounded ${open ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {open ? (isAr ? 'مفتوح للتسجيل' : 'Open') : (isAr ? 'مغلق للتسجيل' : 'Closed')}
                </span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={open}
                    onChange={(e) => setOpen(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[\'\'] after:absolute after:top-[2px] after:left-[2px] rtl:after:left-auto rtl:after:right-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                </label>
              </div>
            </div>
          )}

          {/* Mode Selection */}
          {enabled && (
            <div className="pt-4 border-t border-feps-ink/10">
              <label className="text-sm font-bold text-feps-ink block mb-3">
                {isAr ? 'طريقة التحقق المقبولة للتسجيل' : 'Allowed Verification Identifier'}
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { value: 'CREDIT_CODE', labelAr: 'كود الساعات المعتمدة (7 أرقام)', labelEn: 'Credit Hour Code (7 digits)' },
                  { value: 'NATIONAL_ID', labelAr: 'الرقم القومي (14 رقم)', labelEn: 'National ID (14 digits)' },
                  { value: 'BOTH', labelAr: 'كلاهما مقبول', labelEn: 'Both Allowed' }
                ].map((item) => (
                  <label
                    key={item.value}
                    className={`flex items-center gap-3 p-3 border cursor-pointer hover:bg-feps-ink/5 transition-colors ${mode === item.value ? 'border-feps-navy bg-feps-navy/5' : 'border-feps-ink/20'}`}
                  >
                    <input
                      type="radio"
                      name="registrationMode"
                      value={item.value}
                      checked={mode === item.value}
                      onChange={() => setMode(item.value)}
                      className="text-feps-navy focus:ring-feps-navy"
                    />
                    <span className="text-sm font-bold text-feps-ink">
                      {isAr ? item.labelAr : item.labelEn}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Save buttons */}
          <div className="flex items-center gap-4 pt-4 border-t border-feps-ink/10 justify-end">
            {saveStatus && (
              <span className="text-green-600 flex items-center gap-1 text-sm font-bold animate-pulse">
                <CheckCircle size={14} /> {saveStatus}
              </span>
            )}
            <button
              onClick={handleSaveSettings}
              disabled={saving}
              className="flex items-center gap-2 bg-feps-navy hover:bg-feps-navy/90 text-white px-5 py-2.5 text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-50"
            >
              {saving ? <Loader size={14} className="animate-spin" /> : <Save size={14} />}
              {isAr ? 'حفظ إعدادات التسجيل' : 'Save Registration Settings'}
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      {enabled && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-feps-ink/5 p-5 border border-feps-ink/10 text-center">
            <p className="text-xs font-bold uppercase tracking-widest text-feps-ink-secondary mb-1">
              {isAr ? 'إجمالي المسجلين' : 'Total Registrations'}
            </p>
            <p className="text-4xl font-serif text-feps-navy font-bold">{totalReg}</p>
          </div>
          <div className="bg-feps-ink/5 p-5 border border-feps-ink/10 text-center">
            <p className="text-xs font-bold uppercase tracking-widest text-feps-ink-secondary mb-1">
              {isAr ? 'مستجيبي الاستبيان' : 'Survey Responses'}
            </p>
            <p className="text-4xl font-serif text-feps-navy font-bold">{surveyResponsesCount}</p>
          </div>
          <div className="bg-feps-ink/5 p-5 border border-feps-ink/10 text-center">
            <p className="text-xs font-bold uppercase tracking-widest text-feps-ink-secondary mb-1">
              {isAr ? 'نسبة إكمال الاستبيان' : 'Survey Completion Rate'}
            </p>
            <p className="text-4xl font-serif text-feps-navy font-bold">{completionRate}%</p>
          </div>
        </div>
      )}

      {/* Attendees Table / List */}
      {enabled && (
        <div className="border border-feps-ink/20 bg-white shadow-sm overflow-hidden">
          <div className="flex justify-between items-center px-6 py-4 border-b border-feps-ink/10 bg-feps-ink/5 flex-wrap gap-4">
            <h3 className="font-serif text-lg text-feps-navy font-bold flex items-center gap-2">
              <Users size={20} />
              {isAr ? 'قائمة الحضور المسجلين' : 'Registered Attendees List'}
            </h3>
            
            <button
              onClick={handleExportExcel}
              disabled={loading || registrations.length === 0}
              className="flex items-center gap-2 bg-green-700 hover:bg-green-800 text-white px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-50"
            >
              <Download size={14} />
              {isAr ? 'تصدير إلى Excel' : 'Export to Excel'}
            </button>
          </div>

          {loading ? (
            <div className="p-12 text-center text-feps-ink-secondary">
              <Loader size={24} className="animate-spin mx-auto mb-2 text-feps-navy" />
              {isAr ? 'جاري تحميل قائمة المسجلين...' : 'Loading registered attendees...'}
            </div>
          ) : registrations.length === 0 ? (
            <div className="p-12 text-center text-feps-ink-secondary italic">
              {isAr ? 'لا يوجد مسجلون في هذه الفعالية حتى الآن.' : 'No attendees registered for this event yet.'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-feps-ink/5 border-b border-feps-ink/10 text-xs font-bold uppercase tracking-wider text-feps-ink-secondary">
                    <th className="px-6 py-3 text-center w-12">#</th>
                    <th className="px-6 py-3">{isAr ? 'الاسم' : 'Name'}</th>
                    <th className="px-6 py-3">{isAr ? 'البريد الإلكتروني' : 'Email'}</th>
                    <th className="px-6 py-3">{isAr ? 'رمز التحقق (الكود)' : 'Code (Identifier)'}</th>
                    <th className="px-6 py-3">{isAr ? 'نوع الرمز' : 'Type'}</th>
                    <th className="px-6 py-3">{isAr ? 'تاريخ التسجيل' : 'Registration Date'}</th>
                    <th className="px-6 py-3 text-center w-20">{isAr ? 'إجراءات' : 'Actions'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-feps-ink/10 text-sm">
                  {registrations.map((r, idx) => (
                    <tr key={r.id} className="hover:bg-feps-ink/5 transition-colors">
                      <td className="px-6 py-4 text-center text-feps-ink-secondary font-mono">{idx + 1}</td>
                      <td className="px-6 py-4 font-bold">{r.name || (isAr ? 'غير محدد' : 'N/A')}</td>
                      <td className="px-6 py-4 text-feps-ink-secondary font-mono">{r.email}</td>
                      <td className="px-6 py-4 font-mono font-bold text-feps-navy">{r.identifier}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${r.identifierType === 'CREDIT_CODE' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}`}>
                          {r.identifierType === 'CREDIT_CODE'
                            ? (isAr ? 'ساعات معتمدة' : 'Credit Hours')
                            : (isAr ? 'رقم قومي' : 'National ID')}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-feps-ink-secondary text-xs font-mono">
                        {new Date(r.createdAt).toLocaleString(isAr ? 'ar-EG' : 'en-US')}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => handleDeleteRegistration(r.id)}
                          className="text-red-600 hover:text-red-950 p-1 transition-colors"
                          title={isAr ? 'حذف التسجيل' : 'Delete Registration'}
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
