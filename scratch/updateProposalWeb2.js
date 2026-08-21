const fs = require('fs');
const path = 'web/src/app/proposals/[id]/page.tsx';
let code = fs.readFileSync(path, 'utf8');

const regex = /\{proposals\.map\(\(prop: any, index: number\) => \{[\s\S]*?if \(!selectedModules\[index\]\) return null;[\s\S]*?<motion\.div[\s\S]*?<\/motion\.div>\n\s*\}\)\}/;

const newBlock = `
        {groupedProposals.map((group: any, index: number) => {
          if (!selectedModules[group.options[0].originalIdx]) return null;
          
          const isMulti = group.options.length > 1;
          const prop = group.options[0]; // For generic fields

          return (
            <motion.div
              key={index}
              className="absolute w-full h-full flex flex-col"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: currentIndex === index + 1 ? 1 : 0, x: currentIndex === index + 1 ? 0 : currentIndex > index + 1 ? -100 : 100, zIndex: currentIndex === index + 1 ? 10 : 0 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              style={{ pointerEvents: currentIndex === index + 1 ? 'auto' : 'none' }}
            >
              <div className="flex-1 overflow-y-auto custom-scrollbar relative">
                
                <div className="max-w-6xl mx-auto w-full pt-12 pb-32">
                  
                  {/* 1. Header Hero Area */}
                  <div className="flex flex-col md:flex-row items-start justify-between px-8 md:px-12 mb-12 gap-8">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-4">
                        <span className="bg-white/80 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-bold text-slate-500 uppercase tracking-widest shadow-sm border border-slate-100">
                          {t.slide} {index + 1} {t.of} {totalSlides - 1}
                        </span>
                        {!isMulti && prop.carrier && (
                          <span className="bg-white/80 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-bold text-[#514690] uppercase tracking-widest shadow-sm border border-[#514690]/10 flex items-center">
                            {prop.carrierLogo && <img src={prop.carrierLogo.startsWith('http') ? prop.carrierLogo : \`\${window.location.origin}\${prop.carrierLogo}\`} alt="Carrier" className="h-4 mr-2 object-contain" />}
                            {prop.carrier}
                          </span>
                        )}
                      </div>
                      <h2 className="text-4xl md:text-5xl font-black text-slate-800 tracking-tight leading-tight">
                        {group.product}
                      </h2>
                    </div>

                    {/* Price Block */}
                    <div className="flex-1 flex flex-row gap-6 justify-end mt-4 md:mt-0 flex-wrap">
                       {group.options.map((opt: any, optIdx: number) => (
                           <div key={optIdx} className="flex flex-col md:items-end text-left md:text-right">
                             {opt.is_bundled ? (
                               <div className="bg-[#514690]/5 text-[#514690] px-5 py-2 rounded-full font-bold text-sm tracking-widest border border-[#514690]/10">
                                 {t.includedInBundle}
                               </div>
                             ) : (
                               <div className="flex flex-col md:items-end bg-white/50 p-4 rounded-xl border border-slate-100">
                                 {isMulti && <span className="text-xs font-bold text-[#514690] uppercase mb-2 text-center md:text-right w-full">Opción {optIdx + 1} ({opt.carrier})</span>}
                                 <div className="flex items-baseline text-slate-800 justify-end w-full">
                                   <span className="text-xl font-semibold mr-1 text-slate-400">$</span>
                                   <span className="font-bold text-3xl md:text-4xl tracking-tight">
                                     {Number(opt.premium).toLocaleString('en-US')}
                                   </span>
                                 </div>
                                 <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest mt-1 mb-4 w-full text-right">{t.payInFull}</span>
                                 
                                 {opt.monthly_payment && (
                                   <div className="text-sm font-semibold text-slate-500 flex items-center md:justify-end gap-2 w-full">
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
                  <div className="p-8 md:p-12">
                  
                    {/* Centered Legend */}
                    <div className="text-center mb-10 text-sm md:text-base font-bold text-[#009CFF] uppercase tracking-widest bg-[#009CFF]/5 py-4 rounded-xl border border-[#009CFF]/10">
                      {t.preparedExclusivelyFor} {quote.client_name}
                    </div>

                    <div className={\`flex flex-col \${isMulti ? 'xl:flex-row' : ''} gap-12\`}>
                      {group.options.map((opt: any, optIdx: number) => (
                        <div key={optIdx} className="flex-1">
                          {isMulti && (
                            <h3 className="text-xl font-bold text-[#514690] mb-6 pb-2 border-b-2 border-[#514690]/20 flex items-center">
                              Opción {optIdx + 1} 
                              {opt.carrier && <span className="text-sm ml-4 font-normal text-slate-500">| {opt.carrier}</span>}
                            </h3>
                          )}

                          {/* Coverages */}
                          {opt.coverages && (
                            <div className="mb-12">
                              <h4 className="text-xs font-bold text-[#009CFF] uppercase tracking-widest mb-6 flex items-center">
                                <Shield className="w-4 h-4 mr-2" /> {t.coveragesTitle}
                              </h4>
                              
                              <div className="relative overflow-hidden bg-gradient-to-br from-[#009CFF] via-[#008AE6] to-[#005B99] rounded-[2rem] p-6 md:p-8 shadow-2xl text-white">
                                <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white opacity-10 blur-3xl pointer-events-none"></div>
                                <Shield className="absolute -right-12 -bottom-12 w-72 h-72 text-white opacity-5 pointer-events-none rotate-12" />

                                <div className="relative z-10 flex flex-col gap-3 md:gap-4">
                                  {opt.coverages.split('|').map((cov: string, i: number) => {
                                    const parts = cov.split(':');
                                    const name = parts[0];
                                    const value = parts.slice(1).join(':').trim();
                                    
                                    return (
                                      <div key={i} className="flex flex-col lg:flex-row lg:items-center justify-between bg-white/10 hover:bg-white/20 transition-colors border border-white/20 rounded-2xl p-5 backdrop-blur-md shadow-sm">
                                        <div className="flex items-center mb-3 lg:mb-0 lg:pr-6 lg:w-[50%]">
                                          <div className="bg-white/20 p-2.5 rounded-xl mr-4 shrink-0 shadow-inner">
                                            <Shield className="w-5 h-5 text-white" />
                                          </div>
                                          <span className="font-bold text-white text-base md:text-lg leading-tight">{name.trim()}</span>
                                        </div>
                                        
                                        {value ? (
                                          <div className="lg:w-[50%] lg:text-right">
                                            <span className="font-black text-white text-lg md:text-xl drop-shadow-sm">
                                              {value}
                                            </span>
                                          </div>
                                        ) : (
                                          <div className="lg:w-[50%] lg:text-right">
                                            <span className="font-black text-white text-lg md:text-xl drop-shadow-sm">
                                              {t.includedTitle}
                                            </span>
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>
                          )}
                          
                          {/* Included */}
                          {opt.included && (
                            <div className="mb-12">
                              <h4 className="text-xs font-bold text-emerald-500 uppercase tracking-widest mb-6 flex items-center">
                                <CheckCircle2 className="w-4 h-4 mr-2" /> {t.includedTitle}
                              </h4>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {opt.included.split('|').map((inc: string, i: number) => (
                                  <div key={i} className="flex items-start bg-emerald-500 border border-emerald-500 rounded-xl p-5 shadow-sm">
                                    <div className="text-white mt-0.5 mr-4">
                                      {getFeatureIcon(inc)}
                                    </div>
                                    <span className="text-white font-bold leading-relaxed">{inc.trim()}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Excluded */}
                          {opt.excluded && (
                            <div className="mb-8">
                              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center">
                                <X className="w-4 h-4 mr-2" /> {t.excludedTitle}
                              </h4>
                              <div className="bg-white border-2 border-dashed border-slate-200 rounded-2xl p-6 md:p-8">
                                <ul className="space-y-4">
                                  {opt.excluded.split('|').map((exc: string, i: number) => (
                                    <li key={i} className="flex items-start text-slate-500 font-medium">
                                      <X className="w-5 h-5 mr-4 text-slate-300 shrink-0 mt-0.5" />
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
            </motion.div>
          )
        })}
`;

code = code.replace(regex, newBlock.trim());
fs.writeFileSync(path, code);
console.log('Proposal slide updated!');
