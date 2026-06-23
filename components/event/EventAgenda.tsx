import React from 'react'
import InlineEdit from '../admin/InlineEdit'

interface AgendaTimelineItem {
  day?: string
  time: string
  text: string
}

interface EventAgendaProps {
  agendaText: string | null
  isAr: boolean
  title: string
  isAdmin?: boolean
  eventId?: string
}

export default function EventAgenda({ agendaText, isAr, title, isAdmin, eventId }: EventAgendaProps) {
  if (!agendaText && !isAdmin) return null

  let parsedAgenda: AgendaTimelineItem[] = []

  const trimmed = (agendaText || '').trim()
  if (trimmed.startsWith('[')) {
    try {
      const cells = JSON.parse(trimmed) as { day?: string; startTime: string; endTime: string; text: string }[]
      parsedAgenda = cells.map(c => {
        let timeStr = ''
        if (c.startTime && c.endTime) {
          timeStr = `${c.startTime} - ${c.endTime}`
        } else {
          timeStr = c.startTime || c.endTime || ''
        }
        return {
          day: c.day,
          time: timeStr,
          text: c.text
        }
      })
    } catch {
      // Fallback
    }
  }

  if (parsedAgenda.length === 0 && trimmed) {
    const agendaLines = trimmed.split('\n').filter((line) => line.trim() !== '')
    parsedAgenda = agendaLines.map((line) => {
      const separators = [' - ', ' – ', ' : ', ' | ']
      let timePart = ''
      let textPart = line

      for (const sep of separators) {
        const idx = line.indexOf(sep)
        if (idx !== -1) {
          timePart = line.substring(0, idx).trim()
          textPart = line.substring(idx + sep.length).trim()
          break
        }
      }

      if (!timePart) {
        const timeRegex = /^(\d{1,2}:\d{2}\s*(?:AM|PM|ص|م)?)\s+(.*)$/i
        const match = line.match(timeRegex)
        if (match) {
          timePart = match[1]
          textPart = match[2]
        }
      }

      return { time: timePart, text: textPart }
    })
  }

  return (
    <div className="mb-12 border-t-4 border-feps-ink pt-8">
      <h2 className={`text-xl md:text-2xl font-sans uppercase tracking-widest font-bold text-feps-ink mb-8 ${isAr ? 'font-arabic' : ''}`}>
        {title}
      </h2>

      <InlineEdit field="agendaText" value={agendaText || ''} eventId={eventId!} isAdmin={!!isAdmin} type="textarea">
        {parsedAgenda.length > 0 ? (
          <div className="relative border-l-4 border-feps-ink ml-4 md:ml-6 rtl:ml-0 rtl:border-l-0 rtl:border-r-4 rtl:mr-4 md:rtl:mr-6">
            {parsedAgenda.map((item, idx) => (
              <div className="relative pl-8 md:pl-12 py-8 border-b-2 border-feps-ink/20 last:border-0 rtl:pl-0 rtl:pr-8 md:rtl:pr-12 group" key={idx}>
                {/* Timeline Node - Sharp Horizontal Dash */}
                <div className="absolute w-6 h-1 bg-feps-ink -left-1 top-10 rtl:-left-auto rtl:-right-1" />
                
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2 mb-4">
                  {item.time && (
                    <span className="font-sans text-white font-bold text-sm md:text-base tracking-widest bg-feps-ink px-4 py-1.5 w-fit uppercase">
                      {item.time}
                    </span>
                  )}
                  {item.day && (
                    <span className="text-xs font-sans font-bold bg-feps-surface-alt border-2 border-feps-ink text-feps-ink px-3 py-1 uppercase tracking-widest w-fit">
                      {item.day}
                    </span>
                  )}
                </div>
                <p className={`text-lg md:text-2xl font-serif font-bold text-feps-ink leading-relaxed ${isAr ? 'font-arabic' : ''}`}>
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className={`p-8 border-l-4 border-feps-ink bg-feps-surface-alt text-lg leading-relaxed text-feps-ink whitespace-pre-line ${isAr ? 'font-arabic' : ''}`}>
            {agendaText || (isAr ? 'إضافة البرنامج' : 'Add Agenda')}
          </div>
        )}
      </InlineEdit>
    </div>
  )
}
