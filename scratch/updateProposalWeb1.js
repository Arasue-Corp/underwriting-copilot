const fs = require('fs');

const path = 'web/src/app/proposals/[id]/page.tsx';
let code = fs.readFileSync(path, 'utf8');

const groupingLogic = `
  const proposals = quote?.quotes_provided || []
  
  const groupedProposals: any[] = [];
  proposals.forEach((prop: any, idx: number) => {
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

  const totalSlides = groupedProposals.length + 1 
  
  const packageTotal = groupedProposals.reduce((acc: any, group: any) => {
    const prop = group.options[0];
    if (selectedModules[prop.originalIdx] && !prop.is_bundled) {
      acc.premium += Number(prop.premium || 0);
      acc.monthly += Number(prop.monthly_payment || 0);
      acc.downpayment += Number(prop.downpayment || 0);
    }
    return acc;
  }, { premium: 0, monthly: 0, downpayment: 0 })
`;

code = code.replace(
  /const proposals = quote\?\.quotes_provided \|\| \[\]\s*const totalSlides = proposals\.length \+ 1\s*const packageTotal = proposals\.reduce\(\(acc: any, prop: any, idx: number\) => \{[\s\S]*?\}, \{ premium: 0, monthly: 0, downpayment: 0 \}\)/,
  groupingLogic.trim()
);

const costBreakdownOld = `                      <div className="space-y-4">
                        {proposals.map((prop: any, idx: number) => {
                          if (!selectedModules[idx]) return null;
                          return (
                            <div key={idx} className="flex justify-between items-center bg-slate-50 p-5 rounded-xl border border-slate-100 print:bg-white print:border-slate-200">
                              <div>
                                <h5 className="font-bold text-slate-800 text-lg">{prop.product}</h5>
                                {prop.carrier && <p className="text-xs font-semibold text-slate-500 uppercase mt-1 tracking-wider">{prop.carrier}</p>}
                              </div>
                              <div className="text-right">
                                <p className="font-bold text-[#514690] text-xl">\${Number(prop.premium).toLocaleString('en-US')}</p>
                              </div>
                            </div>
                          )
                        })}`;

const costBreakdownNew = `                      <div className="space-y-4">
                        {groupedProposals.map((group: any, idx: number) => {
                          if (!selectedModules[group.options[0].originalIdx]) return null;
                          const isMulti = group.options.length > 1;
                          const prop = group.options[0];
                          return (
                            <div key={idx} className="flex justify-between items-center bg-slate-50 p-5 rounded-xl border border-slate-100 print:bg-white print:border-slate-200">
                              <div>
                                <h5 className="font-bold text-slate-800 text-lg">{group.product}</h5>
                                {!isMulti && prop.carrier && <p className="text-xs font-semibold text-slate-500 uppercase mt-1 tracking-wider">{prop.carrier}</p>}
                                {isMulti && (
                                  <div className="mt-2">
                                    {group.options.map((opt: any, i: number) => (
                                      <p key={i} className="text-xs font-semibold text-slate-500 uppercase mt-1 tracking-wider">
                                        Opción {i+1}: {opt.carrier} - $\${Number(opt.premium).toLocaleString('en-US')}
                                      </p>
                                    ))}
                                  </div>
                                )}
                              </div>
                              <div className="text-right">
                                {!isMulti && (
                                  <p className="font-bold text-[#514690] text-xl">\${Number(prop.premium).toLocaleString('en-US')}</p>
                                )}
                                {isMulti && (
                                  <p className="font-bold text-[#514690] text-sm mt-2 uppercase tracking-wider">Múltiples Opciones</p>
                                )}
                              </div>
                            </div>
                          )
                        })}`;

code = code.replace(costBreakdownOld, costBreakdownNew);

const carouselMappingRegex = /\{proposals\.map\(\(prop: any, index: number\) => \{[\s\S]*?if \(\!selectedModules\[index\]\) return null;[\s\S]*?<motion\.div[\s\S]*?className="absolute w-full h-full flex flex-col"[\s\S]*?>[\s\S]*?<\/motion\.div>\n\s*\}\)\}/g;

// Instead of regex for the big block, it's easier to find it by lines or a known structure, or just replace the specific slide rendering logic.
// Because the block is very large, I'll use a more precise string match on a part of the slide to dynamically replace it if possible, or I can just use a helper function. Let me check the exact structure first.
fs.writeFileSync(path, code);
console.log('Proposal page partially updated, need to do slide rendering separately');
