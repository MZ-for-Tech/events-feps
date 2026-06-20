import React from 'react'

interface AgendaTimelineItem {
  day?: string
  time: string
  text: string
}

interface EventAgendaProps {
  agendaText: string | null
  isAr: boolean
  title: string
}

export default function EventAgenda({ agendaText, isAr, title }: EventAgendaProps) {
  if (!agendaText) return null

  let parsedAgenda: AgendaTimelineItem[] = []

  const trimmed = agendaText.trim()
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
    } catch (e) {
      // Fallback
    }
  }

  if (parsedAgenda.length === 0) {
    const agendaLines = agendaText.split('\n').filter((line) => line.trim() !== '')
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
    <div className="bg-feps-surface border-2 border-feps-navy p-8 mb-8">
      <div className="flex items-center gap-4 mb-8 border-b-2 border-feps-navy pb-4">
        <h2 className={`text-2xl font-mono uppercase tracking-wider font-bold text-feps-navy ${isAr ? 'font-arabic' : ''}`}>
          {title}
        </h2>
      </div>

      {parsedAgenda.length > 0 ? (
        <div className="relative border-l-4 border-feps-navy ml-4 md:ml-6 rtl:ml-0 rtl:border-l-0 rtl:border-r-4 rtl:mr-4 md:rtl:mr-6">
          {parsedAgenda.map((item, idx) => (
            <div className="relative pl-8 md:pl-12 py-6 border-b-2 border-feps-navy/10 last:border-0 rtl:pl-0 rtl:pr-8 md:rtl:pr-12 group" key={idx}>
              {/* Timeline Node - Sharp Square */}
              <div className="absolute w-4 h-4 bg-feps-navy -left-[10px] top-8 rtl:-left-auto rtl:-right-[10px]" />
              
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2 mb-2">
                {item.time && (
                  <span className="font-mono text-feps-navy font-bold text-sm md:text-base tracking-wider bg-feps-navy/5 border border-feps-navy/20 px-3 py-1 w-fit">
                    {item.time}
                  </span>
                )}
                {item.day && (
                  <span className="text-xs font-mono font-bold bg-feps-navy text-feps-surface px-3 py-1 uppercase tracking-wider w-fit">
                    {item.day}
                  </span>
                )}
              </div>
              <p className={`text-lg md:text-xl font-bold text-feps-navy leading-relaxed ${isAr ? 'font-arabic' : ''}`}>
                {item.text}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className={`p-6 border-2 border-feps-navy text-base leading-relaxed text-feps-navy whitespace-pre-line ${isAr ? 'font-arabic' : ''}`}>
          {agendaText}
        </div>
      )}
    </div>
  )
}
