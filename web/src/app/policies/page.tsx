"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { getPolicies, deletePolicy } from "@/app/actions/policies"
import { ShieldCheck, Plus, Search, Edit2, Trash2 } from "lucide-react"
import { useLanguage } from "@/components/language-provider"
import { PolicyModal } from "@/components/policies/PolicyModal"

export default function PoliciesPage() {
  const lang = useLanguage()
  const router = useRouter()
  const [policies, setPolicies] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingPolicy, setEditingPolicy] = useState<any | null>(null)

  const t = {
    es: {
      title: "Registro de Pólizas",
      subtitle: "Gestión de pólizas contratadas y comisiones.",
      searchPlaceholder: "Buscar por cliente, póliza o compañía...",
      add: "Registrar Póliza",
      year: "Año",
      month: "Mes",
      policyNum: "Número de Póliza",
      type: "Tipo",
      client: "Cliente",
      carrier: "Compañía",
      premium: "Premium",
      commission: "Comisión (Agencia)",
      actions: "Acciones",
      edit: "Editar",
      delete: "Eliminar",
      deleteConfirm: "¿Estás seguro de eliminar esta póliza?",
      noData: "No se encontraron pólizas.",
      loading: "Cargando..."
    },
    en: {
      title: "Policies Registry",
      subtitle: "Management of contracted policies and commissions.",
      searchPlaceholder: "Search by client, policy or carrier...",
      add: "Register Policy",
      year: "Year",
      month: "Month",
      policyNum: "Policy Number",
      type: "Type",
      client: "Client",
      carrier: "Carrier",
      premium: "Premium",
      commission: "Commission (Agency)",
      actions: "Actions",
      edit: "Edit",
      delete: "Delete",
      deleteConfirm: "Are you sure you want to delete this policy?",
      noData: "No policies found.",
      loading: "Loading..."
    }
  }[lang]

  useEffect(() => {
    loadPolicies()
  }, [])

  async function loadPolicies() {
    setLoading(true)
    const { createClient } = await import('@/lib/supabase/client')
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    let isDemo = false;
    if (user) {
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
      if (profile?.role === 'DEMO') isDemo = true;
    }
    
    if (isDemo) {
      const { demoPolicies } = await import('@/lib/demo-data');
      setPolicies(demoPolicies);
    } else {
      const res = await getPolicies()
      if (res.success && res.policies) {
        setPolicies(res.policies)
      }
    }
    setLoading(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm(t.deleteConfirm)) return
    const res = await deletePolicy(id)
    if (res.success) {
      loadPolicies()
    } else {
      alert("Error deleting policy: " + res.error)
    }
  }

  const filtered = policies.filter(p => {
    const s = searchTerm.toLowerCase()
    return (
      (p.policy_number || "").toLowerCase().includes(s) ||
      (p.carrier_id || "").toLowerCase().includes(s) ||
      (p.client_first_name || "").toLowerCase().includes(s) ||
      (p.client_last_name || "").toLowerCase().includes(s) ||
      (p.client_company_name || "").toLowerCase().includes(s)
    )
  })

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3 text-primary mb-2">
            <div className="p-2.5 bg-primary/10 rounded-xl">
              <ShieldCheck className="h-6 w-6" />
            </div>
          </div>
          <h1 className="text-4xl font-playfair font-bold tracking-tight text-foreground">{t.title}</h1>
          <p className="text-muted-foreground">{t.subtitle}</p>
        </div>
        
        <button
          onClick={() => { setEditingPolicy(null); setIsModalOpen(true) }}
          className="bg-primary text-primary-foreground px-6 py-2.5 rounded-xl font-medium hover:bg-primary/90 transition-all shadow-sm flex items-center justify-center gap-2"
        >
          <Plus className="h-4 w-4" />
          {t.add}
        </button>
      </div>

      <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b border-border bg-muted/20">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder={t.searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-muted/30">
              <tr>
                <th className="px-6 py-4 font-medium">{t.year}/{t.month}</th>
                <th className="px-6 py-4 font-medium">{t.policyNum}</th>
                <th className="px-6 py-4 font-medium">{t.client}</th>
                <th className="px-6 py-4 font-medium">{t.type}</th>
                <th className="px-6 py-4 font-medium">{t.carrier}</th>
                <th className="px-6 py-4 font-medium">{t.premium}</th>
                <th className="px-6 py-4 font-medium">{t.commission}</th>
                <th className="px-6 py-4 font-medium text-right">{t.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-muted-foreground">{t.loading}</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-muted-foreground">{t.noData}</td>
                </tr>
              ) : (
                filtered.map((policy) => (
                  <tr key={policy.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 font-medium text-foreground">{policy.year} - {policy.month}</td>
                    <td className="px-6 py-4 font-mono text-muted-foreground">{policy.policy_number || 'TBD'}</td>
                    <td className="px-6 py-4 font-medium">
                      {policy.insurance_type === 'Personal' 
                        ? [policy.client_first_name, policy.client_last_name].filter(Boolean).join(" ") 
                        : [policy.client_first_name, policy.client_last_name, policy.client_company_name].filter(Boolean).join(" - ")}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                        policy.insurance_type === 'Personal' ? 'bg-blue-500/10 text-blue-600' : 'bg-amber-500/10 text-amber-600'
                      }`}>
                        {policy.insurance_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium">{policy.carrier_id}</td>
                    <td className="px-6 py-4"></td>
                    <td className="px-6 py-4 text-emerald-600 font-semibold">
                       <span className="text-xs text-muted-foreground">({policy.agency_commission_percentage || 0}%)</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => { setEditingPolicy(policy); setIsModalOpen(true) }}
                          className="p-2 hover:bg-muted rounded-lg text-muted-foreground hover:text-foreground transition-colors"
                          title={t.edit}
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(policy.id)}
                          className="p-2 hover:bg-red-500/10 rounded-lg text-muted-foreground hover:text-red-600 transition-colors"
                          title={t.delete}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <PolicyModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => { setIsModalOpen(false); loadPolicies() }}
        policy={editingPolicy}
      />
    </div>
  )
}
