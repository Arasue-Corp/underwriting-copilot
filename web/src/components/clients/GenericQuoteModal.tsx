"use client"

import { useState, useTransition, useEffect, useRef } from 'react'
import { X, ChevronRight, ChevronLeft, Upload, Check, AlertCircle, Users } from "lucide-react"
import { toast } from "sonner"
import { submitQuoteRequest } from "@/app/actions/quote"
import { getClients } from "@/app/actions/clients"
import { INSURANCE_PRODUCTS, InsuranceProduct, ProductField } from "@/lib/constants/insuranceProducts"

interface GenericQuoteModalProps {
  isOpen: boolean
  onClose: () => void
  language?: 'en' | 'es'
  initialClientId?: string | null
}

export function GenericQuoteModal({ isOpen, onClose, language = 'es', initialClientId = null }: GenericQuoteModalProps) {
  const [isPending, startTransition] = useTransition()
  const [step, setStep] = useState(1)
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([])
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [files, setFiles] = useState<Record<string, File>>({})
  const [error, setError] = useState<string | null>(null)
  const [invalidFields, setInvalidFields] = useState<string[]>([])
  const [clients, setClients] = useState<any[]>([])
  const [selectedClientId, setSelectedClientId] = useState<string | null>(initialClientId)
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (isOpen) {
      getClients().then(res => {
        if (res.success && res.data) {
          setClients(res.data)
        }
      })
    }
  }, [isOpen])

  useEffect(() => {
    if (selectedClientId && clients.length > 0) {
      const client = clients.find(c => c.id === selectedClientId)
      if (client) {
        setFormData(prev => ({
          ...prev,
          general_client_name: client.name,
          general_legal_structure: client.legal_structure || "",
          general_fein: client.fein || "",
          general_contact: client.contact || "",
          general_address: client.address || ""
        }))
        // clear errors for these fields
        setInvalidFields(prev => prev.filter(f => !['general_client_name', 'general_legal_structure', 'general_fein', 'general_contact', 'general_address'].includes(f)))
      }
    } else if (selectedClientId === 'new') {
      // Clear specific fields if "new client" is selected
      setFormData(prev => ({
        ...prev,
        general_client_name: "",
        general_legal_structure: "",
        general_fein: "",
        general_contact: "",
        general_address: ""
      }))
    }
  }, [selectedClientId, clients])

  if (!isOpen) return null

  const handleInputChange = (id: string, value: any) => {
    setFormData(prev => ({ ...prev, [id]: value }))
    if (error) setError(null)
    if (invalidFields.includes(id)) {
      setInvalidFields(prev => prev.filter(f => f !== id))
    }
  }

  const handleFileChange = (id: string, file: File | null) => {
    if (error) setError(null)
    if (invalidFields.includes(id)) {
      setInvalidFields(prev => prev.filter(f => f !== id))
    }
    if (file) {
      setFiles(prev => ({ ...prev, [id]: file }))
    } else {
      const newFiles = { ...files }
      delete newFiles[id]
      setFiles(newFiles)
    }
  }

  const toggleProduct = (id: string) => {
    setSelectedProductIds(prev => 
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    )
    if (error) setError(null)
  }

  const handleBack = () => {
    setStep(prev => prev - 1)
    setError(null)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    
    if (step === 1) {
      // Validate step 1 manually
      const requiredStep1 = [
        { id: 'general_client_name', label: language === 'es' ? 'Nombre Legal de la Empresa y DBA' : 'Legal Business Name and DBA' },
        { id: 'general_legal_structure', label: language === 'es' ? 'Estructura Legal' : 'Legal Structure' },
        { id: 'general_fein', label: 'FEIN' },
        { id: 'general_contact', label: language === 'es' ? 'Medio de Contacto (Tel o Email)' : 'Contact Method (Phone or Email)' },
        { id: 'general_address', label: language === 'es' ? 'Dirección Física' : 'Physical Address' },
        { id: 'general_operations', label: language === 'es' ? 'Descripción Detallada de las Operaciones' : 'Detailed Operations Description' },
        { id: 'general_experience_years', label: language === 'es' ? 'Años de Experiencia en la Industria' : 'Years of Industry Experience' },
      ]
      
      const missingFields = requiredStep1.filter(f => !formData[f.id] || String(formData[f.id]).trim() === '')
      if (missingFields.length > 0) {
        setInvalidFields(missingFields.map(m => m.id))
        setError(language === 'es' ? `Faltan campos obligatorios:\n${missingFields.map(m => '- ' + m.label).join('\n')}` : `Missing required fields:\n${missingFields.map(m => '- ' + m.label).join('\n')}`)
        return
      }

      if (selectedProductIds.length === 0) {
        setError(language === 'es' ? "Por favor selecciona al menos un producto para cotizar." : "Please select at least one product to quote.")
        return
      }
      setInvalidFields([])
      setStep(2)
      // Scroll to top
      setTimeout(() => { if (formRef.current) formRef.current.scrollTop = 0 }, 10)
      return
    }

    // Validate step 2 manually
    // For generic quote, we just check if there's any file or note (optional)
    setInvalidFields([])

    startTransition(async () => {
      try {
        const submitData = new FormData()
        submitData.append("client_name", formData.general_client_name || "")
        submitData.append("carrier_name", "Genérica")
        submitData.append("products", JSON.stringify(selectedProductIds.map(id => {
          const p = INSURANCE_PRODUCTS.find(x => x.id === id)
          return p ? p.name : id
        })))
        submitData.append("form_data", JSON.stringify(formData))

        // Append files
        Object.entries(files).forEach(([key, file]) => {
          submitData.append(key, file)
        })

        const result = await submitQuoteRequest(submitData)
        if (result && !result.success) {
          setError(language === 'es' ? `Hubo un error al solicitar la cotización: ${result.error}` : `There was an error requesting the quote: ${result.error}`)
          // Scroll to top to see error
          if (formRef.current) formRef.current.scrollTop = 0
          return
        }
        toast.success(language === 'es' ? "Cotización solicitada exitosamente" : "Quote requested successfully")
        onClose()
      } catch (error: any) {
        console.error(error)
        setError(language === 'es' ? `Hubo un error inesperado: ${error.message || 'Error desconocido'}` : `There was an unexpected error: ${error.message || 'Unknown error'}`)
        if (formRef.current) formRef.current.scrollTop = 0
      }
    })
  }

  const selectedProducts = INSURANCE_PRODUCTS.filter(p => selectedProductIds.includes(p.id))

  const renderField = (field: ProductField | any) => {
    const value = formData[field.id] || ""
    const isInvalid = invalidFields.includes(field.id)
    const baseClasses = "flex w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
    const inputClasses = `${baseClasses} h-10 ${isInvalid ? 'border-destructive ring-destructive/20 focus-visible:ring-destructive' : 'border-input'}`
    
    if (field.type === 'textarea') {
      return (
        <div className="space-y-1 w-full">
          <textarea
            value={value}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            className={`${baseClasses} min-h-[80px] ${isInvalid ? 'border-destructive ring-destructive/20 focus-visible:ring-destructive' : 'border-input'}`}
            placeholder={language === 'es' ? field.label : field.labelEn}
          />
          {isInvalid && <p className="text-[0.8rem] text-destructive">{language === 'es' ? 'Este campo es obligatorio' : 'This field is required'}</p>}
        </div>
      )
    }

    if (field.type === 'select' || field.type === 'boolean') {
      const options = field.type === 'boolean' 
        ? (language === 'es' ? ['Sí', 'No'] : ['Yes', 'No'])
        : (language === 'es' ? field.options : field.optionsEn) || []
      
      return (
        <div className="space-y-1 w-full">
          <select
            value={value}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            className={inputClasses}
          >
            <option value="">{language === 'es' ? 'Seleccionar...' : 'Select...'}</option>
            {options?.map((opt: string) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
          {isInvalid && <p className="text-[0.8rem] text-destructive">{language === 'es' ? 'Este campo es obligatorio' : 'This field is required'}</p>}
        </div>
      )
    }

    if (field.type === 'file') {
      const file = files[field.id]
      return (
        <div className="space-y-1 w-full">
          <div className="flex items-center space-x-2">
            <label className={`cursor-pointer inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 disabled:pointer-events-none h-10 px-4 py-2 border ${isInvalid ? 'border-destructive text-destructive bg-destructive/5 hover:bg-destructive/10' : 'border-input bg-background hover:bg-accent hover:text-accent-foreground'}`}>
              <Upload className="w-4 h-4 mr-2" />
              {file ? (language === 'es' ? 'Cambiar Archivo' : 'Change File') : (language === 'es' ? 'Subir Archivo' : 'Upload File')}
              <input
                type="file"
                className="hidden"
                onChange={(e) => handleFileChange(field.id, e.target.files?.[0] || null)}
                accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.jpeg,.jpg,.png"
              />
            </label>
            {file && (
              <span className="text-sm text-muted-foreground flex items-center">
                <Check className="w-4 h-4 mr-1 text-emerald-500" />
                {file.name}
              </span>
            )}
          </div>
          {isInvalid && <p className="text-[0.8rem] text-destructive">{language === 'es' ? 'Debe subir un archivo' : 'You must upload a file'}</p>}
        </div>
      )
    }

    return (
      <div className="space-y-1 w-full">
        <input
          type={field.type === 'number' ? 'number' : 'text'}
          value={value}
          onChange={(e) => handleInputChange(field.id, e.target.value)}
          className={inputClasses}
          placeholder={language === 'es' ? field.label : field.labelEn}
        />
        {isInvalid && <p className="text-[0.8rem] text-destructive">{language === 'es' ? 'Este campo es obligatorio' : 'This field is required'}</p>}
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 sm:p-6 overflow-hidden">
      <div className="relative w-full max-w-3xl max-h-full flex flex-col rounded-xl border border-border bg-card shadow-lg">
        {/* Header */}
        <div className="flex-none flex items-center justify-between border-b border-border p-6 bg-card z-10 rounded-t-xl">
          <div className="pr-8">
            <h2 className="text-xl font-bold leading-none tracking-tight text-foreground">
              {language === 'es' ? 'Solicitud Genérica' : 'Generic Quote Request'}
            </h2>
            <p className="text-sm text-muted-foreground mt-2">
              {language === 'es' ? 'Esta solicitud se enviará a revisión general' : 'This request will be sent for general review'}
            </p>
          </div>
          <button onClick={onClose} className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring shrink-0">
            <X className="h-6 w-6 text-foreground" />
          </button>
        </div>
        
        <form id="quote-form" ref={formRef} onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6" noValidate>
          
          {error && (
            <div className="mb-6 p-4 bg-destructive/15 text-destructive rounded-lg flex items-start space-x-3 border border-destructive/30">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <div className="text-sm whitespace-pre-wrap font-medium">{error}</div>
            </div>
          )}

          {/* Step 1: General Info & Product Selection */}
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <div>
                <h3 className="text-lg font-semibold mb-4">
                  {language === 'es' ? 'Información General (Obligatoria)' : 'General Information (Required)'}
                </h3>
                
                {/* Client Selection */}
                <div className="mb-6 p-4 bg-muted/20 border border-border/40 rounded-xl space-y-3">
                  <label className="text-sm font-semibold flex items-center gap-2 text-foreground">
                    <Users className="w-4 h-4 text-primary" />
                    {language === 'es' ? 'Cargar cliente existente (Opcional)' : 'Load existing client (Optional)'}
                  </label>
                  <select
                    value={selectedClientId || "new"}
                    onChange={(e) => setSelectedClientId(e.target.value)}
                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <option value="new">{language === 'es' ? '-- Nuevo Cliente --' : '-- New Client --'}</option>
                    {clients.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      {language === 'es' ? 'Nombre Legal de la Empresa y DBA' : 'Legal Business Name and DBA'}
                    </label>
                    {renderField({ id: 'general_client_name', type: 'text', required: true })}
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      {language === 'es' ? 'Estructura Legal' : 'Legal Structure'}
                    </label>
                    {renderField({ id: 'general_legal_structure', type: 'text', required: true })}
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">FEIN</label>
                    {renderField({ id: 'general_fein', type: 'text', required: true })}
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      {language === 'es' ? 'Medio de Contacto (Tel o Email)' : 'Contact Method (Phone or Email)'}
                    </label>
                    {renderField({ id: 'general_contact', type: 'text', required: true })}
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium">
                      {language === 'es' ? 'Dirección Física (Dirección, ZIP, Ciudad, Estado)' : 'Physical Address (Street, ZIP, City, State)'}
                    </label>
                    {renderField({ id: 'general_address', type: 'text', required: true })}
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium">
                      {language === 'es' ? 'Descripción Detallada de las Operaciones' : 'Detailed Operations Description'}
                    </label>
                    {renderField({ id: 'general_operations', type: 'textarea', required: true })}
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      {language === 'es' ? 'Años de Experiencia en la Industria' : 'Years of Industry Experience'}
                    </label>
                    {renderField({ id: 'general_experience_years', type: 'number', required: true })}
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium">
                      {language === 'es' ? 'Historial de Siniestralidad (Loss Runs)' : 'Loss Runs'}
                    </label>
                    {renderField({ id: 'general_loss_runs', type: 'textarea' })}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-border">
                <h3 className="text-lg font-semibold mb-4">
                  {language === 'es' ? '¿Qué productos necesitas cotizar?' : 'What products do you need to quote?'}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-64 overflow-y-auto pr-2">
                  {INSURANCE_PRODUCTS.map(product => (
                    <label key={product.id} className={`flex items-start space-x-3 p-3 rounded-lg border cursor-pointer transition-colors ${selectedProductIds.includes(product.id) ? 'bg-primary/10 border-primary' : 'hover:bg-muted'}`}>
                      <input type="checkbox" className="mt-1 shrink-0" checked={selectedProductIds.includes(product.id)} onChange={() => toggleProduct(product.id)} />
                      <div>
                        <div className="font-medium text-sm">
                          {language === 'es' ? product.name : product.nameEn}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {language === 'es' ? product.description : product.descriptionEn}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Dynamic Product Fields */}
          {step === 2 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
              <h3 className="text-lg font-semibold border-b pb-2">
                {language === 'es' ? 'Detalles Específicos por Producto' : 'Product Specific Details'}
              </h3>
              
              <div className="bg-muted/30 p-5 rounded-xl border border-border">
                <h4 className="font-bold text-foreground mb-4">
                  {language === 'es' ? 'Documentos Adjuntos' : 'Attachments'}
                </h4>
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Acord 130 / 125 / etc.</label>
                    {renderField({ id: 'generic_acord', type: 'file' })}
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Loss Runs</label>
                    {renderField({ id: 'generic_loss_runs', type: 'file' })}
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">{language === 'es' ? 'Otro Documento' : 'Other Document'}</label>
                    {renderField({ id: 'generic_other_doc', type: 'file' })}
                  </div>
                </div>
              </div>

              <div className="bg-muted/30 p-5 rounded-xl border border-border">
                <h4 className="font-bold text-foreground mb-4">
                  {language === 'es' ? 'Campos Personalizados o Notas Adicionales' : 'Custom Fields or Additional Notes'}
                </h4>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    {language === 'es' ? 'Añade cualquier información adicional requerida para esta cotización específica' : 'Add any additional information required for this specific quote'}
                  </label>
                  {renderField({ id: 'custom_notes', type: 'textarea' })}
                </div>
              </div>
            </div>
          )}

        </form>

        {/* Footer Navigation */}
        <div className="flex-none mt-auto p-4 border-t border-border flex justify-between items-center bg-card rounded-b-xl z-10">
          {step > 1 ? (
            <button 
              type="button" 
              onClick={handleBack}
              className="inline-flex items-center px-4 py-2 border border-input rounded-md text-sm font-medium hover:bg-accent"
            >
              <ChevronLeft className="w-4 h-4 mr-2" /> {language === 'es' ? 'Atrás' : 'Back'}
            </button>
          ) : (
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground font-medium">
              {language === 'es' ? 'Cancelar' : 'Cancel'}
            </button>
          )}
          
          {step < 2 ? (
            <button 
              type="submit" 
              form="quote-form"
              className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90"
            >
              {language === 'es' ? 'Siguiente' : 'Next'} <ChevronRight className="w-4 h-4 ml-2" />
            </button>
          ) : (
            <button 
              type="submit" 
              form="quote-form"
              disabled={isPending}
              className="inline-flex items-center px-6 py-2 bg-primary text-primary-foreground rounded-md text-sm font-bold hover:bg-primary/90 disabled:opacity-50"
            >
              {isPending ? (language === 'es' ? 'Procesando...' : 'Processing...') : (language === 'es' ? 'Enviar Cotización' : 'Submit Quote')}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
