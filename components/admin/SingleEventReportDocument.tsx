/* eslint-disable jsx-a11y/alt-text */
import React from 'react'
import { Document, Page, Text, View, StyleSheet, Image, Font } from '@react-pdf/renderer'
import { reshapeArabic } from '../../lib/arabicShaper'
import type { CustomField } from '@/app/[locale]/admin/events/[id]/AdminEventDetailClient'

Font.register({
  family: 'Amiri',
  fonts: [
    { src: '/fonts/Amiri-Regular.ttf' },
    { src: '/fonts/Amiri-Bold.ttf', fontWeight: 'bold' }
  ]
})

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
  sectionContent: {
    fontSize: 12,
    lineHeight: 1.5,
    marginBottom: 15
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
  }
})

interface Props {
  event: Record<string, unknown> & { title: string, titleAr?: string | null }
  reportFields: CustomField[]
  isAr: boolean
}

export default function SingleEventReportDocument({ event, reportFields, isAr }: Props) {
  const baseFont = isAr ? 'Amiri' : 'Times-Roman'
  const boldFont = isAr ? 'Amiri' : 'Times-Bold'
  const ar = (str: string) => isAr ? reshapeArabic(str) : str

  return (
    <Document>
      <Page size="A4" style={{ ...styles.page, fontFamily: baseFont, direction: isAr ? 'rtl' : 'ltr' }}>
        
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

        <Text style={{ ...styles.documentTitle, fontFamily: boldFont }}>
          {ar(isAr ? 'تقرير الفعالية' : 'Event Report')}
        </Text>

        <Text style={{ fontSize: 16, fontFamily: boldFont, textAlign: 'center', marginBottom: 20 }}>
          {ar(isAr ? (event.titleAr || event.title) : event.title)}
        </Text>

        {reportFields.map((field) => (
          <View key={field.id} wrap={false}>
            <Text style={{ ...styles.sectionTitle, fontFamily: boldFont, textAlign: isAr ? 'right' : 'left' }}>
              {ar(field.title)}
            </Text>
            <Text style={{ ...styles.sectionContent, textAlign: isAr ? 'right' : 'justify' }}>
              {ar(field.content)}
            </Text>
          </View>
        ))}

        <Text style={styles.footer} fixed>
          {ar(isAr ? 'كلية الاقتصاد والعلوم السياسية - جامعة القاهرة' : 'Faculty of Economics and Political Science - Cairo University')}
        </Text>
      </Page>
    </Document>
  )
}
