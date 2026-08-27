"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { getTasks } from "@/app/actions/tasks"
import { getVisits } from "@/app/actions/visits"
import { useLanguage } from "@/components/language-provider"
import { Calendar, dateFnsLocalizer, Views } from "react-big-calendar"
import { format, parse, startOfWeek, getDay } from "date-fns"
import { es, enUS } from "date-fns/locale"
import "react-big-calendar/lib/css/react-big-calendar.css"
import { Building2, FileText, CheckCircle2 } from "lucide-react"
import { toast } from "sonner"

export default function CalendarPage() {
  const langContext = useLanguage()
  const lang = (langContext === 'en' || langContext === 'es') ? langContext : 'es'
  
  const t = {
    es: {
      title: 'Calendario',
      subtitle: 'Visualiza tus tareas y visitas registradas',
      loading: 'Cargando calendario...',
      tasks: 'Tareas',
      visits: 'Visitas',
      pending: 'Pendientes',
      completed: 'Completadas',
      today: 'Hoy',
      previous: 'Anterior',
      next: 'Siguiente',
      month: 'Mes',
      week: 'Semana',
      day: 'Día',
      agenda: 'Agenda',
      date: 'Fecha',
      time: 'Hora',
      event: 'Evento',
      showMore: '+ Ver más'
    },
    en: {
      title: 'Calendar',
      subtitle: 'Visualize your tasks and registered visits',
      loading: 'Loading calendar...',
      tasks: 'Tasks',
      visits: 'Visits',
      pending: 'Pending',
      completed: 'Completed',
      today: 'Today',
      previous: 'Back',
      next: 'Next',
      month: 'Month',
      week: 'Week',
      day: 'Day',
      agenda: 'Agenda',
      date: 'Date',
      time: 'Time',
      event: 'Event',
      showMore: '+ Show more'
    }
  }[lang]

  const locales = {
    'es': es,
    'en': enUS,
  }

  const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales,
  })

  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      try {
        const [tasks, visits] = await Promise.all([
          getTasks(),
          getVisits()
        ])

        const taskEvents = tasks.map((task: any) => ({
          id: `task-${task.id}`,
          title: `[Tarea] ${task.client?.name || 'Sin Cliente'}: ${task.note}`,
          start: new Date(task.due_date),
          end: new Date(new Date(task.due_date).getTime() + 60 * 60 * 1000), // Add 1 hour by default
          allDay: false,
          resource: { type: 'task', data: task }
        }))

        const visitEvents = visits.map((visit: any) => {
          const vDate = new Date(visit.visit_date || visit.created_at)
          return {
            id: `visit-${visit.id}`,
            title: `[Visita] ${visit.client?.name || 'Sin Cliente'}`,
            start: vDate,
            end: new Date(vDate.getTime() + 60 * 60 * 1000), // Add 1 hour
            allDay: false,
            resource: { type: 'visit', data: visit }
          }
        })

        setEvents([...taskEvents, ...visitEvents])
      } catch (e) {
        console.error(e)
        toast.error("Error al cargar eventos")
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const eventStyleGetter = (event: any, start: any, end: any, isSelected: boolean) => {
    let backgroundColor = '#3b82f6' // blue default for tasks
    if (event.resource.type === 'visit') {
      backgroundColor = '#10b981' // green for visits
    } else if (event.resource.type === 'task' && event.resource.data.status === 'COMPLETED') {
      backgroundColor = '#64748b' // gray for completed tasks
    }
    
    return {
      style: {
        backgroundColor,
        borderRadius: '6px',
        opacity: 0.9,
        color: 'white',
        border: '0px',
        display: 'block'
      }
    }
  }

  const handleSelectEvent = (event: any) => {
    // For now, we can just show a toast or a simple alert.
    // Ideally, open a modal with details.
    if (event.resource.type === 'task') {
      toast.info(`Tarea: ${event.resource.data.note}`)
    } else {
      toast.info(`Visita a: ${event.resource.data.client?.name}`)
    }
  }

  const messages = {
    allDay: lang === 'es' ? 'Todo el día' : 'All Day',
    previous: t.previous,
    next: t.next,
    today: t.today,
    month: t.month,
    week: t.week,
    day: t.day,
    agenda: t.agenda,
    date: t.date,
    time: t.time,
    event: t.event,
    showMore: (total: number) => t.showMore
  }

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6 relative flex flex-col h-screen">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">{t.title}</h2>
        <p className="text-muted-foreground text-sm mt-1">{t.subtitle}</p>
      </div>

      <div className="flex gap-4 items-center">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="w-3 h-3 rounded-full bg-blue-500"></div> {t.tasks} ({t.pending})
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="w-3 h-3 rounded-full bg-emerald-500"></div> {t.visits}
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="w-3 h-3 rounded-full bg-slate-500"></div> {t.tasks} ({t.completed})
        </div>
      </div>

      <div className="flex-1 bg-card rounded-xl border border-border p-4 shadow-sm min-h-[600px]">
        {loading ? (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            {t.loading}
          </div>
        ) : (
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: '100%', width: '100%' }}
            views={[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]}
            defaultView={Views.MONTH}
            culture={lang}
            messages={messages}
            eventPropGetter={eventStyleGetter}
            onSelectEvent={handleSelectEvent}
            className="font-sans text-sm"
          />
        )}
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        .rbc-calendar {
          font-family: inherit;
        }
        .rbc-header {
          padding: 8px;
          font-weight: 600;
        }
        .rbc-today {
          background-color: rgba(var(--primary), 0.05);
        }
        .rbc-event {
          padding: 2px 6px;
        }
        .rbc-toolbar button {
          border-radius: 6px;
        }
        .rbc-toolbar button.rbc-active {
          background-color: var(--primary);
          color: white;
          border-color: var(--primary);
        }
      `}} />
    </div>
  )
}
