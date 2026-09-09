"use client"

import { X, Calendar, User, Clock, Tag } from "lucide-react"
import { useLanguage } from "@/components/language-provider"
import { format } from "date-fns"
import { es as esLocale } from "date-fns/locale"

interface TaskViewModalProps {
  isOpen: boolean
  onClose: () => void
  task: any
}

export function TaskViewModal({ isOpen, onClose, task }: TaskViewModalProps) {
  const langContext = useLanguage()
  const lang = (langContext === 'en' || langContext === 'es') ? langContext : 'es'
  
  if (!isOpen || !task) return null

  const t = {
    es: {
      title: "Detalles de la Tarea",
      status: "Estatus",
      client: "Cliente",
      dueDate: "Fecha Límite",
      assignee: "Asignado a",
      creator: "Creado por",
      tags: "Etiquetas",
      description: "Descripción",
      close: "Cerrar",
      tagsOptions: {
        CALL: 'Llamada',
        MEETING: 'Reunión',
        QUOTE: 'Cotización',
        INTERVIEW: 'Entrevista',
        OTHER: 'Otro'
      }
    },
    en: {
      title: "Task Details",
      status: "Status",
      client: "Client",
      dueDate: "Due Date",
      assignee: "Assignee",
      creator: "Created by",
      tags: "Tags",
      description: "Description",
      close: "Close",
      tagsOptions: {
        CALL: 'Call',
        MEETING: 'Meeting',
        QUOTE: 'Quote',
        INTERVIEW: 'Interview',
        OTHER: 'Other'
      }
    }
  }[lang]

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'COMPLETED': return 'bg-emerald-500/10 text-emerald-600 border-emerald-200'
      case 'IN_PROGRESS': return 'bg-blue-500/10 text-blue-600 border-blue-200'
      default: return 'bg-amber-500/10 text-amber-600 border-amber-200'
    }
  }

  const getStatusText = (status: string) => {
    if (lang === 'es') {
      switch(status) {
        case 'COMPLETED': return 'Terminada'
        case 'IN_PROGRESS': return 'En Proceso'
        default: return 'Pendiente'
      }
    } else {
      switch(status) {
        case 'COMPLETED': return 'Completed'
        case 'IN_PROGRESS': return 'In Progress'
        default: return 'Pending'
      }
    }
  }

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card w-full max-w-lg rounded-xl shadow-xl border border-border overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center p-6 border-b border-border bg-muted/20">
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            {t.title}
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${getStatusColor(task.status)}`}>
              {getStatusText(task.status)}
            </span>
          </h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-muted text-muted-foreground hover:text-foreground rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {task.client && (
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-1">{t.client}</h3>
              <p className="font-medium text-foreground">{task.client.name}</p>
            </div>
          )}

          <div>
            <h3 className="text-sm font-semibold text-muted-foreground mb-1">{t.description}</h3>
            <div className="bg-muted/30 p-4 rounded-lg whitespace-pre-wrap text-sm text-foreground">
              {task.note}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-1">{t.dueDate}</h3>
              <div className="flex items-center gap-2 text-sm font-medium">
                <Calendar className="w-4 h-4 text-primary" />
                <span className={new Date(task.due_date) < new Date() && task.status !== 'COMPLETED' ? 'text-destructive font-bold' : ''}>
                  {format(new Date(task.due_date), "PP p", { locale: lang === 'es' ? esLocale : undefined })}
                </span>
              </div>
            </div>

            {(task.assignee || task.creator) && (
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-1">
                  {task.assignee ? t.assignee : t.creator}
                </h3>
                <div className="flex items-center gap-2 text-sm font-medium">
                  <User className="w-4 h-4 text-primary" />
                  <span>{task.assignee?.name || task.creator?.name}</span>
                </div>
              </div>
            )}
          </div>

          {task.tags && task.tags.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-2 flex items-center gap-2">
                <Tag className="w-4 h-4" /> {t.tags}
              </h3>
              <div className="flex flex-wrap gap-2">
                {task.tags.map((tag: string) => (
                  <span key={tag} className="px-3 py-1 bg-secondary text-secondary-foreground text-xs font-medium rounded-full border border-border">
                    {tag === 'OTHER' && task.other_tag_text 
                      ? task.other_tag_text 
                      : (t.tagsOptions as any)[tag] || tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <div className="flex justify-end p-6 border-t border-border bg-muted/10 gap-3">
          <button 
            type="button"
            onClick={onClose}
            className="px-6 py-2 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 shadow-sm transition-colors"
          >
            {t.close}
          </button>
        </div>
      </div>
    </div>
  )
}
