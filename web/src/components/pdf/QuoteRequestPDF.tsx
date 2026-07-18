import React from 'react'
import { Page, Text, View, Document, StyleSheet, Image } from '@react-pdf/renderer'

const BRAND_NAVY = '#0B162C'
const BRAND_GOLD = '#B4935A'
const BRAND_GOLD_LIGHT = '#F4F0E8'
const TEXT_MAIN = '#1E293B'
const TEXT_MUTED = '#64748B'
const BORDER_COLOR = '#E2E8F0'

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    backgroundColor: '#FFFFFF',
    padding: 0,
  },
  // TOP BAR
  topBar: {
    height: 8,
    backgroundColor: BRAND_GOLD,
    width: '100%',
  },
  // HEADER
  header: {
    backgroundColor: BRAND_NAVY,
    paddingHorizontal: 40,
    paddingVertical: 35,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flex: 1,
  },
  title: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 28,
    color: '#FFFFFF',
    letterSpacing: 1,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 10,
    color: '#94A3B8',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  logoWhiteBox: {
    backgroundColor: '#FFFFFF',
    padding: 10,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
    minWidth: 100,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: BRAND_GOLD,
  },
  logoImage: {
    height: 40,
    objectFit: 'contain',
  },
  
  // MAIN LAYOUT
  mainContent: {
    flexDirection: 'row',
    flex: 1,
  },
  // SIDEBAR (Left)
  sidebar: {
    width: '32%',
    backgroundColor: '#F8FAFC',
    padding: 30,
    borderRightWidth: 1,
    borderRightColor: BORDER_COLOR,
  },
  sidebarBlock: {
    marginBottom: 25,
  },
  sidebarTitle: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 10,
    color: BRAND_GOLD,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingBottom: 4,
  },
  sidebarLabel: {
    fontSize: 8,
    color: TEXT_MUTED,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 3,
  },
  sidebarValue: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 11,
    color: BRAND_NAVY,
    marginBottom: 12,
  },
  
  // CONTENT AREA (Right)
  content: {
    width: '68%',
    padding: 35,
  },
  sectionTitle: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 14,
    color: BRAND_NAVY,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 20,
    borderLeftWidth: 3,
    borderLeftColor: BRAND_GOLD,
    paddingLeft: 10,
  },
  
  // TABLE
  table: {
    width: '100%',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingVertical: 12,
  },
  tableRowEven: {
    backgroundColor: '#F8FAFC',
    borderRadius: 4,
    paddingHorizontal: 8,
  },
  tableRowOdd: {
    paddingHorizontal: 8,
  },
  tableLabel: {
    width: '45%',
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: TEXT_MUTED,
    textTransform: 'uppercase',
    paddingRight: 10,
  },
  tableValue: {
    width: '55%',
    fontSize: 10,
    color: TEXT_MAIN,
    lineHeight: 1.5,
  },
  
  // BADGES
  badgeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  badge: {
    backgroundColor: BRAND_GOLD_LIGHT,
    color: BRAND_GOLD,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 4,
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    textTransform: 'uppercase',
  },

  // FOOTER
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: BRAND_NAVY,
    paddingVertical: 15,
    paddingHorizontal: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 3,
    borderTopColor: BRAND_GOLD,
  },
  footerText: {
    fontSize: 8,
    color: '#94A3B8',
    letterSpacing: 0.5,
  },
  footerBrand: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 9,
    color: '#FFFFFF',
    letterSpacing: 1,
  }
})

interface QuoteRequestPDFProps {
  quote: any
  agencyLogo?: string | null
  clientLogo?: string | null
}

function formatKey(key: string) {
  let formatted = key.replace(/^(general_|property_|cyber_|gl_|auto_|wc_)/, '')
  formatted = formatted.replace(/_/g, ' ')
  return formatted.replace(/\b\w/g, l => l.toUpperCase())
}

export const QuoteRequestPDF = ({ quote, agencyLogo, clientLogo }: QuoteRequestPDFProps) => {
  const formData = typeof quote.form_data === 'string' 
    ? JSON.parse(quote.form_data || '{}') 
    : (quote.form_data || {})

  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        
        {/* Color Bar */}
        <View style={styles.topBar} />

        {/* Header (Dark Navy) */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.title}>Underwriting Profile</Text>
            <Text style={styles.subtitle}>
              ID: {quote.id.substring(0, 8).toUpperCase()}  |  DATE: {new Date(quote.created_at).toLocaleDateString()}
            </Text>
          </View>
          {(clientLogo || agencyLogo) && (
            <View style={styles.logoWhiteBox}>
              {clientLogo && <Image src={clientLogo} style={styles.logoImage} />}
              {agencyLogo && <Image src={agencyLogo} style={styles.logoImage} />}
            </View>
          )}
        </View>

        <View style={styles.mainContent}>
          {/* LEFT SIDEBAR */}
          <View style={styles.sidebar}>
            <View style={styles.sidebarBlock}>
              <Text style={styles.sidebarTitle}>Executive Summary</Text>
              
              <Text style={styles.sidebarLabel}>Client Prospect</Text>
              <Text style={styles.sidebarValue}>{quote.client_name}</Text>
              
              <Text style={styles.sidebarLabel}>Industry / Business Type</Text>
              <Text style={styles.sidebarValue}>{quote.client_business_type || 'Unspecified'}</Text>
            </View>

            <View style={styles.sidebarBlock}>
              <Text style={styles.sidebarTitle}>Placement Details</Text>
              
              <Text style={styles.sidebarLabel}>Target Carrier</Text>
              <Text style={styles.sidebarValue}>{quote.carrier_id || 'TBD'}</Text>
              
              <Text style={styles.sidebarLabel}>Line of Business</Text>
              <Text style={styles.sidebarValue}>{quote.coverage_requested}</Text>
            </View>

            <View style={styles.sidebarBlock}>
              <Text style={styles.sidebarTitle}>Brokerage</Text>
              
              <Text style={styles.sidebarLabel}>Agent</Text>
              <Text style={styles.sidebarValue}>{quote.profiles?.name || 'Agent'}</Text>
            </View>
          </View>

          {/* RIGHT CONTENT */}
          <View style={styles.content}>
            {Object.keys(formData).length > 0 && (
              <View style={{ marginBottom: 40 }}>
                <Text style={styles.sectionTitle}>Application Data</Text>
                <View style={styles.table}>
                  {Object.entries(formData).map(([key, value], index) => {
                    if (key.startsWith('_')) return null
                    return (
                      <View style={[styles.tableRow, index % 2 === 0 ? styles.tableRowEven : styles.tableRowOdd]} key={index}>
                        <Text style={styles.tableLabel}>{formatKey(key)}</Text>
                        <Text style={styles.tableValue}>{String(value)}</Text>
                      </View>
                    )
                  })}
                </View>
              </View>
            )}

            {quote.products && quote.products.length > 0 && (
              <View>
                <Text style={styles.sectionTitle}>Required Coverages</Text>
                <View style={styles.badgeContainer}>
                  {quote.products.map((prod: string, i: number) => (
                    <Text key={i} style={styles.badge}>{prod}</Text>
                  ))}
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>CONFIDENTIAL DOCUMENT - NOT BINDER OF COVERAGE</Text>
          <Text style={styles.footerBrand}>CRISOL UNDERWRITING</Text>
        </View>
      </Page>
    </Document>
  )
}
