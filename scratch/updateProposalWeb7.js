const fs = require('fs');
const path = 'web/src/app/proposals/[id]/page.tsx';
let code = fs.readFileSync(path, 'utf8');

// 1. Add Logo and Downpayment to Price Block in Slide
const priceBlockRegex = /<div className="flex flex-col md:items-end w-full">\s*\{isMulti && \(\s*<div className="flex items-center justify-end w-full mb-2 gap-2">\s*<span className="bg-slate-100 px-3 py-1 rounded-md text-xs font-bold text-slate-500 uppercase tracking-widest">\s*Opción \{optIdx \+ 1\}\s*<\/span>\s*\{opt\.carrier && <span className="text-sm font-bold text-\[\#514690\] uppercase tracking-widest">\{opt\.carrier\}<\/span>\}\s*<\/div>\s*\)\}\s*<div className="flex items-baseline text-slate-800">\s*<span className="text-2xl font-semibold mr-1 text-slate-400">\$<\/span>\s*<span className="font-bold text-4xl md:text-5xl tracking-tight">\s*\{Number\(opt\.premium\)\.toLocaleString\('en-US'\)\}\s*<\/span>\s*<\/div>\s*<span className="text-xs font-semibold text-slate-400 uppercase tracking-widest mt-1 mb-4">\{t\.payInFull\}<\/span>\s*\{opt\.monthly_payment && \(\s*<div className="text-sm font-semibold text-slate-500 flex items-center md:justify-end gap-2">\s*<span>\{t\.or\}<\/span>\s*<span className="font-bold text-\[\#009CFF\]">\\\$\{opt\.monthly_payment\}<\/span>\s*<span>\{t\.perMonth\}<\/span>\s*<\/div>\s*\)\}\s*<\/div>/g;

const newPriceBlock = `<div className="flex flex-col md:items-end w-full">
                              {isMulti && (
                                <div className="flex items-center justify-end w-full mb-2 gap-2">
                                  <span className="bg-slate-100 px-3 py-1 rounded-md text-xs font-bold text-slate-500 uppercase tracking-widest">
                                    Opción {optIdx + 1}
                                  </span>
                                  {opt.carrier && (
                                    <div className="flex items-center gap-2">
                                      {(carriersMap[opt.carrier]?.trim() || opt.carrierLogo) && (
                                        <img 
                                          src={carriersMap[opt.carrier]?.trim() ? carriersMap[opt.carrier] : (opt.carrierLogo.startsWith('http') ? opt.carrierLogo : \`\${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/logos/\${opt.carrierLogo}\`)} 
                                          alt={opt.carrier}
                                          className="h-4 object-contain mix-blend-multiply opacity-80"
                                          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                        />
                                      )}
                                      <span className="text-sm font-bold text-[#514690] uppercase tracking-widest">{opt.carrier}</span>
                                    </div>
                                  )}
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
                                <div className="text-sm font-semibold text-slate-500 flex flex-col md:items-end gap-1">
                                  <div className="flex items-center md:justify-end gap-2">
                                    <span>{t.or}</span>
                                    <span className="font-bold text-[#009CFF]">\${opt.monthly_payment}</span>
                                    <span>{t.perMonth}</span>
                                  </div>
                                  {Number(opt.downpayment || 0) > 0 && (
                                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{t.downpayment}{Number(opt.downpayment).toLocaleString('en-US')}</span>
                                  )}
                                </div>
                              )}
                            </div>`;

code = code.replace(priceBlockRegex, newPriceBlock);

// 2. Add IntersectionObserver to scroll to top
const useEffectScrollTop = `
  useEffect(() => {
    if (!carouselRef.current) return;
    
    // We observe all slides. If a slide becomes fully visible, we scroll the window to the top.
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      });
    }, {
      root: carouselRef.current,
      threshold: 0.6
    });

    const slides = document.querySelectorAll('.slide-container');
    slides.forEach(slide => observer.observe(slide));

    return () => observer.disconnect();
  }, [quote, selectedModules]);
`;

// Insert the useEffect right after the first useEffect
const existingUseEffect = /useEffect\(\(\) => \{\n\s*const fetchQuote = async \(\) => \{/m;
code = code.replace(existingUseEffect, useEffectScrollTop + '\n  useEffect(() => {\n    const fetchQuote = async () => {');

// Add 'slide-container' class to the slides
const slideDivRegex = /<div key=\{idx\} className="min-w-full w-full shrink-0 snap-center/g;
code = code.replace(slideDivRegex, '<div key={idx} className="slide-container min-w-full w-full shrink-0 snap-center');

const summarySlideDivRegex = /<div className="min-w-full w-full shrink-0 snap-center px-4 md:px-12 xl:px-32 flex justify-center items-start pt-2 print:block print:w-full print:px-0 print:page-break-before-always">/g;
code = code.replace(summarySlideDivRegex, '<div className="slide-container min-w-full w-full shrink-0 snap-center px-4 md:px-12 xl:px-32 flex justify-center items-start pt-2 print:block print:w-full print:px-0 print:page-break-before-always">');


fs.writeFileSync(path, code);
console.log('Successfully added slide logos, downpayment, and scroll snap to top logic.');
