'use client'

import React from 'react'
import { Document, Page, View, Text, StyleSheet, Image as PDFImage } from '@react-pdf/renderer'
import type { InvitationConfig } from '@/types/invitation'

interface Props {
  config: InvitationConfig
}

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    padding: 0,
    backgroundColor: '#EBF4FF',
    direction: 'rtl',
  },
  bg: {
    flex: 1,
    padding: 24,
    flexDirection: 'column',
  },
  logosRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  logo: {
    width: 52,
    height: 52,
    objectFit: 'contain',
  },
  goldLine: {
    height: 2,
    backgroundColor: '#D4AF37',
    marginBottom: 12,
  },
  center: {
    textAlign: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontFamily: 'Helvetica-Bold',
    color: '#1A3A6E',
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 11,
    color: '#666',
    textAlign: 'center',
    marginBottom: 10,
  },
  sectionLabel: {
    fontSize: 11,
    color: '#444',
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 2,
  },
  patronName: {
    fontSize: 13,
    fontFamily: 'Helvetica-Bold',
    color: '#1A3A6E',
    textAlign: 'center',
  },
  patronPos: {
    fontSize: 10,
    color: '#555',
    textAlign: 'center',
    marginBottom: 4,
  },
  divider: {
    width: 60,
    height: 1,
    backgroundColor: '#D4AF37',
    alignSelf: 'center',
    marginVertical: 6,
  },
  bodyText: {
    fontSize: 11,
    color: '#333',
    textAlign: 'center',
    marginTop: 10,
  },
  eventTitle: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    color: '#C0392B',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 10,
  },
  footer: {
    backgroundColor: '#1A3A6E',
    padding: '8 16',
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 'auto',
  },
  footerText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontFamily: 'Helvetica-Bold',
  },
})

export default function InvitationPDFDocument({ config }: Props) {
  const {
    hasMinistersPatronage, ministers,
    universityPresidentTitle, universityPresidentName, universityPresidentSuffix,
    supervisionLabel, deanTitle, deanName, deanPosition,
    eventType, bodyText, eventTitleOnCard,
    eventDay, eventDateDisplay, eventTimeDisplay, eventLocationDisplay,
    bgColor,
  } = config

  return (
    <Document>
      <Page size={[595, 420]} style={{ ...styles.page, backgroundColor: bgColor }}>
        <View style={styles.bg}>
          {/* Logos Row */}
          <View style={styles.logosRow}>
            <PDFImage src="/public/cu-logo.png" style={styles.logo} />
            <PDFImage src="/public/feps-logo.png" style={styles.logo} />
          </View>

          {/* Gold line */}
          <View style={styles.goldLine} />

          {/* Card title */}
          <Text style={styles.title}>دعوة {eventType ? `— ${eventType}` : ''}</Text>

          {/* Ministers */}
          {hasMinistersPatronage && ministers.length > 0 && (
            <>
              <Text style={styles.sectionLabel}>تحت رعاية وتشريف</Text>
              {ministers.map((m, i) => (
                <View key={i}>
                  <Text style={styles.patronName}>{m.fullTitle} {m.name}</Text>
                  <Text style={styles.patronPos}>{m.position}</Text>
                </View>
              ))}
              <View style={styles.divider} />
            </>
          )}

          {/* University President */}
          {!hasMinistersPatronage && <Text style={styles.sectionLabel}>تحت رعاية</Text>}
          <Text style={styles.patronName}>{universityPresidentTitle} {universityPresidentName}</Text>
          <Text style={styles.patronPos}>{universityPresidentSuffix}</Text>

          {/* Dean */}
          <Text style={styles.sectionLabel}>{supervisionLabel}</Text>
          <Text style={styles.patronName}>{deanTitle} {deanName}</Text>
          <Text style={styles.patronPos}>{deanPosition}</Text>

          {/* Body + title */}
          {bodyText && <Text style={styles.bodyText}>{bodyText}</Text>}
          {eventTitleOnCard && <Text style={styles.eventTitle}>&quot;{eventTitleOnCard}&quot;</Text>}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          {eventDay || eventDateDisplay ? (
            <Text style={styles.footerText}>📅 {eventDay} {eventDateDisplay}</Text>
          ) : null}
          {eventTimeDisplay ? <Text style={styles.footerText}>🕐 {eventTimeDisplay}</Text> : null}
          {eventLocationDisplay ? <Text style={styles.footerText}>📍 {eventLocationDisplay}</Text> : null}
        </View>
      </Page>
    </Document>
  )
}
