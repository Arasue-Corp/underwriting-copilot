import React from 'react'
import { Page, Text, View, Document, StyleSheet, Image, Svg, Path } from '@react-pdf/renderer'

// Paleta de Colores Cálida y Premium
const COLORS = {
  bg: '#FDFBF7',         // Blanco hueso muy cálido
  textDark: '#2C363F',   // Gris carbón cálido (casi negro)
  textMuted: '#7D7C7A',  // Gris medio cálido
  gold: '#B88645',       // Dorado cálido
  goldLight: '#F3EFE9',  // Crema con toque dorado
  border: '#EAE6DF',     // Borde suave cálido
  white: '#FFFFFF',
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
    backgroundColor: COLORS.gold,
  },
  
  // HEADER
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 40,
    marginTop: 10,
  },
  titleContainer: {
    flex: 1,
  },
  documentTitle: {
    fontFamily: 'Times-Roman',
    fontSize: 28,
    color: COLORS.textDark,
    marginBottom: 8,
    letterSpacing: 1,
  },
  documentSubtitle: {
    fontSize: 10,
    color: COLORS.textMuted,
    letterSpacing: 1.5,
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
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingBottom: 8,
  },
  sectionTitle: {
    fontFamily: 'Times-Roman',
    fontSize: 16,
    color: COLORS.gold,
    letterSpacing: 1,
    marginLeft: 8,
    textTransform: 'uppercase',
  },
  
  // SUMMARY GRID
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: COLORS.white,
    borderRadius: 8,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
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
  },
  summaryValue: {
    fontSize: 12,
    color: COLORS.textDark,
    fontFamily: 'Helvetica-Bold',
  },

  // Q&A TABLE
  qaContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  qaRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingVertical: 12,
    paddingHorizontal: 15,
  },
  qaRowEven: {
    backgroundColor: COLORS.bg,
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
    fontSize: 11,
    color: COLORS.textDark,
    lineHeight: 1.4,
  },

  // BADGES
  badgeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  badge: {
    backgroundColor: COLORS.goldLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#EAE1D1',
  },
  badgeText: {
    color: COLORS.gold,
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // SIGNATURE SECTION
  signatureSection: {
    marginTop: 50,
    alignItems: 'center',
    paddingTop: 30,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  signatureText: {
    fontFamily: 'Times-Italic',
    fontSize: 24,
    color: COLORS.textDark,
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
    color: COLORS.gold,
    letterSpacing: 1,
    textTransform: 'uppercase',
  }
})

// Iconos SVG
const IconUser = () => (
  <Svg viewBox="0 0 24 24" width={16} height={16}>
    <Path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" fill="none" stroke={COLORS.gold} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" fill="none" stroke={COLORS.gold} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
)

const IconClipboard = () => (
  <Svg viewBox="0 0 24 24" width={16} height={16}>
    <Path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" fill="none" stroke={COLORS.gold} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M15 2H9a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1z" fill="none" stroke={COLORS.gold} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
)

const IconShield = () => (
  <Svg viewBox="0 0 24 24" width={16} height={16}>
    <Path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="none" stroke={COLORS.gold} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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

        {/* RESUMEN EJECUTIVO */}
        <View style={styles.section}>
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
                  {/* WRAP={FALSE} EVITA QUE LA FILA SE CORTE A LA MITAD ENTRE PÁGINAS */}
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
          <Text style={styles.signatureText}>{quote.profiles?.name || 'Firma Autorizada'}</Text>
          <View style={styles.signatureLine} />
          <Text style={styles.signatureRole}>Agente Comercial Autorizado</Text>
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
