"use client"

import { useState, useEffect } from 'react'
import { X, History, Activity, Calendar, Trophy, AlertCircle } from "lucide-react"
import { getGoalHistory, GoalHistoryPeriod, GoalWithProgress } from "@/app/actions/goals"
import { useLanguage } from '@/components/language-provider'

interface GoalHistoryModalProps {
  isOpen: boolean
  onClose: () => void
  goal: GoalWithProgress | null
}

export function GoalHistoryModal({ isOpen, onClose, goal }: GoalHistoryModalProps) {
  const [history, setHistory] = useState<GoalHistoryPeriod[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const lang = useLanguage()

  const t = {
    es: {
      title: 'Bitácora de Meta',
      agent: 'Agente',
      goalType: 'Tipo',
      frequency: 'Frecuencia',
      period: 'Periodo',
      target: 'Meta',
      achieved: 'Logrado',
      status: 'Estatus',
      current: 'Actual',
      loading: 'Cargando bitácora...',
      noHistory: 'Aún no hay historial para esta meta.',
      met: 'Cumplida',
      notMet: 'No Cumplida',
      close: 'Cerrar'
    },
    en: {
      title: 'Goal Logbook',
      agent: 'Agent',
      goalType: 'Type',
      frequency: 'Frequency',
      period: 'Period',
      target: 'Target',
      achieved: 'Achieved',
      status: 'Status',
      current: 'Current',
      loading: 'Loading logbook...',
      noHistory: 'No history available for this goal yet.',
      met: 'Met',
      notMet: 'Not Met',
      close: 'Close'
    }
  }[lang]

  useEffect(() => {
    if (isOpen && goal) {
      setIsLoading(true)
      getGoalHistory(goal.id).then(data => {
        setHistory(data)
        setIsLoading(false)
      })
    }
  }, [isOpen, goal])

  if (!isOpen || !goal) return null

  const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val)
  const formatNumber = (val: number) => new Intl.NumberFormat('en-US').format(val)
  
  const formatAmount = (val: number, type: string) => {
    return type === 'VISITS' ? formatNumber(val) : formatCurrency(val)
  }

  const getGoalTypeLabel = (type: string) => {
    const labels: Record<string, { es: string, en: string }> = {
      'QUOTED_PREMIUM': { es: 'Prima Cotizada', en: 'Quoted Premium' },
      'BOUND_PREMIUM': { es: 'Prima Cerrada', en: 'Bound Premium' },
      'COMMISSIONS': { es: 'Comisiones', en: 'Commissions' },
      'VISITS': { es: 'Visitas', en: 'Visits' }
    }
    return labels[type] ? labels[type][lang as 'es'|'en'] : type
  }

  const getPeriodLabel = (period: string) => {
    const labels: Record<string, { es: string, en: string }> = {
      'DAILY': { es: 'Diaria', en: 'Daily' },
      'WEEKLY': { es: 'Semanal', en: 'Weekly' },
      'MONTHLY': { es: 'Mensual', en: 'Monthly' },
      'YEARLY': { es: 'Anual', en: 'Yearly' }
    }
    return labels[period] ? labels[period][lang as 'es'|'en'] : period
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-card w-full max-w-4xl rounded-2xl border shadow-xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 max-h-[85vh]">
        
        <div className="flex items-center justify-between p-6 border-b border-border/50">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-xl text-primary">
              <History className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold leading-none">{t.title}</h2>
              <p className="text-sm text-muted-foreground mt-1">
                {goal.profiles?.name} • {getGoalTypeLabel(goal.goal_type)} ({getPeriodLabel(goal.period_type)})
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-full transition-colors"
          >
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        <div className="p-0 overflow-y-auto flex-1 bg-muted/10">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
              <Activity className="h-8 w-8 animate-spin mb-4" />
              <p>{t.loading}</p>
            </div>
          ) : history.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
              <AlertCircle className="h-10 w-10 mb-4 opacity-50" />
              <p>{t.noHistory}</p>
            </div>
          ) : (
            <div className="p-6">
              <div className="rounded-xl border bg-card overflow-hidden">
                <table className="w-full text-sm text-left">
                  <thead className="bg-muted/50 text-muted-foreground text-xs uppercase font-semibold">
                    <tr>
                      <th className="px-6 py-4">{t.period}</th>
                      <th className="px-6 py-4 text-right">{t.target}</th>
                      <th className="px-6 py-4 text-right">{t.achieved}</th>
                      <th className="px-6 py-4 text-center">Progreso</th>
                      <th className="px-6 py-4 text-center">{t.status}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {history.map((period, i) => {
                      const isMet = period.progress_percentage >= 100
                      return (
                        <tr key={i} className={`hover:bg-muted/20 transition-colors ${period.is_current ? 'bg-primary/5' : ''}`}>
                          <td className="px-6 py-4 font-medium whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-muted-foreground" />
                              {period.period_start} <span className="text-muted-foreground">al</span> {period.period_end}
                              {period.is_current && (
                                <span className="ml-2 text-[10px] uppercase font-bold bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                                  {t.current}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right font-medium text-muted-foreground">
                            {formatAmount(period.target_amount, goal.goal_type)}
                          </td>
                          <td className="px-6 py-4 text-right font-bold">
                            {formatAmount(period.current_amount, goal.goal_type)}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-center gap-2">
                              <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                                <div 
                                  className={`h-full rounded-full ${isMet ? 'bg-green-500' : 'bg-primary'}`}
                                  style={{ width: `${Math.min(100, period.progress_percentage)}%` }}
                                />
                              </div>
                              <span className="text-xs font-medium w-9">{period.progress_percentage}%</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            {isMet ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20">
                                <Trophy className="w-3.5 h-3.5" /> {t.met}
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20">
                                <Activity className="w-3.5 h-3.5" /> {t.notMet}
                              </span>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-border/50 bg-muted/20 flex justify-end">
          <button 
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl text-sm font-medium border bg-background hover:bg-muted transition-colors"
          >
            {t.close}
          </button>
        </div>
      </div>
    </div>
  )
}
