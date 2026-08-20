import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
  Font,
} from '@react-pdf/renderer';

// Register a font for a clean, professional look
Font.register({
  family: 'Inter',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hjp-Ek-_EeA.woff' }, // Regular
    { src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuGKYAZ9hjp-Ek-_EeA.woff', fontWeight: 700 }, // Bold
  ]
});

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Inter',
    backgroundColor: '#ffffff',
    color: '#334155', // slate-700
  },
  coverPage: {
    fontFamily: 'Inter',
    backgroundColor: '#009CFF',
    color: '#ffffff',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  coverTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
    zIndex: 10,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  coverSubtitle: {
    fontSize: 14,
    opacity: 0.9,
    textAlign: 'center',
    marginBottom: 40,
    zIndex: 10,
    letterSpacing: 4,
    textTransform: 'uppercase',
  },
  coverClient: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#ffffff',
    zIndex: 10,
  },
  whiteLogo: {
    width: 220,
    marginBottom: 60,
    zIndex: 10,
  },
  dogDecoration: {
    position: 'absolute',
    bottom: -50,
    right: -50,
    width: 350,
    opacity: 0.9,
    zIndex: 1,
  },
  catDecoration: {
    position: 'absolute',
    top: -20,
    left: -40,
    width: 280,
    opacity: 0.9,
    zIndex: 1,
  },
  agencyLogoFloating: {
    position: 'absolute',
    bottom: 40,
    left: 40,
    width: 100,
    zIndex: 10,
  },
  glowCircle: {
    position: 'absolute',
    width: 600,
    height: 600,
    backgroundColor: '#ffffff',
    opacity: 0.1,
    borderRadius: 300,
    top: -200,
    right: -200,
    zIndex: 0,
  },
  section: {
    marginBottom: 20,
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#514690',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    paddingBottom: 5,
  },
  policyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#334155',
    marginBottom: 5,
  },
  policyBox: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
  },
  tableRow: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  tableColLeft: {
    width: '60%',
    fontSize: 10,
    color: '#475569',
  },
  tableColRight: {
    width: '40%',
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'right',
  },
  priceText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#514690',
  },
  logo: {
    width: 120,
    marginBottom: 40,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    fontSize: 8,
    color: '#94a3b8',
    textAlign: 'center',
  },
  badge: {
    backgroundColor: '#D94F90',
    color: 'white',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    fontSize: 8,
    fontWeight: 'bold',
    marginBottom: 10,
  },
});

interface FormalProposalPDFProps {
  quote: any;
  selectedModules: boolean[];
}

