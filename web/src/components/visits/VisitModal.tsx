"use client"

import { useState } from "react"
import { X, UserPlus, Search } from "lucide-react"
import { toast } from "sonner"
import { createVisit } from "@/app/actions/visits"
import { useLanguage } from "@/components/language-provider"

interface VisitModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  clients: any[]
  preselectedClientId?: string | null
}

export function VisitModal({ isOpen, onClose, onSuccess, clients, preselectedClientId }: VisitModalProps) {
  const langContext = useLanguage()
  const lang = (langContext === 'en' || langContext === 'es') ? langContext : 'es'
  const t = {
    es: {
      title: 'Registrar Visita',
      existingClient: 'Cliente Existente',
      newClient: 'Nuevo Cliente',
      selectClientError: 'Selecciona un cliente de la lista',
      nameRequiredError: 'El nombre del nuevo cliente es requerido',
      successMessage: 'Visita registrada correctamente',
      errorMessage: 'Error al registrar visita',
      selectClientLabel: 'Seleccionar Cliente',
      selectClientPlaceholder: '-- Buscar / Seleccionar --',
      clientLockedMsg: 'El cliente está bloqueado porque abriste este formulario desde su perfil.',
      companyNameLabel: 'Nombre de la Empresa *',
      companyNamePlaceholder: 'Ej. ACME Corp',
      addressLabel: 'Dirección Física',
      contactLabel: 'Contacto (Email / Tel)',
      visitDateLabel: 'Fecha de Visita',
      businessHoursLabel: 'Horario Comercial',
      businessHoursPlaceholder: 'Ej. 9am - 5pm',
      representativesLabel: 'Representantes de la Empresa',
      repReceptionist: 'Recepcionista',
      repManager: 'Gerente',
      repOwner: 'Dueño',
      policiesLabel: 'Tipo de Pólizas Necesarias',
      conversationNotesLabel: 'Notas de la Conversación',
      requirementsLabel: 'Requerimientos Detectados y Oportunidades',
      additionalNotesLabel: 'Notas Adicionales (Agente)',
      nextVisitLabel: 'Agendar Siguiente Visita',
      cancelBtn: 'Cancelar',
      saveBtn: 'Guardar Reporte',
      savingBtn: 'Guardando...'
    },
    en: {
      title: 'Log Visit',
      existingClient: 'Existing Client',
      newClient: 'New Client',
      selectClientError: 'Select a client from the list',
      nameRequiredError: 'New client name is required',
      successMessage: 'Visit logged successfully',
      errorMessage: 'Error logging visit',
      selectClientLabel: 'Select Client',
      selectClientPlaceholder: '-- Search / Select --',
      clientLockedMsg: 'The client is locked because you opened this form from their profile.',
      companyNameLabel: 'Company Name *',
      companyNamePlaceholder: 'e.g., ACME Corp',
      addressLabel: 'Physical Address',
      contactLabel: 'Contact (Email / Phone)',
      visitDateLabel: 'Visit Date',
      businessHoursLabel: 'Business Hours',
      businessHoursPlaceholder: 'e.g., 9am - 5pm',
      representativesLabel: 'Company Representatives',
      repReceptionist: 'Receptionist',
      repManager: 'Manager',
      repOwner: 'Owner',
      policiesLabel: 'Required Policy Types',
      conversationNotesLabel: 'Conversation Notes',
      requirementsLabel: 'Detected Requirements & Opportunities',
      additionalNotesLabel: 'Additional Notes (Agent)',
      nextVisitLabel: 'Schedule Next Visit',
      cancelBtn: 'Cancel',
      saveBtn: 'Save Report',
      savingBtn: 'Saving...'
    }
  }[lang]

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [mode, setMode] = useState<'EXISTING' | 'NEW'>(preselectedClientId ? 'EXISTING' : 'EXISTING')
  
  const [selectedClientId, setSelectedClientId] = useState<string>(preselectedClientId || '')
  
  const [newClientData, setNewClientData] = useState({
    name: '',
    address: '',
    contact: ''
  })

  const [visitForm, setVisitForm] = useState({
    visit_date: '',
    representatives: { receptionist: '', manager: '', owner: '' },
    policies_needed: [] as string[],
    business_hours: '',
    detected_requirements: '',
    conversation_notes: '',
    additional_notes: '',
    next_visit_date: ''
  })

  const policyOptions = lang === 'es' ? [
    'Responsabilidad Civil', 'Auto Comercial', 'Workers Comp', 'Responsabilidad Profesional', 'Propiedad Comercial'
  ] : [
    'General liability', 'Commercial auto', 'Workers compensation', 'Professional liability', 'Commercial property'
  ]
  if (!isOpen) return null

  const handlePolicyToggle = (policy: string) => {
    setVisitForm(prev => {
      const exists = prev.policies_needed.includes(policy)
      if (exists) {
        return { ...prev, policies_needed: prev.policies_needed.filter(p => p !== policy) }
      } else {
        return { ...prev, policies_needed: [...prev.policies_needed, policy] }
      }
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (mode === 'EXISTING' && !selectedClientId) {
      toast.error(t.selectClientError)
      return
    }
    if (mode === 'NEW' && !newClientData.name.trim()) {
      toast.error(t.nameRequiredError)
      return
    }

    setIsSubmitting(true)
    
    const payload = {
      client_id: mode === 'EXISTING' ? selectedClientId : undefined,
      new_client_name: mode === 'NEW' ? newClientData.name : undefined,
      new_client_address: mode === 'NEW' ? newClientData.address : undefined,
      new_client_contact: mode === 'NEW' ? newClientData.contact : undefined,

      visit_date: visitForm.visit_date ? new Date(visitForm.visit_date).toISOString() : new Date().toISOString(),
      representatives: visitForm.representatives,
      policies_needed: visitForm.policies_needed,
      business_hours: visitForm.business_hours,
      detected_requirements: visitForm.detected_requirements,
      conversation_notes: visitForm.conversation_notes,
      additional_notes: visitForm.additional_notes,
      next_visit_date: visitForm.next_visit_date ? new Date(visitForm.next_visit_date).toISOString() : null,
      status: 'COMPLETED'
    }

    const res = await createVisit(payload)

    if (res.success) {
      toast.success(t.successMessage)
      onSuccess()
    } else {
      toast.error(res.error || t.errorMessage)
    }
    setIsSubmitting(false)
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-card w-full max-w-2xl rounded-2xl shadow-2xl border border-border flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h3 className="text-xl font-bold">{t.title}</h3>
          <button onClick={onClose} className="text-muted-foreground hover:bg-muted p-2 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* CLIENT SELECTION / CREATION */}
          <div className="bg-muted/30 p-4 rounded-xl border border-border space-y-4">
            <div className="flex items-center gap-4 border-b border-border/50 pb-3">
              <button 
                type="button"
                onClick={() => setMode('EXISTING')}
                className={`text-sm font-bold px-4 py-1.5 rounded-full transition-colors ${mode === 'EXISTING' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'}`}
              >
                {t.existingClient}
              </button>
              <button 
                type="button"
                onClick={() => setMode('NEW')}
                className={`text-sm font-bold flex items-center gap-2 px-4 py-1.5 rounded-full transition-colors ${mode === 'NEW' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'}`}
              >
                <UserPlus className="w-4 h-4" /> {t.newClient}
              </button>
            </div>

            {mode === 'EXISTING' ? (
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase mb-1 block">{t.selectClientLabel}</label>
                <select 
                  className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                  value={selectedClientId}
                  onChange={e => setSelectedClientId(e.target.value)}
                  disabled={!!preselectedClientId} // If opened from a client profile, lock it
                >
                  <option value="">{t.selectClientPlaceholder}</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                {preselectedClientId && <p className="text-[10px] text-muted-foreground mt-1">{t.clientLockedMsg}</p>}
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase mb-1 block">{t.companyNameLabel}</label>
                  <input type="text" placeholder={t.companyNamePlaceholder} className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none" value={newClientData.name} onChange={e => setNewClientData({...newClientData, name: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-muted-foreground uppercase mb-1 block">{t.addressLabel}</label>
                    <input type="text" className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none" value={newClientData.address} onChange={e => setNewClientData({...newClientData, address: e.target.value})} />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-muted-foreground uppercase mb-1 block">{t.contactLabel}</label>
                    <input type="text" className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none" value={newClientData.contact} onChange={e => setNewClientData({...newClientData, contact: e.target.value})} />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase mb-1 block">{t.visitDateLabel}</label>
              <input type="datetime-local" className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none" value={visitForm.visit_date} onChange={e => setVisitForm({...visitForm, visit_date: e.target.value})} />
            </div>
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase mb-1 block">{t.businessHoursLabel}</label>
              <input type="text" placeholder={t.businessHoursPlaceholder} className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none" value={visitForm.business_hours} onChange={e => setVisitForm({...visitForm, business_hours: e.target.value})} />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase mb-2 block">{t.representativesLabel}</label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input type="text" placeholder={t.repReceptionist} className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none" value={visitForm.representatives.receptionist} onChange={e => setVisitForm({...visitForm, representatives: {...visitForm.representatives, receptionist: e.target.value}})} />
              <input type="text" placeholder={t.repManager} className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none" value={visitForm.representatives.manager} onChange={e => setVisitForm({...visitForm, representatives: {...visitForm.representatives, manager: e.target.value}})} />
              <input type="text" placeholder={t.repOwner} className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none" value={visitForm.representatives.owner} onChange={e => setVisitForm({...visitForm, representatives: {...visitForm.representatives, owner: e.target.value}})} />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase mb-2 block">{t.policiesLabel}</label>
            <div className="flex flex-wrap gap-2">
              {policyOptions.map(pol => (
                <button 
                  key={pol}
                  type="button"
                  onClick={() => handlePolicyToggle(pol)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${visitForm.policies_needed.includes(pol) ? 'bg-primary text-primary-foreground border-primary' : 'bg-muted/50 text-muted-foreground border-border hover:bg-muted'}`}
                >
                  {pol}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase mb-1 block">{t.conversationNotesLabel}</label>
            <textarea rows={3} className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none resize-none" value={visitForm.conversation_notes} onChange={e => setVisitForm({...visitForm, conversation_notes: e.target.value})}></textarea>
          </div>

          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase mb-1 block">{t.requirementsLabel}</label>
            <textarea rows={2} className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none resize-none" value={visitForm.detected_requirements} onChange={e => setVisitForm({...visitForm, detected_requirements: e.target.value})}></textarea>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase mb-1 block">{t.additionalNotesLabel}</label>
              <textarea rows={2} className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none resize-none" value={visitForm.additional_notes} onChange={e => setVisitForm({...visitForm, additional_notes: e.target.value})}></textarea>
            </div>
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase mb-1 block">{t.nextVisitLabel}</label>
              <input type="datetime-local" className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none" value={visitForm.next_visit_date} onChange={e => setVisitForm({...visitForm, next_visit_date: e.target.value})} />
            </div>
          </div>

        </div>

        <div className="p-6 border-t border-border bg-muted/20 flex justify-end gap-3 rounded-b-2xl">
          <button 
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-md font-medium text-muted-foreground hover:bg-muted transition-colors"
          >
            {t.cancelBtn}
          </button>
          <button 
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-2 rounded-md font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isSubmitting ? t.savingBtn : t.saveBtn}
          </button>
        </div>
      </div>
    </div>
  )
}
