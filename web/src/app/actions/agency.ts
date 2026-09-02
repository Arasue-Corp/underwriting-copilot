"use server"

import { createClient } from "@/lib/supabase/server"

export async function getAgencyData() {
  const supabase = await createClient()
  
  // Get current user profile to find their agency
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: myProfile } = await supabase
    .from('profiles')
    .select('agency_id, role, agencies(name, logo_url)')
    .eq('id', user.id)
    .single()
    
  if (!myProfile) return null

  if (myProfile.role === 'DEMO') {
    const { demoAgencyData } = await import('@/lib/demo-data');
    return demoAgencyData;
  }

  if (!myProfile.agency_id) return null

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
    .select('agent_id, assigned_to, premium_amount, commission_amount, status, sold_premium, commission_percentage, quotes_provided')
    .eq('agency_id', myProfile.agency_id)

  if (quotesError) {
    console.error("Error fetching quotes:", quotesError)
  }

  // Aggregate stats per agent
  const agentStats = agents.map(agent => {
    const agentQuotes = (quotes || []).filter(q => q.agent_id === agent.id)
    
    const totalQuotes = agentQuotes.length
    const boundQuotes = agentQuotes.filter(q => q.status === 'ACCEPTED')
    
    let totalPremium = 0;
    let totalCommission = 0;

    boundQuotes.forEach(q => {
      totalPremium += q.sold_premium || q.premium_amount || 0;
      let commAmount = ((q.sold_premium || 0) * (q.commission_percentage || 0)) / 100;
      totalCommission += commAmount;
    });

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