export const FormalProposalPDF = ({ quote, selectedModules }: FormalProposalPDFProps) => {
  const proposals = quote?.quotes_provided || [];
  
  const packageTotal = proposals.reduce((acc: any, prop: any, idx: number) => {
    if (selectedModules[idx] && !prop.is_bundled) {
      acc.premium += Number(prop.premium || 0);
      acc.monthly += Number(prop.monthly_payment || 0);
    }
    return acc;
  }, { premium: 0, monthly: 0 });

  return (
    <Document>
      {/* 1. COVER PAGE */}
      <Page size="LETTER" style={styles.coverPage}>
        <View style={styles.glowCircle} />
        <Image src="/alex-assets/Image-13.png" style={styles.catDecoration} />
        <Image src="/alex-assets/Image-12.png" style={styles.dogDecoration} />
        
        <Image src="/alex-assets/logo-blanco.png" style={styles.whiteLogo} />
        
        <Text style={styles.coverSubtitle}>PREPARED EXCLUSIVELY FOR</Text>
        <Text style={styles.coverTitle}>{quote.client_name}</Text>
        <Text style={styles.coverSubtitle}>
          Executive Summary & Insurance Program Proposal
        </Text>

      </Page>

      {/* 2. EXECUTIVE SUMMARY */}
      <Page size="LETTER" style={styles.page}>
        <View style={styles.section}>
          <Text style={styles.header}>Executive Summary</Text>
          <Text style={{ fontSize: 10, color: '#64748b', marginBottom: 20, lineHeight: 1.5 }}>
            This document outlines the structured insurance program designed for {quote.client_name}. 
            Below is the total financial commitment for the selected policies, followed by a detailed breakdown 
            of the coverages, limits, inclusions, and exclusions.
          </Text>
        </View>

        <View style={{ ...styles.policyBox, backgroundColor: '#f8fafc' }}>
          <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#514690', marginBottom: 10 }}>Total Program Investment</Text>
          <View style={styles.tableRow}>
            <Text style={styles.tableColLeft}>Pay in Full Premium</Text>
            <Text style={styles.priceText}>${packageTotal.premium.toLocaleString('en-US')}</Text>
          </View>
          {packageTotal.monthly > 0 && (
            <View style={styles.tableRow}>
              <Text style={styles.tableColLeft}>Monthly Financing Option</Text>
              <Text style={{ ...styles.priceText, color: '#009CFF', fontSize: 14 }}>${packageTotal.monthly.toLocaleString('en-US')} / mo</Text>
            </View>
          )}
        </View>

        <Text style={styles.header}>Selected Policies Breakdown</Text>
        {proposals.map((prop: any, idx: number) => {
          if (!selectedModules[idx]) return null;
          return (
            <View key={idx} style={styles.policyBox}>
              {prop.is_bundled && <Text style={styles.badge}>INTEGRATED BUNDLE</Text>}
              <View style={styles.tableRow}>
                <View style={{ width: '70%' }}>
                  <Text style={styles.policyTitle}>{prop.product}</Text>
                  {prop.carrier && <Text style={{ fontSize: 9, color: '#64748b', textTransform: 'uppercase' }}>{prop.carrier}</Text>}
                </View>
                <View style={{ width: '30%', textAlign: 'right' }}>
                  {!prop.is_bundled && (
                    <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#334155' }}>
                      ${Number(prop.premium).toLocaleString('en-US')}
                    </Text>
                  )}
                </View>
              </View>
            </View>
          );
        })}
        
        <Text style={styles.footer}>
          Generated on {new Date().toLocaleDateString()} | Alex AI Insurtech | Confidential
        </Text>
      </Page>

      {/* 3. POLICY DETAILS (COVERAGES, INCLUSIONS, EXCLUSIONS) */}
      {proposals.map((prop: any, idx: number) => {
        if (!selectedModules[idx]) return null;
        
        return (
          <Page key={idx} size="LETTER" style={styles.page}>
            <Text style={styles.header}>{prop.product}</Text>
            {prop.carrier && <Text style={{ fontSize: 10, color: '#64748b', textTransform: 'uppercase', marginBottom: 20 }}>CARRIER: {prop.carrier}</Text>}

            {/* Coverages / Limits */}
            {prop.coverages && (
              <View style={{ marginBottom: 20 }}>
                <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#D94F90', marginBottom: 10 }}>LIMITS STRUCTURE</Text>
                <View style={styles.policyBox}>
                  {prop.coverages.split(',').map((cov: string, i: number) => {
                    const parts = cov.split(':');
                    const name = parts[0];
                    const value = parts.slice(1).join(':').trim();
                    return (
                      <View key={i} style={{ ...styles.tableRow, borderBottomWidth: 1, borderBottomColor: '#f1f5f9', paddingBottom: 5, marginBottom: 5 }}>
                        <Text style={styles.tableColLeft}>{name.trim()}</Text>
                        <Text style={styles.tableColRight}>{value || 'Included'}</Text>
                      </View>
                    );
                  })}
                </View>
              </View>
            )}

            {/* Included */}
            {prop.included && (
              <View style={{ marginBottom: 20 }}>
                <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#009CFF', marginBottom: 10 }}>INCLUDED BENEFITS</Text>
                <View style={styles.policyBox}>
                  {prop.included.split(',').map((inc: string, i: number) => (
                    <Text key={i} style={{ fontSize: 10, color: '#475569', marginBottom: 4 }}>• {inc.trim()}</Text>
                  ))}
                </View>
              </View>
            )}

            {/* Excluded */}
            {prop.excluded && (
              <View style={{ marginBottom: 20 }}>
                <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#ef4444', marginBottom: 10 }}>PRIMARY EXCLUSIONS</Text>
                <View style={styles.policyBox}>
                  {prop.excluded.split(',').map((exc: string, i: number) => (
                    <Text key={i} style={{ fontSize: 10, color: '#475569', marginBottom: 4 }}>• {exc.trim()}</Text>
                  ))}
                </View>
              </View>
            )}
            
            <Text style={styles.footer}>
              Generated on {new Date().toLocaleDateString()} | Alex AI Insurtech | Confidential
            </Text>
          </Page>
        );
      })}
    </Document>
  );
};
