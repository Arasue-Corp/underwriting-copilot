"use client"

import { useState, useTransition } from "react"
import { X } from "lucide-react"
import { submitQuoteRequest } from "@/app/actions/quote"

interface QuoteModalProps {
  isOpen: boolean
  onClose: () => void
  rule: any
}

export function QuoteModal({ isOpen, onClose, rule }: QuoteModalProps) {
  const [isPending, startTransition] = useTransition()

  if (!isOpen || !rule) return null

  const handleAction = (formData: FormData) => {
    startTransition(async () => {
      try {
        await submitQuoteRequest(formData)
        alert("Cotización solicitada exitosamente")
        onClose()
      } catch (error) {
        console.error(error)
        alert("Hubo un error al solicitar la cotización.")
      }
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="relative w-full max-w-lg rounded-xl border border-border bg-card shadow-lg sm:max-w-[425px]">
        <div className="flex items-center justify-between border-b border-border p-6">
          <div>
            <h2 className="text-lg font-semibold leading-none tracking-tight text-foreground">Solicitar Cotización</h2>
            <p className="text-sm text-muted-foreground mt-1">Para {rule.carrier_name} - {rule.business_class || rule.industry_name}</p>
          </div>
          <button onClick={onClose} className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
            <X className="h-4 w-4 text-foreground" />
            <span className="sr-only">Cerrar</span>
          </button>
        </div>
        
        <form action={handleAction} className="p-6 pt-4 space-y-4">
          <input type="hidden" name="carrier_name" value={rule.carrier_name} />
          
          <div className="space-y-2">
            <label htmlFor="client_name" className="text-sm font-medium leading-none text-foreground">Nombre del Cliente</label>
            <input 
              id="client_name" 
              name="client_name"
              required
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50" 
              placeholder="Ej. Acme Corp" 
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="coverage" className="text-sm font-medium leading-none text-foreground">Cobertura Requerida</label>
            <input 
              id="coverage" 
              name="coverage"
              required
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50" 
              placeholder={`Ej. GL ${rule.coverage_limits || '1M/2M'}`} 
              defaultValue={rule.coverage_limits && rule.coverage_limits !== "N/A" ? rule.coverage_limits : ""}
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="notes" className="text-sm font-medium leading-none text-foreground">Notas Adicionales</label>
            <textarea 
              id="notes" 
              name="notes"
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50" 
              placeholder="Cualquier información adicional para el manager..."
            />
          </div>

          <div className="pt-4 flex justify-end space-x-2">
            <button 
              type="button"
              onClick={onClose}
              className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
            >
              Cancelar
            </button>
            <button 
              type="submit"
              disabled={isPending}
              className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 disabled:opacity-50"
            >
              {isPending ? "Enviando..." : "Enviar Solicitud"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
