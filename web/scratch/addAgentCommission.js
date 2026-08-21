const fs = require('fs');
const path = require('path');

const targetFile = path.join(__dirname, '../src/app/quotes/page.tsx');
let content = fs.readFileSync(targetFile, 'utf8');

// 1. Add agent_commission_percentage to the useState type
content = content.replace(
  /commission_percentage: string,/g,
  'commission_percentage: string, agent_commission_percentage: string,'
);

// 2. Add agent_commission_percentage to the default object
content = content.replace(
  /commission_percentage: "",/g,
  'commission_percentage: "", agent_commission_percentage: "",'
);

// 3. Add the input field in the JSX (search for commissionInternal)
const inputJsxRegex = /(<label className="text-xs font-medium text-muted-foreground mb-1 block">\{t\.commissionInternal\}<\/label>[\s\S]*?<\/div>)/;
const newInput = `$1

                    <div className="md:col-span-1">
                      <label className="text-xs font-medium text-muted-foreground mb-1 block">{(t as any).agentCommission || "% Comisión (Agente)"}</label>
                      <input
                        type="number"
                        value={prop.agent_commission_percentage || ""}
                        onChange={e => {
                          const next = [...proposals]
                          next[idx].agent_commission_percentage = e.target.value
                          setProposals(next)
                        }}
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        placeholder="Ej: 20"
                      />
                    </div>`;

content = content.replace(inputJsxRegex, newInput);

fs.writeFileSync(targetFile, content);
console.log('QuotesPage modified successfully');
