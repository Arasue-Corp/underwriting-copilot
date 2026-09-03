"use client"

import { useEffect, useState } from 'react'
import { Target, Trophy, Flame, ChevronRight } from "lucide-react"
import { GoalWithProgress } from "@/app/actions/goals"
import confetti from "canvas-confetti"
import Link from 'next/link'

interface GoalsDashboardSectionProps {
  goals: GoalWithProgress[]
  userRole: string
  currentUserId: string
}

export function GoalsDashboardSection({ goals, userRole, currentUserId }: GoalsDashboardSectionProps) {
  const [celebrated, setCelebrated] = useState<Record<string, boolean>>({})

  // Determine which goals to show. 
  // If Admin/Manager, show all (maybe top 3 or a carousel if many, but let's just show them in a grid).
  // If Agent, show only theirs.
  const displayGoals = userRole === 'AGENT' 
    ? goals.filter(g => g.profile_id === currentUserId)
    : goals;

  useEffect(() => {
    // Check if any goal just reached 100% and celebrate
    displayGoals.forEach(goal => {
      if (goal.progress_percentage >= 100 && !celebrated[goal.id]) {
        // Trigger confetti
        const duration = 3 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

        const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

        const interval: any = setInterval(function() {
          const timeLeft = animationEnd - Date.now();

          if (timeLeft <= 0) {
            return clearInterval(interval);
          }

          const particleCount = 50 * (timeLeft / duration);
          confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } }));
          confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } }));
        }, 250);

        setCelebrated(prev => ({ ...prev, [goal.id]: true }))
      }
    })
  }, [displayGoals, celebrated])

  if (displayGoals.length === 0) return null

  const getMotivationalMessage = (progress: number, goalType: string, target: number, current: number) => {
    if (progress >= 100) return "¡Increíble! Has alcanzado la meta. 🏆"
    if (progress >= 80) return `¡Casi lo logras! Solo faltan ${formatValue(target - current, goalType)}.`
    if (progress >= 50) return "¡Vas a la mitad del camino! Sigue así. 🔥"
    if (progress > 0) return "¡Buen comienzo! Mantén el ritmo. 🚀"
    return "¡Tú puedes! Empieza a registrar actividad."
  }

  const formatValue = (val: number, type: string) => {
    if (type === 'VISITS') return val.toString()
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val)
  }

  const getGoalTypeLabel = (type: string) => {
    switch (type) {
      case 'QUOTED_PREMIUM': return 'Primas Cotizadas'
      case 'BOUND_PREMIUM': return 'Primas Cerradas'
      case 'COMMISSIONS': return 'Comisiones'
      case 'VISITS': return 'Visitas a Clientes'
      default: return type
    }
  }

  const getColorClass = (progress: number) => {
    if (progress >= 100) return 'text-emerald-500 bg-emerald-500'
    if (progress >= 75) return 'text-amber-500 bg-amber-500'
    if (progress >= 50) return 'text-blue-500 bg-blue-500'
    return 'text-primary bg-primary'
  }

  return (
    <div className="rounded-2xl glass-panel text-card-foreground flex flex-col overflow-hidden mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col space-y-1.5 p-6 pb-4 border-b border-border/50 bg-gradient-to-r from-primary/5 to-transparent">
        <div className="flex items-center justify-between">
          <h3 className="font-playfair font-semibold text-xl leading-none tracking-tight flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-500" />
            Metas y Objetivos Activos
          </h3>
          {(userRole === 'ADMIN' || userRole === 'MANAGER' || userRole === 'DEMO') && (
            <Link href="/agency" className="text-xs font-semibold text-primary flex items-center hover:underline">
              Gestionar <ChevronRight className="h-3 w-3" />
            </Link>
          )}
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayGoals.map(goal => {
            const isCompleted = goal.progress_percentage >= 100
            const colorClass = getColorClass(goal.progress_percentage)
            
            return (
              <div key={goal.id} className="relative bg-background border border-border/50 rounded-xl p-5 shadow-sm hover:shadow-md transition-all group overflow-hidden">
                {isCompleted && (
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-emerald-600"></div>
                )}
                
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="font-bold text-foreground flex items-center gap-2">
                      {getGoalTypeLabel(goal.goal_type)}
                      {isCompleted && <Flame className="h-4 w-4 text-orange-500 animate-pulse" />}
                    </h4>
                    {userRole !== 'AGENT' && (
                      <p className="text-xs text-muted-foreground mt-1">Agente: <span className="font-semibold text-foreground/80">{goal.profiles?.name}</span></p>
                    )}
                  </div>
                  <div className={`px-2 py-1 rounded-md text-xs font-bold ${isCompleted ? 'bg-emerald-500/10 text-emerald-600' : 'bg-muted text-muted-foreground'}`}>
                    {goal.period_type === 'DAILY' ? 'D' : goal.period_type === 'WEEKLY' ? 'Sem' : goal.period_type === 'MONTHLY' ? 'Mes' : 'Año'}
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex items-end gap-2 mb-2">
                    <span className="text-2xl font-bold font-playfair">{formatValue(goal.current_amount, goal.goal_type)}</span>
                    <span className="text-sm text-muted-foreground mb-1">/ {formatValue(goal.target_amount, goal.goal_type)}</span>
                  </div>

                  <div className="w-full bg-secondary rounded-full h-2.5 overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-1000 ease-out ${colorClass.split(' ')[1]}`} 
                      style={{ width: `${Math.min(100, goal.progress_percentage)}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs font-medium text-muted-foreground">
                      {getMotivationalMessage(goal.progress_percentage, goal.goal_type, goal.target_amount, goal.current_amount)}
                    </span>
                    <span className={`text-xs font-bold ${colorClass.split(' ')[0]}`}>
                      {goal.progress_percentage}%
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
