import React from 'react'
import { Page, Text, View, Document, StyleSheet, Image } from '@react-pdf/renderer'

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 40,
    borderBottomWidth: 2,
    borderBottomColor: '#1A2B4C',
    paddingBottom: 20,
  },
  logoContainer: {
    flexDirection: 'row',
    gap: 15,
    alignItems: 'center',
  },
  logoImage: {
    height: 50,
    objectFit: 'contain',
  },
  title: {
    fontFamily: 'Times-Roman',
    fontSize: 24,
    color: '#1A2B4C',
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontFamily: 'Times-Roman',
    fontSize: 16,
    color: '#8C6D41',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingBottom: 5,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  label: {
    width: 150,
    fontSize: 10,
    color: '#64748B',
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  value: {
    flex: 1,
    fontSize: 11,
    color: '#0F172A',
  },
  table: {
    width: '100%',
    marginTop: 10,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingVertical: 8,
  },
  tableLabel: {
    width: '40%',
    fontSize: 10,
    color: '#475569',
    fontWeight: 'bold',
  },
  tableValue: {
    width: '60%',
    fontSize: 10,
    color: '#0F172A',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    fontSize: 8,
    color: '#94A3B8',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 10,
  }
})

interface QuoteRequestPDFProps {
  quote: any
  agencyLogo?: string | null
  clientLogo?: string | null
}

export const QuoteRequestPDF = ({ quote, agencyLogo, clientLogo }: QuoteRequestPDFProps) => {
  // Parse form_data if it's a string, or use directly if object
  const formData = typeof quote.form_data === 'string' 
    ? JSON.parse(quote.form_data || '{}') 
    : (quote.form_data || {})

  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Solicitud de Cotización</Text>
            <Text style={{ fontSize: 10, color: '#64748B', marginTop: 4 }}>
              Folio: {quote.id.substring(0, 8).toUpperCase()}
            </Text>
          </View>
          <View style={styles.logoContainer}>
            {clientLogo && <Image src={clientLogo} style={styles.logoImage} />}
            {agencyLogo && <Image src={agencyLogo} style={styles.logoImage} />}
          </View>
        </View>

        {/* Datos Generales */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Datos Generales</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Cliente</Text>
            <Text style={styles.value}>{quote.client_name}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Tipo de Negocio</Text>
            <Text style={styles.value}>{quote.client_business_type || 'No especificado'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Aseguradora</Text>
            <Text style={styles.value}>{quote.carrier_id || 'Por definir'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Cobertura Solicitada</Text>
            <Text style={styles.value}>{quote.coverage_requested}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Creado por</Text>
            <Text style={styles.value}>{quote.profiles?.name || 'Agente'}</Text>
          </View>
        </View>

        {/* Detalles del Formulario */}
        {Object.keys(formData).length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Detalles del Cuestionario</Text>
            <View style={styles.table}>
              {Object.entries(formData).map(([key, value], index) => {
                // Ignore internal fields if any
                if (key.startsWith('_')) return null
                
                return (
                  <View style={styles.tableRow} key={index}>
                    <Text style={styles.tableLabel}>{key}</Text>
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
            <Text style={styles.sectionTitle}>Productos Relacionados</Text>
            <View style={styles.row}>
              <Text style={styles.value}>{quote.products.join(', ')}</Text>
            </View>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text>Documento generado el {new Date().toLocaleDateString()} a través de Arasue Underwriting Co-Pilot</Text>
          <Text>Este documento es una solicitud de cotización, no representa cobertura asegurada.</Text>
        </View>
      </Page>
    </Document>
  )
}
