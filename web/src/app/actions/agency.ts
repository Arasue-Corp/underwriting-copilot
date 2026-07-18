"use server"

import { createClient } from "@/lib/supabase/server"

export async function getAgencyData() {
  const supabase = await createClient()
  
  // Get current user profile to find their agency
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: myProfile } = await supabase
    .from('profiles')
    .select('agency_id, agencies(name, logo_url)')
    .eq('id', user.id)
    .single()
    
  if (!myProfile || !myProfile.agency_id) return null

  // Fetch all profiles in this agency
  const { data: agents, error: agentsError } = await supabase
    .from('profiles')
    .select('id, name, email, role, commission_rate')
    .eq('agency_id', myProfile.agency_id)
    .order('name')

  if (agentsError || !agents) {
    console.error("Error fetching agents:", agentsError)
    return null
  }

  // Fetch quote statistics for these agents
  const { data: quotes, error: quotesError } = await supabase
    .from('quote_requests')
    .select('agent_id, premium_amount, commission_amount, status')
    .eq('agency_id', myProfile.agency_id)

  if (quotesError) {
    console.error("Error fetching quotes:", quotesError)
  }

  // Aggregate stats per agent
  const agentStats = agents.map(agent => {
    const agentQuotes = (quotes || []).filter(q => q.agent_id === agent.id)
    
    const totalQuotes = agentQuotes.length
    const boundQuotes = agentQuotes.filter(q => q.status === 'BOUND')
    
    const totalPremium = boundQuotes.reduce((acc, q) => acc + (q.premium_amount || 0), 0)
    const totalCommission = boundQuotes.reduce((acc, q) => acc + (q.commission_amount || 0), 0)

    return {
      ...agent,
      stats: {
        totalQuotes,
        boundQuotes: boundQuotes.length,
        totalPremium,
        totalCommission
      }
    }
  })

  return {
    agencyId: myProfile.agency_id,
    agencyName: myProfile.agencies ? (myProfile.agencies as any).name : 'Agencia',
    agencyLogo: myProfile.agencies ? (myProfile.agencies as any).logo_url : null,
    agents: agentStats
  }
}
