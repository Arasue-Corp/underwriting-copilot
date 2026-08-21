const fs = require('fs');

// 1. Update QuotesPage (quotes/page.tsx)
let quotesPath = 'web/src/app/quotes/page.tsx';
let quotesCode = fs.readFileSync(quotesPath, 'utf8');

// Add description to type definition
quotesCode = quotesCode.replace(/notes: string,/g, 'notes: string, description: string,');

// Add description to all initial state objects
quotesCode = quotesCode.replace(/notes: "",/g, 'notes: "", description: "",');

// Find where to insert the textarea in the form.
// There is an excluded block:
const excludedRegex = /<div className="md:col-span-1">\s*<label className="block text-sm font-semibold text-slate-700 mb-2">\{t.excluded\}<\/label>\s*<textarea\s*value=\{p.excluded\}\s*onChange=\{\(e\) => \{\s*const next = \[\.\.\.proposals\]\s*next\[idx\]\.excluded = e.target.value\s*setProposals\(next\)\s*\}\}\s*className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-700 focus:outline-none focus:ring-2 focus:ring-\[\#009CFF\]\/50 transition-all min-h-\[100px\]"\s*placeholder="Exclusion 1\\nExclusion 2"\s*\/>\s*<\/div>/;

const newDescriptionField = `
                          <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-slate-700 mb-2">{t.description || "Description / Summary"}</label>
                            <textarea
                              value={p.description}
                              onChange={(e) => {
                                const next = [...proposals]
                                next[idx].description = e.target.value
                                setProposals(next)
                              }}
                              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#009CFF]/50 transition-all min-h-[80px]"
                              placeholder="Product summary and examples..."
                            />
                          </div>
`;

quotesCode = quotesCode.replace(excludedRegex, (match) => {
  return match + '\n' + newDescriptionField;
});

fs.writeFileSync(quotesPath, quotesCode);


// 2. Update Proposals Page (proposals/[id]/page.tsx)
let proposalsPath = 'web/src/app/proposals/[id]/page.tsx';
let proposalsCode = fs.readFileSync(proposalsPath, 'utf8');

const productHeaderRegex = /<h2 className="text-4xl md:text-5xl font-black text-slate-800 leading-tight mb-2 tracking-tight">\s*\{group\.product\}\s*<\/h2>/;

proposalsCode = proposalsCode.replace(productHeaderRegex, (match) => {
  return match + '\n                    {group.options[0]?.description && <p className="text-slate-500 mt-4 text-lg whitespace-pre-wrap max-w-3xl">{group.options[0].description}</p>}';
});

fs.writeFileSync(proposalsPath, proposalsCode);


// 3. Update FormalProposalPDF (components/pdf/FormalProposalPDF.tsx)
let pdfPath = 'web/src/components/pdf/FormalProposalPDF.tsx';
let pdfCode = fs.readFileSync(pdfPath, 'utf8');

const pdfHeaderRegex = /<Text style=\{styles\.header\}>\{group\.product\}<\/Text>/;

pdfCode = pdfCode.replace(pdfHeaderRegex, (match) => {
  return match + '\n              {group.options[0]?.description && <Text style={{ fontSize: 11, color: \'#475569\', marginBottom: 15, lineHeight: 1.4 }}>{group.options[0].description}</Text>}';
});

fs.writeFileSync(pdfPath, pdfCode);

console.log('Successfully added description field.');
