"use client"

import { useState } from 'react'
import { Target, Plus, Trash2 } from "lucide-react"
import { AssignGoalModal } from "./AssignGoalModal"
import { GoalWithProgress, deleteGoal } from "@/app/actions/goals"
import { toast } from "sonner"

interface GoalsManagementSectionProps {
  agents: { id: string, name: string }[]
  goals: GoalWithProgress[]
  userRole: string
}

export function GoalsManagementSection({ agents, goals, userRole }: GoalsManagementSectionProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)

  const canManage = userRole === 'ADMIN' || userRole === 'MANAGER' || userRole === 'DEMO'

  const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val)

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta meta?')) return
    setIsDeleting(id)
    const res = await deleteGoal(id)
    setIsDeleting(null)
    if (res.success) {
      toast.success('Meta eliminada')
    } else {
      toast.error('Error al eliminar meta')
    }
  }

  const getGoalTypeLabel = (type: string) => {
    switch (type) {
      case 'QUOTED_PREMIUM': return 'Prima Cotizada'
      case 'BOUND_PREMIUM': return 'Prima Cerrada'
      case 'COMMISSIONS': return 'Comisiones'
      case 'VISITS': return 'Visitas'
      default: return type
    }
  }

  const getGoalPeriodLabel = (period: string) => {
    switch (period) {
      case 'DAILY': return 'Diaria'
      case 'WEEKLY': return 'Semanal'
      case 'MONTHLY': return 'Mensual'
      case 'YEARLY': return 'Anual'
      default: return period
    }
  }

  return (
    <div className="rounded-xl border bg-card shadow-sm overflow-hidden w-full mt-8">
      <div className="bg-muted/30 px-6 py-4 border-b border-border flex justify-between items-center">
        <div>
          <h3 className="font-bold text-lg flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Metas y Objetivos
          </h3>
          <p className="text-sm text-muted-foreground">Monitorea y asigna metas para los agentes de la agencia.</p>
        </div>
        {canManage && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition-colors"
          >
            <Plus className="h-4 w-4" /> Asignar Meta
          </button>
        )}
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left whitespace-nowrap">
          <thead className="bg-muted/10 border-b border-border text-muted-foreground">
            <tr>
              <th className="px-6 py-3 font-medium">Agente</th>
              <th className="px-6 py-3 font-medium">Tipo / Frecuencia</th>
              <th className="px-6 py-3 font-medium">Progreso</th>
              <th className="px-6 py-3 font-medium">Fechas</th>
              {canManage && <th className="px-6 py-3 font-medium text-right">Acciones</th>}
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
                        title="Eliminar Meta"
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
                  No hay metas activas registradas.
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
