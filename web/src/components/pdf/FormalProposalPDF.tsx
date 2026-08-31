import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
  Font,
  Svg,
  Path,
} from '@react-pdf/renderer';

const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';

Font.register({
  family: 'Signature',
  src: `${baseUrl}/fonts/Caveat.ttf`
});

Font.register({
  family: 'Courier Prime',
  fonts: [
    { src: `${baseUrl}/fonts/CourierPrime-Regular.ttf` },
    { src: `${baseUrl}/fonts/CourierPrime-Bold.ttf`, fontWeight: 700 }
  ]
});

const styles = StyleSheet.create({
  coverPage: {
    fontFamily: 'Helvetica',
    backgroundColor: '#0B1120',
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
  page: {
    paddingTop: 110,
    paddingBottom: 90,
    paddingHorizontal: 40,
    fontFamily: 'Helvetica',
    backgroundColor: '#ffffff',
    color: '#334155', // slate-700
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
    backgroundColor: '#ffffff',
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  tableColLeft: {
    width: '60%',
    fontSize: 10,
    color: '#334155',
    fontWeight: 'bold',
    fontFamily: 'Courier Prime',
  },
  tableColRight: {
    width: '40%',
    fontSize: 10,
    color: '#64748b',
    textAlign: 'right',
    fontFamily: 'Courier Prime',
  },
  priceText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#514690',
    fontFamily: 'Courier Prime',
  },
  logo: {
    width: 120,
    marginBottom: 40,
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
  pageHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 80,
    backgroundColor: '#0B1120',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingTop: 20,
    borderBottomWidth: 4,
    borderBottomColor: '#009CFF', // Primary Blue
  },
  headerAccent: {
    position: 'absolute',
    bottom: -4,
    left: 0,
    height: 4,
    width: '35%',
    backgroundColor: '#514690', // Indigo
  },
  headerAccentSecondary: {
    position: 'absolute',
    bottom: -4,
    right: 0,
    height: 4,
    width: '15%',
    backgroundColor: '#D94F90', // Magenta
  },
  headerLogo: {
    height: 35,
    objectFit: 'contain',
  },
  headerTextContainer: {
    flexDirection: 'column',
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  headerSubtitle: {
    fontSize: 8,
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 2,
  },
  headerText: {
    fontSize: 11,
    color: '#ffffff',
    textTransform: 'uppercase',
    letterSpacing: 2,
    fontWeight: 'bold',
  },
  pageFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: '#514690',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 40,
    borderTopWidth: 4,
    borderTopColor: '#D94F90',
    overflow: 'hidden',
  },
  footerDecoration: {
    position: 'absolute',
    left: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    opacity: 0.1,
    zIndex: 0,
  },
  footerText: {
    fontSize: 8,
    color: '#ffffff',
    fontWeight: 'bold',
    letterSpacing: 1,
    zIndex: 1,
  },
  bgImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    zIndex: -2,
  },
  bgOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(11, 17, 32, 0.75)',
    zIndex: -1,
  },
  contentContainer: {
    // Padding moved to Page component for global pagination support
  },
});

interface FormalProposalPDFProps {
  quote: any;
  selectedModules: boolean[];
  disclaimer: string;
}

