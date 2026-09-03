"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export type GoalType = 'QUOTED_PREMIUM' | 'BOUND_PREMIUM' | 'COMMISSIONS' | 'VISITS'
export type GoalPeriod = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY'

export interface Goal {
  id: string
  agency_id: string
  profile_id: string
  goal_type: GoalType
  period_type: GoalPeriod
  target_amount: number
  start_date: string
  end_date: string
  created_at: string
  profiles?: {
    name: string
  }
}

export interface GoalWithProgress extends Goal {
  current_amount: number
  progress_percentage: number
}

export async function createGoal(data: {
  profile_id: string
  goal_type: GoalType
  period_type: GoalPeriod
  target_amount: number
  start_date: string
  end_date: string
}) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Unauthorized' }

  // Get user's agency
  const { data: profile } = await supabase
    .from('profiles')
    .select('agency_id, role')
    .eq('id', user.id)
    .single()

  if (!profile || !profile.agency_id) {
    return { success: false, error: 'Agency not found' }
  }

  if (profile.role !== 'ADMIN' && profile.role !== 'MANAGER' && profile.role !== 'DEMO') {
    return { success: false, error: 'Not authorized to assign goals' }
  }

  const { data: newGoal, error } = await supabase
    .from('agency_goals')
    .insert({
      agency_id: profile.agency_id,
      profile_id: data.profile_id,
      goal_type: data.goal_type,
      period_type: data.period_type,
      target_amount: data.target_amount,
      start_date: data.start_date,
      end_date: data.end_date
    })
    .select()
    .single()

  if (error) {
    console.error("Error creating goal:", error)
    return { success: false, error: error.message }
  }

  revalidatePath('/agency')
  revalidatePath('/')
  
  return { success: true, data: newGoal }
}

export async function deleteGoal(goalId: string) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('agency_goals')
    .delete()
    .eq('id', goalId)
    
  if (error) {
    return { success: false, error: error.message }
  }
  
  revalidatePath('/agency')
  revalidatePath('/')
  return { success: true }
}

