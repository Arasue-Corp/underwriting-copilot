"use client"

import { useState, useEffect } from "react"
import { Calendar, User, Clock, CheckCircle2, ChevronRight, Briefcase, Plus, Filter, Users, History, ListTodo } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { getVisits, getAgencyAgents, updateVisit } from "@/app/actions/visits"
import { toast } from "sonner"
import { useLanguage } from "@/components/language-provider"
import { VisitModal } from "@/components/visits/VisitModal"
import { TaskModal } from "@/components/tasks/TaskModal"
import { ActivityLogsModal } from "@/components/logs/ActivityLogsModal"

export default function VisitsPage() {
  const [visits, setVisits] = useState<any[]>([])
  const [agents, setAgents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [userProfile, setUserProfile] = useState<any>(null)
  
  const [isVisitModalOpen, setIsVisitModalOpen] = useState(false)
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false)
  const [logsVisit, setLogsVisit] = useState<any>(null)
  const [clients, setClients] = useState<any[]>([])
  
  const supabase = createClient()
  const langContext = useLanguage()
  const lang = (langContext === 'en' || langContext === 'es') ? langContext : 'es'

  const t = {
    es: {
      title: 'Bitácora & CRM',
      subtitle: 'Gestiona las visitas, llamadas y tareas de seguimiento con clientes.',
      loading: 'Cargando bitácora...',
      empty: 'No hay actividades registradas aún.',
      updating: 'Actualizando...',
      updateSuccess: 'Actividad actualizada',
      updateError: 'Error al actualizar',
      pending: 'Pendientes',
      completed: 'Completadas',
      status: 'Estado',
      assign: 'Asignar a',
      notes: 'Notas de conversación',
      requirements: 'Requerimientos / Oportunidades',
      policies: 'Pólizas Sugeridas',
      contact: 'Representantes',
      me: 'Yo',
      unassigned: 'Sin asignar',
      canceled: 'Cancelada',
      registerVisit: 'Registrar Visita',
      clientDeleted: 'Cliente Eliminado',
      registeredBy: 'Registrado por:'
    },
    en: {
      title: 'CRM & Activity Log',
      subtitle: 'Manage client visits, calls, and follow-up tasks.',
      loading: 'Loading activity log...',
      empty: 'No activities registered yet.',
      updating: 'Updating...',
      updateSuccess: 'Activity updated',
      updateError: 'Error updating',
      pending: 'Pending',
      completed: 'Completed',
      status: 'Status',
      assign: 'Assign to',
      notes: 'Conversation Notes',
      requirements: 'Requirements / Opportunities',
      policies: 'Suggested Policies',
      contact: 'Representatives',
      me: 'Me',
      unassigned: 'Unassigned',
      canceled: 'Canceled',
      registerVisit: 'Log Visit',
      newTask: 'New Task',
      clientDeleted: 'Deleted Client',
      registeredBy: 'Registered by:'
    }
  }[lang]

  const loadData = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single()
      
    setUserProfile(profile)

    const [vData, aData, cDataRes] = await Promise.all([
      getVisits(),
      profile.role !== 'AGENT' ? getAgencyAgents() : Promise.resolve([]),
      supabase.from("clients").select("id, name").eq("agency_id", profile.agency_id).order("name")
    ])

    setVisits(vData)
    setAgents(aData)
    if (cDataRes.data) setClients(cDataRes.data)
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleStatusChange = async (id: string, newStatus: string) => {
    const prev = [...visits]
    setVisits(visits.map(v => v.id === id ? { ...v, status: newStatus } : v))
    const toastId = toast.loading(t.updating)
    const res = await updateVisit(id, { status: newStatus })
    if (res.success) {
      toast.success(t.updateSuccess, { id: toastId })
    } else {
      toast.error(res.error || t.updateError, { id: toastId })
      setVisits(prev)
    }
  }

  const handleAssignChange = async (id: string, newAssignee: string) => {
    const prev = [...visits]
    const assigned_to = newAssignee === 'none' ? null : newAssignee
    setVisits(visits.map(v => v.id === id ? { ...v, assigned_to } : v))
    const toastId = toast.loading(t.updating)
    const res = await updateVisit(id, { assigned_to })
    if (res.success) {
      toast.success(t.updateSuccess, { id: toastId })
    } else {
      toast.error(res.error || t.updateError, { id: toastId })
      setVisits(prev)
    }
  }

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6 relative">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
            <h2 className="text-3xl font-bold tracking-tight">{t.title}</h2>
            <p className="text-muted-foreground text-sm mt-1">{t.subtitle}</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <button 
            onClick={() => setIsTaskModalOpen(true)}
            className="bg-secondary text-secondary-foreground hover:bg-secondary/80 px-4 py-2 rounded-lg font-medium shadow-sm flex items-center justify-center gap-2"
          >
            <ListTodo className="w-4 h-4" />
            {t.newTask}
          </button>
          <button 
            onClick={() => setIsVisitModalOpen(true)}
            className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-lg font-medium shadow-sm flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            {t.registerVisit}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* PENDING COLUMN */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-500" />
              {t.pending}
            </h3>
            <span className="bg-amber-500/10 text-amber-600 font-bold px-2.5 py-0.5 rounded-full text-xs">
              {visits.filter(v => v.status === 'PENDING').length}
            </span>
          </div>

          {loading ? (
            <div className="p-8 border border-border border-dashed rounded-xl text-center text-muted-foreground">{t.loading}</div>
          ) : visits.filter(v => v.status === 'PENDING').length === 0 ? (
            <div className="p-8 border border-border border-dashed rounded-xl text-center text-muted-foreground">{t.empty}</div>
          ) : (
            visits.filter(v => v.status === 'PENDING').map(visit => (
              <VisitCard 
                key={visit.id} 
                visit={visit} 
                t={t} 
                agents={agents} 
                userProfile={userProfile}
                onStatusChange={handleStatusChange}
                onAssignChange={handleAssignChange}
                onShowLogs={() => setLogsVisit(visit)}
              />
            ))
          )}
        </div>

        {/* COMPLETED COLUMN */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              {t.completed}
            </h3>
            <span className="bg-emerald-500/10 text-emerald-600 font-bold px-2.5 py-0.5 rounded-full text-xs">
              {visits.filter(v => v.status === 'COMPLETED').length}
            </span>
          </div>

          {loading ? (
             <div className="p-8 border border-border border-dashed rounded-xl text-center text-muted-foreground">{t.loading}</div>
          ) : visits.filter(v => v.status === 'COMPLETED').length === 0 ? (
             <div className="p-8 border border-border border-dashed rounded-xl text-center text-muted-foreground">{t.empty}</div>
          ) : (
            visits.filter(v => v.status === 'COMPLETED').map(visit => (
              <VisitCard 
                key={visit.id} 
                visit={visit} 
                t={t} 
                agents={agents}
                userProfile={userProfile}
                onStatusChange={handleStatusChange}
                onAssignChange={handleAssignChange}
                onShowLogs={() => setLogsVisit(visit)}
              />
            ))
          )}
        </div>
      </div>
      
      <VisitModal 
        isOpen={isVisitModalOpen} 
        onClose={() => setIsVisitModalOpen(false)} 
        onSuccess={() => {
          setIsVisitModalOpen(false)
          loadData()
        }}
        clients={clients}
      />

      <TaskModal 
        isOpen={isTaskModalOpen} 
        onClose={() => setIsTaskModalOpen(false)} 
        onSuccess={() => {
          setIsTaskModalOpen(false)
          loadData()
        }}
        clients={clients}
        agents={agents}
        userProfile={userProfile}
      />

      <ActivityLogsModal
        isOpen={!!logsVisit}
        onClose={() => setLogsVisit(null)}
        entityType="visits"
        entityId={logsVisit?.id}
        entityName={logsVisit?.client?.name || 'Visita'}
      />
    </div>
  )
}