export const FormalProposalPDF = ({ quote, selectedModules, disclaimer }: FormalProposalPDFProps) => {
  const proposals = quote?.quotes_provided || [];
  
  const groupedProposals: any[] = [];
  proposals.forEach((prop: any, idx: number) => {
    if (!selectedModules[idx]) return;
    const existing = groupedProposals.find(g => g.product.trim().toLowerCase() === prop.product.trim().toLowerCase());
    if (existing) {
      existing.options.push({ ...prop, originalIdx: idx });
    } else {
      groupedProposals.push({
        product: prop.product,
        options: [{ ...prop, originalIdx: idx }]
      });
    }
  });

  const lastSelectedIdx = groupedProposals.length - 1;
  
  const packageTotal = groupedProposals.reduce((acc, group) => {
    const prop = group.options[0]; // For total, assume option 1
    if (!prop.is_bundled) {
      acc.premium += Number(prop.premium || 0);
      acc.monthly += Number(prop.monthly_payment || 0);
      acc.downpayment += Number(prop.downpayment || 0);
    }
    return acc;
  }, { premium: 0, monthly: 0, downpayment: 0 });

  return (
    <Document>
      {/* 1. COVER PAGE */}
      <Page size="LETTER" style={{ fontFamily: 'Helvetica', color: '#ffffff' }}>
        {/* Background Layer */}
        <Image src="/alex-assets/Wallpaper-1.jpeg" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
        <View style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: '#009CFF', opacity: 0.45 }} />

        {/* Foreground Content */}
        <View style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', position: 'relative', width: '100%', height: '100%' }}>
          <View style={styles.glowCircle} />
          <Image src="/alex-assets/logo-blanco.png" style={styles.whiteLogo} />
          
          <Text style={styles.coverSubtitle}>PREPARED EXCLUSIVELY FOR</Text>
          <Text style={styles.coverTitle}>{quote.client_name || 'CLIENT'}</Text>
          <Text style={styles.coverSubtitle}>
            Executive Summary & Insurance Program Proposal
          </Text>
        </View>
      </Page>

      {/* 1.5. SUMMARY COVER PAGE */}
      <Page size="LETTER" style={{ fontFamily: 'Helvetica', backgroundColor: '#ffffff', position: 'relative' }}>
        {/* Top Blue Section */}
        <View style={{ backgroundColor: '#108ee9', height: '60%', width: '100%', position: 'relative', padding: 50, paddingTop: 60 }}>
          <Text style={{ fontSize: 46, color: '#ffffff', fontWeight: 'bold', lineHeight: 1.1, width: '80%' }}>
            Executive{'\n'}
            summary &{'\n'}
            insurance program{'\n'}
            proposal
          </Text>
          
          <Image src="/alex-assets/alex-find.png" style={{ position: 'absolute', right: 30, bottom: 70, width: 230, zIndex: 5 }} />
          
          {/* Wave separator */}
          <View style={{ position: 'absolute', bottom: -1, left: 0, right: 0, width: '100%' }}>
            <Svg viewBox="0 0 1440 320" style={{ width: '100%' }}>
              <Path fill="#ffffff" d="M0,224L80,229.3C160,235,320,245,480,224C640,203,800,149,960,138.7C1120,128,1280,160,1360,176L1440,192L1440,320L1360,320C1280,320,1120,320,960,320C800,320,640,320,480,320C320,320,160,320,80,320L0,320Z" />
            </Svg>
          </View>
        </View>

        {/* Bottom White Section */}
        <View style={{ height: '40%', padding: 50, paddingTop: 40, flexDirection: 'row', justifyContent: 'space-between' }}>
          {/* Col 1 */}
          <View style={{ width: '30%' }}>
            <Text style={{ color: '#514690', fontSize: 16, fontWeight: 'bold', marginBottom: 20 }}>Prepared for</Text>
            <Text style={{ color: '#475569', fontSize: 13, lineHeight: 1.4 }}>{quote.client_name}</Text>
          </View>
          
          {/* Col 2 */}
          <View style={{ width: '30%' }}>
            <Text style={{ color: '#514690', fontSize: 16, fontWeight: 'bold', marginBottom: 20 }}>Program details</Text>
            {groupedProposals.map((g: any, i: number) => (
              <Text key={i} style={{ color: '#475569', fontSize: 13, lineHeight: 1.4 }}>{g.product}</Text>
            ))}
          </View>
          
          {/* Col 3 */}
          <View style={{ width: '35%' }}>
            <Text style={{ color: '#514690', fontSize: 16, fontWeight: 'bold', marginBottom: 20 }}>Insurtech Advisory</Text>
            <Text style={{ color: '#475569', fontSize: 11, lineHeight: 1.5 }}>Direct: +1 (480) 630-9630</Text>
            <Text style={{ color: '#475569', fontSize: 11, lineHeight: 1.5 }}>Email: hello@alexai.cloud</Text>
            <Text style={{ color: '#475569', fontSize: 11, lineHeight: 1.5,  }}>alexai.cloud</Text>
          </View>
        </View>

                {/* FOOTER */}
        <View style={styles.pageFooter} fixed>
          <Image src="/alex-assets/brand-011.png" style={styles.footerDecoration} />
          <Text style={styles.footerText}>GENERATED ON {new Date().toLocaleDateString()}</Text>
          <Text style={styles.footerText}>ALEX AI INSURTECH | CONFIDENTIAL</Text>
          <Text style={styles.footerText} render={({ pageNumber, totalPages }) => `PAGE ${pageNumber} OF ${totalPages}`} />
        </View>
      </Page>

      {/* 2. EXECUTIVE SUMMARY */}
      <Page size="LETTER" style={styles.page}>
        {/* HEADER */}
        <View style={styles.pageHeader} fixed>
          <View style={styles.headerAccent} />
          <View style={styles.headerAccentSecondary} />
          <Image src="/alex-assets/logo-blanco.png" style={styles.headerLogo} />
          <Text style={styles.headerText}>Executive Summary</Text>
        </View>

        <View style={styles.contentContainer}>
          <View style={styles.section}>
            <Text style={styles.header}>Executive Summary</Text>
            <Text style={{ fontSize: 10, color: '#64748b', marginBottom: 20, lineHeight: 1.5 }}>
              This document outlines the structured insurance program designed for {quote.client_name}. 
              Below is the total financial commitment for the selected policies, followed by a detailed breakdown 
              of the coverages, limits, inclusions, and exclusions.
            </Text>
          </View>

          <View style={{ backgroundColor: '#f0f9ff', padding: 12, borderRadius: 6, marginBottom: 20, alignItems: 'center' }}>
            <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#009CFF', textTransform: 'uppercase', letterSpacing: 1 }}>
              PREPARED EXCLUSIVELY FOR {quote.client_name}
            </Text>
          </View>

          <View style={{ ...styles.policyBox, backgroundColor: '#f8fafc' }}>
            <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#514690', marginBottom: 10 }}>Total Program Investment</Text>
            <View style={styles.tableRow}>
              <Text style={styles.tableColLeft}>Pay in Full Premium</Text>
              <Text style={styles.priceText}>${packageTotal.premium.toLocaleString('en-US')}</Text>
            </View>
            
            {packageTotal.downpayment > 0 && (
              <View style={styles.tableRow}>
                <Text style={styles.tableColLeft}>Required Downpayment</Text>
                <Text style={{ ...styles.priceText, color: '#334155', fontSize: 14 }}>${packageTotal.downpayment.toLocaleString('en-US')}</Text>
              </View>
            )}
            {packageTotal.monthly > 0 && (
              <View style={styles.tableRow}>
                <Text style={styles.tableColLeft}>Monthly Financing Option</Text>
                <Text style={{ ...styles.priceText, color: '#009CFF', fontSize: 14 }}>${packageTotal.monthly.toLocaleString('en-US')} / mo</Text>
              </View>
            )}
          </View>

          <Text style={styles.header}>Selected Policies Breakdown</Text>
          {groupedProposals.map((group: any, idx: number) => {
            const isMulti = group.options.length > 1;
            const prop = group.options[0];
            return (
              <View key={idx} style={styles.policyBox} wrap={false}>
                {prop.is_bundled && <Text style={styles.badge}>INTEGRATED BUNDLE</Text>}
                <View style={styles.tableRow}>
                  <View style={{ width: '70%' }}>
                    <Text style={styles.policyTitle}>{group.product}</Text>
                    
                    {!isMulti && (
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
                        {prop.carrierLogo && <Image src={prop.carrierLogo} style={{ height: 12, objectFit: 'contain', marginRight: 4 }} />}
                        {prop.carrier && <Text style={{ fontSize: 9, color: '#64748b', textTransform: 'uppercase' }}>{prop.carrier}</Text>}
                      </View>
                    )}
                    
                    {isMulti && (
                      <View style={{ marginTop: 4 }}>
                        {group.options.map((opt: any, i: number) => (
                          <Text key={i} style={{ fontSize: 9, color: '#64748b', marginBottom: 2 }}>
                            Option {i + 1}: {opt.carrier} - ${Number(opt.premium).toLocaleString('en-US')}
                          </Text>
                        ))}
                      </View>
                    )}
                  </View>
                  <View style={{ width: '30%', textAlign: 'right' }}>
                    {!prop.is_bundled && !isMulti && (
                      <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#334155' }}>
                        ${Number(prop.premium).toLocaleString('en-US')}
                      </Text>
                    )}
                    {!prop.is_bundled && isMulti && (
                      <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#514690' }}>
                        Multiple Options
                      </Text>
                    )}
                  </View>
                </View>
              </View>
            );
          })}
          
          <View style={{ marginTop: 20, padding: 10, backgroundColor: '#f8fafc', borderRadius: 4, borderLeftWidth: 3, borderLeftColor: '#94a3b8' }}>
            <Text style={{ fontSize: 8, color: '#64748b', lineHeight: 1.4 }}>
              {disclaimer}
            </Text>
          </View>
        </View>

        {/* FOOTER */}
        <View style={styles.pageFooter} fixed>
          <Image src="/alex-assets/brand-011.png" style={styles.footerDecoration} />
          <Text style={styles.footerText}>GENERATED ON {new Date().toLocaleDateString()}</Text>
          <Text style={styles.footerText}>ALEX AI INSURTECH | CONFIDENTIAL</Text>
          <Text style={styles.footerText} render={({ pageNumber, totalPages }) => `PAGE ${pageNumber} OF ${totalPages}`} />
        </View>
      </Page>

      {/* 3. POLICY DETAILS (COVERAGES, INCLUSIONS, EXCLUSIONS) */}
      {groupedProposals.map((group: any, idx: number) => {
        const isMulti = group.options.length > 1;

        return (
          <Page key={idx} size="LETTER" style={styles.page}>
            {/* HEADER */}
            <View style={styles.pageHeader} fixed>
              <View style={styles.headerAccent} />
              <View style={styles.headerAccentSecondary} />
              <Image src="/alex-assets/logo-blanco.png" style={styles.headerLogo} />
              <Text style={styles.headerText}>Coverage Details</Text>
            </View>

            <View style={styles.contentContainer}>
              <Text style={styles.header}>{group.product}</Text>
              {group.options[0]?.description && <Text style={{ fontSize: 11, color: '#475569', marginBottom: 15, lineHeight: 1.4 }}>{group.options[0].description}</Text>}
              
              <View style={{ backgroundColor: '#f0f9ff', padding: 12, borderRadius: 6, marginBottom: 20, alignItems: 'center' }}>
                <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#009CFF', textTransform: 'uppercase', letterSpacing: 1 }}>
                  PREPARED EXCLUSIVELY FOR {quote.client_name}
                </Text>
              </View>

              <View style={{ flexDirection: 'column', gap: isMulti ? 30 : 0 }}>
                {group.options.map((prop: any, optIdx: number) => (
                  <View key={optIdx} style={{ paddingTop: optIdx > 0 ? 20 : 0, borderTopWidth: optIdx > 0 ? 2 : 0, borderTopColor: '#e2e8f0' }}>
                    {isMulti && (
                      <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#514690', marginBottom: 15, paddingBottom: 5, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' }}>
                        Option {optIdx + 1}
                      </Text>
                    )}
                    
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: isMulti ? 10 : 20 }}>
                      {prop.carrierLogo && <Image src={prop.carrierLogo.startsWith('http') ? prop.carrierLogo : `${baseUrl}${prop.carrierLogo}`} style={{ height: 30, objectFit: 'contain', marginRight: 8 }} />}
                      {prop.carrier && <Text style={{ fontSize: 10, color: '#64748b', textTransform: 'uppercase' }}>CARRIER: {prop.carrier}</Text>}
                    </View>

                    {isMulti && !prop.is_bundled && (
                      <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#334155', marginBottom: 15 }}>
                        Premium: ${Number(prop.premium).toLocaleString('en-US')}
                      </Text>
                    )}

                    {/* Coverages / Limits */}
                    {prop.coverages && (
                      <View wrap={false} style={{ marginBottom: 20 }}>
                        <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#009CFF', marginBottom: 10 }}>LIMITS STRUCTURE</Text>
                        <View style={styles.policyBox}>
                          {prop.coverages.split('|').map((cov: string, i: number) => {
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
                      <View wrap={false} style={{ marginBottom: 20 }}>
                        <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#10b981', marginBottom: 10 }}>INCLUDED BENEFITS</Text>
                        <View style={styles.policyBox}>
                          {prop.included.split('|').map((inc: string, i: number) => (
                            <Text key={i} style={{ fontSize: 10, color: '#475569', marginBottom: 4 }}>• {inc.trim()}</Text>
                          ))}
                        </View>
                      </View>
                    )}

                    {/* Excluded */}
                    {prop.excluded && (
                      <View wrap={false} style={{ marginBottom: 20 }}>
                        <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#64748b', marginBottom: 10 }}>PRIMARY EXCLUSIONS</Text>
                        <View style={styles.policyBox}>
                          {prop.excluded.split('|').map((exc: string, i: number) => (
                            <Text key={i} style={{ fontSize: 10, color: '#94a3b8', marginBottom: 4 }}>• {exc.trim()}</Text>
                          ))}
                        </View>
                      </View>
                    )}
                  </View>
                ))}
              </View>
              
              {/* Final Signature on the Last Page */}
              {idx === lastSelectedIdx && (
                <View wrap={false} style={{ marginTop: 40, alignItems: 'flex-start' }}>
                  <Text style={{ fontSize: 10, color: '#64748b', marginBottom: 5 }}>Sincerely,</Text>
                  <Text style={{ fontFamily: 'Signature', fontSize: 24, color: '#009CFF', transform: 'rotate(-5deg)' }}>
                    Alex AI Insurtech Team
                  </Text>
                </View>
              )}
            </View>

            {/* FOOTER */}
            <View style={styles.pageFooter} fixed>
              <Image src="/alex-assets/brand-011.png" style={styles.footerDecoration} />
              <Text style={styles.footerText}>GENERATED ON {new Date().toLocaleDateString()}</Text>
              <Text style={styles.footerText}>ALEX AI INSURTECH | CONFIDENTIAL</Text>
              <Text style={styles.footerText} render={({ pageNumber, totalPages }) => `PAGE ${pageNumber} OF ${totalPages}`} />
            </View>
          </Page>
        );
      })}
    </Document>
  );
};
