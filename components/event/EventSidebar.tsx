import React from 'react'
import { Calendar, Clock, MapPin, Download, Map } from 'lucide-react'
import ShareButton from '@/components/ShareButton'
import InlineEdit from '../admin/InlineEdit'

interface EventSidebarProps {
  isAr: boolean
  title: string
  formattedStartDate: string
  formattedEndDate: string | null
  formattedStartTime: string
  formattedEndTime: string | null
  location: string | null
  locationAr?: string | null
  locationFr?: string | null
  agendaFile: string | null
  isFr?: boolean
  labels: {
    quickFacts: string
    date: string
    until: string
    time: string
    location: string
    officialAgenda: string
    downloadFile: string
  }
  isAdmin?: boolean
  eventId?: string
  rawStartDate?: string | null
  rawEndDate?: string | null
}

export default function EventSidebar({
  isAr,
  title,
  formattedStartDate,
  formattedEndDate,
  formattedStartTime,
  formattedEndTime,
  location,
  locationAr,
  locationFr,
  agendaFile,
  labels,
  isFr,
  isAdmin,
  eventId,
  rawStartDate,
  rawEndDate
}: EventSidebarProps) {
  const localizedLocation = isAr && locationAr ? locationAr : (isFr && locationFr ? locationFr : location)
  const locationFieldName = isAr ? 'locationAr' : (isFr ? 'locationFr' : 'location')

  return (
    <div className="sticky top-24 flex flex-col bg-feps-surface-alt border-t-4 border-feps-ink">
      {/* Quick Ledger Info Box */}
      <div className="p-6 md:p-8 flex flex-col">
        <h3 className={`text-sm md:text-base font-sans uppercase tracking-widest font-bold text-feps-ink mb-6 pb-4 border-b-2 border-feps-ink ${isAr ? 'font-arabic' : ''}`}>
          {labels.quickFacts}
        </h3>

        <div className="flex flex-col gap-6">
          {/* Date Ledger */}
          <div className="flex flex-col gap-2 border-b border-feps-ink/20 pb-4">
            <div className="flex items-center gap-2 text-xs font-sans text-feps-ink-secondary font-bold uppercase tracking-widest">
              <Calendar size={14} className="text-feps-ink" /> {labels.date}
            </div>
            <div className={`text-base font-serif font-bold text-feps-ink ${isAr ? 'font-arabic' : ''}`}>
              <div className="inline-block">
                <InlineEdit field="startDate" value={rawStartDate || ''} eventId={eventId!} isAdmin={!!isAdmin} type="datetime-local">
                  {formattedStartDate}
                </InlineEdit>
              </div>
              {(formattedEndDate || isAdmin) && formattedEndDate !== formattedStartDate && (
                <div className="text-sm mt-1 text-feps-ink-secondary font-sans font-normal flex items-center gap-1">
                  <span>{labels.until}</span>
                  <div className="inline-block">
                    <InlineEdit field="endDate" value={rawEndDate || ''} eventId={eventId!} isAdmin={!!isAdmin} type="datetime-local">
                      {formattedEndDate || (isAr ? 'إضافة تاريخ الانتهاء' : 'Add end date')}
                    </InlineEdit>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Time Ledger */}
          <div className="flex flex-col gap-2 border-b border-feps-ink/20 pb-4">
            <div className="flex items-center gap-2 text-xs font-sans text-feps-ink-secondary font-bold uppercase tracking-widest">
              <Clock size={14} className="text-feps-ink" /> {labels.time}
            </div>
            <div className={`text-base font-serif font-bold text-feps-ink ${isAr ? 'font-arabic' : ''}`}>
              <div className="inline-block">
                <InlineEdit field="startDate" value={rawStartDate || ''} eventId={eventId!} isAdmin={!!isAdmin} type="datetime-local">
                  {formattedStartTime}
                </InlineEdit>
              </div>
              {(formattedEndTime || isAdmin) && (
                <span className="text-feps-ink-secondary flex items-center gap-1 inline-flex mt-1">
                  <span>-</span>
                  <div className="inline-block">
                    <InlineEdit field="endDate" value={rawEndDate || ''} eventId={eventId!} isAdmin={!!isAdmin} type="datetime-local">
                      {formattedEndTime || (isAr ? 'إضافة وقت الانتهاء' : 'Add end time')}
                    </InlineEdit>
                  </div>
                </span>
              )}
            </div>
          </div>

          {/* Location Ledger */}
          {(localizedLocation || isAdmin) && (
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-xs font-sans text-feps-ink-secondary font-bold uppercase tracking-widest">
                <MapPin size={14} className="text-feps-ink" /> {labels.location}
              </div>
              <div className={`text-base font-serif font-bold text-feps-ink ${isAr ? 'font-arabic' : ''}`}>
                <InlineEdit field={locationFieldName} value={localizedLocation || ''} eventId={eventId!} isAdmin={!!isAdmin} type="text">
                  {localizedLocation || (isAr ? 'إضافة مكان' : 'Add Location')}
                </InlineEdit>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Agenda File Download Card */}
      {agendaFile && (
        <div className="px-6 md:px-8 pb-6 md:pb-8 border-t border-feps-ink/20 pt-6 flex flex-col gap-4">
          <div className="flex items-center gap-3 mb-2">
            <div className={`text-xs font-sans font-bold uppercase tracking-widest text-feps-ink ${isAr ? 'font-arabic' : ''}`}>
              {labels.officialAgenda}
            </div>
          </div>

          <a
            href={agendaFile}
            download
            className="flex items-center justify-center gap-2 w-full py-4 bg-feps-ink text-white font-sans text-xs uppercase tracking-widest font-bold hover:bg-feps-gold hover:text-feps-navy-dark transition-colors"
          >
            <Download size={16} />
            <span>{labels.downloadFile}</span>
          </a>
        </div>
      )}

      {/* Sharing / Actions Widget */}
      <div className="px-6 md:px-8 pb-6 md:pb-8 border-t border-feps-ink/20 pt-6 flex flex-col gap-3">
        <ShareButton
          title={title} 
          date={formattedStartDate}
          time={formattedStartTime}
          location={localizedLocation}
        />

        {localizedLocation && (
          <a
            href="https://maps.app.goo.gl/xTZ6WMdJuuzjPfqP7"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-3 border-2 border-feps-ink text-feps-ink font-sans text-xs uppercase tracking-widest font-bold hover:bg-feps-ink hover:text-white transition-colors mt-2"
          >
            <Map size={16} />
            <span>{labels.location}</span>
          </a>
        )}
      </div>
    </div>
  )
}
