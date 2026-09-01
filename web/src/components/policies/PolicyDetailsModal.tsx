"use client"

import { X, ShieldCheck, User, Building, MapPin, DollarSign, Calendar, Info } from "lucide-react"

export function PolicyDetailsModal({ isOpen, onClose, policy }: { isOpen: boolean, onClose: () => void, policy: any }) {
  if (!isOpen || !policy) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-card w-full max-w-2xl rounded-2xl shadow-xl border border-border flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border bg-muted/20">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">Detalles de la Póliza</h2>
              <p className="text-sm text-muted-foreground font-mono mt-0.5">{policy.policy_number || 'Borrador sin número'}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-muted-foreground hover:bg-muted rounded-full transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-8">
          
          {/* General Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <span className="text-xs font-semibold uppercase text-muted-foreground flex items-center gap-1.5"><Info className="h-3.5 w-3.5"/> Estado y Tipo</span>
              <p className="font-medium">
                {policy.insurance_type} <span className="text-muted-foreground font-normal">({policy.carrier_id})</span>
              </p>
            </div>
            <div className="space-y-1">
              <span className="text-xs font-semibold uppercase text-muted-foreground flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5"/> Periodo</span>
              <p className="font-medium">Año: {policy.year} / Mes: {policy.month}</p>
            </div>
            <div className="space-y-1">
              <span className="text-xs font-semibold uppercase text-muted-foreground flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5"/> Cobertura</span>
              <p className="font-medium">{policy.coverage || 'No especificada'}</p>
            </div>
            <div className="space-y-1">
              <span className="text-xs font-semibold uppercase text-muted-foreground flex items-center gap-1.5"><User className="h-3.5 w-3.5"/> Vendedor (Agente)</span>
              <p className="font-medium">{policy.agent?.name || 'Agente Desconocido'}</p>
            </div>
          </div>

          <div className="h-px bg-border w-full" />

          {/* Client Details */}
          <div>
            <h3 className="text-sm font-semibold uppercase text-muted-foreground mb-4 flex items-center gap-1.5"><Building className="h-4 w-4"/> Información del Cliente</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-muted/20 p-4 rounded-xl border border-border">
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground">Nombre / Empresa</span>
                <p className="font-medium">
                  {policy.insurance_type === 'Personal' 
                    ? [policy.client_first_name, policy.client_last_name].filter(Boolean).join(" ")
                    : [policy.client_first_name, policy.client_last_name, policy.client_company_name].filter(Boolean).join(" - ")}
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground">Participantes Adicionales</span>
                <p className="font-medium">{policy.participants || '-'}</p>
              </div>
              <div className="space-y-1 md:col-span-2">
                <span className="text-xs text-muted-foreground flex items-center gap-1.5"><MapPin className="h-3 w-3"/> Ubicación</span>
                <p className="font-medium">{[policy.city, policy.state, policy.zip_code].filter(Boolean).join(", ") || 'No especificada'}</p>
              </div>
            </div>
          </div>

          <div className="h-px bg-border w-full" />

          {/* Financials */}
          <div>
            <h3 className="text-sm font-semibold uppercase text-muted-foreground mb-4 flex items-center gap-1.5"><DollarSign className="h-4 w-4"/> Finanzas</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-blue-500/10 border border-blue-200/20 p-4 rounded-xl">
                <span className="text-xs font-medium text-blue-600/80 uppercase">Premium</span>
                <p className="text-xl font-bold text-blue-700 dark:text-blue-500">
                  ${Number(policy.premium_amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="bg-emerald-500/10 border border-emerald-200/20 p-4 rounded-xl">
                <span className="text-xs font-medium text-emerald-600/80 uppercase">Comisión ({policy.agency_commission_percentage || 0}%)</span>
                <p className="text-xl font-bold text-emerald-700 dark:text-emerald-500">
                  ${Number(policy.agency_commission_amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border flex justify-end bg-muted/20">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-xl border border-border hover:bg-muted text-sm font-medium transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )
}
