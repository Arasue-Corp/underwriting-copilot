"use client"

import { useState, useEffect } from "react"
import { getTasks, updateTask, deleteTask } from "@/app/actions/tasks"
import { CheckSquare, Search, Trash2, Calendar, User } from "lucide-react"
import { useLanguage } from "@/components/language-provider"
import { toast } from "sonner"
import { format } from "date-fns"
import { es as esLocale } from "date-fns/locale"
import { createClient } from "@/lib/supabase/client"
import { TaskModal } from "@/components/tasks/TaskModal"
import { TaskViewModal } from "@/components/tasks/TaskViewModal"

export default function TasksPage() {
  const langContext = useLanguage()
  const lang = (langContext === 'en' || langContext === 'es') ? langContext : 'es'
  
  const [tasks, setTasks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("ALL")
  const [sortConfig, setSortConfig] = useState({ key: 'due_date', direction: 'asc' })

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState<any>(null)
  const [clients, setClients] = useState<any[]>([])
  const [agents, setAgents] = useState<any[]>([])
  const [userProfile, setUserProfile] = useState<any>(null)
  
  const supabase = createClient()

  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  const t = {
    es: {
      title: "Mis Tareas",
      subtitle: "GestiÃ³n de tareas activas e historial.",
      searchPlaceholder: "Buscar tarea o cliente...",
      status: "Estatus",
      all: "Todas",
      pending: "Pendiente",
      inProgress: "En Proceso",
      completed: "Terminada",
      task: "Tarea",
      client: "Cliente",
      dueDate: "Vencimiento",
      assignee: "Asignado a",
      creator: "Creado por",
      actions: "Acciones",
      loading: "Cargando tareas...",
      noData: "No se encontraron tareas.",
      deleteConfirm: "Â¿EstÃ¡s seguro de eliminar esta tarea?",
      statusUpdateSuccess: "Estatus actualizado",
      deleteSuccess: "Tarea eliminada",
      deleteError: "Error al eliminar la tarea",
      sortNewest: "MÃ¡s recientes",
      sortOldest: "MÃ¡s antiguas",
      sortDueSoon: "MÃ¡s prÃ³ximas a vencer",
      sortDueLate: "MÃ¡s lejanas a vencer",
      sortBy: "Ordenar por:"
    },
    en: {
      title: "My Tasks",
      subtitle: "Management of active tasks and history.",
      searchPlaceholder: "Search task or client...",
      status: "Status",
      all: "All",
      pending: "Pending",
      inProgress: "In Progress",
      completed: "Completed",
      task: "Task",
      client: "Client",
      dueDate: "Due Date",
      assignee: "Assignee",
      creator: "Created by",
      actions: "Actions",
      loading: "Loading tasks...",
      noData: "No tasks found.",
      deleteConfirm: "Are you sure you want to delete this task?",
      statusUpdateSuccess: "Status updated",
      deleteSuccess: "Task deleted",
      deleteError: "Error deleting task",
      sortNewest: "Newest first",
      sortOldest: "Oldest first",
      sortDueSoon: "Due soonest",
      sortDueLate: "Due latest",
      sortBy: "Sort by:"
    }
  }[lang]

  useEffect(() => {
    loadTasks()
  }, [])

  const loadTasks = async () => {
    setLoading(true)
    const data = await getTasks()
    setTasks(data || [])
    
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data: profile } = await supabase.from('profiles').select('id, agency_id, role, name').eq('id', user.id).single()
      if (profile) {
        setUserProfile(profile)
        if (profile.role !== 'AGENT') {
          const { data: agts } = await supabase.from('profiles').select('id, name, role').eq('agency_id', profile.agency_id)
          if (agts) setAgents(agts)
        } else {
          setAgents([profile])
        }
        
        const { data: cls } = await supabase.from('clients').select('id, name').eq('agency_id', profile.agency_id).order('name')
        if (cls) setClients(cls)
      }
    }
    
    setLoading(false)
  }

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    const toastId = toast.loading(lang === 'es' ? "Actualizando..." : "Updating...")
    const res = await updateTask(taskId, { status: newStatus })
    if (res.success) {
      toast.success(t.statusUpdateSuccess, { id: toastId })
      setTasks(tasks.map(task => task.id === taskId ? { ...task, status: newStatus } : task))
    } else {
      toast.error(res.error, { id: toastId })
    }
  }

  const handleDelete = async (taskId: string) => {
    if (!window.confirm(t.deleteConfirm)) return
    
    const res = await deleteTask(taskId)
    if (res.success) {
      toast.success(t.deleteSuccess)
      setTasks(tasks.filter(t => t.id !== taskId))
    } else {
      toast.error(t.deleteError + ": " + res.error)
    }
  }

  const filteredTasks = tasks.filter(task => {
    if (filterStatus !== 'ALL' && task.status !== filterStatus) return false
    
    if (searchTerm) {
      const s = searchTerm.toLowerCase()
      const clientName = task.client ? task.client.name?.toLowerCase() || '' : ''
      const note = task.note?.toLowerCase() || ''
      if (!clientName.includes(s) && !note.includes(s)) return false
    }
    
    return true
  })

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    let aValue = a[sortConfig.key]
    let bValue = b[sortConfig.key]

    if (sortConfig.key === 'due_date') {
      aValue = a.due_date ? new Date(a.due_date).getTime() : 0
      bValue = b.due_date ? new Date(b.due_date).getTime() : 0
    } else if (sortConfig.key === 'created_at') {
      aValue = a.created_at ? new Date(a.created_at).getTime() : 0
      bValue = b.created_at ? new Date(b.created_at).getTime() : 0
    }

    if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1
    if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1
    return 0
  })

  const totalPages = Math.ceil(sortedTasks.length / itemsPerPage)
  const paginatedTasks = sortedTasks.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'COMPLETED': return 'bg-emerald-500/10 text-emerald-600 border-emerald-200'
      case 'IN_PROGRESS': return 'bg-blue-500/10 text-blue-600 border-blue-200'
      default: return 'bg-amber-500/10 text-amber-600 border-amber-200'
    }
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3 text-primary mb-2">
            <div className="p-2.5 bg-primary/10 rounded-xl">
              <CheckSquare className="h-6 w-6" />
            </div>
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground">{t.title}</h1>
          <p className="text-muted-foreground">{t.subtitle}</p>
        </div>
        <button 
          onClick={() => setIsTaskModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors shadow-sm"
        >
          {lang === 'es' ? '+ Nueva Tarea' : '+ New Task'}
        </button>
      </div>

      <div className="rounded-2xl border bg-card text-card-foreground shadow-sm overflow-hidden flex flex-col">
        {/* Toolbar */}
        <div className="p-4 border-b border-border bg-muted/20 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder={t.searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            />
          </div>
          
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <select
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value)
                setCurrentPage(1)
              }}
              className="h-9 px-3 py-1 bg-background border border-border rounded-md text-sm outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="ALL">{t.all}</option>
              <option value="PENDING">{t.pending}</option>
              <option value="IN_PROGRESS">{t.inProgress}</option>
              <option value="COMPLETED">{t.completed}</option>
            </select>

            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-muted-foreground hidden sm:inline">{t.sortBy}</span>
              <select 
                value={`${sortConfig.key}-${sortConfig.direction}`}
                onChange={(e) => {
                  const [key, direction] = e.target.value.split('-')
                  setSortConfig({ key, direction })
                  setCurrentPage(1)
                }}
                className="h-9 px-3 py-1 bg-background border border-border rounded-md text-sm outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="due_date-asc">{t.sortDueSoon}</option>
                <option value="due_date-desc">{t.sortDueLate}</option>
                <option value="created_at-desc">{t.sortNewest}</option>
                <option value="created_at-asc">{t.sortOldest}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table View */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-muted/30">
              <tr>
                <th className="px-6 py-4 font-medium">{t.status}</th>
                <th className="px-6 py-4 font-medium">{t.task}</th>
                <th className="px-6 py-4 font-medium">{t.client}</th>
                <th className="px-6 py-4 font-medium">{t.dueDate}</th>
                <th className="px-6 py-4 font-medium">{t.assignee}</th>
                <th className="px-6 py-4 font-medium text-right">{t.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">{t.loading}</td>
                </tr>
              ) : paginatedTasks.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">{t.noData}</td>
                </tr>
              ) : (
                paginatedTasks.map((task) => (
                  <tr key={task.id} className="hover:bg-muted/30 transition-colors cursor-pointer" onClick={() => setSelectedTask(task)}>
                    <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                      <select
                        value={task.status}
                        onChange={(e) => handleStatusChange(task.id, e.target.value)}
                        className={`text-xs font-semibold px-2.5 py-1.5 rounded-full border outline-none cursor-pointer appearance-none ${getStatusColor(task.status)}`}
                      >
                        <option value="PENDING">{t.pending}</option>
                        <option value="IN_PROGRESS">{t.inProgress}</option>
                        <option value="COMPLETED">{t.completed}</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 font-medium max-w-xs truncate" title={task.note}>
                      {task.note}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {task.client?.name || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className={new Date(task.due_date) < new Date() && task.status !== 'COMPLETED' ? 'text-destructive font-medium' : ''}>
                          {format(new Date(task.due_date), "PP p", { locale: lang === 'es' ? esLocale : undefined })}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-muted-foreground" />
                        <span>{task.assignee?.name || t.creator + ' ' + task.creator?.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => handleDelete(task.id)}
                        className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                        title={t.actions}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 bg-muted/5">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">{lang === 'es' ? 'Mostrar' : 'Show'}</span>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value))
                setCurrentPage(1)
              }}
              className="h-8 px-2 bg-background border border-border rounded-md text-sm outline-none"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
            <span className="text-sm text-muted-foreground">{lang === 'es' ? 'por pÃ¡gina' : 'per page'}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 rounded-md border border-border bg-background text-sm hover:bg-muted disabled:opacity-50 transition-colors"
            >
              {lang === 'es' ? 'Anterior' : 'Previous'}
            </button>
            <span className="text-sm font-medium min-w-[3rem] text-center">
              {currentPage} / {totalPages || 1}
            </span>
            <button 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="px-3 py-1 rounded-md border border-border bg-background text-sm hover:bg-muted disabled:opacity-50 transition-colors"
            >
              {lang === 'es' ? 'Siguiente' : 'Next'}
            </button>
          </div>
        </div>

      </div>
      
      <TaskModal 
        isOpen={isTaskModalOpen} 
        onClose={() => setIsTaskModalOpen(false)} 
        onSuccess={() => {
          setIsTaskModalOpen(false)
          loadTasks()
        }}
        clients={clients}
        agents={agents}
        userProfile={userProfile}
      />
      
      <TaskViewModal 
        isOpen={!!selectedTask} 
        onClose={() => setSelectedTask(null)} 
        task={selectedTask} 
      />
    </div>
  )
}
