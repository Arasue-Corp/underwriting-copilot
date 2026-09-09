"use client"

import { useState } from "react"
import { 
  X, 
  Calendar, 
  Clock, 
  MapPin, 
  Phone, 
  Mail, 
  Video, 
  User, 
  Briefcase, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  History, 
  Users, 
  Sparkles,
  Building2,
  CalendarClock
} from "lucide-react"

interface VisitDetailDrawerProps {
  visit: any | null
  isOpen: boolean
  onClose: () => void
  onStatusChange: (id: string, newStatus: string) => void
  onAssignChange: (id: string, newAssignee: string) => void
  onShowLogs: () => void
  agents: any[]
  userProfile: any
  lang?: string
}

export function VisitDetailDrawer({
  visit,
  isOpen,
  onClose,
  onStatusChange,
  onAssignChange,
  onShowLogs,
  agents,
  userProfile,
  lang = "es"
}: VisitDetailDrawerProps) {
  if (!isOpen || !visit) return null

  const isManager = userProfile?.role === "MANAGER" || userProfile?.role === "ADMIN" || userProfile?.role === "DEMO"

  const methodLabels: Record<string, { label: string; icon: any }> = {
    CALL: { label: lang === "es" ? "Llamada Telefónica" : "Phone Call", icon: Phone },
    IN_PERSON: { label: lang === "es" ? "Reunión Presencial" : "In-Person Meeting", icon: MapPin },
    EMAIL: { label: lang === "es" ? "Correo Electrónico" : "Email", icon: Mail },
    VIDEO_CALL: { label: lang === "es" ? "Videollamada" : "Video Call", icon: Video },
    OTHER: { label: visit.contact_method_other || (lang === "es" ? "Otro" : "Other"), icon: Briefcase }
  }

  const reasonLabels: Record<string, string> = {
    FOLLOW_UP: lang === "es" ? "Seguimiento Comercial" : "Commercial Follow-up",
    INTERVIEW: lang === "es" ? "Entrevista Inicial" : "Initial Interview",
    SCOUTING: lang === "es" ? "Prospección / Scouting" : "Prospecting / Scouting",
    PROPOSAL: lang === "es" ? "Presentación de Propuesta" : "Proposal Presentation",
    OTHER: visit.contact_reason_other || (lang === "es" ? "Otro Motivo" : "Other Reason")
  }

  const methodInfo = visit.contact_method ? methodLabels[visit.contact_method] || methodLabels.OTHER : null
  const MethodIcon = methodInfo?.icon || Calendar

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div 
        onClick={onClose} 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 animate-in fade-in" 
      />

      {/* Slide-over panel */}
      <div className="relative w-full max-w-xl bg-card border-l border-border shadow-2xl h-full flex flex-col z-10 overflow-hidden animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="p-6 border-b border-border bg-card/60 backdrop-blur-xl flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider border ${
                visit.status === 'COMPLETED'
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                  : visit.status === 'CANCELED'
                  ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30'
                  : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30'
              }`}>
                {visit.status === 'COMPLETED' ? 'Completada' : visit.status === 'CANCELED' ? 'Cancelada' : 'Pendiente'}
              </span>
              {visit.contact_reason && (
                <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full font-medium border border-border">
                  {reasonLabels[visit.contact_reason] || visit.contact_reason}
                </span>
              )}
            </div>
            <h3 className="text-xl font-bold tracking-tight text-foreground">
              {visit.client ? visit.client.name : "Cliente no registrado"}
            </h3>
            {visit.client?.address && (
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <MapPin className="w-3 h-3 shrink-0" />
                {visit.client.address}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            {(userProfile?.role === "ADMIN" || userProfile?.role === "DEMO") && (
              <button
                onClick={onShowLogs}
                title="Ver auditoría"
                className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg border border-border transition"
              >
                <History className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg border border-border transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Quick Info Grid */}
          <div className="grid grid-cols-2 gap-3 p-4 rounded-xl bg-muted/40 border border-border/60">
            <div>
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                Fecha de Actividad
              </span>
              <p className="text-sm font-medium text-foreground flex items-center gap-1.5 mt-0.5">
                <Calendar className="w-3.5 h-3.5 text-primary" />
                {visit.visit_date
                  ? new Date(visit.visit_date).toLocaleString(lang === "es" ? "es-MX" : "en-US", {
                      dateStyle: "medium",
                      timeStyle: "short"
                    })
                  : new Date(visit.created_at).toLocaleString()}
              </p>
            </div>

            {methodInfo && (
              <div>
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                  Método de Contacto
                </span>
                <p className="text-sm font-medium text-foreground flex items-center gap-1.5 mt-0.5">
                  <MethodIcon className="w-3.5 h-3.5 text-primary" />
                  {methodInfo.label}
                </p>
              </div>
            )}

            {visit.business_hours && (
              <div>
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                  Horario Comercial
                </span>
                <p className="text-sm font-medium text-foreground mt-0.5">
                  {visit.business_hours}
                </p>
              </div>
            )}

            {visit.next_visit_date && (
              <div>
                <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider block">
                  Próximo Seguimiento
                </span>
                <p className="text-sm font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1.5 mt-0.5">
                  <CalendarClock className="w-3.5 h-3.5" />
                  {new Date(visit.next_visit_date).toLocaleString(lang === "es" ? "es-MX" : "en-US", {
                    dateStyle: "medium",
                    timeStyle: "short"
                  })}
                </p>
              </div>
            )}
          </div>

          {/* Notes Section */}
          {visit.conversation_notes && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-primary" />
                Notas de la Conversación
              </h4>
              <div className="p-4 rounded-xl bg-card border border-border text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed shadow-sm">
                {visit.conversation_notes}
              </div>
            </div>
          )}

          {/* Requirements & Opportunities */}
          {visit.detected_requirements && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Requerimientos Detectados / Oportunidades
              </h4>
              <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed">
                {visit.detected_requirements}
              </div>
            </div>
          )}

          {/* Additional Notes */}
          {visit.additional_notes && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Notas Adicionales del Agente
              </h4>
              <div className="p-4 rounded-xl bg-muted/30 border border-border text-xs text-muted-foreground whitespace-pre-wrap leading-relaxed">
                {visit.additional_notes}
              </div>
            </div>
          )}

          {/* Policies Needed */}
          {visit.policies_needed && visit.policies_needed.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-primary" />
                Pólizas Sugeridas o Requeridas
              </h4>
              <div className="flex flex-wrap gap-2">
                {visit.policies_needed.map((pol: string, idx: number) => (
                  <span 
                    key={idx} 
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold bg-primary/10 text-primary border border-primary/20"
                  >
                    {pol}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Representatives */}
          {visit.representatives && (visit.representatives.receptionist || visit.representatives.manager || visit.representatives.owner) && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-primary" />
                Representantes de la Empresa
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                {visit.representatives.receptionist && (
                  <div className="p-3 rounded-lg bg-card border border-border">
                    <span className="text-[10px] text-muted-foreground uppercase font-bold block">Recepcionista</span>
                    <span className="font-semibold text-foreground mt-0.5 block">{visit.representatives.receptionist}</span>
                  </div>
                )}
                {visit.representatives.manager && (
                  <div className="p-3 rounded-lg bg-card border border-border">
                    <span className="text-[10px] text-muted-foreground uppercase font-bold block">Gerente</span>
                    <span className="font-semibold text-foreground mt-0.5 block">{visit.representatives.manager}</span>
                  </div>
                )}
                {visit.representatives.owner && (
                  <div className="p-3 rounded-lg bg-card border border-border">
                    <span className="text-[10px] text-muted-foreground uppercase font-bold block">Dueño / Titular</span>
                    <span className="font-semibold text-foreground mt-0.5 block">{visit.representatives.owner}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Assignment & Status Controls */}
          <div className="p-4 rounded-xl border border-border bg-card space-y-4 shadow-sm">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Gestión de Estado y Asignación
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">
                  Estado de la Entrada
                </label>
                <select
                  value={visit.status}
                  onChange={(e) => onStatusChange(visit.id, e.target.value)}
                  className={`w-full text-xs font-bold px-3 py-2 rounded-lg border outline-none cursor-pointer ${
                    visit.status === "COMPLETED"
                      ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
                      : visit.status === "CANCELED"
                      ? "bg-rose-500/10 text-rose-600 border-rose-500/30"
                      : "bg-amber-500/10 text-amber-600 border-amber-500/30"
                  }`}
                >
                  <option value="PENDING">Pendiente</option>
                  <option value="COMPLETED">Completada</option>
                  <option value="CANCELED">Cancelada</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">
                  Asignado a
                </label>
                {isManager ? (
                  <select
                    value={visit.assigned_to || "none"}
                    onChange={(e) => onAssignChange(visit.id, e.target.value)}
                    className="w-full text-xs font-semibold px-3 py-2 rounded-lg border border-input bg-background outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="none">-- Sin asignar --</option>
                    {agents.map((a: any) => (
                      <option key={a.id} value={a.id}>
                        {a.id === userProfile?.id ? `${a.name} (Yo)` : a.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="text-xs font-semibold py-2 text-foreground">
                    {visit.assigned_to === userProfile?.id ? "Yo (Agente)" : (visit.assignee?.name || "Sin asignar")}
                  </p>
                )}
              </div>
            </div>

            <div className="text-[11px] text-muted-foreground/80 pt-2 border-t border-border flex items-center justify-between">
              <span>Registrado por: <strong className="text-foreground">{visit.creator?.name || "Desconocido"}</strong></span>
              <span>ID: <code className="font-mono text-[10px]">{visit.id?.slice(0, 8)}</code></span>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border bg-muted/20 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-medium text-foreground hover:bg-muted border border-border transition"
          >
            Cerrar Ficha
          </button>
        </div>
      </div>
    </div>
  )
}
