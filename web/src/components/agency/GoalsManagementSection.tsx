"use client"

import { useState } from 'react'
import { Target, Plus, Trash2 } from "lucide-react"
import { AssignGoalModal } from "./AssignGoalModal"
import { GoalWithProgress, deleteGoal } from "@/app/actions/goals"
import { toast } from "sonner"
import { useLanguage } from '@/components/language-provider'

interface GoalsManagementSectionProps {
  agents: { id: string, name: string }[]
  goals: GoalWithProgress[]
  userRole: string
}

export function GoalsManagementSection({ agents, goals, userRole }: GoalsManagementSectionProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const lang = useLanguage()

  const t = {
    es: {
      confirmDelete: '¿Estás seguro de eliminar esta meta?',
      deleted: 'Meta eliminada',
      deleteError: 'Error al eliminar meta',
      title: 'Metas y Objetivos',
      desc: 'Monitorea y asigna metas para los agentes de la agencia.',
      assignBtn: 'Asignar Meta',
      colAgent: 'Agente',
      colTypeFreq: 'Tipo / Frecuencia',
      colProgress: 'Progreso',
      colDates: 'Fechas',
      colActions: 'Acciones',
      empty: 'No hay metas activas registradas.',
      delTitle: 'Eliminar Meta',
      types: {
        QUOTED_PREMIUM: 'Prima Cotizada',
        BOUND_PREMIUM: 'Prima Cerrada',
        COMMISSIONS: 'Comisiones',
        VISITS: 'Visitas'
      } as Record<string, string>,
      periods: {
        DAILY: 'Diaria',
        WEEKLY: 'Semanal',
        MONTHLY: 'Mensual',
        YEARLY: 'Anual'
      } as Record<string, string>
    },
    en: {
      confirmDelete: 'Are you sure you want to delete this goal?',
      deleted: 'Goal deleted',
      deleteError: 'Error deleting goal',
      title: 'Goals & Objectives',
      desc: 'Monitor and assign goals for agency agents.',
      assignBtn: 'Assign Goal',
      colAgent: 'Agent',
      colTypeFreq: 'Type / Frequency',
      colProgress: 'Progress',
      colDates: 'Dates',
      colActions: 'Actions',
      empty: 'No active goals registered.',
      delTitle: 'Delete Goal',
      types: {
        QUOTED_PREMIUM: 'Quoted Premium',
        BOUND_PREMIUM: 'Bound Premium',
        COMMISSIONS: 'Commissions',
        VISITS: 'Visits'
      } as Record<string, string>,
      periods: {
        DAILY: 'Daily',
        WEEKLY: 'Weekly',
        MONTHLY: 'Monthly',
        YEARLY: 'Yearly'
      } as Record<string, string>
    }
  }[lang]

  const canManage = userRole === 'ADMIN' || userRole === 'MANAGER' || userRole === 'DEMO'

  const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val)

  const handleDelete = async (id: string) => {
    if (!confirm(t.confirmDelete)) return
    setIsDeleting(id)
    const res = await deleteGoal(id)
    setIsDeleting(null)
    if (res.success) {
      toast.success(t.deleted)
    } else {
      toast.error(t.deleteError)
    }
  }

  const getGoalTypeLabel = (type: string) => {
    return t.types[type] || type
  }

  const getGoalPeriodLabel = (period: string) => {
    return t.periods[period] || period
  }

  return (
    <div className="rounded-xl border bg-card shadow-sm overflow-hidden w-full mt-8">
      <div className="bg-muted/30 px-6 py-4 border-b border-border flex justify-between items-center">
        <div>
          <h3 className="font-bold text-lg flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            {t.title}
          </h3>
          <p className="text-sm text-muted-foreground">{t.desc}</p>
        </div>
        {canManage && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition-colors"
          >
            <Plus className="h-4 w-4" /> {t.assignBtn}
          </button>
        )}
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left whitespace-nowrap">
          <thead className="bg-muted/10 border-b border-border text-muted-foreground">
            <tr>
              <th className="px-6 py-3 font-medium">{t.colAgent}</th>
              <th className="px-6 py-3 font-medium">{t.colTypeFreq}</th>
              <th className="px-6 py-3 font-medium">{t.colProgress}</th>
              <th className="px-6 py-3 font-medium">{t.colDates}</th>
              {canManage && <th className="px-6 py-3 font-medium text-right">{t.colActions}</th>}
            </tr>
          </thead>
          <tbody>
            {goals.map((goal) => {
              const isCurrency = goal.goal_type !== 'VISITS'
              return (
                <tr key={goal.id} className="border-b border-border/50 last:border-0 hover:bg-muted/10">
                  <td className="px-6 py-4 font-medium">
                    {goal.profiles?.name}
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium">{getGoalTypeLabel(goal.goal_type)}</div>
                    <div className="text-xs text-muted-foreground">{getGoalPeriodLabel(goal.period_type)}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs">
                        {isCurrency ? formatCurrency(goal.current_amount) : goal.current_amount} 
                        <span className="text-muted-foreground font-normal"> / {isCurrency ? formatCurrency(goal.target_amount) : goal.target_amount}</span>
                      </span>
                      <span className="text-xs font-bold text-primary">{goal.progress_percentage}%</span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all" 
                        style={{ width: `${Math.min(100, goal.progress_percentage)}%` }}
                      ></div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs text-muted-foreground">
                    {goal.start_date} a {goal.end_date}
                  </td>
                  {canManage && (
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => handleDelete(goal.id)}
                        disabled={isDeleting === goal.id}
                        className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                        title={t.delTitle}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  )}
                </tr>
              )
            })}
            {goals.length === 0 && (
              <tr>
                <td colSpan={canManage ? 5 : 4} className="px-6 py-8 text-center text-muted-foreground">
                  {t.empty}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <AssignGoalModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        agents={agents} 
      />
    </div>
  )
}
