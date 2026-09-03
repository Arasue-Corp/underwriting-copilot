"use client"

import { useState, useTransition } from 'react'
import { X, Target, Calendar } from "lucide-react"
import { toast } from "sonner"
import { createGoal, GoalType, GoalPeriod } from "@/app/actions/goals"

interface AssignGoalModalProps {
  isOpen: boolean
  onClose: () => void
  agents: { id: string, name: string }[]
  onSuccess?: () => void
}

export function AssignGoalModal({ isOpen, onClose, agents, onSuccess }: AssignGoalModalProps) {
  const [isPending, startTransition] = useTransition()
  
  const [formData, setFormData] = useState({
    profile_id: '',
    goal_type: 'BOUND_PREMIUM' as GoalType,
    period_type: 'MONTHLY' as GoalPeriod,
    target_amount: '',
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0] // end of month
  })

  if (!isOpen) return null

  // Helper to auto-set dates based on period
  const handlePeriodChange = (period: GoalPeriod) => {
    const now = new Date()
    let start = now
    let end = now

    if (period === 'DAILY') {
      start = now
      end = now
    } else if (period === 'WEEKLY') {
      const day = now.getDay()
      const diff = now.getDate() - day + (day == 0 ? -6 : 1) // adjust when day is sunday
      start = new Date(now.setDate(diff))
      end = new Date(start)
      end.setDate(end.getDate() + 6)
    } else if (period === 'MONTHLY') {
      start = new Date(now.getFullYear(), now.getMonth(), 1)
      end = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    } else if (period === 'YEARLY') {
      start = new Date(now.getFullYear(), 0, 1)
      end = new Date(now.getFullYear(), 11, 31)
    }

    setFormData({
      ...formData,
      period_type: period,
      start_date: start.toISOString().split('T')[0],
      end_date: end.toISOString().split('T')[0]
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.profile_id) {
      toast.error('Por favor selecciona un agente')
      return
    }

    if (!formData.target_amount || Number(formData.target_amount) <= 0) {
      toast.error('Ingresa una cantidad vlida')
      return
    }

    startTransition(async () => {
      const res = await createGoal({
        ...formData,
        target_amount: Number(formData.target_amount)
      })

      if (res.success) {
        toast.success('Meta asignada correctamente')
        if (onSuccess) onSuccess()
        onClose()
      } else {
        toast.error(res.error || 'Error al asignar la meta')
      }
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-card w-full max-w-lg rounded-2xl border shadow-xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        <div className="flex items-center justify-between p-6 border-b border-border/50">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-xl text-primary">
              <Target className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-bold font-playfair">Asignar Nueva Meta</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-full transition-colors"
          >
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[70vh]">
          <form id="goal-form" onSubmit={handleSubmit} className="space-y-5">
            
            <div>
              <label className="text-sm font-semibold mb-1 block">Agente</label>
              <select
                className="w-full bg-background border border-input rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary outline-none"
                value={formData.profile_id}
                onChange={e => setFormData({...formData, profile_id: e.target.value})}
                required
              >
                <option value="">-- Seleccionar Agente --</option>
                {agents.map(agent => (
                  <option key={agent.id} value={agent.id}>{agent.name}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold mb-1 block">Tipo de Meta</label>
                <select
                  className="w-full bg-background border border-input rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary outline-none"
                  value={formData.goal_type}
                  onChange={e => setFormData({...formData, goal_type: e.target.value as GoalType})}
                >
                  <option value="BOUND_PREMIUM">Prima Cerrada ($)</option>
                  <option value="QUOTED_PREMIUM">Prima Cotizada ($)</option>
                  <option value="COMMISSIONS">Comisiones ($)</option>
                  <option value="VISITS">Visitas a Clientes (#)</option>
                </select>
              </div>
              
              <div>
                <label className="text-sm font-semibold mb-1 block">Frecuencia</label>
                <select
                  className="w-full bg-background border border-input rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary outline-none"
                  value={formData.period_type}
                  onChange={e => handlePeriodChange(e.target.value as GoalPeriod)}
                >
                  <option value="DAILY">Diaria</option>
                  <option value="WEEKLY">Semanal</option>
                  <option value="MONTHLY">Mensual</option>
                  <option value="YEARLY">Anual</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold mb-1 block">
                {formData.goal_type === 'VISITS' ? 'Cantidad (Nmero de Visitas)' : 'Monto Objetivo ($)'}
              </label>
              <input
                type="number"
                min="1"
                step={formData.goal_type === 'VISITS' ? "1" : "0.01"}
                className="w-full bg-background border border-input rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary outline-none"
                value={formData.target_amount}
                onChange={e => setFormData({...formData, target_amount: e.target.value})}
                placeholder={formData.goal_type === 'VISITS' ? 'Ej. 10' : 'Ej. 15000'}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-border/50">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block flex items-center gap-1"><Calendar className="w-3 h-3"/> Fecha de Inicio</label>
                <input
                  type="date"
                  className="w-full bg-background border border-input rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                  value={formData.start_date}
                  onChange={e => setFormData({...formData, start_date: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block flex items-center gap-1"><Calendar className="w-3 h-3"/> Fecha de Fin</label>
                <input
                  type="date"
                  className="w-full bg-background border border-input rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                  value={formData.end_date}
                  onChange={e => setFormData({...formData, end_date: e.target.value})}
                  required
                />
              </div>
            </div>

          </form>
        </div>

        <div className="p-6 border-t border-border/50 bg-muted/20 flex justify-end gap-3">
          <button 
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-medium border bg-background hover:bg-muted transition-colors"
            disabled={isPending}
          >
            Cancelar
          </button>
          <button 
            type="submit"
            form="goal-form"
            className="px-6 py-2 rounded-xl text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors flex items-center gap-2"
            disabled={isPending}
          >
            {isPending ? 'Guardando...' : 'Asignar Meta'}
          </button>
        </div>
      </div>
    </div>
  )
}
