import React from 'react'
import { Page, Text, View, Document, StyleSheet, Image, Svg, Path } from '@react-pdf/renderer'

const BRAND_NAVY = '#1A2B4C'
const BRAND_GOLD = '#8C6D41'
const BRAND_GOLD_LIGHT = '#F4F0E8'
const TEXT_MAIN = '#1E293B'
const TEXT_MUTED = '#64748B'
const BORDER_COLOR = '#E2E8F0'

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    backgroundColor: '#FFFFFF',
    padding: 0,
    paddingBottom: 50, // Space for footer
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
  
  // SIDEBAR BACKGROUND (Fixed)
  sidebarBg: {
    position: 'absolute',
    top: 130, // Approximate height of header + top bar
    left: 0,
    bottom: 0,
    width: '32%',
    backgroundColor: '#F8FAFC',
    borderRightWidth: 1,
    borderRightColor: BORDER_COLOR,
    zIndex: -1,
  },

  // SIDEBAR (Left Content)
  sidebar: {
    width: '32%',
    padding: 30,
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
  sectionHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    borderLeftWidth: 3,
    borderLeftColor: BRAND_GOLD,
    paddingLeft: 10,
  },
  sectionTitle: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 14,
    color: BRAND_NAVY,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginLeft: 8,
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

  // SIGNATURE SECTION
  signatureSection: {
    marginTop: 50,
    alignItems: 'flex-start',
    paddingTop: 30,
    borderTopWidth: 1,
    borderTopColor: BORDER_COLOR,
  },
  signatureText: {
    fontFamily: 'Times-Italic',
    fontSize: 22,
    color: BRAND_NAVY,
    marginBottom: 10,
  },
  signatureLine: {
    width: 200,
    height: 1,
    backgroundColor: TEXT_MUTED,
    marginBottom: 8,
  },
  signatureRole: {
    fontSize: 9,
    color: TEXT_MUTED,
    textTransform: 'uppercase',
    letterSpacing: 1,
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

// Iconos SVG
const IconClipboard = () => (
  <Svg viewBox="0 0 24 24" width={16} height={16}>
    <Path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" fill="none" stroke={BRAND_NAVY} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M15 2H9a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1z" fill="none" stroke={BRAND_NAVY} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
)

const IconShield = () => (
  <Svg viewBox="0 0 24 24" width={16} height={16}>
    <Path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="none" stroke={BRAND_NAVY} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
)

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
        <View style={styles.topBar} fixed />

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

        {/* SIDEBAR BACKGROUND FIX (Spans all pages) */}
        <View style={styles.sidebarBg} fixed />

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
              
              <Text style={styles.sidebarLabel}>Agency</Text>
              <Text style={styles.sidebarValue}>{quote.profiles?.agencies?.name || 'TBD'}</Text>
              
              <Text style={styles.sidebarLabel}>Agent</Text>
              <Text style={styles.sidebarValue}>{quote.profiles?.name || 'Agent'}</Text>
            </View>
          </View>

          {/* RIGHT CONTENT */}
          <View style={styles.content}>
            {Object.keys(formData).length > 0 && (
              <View style={{ marginBottom: 40 }}>
                <View style={styles.sectionHeaderContainer}>
                  <IconClipboard />
                  <Text style={styles.sectionTitle}>Application Data</Text>
                </View>
                <View style={styles.table}>
                  {Object.entries(formData).map(([key, value], index) => {
                    if (key.startsWith('_')) return null
                    return (
                      <View wrap={false} style={[styles.tableRow, index % 2 === 0 ? styles.tableRowEven : styles.tableRowOdd]} key={index}>
                        <Text style={styles.tableLabel}>{formatKey(key)}</Text>
                        <Text style={styles.tableValue}>{String(value)}</Text>
                      </View>
                    )
                  })}
                </View>
              </View>
            )}

            {quote.products && quote.products.length > 0 && (
              <View style={{ marginBottom: 40 }} wrap={false}>
                <View style={styles.sectionHeaderContainer}>
                  <IconShield />
                  <Text style={styles.sectionTitle}>Required Coverages</Text>
                </View>
                <View style={styles.badgeContainer}>
                  {quote.products.map((prod: string, i: number) => (
                    <Text key={i} style={styles.badge}>{prod}</Text>
                  ))}
                </View>
              </View>
            )}

            {/* FIRMA DE LA AGENCIA */}
            <View style={styles.signatureSection} wrap={false}>
              <Text style={styles.signatureText}>{quote.profiles?.agencies?.name || 'Agencia Comercial'}</Text>
              <View style={styles.signatureLine} />
              <Text style={styles.signatureRole}>Agencia Comercial Autorizada</Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>CONFIDENTIAL DOCUMENT - NOT BINDER OF COVERAGE</Text>
          <Text style={styles.footerBrand}>CRISOL UNDERWRITING</Text>
        </View>
      </Page>
    </Document>
  )
}
