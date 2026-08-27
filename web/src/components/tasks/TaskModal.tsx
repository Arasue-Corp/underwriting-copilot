"use client"

import { useState, useEffect } from "react"
import { X } from "lucide-react"
import { toast } from "sonner"
import { createTask } from "@/app/actions/tasks"
import { useLanguage } from "@/components/language-provider"

interface TaskModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  clients: any[]
  agents: any[]
  userProfile: any
  preselectedClientId?: string | null
}

export function TaskModal({ isOpen, onClose, onSuccess, clients, agents, userProfile, preselectedClientId }: TaskModalProps) {
  const langContext = useLanguage()
  const lang = (langContext === 'en' || langContext === 'es') ? langContext : 'es'
  
  const t = {
    es: {
      title: 'Nueva Tarea',
      clientLabel: 'Cliente',
      selectClientPlaceholder: '-- Buscar / Seleccionar Cliente --',
      clientLockedMsg: 'El cliente está bloqueado porque abriste este formulario desde su perfil.',
      noteLabel: 'Nota / Descripción',
      notePlaceholder: 'Escribe los detalles de la tarea...',
      tagsLabel: 'Etiquetas',
      tagsOptions: {
        CALL: 'Llamada',
        MEETING: 'Reunión',
        QUOTE: 'Cotización',
        INTERVIEW: 'Entrevista',
        OTHER: 'Otro (especificar)'
      },
      otherTagLabel: 'Especificar Otro',
      dueDateLabel: 'Fecha y Hora Límite',
      assigneeLabel: 'Asignar a',
      assigneeSelfMsg: 'Asignado a ti (Agente)',
      cancelBtn: 'Cancelar',
      saveBtn: 'Crear Tarea',
      savingBtn: 'Creando...',
      successMessage: 'Tarea creada correctamente',
      errorMessage: 'Error al crear la tarea'
    },
    en: {
      title: 'New Task',
      clientLabel: 'Client',
      selectClientPlaceholder: '-- Search / Select Client --',
      clientLockedMsg: 'The client is locked because you opened this form from their profile.',
      noteLabel: 'Note / Description',
      notePlaceholder: 'Write task details...',
      tagsLabel: 'Tags',
      tagsOptions: {
        CALL: 'Call',
        MEETING: 'Meeting',
        QUOTE: 'Quote',
        INTERVIEW: 'Interview',
        OTHER: 'Other (specify)'
      },
      otherTagLabel: 'Specify Other',
      dueDateLabel: 'Due Date and Time',
      assigneeLabel: 'Assign to',
      assigneeSelfMsg: 'Assigned to you (Agent)',
      cancelBtn: 'Cancel',
      saveBtn: 'Create Task',
      savingBtn: 'Creating...',
      successMessage: 'Task created successfully',
      errorMessage: 'Error creating task'
    }
  }[lang]

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedClientId, setSelectedClientId] = useState<string>(preselectedClientId || '')
  
  const [taskForm, setTaskForm] = useState({
    note: '',
    tags: [] as string[],
    other_tag_text: '',
    due_date: '',
    assignee_id: userProfile?.id || ''
  })

  useEffect(() => {
    if (isOpen) {
      setSelectedClientId(preselectedClientId || '')
      setTaskForm({
        note: '',
        tags: [],
        other_tag_text: '',
        due_date: '',
        assignee_id: userProfile?.id || ''
      })
      setIsSubmitting(false)
    }
  }, [isOpen, preselectedClientId, userProfile])

  if (!isOpen) return null

  const handleTagToggle = (tag: string) => {
    setTaskForm(prev => {
      const isSelected = prev.tags.includes(tag)
      if (isSelected) {
        return { ...prev, tags: prev.tags.filter(t => t !== tag) }
      } else {
        return { ...prev, tags: [...prev.tags, tag] }
      }
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedClientId) {
      toast.error(lang === 'es' ? 'Selecciona un cliente' : 'Select a client')
      return
    }
    if (!taskForm.note.trim()) {
      toast.error(lang === 'es' ? 'La nota es obligatoria' : 'Note is required')
      return
    }
    if (!taskForm.due_date) {
      toast.error(lang === 'es' ? 'La fecha límite es obligatoria' : 'Due date is required')
      return
    }

    setIsSubmitting(true)
    try {
      const payload = {
        client_id: selectedClientId,
        note: taskForm.note,
        tags: taskForm.tags,
        other_tag_text: taskForm.tags.includes('OTHER') ? taskForm.other_tag_text : null,
        due_date: new Date(taskForm.due_date).toISOString(),
        assignee_id: taskForm.assignee_id || userProfile?.id
      }

      const res = await createTask(payload)
      if (res.success) {
        toast.success(t.successMessage)
        onSuccess()
      } else {
        throw new Error(res.error || t.errorMessage)
      }
    } catch (err: any) {
      toast.error(err.message || t.errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  const isManagerOrAdmin = userProfile?.role === 'MANAGER' || userProfile?.role === 'ADMIN'

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card w-full max-w-2xl rounded-xl shadow-xl border border-border overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center p-6 border-b border-border bg-muted/20">
          <h2 className="text-xl font-bold text-foreground">{t.title}</h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-muted text-muted-foreground hover:text-foreground rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          
          <div className="space-y-2">
            <label className="text-sm font-semibold">{t.clientLabel} *</label>
            {preselectedClientId ? (
              <div className="px-3 py-2 border rounded-md bg-muted/50 text-muted-foreground text-sm font-medium">
                {clients.find(c => c.id === preselectedClientId)?.name || '...'}
                <p className="text-[10px] mt-1 text-primary/70">{t.clientLockedMsg}</p>
              </div>
            ) : (
              <select 
                value={selectedClientId}
                onChange={(e) => setSelectedClientId(e.target.value)}
                className="w-full px-3 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                required
              >
                <option value="">{t.selectClientPlaceholder}</option>
                {clients.map(c => (
                  <option key={c.id} value={c.id}>{c.name} {c.company ? `(${c.company})` : ''}</option>
                ))}
              </select>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold">{t.noteLabel} *</label>
            <textarea 
              value={taskForm.note}
              onChange={e => setTaskForm({...taskForm, note: e.target.value})}
              className="w-full px-3 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm min-h-[100px]"
              placeholder={t.notePlaceholder}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold">{t.tagsLabel}</label>
            <div className="flex flex-wrap gap-2">
              {Object.entries(t.tagsOptions).map(([key, label]) => (
                <label 
                  key={key} 
                  className={`px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer border transition-colors flex items-center gap-1.5
                    ${taskForm.tags.includes(key) ? 'bg-primary text-primary-foreground border-primary' : 'bg-secondary text-secondary-foreground border-border hover:bg-secondary/80'}
                  `}
                >
                  <input 
                    type="checkbox" 
                    className="hidden"
                    checked={taskForm.tags.includes(key)}
                    onChange={() => handleTagToggle(key)}
                  />
                  {label}
                </label>
              ))}
            </div>
            {taskForm.tags.includes('OTHER') && (
              <div className="mt-3">
                <input 
                  type="text" 
                  value={taskForm.other_tag_text}
                  onChange={e => setTaskForm({...taskForm, other_tag_text: e.target.value})}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                  placeholder={t.otherTagLabel}
                  required
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold">{t.dueDateLabel} *</label>
              <input 
                type="datetime-local" 
                value={taskForm.due_date}
                onChange={e => setTaskForm({...taskForm, due_date: e.target.value})}
                className="w-full px-3 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                required
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-semibold">{t.assigneeLabel}</label>
              {isManagerOrAdmin ? (
                <select 
                  value={taskForm.assignee_id}
                  onChange={(e) => setTaskForm({...taskForm, assignee_id: e.target.value})}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                  required
                >
                  <option value={userProfile?.id}>A mi mismo ({userProfile?.name})</option>
                  {agents.filter(a => a.id !== userProfile?.id).map(a => (
                    <option key={a.id} value={a.id}>{a.name} ({a.role})</option>
                  ))}
                </select>
              ) : (
                <div className="w-full px-3 py-2 border rounded-md bg-muted/50 text-muted-foreground text-sm font-medium">
                  {t.assigneeSelfMsg}
                </div>
              )}
            </div>
          </div>

        </form>
        
        <div className="flex justify-end p-6 border-t border-border bg-muted/10 gap-3">
          <button 
            type="button"
            onClick={onClose}
            className="px-5 py-2 font-medium rounded-lg hover:bg-muted transition-colors text-foreground"
            disabled={isSubmitting}
          >
            {t.cancelBtn}
          </button>
          <button 
            type="submit"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-6 py-2 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 flex items-center gap-2 disabled:opacity-50 transition-colors shadow-sm"
          >
            {isSubmitting ? t.savingBtn : t.saveBtn}
          </button>
        </div>
      </div>
    </div>
  )
}
