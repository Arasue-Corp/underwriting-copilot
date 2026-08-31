import re

file_path = 'web/src/app/quotes/page.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update line 333 (validation)
content = re.sub(
    r'if \(!p\.carrier \|\| !p\.commission_percentage\) return toast\.error\("Completa Aseguradora y % de comisión para todas las propuestas"\)',
    r'if (!p.carrier || (!p.commission_percentage && userProfile?.role !== \'AGENT\')) return toast.error(userProfile?.role === \'AGENT\' ? "Completa Aseguradora para todas las propuestas" : "Completa Aseguradora y % de comisión para todas las propuestas")',
    content
)

# 2. Update line 369 (uploading proposals)
content = re.sub(
    r'commission_percentage: parseFloat\(p\.commission_percentage\),',
    r'commission_percentage: p.commission_percentage ? parseFloat(p.commission_percentage) : 0,\n          agent_commission_percentage: p.agent_commission_percentage ? parseFloat(p.agent_commission_percentage) : undefined,',
    content
)

# 3. Update handleAcceptSubmit commission
content = re.sub(
    r'parseFloat\(commissionPercentage\),',
    r'commissionPercentage ? parseFloat(commissionPercentage) : undefined,',
    content
)

# 4. Hide Accept Quote inputs (around 1150)
accept_input_pattern = r'(<div className="space-y-2">\s*<label className="text-sm font-medium">\{t\.commissionPercentage\}</label>\s*<input\s*type="number"\s*required\s*step="0\.01"\s*value=\{commissionPercentage\}\s*onChange=\{.*?\}\s*className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"\s*/>\s*</div>)'
content = re.sub(accept_input_pattern, r'{userProfile?.role !== \'AGENT\' && (\n                \1\n              )}', content, count=1, flags=re.DOTALL)

# 5. Hide Provide Quote inputs (around 1469)
provide_input_pattern = r'(<div>\s*<label className="text-xs font-medium text-muted-foreground mb-1 block">\{t\.commissionInternal\}</label>.*?</div>\s*<div className="md:col-span-1">\s*<label className="text-xs font-medium text-muted-foreground mb-1 block">\{.*?\}</label>.*?</div>)'

content = re.sub(provide_input_pattern, r'{userProfile?.role !== \'AGENT\' && (\n                      <>\n                        \1\n                      </>\n                    )}', content, count=1, flags=re.DOTALL)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Done.")
