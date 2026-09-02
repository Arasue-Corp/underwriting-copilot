"use client"

import { useState, useEffect } from "react"
import { createPolicy, updatePolicy } from "@/app/actions/policies"
import { X } from "lucide-react"
import { useLanguage } from "@/components/language-provider"
import { createClient } from "@/lib/supabase/client"

export function PolicyModal({ isOpen, onClose, onSuccess, policy }: { 
  isOpen: boolean; 
  onClose: () => void; 
  onSuccess: () => void;
  policy?: any | null;
}) {
  const lang = useLanguage()
  const [loading, setLoading] = useState(false)
  const [agents, setAgents] = useState<any[]>([])
  const [formData, setFormData] = useState({
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    policy_number: "",
      agent_id: "",
    insurance_type: "Personal",
    carrier_id: "",
    coverage: "",
    state: "",
    city: "",
    zip_code: "",
    participants: "",
    premium_amount: 0,
    agency_commission_percentage: 0,
    agency_commission_amount: 0,
    client_first_name: "",
    client_last_name: "",
    client_company_name: ""
  })


  useEffect(() => {
    if (isOpen) {
      const loadAgents = async () => {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const { data: profile } = await supabase.from('profiles').select('agency_id').eq('id', user.id).single()
          if (profile?.agency_id) {
            const { data: agnts } = await supabase.from('profiles').select('id, name').eq('agency_id', profile.agency_id).eq('role', 'AGENT')
            if (agnts) setAgents(agnts)
          }
        }
      }
      loadAgents()
    }
  }, [isOpen])

  useEffect(() => {
    if (policy) {
      setFormData({
        year: policy.year || new Date().getFullYear(),
        month: policy.month || (new Date().getMonth() + 1),
        policy_number: policy.policy_number || "",
          agent_id: policy.agent_id || "",
        insurance_type: policy.insurance_type || "Personal",
        carrier_id: policy.carrier_id || "",
        coverage: policy.coverage || "",
        state: policy.state || "",
        city: policy.city || "",
        zip_code: policy.zip_code || "",
        participants: policy.participants || "",
        premium_amount: policy.premium_amount || 0,
        agency_commission_percentage: policy.agency_commission_percentage || 0,
        agency_commission_amount: policy.agency_commission_amount || 0,
        client_first_name: policy.client_first_name || "",
        client_last_name: policy.client_last_name || "",
        client_company_name: policy.client_company_name || ""
      })
    } else {
      setFormData({
        year: new Date().getFullYear(),
        month: new Date().getMonth() + 1,
        policy_number: "",
      agent_id: "",
        insurance_type: "Personal",
        carrier_id: "",
        coverage: "",
        state: "",
        city: "",
        zip_code: "",
        participants: "",
        premium_amount: 0,
        agency_commission_percentage: 0,
        agency_commission_amount: 0,
        client_first_name: "",
        client_last_name: "",
        client_company_name: ""
      })
    }
  }, [policy, isOpen])

  const handleChange = (e: any) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  // Auto-calculate commission amount based on percentage and premium
  useEffect(() => {
    const premium = parseFloat(String(formData.premium_amount)) || 0
    const perc = parseFloat(String(formData.agency_commission_percentage)) || 0
    if (premium > 0 && perc > 0) {
      setFormData(prev => ({
        ...prev,
        agency_commission_amount: (premium * (perc / 100)).toFixed(2) as any
      }))
    }
  }, [formData.premium_amount, formData.agency_commission_percentage])

  const handleSubmit = async (e: any) => {
    e.preventDefault()
    setLoading(true)
    
    // clean numeric values
    const payload = {
      ...formData,
      year: parseInt(String(formData.year)),
      month: parseInt(String(formData.month)),
      premium_amount: parseFloat(String(formData.premium_amount)) || 0,
      agency_commission_percentage: parseFloat(String(formData.agency_commission_percentage)) || 0,
      agency_commission_amount: parseFloat(String(formData.agency_commission_amount)) || 0
    }

    let res;
    if (policy) {
      res = await updatePolicy(policy.id, payload)
    } else {
      res = await createPolicy(payload)
    }

    if (res.success) {
      onSuccess()
    } else {
      alert("Error: " + res.error)
    }
    setLoading(false)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card w-full max-w-3xl rounded-3xl shadow-xl border border-border flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-border flex items-center justify-between">
          <h2 className="text-xl font-bold font-playfair">{policy ? (lang === 'es' ? 'Editar Póliza' : 'Edit Policy') : (lang === 'es' ? 'Registrar Póliza' : 'Register Policy')}</h2>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition-colors"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6 overflow-y-auto flex-1">
          <form id="policy-form" onSubmit={handleSubmit} className="space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wider">{lang === 'es' ? 'Año' : 'Year'}</label>
                <input type="number" name="year" value={formData.year} onChange={handleChange} required className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wider">{lang === 'es' ? 'Mes (1-12)' : 'Month (1-12)'}</label>
                <input type="number" min="1" max="12" name="month" value={formData.month} onChange={handleChange} required className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wider">{lang === 'es' ? 'Número Póliza' : 'Policy Number'}</label>
                <input type="text" name="policy_number" value={formData.policy_number} onChange={handleChange} className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wider">{lang === 'es' ? 'Agente' : 'Agent'}</label>
                <select name="agent_id" value={formData.agent_id} onChange={handleChange} className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm">
                  <option value="">{lang === 'es' ? 'Ninguno' : 'None'}</option>
                  {agents.map((a: any) => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wider">{lang === 'es' ? 'Compañía (Carrier)' : 'Carrier'}</label>
                <input type="text" name="carrier_id" value={formData.carrier_id} onChange={handleChange} required className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wider">{lang === 'es' ? 'Cobertura / Seguro' : 'Coverage'}</label>
                <input type="text" name="coverage" value={formData.coverage} onChange={handleChange} required className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wider">{lang === 'es' ? 'Premium ($)' : 'Premium ($)'}</label>
                <input type="number" step="0.01" name="premium_amount" value={formData.premium_amount} onChange={handleChange} required className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wider">{lang === 'es' ? 'Comisión %' : 'Commission %'}</label>
                <input type="number" step="0.01" name="agency_commission_percentage" value={formData.agency_commission_percentage} onChange={handleChange} required className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wider">{lang === 'es' ? 'Comisión ($)' : 'Commission ($)'}</label>
                <input type="number" step="0.01" name="agency_commission_amount" value={formData.agency_commission_amount} onChange={handleChange} required className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wider">{lang === 'es' ? 'Tipo de Seguro' : 'Insurance Type'}</label>
                <select name="insurance_type" value={formData.insurance_type} onChange={handleChange} className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm">
                  <option value="Personal">Personal</option>
                  <option value="Comercial">Comercial</option>
                </select>
              </div>
              {formData.insurance_type === 'Personal' ? (
                <>
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wider">{lang === 'es' ? 'Nombre Cliente' : 'Client First Name'}</label>
                    <input type="text" name="client_first_name" value={formData.client_first_name} onChange={handleChange} className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wider">{lang === 'es' ? 'Apellido Cliente' : 'Client Last Name'}</label>
                    <input type="text" name="client_last_name" value={formData.client_last_name} onChange={handleChange} className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm" />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wider">{lang === 'es' ? 'Nombre Cliente' : 'Client First Name'}</label>
                    <input type="text" name="client_first_name" value={formData.client_first_name} onChange={handleChange} className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wider">{lang === 'es' ? 'Apellido Cliente' : 'Client Last Name'}</label>
                    <input type="text" name="client_last_name" value={formData.client_last_name} onChange={handleChange} className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm" />
                  </div>
                  <div className="col-span-1 md:col-span-2">
                    <label className="block text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wider">{lang === 'es' ? 'Compañía del Cliente' : 'Client Company Name'}</label>
                    <input type="text" name="client_company_name" value={formData.client_company_name} onChange={handleChange} className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm" />
                  </div>
                </>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wider">{lang === 'es' ? 'Estado' : 'State'}</label>
                <input type="text" name="state" value={formData.state} onChange={handleChange} className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wider">{lang === 'es' ? 'Ciudad' : 'City'}</label>
                <input type="text" name="city" value={formData.city} onChange={handleChange} className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wider">{lang === 'es' ? 'C.P.' : 'Zip Code'}</label>
                <input type="text" name="zip_code" value={formData.zip_code} onChange={handleChange} className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wider">{lang === 'es' ? 'Participantes (Splits / Notas)' : 'Participants / Notes'}</label>
              <textarea name="participants" value={formData.participants} onChange={handleChange} rows={2} className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm"></textarea>
            </div>
            
          </form>
        </div>
        <div className="p-6 border-t border-border flex justify-end gap-3 bg-muted/20">
          <button type="button" onClick={onClose} className="px-6 py-2.5 rounded-xl font-medium text-muted-foreground hover:text-foreground transition-colors">
            {lang === 'es' ? 'Cancelar' : 'Cancel'}
          </button>
          <button type="submit" form="policy-form" disabled={loading} className="bg-primary text-primary-foreground px-8 py-2.5 rounded-xl font-medium hover:bg-primary/90 transition-all shadow-sm">
            {loading ? (lang === 'es' ? 'Guardando...' : 'Saving...') : (lang === 'es' ? 'Guardar' : 'Save')}
          </button>
        </div>
      </div>
    </div>
  )
}
