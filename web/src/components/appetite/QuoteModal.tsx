"use client"

import { useState, useTransition } from "react"
import { X, ChevronRight, ChevronLeft, Upload, Check } from "lucide-react"
import { submitQuoteRequest } from "@/app/actions/quote"
import { INSURANCE_PRODUCTS, InsuranceProduct, ProductField } from "@/lib/constants/insuranceProducts"

interface QuoteModalProps {
  isOpen: boolean
  onClose: () => void
  rule: any
}

export function QuoteModal({ isOpen, onClose, rule }: QuoteModalProps) {
  const [isPending, startTransition] = useTransition()
  const [step, setStep] = useState(1)
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([])
  const [formData, setFormData] = useState<Record<string, string>>({})
  const [files, setFiles] = useState<Record<string, File>>({})

  if (!isOpen || !rule) return null

  const handleInputChange = (id: string, value: string) => {
    setFormData(prev => ({ ...prev, [id]: value }))
  }

  const handleFileChange = (id: string, file: File | null) => {
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
  }

  const handleNext = () => {
    if (step === 1 && selectedProductIds.length === 0) {
      alert("Por favor selecciona al menos un producto para cotizar.")
      return
    }
    setStep(prev => prev + 1)
  }

  const handleBack = () => {
    setStep(prev => prev - 1)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    startTransition(async () => {
      try {
        const submitData = new FormData()
        submitData.append("client_name", formData.general_client_name || "")
        submitData.append("carrier_name", rule.carrier_name)
        submitData.append("products", JSON.stringify(selectedProductIds.map(id => {
          const p = INSURANCE_PRODUCTS.find(x => x.id === id)
          return p ? p.name : id
        })))
        submitData.append("form_data", JSON.stringify(formData))

        // Append files
        Object.entries(files).forEach(([key, file]) => {
          submitData.append(key, file)
        })

        await submitQuoteRequest(submitData)
        alert("Cotización solicitada exitosamente")
        onClose()
      } catch (error) {
        console.error(error)
        alert("Hubo un error al solicitar la cotización.")
      }
    })
  }

  const selectedProducts = INSURANCE_PRODUCTS.filter(p => selectedProductIds.includes(p.id))

  const renderField = (field: ProductField | any) => {
    const value = formData[field.id] || ""
    
    if (field.type === 'textarea') {
      return (
        <textarea
          id={field.id}
          value={value}
          onChange={(e) => handleInputChange(field.id, e.target.value)}
          required={field.required}
          className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      )
    }

    if (field.type === 'select') {
      return (
        <select
          id={field.id}
          value={value}
          onChange={(e) => handleInputChange(field.id, e.target.value)}
          required={field.required}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <option value="">Selecciona una opción</option>
          {field.options?.map((opt: string) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      )
    }

    if (field.type === 'boolean') {
      return (
        <select
          id={field.id}
          value={value}
          onChange={(e) => handleInputChange(field.id, e.target.value)}
          required={field.required}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <option value="">Selecciona...</option>
          <option value="Si">Sí</option>
          <option value="No">No</option>
        </select>
      )
    }

    if (field.type === 'file') {
      return (
        <input
          id={field.id}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={(e) => handleFileChange(field.id, e.target.files?.[0] || null)}
          required={field.required}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-primary file:text-primary-foreground file:px-4 file:py-1 file:rounded-md file:mr-4 file:text-xs file:font-medium hover:file:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      )
    }

    return (
      <input
        id={field.id}
        type={field.type === 'number' ? 'number' : 'text'}
        value={value}
        onChange={(e) => handleInputChange(field.id, e.target.value)}
        required={field.required}
        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      />
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-3xl rounded-xl border border-border bg-card shadow-lg my-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border p-6 sticky top-0 bg-card z-10 rounded-t-xl">
          <div>
            <h2 className="text-xl font-bold leading-none tracking-tight text-foreground">Solicitar Cotización</h2>
            <p className="text-sm text-muted-foreground mt-2">
              Para {rule.carrier_name} - {rule.business_class || rule.industry_name}
            </p>
          </div>
          <button onClick={onClose} className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring">
            <X className="h-6 w-6 text-foreground" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          
          {/* Step 1: General Info & Product Selection */}
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <div>
                <h3 className="text-lg font-semibold mb-4">Información General (Obligatoria)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Nombre Legal de la Empresa y DBA</label>
                    {renderField({ id: 'general_client_name', type: 'text', required: true })}
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Estructura Legal</label>
                    {renderField({ id: 'general_legal_structure', type: 'text', required: true })}
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">FEIN</label>
                    {renderField({ id: 'general_fein', type: 'text', required: true })}
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Medio de Contacto (Tel o Email)</label>
                    {renderField({ id: 'general_contact', type: 'text', required: true })}
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium">Dirección Física (Dirección, ZIP, Ciudad, Estado)</label>
                    {renderField({ id: 'general_address', type: 'text', required: true })}
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium">Descripción Detallada de las Operaciones</label>
                    {renderField({ id: 'general_operations', type: 'textarea', required: true })}
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Años de Experiencia en la Industria</label>
                    {renderField({ id: 'general_experience_years', type: 'number', required: true })}
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Historial de Siniestralidad (Loss Runs)</label>
                    {renderField({ id: 'general_loss_runs', type: 'file' })}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-border">
                <h3 className="text-lg font-semibold mb-4">¿Qué productos necesitas cotizar?</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-64 overflow-y-auto pr-2">
                  {INSURANCE_PRODUCTS.map(product => (
                    <label key={product.id} className={`flex items-start space-x-3 p-3 rounded-lg border cursor-pointer transition-colors ${selectedProductIds.includes(product.id) ? 'bg-primary/10 border-primary' : 'hover:bg-muted'}`}>
                      <input 
                        type="checkbox" 
                        className="mt-1 w-4 h-4 text-primary" 
                        checked={selectedProductIds.includes(product.id)}
                        onChange={() => toggleProduct(product.id)}
                      />
                      <div>
                        <p className="font-medium text-sm">{product.name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{product.description}</p>
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
              <h3 className="text-lg font-semibold border-b pb-2">Detalles Específicos por Producto</h3>
              
              {selectedProducts.map(product => (
                <div key={product.id} className="bg-muted/30 p-5 rounded-xl border border-border">
                  <h4 className="font-bold text-primary mb-4 flex items-center gap-2">
                    <Check className="w-4 h-4" /> {product.name}
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {product.fields.map(field => (
                      <div key={field.id} className={`space-y-2 ${field.type === 'textarea' || field.type === 'file' ? 'md:col-span-2' : ''}`}>
                        <label className="text-sm font-medium text-foreground">{field.label}</label>
                        {renderField(field)}
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              <div className="bg-muted/30 p-5 rounded-xl border border-border">
                <h4 className="font-bold text-foreground mb-4">Campos Personalizados o Notas Adicionales</h4>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Añade cualquier información adicional requerida para esta cotización específica</label>
                  {renderField({ id: 'custom_notes', type: 'textarea' })}
                </div>
              </div>
            </div>
          )}

          {/* Footer Navigation */}
          <div className="mt-8 pt-4 border-t border-border flex justify-between items-center sticky bottom-0 bg-card z-10">
            {step > 1 ? (
              <button 
                type="button" 
                onClick={handleBack}
                className="inline-flex items-center px-4 py-2 border border-input rounded-md text-sm font-medium hover:bg-accent"
              >
                <ChevronLeft className="w-4 h-4 mr-2" /> Atrás
              </button>
            ) : (
              <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground font-medium">
                Cancelar
              </button>
            )}
            
            {step < 2 ? (
              <button 
                type="button" 
                onClick={handleNext}
                className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90"
              >
                Siguiente <ChevronRight className="w-4 h-4 ml-2" />
              </button>
            ) : (
              <button 
                type="submit" 
                disabled={isPending}
                className="inline-flex items-center px-6 py-2 bg-primary text-primary-foreground rounded-md text-sm font-bold hover:bg-primary/90 disabled:opacity-50"
              >
                {isPending ? "Procesando..." : "Enviar Cotización"}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}
