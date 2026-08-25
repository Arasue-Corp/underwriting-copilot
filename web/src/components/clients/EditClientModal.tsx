"use client"

import { useState, useEffect } from "react"
import { X } from "lucide-react"
import { toast } from "sonner"
import { updateClient } from "@/app/actions/clients"
import { useLanguage } from "@/components/language-provider"

interface EditClientModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  client: any
}

export function EditClientModal({ isOpen, onClose, onSuccess, client }: EditClientModalProps) {
  const langContext = useLanguage()
  const lang = (langContext === 'en' || langContext === 'es') ? langContext : 'es'
  
  const t = {
    es: {
      title: 'Editar Cliente',
      firstNameLabel: 'Nombre del Solicitante',
      lastNameLabel: 'Apellido del Solicitante',
      nameLabel: 'Nombre Legal de la Empresa y DBA *',
      legalStructureLabel: 'Estructura Legal',
      feinLabel: 'FEIN',
      addressLabel: 'Dirección Física',
      contactLabel: 'Contacto (Tel / Email)',
      cancelBtn: 'Cancelar',
      saveBtn: 'Guardar Cambios',
      savingBtn: 'Guardando...',
      successMsg: 'Cliente actualizado correctamente',
      errorMsg: 'Error al actualizar el cliente',
      nameRequired: 'El nombre es requerido'
    },
    en: {
      title: 'Edit Client',
      firstNameLabel: 'Applicant First Name',
      lastNameLabel: 'Applicant Last Name',
      nameLabel: 'Legal Business Name and DBA *',
      legalStructureLabel: 'Legal Structure',
      feinLabel: 'FEIN',
      addressLabel: 'Physical Address',
      contactLabel: 'Contact (Phone / Email)',
      cancelBtn: 'Cancel',
      saveBtn: 'Save Changes',
      savingBtn: 'Saving...',
      successMsg: 'Client updated successfully',
      errorMsg: 'Error updating client',
      nameRequired: 'Name is required'
    }
  }[lang]

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    name: '',
    legal_structure: '',
    fein: '',
    address: '',
    contact: ''
  })

  useEffect(() => {
    if (client && isOpen) {
      setFormData({
        first_name: client.first_name || '',
        last_name: client.last_name || '',
        name: client.name || '',
        legal_structure: client.legal_structure || '',
        fein: client.fein || '',
        address: client.address || '',
        contact: client.contact || ''
      })
    }
  }, [client, isOpen])

  if (!isOpen || !client) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      toast.error(t.nameRequired)
      return
    }

    setIsSubmitting(true)
    const res = await updateClient(client.id, formData)

    if (res.success) {
      toast.success(t.successMsg)
      onSuccess()
    } else {
      toast.error(res.error || t.errorMsg)
    }
    setIsSubmitting(false)
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-card w-full max-w-lg rounded-2xl shadow-2xl border border-border flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h3 className="text-xl font-bold">{t.title}</h3>
          <button onClick={onClose} className="text-muted-foreground hover:bg-muted p-2 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase mb-1 block">{t.firstNameLabel}</label>
              <input 
                type="text" 
                className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none" 
                value={formData.first_name} 
                onChange={e => setFormData({...formData, first_name: e.target.value})} 
              />
            </div>
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase mb-1 block">{t.lastNameLabel}</label>
              <input 
                type="text" 
                className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none" 
                value={formData.last_name} 
                onChange={e => setFormData({...formData, last_name: e.target.value})} 
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase mb-1 block">{t.nameLabel}</label>
            <input 
              type="text" 
              className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none" 
              value={formData.name} 
              onChange={e => setFormData({...formData, name: e.target.value})} 
            />
          </div>
          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase mb-1 block">{t.legalStructureLabel}</label>
            <select 
              className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none" 
              value={formData.legal_structure} 
              onChange={e => setFormData({...formData, legal_structure: e.target.value})} 
            >
              <option value="">{lang === 'es' ? 'Seleccionar...' : 'Select...'}</option>
              {(lang === 'es' 
                ? ['LLC', 'Corporación', 'Corporación S', 'Propietario Único (Sole Prop)', 'Sociedad (Partnership)', 'Sin Fines de Lucro', 'Otra']
                : ['LLC', 'Corporation', 'S Corporation', 'Sole Proprietorship', 'Partnership', 'Non-Profit', 'Other']
              ).map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase mb-1 block">{t.feinLabel}</label>
            <input 
              type="text" 
              className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none" 
              value={formData.fein} 
              onChange={e => setFormData({...formData, fein: e.target.value})} 
            />
          </div>
          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase mb-1 block">{t.addressLabel}</label>
            <input 
              type="text" 
              className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none" 
              value={formData.address} 
              onChange={e => setFormData({...formData, address: e.target.value})} 
            />
          </div>
          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase mb-1 block">{t.contactLabel}</label>
            <input 
              type="text" 
              className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none" 
              value={formData.contact} 
              onChange={e => setFormData({...formData, contact: e.target.value})} 
            />
          </div>
          
          <div className="pt-4 flex justify-end gap-3">
            <button 
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-md font-medium text-muted-foreground hover:bg-muted transition-colors"
            >
              {t.cancelBtn}
            </button>
            <button 
              type="submit"
              disabled={isSubmitting}
              className="bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-2 rounded-md font-medium transition-colors disabled:opacity-50"
            >
              {isSubmitting ? t.savingBtn : t.saveBtn}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
