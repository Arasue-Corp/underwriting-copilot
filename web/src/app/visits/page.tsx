"use client"

import { useState, useEffect, useMemo } from "react"
import { 
  Calendar, 
  Clock, 
  CheckCircle2, 
  Plus, 
  Users, 
  History, 
  ListTodo, 
  Search, 
  Filter, 
  Phone, 
  MapPin, 
  Mail, 
  Video, 
  Briefcase, 
  Sparkles, 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight, 
  LayoutList, 
  Table as TableIcon, 
  CalendarDays, 
  X, 
  ArrowUpDown, 
  Check, 
  Eye,
  RefreshCw,
  FileText
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { getVisits, getAgencyAgents, updateVisit } from "@/app/actions/visits"
import { toast } from "sonner"
import { useLanguage } from "@/components/language-provider"
import { VisitModal } from "@/components/visits/VisitModal"
import { TaskModal } from "@/components/tasks/TaskModal"
import { ActivityLogsModal } from "@/components/logs/ActivityLogsModal"
import { VisitDetailDrawer } from "@/components/visits/VisitDetailDrawer"

type ViewMode = "timeline" | "table"

export default function VisitsPage() {
  const [visits, setVisits] = useState<any[]>([])
  const [agents, setAgents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [userProfile, setUserProfile] = useState<any>(null)
  
  // Modals & Drawers
  const [isVisitModalOpen, setIsVisitModalOpen] = useState(false)
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false)
  const [logsVisit, setLogsVisit] = useState<any>(null)
  const [selectedVisitForDrawer, setSelectedVisitForDrawer] = useState<any>(null)
  const [clients, setClients] = useState<any[]>([])

  // Filters & View state
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("ALL")
  const [methodFilter, setMethodFilter] = useState<string>("ALL")
  const [agentFilter, setAgentFilter] = useState<string>("ALL")
  const [dateFilter, setDateFilter] = useState<string>("ALL") // ALL, TODAY, WEEK, MONTH
  const [viewMode, setViewMode] = useState<ViewMode>("timeline")
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  
  const supabase = createClient()
  const langContext = useLanguage()
  const lang = (langContext === 'en' || langContext === 'es') ? langContext : 'es'

  const t = {
    es: {
      title: 'Bitácora & CRM de Actividades',
      subtitle: 'Registro cronológico paginado de visitas, llamadas, acuerdos comerciales y seguimiento con clientes.',
      loading: 'Cargando bitácora...',
      empty: 'No se encontraron entradas en la bitácora con los filtros aplicados.',
      emptyAction: 'Limpiar filtros de búsqueda',
      newVisitBtn: 'Nueva Entrada en Bitácora',
      newTaskBtn: 'Nueva Tarea',
      searchPlaceholder: 'Buscar por cliente, notas de conversación, requerimientos...',
      allStatuses: 'Todos los estados',
      pending: 'Pendientes',
      completed: 'Completadas',
      canceled: 'Canceladas',
      allMethods: 'Todos los métodos',
      allAgents: 'Todos los agentes',
      allDates: 'Cualquier fecha',
      today: 'Hoy',
      thisWeek: 'Esta semana',
      thisMonth: 'Este mes',
      timelineView: 'Vista Bitácora',
      tableView: 'Vista Tabla',
      totalEntries: 'Total de Registros',
      pendingTasks: 'Por Atender',
      completedRate: 'Tasa de Resolución',
      inPersonCount: 'Reuniones Presenciales',
      showing: 'Mostrando',
      of: 'de',
      entries: 'entradas',
      perPage: 'por página',
      page: 'Página',
      viewDetails: 'Ver Ficha Completa',
      assignTo: 'Asignar',
      registeredBy: 'Registrado por',
      clientDeleted: 'Cliente no especificado',
      notes: 'Notas',
      requirements: 'Requerimientos',
      policies: 'Pólizas Sugeridas'
    },
    en: {
      title: 'Activity Journal & CRM Log',
      subtitle: 'Paginated chronological record of client visits, calls, business agreements, and follow-ups.',
      loading: 'Loading journal...',
      empty: 'No activity log entries found matching the selected filters.',
      emptyAction: 'Clear search filters',
      newVisitBtn: 'New Log Entry',
      newTaskBtn: 'New Task',
      searchPlaceholder: 'Search by client, notes, opportunities, requirements...',
      allStatuses: 'All statuses',
      pending: 'Pending',
      completed: 'Completed',
      canceled: 'Canceled',
      allMethods: 'All methods',
      allAgents: 'All agents',
      allDates: 'Any date',
      today: 'Today',
      thisWeek: 'This week',
      thisMonth: 'This month',
      timelineView: 'Journal Feed',
      tableView: 'Table View',
      totalEntries: 'Total Logged',
      pendingTasks: 'Action Required',
      completedRate: 'Completion Rate',
      inPersonCount: 'In-Person Meetings',
      showing: 'Showing',
      of: 'of',
      entries: 'entries',
      perPage: 'per page',
      page: 'Page',
      viewDetails: 'View Details',
      assignTo: 'Assign',
      registeredBy: 'Logged by',
      clientDeleted: 'Unspecified Client',
      notes: 'Notes',
      requirements: 'Requirements',
      policies: 'Suggested Policies'
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
    
    if (profile?.role === 'DEMO') {
      const { demoVisits, demoClients } = await import('@/lib/demo-data')
      setVisits(demoVisits)
      setClients(demoClients)
      setLoading(false)
      return
    }

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

  // Reset pagination when any filter changes
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, statusFilter, methodFilter, agentFilter, dateFilter, pageSize])

  // Filtered visits
  const filteredVisits = useMemo(() => {
    return visits.filter(visit => {
      // 1. Status filter
      if (statusFilter !== "ALL" && visit.status !== statusFilter) {
        return false
      }

      // 2. Method filter
      if (methodFilter !== "ALL" && visit.contact_method !== methodFilter) {
        return false
      }

      // 3. Agent filter
      if (agentFilter !== "ALL") {
        const matchesAssignee = visit.assigned_to === agentFilter
        const matchesCreator = visit.created_by === agentFilter
        if (!matchesAssignee && !matchesCreator) return false
      }

      // 4. Date filter
      if (dateFilter !== "ALL") {
        const itemDate = new Date(visit.visit_date || visit.created_at)
        const now = new Date()
        
        if (dateFilter === "TODAY") {
          const isToday = itemDate.toDateString() === now.toDateString()
          if (!isToday) return false
        } else if (dateFilter === "WEEK") {
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          if (itemDate < weekAgo) return false
        } else if (dateFilter === "MONTH") {
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
          if (itemDate < monthAgo) return false
        }
      }

      // 5. Search query (search client name, notes, requirements, policies)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim()
        const clientName = (visit.client?.name || "").toLowerCase()
        const notes = (visit.conversation_notes || "").toLowerCase()
        const requirements = (visit.detected_requirements || "").toLowerCase()
        const policies = (visit.policies_needed || []).join(" ").toLowerCase()
        const creatorName = (visit.creator?.name || "").toLowerCase()
        const assigneeName = (visit.assignee?.name || "").toLowerCase()

        const matches = 
          clientName.includes(q) ||
          notes.includes(q) ||
          requirements.includes(q) ||
          policies.includes(q) ||
          creatorName.includes(q) ||
          assigneeName.includes(q)

        if (!matches) return false
      }

      return true
    })
  }, [visits, searchQuery, statusFilter, methodFilter, agentFilter, dateFilter])

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredVisits.length / pageSize))
  const paginatedVisits = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    return filteredVisits.slice(startIndex, startIndex + pageSize)
  }, [filteredVisits, currentPage, pageSize])

  // KPI Metrics
  const metrics = useMemo(() => {
    const total = visits.length
    const pending = visits.filter(v => v.status === "PENDING").length
    const completed = visits.filter(v => v.status === "COMPLETED").length
    const inPerson = visits.filter(v => v.contact_method === "IN_PERSON").length
    const rate = total > 0 ? Math.round((completed / total) * 100) : 0
    return { total, pending, completed, inPerson, rate }
  }, [visits])

  // Handlers
  const handleStatusChange = async (id: string, newStatus: string) => {
    const prev = [...visits]
    setVisits(visits.map(v => v.id === id ? { ...v, status: newStatus } : v))
    if (selectedVisitForDrawer?.id === id) {
      setSelectedVisitForDrawer((prevD: any) => prevD ? { ...prevD, status: newStatus } : null)
    }
    const toastId = toast.loading("Actualizando estado...")
    const res = await updateVisit(id, { status: newStatus })
    if (res.success) {
      toast.success("Estado actualizado con éxito", { id: toastId })
    } else {
      toast.error(res.error || "Error al actualizar", { id: toastId })
      setVisits(prev)
    }
  }

  const handleAssignChange = async (id: string, newAssignee: string) => {
    const prev = [...visits]
    const assigned_to = newAssignee === 'none' ? null : newAssignee
    setVisits(visits.map(v => v.id === id ? { ...v, assigned_to } : v))
    if (selectedVisitForDrawer?.id === id) {
      setSelectedVisitForDrawer((prevD: any) => prevD ? { ...prevD, assigned_to } : null)
    }
    const toastId = toast.loading("Actualizando asignación...")
    const res = await updateVisit(id, { assigned_to })
    if (res.success) {
      toast.success("Asignación actualizada con éxito", { id: toastId })
    } else {
      toast.error(res.error || "Error al actualizar", { id: toastId })
      setVisits(prev)
    }
  }

  const resetFilters = () => {
    setSearchQuery("")
    setStatusFilter("ALL")
    setMethodFilter("ALL")
    setAgentFilter("ALL")
    setDateFilter("ALL")
    setCurrentPage(1)
  }

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6 relative">
      
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-2 border border-primary/20">
            <CalendarDays className="w-3.5 h-3.5" />
            <span>Bitácora Ejecutiva</span>
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground font-playfair">
            {t.title}
          </h2>
          <p className="text-muted-foreground text-sm mt-1 max-w-2xl">
            {t.subtitle}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button 
            onClick={() => setIsTaskModalOpen(true)}
            className="px-4 py-2.5 rounded-xl border border-border bg-card hover:bg-muted text-foreground text-sm font-semibold shadow-sm transition flex items-center gap-2 cursor-pointer"
          >
            <ListTodo className="w-4 h-4 text-primary" />
            <span>{t.newTaskBtn}</span>
          </button>
          <button 
            onClick={() => setIsVisitModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-bold shadow-md hover:shadow-lg transition flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{t.newVisitBtn}</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Ribbon */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {t.totalEntries}
            </span>
            <div className="text-2xl font-bold text-foreground font-mono">
              {metrics.total}
            </div>
          </div>
          <div className="p-3 rounded-xl bg-primary/10 text-primary">
            <FileText className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
              {t.pendingTasks}
            </span>
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 font-mono">
              {metrics.pending}
            </div>
          </div>
          <div className="p-3 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
              {t.completedRate}
            </span>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 font-mono">
              {metrics.rate}%
            </div>
          </div>
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {t.inPersonCount}
            </span>
            <div className="text-2xl font-bold text-foreground font-mono">
              {metrics.inPerson}
            </div>
          </div>
          <div className="p-3 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
            <MapPin className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter and Search Controls Bar */}
      <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="w-full h-10 pl-10 pr-9 rounded-xl bg-background border border-input text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-1.5 p-1 bg-muted/60 rounded-xl border border-border self-start lg:self-auto">
            <button
              onClick={() => setViewMode("timeline")}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                viewMode === "timeline"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <LayoutList className="w-3.5 h-3.5" />
              <span>{t.timelineView}</span>
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                viewMode === "table"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>{t.tableView}</span>
            </button>
          </div>
        </div>

        {/* Dropdown Filters row */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-border/50">
          
          {/* Status filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-muted-foreground">Estado:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-9 px-3 rounded-lg bg-background border border-input text-xs font-medium text-foreground outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="ALL">{t.allStatuses}</option>
              <option value="PENDING">{t.pending}</option>
              <option value="COMPLETED">{t.completed}</option>
              <option value="CANCELED">{t.canceled}</option>
            </select>
          </div>

          {/* Method filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-muted-foreground">Método:</span>
            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              className="h-9 px-3 rounded-lg bg-background border border-input text-xs font-medium text-foreground outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="ALL">{t.allMethods}</option>
              <option value="IN_PERSON">Presencial</option>
              <option value="CALL">Llamada</option>
              <option value="EMAIL">Correo</option>
              <option value="VIDEO_CALL">Videollamada</option>
              <option value="OTHER">Otro</option>
            </select>
          </div>

          {/* Date filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-muted-foreground">Fecha:</span>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="h-9 px-3 rounded-lg bg-background border border-input text-xs font-medium text-foreground outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="ALL">{t.allDates}</option>
              <option value="TODAY">{t.today}</option>
              <option value="WEEK">{t.thisWeek}</option>
              <option value="MONTH">{t.thisMonth}</option>
            </select>
          </div>

          {/* Agent filter (if manager or admin) */}
          {agents.length > 0 && (
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-muted-foreground">Agente:</span>
              <select
                value={agentFilter}
                onChange={(e) => setAgentFilter(e.target.value)}
                className="h-9 px-3 rounded-lg bg-background border border-input text-xs font-medium text-foreground outline-none focus:ring-2 focus:ring-primary/30"
              >
                <option value="ALL">{t.allAgents}</option>
                {agents.map((a: any) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Active filter counter & clear */}
          {(searchQuery || statusFilter !== "ALL" || methodFilter !== "ALL" || agentFilter !== "ALL" || dateFilter !== "ALL") && (
            <button
              onClick={resetFilters}
              className="h-9 px-3 text-xs font-medium text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 rounded-lg transition inline-flex items-center gap-1 ml-auto"
            >
              <X className="w-3.5 h-3.5" />
              <span>Limpiar filtros</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Content Area: Loading / Empty / Timeline / Table */}
      {loading ? (
        <div className="p-16 rounded-2xl border border-dashed border-border bg-card/50 text-center space-y-3">
          <RefreshCw className="w-8 h-8 animate-spin text-primary mx-auto" />
          <p className="text-sm font-medium text-muted-foreground">{t.loading}</p>
        </div>
      ) : filteredVisits.length === 0 ? (
        <div className="p-16 rounded-2xl border border-dashed border-border bg-card/50 text-center space-y-4">
          <div className="p-3 rounded-full bg-muted w-12 h-12 flex items-center justify-center mx-auto text-muted-foreground">
            <Search className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-lg text-foreground">No hay registros coincidentes</h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">{t.empty}</p>
          </div>
          <button
            onClick={resetFilters}
            className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow transition"
          >
            {t.emptyAction}
          </button>
        </div>
      ) : (
        <>
          {/* VIEW 1: TIMELINE FEED */}
          {viewMode === "timeline" && (
            <div className="space-y-4">
              {paginatedVisits.map((visit) => (
                <TimelineCard
                  key={visit.id}
                  visit={visit}
                  t={t}
                  agents={agents}
                  userProfile={userProfile}
                  onStatusChange={handleStatusChange}
                  onAssignChange={handleAssignChange}
                  onOpenDrawer={() => setSelectedVisitForDrawer(visit)}
                  onShowLogs={() => setLogsVisit(visit)}
                />
              ))}
            </div>
          )}

          {/* VIEW 2: EXECUTIVE TABLE */}
          {viewMode === "table" && (
            <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/40 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                      <th className="py-3 px-4">Fecha</th>
                      <th className="py-3 px-4">Cliente</th>
                      <th className="py-3 px-4">Método / Motivo</th>
                      <th className="py-3 px-4">Notas y Oportunidades</th>
                      <th className="py-3 px-4">Responsable</th>
                      <th className="py-3 px-4 text-center">Estado</th>
                      <th className="py-3 px-4 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {paginatedVisits.map((visit) => (
                      <tr 
                        key={visit.id} 
                        className="hover:bg-muted/30 transition group cursor-pointer"
                        onClick={() => setSelectedVisitForDrawer(visit)}
                      >
                        {/* Fecha */}
                        <td className="py-3.5 px-4 font-mono text-xs text-muted-foreground whitespace-nowrap">
                          {visit.visit_date 
                            ? new Date(visit.visit_date).toLocaleDateString() 
                            : new Date(visit.created_at).toLocaleDateString()}
                          <div className="text-[10px] text-muted-foreground/70">
                            {visit.visit_date 
                              ? new Date(visit.visit_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
                              : ""}
                          </div>
                        </td>

                        {/* Cliente */}
                        <td className="py-3.5 px-4 font-semibold text-foreground">
                          {visit.client ? visit.client.name : t.clientDeleted}
                          {visit.client?.address && (
                            <span className="text-[11px] font-normal text-muted-foreground block truncate max-w-xs">
                              {visit.client.address}
                            </span>
                          )}
                        </td>

                        {/* Método / Motivo */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-muted border border-border">
                            {getMethodIcon(visit.contact_method)}
                            <span>{getMethodLabel(visit.contact_method, visit.contact_method_other)}</span>
                          </span>
                          {visit.contact_reason && (
                            <span className="text-[11px] text-muted-foreground block mt-1">
                              {getReasonLabel(visit.contact_reason, visit.contact_reason_other)}
                            </span>
                          )}
                        </td>

                        {/* Notas y Requerimientos */}
                        <td className="py-3.5 px-4 max-w-md">
                          {visit.conversation_notes ? (
                            <p className="text-xs text-foreground/90 line-clamp-2 leading-relaxed">
                              {visit.conversation_notes}
                            </p>
                          ) : (
                            <span className="text-xs text-muted-foreground italic">Sin notas</span>
                          )}
                          {visit.policies_needed && visit.policies_needed.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1.5">
                              {visit.policies_needed.slice(0, 2).map((pol: string, idx: number) => (
                                <span key={idx} className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-medium">
                                  {pol}
                                </span>
                              ))}
                              {visit.policies_needed.length > 2 && (
                                <span className="text-[10px] text-muted-foreground">
                                  +{visit.policies_needed.length - 2}
                                </span>
                              )}
                            </div>
                          )}
                        </td>

                        {/* Responsable */}
                        <td className="py-3.5 px-4 text-xs whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                          {visit.assigned_to ? (
                            <span className="font-semibold text-foreground">
                              {visit.assigned_to === userProfile?.id ? "Yo (Agente)" : (visit.assignee?.name || "Asignado")}
                            </span>
                          ) : (
                            <span className="text-muted-foreground italic">Sin asignar</span>
                          )}
                        </td>

                        {/* Estado */}
                        <td className="py-3.5 px-4 text-center whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                          <select
                            value={visit.status}
                            onChange={(e) => handleStatusChange(visit.id, e.target.value)}
                            className={`text-xs font-bold px-2.5 py-1 rounded-md border outline-none cursor-pointer ${
                              visit.status === 'COMPLETED' 
                                ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30' 
                                : visit.status === 'CANCELED' 
                                ? 'bg-rose-500/10 text-rose-600 border-rose-500/30' 
                                : 'bg-amber-500/10 text-amber-600 border-amber-500/30'
                            }`}
                          >
                            <option value="PENDING">{t.pending}</option>
                            <option value="COMPLETED">{t.completed}</option>
                            <option value="CANCELED">{t.canceled}</option>
                          </select>
                        </td>

                        {/* Acciones */}
                        <td className="py-3.5 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => setSelectedVisitForDrawer(visit)}
                            className="p-1.5 hover:bg-muted text-muted-foreground hover:text-foreground rounded-lg transition"
                            title="Ver detalles"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* PAGINATION BAR */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-card border border-border/80 shadow-sm text-xs text-muted-foreground">
            <div className="flex items-center gap-3">
              <span>
                {t.showing}{" "}
                <strong className="text-foreground">
                  {(currentPage - 1) * pageSize + 1}
                </strong>{" "}
                -{" "}
                <strong className="text-foreground">
                  {Math.min(currentPage * pageSize, filteredVisits.length)}
                </strong>{" "}
                {t.of}{" "}
                <strong className="text-foreground">{filteredVisits.length}</strong>{" "}
                {t.entries}
              </span>

              <div className="flex items-center gap-1.5 pl-3 border-l border-border">
                <span>{t.perPage}:</span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value))
                    setCurrentPage(1)
                  }}
                  className="h-8 px-2 rounded-md bg-background border border-input text-foreground outline-none font-medium cursor-pointer"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
              </div>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg border border-border hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition"
                title="Primera página"
              >
                <ChevronsLeft className="w-4 h-4" />
              </button>

              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg border border-border hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition"
                title="Página anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="px-3 py-1 font-semibold text-foreground">
                {t.page} {currentPage} {t.of} {totalPages}
              </span>

              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg border border-border hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition"
                title="Página siguiente"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg border border-border hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition"
                title="Última página"
              >
                <ChevronsRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </>
      )}

      {/* MODALS */}
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

      <VisitDetailDrawer
        isOpen={!!selectedVisitForDrawer}
        visit={selectedVisitForDrawer}
        onClose={() => setSelectedVisitForDrawer(null)}
        onStatusChange={handleStatusChange}
        onAssignChange={handleAssignChange}
        onShowLogs={() => {
          const v = selectedVisitForDrawer
          setSelectedVisitForDrawer(null)
          setLogsVisit(v)
        }}
        agents={agents}
        userProfile={userProfile}
        lang={lang}
      />
    </div>
  )
}

