import React from 'react'
import { Document, Page, Text, View, StyleSheet, Image, Font } from '@react-pdf/renderer'
import { CalendarEvent } from '../calendar/types'
import { EVENT_TYPE_META } from '../EventCard'
import { reshapeArabic } from '../../lib/arabicShaper'

Font.register({
  family: 'Amiri',
  fonts: [
    { src: '/fonts/Amiri-Regular.ttf' },
    { src: '/fonts/Amiri-Bold.ttf', fontWeight: 'bold' },
    { src: '/fonts/Amiri-Regular.ttf', fontStyle: 'italic' },
    { src: '/fonts/Amiri-Bold.ttf', fontWeight: 'bold', fontStyle: 'italic' }
  ]
})

// Create MS Word-like styles for academic reports
const styles = StyleSheet.create({
  page: {
    paddingTop: 65,
    paddingBottom: 65,
    paddingHorizontal: 65,
    fontFamily: 'Times-Roman',
    backgroundColor: '#ffffff'
  },
  header: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 40,
    borderBottomWidth: 1,
    borderBottomColor: '#000000',
    paddingBottom: 10
  },
  headerTextContainer: {
    alignItems: 'center',
    marginBottom: 20
  },
  universityText: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
    textTransform: 'uppercase',
    fontFamily: 'Times-Bold'
  },
  facultyText: {
    fontSize: 12,
    color: '#333333'
  },
  logo: {
    width: 60,
    height: 60,
    objectFit: 'contain'
  },
  documentTitle: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 30,
    fontFamily: 'Times-Bold',
    textTransform: 'uppercase',
    textDecoration: 'underline'
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: 'Times-Bold',
    marginTop: 20,
    marginBottom: 10,
    backgroundColor: '#f0f0f0',
    padding: 5
  },
  table: {
    display: 'flex',
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    marginTop: 10,
    marginBottom: 10
  },
  tableRow: {
    margin: 'auto',
    flexDirection: 'row'
  },
  tableColHeader: {
    width: '25%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    backgroundColor: '#e6e6e6'
  },
  tableColHeaderLarge: {
    width: '50%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    backgroundColor: '#e6e6e6'
  },
  tableCol: {
    width: '25%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0
  },
  tableColLarge: {
    width: '50%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0
  },
  tableCellHeader: {
    margin: 5,
    fontSize: 10,
    fontFamily: 'Times-Bold'
  },
  tableCell: {
    margin: 5,
    fontSize: 10
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 65,
    right: 65,
    textAlign: 'center',
    fontSize: 10,
    color: '#666666',
    borderTopWidth: 1,
    borderTopColor: '#cccccc',
    paddingTop: 10
  },
  pageNumber: {
    position: 'absolute',
    bottom: 30,
    right: 65,
    fontSize: 10
  },
  eventSection: {
    marginBottom: 30,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eeeeee'
  },
  eventTitle: {
    fontSize: 16,
    marginBottom: 10
  },
  eventMeta: {
    fontSize: 11,
    color: '#666',
    marginBottom: 15,
    lineHeight: 1.5
  },
  eventDesc: {
    fontSize: 11,
    lineHeight: 1.5,
    marginBottom: 15
  },
  agendaHeader: {
    fontSize: 12,
    marginTop: 10,
    marginBottom: 10,
    backgroundColor: '#f9f9f9',
    padding: 5
  },
  agendaRow: {
    flexDirection: 'row',
    marginBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingBottom: 5
  },
  agendaTime: {
    width: '30%',
    fontSize: 10,
    color: '#666'
  },
  agendaText: {
    width: '70%',
    fontSize: 10
  }
})

export interface ReportTranslations {
  university: string
  faculty: string
  department: string
  datePrefix: string
  summaryPrefix: string
  description: string
  colDateTime: string
  colEventLocation: string
  colCategory: string
  noEvents: string
  locPrefix: string
  footer: string
  pagePrefix: string
  pageOf: string
  detailedAgendaPrefix: string
}

interface AdminReportEvent extends CalendarEvent {
  agendaText?: string | null
  published?: boolean
}

interface AcademicReportDocumentProps {
  events: AdminReportEvent[]
  reportTitle: string
  monthYear?: string
  translations: ReportTranslations
  locale: string
  format?: 'SUMMARY' | 'DETAILED'
}

