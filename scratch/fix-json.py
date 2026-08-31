import re

file_path = 'web/src/app/quotes/page.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update state
content = content.replace(
    'const [isJsonImportOpen, setIsJsonImportOpen] = useState(false)',
    'const [jsonImportIndex, setJsonImportIndex] = useState<number | null>(null)'
)

# 2. Update handleJsonImport
old_handle = """  const handleJsonImport = () => {
    try {
      const parsed = JSON.parse(jsonImportText)
      if (Array.isArray(parsed)) {
        const newProposals = parsed.map((p: any) => ({
          product: p.product || "N/A",
          carrier: p.carrier || "",
          premium: p.premium || "",
          commission_percentage: p.commission_percentage || "",
          agent_commission_percentage: p.agent_commission_percentage || "",
          monthly_payment: p.monthly_payment || "",
          downpayment: p.downpayment || "",
          payment_options: p.payment_options || "",
          coverages: p.coverages || "",
          included: p.included || "",
          excluded: p.excluded || "",
          notes: p.notes || "",
          description: p.description || "",
          file: null,
          is_annual: p.is_annual ?? true,
          is_monthly: p.is_monthly ?? false,
          is_bundled: p.is_bundled ?? false
        }))
        setProposals([...proposals, ...newProposals])
        setIsJsonImportOpen(false)
        setJsonImportText("")
        toast.success(lang === 'es' ? "JSON importado correctamente" : "JSON imported successfully")
      } else {
        toast.error(lang === 'es' ? "El JSON debe ser un arreglo (Array) de propuestas" : "JSON must be an array of proposals")
      }
    } catch (e) {
      toast.error(lang === 'es' ? "JSON inválido. Revisa la sintaxis." : "Invalid JSON. Check syntax.")
    }
  }"""

new_handle = """  const handleJsonImport = () => {
    try {
      const parsed = JSON.parse(jsonImportText)
      const dataArray = Array.isArray(parsed) ? parsed : [parsed]
      
      const newProposals = dataArray.map((p: any) => ({
        product: p.product || "N/A",
        carrier: p.carrier || "",
        premium: p.premium || "",
        commission_percentage: p.commission_percentage || "",
        agent_commission_percentage: p.agent_commission_percentage || "",
        monthly_payment: p.monthly_payment || "",
        downpayment: p.downpayment || "",
        payment_options: p.payment_options || "",
        coverages: p.coverages || "",
        included: p.included || "",
        excluded: p.excluded || "",
        notes: p.notes || "",
        description: p.description || "",
        file: null,
        is_annual: p.is_annual ?? true,
        is_monthly: p.is_monthly ?? false,
        is_bundled: p.is_bundled ?? false
      }))

      if (jsonImportIndex !== null && jsonImportIndex >= 0 && jsonImportIndex < proposals.length) {
         const next = [...proposals]
         next[jsonImportIndex] = {
           ...next[jsonImportIndex],
           ...newProposals[0],
           product: newProposals[0].product !== "N/A" ? newProposals[0].product : next[jsonImportIndex].product,
           carrier: newProposals[0].carrier ? newProposals[0].carrier : next[jsonImportIndex].carrier,
         }
         if (newProposals.length > 1) {
           next.push(...newProposals.slice(1))
         }
         setProposals(next)
      } else {
         setProposals([...proposals, ...newProposals])
      }
      
      setJsonImportIndex(null)
      setJsonImportText("")
      toast.success(lang === 'es' ? "JSON importado correctamente" : "JSON imported successfully")
    } catch (e) {
      toast.error(lang === 'es' ? "JSON inválido. Revisa la sintaxis." : "Invalid JSON. Check syntax.")
    }
  }"""

content = content.replace(old_handle, new_handle)

# 3. Remove global Importar JSON button
global_btn = """                <button 
                  onClick={() => setIsJsonImportOpen(true)}
                  className="px-3 py-1.5 text-sm bg-primary/10 text-primary font-medium rounded-lg hover:bg-primary/20 transition-colors"
                >
                  {lang === 'es' ? 'Importar JSON ✨' : 'Import JSON ✨'}
                </button>"""
content = content.replace(global_btn, "")

# 4. Add Import JSON button per proposal
old_delete_btn = """                  <div className="absolute right-2 top-2">
                    <button 
                      onClick={() => setProposals(proposals.filter((_, i) => i !== idx))}
                      className="p-1.5 border border-red-500/20 text-red-500 rounded-md hover:bg-red-500/10"
                      title="Eliminar"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>"""

new_delete_btn = """                  <div className="absolute right-2 top-2 flex items-center gap-2">
                    <button 
                      onClick={() => setJsonImportIndex(idx)}
                      className="px-2 py-1 text-xs bg-primary/10 text-primary font-medium rounded hover:bg-primary/20 transition-colors"
                      title="Importar JSON"
                    >
                      JSON ✨
                    </button>
                    <button 
                      onClick={() => setProposals(proposals.filter((_, i) => i !== idx))}
                      className="p-1.5 border border-red-500/20 text-red-500 rounded-md hover:bg-red-500/10"
                      title="Eliminar"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>"""

content = content.replace(old_delete_btn, new_delete_btn)

# 5. Update JSON modal render
content = content.replace('{isJsonImportOpen && (', '{jsonImportIndex !== null && (')
content = content.replace('onClick={() => setIsJsonImportOpen(false)}', 'onClick={() => setJsonImportIndex(null)}')

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Done")