function VisitCard({ visit, t, agents, userProfile, onStatusChange, onAssignChange, onShowLogs }: any) {
  const isManager = userProfile?.role === 'MANAGER' || userProfile?.role === 'ADMIN'

  return (
    <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-4 hover:border-primary/20 transition-colors">
      <div className="flex justify-between items-start gap-4">
        <div>
          <h4 className="font-bold text-lg text-foreground leading-tight">
            {visit.client ? visit.client.name : t.clientDeleted}
          </h4>
          <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
            <Calendar className="w-3.5 h-3.5" />
            {visit.visit_date ? new Date(visit.visit_date).toLocaleString() : new Date(visit.created_at).toLocaleString()}
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <select 
              value={visit.status}
              onChange={(e) => onStatusChange(visit.id, e.target.value)}
              className={`text-xs font-bold px-2.5 py-1 rounded-md border outline-none cursor-pointer ${
                visit.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30' :
                visit.status === 'CANCELED' ? 'bg-red-500/10 text-red-600 border-red-500/30' :
                'bg-amber-500/10 text-amber-600 border-amber-500/30'
              }`}
            >
              <option value="PENDING">{t.pending}</option>
              <option value="COMPLETED">{t.completed}</option>
              <option value="CANCELED">{t.canceled}</option>
          </select>
          {userProfile?.role === 'ADMIN' && (
            <button 
              onClick={onShowLogs}
              title="Ver registro de actividad"
              className="p-1.5 bg-muted text-muted-foreground hover:bg-muted/80 rounded-md border border-border"
            >
              <History className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
      
      {(visit.contact_method || visit.contact_reason) && (
        <div className="flex gap-2">
          {visit.contact_method && (
            <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded font-medium border border-border">
              {visit.contact_method === 'OTHER' ? visit.contact_method_other : visit.contact_method}
            </span>
          )}
          {visit.contact_reason && (
            <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded font-medium border border-border">
              {visit.contact_reason === 'OTHER' ? visit.contact_reason_other : visit.contact_reason}
            </span>
          )}
        </div>
      )}

      {(visit.conversation_notes || visit.detected_requirements) && (
        <div className="bg-muted/30 rounded-lg p-3 space-y-3 text-sm">
          {visit.conversation_notes && (
            <div>
              <span className="font-semibold block text-xs text-muted-foreground uppercase mb-1">{t.notes}</span>
              <p className="text-foreground/90 whitespace-pre-wrap">{visit.conversation_notes}</p>
            </div>
          )}
          {visit.detected_requirements && (
            <div>
              <span className="font-semibold block text-xs text-muted-foreground uppercase mb-1">{t.requirements}</span>
              <p className="text-foreground/90 whitespace-pre-wrap">{visit.detected_requirements}</p>
            </div>
          )}
        </div>
      )}

      {visit.policies_needed && visit.policies_needed.length > 0 && (
        <div>
           <span className="font-semibold block text-[10px] text-muted-foreground uppercase mb-1.5 tracking-wider">{t.policies}</span>
           <div className="flex flex-wrap gap-1.5">
             {visit.policies_needed.map((pol: string, idx: number) => (
               <span key={idx} className="bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded text-xs font-medium">
                 {pol}
               </span>
             ))}
           </div>
        </div>
      )}

      <div className="flex flex-col gap-2 pt-2 border-t border-border/50">
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground/70 font-medium uppercase tracking-wider">
          <span>{t.registeredBy} {visit.creator?.name || t.unassigned}</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Users className="w-4 h-4" />
            {isManager ? (
              <div className="flex items-center gap-2">
                <span>{t.assign}:</span>
                <select 
                  value={visit.assigned_to || 'none'}
                  onChange={(e) => onAssignChange(visit.id, e.target.value)}
                  className="bg-transparent border-b border-border/50 outline-none font-medium text-foreground pb-0.5 focus:border-primary"
                >
                  <option value="none">-- {t.unassigned} --</option>
                  {agents.map((a: any) => (
                    <option key={a.id} value={a.id}>{a.id === userProfile?.id ? `${a.name} (${t.me})` : a.name}</option>
                  ))}
                </select>
              </div>
            ) : (
              <span>
                {t.assign}: {visit.assigned_to === userProfile?.id ? t.me : (visit.assignee?.name || t.unassigned)}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
