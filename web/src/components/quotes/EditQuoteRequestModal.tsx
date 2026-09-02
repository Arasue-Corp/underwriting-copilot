"use client"

import { useState, useTransition, useEffect, useRef } from 'react'
import { X, Check, AlertCircle } from "lucide-react"
import { toast } from "sonner"
import { updateQuoteRequestData } from "@/app/actions/quote"
import { createClient } from "@/lib/supabase/client"
import { INSURANCE_PRODUCTS, ProductField } from "@/lib/constants/insuranceProducts"

interface EditQuoteRequestModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  quote: any
  language?: 'en' | 'es'
  userRole?: string
}

export function EditQuoteRequestModal({ isOpen, onClose, onSuccess, quote, language = 'es', userRole }: EditQuoteRequestModalProps) {
  const [isPending, startTransition] = useTransition()
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [error, setError] = useState<string | null>(null)
  const [uploadingFiles, setUploadingFiles] = useState<Record<string, boolean>>({})
  const [invalidFields, setInvalidFields] = useState<string[]>([])
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (isOpen && quote) {
      setFormData(quote.form_data || {})
      setError(null)
      setInvalidFields([])
    }
  }, [isOpen, quote])

  if (!isOpen || !quote) return null

  const handleInputChange = (id: string, value: any) => {
    setFormData(prev => ({ ...prev, [id]: value }))
    if (error) setError(null)
    if (invalidFields.includes(id)) {
      setInvalidFields(prev => prev.filter(f => f !== id))
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    
    // Validate required fields based on what is rendered
    const missingFields: string[] = []
    
    const checkRequired = (field: ProductField | any) => {
      if (field.required && field.type !== 'file') {
        if (!formData[field.id] || String(formData[field.id]).trim() === '') {
          missingFields.push(field.id)
        }
      }
    }

    const quoteCategory = formData.general_quote_category || 'commercial'

    // Step 1 general fields
    const requiredStep1: any[] = [
      { id: 'general_first_name', type: 'text', required: true },
      { id: 'general_last_name', type: 'text', required: true },
      { id: 'general_contact', type: 'text', required: true },
      { id: 'general_address', type: 'text', required: true },
    ]

    if (quoteCategory === 'commercial') {
      requiredStep1.push(
        { id: 'general_client_name', type: 'text', required: true },
        { id: 'general_legal_structure', type: 'select', required: true },
        { id: 'general_fein', type: 'text', required: true },
        { id: 'general_operations', type: 'textarea', required: true },
        { id: 'general_experience_years', type: 'number', required: true },
      )
    } else {
      requiredStep1.push(
        { id: 'general_dob', type: 'text', required: true }
      )
    }
    
    requiredStep1.forEach(checkRequired)

    // Product specific fields
    const quoteProducts = quote.products || []
    const selectedProducts = INSURANCE_PRODUCTS.filter(p => quoteProducts.includes(p.name) || quoteProducts.includes(p.nameEn) || quoteProducts.includes(p.id))
    
    selectedProducts.forEach(product => {
      product.fields.forEach(checkRequired)
    })

    if (missingFields.length > 0) {
      setInvalidFields(missingFields)
      setError(language === 'es' ? 'Faltan campos obligatorios. Por favor, revísalos.' : 'Missing required fields. Please review.')
      if (formRef.current) formRef.current.scrollTop = 0
      return
    }

    startTransition(async () => {
      try {
        const result = await updateQuoteRequestData(quote.id, formData)
        if (result && !result.success) {
          setError(language === 'es' ? `Hubo un error al actualizar: ${result.error}` : `Error updating: ${result.error}`)
          if (formRef.current) formRef.current.scrollTop = 0
          return
        }
        toast.success(language === 'es' ? "Cotización actualizada exitosamente" : "Quote updated successfully")
        onSuccess()
      } catch (error: any) {
        console.error(error)
        setError(language === 'es' ? `Hubo un error inesperado: ${error.message || 'Error desconocido'}` : `There was an unexpected error: ${error.message || 'Unknown error'}`)
        if (formRef.current) formRef.current.scrollTop = 0
      }
    })
  }

  const handleFileUpload = async (fieldId: string, file: File) => {
    try {
      setUploadingFiles(prev => ({ ...prev, [fieldId]: true }))
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      const { data: profile } = await supabase.from("profiles").select("agency_id").eq("id", user.id).single()
      if (!profile) throw new Error("Profile not found")

      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
      const filePath = `${profile.agency_id}/${fileName}`

      const { error: uploadError } = await supabase.storage.from('quote-attachments').upload(filePath, file)
      if (uploadError) throw uploadError

      // Register attachment in DB
      await supabase.from('quote_attachments').insert({
        quote_id: quote.id,
        file_path: filePath,
        uploaded_by: user.id
      })

      // Update form data
      handleInputChange(fieldId, filePath)
      toast.success(language === 'es' ? "Archivo subido exitosamente" : "File uploaded successfully")
    } catch (error: any) {
      console.error("Upload error:", error)
      toast.error(language === 'es' ? "Error al subir archivo" : "Error uploading file")
    } finally {
      setUploadingFiles(prev => ({ ...prev, [fieldId]: false }))
    }
  }

  const renderField = (field: ProductField | any) => {
    if (field.type === 'file') {
      const fileValue = formData[field.id]
      const isUploading = uploadingFiles[field.id]
      return (
        <div className="space-y-2 w-full p-3 bg-muted/30 rounded-md border border-input text-sm text-muted-foreground">
          {fileValue ? (
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                  {language === 'es' ? '✓ Archivo adjunto' : '✓ File attached'}
                </span>
                <button 
                  type="button" 
                  onClick={() => handleInputChange(field.id, '')}
                  className="text-destructive hover:underline text-xs font-medium bg-destructive/10 px-2 py-1 rounded-md"
                >
                  {language === 'es' ? 'Eliminar / Cambiar' : 'Remove / Change'}
                </button>
              </div>
              <p className="text-xs text-muted-foreground break-all">{fileValue}</p>
            </div>
          ) : (
            <div>
              <input
                type="file"
                disabled={isUploading}
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileUpload(field.id, e.target.files[0])
                  }
                }}
                className="w-full text-sm text-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              />
              {isUploading && (
                <p className="text-xs text-primary mt-2 flex items-center gap-2">
                  <span className="animate-spin">⏳</span> {language === 'es' ? 'Subiendo archivo...' : 'Uploading file...'}
                </p>
              )}
            </div>
          )}
        </div>
      )
    }

    const value = formData[field.id] || ""
    const isInvalid = invalidFields.includes(field.id)
    const baseClasses = "flex w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    const inputClasses = `${baseClasses} h-10 ${isInvalid ? 'border-destructive ring-destructive/20 focus-visible:ring-destructive' : 'border-input'}`
    
    if (field.type === 'textarea') {
      return (
        <div className="space-y-1 w-full">
          <textarea
            value={value}
            onChange={(e) => {
            let val = e.target.value;
            if (field.id === 'general_dob' || (field.label && field.label.includes('Fecha de Nacimiento')) || (field.labelEn && field.labelEn.includes('DOB'))) {
              val = val.replace(/\D/g, '');
              if (val.length >= 3 && val.length <= 4) {
                val = val.slice(0, 2) + '/' + val.slice(2);
              } else if (val.length > 4) {
                val = val.slice(0, 2) + '/' + val.slice(2, 4) + '/' + val.slice(4, 8);
              }
            }
            handleInputChange(field.id, val);
          }}
            className={`${baseClasses} min-h-[80px] ${isInvalid ? 'border-destructive ring-destructive/20 focus-visible:ring-destructive' : 'border-input'}`}
            placeholder={language === 'es' ? field.label : field.labelEn}
          />
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
            onChange={(e) => {
            let val = e.target.value;
            if (field.id === 'general_dob' || (field.label && field.label.includes('Fecha de Nacimiento')) || (field.labelEn && field.labelEn.includes('DOB'))) {
              val = val.replace(/\D/g, '');
              if (val.length >= 3 && val.length <= 4) {
                val = val.slice(0, 2) + '/' + val.slice(2);
              } else if (val.length > 4) {
                val = val.slice(0, 2) + '/' + val.slice(2, 4) + '/' + val.slice(4, 8);
              }
            }
            handleInputChange(field.id, val);
          }}
            className={inputClasses}
          >
            <option value="">{language === 'es' ? 'Seleccionar...' : 'Select...'}</option>
            {options?.map((opt: string) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>
      )
    }

    return (
      <div className="space-y-1 w-full">
        <input
          type={field.type === 'number' ? 'number' : 'text'}
          value={value}
          onChange={(e) => {
            let val = e.target.value;
            if (field.id === 'general_dob' || (field.label && field.label.includes('Fecha de Nacimiento')) || (field.labelEn && field.labelEn.includes('DOB'))) {
              val = val.replace(/\D/g, '');
              if (val.length >= 3 && val.length <= 4) {
                val = val.slice(0, 2) + '/' + val.slice(2);
              } else if (val.length > 4) {
                val = val.slice(0, 2) + '/' + val.slice(2, 4) + '/' + val.slice(4, 8);
              }
            }
            handleInputChange(field.id, val);
          }}
          className={inputClasses}
          placeholder={language === 'es' ? field.label : field.labelEn}
        />
      </div>
    )
  }

  const quoteProducts = quote.products || []
  const selectedProducts = INSURANCE_PRODUCTS.filter(p => quoteProducts.includes(p.name) || quoteProducts.includes(p.nameEn) || quoteProducts.includes(p.id))
  const quoteCategory = formData.general_quote_category || 'commercial'

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 sm:p-6 overflow-hidden">
      <div className="relative w-full max-w-3xl max-h-full flex flex-col rounded-xl border border-border bg-card shadow-lg">
        {/* Header */}
        <div className="flex-none flex items-center justify-between border-b border-border p-6 bg-card z-10 rounded-t-xl">
          <div className="pr-8">
            <h2 className="text-xl font-bold leading-none tracking-tight text-foreground">
              {language === 'es' ? 'Editar Solicitud' : 'Edit Request'}
            </h2>
            <p className="text-sm text-muted-foreground mt-2">
              {quote.client_name} - {quote.carrier_id}
            </p>
          </div>
          <button onClick={onClose} className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring shrink-0">
            <X className="h-6 w-6 text-foreground" />
          </button>
        </div>
        
        <form id="edit-quote-form" ref={formRef} onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6" noValidate>
          
          {error && (
            <div className="mb-6 p-4 bg-destructive/15 text-destructive rounded-lg flex items-start space-x-3 border border-destructive/30">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <div className="text-sm whitespace-pre-wrap font-medium">{error}</div>
            </div>
          )}

          <div className="space-y-8">
            {userRole === 'ADMIN' && (
              <div className="mb-4 p-4 bg-primary/5 border border-primary/20 rounded-xl space-y-4">
                <h4 className="text-sm font-semibold text-primary">{language === 'es' ? 'Opciones de Administrador' : 'Admin Options'}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">{language === 'es' ? 'Fecha de Creación (Cotización)' : 'Creation Date (Quote)'}</label>
                    <input 
                      type="date" 
                      value={formData.admin_created_at || (quote?.created_at ? new Date(quote.created_at).toISOString().split('T')[0] : '')}
                      onChange={(e) => handleInputChange('admin_created_at', e.target.value)}
                      className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">{language === 'es' ? 'Fecha de Aceptación (Propuesta)' : 'Accepted Date (Proposal)'}</label>
                    <input 
                      type="date" 
                      value={formData.admin_accepted_at || (quote?.accepted_at ? new Date(quote.accepted_at).toISOString().split('T')[0] : '')}
                      onChange={(e) => handleInputChange('admin_accepted_at', e.target.value)}
                      className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    />
                  </div>
                </div>
              </div>
            )}
            
            {/* General Info */}
            <div>
              <h3 className="text-lg font-semibold mb-4 border-b pb-2">
                {language === 'es' ? 'Información General' : 'General Information'}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    {language === 'es' ? 'Nombre del Solicitante' : 'Applicant First Name'}
                  </label>
                  {renderField({ id: 'general_first_name', type: 'text', required: true })}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    {language === 'es' ? 'Apellido del Solicitante' : 'Applicant Last Name'}
                  </label>
                  {renderField({ id: 'general_last_name', type: 'text', required: true })}
                </div>

                {quoteCategory === 'commercial' && (
                  <>
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
                      {renderField({ 
                        id: 'general_legal_structure', 
                        type: 'select', 
                        required: true,
                        options: ['LLC', 'Corporación', 'Corporación S', 'Propietario Único (Sole Prop)', 'Sociedad (Partnership)', 'Sin Fines de Lucro', 'Otra'],
                        optionsEn: ['LLC', 'Corporation', 'S Corporation', 'Sole Proprietorship', 'Partnership', 'Non-Profit', 'Other']
                      })}
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">FEIN</label>
                      {renderField({ id: 'general_fein', type: 'text', required: true })}
                    </div>
                  </>
                )}

                {quoteCategory === 'personal' && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      {language === 'es' ? 'Fecha de Nacimiento' : 'Date of Birth'}
                    </label>
                    {renderField({ id: 'general_dob', type: 'text', required: true })}
                  </div>
                )}

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

                {quoteCategory === 'commercial' && (
                  <>
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
                  </>
                )}
              </div>
            </div>

            {/* Product Specific Info */}
            {selectedProducts.map(product => (
              <div key={product.id} className="bg-muted/30 p-5 rounded-xl border border-border">
                <h4 className="font-bold text-foreground mb-4">
                  {language === 'es' ? product.name : product.nameEn}
                </h4>
                <div className="grid grid-cols-1 gap-4">
                  {product.fields.map(field => (
                    <div key={field.id} className="space-y-2">
                      <label className="text-sm font-medium">
                        {language === 'es' ? field.label : field.labelEn}
                        {!field.required && (
                          <span className="text-muted-foreground font-normal ml-1">
                            ({language === 'es' ? 'Opcional' : 'Optional'})
                          </span>
                        )}
                      </label>
                      {renderField(field)}
                    </div>
                  ))}
                </div>
              </div>
            ))}

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

        </form>

        {/* Footer Navigation */}
        <div className="flex-none mt-auto p-4 border-t border-border flex justify-end items-center bg-card rounded-b-xl z-10 space-x-3">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground font-medium border border-transparent hover:border-border rounded-md">
            {language === 'es' ? 'Cancelar' : 'Cancel'}
          </button>
          
          <button 
            type="submit" 
            form="edit-quote-form"
            disabled={isPending}
            className="inline-flex items-center px-6 py-2 bg-primary text-primary-foreground rounded-md text-sm font-bold hover:bg-primary/90 disabled:opacity-50"
          >
            {isPending ? (language === 'es' ? 'Guardando...' : 'Saving...') : (language === 'es' ? 'Guardar Cambios' : 'Save Changes')}
          </button>
        </div>
      </div>
    </div>
  )
}
