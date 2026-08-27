"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { getTasks, updateTask } from "@/app/actions/tasks"
import { createNotification } from "@/app/actions/notifications"
import { createClient } from "@/lib/supabase/client"
import { useLanguage } from "@/components/language-provider"
import { BellRing } from "lucide-react"

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const lang = useLanguage()

  useEffect(() => {
    let active = true

    const checkTasks = async () => {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const tasks = await getTasks()
        if (!active || !tasks) return

        const now = new Date()

        for (const task of tasks) {
          if (task.status !== 'PENDING') continue
          // Only process notifications for the assigned user, to avoid other users marking it as notified
          if (task.assignee_id !== user.id) continue

          const dueDate = new Date(task.due_date)
          const timeDiff = dueDate.getTime() - now.getTime()
          const minutesDiff = Math.floor(timeDiff / (1000 * 60))
          const hoursDiff = Math.floor(timeDiff / (1000 * 60 * 60))

          let shouldNotify = false
          let updateFlags: any = {}
          let message = ""
          let title = "Recordatorio de Tarea"

          // Check 1 day (between 23 and 24 hours to avoid double triggers if they open it exactly 1 day before)
          if (!task.notified_1d_before && hoursDiff <= 24 && hoursDiff > 0) {
            shouldNotify = true
            updateFlags.notified_1d_before = true
            message = `La tarea para ${task.client?.name || 'el cliente'} vence en 1 día.`
          }
          // Check 1 hour
          else if (!task.notified_1h_before && hoursDiff <= 1 && minutesDiff > 15) {
            shouldNotify = true
            updateFlags.notified_1h_before = true
            message = `La tarea para ${task.client?.name || 'el cliente'} vence en 1 hora.`
          }
          // Check 15 mins
          else if (!task.notified_15m_before && minutesDiff <= 15 && minutesDiff > 0) {
            shouldNotify = true
            updateFlags.notified_15m_before = true
            message = `¡Atención! La tarea para ${task.client?.name || 'el cliente'} vence en 15 minutos.`
            title = "¡Tarea Urgente!"
          }

          if (shouldNotify) {
            // Optimistically update to avoid duplicate triggers if polled again
            await updateTask(task.id, updateFlags)
            
            // Create notification in DB
            await createNotification(task.assignee_id, task.id, title, message)
            
            // Show toast
            toast.info(message, {
              duration: 10000,
              icon: <BellRing className="w-5 h-5 text-primary" />,
              action: {
                label: lang === 'es' ? 'Ver Tareas' : 'View Tasks',
                onClick: () => window.location.href = '/calendar'
              }
            })
          }
        }
      } catch (e) {
        console.error("Error checking tasks:", e)
      }
    }

    // Check immediately on mount
    checkTasks()

    // Poll every 1 minute
    const interval = setInterval(checkTasks, 60000)

    return () => {
      active = false
      clearInterval(interval)
    }
  }, [lang])

  return <>{children}</>
}