// Calculate progress for a set of goals
async function calculateProgressForGoals(supabase: any, agencyId: string, goals: Goal[]): Promise<GoalWithProgress[]> {
  if (!goals || goals.length === 0) return []

  let minDate = goals[0].start_date
  let maxDate = goals[0].end_date

  goals.forEach(g => {
    if (g.start_date < minDate) minDate = g.start_date
    if (g.end_date > maxDate) maxDate = g.end_date
  })

  const maxDatePlusOne = new Date(maxDate)
  maxDatePlusOne.setDate(maxDatePlusOne.getDate() + 1)
  const maxDateStr = maxDatePlusOne.toISOString().split('T')[0]

  const { data: quotes } = await supabase
    .from('quote_requests')
    .select('id, agent_id, status, premium_amount, sold_premium, commission_percentage, created_at, accepted_at')
    .eq('agency_id', agencyId)
    .gte('created_at', minDate)
    .lt('created_at', maxDateStr)
    
  const { data: acceptedQuotes } = await supabase
    .from('quote_requests')
    .select('id, agent_id, status, premium_amount, sold_premium, commission_percentage, created_at, accepted_at')
    .eq('agency_id', agencyId)
    .eq('status', 'ACCEPTED')
    .gte('accepted_at', minDate)
    .lt('accepted_at', maxDateStr)

  const { data: visits } = await supabase
    .from('visits')
    .select('id, agent_id, created_at')
    .eq('agency_id', agencyId)
    .gte('created_at', minDate)
    .lt('created_at', maxDateStr)

  const allQuotes = [...(quotes || [])]
  if (acceptedQuotes) {
    acceptedQuotes.forEach((aq: any) => {
      if (!allQuotes.find(q => q.id === aq.id)) {
        allQuotes.push(aq)
      }
    })
  }

  return goals.map(goal => {
    let current = 0
    
    const gStart = new Date(goal.start_date).getTime()
    
    const gEndDt = new Date(goal.end_date)
    gEndDt.setDate(gEndDt.getDate() + 1) 
    const gEnd = gEndDt.getTime()

    if (goal.goal_type === 'QUOTED_PREMIUM') {
      const relevantQuotes = allQuotes.filter(q => 
        q.agent_id === goal.profile_id && 
        new Date(q.created_at).getTime() >= gStart && 
        new Date(q.created_at).getTime() < gEnd
      )
      current = relevantQuotes.reduce((acc, q) => acc + (Number(q.premium_amount) || 0), 0)
    } 
    else if (goal.goal_type === 'BOUND_PREMIUM') {
      const relevantQuotes = allQuotes.filter(q => 
        q.agent_id === goal.profile_id && 
        q.status === 'ACCEPTED' &&
        (
          (q.accepted_at && new Date(q.accepted_at).getTime() >= gStart && new Date(q.accepted_at).getTime() < gEnd) ||
          (!q.accepted_at && new Date(q.created_at).getTime() >= gStart && new Date(q.created_at).getTime() < gEnd)
        )
      )
      current = relevantQuotes.reduce((acc, q) => acc + (Number(q.sold_premium) || Number(q.premium_amount) || 0), 0)
    }
    else if (goal.goal_type === 'COMMISSIONS') {
      const relevantQuotes = allQuotes.filter(q => 
        q.agent_id === goal.profile_id && 
        q.status === 'ACCEPTED' &&
        (
          (q.accepted_at && new Date(q.accepted_at).getTime() >= gStart && new Date(q.accepted_at).getTime() < gEnd) ||
          (!q.accepted_at && new Date(q.created_at).getTime() >= gStart && new Date(q.created_at).getTime() < gEnd)
        )
      )
      current = relevantQuotes.reduce((acc, q) => {
        const premium = Number(q.sold_premium) || Number(q.premium_amount) || 0
        const pct = Number(q.commission_percentage) || 0
        return acc + (premium * pct / 100)
      }, 0)
    }
    else if (goal.goal_type === 'VISITS') {
      const relevantVisits = (visits || []).filter((v: any) => 
        v.agent_id === goal.profile_id && 
        new Date(v.created_at).getTime() >= gStart && 
        new Date(v.created_at).getTime() < gEnd
      )
      current = relevantVisits.length
    }

    const pct = goal.target_amount > 0 ? (current / goal.target_amount) * 100 : 0

    return {
      ...goal,
      current_amount: current,
      progress_percentage: Math.min(100, Math.round(pct))
    }
  })
}

export async function getAgencyGoals(activeOnly: boolean = true) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data: profile } = await supabase
    .from('profiles')
    .select('agency_id')
    .eq('id', user.id)
    .single()

  if (!profile || !profile.agency_id) return []

  let query = supabase
    .from('agency_goals')
    .select('*, profiles(name)')
    .eq('agency_id', profile.agency_id)
    .order('end_date', { ascending: false })
    
  if (activeOnly) {
    const today = new Date().toISOString().split('T')[0]
    query = query.gte('end_date', today)
  }

  const { data: goals } = await query

  if (!goals) return []
  
  return await calculateProgressForGoals(supabase, profile.agency_id, goals as Goal[])
}

export async function getAgentGoals(activeOnly: boolean = true) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data: profile } = await supabase
    .from('profiles')
    .select('agency_id')
    .eq('id', user.id)
    .single()

  if (!profile || !profile.agency_id) return []

  let query = supabase
    .from('agency_goals')
    .select('*, profiles(name)')
    .eq('profile_id', user.id)
    .order('end_date', { ascending: false })
    
  if (activeOnly) {
    const today = new Date().toISOString().split('T')[0]
    query = query.gte('end_date', today)
  }

  const { data: goals } = await query

  if (!goals) return []
  
  return await calculateProgressForGoals(supabase, profile.agency_id, goals as Goal[])
}
