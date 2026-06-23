import { CalendarEvent } from '@/components/calendar/types'

export function generateGoogleCalendarUrl(event: CalendarEvent): string {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toISOString().replace(/-|:|\.\d\d\d/g, '')
  }

  const start = formatDate(event.startDate)
  // Default to 1 hour later if no end date
  let end = start
  if (event.endDate) {
    end = formatDate(event.endDate)
  } else {
    const d = new Date(event.startDate)
    d.setHours(d.getHours() + 1)
    end = d.toISOString().replace(/-|:|\.\d\d\d/g, '')
  }

  const url = new URL('https://calendar.google.com/calendar/render')
  url.searchParams.append('action', 'TEMPLATE')
  url.searchParams.append('text', event.title || '')
  url.searchParams.append('dates', `${start}/${end}`)
  if (event.description) {
    url.searchParams.append('details', event.description)
  }
  if (event.location) {
    url.searchParams.append('location', event.location)
  }

  return url.toString()
}
