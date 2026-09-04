"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { toZonedTime, fromZonedTime } from "date-fns-tz"

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
  current_period_start?: string
  current_period_end?: string
}

export interface GoalHistoryPeriod {
  period_start: string
  period_end: string
  current_amount: number
  target_amount: number
  progress_percentage: number
  is_current: boolean
}

function getPeriodBoundariesForDate(date: Date, period: GoalPeriod) {
  const timeZone = 'America/Los_Angeles'
  const zonedDate = toZonedTime(date, timeZone)

  const start = new Date(zonedDate)
  const end = new Date(zonedDate)
  
  if (period === 'DAILY') {
    start.setHours(0,0,0,0)
    end.setHours(23,59,59,999)
  } else if (period === 'WEEKLY') {
    const day = start.getDay()
    const diff = start.getDate() - day + (day === 0 ? -6 : 1) // Start on Monday
    start.setDate(diff)
    start.setHours(0,0,0,0)
    end.setTime(start.getTime())
    end.setDate(end.getDate() + 6)
    end.setHours(23,59,59,999)
  } else if (period === 'MONTHLY') {
    start.setDate(1)
    start.setHours(0,0,0,0)
    end.setMonth(end.getMonth() + 1)
    end.setDate(0)
    end.setHours(23,59,59,999)
  } else if (period === 'YEARLY') {
    start.setMonth(0, 1)
    start.setHours(0,0,0,0)
    end.setMonth(11, 31)
    end.setHours(23,59,59,999)
  }
  
  const utcStart = fromZonedTime(start, timeZone)
  const utcEnd = fromZonedTime(end, timeZone)

  return { start: utcStart, end: utcEnd, zonedStart: start, zonedEnd: end }
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

// Calculate progress for a set of goals for their CURRENT period
async function calculateProgressForGoals(supabase: any, agencyId: string, goals: Goal[]): Promise<GoalWithProgress[]> {
  if (!goals || goals.length === 0) return []

  let globalMin = new Date('2099-12-31').getTime()
  let globalMax = 0
  const now = new Date()

  const goalPeriods = goals.map(g => {
    const { start, end, zonedStart, zonedEnd } = getPeriodBoundariesForDate(now, g.period_type)
    if (start.getTime() < globalMin) globalMin = start.getTime()
    if (end.getTime() > globalMax) globalMax = end.getTime()
    return { ...g, pStart: start.getTime(), pEnd: end.getTime(), startStr: zonedStart.toISOString(), endStr: zonedEnd.toISOString() }
  })

  const minDateStr = new Date(globalMin).toISOString()
  const maxDateStr = new Date(globalMax).toISOString()

  const { data: quotes } = await supabase
    .from('quote_requests')
    .select('id, agent_id, status, premium_amount, sold_premium, commission_percentage, created_at, accepted_at')
    .eq('agency_id', agencyId)
    .gte('created_at', minDateStr)
    .lte('created_at', maxDateStr)
    
  const { data: acceptedQuotes } = await supabase
    .from('quote_requests')
    .select('id, agent_id, status, premium_amount, sold_premium, commission_percentage, created_at, accepted_at')
    .eq('agency_id', agencyId)
    .eq('status', 'ACCEPTED')
    .gte('accepted_at', minDateStr)
    .lte('accepted_at', maxDateStr)

  // Fix: fetching created_by and assigned_to for visits
  const { data: visits } = await supabase
    .from('visits')
    .select('id, created_by, assigned_to, created_at')
    .eq('agency_id', agencyId)
    .gte('created_at', minDateStr)
    .lte('created_at', maxDateStr)

  const allQuotes = [...(quotes || [])]
  if (acceptedQuotes) {
    acceptedQuotes.forEach((aq: any) => {
      if (!allQuotes.find(q => q.id === aq.id)) {
        allQuotes.push(aq)
      }
    })
  }

  return goalPeriods.map(goal => {
    let current = 0
    const pStart = goal.pStart
    const pEnd = goal.pEnd

    if (goal.goal_type === 'QUOTED_PREMIUM') {
      const relevantQuotes = allQuotes.filter(q => 
        q.agent_id === goal.profile_id && 
        new Date(q.created_at).getTime() >= pStart && 
        new Date(q.created_at).getTime() <= pEnd
      )
      current = relevantQuotes.reduce((acc, q) => acc + (Number(q.premium_amount) || 0), 0)
    } 
    else if (goal.goal_type === 'BOUND_PREMIUM') {
      const relevantQuotes = allQuotes.filter(q => 
        q.agent_id === goal.profile_id && 
        q.status === 'ACCEPTED' &&
        (
          (q.accepted_at && new Date(q.accepted_at).getTime() >= pStart && new Date(q.accepted_at).getTime() <= pEnd) ||
          (!q.accepted_at && new Date(q.created_at).getTime() >= pStart && new Date(q.created_at).getTime() <= pEnd)
        )
      )
      current = relevantQuotes.reduce((acc, q) => acc + (Number(q.sold_premium) || Number(q.premium_amount) || 0), 0)
    }
    else if (goal.goal_type === 'COMMISSIONS') {
      const relevantQuotes = allQuotes.filter(q => 
        q.agent_id === goal.profile_id && 
        q.status === 'ACCEPTED' &&
        (
          (q.accepted_at && new Date(q.accepted_at).getTime() >= pStart && new Date(q.accepted_at).getTime() <= pEnd) ||
          (!q.accepted_at && new Date(q.created_at).getTime() >= pStart && new Date(q.created_at).getTime() <= pEnd)
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
        (v.created_by === goal.profile_id || v.assigned_to === goal.profile_id) && 
        new Date(v.created_at).getTime() >= pStart && 
        new Date(v.created_at).getTime() <= pEnd
      )
      current = relevantVisits.length
    }

    const pct = goal.target_amount > 0 ? (current / goal.target_amount) * 100 : 0

    return {
      id: goal.id,
      agency_id: goal.agency_id,
      profile_id: goal.profile_id,
      goal_type: goal.goal_type,
      period_type: goal.period_type,
      target_amount: goal.target_amount,
      start_date: goal.start_date,
      end_date: goal.end_date,
      created_at: goal.created_at,
      profiles: goal.profiles,
      current_amount: current,
      progress_percentage: Math.min(100, Math.round(pct)),
      current_period_start: goal.startStr.split('T')[0],
      current_period_end: goal.endStr.split('T')[0]
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
    .order('created_at', { ascending: false })
    
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
    .order('created_at', { ascending: false })
    
  if (activeOnly) {
    const today = new Date().toISOString().split('T')[0]
    query = query.gte('end_date', today)
  }

  const { data: goals } = await query

  if (!goals) return []
  
  return await calculateProgressForGoals(supabase, profile.agency_id, goals as Goal[])
}

export async function getGoalHistory(goalId: string): Promise<GoalHistoryPeriod[]> {
  const supabase = await createClient()
  
  const { data: goal } = await supabase
    .from('agency_goals')
    .select('*')
    .eq('id', goalId)
    .single()

  if (!goal) return []

  const periods: { pStart: number, pEnd: number, startStr: string, endStr: string, isCurrent: boolean }[] = []
  
  const timeZone = 'America/Los_Angeles'
  // Use toZonedTime so that cursor starts exactly at the wall-clock date of start_date
  // Since start_date is a YYYY-MM-DD string, new Date(goal.start_date + "T00:00:00") creates a date
  const startDate = new Date(goal.start_date + 'T00:00:00')
  const now = new Date()
  const { start: currentStart } = getPeriodBoundariesForDate(now, goal.period_type)

  let cursor = new Date(startDate)
  
  // Prevent infinite loops just in case
  let iterations = 0
  const maxIterations = 365 * 5 // Max 5 years of daily goals

  while (cursor.getTime() <= currentStart.getTime() && iterations < maxIterations) {
    const { start, end, zonedStart, zonedEnd } = getPeriodBoundariesForDate(cursor, goal.period_type)
    
    // Make sure we haven't already added this exact period
    if (!periods.find(p => p.pStart === start.getTime())) {
      periods.push({
        pStart: start.getTime(),
        pEnd: end.getTime(),
        startStr: zonedStart.toISOString(),
        endStr: zonedEnd.toISOString(),
        isCurrent: start.getTime() === currentStart.getTime()
      })
    }

    // Advance cursor to next period
    if (goal.period_type === 'DAILY') {
      cursor = new Date(cursor.getTime() + 24 * 60 * 60 * 1000)
    } else if (goal.period_type === 'WEEKLY') {
      cursor = new Date(cursor.getTime() + 7 * 24 * 60 * 60 * 1000)
    } else if (goal.period_type === 'MONTHLY') {
      // Create a Date in the middle of the next month to avoid edge cases
      cursor = new Date(Date.UTC(cursor.getUTCFullYear(), cursor.getUTCMonth() + 1, 15))
    } else if (goal.period_type === 'YEARLY') {
      cursor = new Date(Date.UTC(cursor.getUTCFullYear() + 1, 6, 1))
    }
    iterations++
  }

  if (periods.length === 0) return []

  const minDateStr = periods[0].startStr
  const maxDateStr = periods[periods.length - 1].endStr

  const { data: quotes } = await supabase
    .from('quote_requests')
    .select('agent_id, status, premium_amount, sold_premium, commission_percentage, created_at, accepted_at')
    .eq('agency_id', goal.agency_id)
    .gte('created_at', minDateStr)
    .lte('created_at', maxDateStr)
    
  const { data: acceptedQuotes } = await supabase
    .from('quote_requests')
    .select('agent_id, status, premium_amount, sold_premium, commission_percentage, created_at, accepted_at')
    .eq('agency_id', goal.agency_id)
    .eq('status', 'ACCEPTED')
    .gte('accepted_at', minDateStr)
    .lte('accepted_at', maxDateStr)

  const { data: visits } = await supabase
    .from('visits')
    .select('created_by, assigned_to, created_at')
    .eq('agency_id', goal.agency_id)
    .gte('created_at', minDateStr)
    .lte('created_at', maxDateStr)

  const allQuotes = [...(quotes || [])]
  if (acceptedQuotes) {
    acceptedQuotes.forEach((aq: any) => {
      // Just add accepted quotes if they weren't fetched by created_at
      allQuotes.push(aq)
    })
  }

  const history = periods.map(p => {
    let current = 0
    const pStart = p.pStart
    const pEnd = p.pEnd

    if (goal.goal_type === 'QUOTED_PREMIUM') {
      const relevantQuotes = allQuotes.filter(q => 
        q.agent_id === goal.profile_id && 
        new Date(q.created_at).getTime() >= pStart && 
        new Date(q.created_at).getTime() <= pEnd
      )
      current = relevantQuotes.reduce((acc, q) => acc + (Number(q.premium_amount) || 0), 0)
    } 
    else if (goal.goal_type === 'BOUND_PREMIUM') {
      const relevantQuotes = allQuotes.filter(q => 
        q.agent_id === goal.profile_id && 
        q.status === 'ACCEPTED' &&
        (
          (q.accepted_at && new Date(q.accepted_at).getTime() >= pStart && new Date(q.accepted_at).getTime() <= pEnd) ||
          (!q.accepted_at && new Date(q.created_at).getTime() >= pStart && new Date(q.created_at).getTime() <= pEnd)
        )
      )
      current = relevantQuotes.reduce((acc, q) => acc + (Number(q.sold_premium) || Number(q.premium_amount) || 0), 0)
    }
    else if (goal.goal_type === 'COMMISSIONS') {
      const relevantQuotes = allQuotes.filter(q => 
        q.agent_id === goal.profile_id && 
        q.status === 'ACCEPTED' &&
        (
          (q.accepted_at && new Date(q.accepted_at).getTime() >= pStart && new Date(q.accepted_at).getTime() <= pEnd) ||
          (!q.accepted_at && new Date(q.created_at).getTime() >= pStart && new Date(q.created_at).getTime() <= pEnd)
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
        (v.created_by === goal.profile_id || v.assigned_to === goal.profile_id) && 
        new Date(v.created_at).getTime() >= pStart && 
        new Date(v.created_at).getTime() <= pEnd
      )
      current = relevantVisits.length
    }

    const pct = goal.target_amount > 0 ? (current / goal.target_amount) * 100 : 0

    return {
      period_start: p.startStr.split('T')[0],
      period_end: p.endStr.split('T')[0],
      current_amount: current,
      target_amount: goal.target_amount,
      progress_percentage: Math.min(100, Math.round(pct)),
      is_current: p.isCurrent
    }
  })

  // Return sorted descending (newest first)
  return history.sort((a, b) => new Date(b.period_start).getTime() - new Date(a.period_start).getTime())
}