export default function AcademicReportDocument({ events, reportTitle, monthYear, translations, locale, format = 'SUMMARY' }: AcademicReportDocumentProps) {
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  const isAr = locale === 'ar'
  const baseFont = isAr ? 'Amiri' : 'Times-Roman'
  const boldFont = isAr ? 'Amiri' : 'Times-Bold'

  // Helper: reshape Arabic text for PDF rendering (letters won't connect without this)
  const ar = (str: string) => isAr ? reshapeArabic(str) : str

  return (
    <Document>
      <Page size="A4" style={{ ...styles.page, fontFamily: baseFont, direction: isAr ? 'rtl' : 'ltr' }}>
        
        {/* Header matching CU/FEPS official documents */}
        <View style={styles.header}>
          {isAr ? (
            <>
              <Image src="/feps-logo.png" style={styles.logo} />
              <Image src="/cu-logo.png" style={styles.logo} />
            </>
          ) : (
            <>
              <Image src="/cu-logo.png" style={styles.logo} />
              <Image src="/feps-logo.png" style={styles.logo} />
            </>
          )}
        </View>

        <View style={styles.headerTextContainer}>
          <Text style={{ ...styles.universityText, fontFamily: boldFont }}>{ar(translations.university)}</Text>
          <Text style={styles.facultyText}>{ar(translations.faculty)}</Text>
          <Text style={styles.facultyText}>{ar(translations.department)}</Text>
        </View>

        {/* Date line — compose as single string so bidi doesn't scramble it */}
        <Text style={{ fontSize: 11, marginBottom: 20, textAlign: 'right' }}>
          {isAr
            ? ar(translations.datePrefix) + currentDate
            : translations.datePrefix + currentDate
          }
        </Text>

        <Text style={{ ...styles.documentTitle, fontFamily: boldFont }}>{ar(reportTitle)}</Text>

        {monthYear && (
          // Compose full sentence before reshaping so word joins work across boundary
          <Text style={{ fontSize: 12, marginBottom: 15, textAlign: isAr ? 'right' : 'left' }}>
            {isAr
              ? ar(translations.summaryPrefix + monthYear)
              : translations.summaryPrefix + monthYear + '.'
            }
          </Text>
        )}

        <Text style={{ fontSize: 11, marginBottom: 10, lineHeight: 1.5, textAlign: isAr ? 'right' : 'justify' }}>
          {ar(translations.description)}
        </Text>

        {/* Event Ledger */}
        {format === 'SUMMARY' ? (
          <View style={styles.table}>
            <View style={styles.tableRow}>
              {isAr ? (
                <>
                  <View style={styles.tableColHeader}><Text style={{ ...styles.tableCellHeader, fontFamily: boldFont, textAlign: 'right' }}>{ar(translations.colCategory)}</Text></View>
                  <View style={styles.tableColHeaderLarge}><Text style={{ ...styles.tableCellHeader, fontFamily: boldFont, textAlign: 'right' }}>{ar(translations.colEventLocation)}</Text></View>
                  <View style={{ ...styles.tableColHeader, borderRightWidth: 0 }}><Text style={{ ...styles.tableCellHeader, fontFamily: boldFont, textAlign: 'right' }}>{ar(translations.colDateTime)}</Text></View>
                </>
              ) : (
                <>
                  <View style={styles.tableColHeader}><Text style={{ ...styles.tableCellHeader, fontFamily: boldFont, textAlign: 'left' }}>{translations.colDateTime}</Text></View>
                  <View style={styles.tableColHeaderLarge}><Text style={{ ...styles.tableCellHeader, fontFamily: boldFont, textAlign: 'left' }}>{translations.colEventLocation}</Text></View>
                  <View style={{ ...styles.tableColHeader, borderRightWidth: 0 }}><Text style={{ ...styles.tableCellHeader, fontFamily: boldFont, textAlign: 'left' }}>{translations.colCategory}</Text></View>
                </>
              )}
            </View>

            {events.length === 0 ? (
              <View style={styles.tableRow}>
                <View style={{ width: '100%', borderStyle: 'solid', borderWidth: 1, borderLeftWidth: 0, borderTopWidth: 0, padding: 10 }}>
                  <Text style={{ fontSize: 10, textAlign: 'center', color: '#666', fontFamily: baseFont }}>{translations.noEvents}</Text>
                </View>
              </View>
            ) : (
              events.map((ev, i) => {
                const meta = EVENT_TYPE_META[ev.type]
                
                let dateStr: string
                let timeStr: string
                
                if (isAr) {
                  const d = new Date(ev.startDate)
                  const monthNameAr = d.toLocaleDateString('ar-EG-u-nu-latn', { month: 'long' })
                  dateStr = `${d.getFullYear()} ${ar(monthNameAr)} ${d.getDate()}`
                  
                  const h = d.getHours()
                  const mm = d.getMinutes().toString().padStart(2, '0')
                  timeStr = `${h % 12 || 12}:${mm} ${ar(h >= 12 ? 'م' : 'ص')}`
                } else {
                  dateStr = new Date(ev.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                  timeStr = new Date(ev.startDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
                }
                
                return (
                  <View style={styles.tableRow} key={ev.id || i}>
                    {isAr ? (
                      <>
                        <View style={styles.tableCol}>
                          <Text style={{ ...styles.tableCell, textAlign: 'right' }}>{ar(meta.labelAr)}</Text>
                        </View>
                        <View style={styles.tableColLarge}>
                          <Text style={{ ...styles.tableCell, fontFamily: boldFont, textAlign: 'right' }}>{ar(ev.title)}</Text>
                          {ev.location && <Text style={{ ...styles.tableCell, color: '#444', marginTop: 0, textAlign: 'right' }}>{ar(translations.locPrefix + ev.location)}</Text>}
                        </View>
                        <View style={{ ...styles.tableCol, borderRightWidth: 0 }}>
                          <Text style={{ ...styles.tableCell, textAlign: 'right' }}>{dateStr}</Text>
                          <Text style={{ ...styles.tableCell, color: '#666', marginTop: 0, textAlign: 'right' }}>{timeStr}</Text>
                        </View>
                      </>
                    ) : (
                      <>
                        <View style={styles.tableCol}>
                          <Text style={{ ...styles.tableCell, textAlign: 'left' }}>{dateStr}</Text>
                          <Text style={{ ...styles.tableCell, color: '#666', marginTop: 0, textAlign: 'left' }}>{timeStr}</Text>
                        </View>
                        <View style={styles.tableColLarge}>
                          <Text style={{ ...styles.tableCell, fontFamily: boldFont, textAlign: 'left' }}>{ev.title}</Text>
                          {ev.location && <Text style={{ ...styles.tableCell, color: '#444', marginTop: 0, textAlign: 'left' }}>{translations.locPrefix}{ev.location}</Text>}
                        </View>
                        <View style={{ ...styles.tableCol, borderRightWidth: 0 }}>
                          <Text style={{ ...styles.tableCell, textAlign: 'left' }}>{meta.label}</Text>
                        </View>
                      </>
                    )}
                  </View>
                )
              })
            )}
          </View>
        ) : (
          <View>
            {events.length === 0 ? (
              <Text style={{ fontSize: 10, textAlign: 'center', color: '#666', fontFamily: baseFont }}>{translations.noEvents}</Text>
            ) : (
              events.map((ev, i) => {
                const meta = EVENT_TYPE_META[ev.type]
                let dateStr: string
                let timeStr: string
                
                if (isAr) {
                  const d = new Date(ev.startDate)
                  const monthNameAr = d.toLocaleDateString('ar-EG-u-nu-latn', { month: 'long' })
                  dateStr = `${d.getFullYear()} ${ar(monthNameAr)} ${d.getDate()}`
                  const h = d.getHours()
                  const mm = d.getMinutes().toString().padStart(2, '0')
                  timeStr = `${h % 12 || 12}:${mm} ${ar(h >= 12 ? 'م' : 'ص')}`
                } else {
                  dateStr = new Date(ev.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                  timeStr = new Date(ev.startDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
                }

                let agendaCells: any[] = []
                if (ev.agendaText) {
                  try {
                    const parsed = JSON.parse(ev.agendaText)
                    if (Array.isArray(parsed)) agendaCells = parsed
                  } catch {
                    // Ignore parsing error
                  }
                }

                return (
                  <View style={styles.eventSection} key={ev.id || i} wrap={false}>
                    <Text style={{ ...styles.eventTitle, fontFamily: boldFont, textAlign: isAr ? 'right' : 'left' }}>{ar(isAr ? (ev.titleAr || ev.title) : ev.title)}</Text>
                    
                    <Text style={{ ...styles.eventMeta, textAlign: isAr ? 'right' : 'left' }}>
                      {ar(isAr ? meta.labelAr : meta.label)} | {dateStr} - {timeStr}
                      {ev.location ? ` | ${ar(translations.locPrefix + ev.location)}` : ''}
                    </Text>

                    {ev.description && (
                      <Text style={{ ...styles.eventDesc, textAlign: isAr ? 'right' : 'justify' }}>
                        {ar(ev.description)}
                      </Text>
                    )}

                    {agendaCells.length > 0 && (
                      <View wrap={false}>
                        <Text style={{ ...styles.agendaHeader, fontFamily: boldFont, textAlign: isAr ? 'right' : 'left' }}>
                          {ar(translations.detailedAgendaPrefix)}
                        </Text>
                        
                        {agendaCells.map((cell, idx) => {
                          const timeRange = `${cell.startTime || ''} ${cell.endTime ? '- ' + cell.endTime : ''}`
                          return (
                            <View style={{ ...styles.agendaRow, flexDirection: isAr ? 'row-reverse' : 'row' }} key={idx}>
                              <Text style={{ ...styles.agendaTime, textAlign: isAr ? 'right' : 'left' }}>
                                {cell.day ? `${ar(cell.day)}: ` : ''} {timeRange}
                              </Text>
                              <Text style={{ ...styles.agendaText, textAlign: isAr ? 'right' : 'left' }}>
                                {ar(cell.text || '')}
                              </Text>
                            </View>
                          )
                        })}
                      </View>
                    )}
                  </View>
                )
              })
            )}
          </View>
        )}

        {/* Footer */}
        <Text style={styles.footer}>
          {ar(translations.footer)}
        </Text>
        <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => (
          `${translations.pagePrefix}${pageNumber}${translations.pageOf}${totalPages}`
        )} fixed />
      </Page>
    </Document>
  )
}
