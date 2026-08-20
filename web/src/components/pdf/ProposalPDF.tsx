import React from 'react'
import { Page, Text, View, Document, StyleSheet, Image, Svg, Path } from '@react-pdf/renderer'

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
    paddingBottom: 60,
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
  titleContainer: {
    flex: 1,
  },
  title: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 28,
    color: '#FFFFFF',
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
    borderWidth: 1,
    borderColor: BRAND_GOLD,
    maxWidth: 120,
    maxHeight: 60,
    justifyContent: 'center',
    alignItems: 'center'
  },
  logoImage: {
    height: 40,
    objectFit: 'contain',
  },
  
  // INTRO SUMMARY
  introBox: {
    marginHorizontal: 40,
    marginTop: 30,
    marginBottom: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: BORDER_COLOR,
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  introBlock: {
    width: '45%'
  },
  introLabel: {
    fontSize: 9,
    color: TEXT_MUTED,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  introValue: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 14,
    color: BRAND_NAVY,
  },

  // PROPOSAL CARD
  card: {
    marginHorizontal: 40,
    marginBottom: 25,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    overflow: 'hidden'
  },
  cardHeader: {
    backgroundColor: '#F8FAFC',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: BORDER_COLOR,
  },
  cardCarrier: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 10,
    color: BRAND_GOLD,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  cardProduct: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 18,
    color: BRAND_NAVY,
  },
  
  // PRICING BAR
  pricingBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: BORDER_COLOR,
  },
  pricingBlock: {
    flex: 1,
  },
  pricingLabel: {
    fontSize: 8,
    color: TEXT_MUTED,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  pricingValue: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 20,
    color: '#059669', // Emerald 600
  },
  pricingValueDark: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 16,
    color: BRAND_NAVY,
  },
  paymentOptions: {
    marginTop: 6,
    fontSize: 9,
    color: TEXT_MUTED,
    fontFamily: 'Helvetica-Oblique'
  },

  // CARD CONTENT
  cardContent: {
    padding: 15,
  },
  
  sectionTitle: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 10,
    color: BRAND_NAVY,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  
  coverageItem: {
    flexDirection: 'row',
    marginBottom: 6,
    alignItems: 'flex-start'
  },
  coverageBullet: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: BRAND_GOLD,
    marginRight: 6,
    marginTop: 4,
  },
  coverageText: {
    fontSize: 10,
    color: TEXT_MAIN,
    lineHeight: 1.4,
    flex: 1
  },

  // INCLUDES / EXCLUDES
  gridTwo: {
    flexDirection: 'row',
    marginTop: 15,
    gap: 15,
  },
  colHalf: {
    width: '48%',
    padding: 10,
    borderRadius: 6,
  },
  bgGreen: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#D1FAE5'
  },
  bgRed: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FEE2E2'
  },
  incTitle: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 9,
    color: '#065F46',
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  excTitle: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 9,
    color: '#991B1B',
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  incItem: {
    fontSize: 9,
    color: '#047857',
    marginBottom: 3,
  },
  excItem: {
    fontSize: 9,
    color: '#B91C1C',
    marginBottom: 3,
  },

  // NOTES
  notesBox: {
    marginTop: 15,
    padding: 10,
    backgroundColor: '#F8FAFC',
    borderRadius: 6,
  },
  notesText: {
    fontSize: 9,
    color: TEXT_MUTED,
    fontFamily: 'Helvetica-Oblique',
    lineHeight: 1.4,
  },

  // SIGNATURE SECTION
  signatureSection: {
    marginHorizontal: 40,
    marginTop: 30,
    paddingTop: 30,
    borderTopWidth: 1,
    borderTopColor: BORDER_COLOR,
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  sigBlock: {
    width: '45%'
  },
  sigLine: {
    borderBottomWidth: 1,
    borderBottomColor: TEXT_MAIN,
    height: 30,
    marginBottom: 8,
  },
  sigLabel: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 9,
    color: BRAND_NAVY,
  },
  sigSub: {
    fontSize: 8,
    color: TEXT_MUTED,
    marginTop: 2,
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

interface ProposalPDFProps {
  quote: any
}

export const ProposalPDF = ({ quote }: ProposalPDFProps) => {
  const proposals = quote.quotes_provided || []
  const agencyLogo = quote.agencies?.logo_url

  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        
        {/* Color Bar */}
        <View style={styles.topBar} fixed />

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Propuesta de Seguros</Text>
            <Text style={styles.subtitle}>
              REF: {quote.id.substring(0, 8).toUpperCase()}  |  FECHA: {new Date().toLocaleDateString()}
            </Text>
          </View>
          {agencyLogo && (
            <View style={styles.logoWhiteBox}>
              <Image src={agencyLogo} style={styles.logoImage} />
            </View>
          )}
        </View>

        {/* Intro */}
        <View style={styles.introBox}>
          <View style={styles.introBlock}>
            <Text style={styles.introLabel}>Preparado para:</Text>
            <Text style={styles.introValue}>{quote.client_name}</Text>
            <Text style={{fontSize: 10, color: TEXT_MUTED, marginTop: 4}}>{quote.client_business_type}</Text>
          </View>
          <View style={[styles.introBlock, {alignItems: 'flex-end'}]}>
            <Text style={styles.introLabel}>Preparado por:</Text>
            <Text style={styles.introValue}>{quote.profiles?.name}</Text>
            <Text style={{fontSize: 10, color: TEXT_MUTED, marginTop: 4}}>{quote.agencies?.name}</Text>
          </View>
        </View>

        {/* Policies */}
        {proposals.map((prop: any, idx: number) => (
          <View key={idx} style={styles.card} wrap={false}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardCarrier}>{prop.carrier || 'Aseguradora'}</Text>
              <Text style={styles.cardProduct}>{prop.product}</Text>
            </View>
            
            <View style={styles.pricingBar}>
              <View style={styles.pricingBlock}>
                <Text style={styles.pricingLabel}>Prima Total Anual</Text>
                <Text style={styles.pricingValue}>${Number(prop.premium).toLocaleString('en-US', {minimumFractionDigits: 2})}</Text>
              </View>
              {prop.monthly_payment && Number(prop.monthly_payment) > 0 && (
                <View style={styles.pricingBlock}>
                  <Text style={styles.pricingLabel}>Pago Mensual</Text>
                  <Text style={styles.pricingValueDark}>${Number(prop.monthly_payment).toLocaleString('en-US', {minimumFractionDigits: 2})}</Text>
                </View>
              )}
            </View>
            
            {prop.payment_options && (
              <View style={{paddingHorizontal: 15, paddingTop: 10}}>
                <Text style={styles.paymentOptions}>Opciones: {prop.payment_options}</Text>
              </View>
            )}

            <View style={styles.cardContent}>
              {prop.coverages && (
                <View>
                  <Text style={styles.sectionTitle}>Límites de Cobertura</Text>
                  {prop.coverages.split('|').map((c: string, i: number) => (
                    <View key={i} style={styles.coverageItem}>
                      <View style={styles.coverageBullet}></View>
                      <Text style={styles.coverageText}>{c.trim()}</Text>
                    </View>
                  ))}
                </View>
              )}

              {(prop.included || prop.excluded) && (
                <View style={styles.gridTwo}>
                  {prop.included && (
                    <View style={[styles.colHalf, styles.bgGreen]}>
                      <Text style={styles.incTitle}>QUÉ INCLUYE</Text>
                      {prop.included.split('|').map((inc: string, i: number) => (
                        <Text key={i} style={styles.incItem}>• {inc.trim()}</Text>
                      ))}
                    </View>
                  )}
                  {prop.excluded && (
                    <View style={[styles.colHalf, styles.bgRed]}>
                      <Text style={styles.excTitle}>QUÉ NO CUBRE</Text>
                      {prop.excluded.split('|').map((exc: string, i: number) => (
                        <Text key={i} style={styles.excItem}>• {exc.trim()}</Text>
                      ))}
                    </View>
                  )}
                </View>
              )}

              {prop.notes && (
                <View style={styles.notesBox}>
                  <Text style={[styles.sectionTitle, {fontSize: 8, marginBottom: 2}]}>Notas / Condiciones</Text>
                  <Text style={styles.notesText}>{prop.notes}</Text>
                </View>
              )}
            </View>
          </View>
        ))}

        {/* Signature */}
        <View style={styles.signatureSection} wrap={false}>
          <View style={styles.sigBlock}>
            <View style={styles.sigLine}></View>
            <Text style={styles.sigLabel}>Aceptación del Cliente</Text>
            <Text style={styles.sigSub}>Firma / Nombre / Fecha</Text>
          </View>
          <View style={styles.sigBlock}>
            <View style={styles.sigLine}></View>
            <Text style={styles.sigLabel}>{quote.agencies?.name || 'Agencia'}</Text>
            <Text style={styles.sigSub}>Representante Autorizado</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>Esta es una propuesta indicativa y no constituye una póliza en vigor hasta su emisión oficial.</Text>
          <Text style={styles.footerBrand}>CRISOL UNDERWRITING</Text>
        </View>
      </Page>
    </Document>
  )
}
