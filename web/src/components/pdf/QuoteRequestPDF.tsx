import React from 'react'
import { Page, Text, View, Document, StyleSheet, Image, Svg, Path } from '@react-pdf/renderer'

// Paleta de Colores Navy & Gold (Crisol / Arasue original pero pulida)
const COLORS = {
  bg: '#FFFFFF',         
  navy: '#1A2B4C',       
  gold: '#8C6D41',       
  textMain: '#0F172A',
  textMuted: '#64748B',
  border: '#E2E8F0',     
  bgLight: '#F8FAFC',
}

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    backgroundColor: COLORS.bg,
    paddingTop: 40,
    paddingBottom: 70, // Espacio para el footer
    paddingHorizontal: 40,
  },
  
  // DECORACIÓN FIJA
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 12,
    backgroundColor: COLORS.navy,
  },
  
  // HEADER
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 35,
    marginTop: 10,
  },
  titleContainer: {
    flex: 1,
  },
  documentTitle: {
    fontFamily: 'Times-Roman',
    fontSize: 26,
    color: COLORS.navy,
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  documentSubtitle: {
    fontSize: 10,
    color: COLORS.textMuted,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  logoImage: {
    height: 45,
    objectFit: 'contain',
  },

  // SECCIONES
  section: {
    marginBottom: 35,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.navy,
    paddingBottom: 8,
  },
  sectionTitle: {
    fontFamily: 'Times-Roman',
    fontSize: 16,
    color: COLORS.gold,
    letterSpacing: 0.5,
    marginLeft: 8,
    textTransform: 'uppercase',
  },
  
  // SUMMARY GRID (Estilo Tarjeta pero sin romper el flujo)
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: COLORS.bgLight,
    borderRadius: 8,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  summaryItem: {
    width: '50%',
    marginBottom: 15,
    paddingRight: 10,
  },
  summaryLabel: {
    fontSize: 8,
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
    fontFamily: 'Helvetica-Bold',
  },
  summaryValue: {
    fontSize: 12,
    color: COLORS.navy,
    fontFamily: 'Helvetica-Bold',
  },

  // Q&A TABLE
  qaContainer: {
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  qaRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingVertical: 12,
    paddingHorizontal: 10,
  },
  qaRowEven: {
    backgroundColor: COLORS.bgLight,
  },
  qaQuestion: {
    width: '45%',
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    paddingRight: 15,
    lineHeight: 1.4,
  },
  qaAnswer: {
    width: '55%',
    fontSize: 10,
    color: COLORS.textMain,
    lineHeight: 1.4,
  },

  // BADGES
  badgeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  badge: {
    backgroundColor: COLORS.navy,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 4,
  },
  badgeText: {
    color: COLORS.bg,
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // SIGNATURE SECTION
  signatureSection: {
    marginTop: 40,
    alignItems: 'center',
    paddingTop: 30,
  },
  signatureText: {
    fontFamily: 'Times-Italic',
    fontSize: 24,
    color: COLORS.navy,
    marginBottom: 10,
  },
  signatureLine: {
    width: 200,
    height: 1,
    backgroundColor: COLORS.textMuted,
    marginBottom: 8,
  },
  signatureRole: {
    fontSize: 9,
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },

  // FOOTER (Fixed on all pages)
  footer: {
    position: 'absolute',
    bottom: 25,
    left: 40,
    right: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 15,
  },
  footerText: {
    fontSize: 8,
    color: COLORS.textMuted,
    letterSpacing: 0.5,
  },
  footerBrand: {
    fontFamily: 'Times-Roman',
    fontSize: 10,
    color: COLORS.navy,
    letterSpacing: 1,
    textTransform: 'uppercase',
  }
})

// Iconos SVG
const IconUser = () => (
  <Svg viewBox="0 0 24 24" width={16} height={16}>
    <Path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" fill="none" stroke={COLORS.navy} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" fill="none" stroke={COLORS.navy} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
)

const IconClipboard = () => (
  <Svg viewBox="0 0 24 24" width={16} height={16}>
    <Path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" fill="none" stroke={COLORS.navy} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M15 2H9a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1z" fill="none" stroke={COLORS.navy} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
)

const IconShield = () => (
  <Svg viewBox="0 0 24 24" width={16} height={16}>
    <Path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="none" stroke={COLORS.navy} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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
        
        {/* Decoración superior (repite en todas las páginas) */}
        <View style={styles.topBar} fixed />

        {/* HEADER */}
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text style={styles.documentTitle}>Perfil de Suscripción</Text>
            <Text style={styles.documentSubtitle}>
              Folio: {quote.id.substring(0, 8).toUpperCase()}  |  Fecha: {new Date(quote.created_at).toLocaleDateString()}
            </Text>
          </View>
          <View style={styles.logoContainer}>
            {clientLogo && <Image src={clientLogo} style={styles.logoImage} />}
            {agencyLogo && <Image src={agencyLogo} style={styles.logoImage} />}
          </View>
        </View>

        {/* RESUMEN EJECUTIVO TIPO "TARJETA" (Una sola columna, pero contenido dividido) */}
        <View style={styles.section} wrap={false}>
          <View style={styles.sectionTitleContainer}>
            <IconUser />
            <Text style={styles.sectionTitle}>Resumen Ejecutivo</Text>
          </View>
          
          <View style={styles.summaryGrid}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Cliente Prospecto</Text>
              <Text style={styles.summaryValue}>{quote.client_name}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Giro / Industria</Text>
              <Text style={styles.summaryValue}>{quote.client_business_type || 'No especificado'}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Aseguradora Destino</Text>
              <Text style={styles.summaryValue}>{quote.carrier_id || 'Por definir'}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Agente Responsable</Text>
              <Text style={styles.summaryValue}>{quote.profiles?.name || 'Agente'}</Text>
            </View>
          </View>
        </View>

        {/* CUESTIONARIO */}
        {Object.keys(formData).length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionTitleContainer}>
              <IconClipboard />
              <Text style={styles.sectionTitle}>Cuestionario de Suscripción</Text>
            </View>
            
            <View style={styles.qaContainer}>
              {Object.entries(formData).map(([key, value], index) => {
                if (key.startsWith('_')) return null
                return (
                  <View wrap={false} style={[styles.qaRow, index % 2 === 0 ? styles.qaRowEven : {}]} key={index}>
                    <Text style={styles.qaQuestion}>{formatKey(key)}</Text>
                    <Text style={styles.qaAnswer}>{String(value)}</Text>
                  </View>
                )
              })}
            </View>
          </View>
        )}

        {/* PRODUCTOS / COBERTURAS */}
        {quote.products && quote.products.length > 0 && (
          <View style={styles.section} wrap={false}>
            <View style={styles.sectionTitleContainer}>
              <IconShield />
              <Text style={styles.sectionTitle}>Coberturas Requeridas</Text>
            </View>
            <View style={styles.badgeContainer}>
              {quote.products.map((prod: string, i: number) => (
                <View key={i} style={styles.badge}>
                  <Text style={styles.badgeText}>{prod}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* FIRMA DE APROBACIÓN */}
        <View style={styles.signatureSection} wrap={false}>
          <Text style={styles.signatureText}>{quote.profiles?.agencies?.name || quote.profiles?.name || 'Agencia Autorizada'}</Text>
          <View style={styles.signatureLine} />
          <Text style={styles.signatureRole}>Agencia Comercial Autorizada</Text>
        </View>

        {/* FOOTER (Fijo en todas las páginas) */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>Documento Confidencial - No representa cobertura asegurada</Text>
          <Text style={styles.footerBrand}>CRISOL UNDERWRITING</Text>
        </View>
        
      </Page>
    </Document>
  )
}
