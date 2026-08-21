const fs = require('fs');
const path = 'web/src/app/proposals/[id]/page.tsx';
let code = fs.readFileSync(path, 'utf8');

// The block to replace starts at '{proposals.map((prop: any, idx: number) => {'
// and ends where the slide </div> is closed.
const startIndex = code.indexOf('{proposals.map((prop: any, idx: number) => {');
const endString = '                    </div>\n                  </div>\n                </div>\n              </div>\n            );';
const endIndexStr = code.indexOf(endString, startIndex);

if (startIndex !== -1 && endIndexStr !== -1) {
  // Find the exact closing brace of the map
  const endIndex = code.indexOf('          })}', endIndexStr);
  
  const originalBlock = code.substring(startIndex, endIndex + 13);
  
  const newBlock = `{groupedProposals.map((group: any, idx: number) => {
          if (!selectedModules[group.options[0].originalIdx]) return null;
          
          const isMulti = group.options.length > 1;
          const prop = group.options[0]; // For generic fields like carrier if not multi

          return (
            <div key={idx} className="min-w-full w-full shrink-0 snap-center px-4 md:px-12 xl:px-32 flex justify-center pt-2 print:block print:w-full print:px-0 print:mb-16 print:break-inside-avoid">
              <div 
                className={\`w-full max-w-5xl bg-white rounded-3xl overflow-hidden transition-all duration-300 border print:border-slate-300 print:shadow-none print:rounded-lg \${selectedModules[group.options[0].originalIdx] ? 'border-slate-200 shadow-xl shadow-slate-200/50' : 'border-slate-100 shadow-sm opacity-60 grayscale-[0.2] scale-[0.98] print:opacity-100 print:grayscale-0 print:scale-100'}\`}
              >
                
                {/* 1. Elegant Header */}
                <div className={\`p-8 md:p-12 flex flex-col md:flex-row md:items-start justify-between gap-6 border-b border-slate-100 print:border-slate-200 \${selectedModules[group.options[0].originalIdx] ? 'bg-gradient-to-br from-white to-slate-50/50 print:bg-white' : 'bg-white'}\`}>
                  
                  <div className="flex-1">
                    <div className="flex items-end mb-4 gap-3">
                      {!isMulti && prop.carrier ? (
                        <img 
                          src={(carriersMap[prop.carrier]?.trim() ? carriersMap[prop.carrier] : getCarrierLogo(prop.carrier)) || ""} 
                          alt={prop.carrier}
                          className="h-10 md:h-12 object-contain mix-blend-multiply opacity-80 print:opacity-100"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                            (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                          }}
                        />
                      ) : null}
                      {!isMulti && prop.carrier && (
                        <span className="hidden text-sm font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">
                          {prop.carrier}
                        </span>
                      )}
                    </div>
                    
                    <h2 className="text-3xl md:text-4xl font-bold text-slate-800 tracking-tight leading-tight">
                      {group.product}
                    </h2>
                  </div>

                  {/* Price Block (Clean typography) */}
                  <div className="flex-1 flex flex-col md:items-end text-left md:text-right mt-4 md:mt-0 gap-6">
                    {group.options.map((opt: any, optIdx: number) => (
                      <div key={optIdx} className="w-full flex flex-col md:items-end">
                        {opt.is_bundled ? (
                          <div className="bg-[#514690]/5 text-[#514690] px-5 py-2 rounded-full font-bold text-sm tracking-widest border border-[#514690]/10">
                            {t.includedInBundle}
                          </div>
                        ) : (
                          <div className="flex flex-col md:items-end w-full">
                            {isMulti && (
                              <div className="flex items-center justify-end w-full mb-2 gap-2">
                                <span className="bg-slate-100 px-3 py-1 rounded-md text-xs font-bold text-slate-500 uppercase tracking-widest">
                                  Opción {optIdx + 1}
                                </span>
                                {opt.carrier && <span className="text-sm font-bold text-[#514690] uppercase tracking-widest">{opt.carrier}</span>}
                              </div>
                            )}
                            <div className="flex items-baseline text-slate-800">
                              <span className="text-2xl font-semibold mr-1 text-slate-400">$</span>
                              <span className="font-bold text-4xl md:text-5xl tracking-tight">
                                {Number(opt.premium).toLocaleString('en-US')}
                              </span>
                            </div>
                            <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest mt-1 mb-4">{t.payInFull}</span>
                            
                            {opt.monthly_payment && (
                              <div className="text-sm font-semibold text-slate-500 flex items-center md:justify-end gap-2">
                                <span>{t.or}</span>
                                <span className="font-bold text-[#009CFF]">\${opt.monthly_payment}</span>
                                <span>{t.perMonth}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* 2. Structured Features Grid with Alex AI Colors */}
                <div className="p-8 md:p-12 bg-slate-50/30">
                
                  {/* Centered Legend */}
                  <div className="text-center mb-10 text-sm md:text-base font-bold text-[#009CFF] uppercase tracking-widest bg-[#009CFF]/5 py-4 rounded-xl border border-[#009CFF]/10">
                    {t.preparedExclusivelyFor} {quote.client_name}
                  </div>

                  <div className={\`flex flex-col \${isMulti ? 'xl:flex-row gap-8 xl:gap-12' : 'gap-12'}\`}>
                    {group.options.map((opt: any, optIdx: number) => (
                      <div key={optIdx} className="flex-1 bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-100">
                        {isMulti && (
                          <h3 className="text-xl font-black text-slate-800 mb-8 pb-4 border-b-2 border-slate-100 flex items-center justify-between">
                            <span>Opción {optIdx + 1}</span>
                            {opt.carrier && <span className="text-sm font-bold text-[#514690] uppercase tracking-widest">{opt.carrier}</span>}
                          </h3>
                        )}

                        {/* Coverages */}
                        {opt.coverages && (
                          <div className="mb-12">
                            <h4 className="text-xs font-bold text-[#009CFF] uppercase tracking-widest mb-6 flex items-center">
                              <Shield className="w-4 h-4 mr-2" /> {t.coveragesTitle}
                            </h4>
                            
                            <div className="relative overflow-hidden bg-gradient-to-br from-[#009CFF] via-[#008AE6] to-[#005B99] rounded-2xl p-5 shadow-lg text-white">
                              <div className="relative z-10 flex flex-col gap-3">
                                {opt.coverages.split('|').map((cov: string, i: number) => {
                                  const parts = cov.split(':');
                                  const name = parts[0];
                                  const value = parts.slice(1).join(':').trim();
                                  
                                  return (
                                    <div key={i} className="flex flex-col lg:flex-row lg:items-center justify-between bg-white/10 border border-white/20 rounded-xl p-4 shadow-sm">
                                      <div className="flex items-center lg:w-[50%] mb-2 lg:mb-0">
                                        <span className="font-bold text-white text-sm leading-tight">{name.trim()}</span>
                                      </div>
                                      <div className="lg:w-[50%] lg:text-right">
                                        <span className="font-black text-white text-base drop-shadow-sm">
                                          {value || t.includedTitle}
                                        </span>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {/* Included */}
                        {opt.included && (
                          <div className="mb-10">
                            <h4 className="text-xs font-bold text-emerald-500 uppercase tracking-widest mb-6 flex items-center">
                              <CheckCircle2 className="w-4 h-4 mr-2" /> {t.includedTitle}
                            </h4>
                            <div className="flex flex-col gap-3">
                              {opt.included.split('|').map((inc: string, i: number) => (
                                <div key={i} className="flex items-start p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                                  <div className="text-emerald-500 mt-0.5 mr-3">
                                    <CheckCircle2 className="w-4 h-4" />
                                  </div>
                                  <span className="text-emerald-700 font-semibold text-sm leading-relaxed">{inc.trim()}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Excluded */}
                        {opt.excluded && (
                          <div className="mb-4">
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center">
                              <X className="w-4 h-4 mr-2" /> {t.excludedTitle}
                            </h4>
                            <div className="bg-slate-50 border border-dashed border-slate-200 rounded-xl p-5">
                              <ul className="space-y-3">
                                {opt.excluded.split('|').map((exc: string, i: number) => (
                                  <li key={i} className="flex items-start text-slate-500 text-sm font-medium">
                                    <X className="w-4 h-4 mr-3 text-slate-300 shrink-0 mt-0.5" />
                                    <span className="leading-relaxed">{exc.trim()}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        )}

                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}`;
        
  code = code.replace(originalBlock, newBlock);
  fs.writeFileSync(path, code);
  console.log('Successfully replaced slide block!');
} else {
  console.log('Could not find the block to replace.', startIndex, endIndexStr);
}
