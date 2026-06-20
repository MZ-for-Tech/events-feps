import React from 'react'
import { Calendar, Clock, MapPin, FileText, Download, Map } from 'lucide-react'
import ShareButton from '@/components/ShareButton'

interface EventSidebarProps {
  isAr: boolean
  title: string
  formattedStartDate: string
  formattedEndDate: string | null
  formattedStartTime: string
  formattedEndTime: string | null
  location: string | null
  agendaFile: string | null
  labels: {
    quickFacts: string
    date: string
    until: string
    time: string
    location: string
    officialAgenda: string
    downloadFile: string
  }
}

export default function EventSidebar({
  isAr,
  title,
  formattedStartDate,
  formattedEndDate,
  formattedStartTime,
  formattedEndTime,
  location,
  agendaFile,
  labels
}: EventSidebarProps) {
  return (
    <div className="sticky top-24 flex flex-col gap-6">
      {/* Quick Ledger Info Box */}
      <div className="bg-white border-2 border-feps-navy p-6 flex flex-col">
        <h3 className={`text-xl font-mono uppercase tracking-wider font-bold text-feps-navy mb-6 pb-4 border-b-2 border-feps-navy ${isAr ? 'font-arabic' : ''}`}>
          {labels.quickFacts}
        </h3>

        <div className="flex flex-col gap-5">
          {/* Date Ledger */}
          <div className="flex flex-col gap-1 border-b-2 border-feps-navy/20 pb-4">
            <div className="flex items-center gap-2 text-xs font-mono text-feps-navy font-bold uppercase tracking-wider">
              <Calendar size={14} className="text-feps-gold" /> {labels.date}
            </div>
            <div className={`text-sm font-semibold text-feps-navy ${isAr ? 'font-arabic' : ''}`}>
              {formattedStartDate}
              {formattedEndDate && formattedEndDate !== formattedStartDate && (
                <div className="text-xs mt-1 text-feps-navy/80">
                  {labels.until} {formattedEndDate}
                </div>
              )}
            </div>
          </div>

          {/* Time Ledger */}
          <div className="flex flex-col gap-1 border-b-2 border-feps-navy/20 pb-4">
            <div className="flex items-center gap-2 text-xs font-mono text-feps-navy font-bold uppercase tracking-wider">
              <Clock size={14} className="text-feps-gold" /> {labels.time}
            </div>
            <div className={`text-sm font-semibold text-feps-navy ${isAr ? 'font-arabic' : ''}`}>
              {formattedStartTime}
              {formattedEndTime && (
                <span className="text-feps-navy/80">
                  {' '}
                  - {formattedEndTime}
                </span>
              )}
            </div>
          </div>

          {/* Location Ledger */}
          {location && (
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 text-xs font-mono text-feps-navy font-bold uppercase tracking-wider">
                <MapPin size={14} className="text-feps-gold" /> {labels.location}
              </div>
              <div className={`text-sm font-semibold text-feps-navy ${isAr ? 'font-arabic' : ''}`}>
                {location}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Agenda File Download Card */}
      {agendaFile && (
        <div className="bg-feps-surface border-2 border-feps-navy p-6 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-feps-navy flex items-center justify-center shrink-0">
              <FileText size={20} className="text-white" />
            </div>
            <div className={`text-sm font-bold text-feps-navy ${isAr ? 'font-arabic' : ''}`}>
              {labels.officialAgenda}
            </div>
          </div>

          <a
            href={agendaFile}
            download
            className="flex items-center justify-center gap-2 w-full py-3 bg-white border-2 border-feps-navy hover:bg-feps-navy hover:text-white text-feps-navy font-bold transition-colors"
          >
            <Download size={18} />
            <span>{labels.downloadFile}</span>
          </a>
        </div>
      )}

      {/* Sharing / Actions Widget */}
      <div className="bg-white border-2 border-feps-navy p-4 flex flex-col gap-3">
        <ShareButton 
          title={title} 
          date={formattedStartDate}
          time={formattedStartTime}
          location={location}
          isAr={isAr} 
        />

        {location && (
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-3 border-2 border-feps-navy/20 text-feps-navy font-bold hover:bg-feps-navy/5 transition-colors"
          >
            <Map size={18} />
            <span>{labels.location}</span>
          </a>
        )}
      </div>
    </div>
  )
}
