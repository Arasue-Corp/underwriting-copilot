import React from 'react'
import { Page, Text, View, Document, StyleSheet, Image } from '@react-pdf/renderer'

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
    backgroundColor: '#FAFAFA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 35,
    borderBottomWidth: 1.5,
    borderBottomColor: '#1A2B4C',
    paddingBottom: 20,
  },
  headerLeft: {
    flex: 1,
  },
  logoContainer: {
    flexDirection: 'row',
    gap: 20,
    alignItems: 'center',
  },
  logoImage: {
    height: 55,
    objectFit: 'contain',
  },
  title: {
    fontFamily: 'Times-Roman',
    fontSize: 26,
    color: '#1A2B4C',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 6,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  section: {
    marginBottom: 25,
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sectionTitle: {
    fontFamily: 'Times-Roman',
    fontSize: 14,
    color: '#8C6D41',
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 10,
    alignItems: 'flex-start',
  },
  label: {
    width: 160,
    fontSize: 9,
    color: '#64748B',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  value: {
    flex: 1,
    fontSize: 11,
    color: '#0F172A',
    lineHeight: 1.4,
  },
  table: {
    width: '100%',
    marginTop: 5,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
    paddingVertical: 10,
  },
  tableRowEven: {
    backgroundColor: '#F8FAFC',
  },
  tableLabel: {
    width: '45%',
    fontSize: 9,
    color: '#475569',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    paddingRight: 10,
  },
  tableValue: {
    width: '55%',
    fontSize: 10,
    color: '#0F172A',
    lineHeight: 1.4,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 15,
  },
  footerText: {
    fontSize: 8,
    color: '#94A3B8',
  }
})

interface QuoteRequestPDFProps {
  quote: any
  agencyLogo?: string | null
  clientLogo?: string | null
}

function formatKey(key: string) {
  // Elimina prefijos comunes
  let formatted = key.replace(/^(general_|property_|cyber_|gl_|auto_|wc_)/, '')
  // Reemplaza guiones bajos con espacios
  formatted = formatted.replace(/_/g, ' ')
  // Capitaliza cada palabra
  return formatted.replace(/\b\w/g, l => l.toUpperCase())
}

export const QuoteRequestPDF = ({ quote, agencyLogo, clientLogo }: QuoteRequestPDFProps) => {
  const formData = typeof quote.form_data === 'string' 
    ? JSON.parse(quote.form_data || '{}') 
    : (quote.form_data || {})

  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.title}>Solicitud de Cotización</Text>
            <Text style={styles.subtitle}>
              Folio: {quote.id.substring(0, 8).toUpperCase()} | {new Date(quote.created_at).toLocaleDateString()}
            </Text>
          </View>
          <View style={styles.logoContainer}>
            {clientLogo && <Image src={clientLogo} style={styles.logoImage} />}
            {agencyLogo && <Image src={agencyLogo} style={styles.logoImage} />}
          </View>
        </View>

        {/* Datos Generales */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resumen Ejecutivo</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Cliente Prospecto</Text>
            <Text style={styles.value}>{quote.client_name}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Giro / Industria</Text>
            <Text style={styles.value}>{quote.client_business_type || 'No especificado'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Aseguradora Destino</Text>
            <Text style={styles.value}>{quote.carrier_id || 'Por definir'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Línea de Cobertura</Text>
            <Text style={styles.value}>{quote.coverage_requested}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Agente Responsable</Text>
            <Text style={styles.value}>{quote.profiles?.name || 'Agente'}</Text>
          </View>
        </View>

        {/* Detalles del Formulario */}
        {Object.keys(formData).length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Detalles de Suscripción</Text>
            <View style={styles.table}>
              {Object.entries(formData).map(([key, value], index) => {
                if (key.startsWith('_')) return null
                
                return (
                  <View style={[styles.tableRow, index % 2 === 0 ? styles.tableRowEven : {}]} key={index}>
                    <Text style={styles.tableLabel}>{formatKey(key)}</Text>
                    <Text style={styles.tableValue}>{String(value)}</Text>
                  </View>
                )
              })}
            </View>
          </View>
        )}

        {/* Productos */}
        {quote.products && quote.products.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Productos Vinculados</Text>
            <View style={styles.row}>
              <Text style={styles.value}>{quote.products.join(', ')}</Text>
            </View>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Generado por Crisol Underwriting</Text>
          <Text style={styles.footerText}>Documento Confidencial - No representa cobertura asegurada</Text>
        </View>
      </Page>
    </Document>
  )
}
