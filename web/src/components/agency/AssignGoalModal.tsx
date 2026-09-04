"use client"

import { useState, useTransition } from 'react'
import { X, Target, Calendar, Repeat } from "lucide-react"
import { toast } from "sonner"
import { createGoal, GoalType, GoalPeriod } from "@/app/actions/goals"
import { useLanguage } from '@/components/language-provider'

interface AssignGoalModalProps {
  isOpen: boolean
  onClose: () => void
  agents: { id: string, name: string }[]
  onSuccess?: () => void
}

export function AssignGoalModal({ isOpen, onClose, agents, onSuccess }: AssignGoalModalProps) {
  const [isPending, startTransition] = useTransition()
  const lang = useLanguage()

  const t = {
    es: {
      title: 'Asignar Nueva Meta Recurrente',
      selectAgentToast: 'Por favor selecciona un agente',
      validAmountToast: 'Ingresa una cantidad válida',
      successToast: 'Meta recurrente asignada correctamente',
      errorToast: 'Error al asignar la meta',
      agent: 'Agente',
      selectAgent: '-- Seleccionar Agente --',
      goalType: 'Tipo de Meta',
      boundPrem: 'Prima Cerrada ($)',
      quotedPrem: 'Prima Cotizada ($)',
      comms: 'Comisiones ($)',
      visits: 'Visitas a Clientes (#)',
      frequency: 'Frecuencia',
      daily: 'Diaria (se renueva cada día)',
      weekly: 'Semanal (se renueva cada lunes)',
      monthly: 'Mensual (se renueva cada mes)',
      yearly: 'Anual (se renueva cada año)',
      qtyLabel: 'Cantidad Objetivo por Periodo',
      amtLabel: 'Monto Objetivo por Periodo ($)',
      qtyPh: 'Ej. 10',
      amtPh: 'Ej. 15000',
      startDt: 'Inicio de Recurrencia',
      cancel: 'Cancelar',
      save: 'Asignar Meta',
      saving: 'Guardando...'
    },
    en: {
      title: 'Assign New Recurring Goal',
      selectAgentToast: 'Please select an agent',
      validAmountToast: 'Enter a valid amount',
      successToast: 'Recurring goal assigned successfully',
      errorToast: 'Error assigning goal',
      agent: 'Agent',
      selectAgent: '-- Select Agent --',
      goalType: 'Goal Type',
      boundPrem: 'Bound Premium ($)',
      quotedPrem: 'Quoted Premium ($)',
      comms: 'Commissions ($)',
      visits: 'Client Visits (#)',
      frequency: 'Frequency',
      daily: 'Daily (renews every day)',
      weekly: 'Weekly (renews every Monday)',
      monthly: 'Monthly (renews every month)',
      yearly: 'Yearly (renews every year)',
      qtyLabel: 'Target Quantity per Period',
      amtLabel: 'Target Amount per Period ($)',
      qtyPh: 'e.g. 10',
      amtPh: 'e.g. 15000',
      startDt: 'Recurrence Start Date',
      cancel: 'Cancel',
      save: 'Assign Goal',
      saving: 'Saving...'
    }
  }[lang]
  
  const [formData, setFormData] = useState({
    profile_id: '',
    goal_type: 'BOUND_PREMIUM' as GoalType,
    period_type: 'MONTHLY' as GoalPeriod,
    target_amount: '',
    start_date: new Date().toISOString().split('T')[0]
  })

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.profile_id) {
      toast.error(t.selectAgentToast)
      return
    }

    if (!formData.target_amount || Number(formData.target_amount) <= 0) {
      toast.error(t.validAmountToast)
      return
    }

    startTransition(async () => {
      const res = await createGoal({
        ...formData,
        target_amount: Number(formData.target_amount),
        end_date: '2099-12-31' // Far future date, effectively infinite recurrence
      })

      if (res.success) {
        toast.success(t.successToast)
        if (onSuccess) onSuccess()
        onClose()
      } else {
        toast.error(res.error || t.errorToast)
      }
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-card w-full max-w-lg rounded-2xl border shadow-xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        <div className="flex items-center justify-between p-6 border-b border-border/50">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-xl text-primary">
              <Repeat className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-bold">{t.title}</h2>
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
              <label className="text-sm font-semibold mb-1 block">{t.agent}</label>
              <select
                className="w-full bg-background border border-input rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary outline-none"
                value={formData.profile_id}
                onChange={e => setFormData({...formData, profile_id: e.target.value})}
                required
              >
                <option value="">{t.selectAgent}</option>
                {agents.map(agent => (
                  <option key={agent.id} value={agent.id}>{agent.name}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold mb-1 block">{t.goalType}</label>
                <select
                  className="w-full bg-background border border-input rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary outline-none"
                  value={formData.goal_type}
                  onChange={e => setFormData({...formData, goal_type: e.target.value as GoalType})}
                >
                  <option value="BOUND_PREMIUM">{t.boundPrem}</option>
                  <option value="QUOTED_PREMIUM">{t.quotedPrem}</option>
                  <option value="COMMISSIONS">{t.comms}</option>
                  <option value="VISITS">{t.visits}</option>
                </select>
              </div>
              
              <div>
                <label className="text-sm font-semibold mb-1 block">{t.frequency}</label>
                <select
                  className="w-full bg-background border border-input rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary outline-none"
                  value={formData.period_type}
                  onChange={e => setFormData({...formData, period_type: e.target.value as GoalPeriod})}
                >
                  <option value="DAILY">{t.daily}</option>
                  <option value="WEEKLY">{t.weekly}</option>
                  <option value="MONTHLY">{t.monthly}</option>
                  <option value="YEARLY">{t.yearly}</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold mb-1 block">
                {formData.goal_type === 'VISITS' ? t.qtyLabel : t.amtLabel}
              </label>
              <input
                type="number"
                min="1"
                step={formData.goal_type === 'VISITS' ? "1" : "0.01"}
                className="w-full bg-background border border-input rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary outline-none"
                value={formData.target_amount}
                onChange={e => setFormData({...formData, target_amount: e.target.value})}
                placeholder={formData.goal_type === 'VISITS' ? t.qtyPh : t.amtPh}
                required
              />
            </div>

            <div className="pt-2 border-t border-border/50">
              <label className="text-xs text-muted-foreground mb-1 block flex items-center gap-1"><Calendar className="w-3 h-3"/> {t.startDt}</label>
              <input
                type="date"
                className="w-full bg-background border border-input rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                value={formData.start_date}
                onChange={e => setFormData({...formData, start_date: e.target.value})}
                required
              />
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
            {t.cancel}
          </button>
          <button 
            type="submit"
            form="goal-form"
            className="px-6 py-2 rounded-xl text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors flex items-center gap-2"
            disabled={isPending}
          >
            {isPending ? t.saving : t.save}
          </button>
        </div>
      </div>
    </div>
  )
}
