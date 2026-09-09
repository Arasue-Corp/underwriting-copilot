"use client"

import { useState } from "react"
import { CheckSquare, Calendar, User, Clock } from "lucide-react"
import { useLanguage } from "@/components/language-provider"
import Link from "next/link"
import { format } from "date-fns"
import { es as esLocale } from "date-fns/locale"
import { TaskViewModal } from "@/components/tasks/TaskViewModal"

export function TasksDashboardSection({ tasks }: { tasks: any[] }) {
  const langContext = useLanguage()
  const lang = (langContext === 'en' || langContext === 'es') ? langContext : 'es'
  
  const [selectedTask, setSelectedTask] = useState<any>(null)

  const t = {
    es: {
      title: "Tareas Activas",
      desc: "Tus prÃ³ximas tareas pendientes.",
      viewAll: "Ver todas",
      noTasks: "No tienes tareas activas en este momento.",
      status: {
        PENDING: "Pendiente",
        IN_PROGRESS: "En Proceso"
      }
    },
    en: {
      title: "Active Tasks",
      desc: "Your upcoming pending tasks.",
      viewAll: "View all",
      noTasks: "You have no active tasks at the moment.",
      status: {
        PENDING: "Pending",
        IN_PROGRESS: "In Progress"
      }
    }
  }[lang]

  // Filter out completed and sort by closest due_date
  const activeTasks = tasks
    .filter(t => t.status !== 'COMPLETED')
    .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())
    .slice(0, 5)

  return (
    <>
      <div className="rounded-2xl glass-panel text-card-foreground flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-8 delay-700 duration-700 fill-mode-both">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 rounded-xl">
              <CheckSquare className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-playfair font-semibold text-xl leading-none tracking-tight">{t.title}</h3>
              <p className="text-sm text-muted-foreground mt-1">{t.desc}</p>
            </div>
          </div>
          <Link 
            href="/tasks" 
            className="text-sm font-medium text-primary hover:underline"
          >
            {t.viewAll} &rarr;
          </Link>
        </div>
        
        <div className="p-0">
          {activeTasks.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              {t.noTasks}
            </div>
          ) : (
            <div className="divide-y divide-border">
              {activeTasks.map((task, i) => (
                <div 
                  key={task.id} 
                  className="p-4 sm:px-6 hover:bg-muted/30 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer"
                  onClick={() => setSelectedTask(task)}
                >
                  <div className="flex flex-col gap-1">
                    <span className="font-medium">{task.note}</span>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {format(new Date(task.due_date), "PP p", { locale: lang === 'es' ? esLocale : undefined })}
                      </span>
                      {task.client?.name && (
                        <span className="flex items-center gap-1">
                          <User className="w-3.5 h-3.5" />
                          {task.client.name}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded-full ${
                      task.status === 'IN_PROGRESS' 
                        ? 'bg-blue-500/10 text-blue-600' 
                        : 'bg-amber-500/10 text-amber-600'
                    }`}>
                      {task.status === 'IN_PROGRESS' ? t.status.IN_PROGRESS : t.status.PENDING}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      <TaskViewModal 
        isOpen={!!selectedTask} 
        onClose={() => setSelectedTask(null)} 
        task={selectedTask} 
      />
    </>
  )
}
