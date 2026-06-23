'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { ArrowLeft, Save, Plus, Trash2, FileText, CheckCircle, BarChart3, HelpCircle, Loader, Eye, Clock, Edit2, Calendar } from 'lucide-react'
import dynamic from 'next/dynamic'
import SingleEventReportDocument from '@/components/admin/SingleEventReportDocument'
import SurveyAnalytics from '@/components/admin/SurveyAnalytics'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { AdminButton } from '@/components/admin/AdminButton'
import { Event, SurveyResponse, EventCategory } from '@prisma/client'
import { useSession } from 'next-auth/react'

const PDFDownloadLink = dynamic(() => import('@react-pdf/renderer').then(mod => mod.PDFDownloadLink), {
  ssr: false
})

const PDFViewer = dynamic(() => import('@react-pdf/renderer').then(mod => mod.PDFViewer), {
  ssr: false,
  loading: () => <div className="p-12 text-center font-sans">Loading PDF Viewer...</div>
})

export type CustomField = { id: string; title: string; content: string }
export type SurveyQuestion = { id: string; type: 'text' | 'choice'; text: string; options?: string[]; required?: boolean }

export default function AdminEventDetailClient({ event, locale, surveyResponses }: { event: Event & { category: EventCategory }, locale: string, surveyResponses: SurveyResponse[] }) {
  const router = useRouter()
  const { data: session } = useSession()
  const role = session?.user?.role
  const permissions = (session?.user as { permissions?: string[] })?.permissions || []
  
  const canManageReports = role === 'SUPERADMIN' || role === 'MANAGER' || permissions.includes('events:reports')
  const canManageSurveys = role === 'SUPERADMIN' || role === 'MANAGER' || permissions.includes('events:reports')
  const isAr = locale === 'ar'
  const t = useTranslations('AdminEventDetail')
  const [activeTab, setActiveTab] = useState<'details' | 'report' | 'survey' | 'analytics' | 'history'>('report')

  const lsKeyReport = `feps_draft_report_${event.id}`
  const lsKeySurvey = `feps_draft_survey_${event.id}`

  // Report Builder State
  const initialReportFields = event.reportCustomFields ? JSON.parse(event.reportCustomFields) : []
  const [reportFields, setReportFields] = useState<CustomField[]>(initialReportFields)
  
  // Survey Builder State
  const initialSurveyQuestions = event.surveyQuestions ? JSON.parse(event.surveyQuestions) : []
  const [surveyQuestions, setSurveyQuestions] = useState<SurveyQuestion[]>(initialSurveyQuestions)
  const [surveyEnabled, setSurveyEnabled] = useState<boolean>(!!event.surveyEnabled)

  const [isLoaded, setIsLoaded] = useState(false)

  // History & Notes State
  const [logs, setLogs] = useState<Array<Record<string, unknown>>>([])
  const [logsLoaded, setLogsLoaded] = useState(false)
  const [newNote, setNewNote] = useState('')
  const [submittingNote, setSubmittingNote] = useState(false)

  // Load from local storage on mount
  React.useEffect(() => {
    try {
      const draftReport = localStorage.getItem(lsKeyReport)
      if (draftReport) setReportFields(JSON.parse(draftReport))
      
      const draftSurvey = localStorage.getItem(lsKeySurvey)
      if (draftSurvey) setSurveyQuestions(JSON.parse(draftSurvey))
    } catch {}
    setIsLoaded(true)
  }, [lsKeyReport, lsKeySurvey])

  // Save to local storage on change
  React.useEffect(() => {
    if (!isLoaded) return
    localStorage.setItem(lsKeyReport, JSON.stringify(reportFields))
  }, [reportFields, isLoaded, lsKeyReport])

  React.useEffect(() => {
    if (!isLoaded) return
    localStorage.setItem(lsKeySurvey, JSON.stringify(surveyQuestions))
  }, [surveyQuestions, isLoaded, lsKeySurvey])

  React.useEffect(() => {
    if (activeTab === 'history' && !logsLoaded) {
      fetch(`/api/events/${event.id}/logs`)
        .then(res => res.json())
        .then(data => {
          setLogs(data)
          setLogsLoaded(true)
        })
        .catch(console.error)
    }
  }, [activeTab, event.id, logsLoaded])

  const handleAddNote = async () => {
    if (!newNote.trim()) return
    setSubmittingNote(true)
    try {
      const res = await fetch(`/api/events/${event.id}/logs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note: newNote })
      })
      if (res.ok) {
        setNewNote('')
        setLogsLoaded(false) // Trigger refetch
      }
    } finally {
      setSubmittingNote(false)
    }
  }

  const [saving, setSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<string | null>(null)
  const [autoSaveStatus, setAutoSaveStatus] = useState<string | null>(null)
  const [showPreview, setShowPreview] = useState(false)

  // Auto-save effect
  React.useEffect(() => {
    if (!isLoaded) return
    
    const timer = setTimeout(async () => {
      setAutoSaveStatus(t('autoSaving'))
      try {
        const res = await fetch(`/api/events/${event.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            reportCustomFields: JSON.stringify(reportFields),
            surveyQuestions: JSON.stringify(surveyQuestions),
            surveyEnabled
          })
        })
        if (res.ok) {
          setAutoSaveStatus(t('autoSaved'))
          localStorage.removeItem(lsKeyReport)
          localStorage.removeItem(lsKeySurvey)
          setTimeout(() => setAutoSaveStatus(null), 3000)
        } else {
          setAutoSaveStatus(t('errorSaving'))
        }
      } catch {
        setAutoSaveStatus(t('errorSaving'))
      }
    }, 1500)

    return () => clearTimeout(timer)
  }, [reportFields, surveyQuestions, surveyEnabled, isLoaded, event.id, isAr, lsKeyReport, lsKeySurvey, t])

  const handleAddReportField = () => {
    setReportFields([...reportFields, { id: Math.random().toString(36).substr(2, 9), title: '', content: '' }])
  }

  const handleUpdateReportField = (id: string, key: keyof CustomField, value: string) => {
    setReportFields(reportFields.map(f => f.id === id ? { ...f, [key]: value } : f))
  }

  const handleRemoveReportField = (id: string) => {
    setReportFields(reportFields.filter(f => f.id !== id))
  }

  const handleAddSurveyQuestion = (type: 'text' | 'choice') => {
    setSurveyQuestions([...surveyQuestions, { 
      id: Math.random().toString(36).substr(2, 9), 
      type, 
      text: '', 
      options: type === 'choice' ? ['', ''] : undefined,
      required: true
    }])
  }

  const handleUpdateSurveyQuestion = (id: string, key: string, value: string, optionIndex?: number) => {
    setSurveyQuestions(surveyQuestions.map(q => {
      if (q.id === id) {
        if (key === 'options' && optionIndex !== undefined && q.options) {
          const newOptions = [...q.options]
          newOptions[optionIndex] = value
          return { ...q, options: newOptions }
        }
        return { ...q, [key]: value }
      }
      return q
    }))
  }

  const handleAddOption = (id: string) => {
    setSurveyQuestions(surveyQuestions.map(q => {
      if (q.id === id && q.options) return { ...q, options: [...q.options, ''] }
      return q
    }))
  }

  const handleRemoveOption = (id: string, index: number) => {
    setSurveyQuestions(surveyQuestions.map(q => {
      if (q.id === id && q.options) return { ...q, options: q.options.filter((_, i) => i !== index) }
      return q
    }))
  }

  const handleRemoveSurveyQuestion = (id: string) => {
    setSurveyQuestions(surveyQuestions.filter(q => q.id !== id))
  }

  const handleSave = async () => {
    setSaving(true)
    setSaveStatus(null)
    try {
      const res = await fetch(`/api/events/${event.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportCustomFields: JSON.stringify(reportFields),
          surveyQuestions: JSON.stringify(surveyQuestions),
          surveyEnabled
        })
      })
      if (res.ok) {
        setSaveStatus(t('savedSuccessfully'))
        localStorage.removeItem(lsKeyReport)
        localStorage.removeItem(lsKeySurvey)
        router.refresh()
      } else {
        setSaveStatus(isAr ? 'حدث خطأ' : 'Error saving')
      }
    } catch {
      setSaveStatus(isAr ? 'حدث خطأ' : 'Error saving')
    } finally {
      setSaving(false)
      setTimeout(() => setSaveStatus(null), 3000)
    }
  }

  return (
    <div dir={isAr ? 'rtl' : 'ltr'}>
      <div className="mb-8 border-b border-feps-ink/20 pb-6">
        <AdminPageHeader
          title={event.title}
          description={t('manageCustomReport')}
          icon={Calendar}
          breadcrumbs={
            <Link href={`/${locale}/admin/events`} className="text-feps-ink-secondary hover:text-feps-ink inline-flex items-center gap-2 text-sm">
              <ArrowLeft size={16} className={isAr ? 'rotate-180' : ''} />
              {t('backToEvents')}
            </Link>
          }
          action={
            <div className="flex flex-col md:flex-row items-end md:items-center gap-4">
              {autoSaveStatus && !saveStatus && (
                <span className="text-feps-ink-secondary flex items-center gap-1 text-sm font-bold animate-pulse">
                  <Loader size={14} className={autoSaveStatus.includes('جاري') || autoSaveStatus.includes('Auto-saving') ? 'animate-spin' : 'hidden'} /> 
                  {autoSaveStatus.includes('تم') || autoSaveStatus.includes('saved') ? <CheckCircle size={14} className="text-green-600" /> : null}
                  {autoSaveStatus}
                </span>
              )}
              {saveStatus && (
                <span className="text-green-600 flex items-center gap-1 text-sm font-bold animate-pulse">
                  <CheckCircle size={14} /> {saveStatus}
                </span>
              )}
              <AdminButton
                onClick={handleSave}
                disabled={saving}
                icon={saving ? undefined : Save}
              >
                {saving ? (
                  <span className="flex items-center gap-2">
                    <Loader size={16} className="animate-spin" />
                    {t('saveChanges')}
                  </span>
                ) : (
                  t('saveChanges')
                )}
              </AdminButton>
            </div>
          }
        />
      </div>

      <div className="border border-feps-ink/20 bg-feps-paper overflow-hidden">
        <div className="flex border-b border-feps-ink/20 overflow-x-auto">
          {[
            { id: 'details', icon: <FileText size={16} />, label: t('details') },
            ...(canManageReports ? [{ id: 'report', icon: <FileText size={16} />, label: t('reportBuilder') }] : []),
            ...(canManageSurveys ? [
              { id: 'survey', icon: <HelpCircle size={16} />, label: t('surveyBuilder') },
              { id: 'analytics', icon: <BarChart3 size={16} />, label: t('surveyAnalytics') }
            ] : []),
            { id: 'history', icon: <Clock size={16} />, label: t('historyNotes') },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as 'details' | 'report' | 'survey' | 'analytics' | 'history')}
              className={`flex items-center gap-2 px-6 py-4 text-sm font-bold uppercase tracking-widest border-b-2 transition-colors whitespace-nowrap ${activeTab === tab.id ? 'border-feps-navy text-feps-navy bg-feps-navy/5' : 'border-transparent text-feps-ink-secondary hover:text-feps-ink'}`}
            >
              {tab.icon}
              {tab.label}
              {tab.id === 'analytics' && (
                <span className="bg-feps-navy/10 text-feps-navy px-1.5 py-0.5 text-[10px] ml-2">
                  {surveyResponses.length}
                </span>
              )}
            </button>
          ))}
        </div>

        <div>
          {activeTab === 'details' && (
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div className="space-y-4">
                  <p><strong>{t('title')}</strong> {event.title}</p>
                  <p><strong>{t('location')}</strong> {event.location}</p>
                  <p><strong>{t('dateLabel')}</strong> {new Date(event.startDate).toLocaleString(isAr ? 'ar-EG' : 'en-US')}</p>
                </div>
                <button
                  onClick={() => router.push(`/${isAr ? 'ar' : 'en'}/admin/events?edit=${event.id}`)}
                  className="flex items-center gap-2 bg-feps-ink/5 text-feps-ink px-4 py-2 text-sm font-bold uppercase tracking-widest hover:bg-feps-ink hover:text-white transition-colors"
                >
                  <Edit2 size={14} />
                  {t('editDetails')}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'report' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-serif mb-1">{t('reportStructure')}</h2>
                  <p className="text-sm text-feps-ink-secondary">{t('addCustomFields')}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={handleAddReportField} className="flex items-center gap-2 bg-feps-ink/5 text-feps-ink px-4 py-2 text-sm font-bold hover:bg-feps-ink/10 transition-colors">
                    <Plus size={16} /> {t('addField')}
                  </button>
                  <PDFDownloadLink
                    document={<SingleEventReportDocument event={event} reportFields={reportFields} isAr={isAr} />}
                    fileName={`Report_${event.id}.pdf`}
                    className="flex items-center gap-2 bg-feps-navy text-white px-4 py-2 text-sm font-bold hover:bg-feps-navy/90 transition-colors"
                  >
                    {({ loading }) => (
                      <>{loading ? '...' : t('downloadPdf')}</>
                    )}
                  </PDFDownloadLink>
                  <button 
                    onClick={() => setShowPreview(!showPreview)}
                    className="flex items-center gap-2 bg-feps-ink/5 text-feps-ink px-4 py-2 text-sm font-bold hover:bg-feps-ink/10 transition-colors"
                  >
                    <Eye size={16} /> {showPreview ? t('hidePreview') : t('previewReport')}
                  </button>
                </div>
              </div>
              
              <div className="space-y-6">
                {reportFields.length === 0 ? (
                  <p className="text-center py-12 text-feps-ink/50 border-2 border-dashed border-feps-ink/20">{t('noFieldsYet')}</p>
                ) : reportFields.map((field) => (
                  <div key={field.id} className="border border-feps-ink/20 p-4 relative group">
                    <button onClick={() => handleRemoveReportField(field.id)} className="absolute top-4 right-4 rtl:left-4 rtl:right-auto text-red-500 hover:text-red-700">
                      <Trash2 size={16} />
                    </button>
                    <div className="mb-4 pr-8 rtl:pr-0 rtl:pl-8">
                      <label className="block text-xs font-bold uppercase tracking-widest text-feps-ink-secondary mb-2">{t('fieldTitle')}</label>
                      <input 
                        type="text" 
                        value={field.title} 
                        onChange={e => handleUpdateReportField(field.id, 'title', e.target.value)}
                        className="w-full border-b border-feps-ink/20 bg-transparent text-lg font-bold focus:outline-none focus:border-feps-ink pb-1"
                        placeholder={t('egResults')}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-feps-ink-secondary mb-2">{t('content')}</label>
                      <textarea 
                        value={field.content} 
                        onChange={e => handleUpdateReportField(field.id, 'content', e.target.value)}
                        className="w-full border border-feps-ink/20 bg-transparent p-3 min-h-[120px] focus:outline-none focus:border-feps-ink text-sm"
                        placeholder={t('writeContentHere')}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {showPreview && (
                <div className="mt-8 h-[800px] border border-feps-ink/20">
                  <PDFViewer width="100%" height="100%">
                    <SingleEventReportDocument event={event} reportFields={reportFields} isAr={isAr} />
                  </PDFViewer>
                </div>
              )}
            </div>
          )}

          {activeTab === 'survey' && (
            <div>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                  <h2 className="text-xl font-serif mb-1">{t('surveyQuestions')}</h2>
                  <p className="text-sm text-feps-ink-secondary">{t('designEvalForm')}</p>
                </div>
                
                <div className="flex flex-col items-end gap-4">
                  <label className="flex items-center gap-3 cursor-pointer bg-feps-paper border border-feps-ink/20 px-4 py-2 rounded shadow-sm">
                    <span className="text-sm font-bold text-feps-ink">{t('enableSurvey')}</span>
                    <div className="relative">
                      <input 
                        type="checkbox" 
                        className="peer sr-only" 
                        checked={surveyEnabled}
                        onChange={(e) => setSurveyEnabled(e.target.checked)}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] rtl:after:left-auto rtl:after:right-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                    </div>
                  </label>
                  
                  <div className="flex gap-2">
                    <button onClick={() => handleAddSurveyQuestion('text')} className="flex items-center gap-2 bg-feps-ink/5 text-feps-ink px-4 py-2 text-sm font-bold hover:bg-feps-ink/10 transition-colors">
                      <Plus size={16} /> {t('textQuestion')}
                    </button>
                    <button onClick={() => handleAddSurveyQuestion('choice')} className="flex items-center gap-2 bg-feps-ink/5 text-feps-ink px-4 py-2 text-sm font-bold hover:bg-feps-ink/10 transition-colors">
                      <Plus size={16} /> {isAr ? 'خيارات' : 'Choice Question'}
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                {surveyQuestions.length === 0 ? (
                  <p className="text-center py-12 text-feps-ink/50 border-2 border-dashed border-feps-ink/20">{t('noQuestionsYet')}</p>
                ) : surveyQuestions.map((q, qIndex) => (
                  <div key={q.id} className="border border-feps-ink/20 p-4 relative bg-feps-ink/5">
                    <button onClick={() => handleRemoveSurveyQuestion(q.id)} className="absolute top-4 right-4 rtl:left-4 rtl:right-auto text-red-500 hover:text-red-700">
                      <Trash2 size={16} />
                    </button>
                    <div className="mb-4 pr-8 rtl:pr-0 rtl:pl-8">
                      <label className="block text-xs font-bold uppercase tracking-widest text-feps-ink-secondary mb-2">{isAr ? `سؤال ${qIndex + 1}` : `Question ${qIndex + 1}`} ({q.type === 'text' ? t('text') : t('choices')})</label>
                      <input 
                        type="text" 
                        value={q.text} 
                        onChange={e => handleUpdateSurveyQuestion(q.id, 'text', e.target.value)}
                        className="w-full border-b border-feps-ink/20 bg-feps-paper text-base font-bold focus:outline-none focus:border-feps-ink pb-1 px-2 mb-3"
                        placeholder={t('typeQuestionHere')}
                      />
                      <label className="flex items-center gap-2 cursor-pointer w-fit">
                        <input 
                          type="checkbox" 
                          checked={!!q.required} 
                          onChange={e => handleUpdateSurveyQuestion(q.id, 'required', e.target.checked as unknown as string)}
                          className="w-4 h-4 text-feps-navy focus:ring-feps-navy border-gray-300 rounded"
                        />
                        <span className="text-sm text-feps-ink-secondary">{t('requiredQuestion')}</span>
                      </label>
                    </div>
                    {q.type === 'choice' && q.options && (
                      <div className="ml-4 rtl:mr-4 rtl:ml-0 space-y-2">
                        {q.options.map((opt, oIndex) => (
                          <div key={oIndex} className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded-full border border-feps-ink/50" />
                            <input 
                              type="text" 
                              value={opt}
                              onChange={e => handleUpdateSurveyQuestion(q.id, 'options', e.target.value, oIndex)}
                              className="flex-1 border-b border-feps-ink/20 bg-transparent text-sm focus:outline-none focus:border-feps-ink pb-1"
                              placeholder={isAr ? `خيار ${oIndex + 1}` : `Option ${oIndex + 1}`}
                            />
                            {q.options!.length > 2 && (
                              <button onClick={() => handleRemoveOption(q.id, oIndex)} className="text-red-500 opacity-50 hover:opacity-100">
                                <Trash2 size={14} />
                              </button>
                            )}
                          </div>
                        ))}
                        <button onClick={() => handleAddOption(q.id)} className="text-xs text-feps-navy font-bold hover:underline mt-2 flex items-center gap-1">
                          <Plus size={12} /> {t('addOption')}
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <SurveyAnalytics responses={surveyResponses} questions={surveyQuestions} />
          )}

          {activeTab === 'history' && (
            <div className="space-y-8">
              <div className="bg-feps-ink/5 p-4 border border-feps-ink/10 flex gap-4">
                <input
                  type="text"
                  value={newNote}
                  onChange={e => setNewNote(e.target.value)}
                  placeholder={t('addNote')}
                  className="flex-1 border border-feps-ink/20 bg-white p-3 text-sm focus:outline-none focus:border-feps-navy"
                  onKeyDown={e => e.key === 'Enter' && handleAddNote()}
                />
                <button
                  onClick={handleAddNote}
                  disabled={submittingNote || !newNote.trim()}
                  className="bg-feps-navy text-white px-6 py-3 font-bold uppercase tracking-widest text-sm hover:bg-black transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {submittingNote ? <Loader size={16} className="animate-spin" /> : <Plus size={16} />}
                  {t('add')}
                </button>
              </div>

              <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 rtl:before:ml-0 rtl:before:mr-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-feps-ink/10 before:to-transparent">
                {logs.length === 0 && logsLoaded ? (
                  <p className="text-center text-feps-ink-secondary py-10">{t('noHistory')}</p>
                ) : !logsLoaded ? (
                  <p className="text-center text-feps-ink-secondary py-10"><Loader size={24} className="animate-spin mx-auto" /></p>
                ) : (
                  logs.map((log: Record<string, unknown>) => {
                    const isNote = log.action === 'NOTE_ADDED'
                    let details = log.details as string | null | undefined
                    try { if (details) { const p = JSON.parse(details); if (p.note) details = p.note; else if (p.action) details = p.action; else if (p.title) details = `Title: ${p.title}`; } } catch {}
                    
                    return (
                      <div key={log.id as string} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-feps-paper text-feps-ink-secondary shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                          {isNote ? <FileText size={16} className="text-blue-600" /> : <Clock size={16} />}
                        </div>
                        <div className={`w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded border shadow-sm ${isNote ? 'bg-blue-50 border-blue-100' : 'bg-white border-feps-ink/10'}`}>
                          <div className="flex items-center justify-between mb-1">
                            <div className="font-bold text-sm text-feps-navy">{(log.user as { name?: string })?.name || 'System'}</div>
                            <time className="text-xs text-feps-ink-secondary font-sans">{new Date(log.timestamp as string).toLocaleString(isAr ? 'ar-EG' : 'en-US')}</time>
                          </div>
                          <div className="text-sm">
                            <span className="font-bold text-xs uppercase tracking-widest bg-black/5 px-1 py-0.5 rounded mr-2 rtl:mr-0 rtl:ml-2">{log.action as string}</span>
                            {details}
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
