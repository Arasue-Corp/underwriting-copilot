const fs = require('fs');
const path = 'web/src/app/proposals/[id]/page.tsx';
let code = fs.readFileSync(path, 'utf8');

// 1. Update packageTotal
const packageTotalRegex = /const packageTotal = groupedProposals\.reduce\(\(acc: any, group: any\) => \{[\s\S]*?\}, \{ premium: 0, monthly: 0, downpayment: 0 \}\)/;
const newPackageTotal = `const packageTotal = groupedProposals.reduce((acc: any, group: any) => {
    const selectedOpt = group.options.find((o: any) => selectedModules[o.originalIdx]);
    if (selectedOpt && !selectedOpt.is_bundled) {
      acc.premium += Number(selectedOpt.premium || 0)
      acc.monthly += Number(selectedOpt.monthly_payment || 0)
      acc.downpayment += Number(selectedOpt.downpayment || 0)
    }
    return acc
  }, { premium: 0, monthly: 0, downpayment: 0 })`;
code = code.replace(packageTotalRegex, newPackageTotal);

// 2. Update Carousel Action Buttons
// Replace the single Action Button block with an Action Button block that renders one button per option.
const actionButtonRegex = /\{\/\* Action Button \(Hidden on print\) \*\/\}[\s\S]*?<\/div>\n\n                  <\/div>\n                <\/div>\n              <\/div>\n            \)\n          \}\)\}/;

const newActionButtons = `{/* Action Buttons (Hidden on print) */}
                    <div className="mt-12 flex flex-col xl:flex-row gap-6 print:hidden">
                      {group.options.map((opt: any, optIdx: number) => {
                        const isOptSelected = selectedModules[opt.originalIdx];
                        return (
                          <button
                            key={optIdx}
                            disabled={quote.status === 'ACCEPTED'}
                            onClick={() => {
                              const next = [...selectedModules];
                              // Deselect all others in this group
                              group.options.forEach((o: any) => {
                                if (o.originalIdx !== opt.originalIdx) next[o.originalIdx] = false;
                              });
                              // Toggle this one
                              next[opt.originalIdx] = !next[opt.originalIdx];
                              setSelectedModules(next);
                            }}
                            className={\`flex-1 relative rounded-2xl p-5 flex items-center justify-between transition-all duration-300 border-2 \${isOptSelected ? 'bg-white border-[#009CFF]/30 text-slate-800 shadow-sm' : 'bg-white border-slate-200 text-slate-400 hover:border-slate-300 hover:bg-slate-50'}\`}
                          >
                            <div className="flex items-center">
                              <div className={\`w-8 h-8 rounded-full border-2 flex items-center justify-center mr-4 transition-colors \${isOptSelected ? 'border-[#009CFF] bg-[#009CFF] text-white' : 'border-slate-300 bg-transparent'}\`}>
                                {isOptSelected && <Check className="w-5 h-5 font-bold" />}
                              </div>
                              <span className="font-bold text-lg">
                                {isOptSelected ? t.activeModule : (isMulti ? \`Elegir Opción \${optIdx + 1}\` : t.addModule)}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>

                  </div>
                </div>
              </div>
            )
          })}`;
code = code.replace(actionButtonRegex, newActionButtons);


// 3. Update Summary Slide Cost Breakdown
const costBreakdownOld = `<div className="space-y-4">
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

const costBreakdownNew = `<div className="space-y-4">
                        {groupedProposals.map((group: any, idx: number) => {
                          const selectedOpt = group.options.find((o: any) => selectedModules[o.originalIdx]);
                          if (!selectedOpt) return null;
                          return (
                            <div key={idx} className="flex justify-between items-center bg-slate-50 p-5 rounded-xl border border-slate-100 print:bg-white print:border-slate-200">
                              <div>
                                <h5 className="font-bold text-slate-800 text-lg">{group.product}</h5>
                                {selectedOpt.carrier && <p className="text-xs font-semibold text-slate-500 uppercase mt-1 tracking-wider">{selectedOpt.carrier}</p>}
                              </div>
                              <div className="text-right">
                                <p className="font-bold text-[#514690] text-xl">\${Number(selectedOpt.premium).toLocaleString('en-US')}</p>
                              </div>
                            </div>
                          )
                        })}`;

code = code.replace(costBreakdownOld, costBreakdownNew);

// 4. Update the "isSelected" definition at the top of the slide loop
const isSelectedRegex = /const isSelected = selectedModules\[group\.options\[0\]\.originalIdx\];/;
const newIsSelected = `const isSelected = group.options.some((o: any) => selectedModules[o.originalIdx]);`;
code = code.replace(isSelectedRegex, newIsSelected);

fs.writeFileSync(path, code);
console.log('Successfully updated ProposalCarousel UI!');
