const fs = require('fs');

const path = 'web/src/components/pdf/FormalProposalPDF.tsx';
let code = fs.readFileSync(path, 'utf8');

// 1. Replace grouping logic
const groupingLogic = `
  const proposals = quote?.quotes_provided || [];
  
  const groupedProposals = [];
  proposals.forEach((prop, idx) => {
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
    }
    return acc;
  }, { premium: 0, monthly: 0 });
`;
code = code.replace(
  /const proposals = quote\?\.quotes_provided \|\| \[\];[\s\S]*?\}, \{ premium: 0, monthly: 0 \}\);/,
  groupingLogic.trim()
);

// 2. Replace Executive Summary mapping
const summaryMap = `
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
                            Option {i + 1}: {opt.carrier} - $\${Number(opt.premium).toLocaleString('en-US')}
                          </Text>
                        ))}
                      </View>
                    )}
                  </View>
                  <View style={{ width: '30%', textAlign: 'right' }}>
                    {!prop.is_bundled && !isMulti && (
                      <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#334155' }}>
                        $\${Number(prop.premium).toLocaleString('en-US')}
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
`;
code = code.replace(
  /\{proposals\.map\(\(prop: any, idx: number\) => \{[\s\S]*?return \([\s\S]*?\);\n\s*\}\)\}/,
  summaryMap.trim()
);

// 3. Replace Policy Details mapping
const detailsMap = `
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
              
              <View style={{ backgroundColor: '#f0f9ff', padding: 12, borderRadius: 6, marginBottom: 20, alignItems: 'center' }}>
                <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#009CFF', textTransform: 'uppercase', letterSpacing: 1 }}>
                  PREPARED EXCLUSIVELY FOR {quote.client_name}
                </Text>
              </View>

              <View style={{ flexDirection: isMulti ? 'row' : 'column', gap: isMulti ? 15 : 0 }}>
                {group.options.map((prop: any, optIdx: number) => (
                  <View key={optIdx} style={{ flex: 1 }}>
                    {isMulti && (
                      <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#514690', marginBottom: 10, paddingBottom: 5, borderBottomWidth: 1, borderBottomColor: '#e2e8f0' }}>
                        Option {optIdx + 1}
                      </Text>
                    )}
                    
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: isMulti ? 10 : 20 }}>
                      {prop.carrierLogo && <Image src={prop.carrierLogo.startsWith('http') ? prop.carrierLogo : \`\${baseUrl}\${prop.carrierLogo}\`} style={{ height: 16, objectFit: 'contain', marginRight: 6 }} />}
                      {prop.carrier && <Text style={{ fontSize: 10, color: '#64748b', textTransform: 'uppercase' }}>CARRIER: {prop.carrier}</Text>}
                    </View>

                    {isMulti && !prop.is_bundled && (
                      <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#334155', marginBottom: 15 }}>
                        Premium: $\${Number(prop.premium).toLocaleString('en-US')}
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
              <Text style={styles.footerText} render={({ pageNumber, totalPages }) => \`PAGE \${pageNumber} OF \${totalPages}\`} />
            </View>
          </Page>
        );
      })}
`;

code = code.replace(
  /\{\/\* 3\. POLICY DETAILS[\s\S]*?\}\)\}\n    <\/Document>/,
  detailsMap.trim() + '\n    </Document>'
);

fs.writeFileSync(path, code);
console.log('PDF updated!');
