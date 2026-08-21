const fs = require('fs');
const path = 'web/src/app/proposals/[id]/page.tsx';
let code = fs.readFileSync(path, 'utf8');

// 1. Fix setSelectedModules initialization
const initRegex = /setSelectedModules\(new Array\(data\.quotes_provided\?\.length \|\| 0\)\.fill\(true\)\)/;
const newInit = `
        const initialSelected = new Array(data.quotes_provided?.length || 0).fill(false);
        const seenProducts = new Set();
        data.quotes_provided?.forEach((prop: any, idx: number) => {
          const productKey = prop.product.trim().toLowerCase();
          if (!seenProducts.has(productKey)) {
            seenProducts.add(productKey);
            initialSelected[idx] = true;
          }
        });
        setSelectedModules(initialSelected);
`;
code = code.replace(initRegex, newInit.trim());

// 2. Fix Summary Container stretching
const summaryContainerRegex = /<div className="min-w-full w-full shrink-0 snap-center px-4 md:px-12 xl:px-32 flex justify-center pt-2 print:block print:w-full print:px-0 print:page-break-before-always">/;
const newSummaryContainer = `<div className="min-w-full w-full shrink-0 snap-center px-4 md:px-12 xl:px-32 flex justify-center items-start pt-2 print:block print:w-full print:px-0 print:page-break-before-always">`;
code = code.replace(summaryContainerRegex, newSummaryContainer);

// 3. Add Logo and Downpayment to Summary Slide
const breakdownRegex = /<h5 className="font-bold text-slate-800 text-lg">\{group\.product\}<\/h5>\s*\{selectedOpt\.carrier && <p className="text-xs font-semibold text-slate-500 uppercase mt-1 tracking-wider">\{selectedOpt\.carrier\}<\/p>\}\s*<\/div>\s*<div className="text-right">\s*<p className="font-bold text-\[\#514690\] text-xl">\$[^<]+<\/p>\s*<\/div>/;

const newBreakdown = `<h5 className="font-bold text-slate-800 text-lg">{group.product}</h5>
                                {selectedOpt.carrier && (
                                  <div className="flex items-center gap-2 mt-2">
                                    {(carriersMap[selectedOpt.carrier]?.trim() || selectedOpt.carrierLogo) && (
                                      <img 
                                        src={carriersMap[selectedOpt.carrier]?.trim() ? carriersMap[selectedOpt.carrier] : selectedOpt.carrierLogo} 
                                        alt={selectedOpt.carrier}
                                        className="h-5 object-contain mix-blend-multiply opacity-80"
                                        onError={(e) => {
                                          (e.target as HTMLImageElement).style.display = 'none';
                                        }}
                                      />
                                    )}
                                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{selectedOpt.carrier}</p>
                                  </div>
                                )}
                              </div>
                              <div className="text-right">
                                <p className="font-bold text-[#514690] text-xl">\${Number(selectedOpt.premium).toLocaleString('en-US')}</p>
                                {Number(selectedOpt.downpayment) > 0 && (
                                  <p className="text-[10px] font-semibold text-slate-400 mt-1 uppercase tracking-wider">{t.downpayment}{Number(selectedOpt.downpayment).toLocaleString('en-US')}</p>
                                )}
                              </div>`;

code = code.replace(breakdownRegex, newBreakdown);

fs.writeFileSync(path, code);
console.log('Successfully updated proposal page for initialization, container height, and summary UI!');