/* Timeline Card Component */
function TimelineCard({
  visit,
  t,
  agents,
  userProfile,
  onStatusChange,
  onAssignChange,
  onOpenDrawer,
  onShowLogs
}: any) {
  const isManager = userProfile?.role === 'MANAGER' || (userProfile?.role === 'ADMIN' || userProfile?.role === 'DEMO')

  return (
    <div className="p-5 rounded-2xl bg-card border border-border shadow-sm hover:shadow-md hover:border-primary/30 transition duration-200 space-y-4">
      {/* Card Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/60">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-primary/10 text-primary shrink-0 mt-0.5">
            {getMethodIcon(visit.contact_method)}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h4 
                onClick={onOpenDrawer}
                className="font-bold text-base sm:text-lg text-foreground hover:text-primary transition cursor-pointer"
              >
                {visit.client ? visit.client.name : t.clientDeleted}
              </h4>
              <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-muted text-muted-foreground border border-border">
                {getMethodLabel(visit.contact_method, visit.contact_method_other)}
              </span>
              {visit.contact_reason && (
                <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-primary/5 text-primary border border-primary/20">
                  {getReasonLabel(visit.contact_reason, visit.contact_reason_other)}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
              <Calendar className="w-3.5 h-3.5" />
              <span>
                {visit.visit_date ? new Date(visit.visit_date).toLocaleString() : new Date(visit.created_at).toLocaleString()}
              </span>
              {visit.client?.address && (
                <>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {visit.client.address}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Status selector & Actions */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <select 
            value={visit.status}
            onChange={(e) => onStatusChange(visit.id, e.target.value)}
            className={`text-xs font-bold px-3 py-1.5 rounded-lg border outline-none cursor-pointer ${
              visit.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30' :
              visit.status === 'CANCELED' ? 'bg-rose-500/10 text-rose-600 border-rose-500/30' :
              'bg-amber-500/10 text-amber-600 border-amber-500/30'
            }`}
          >
            <option value="PENDING">{t.pending}</option>
            <option value="COMPLETED">{t.completed}</option>
            <option value="CANCELED">{t.canceled}</option>
          </select>

          <button
            onClick={onOpenDrawer}
            className="p-1.5 rounded-lg border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground transition"
            title={t.viewDetails}
          >
            <Eye className="w-4 h-4" />
          </button>

          {(userProfile?.role === 'ADMIN' || userProfile?.role === 'DEMO') && (
            <button 
              onClick={onShowLogs}
              title="Ver registro de auditoría"
              className="p-1.5 rounded-lg border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground transition"
            >
              <History className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Body: Notes & Opportunities */}
      {(visit.conversation_notes || visit.detected_requirements) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3.5 rounded-xl bg-muted/30 border border-border/50 text-xs">
          {visit.conversation_notes && (
            <div className="space-y-1">
              <span className="font-bold text-[10px] text-muted-foreground uppercase tracking-wider block">
                {t.notes}
              </span>
              <p className="text-foreground/90 leading-relaxed whitespace-pre-wrap line-clamp-3">
                {visit.conversation_notes}
              </p>
            </div>
          )}

          {visit.detected_requirements && (
            <div className="space-y-1">
              <span className="font-bold text-[10px] text-amber-600 dark:text-amber-400 uppercase tracking-wider block">
                {t.requirements}
              </span>
              <p className="text-foreground/90 leading-relaxed whitespace-pre-wrap line-clamp-3">
                {visit.detected_requirements}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Policies Tags */}
      {visit.policies_needed && visit.policies_needed.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
            {t.policies}:
          </span>
          {visit.policies_needed.map((pol: string, idx: number) => (
            <span 
              key={idx} 
              className="bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-md text-[11px] font-semibold"
            >
              {pol}
            </span>
          ))}
        </div>
      )}

      {/* Card Footer: Responsible & Creator */}
      <div className="pt-2 border-t border-border/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-muted-foreground">
        <span className="text-[11px]">
          {t.registeredBy}: <strong className="text-foreground font-semibold">{visit.creator?.name || "Desconocido"}</strong>
        </span>

        <div className="flex items-center gap-2">
          <Users className="w-3.5 h-3.5" />
          <span>{t.assignTo}:</span>
          {isManager ? (
            <select 
              value={visit.assigned_to || 'none'}
              onChange={(e) => onAssignChange(visit.id, e.target.value)}
              className="bg-background border border-input rounded px-2 py-0.5 text-xs font-medium text-foreground outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="none">-- Sin asignar --</option>
              {agents.map((a: any) => (
                <option key={a.id} value={a.id}>
                  {a.id === userProfile?.id ? `${a.name} (Yo)` : a.name}
                </option>
              ))}
            </select>
          ) : (
            <strong className="text-foreground font-semibold">
              {visit.assigned_to === userProfile?.id ? "Yo (Agente)" : (visit.assignee?.name || "Sin asignar")}
            </strong>
          )}
        </div>
      </div>
    </div>
  )
}

// Helpers
function getMethodIcon(method?: string) {
  switch (method) {
    case 'IN_PERSON': return <MapPin className="w-4 h-4" />
    case 'CALL': return <Phone className="w-4 h-4" />
    case 'EMAIL': return <Mail className="w-4 h-4" />
    case 'VIDEO_CALL': return <Video className="w-4 h-4" />
    default: return <Briefcase className="w-4 h-4" />
  }
}

function getMethodLabel(method?: string, other?: string) {
  switch (method) {
    case 'IN_PERSON': return 'Reunión Presencial'
    case 'CALL': return 'Llamada Telefónica'
    case 'EMAIL': return 'Correo Electrónico'
    case 'VIDEO_CALL': return 'Videollamada'
    case 'OTHER': return other || 'Otro'
    default: return 'Actividad / Visita'
  }
}

function getReasonLabel(reason?: string, other?: string) {
  switch (reason) {
    case 'FOLLOW_UP': return 'Seguimiento'
    case 'INTERVIEW': return 'Entrevista'
    case 'SCOUTING': return 'Prospección'
    case 'PROPOSAL': return 'Propuesta'
    case 'OTHER': return other || 'Otro'
    default: return reason || ''
  }
}
