import { Activity, CircleDollarSign, Files, Users, TrendingUp, TrendingDown, AlertCircle, ShieldCheck, CheckCircle } from "lucide-react"
import { OverviewChart } from "@/components/dashboard/OverviewChart"
import { DistributionChart } from "@/components/dashboard/DistributionChart"
import { CrisolPulse } from "@/components/dashboard/CrisolPulse"
import { VisitsDashboardSection } from "@/components/dashboard/VisitsDashboardSection"
import { DashboardFilters } from "@/components/dashboard/DashboardFilters"
import { GoalsDashboardSection } from "@/components/dashboard/GoalsDashboardSection"
import { getAgencyGoals } from "@/app/actions/goals"
import { cookies } from "next/headers"
import { createClient } from "@/lib/supabase/server"
import { getVisits } from "@/app/actions/visits"

export const dynamic = 'force-dynamic';

export default async function Dashboard(props: { searchParams: Promise<{ [key: string]: string | undefined }> }) {
  const searchParams = await props.searchParams;
  const startDate = searchParams.start;
  const endDate = searchParams.end;
  const agencyId = searchParams.agency;
  const agentId = searchParams.agent;

  const cookieStore = await cookies();
  const langCookie = cookieStore.get('NEXT_LOCALE')?.value as 'en' | 'es' | undefined;
  const lang = langCookie === 'es' ? 'es' : 'en';

  const t = {
    en: {
      title: 'Dashboard',
      desc: 'Welcome back. Here is the summary of your agency.',
      totalPrem: 'Total Quoted Premium',
      commissions: 'Commissions Generated',
      pending: 'Pending Quotes',
      hitRatio: 'Hit Ratio',
      agents: 'Active Agents',
      vsMonth: 'vs last month',
      attention: 'Attention',
      requireRev: 'require review',
      active: 'Active',
      inAgency: 'In your agency',
      evoTitle: 'Quote Evolution',
      evoDesc: 'Quoted premiums in the last quarter.',
      distTitle: 'Distribution by Carrier',
      distDesc: 'Policies issued this month.'
    },
    es: {
      title: 'Dashboard',
      desc: 'Bienvenido de vuelta. Aquí está el resumen de tu agencia.',
      totalPrem: 'Total Primas Cotizadas',
      commissions: 'Comisiones Generadas',
      pending: 'Solicitudes Pendientes',
      hitRatio: 'Hit Ratio',
      agents: 'Agentes Activos',
      vsMonth: 'vs mes anterior',
      attention: 'Atención',
      requireRev: 'requieren revisión',
      active: 'Activos',
      inAgency: 'En tu agencia',
      evoTitle: 'Evolución de Cotizaciones',
      evoDesc: 'Primas cotizadas en el último trimestre.',
      distTitle: 'Distribución por Aseguradora',
      distDesc: 'Polizas emitidas este mes.'
    }
  }[lang];

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  let role = 'AGENT';
  let userAgencyId: string | undefined;
  if (user) {
    const { data: profile } = await supabase.from('profiles').select('role, agency_id').eq('id', user.id).single();
    if (profile) {
      role = profile.role;
      userAgencyId = profile.agency_id;
    }
  }
  
  // Fetch agencies & agents for filters
  let agencies: { id: string; name: string }[] = [];
  let agents: { id: string; name: string; agency_id?: string }[] = [];
  
  if ((role === 'ADMIN' || role === 'DEMO')) {
    const { data: ags } = await supabase.from('agencies').select('id, name');
    agencies = ags || [];
    
    const { data: agnts } = await supabase.from('profiles').select('id, name, agency_id').eq('role', 'AGENT');
    agents = agnts || [];
  } else if (role === 'MANAGER' && userAgencyId) {
    const { data: agnts } = await supabase.from('profiles').select('id, name, agency_id').eq('role', 'AGENT').eq('agency_id', userAgencyId);
    agents = agnts || [];
  }

  // Real Data Fetching with Filters
  let quotesQuery = supabase.from('quote_requests').select('agent_id, assigned_to, status, premium_amount, commission_amount, sold_premium, commission_percentage, quotes_provided, carrier_id, created_at');
  
  if (startDate) quotesQuery = quotesQuery.gte('created_at', `${startDate}T00:00:00.000Z`);
  if (endDate) quotesQuery = quotesQuery.lte('created_at', `${endDate}T23:59:59.999Z`);
  
  if (role === 'ADMIN') {
    if (agencyId) quotesQuery = quotesQuery.eq('agency_id', agencyId);
    if (agentId) {
      if (Array.isArray(agentId)) {
        const ids = agentId.join(',');
        quotesQuery = quotesQuery.or(`agent_id.in.(${ids}),assigned_to.in.(${ids})`);
      } else {
        quotesQuery = quotesQuery.or(`agent_id.eq.${agentId},assigned_to.eq.${agentId}`);
      }
    }
  } else if (role === 'MANAGER') {
    if (userAgencyId) quotesQuery = quotesQuery.eq('agency_id', userAgencyId);
    if (agentId) {
      if (Array.isArray(agentId)) {
        const ids = agentId.join(',');
        quotesQuery = quotesQuery.or(`agent_id.in.(${ids}),assigned_to.in.(${ids})`);
      } else {
        quotesQuery = quotesQuery.or(`agent_id.eq.${agentId},assigned_to.eq.${agentId}`);
      }
    }
  }
  
  let quotes: any[] = [];
  let quotesError = null;
  let visits: any[] = [];
  
  if (role === 'DEMO') {
    const { demoQuotes, demoVisits } = await import('@/lib/demo-data');
    quotes = demoQuotes;
    visits = demoVisits;
  } else {
    const { data: dbQuotes, error } = await quotesQuery;
    quotes = dbQuotes || [];
    quotesError = error;
    if (role === 'ADMIN' || role === 'MANAGER') {
      visits = await getVisits({ 
        startDate: startDate as string | undefined, 
        endDate: endDate as string | undefined, 
        agencyId: agencyId as string | undefined, 
        agentId: agentId as string | string[] | undefined 
      });
    }
  }
  
  if (quotesError) {
    console.error("Dashboard error:", quotesError);
  }
  
  let totalPremiumQuoted = 0;
  let totalPremiumAccepted = 0;
  let totalCommissions = 0;
  let potentialCommissions = 0;
  let pendingQuotes = 0;
  let pendingManagerQuotes = 0;
  let totalAcceptedQuotes = 0;
  let totalResolvedQuotes = 0;
  
  const distribution: Record<string, number> = {};
  const quotedDistribution: Record<string, number> = {};
  const monthNames = lang === 'es' 
    ? ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'] 
    : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthlyData: Record<string, number> = {};
  monthNames.forEach(m => monthlyData[m] = 0);
  
  if (quotes) {
    quotes.forEach((q: any) => {
      if (role === 'AGENT' && user) {
        if (q.agent_id !== user.id) return; // Only count quotes where they are the owner
      }

      // Add to monthly chart (using sold_premium if accepted, else premium_amount)
      if (q.created_at) {
        const d = new Date(q.created_at);
        const mName = monthNames[d.getMonth()];
        const pAmount = q.status === 'ACCEPTED' ? (q.sold_premium || q.premium_amount || 0) : (q.premium_amount || 0);
        if (monthlyData[mName] !== undefined) {
          monthlyData[mName] += pAmount;
        }
      }

      if (q.status === 'ACCEPTED') {
        totalPremiumAccepted += q.sold_premium || q.premium_amount || 0;
        totalPremiumQuoted += q.premium_amount || q.sold_premium || 0;
        let commAmount = ((q.sold_premium || 0) * (q.commission_percentage || 0)) / 100;
        if (role === 'AGENT') {
          const agentCommPct = q.quotes_provided?.[0]?.agent_commission_percentage;
          if (agentCommPct && !isNaN(parseFloat(agentCommPct))) {
            commAmount = commAmount * (parseFloat(agentCommPct) / 100);
          } else {
            commAmount = 0;
          }
        }
        totalCommissions += commAmount;
        totalAcceptedQuotes++;
        totalResolvedQuotes++;
        
        if (Array.isArray(q.quotes_provided)) {
          q.quotes_provided.forEach((prop: any, idx: number) => {
            if ((!q.selected_modules || q.selected_modules[idx]) && prop.carrier) {
              const carrierName = prop.carrier;
              distribution[carrierName] = (distribution[carrierName] || 0) + 1;
            }
          });
        }
      } else if (q.status === 'QUOTED') {
        totalPremiumQuoted += q.premium_amount || 0;
        
        if (Array.isArray(q.quotes_provided)) {
          // Track unique carriers per quote so we don't double count if a carrier provided multiple options
          const uniqueCarriers = new Set<string>();
          q.quotes_provided.forEach((prop: any) => {
            if (prop.carrier) {
              uniqueCarriers.add(prop.carrier);
            }
          });
          uniqueCarriers.forEach(carrierName => {
            quotedDistribution[carrierName] = (quotedDistribution[carrierName] || 0) + 1;
          });
        }
        
        // Sum potential commissions from proposals
        if (Array.isArray(q.quotes_provided)) {
          q.quotes_provided.forEach((prop: any) => {
            let comm = (parseFloat(prop.premium) * parseFloat(prop.commission_percentage)) / 100;
            if (role === 'AGENT') {
              if (prop.agent_commission_percentage && !isNaN(parseFloat(prop.agent_commission_percentage))) {
                comm = comm * (parseFloat(prop.agent_commission_percentage) / 100);
              } else {
                comm = 0;
              }
            }
            if (!isNaN(comm)) potentialCommissions += comm;
          });
        }
      } else if (q.status === 'REJECTED') {
        totalPremiumQuoted += q.premium_amount || 0;
        totalResolvedQuotes++;
      } else if (q.status === 'PENDING_MANAGER' || q.status === 'PENDING') {
        pendingQuotes++;
        if (q.status === 'PENDING_MANAGER') pendingManagerQuotes++;
      }
    });
  }

  const distData = Object.entries(distribution).map(([name, value]) => ({ name, value }));
  const quotedDistData = Object.entries(quotedDistribution).map(([name, value]) => ({ name, value }));
  // Filter out months from the future or empty if desired, but here we just show all 12
  const overviewData = monthNames.map(name => ({ name, total: monthlyData[name] }));
  
  const hitRatio = totalResolvedQuotes > 0 ? Math.round((totalAcceptedQuotes / totalResolvedQuotes) * 100) : 0;

  // Active agents count
  let agentsCountQuery = supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'AGENT');
  if (role === 'MANAGER' && userAgencyId) {
    agentsCountQuery = agentsCountQuery.eq('agency_id', userAgencyId);
  } else if ((role === 'ADMIN' || role === 'DEMO') && agencyId) {
    agentsCountQuery = agentsCountQuery.eq('agency_id', agencyId);
  }
  const { count: agentsCount } = await agentsCountQuery;
  const activeAgents = agentsCount || 0;
  
  const goals = await getAgencyGoals(true);

  const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

  return (
    <div className="flex-1 space-y-8 p-4 md:p-8 pt-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      <GoalsDashboardSection goals={goals} userRole={role} currentUserId={user?.id || ''} />

      <DashboardFilters role={role} lang={lang} agencies={agencies} agents={agents} />
      
      <div className="flex flex-col md:flex-row md:items-center justify-between space-y-2 md:space-y-0">
        <CrisolPulse 
          title={t.title} 
          desc={t.desc} 
          lang={lang} 
          realData={{ pending: pendingQuotes, premium: totalPremiumQuoted, agents: activeAgents }} 
        />
        <div className="flex items-center space-x-2">
          {quotesError && <div className="text-red-500 text-sm">Error loading data: {quotesError.message}</div>}
          {!quotes && !quotesError && <div className="text-orange-500 text-sm">No quotes returned (null)</div>}
        </div>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
        <div className="rounded-2xl glass-panel text-card-foreground group accent-left-navy hover:shadow-[0_12px_40px_rgba(0,0,0,0.12)] dark:hover:shadow-[0_12px_40px_rgba(0,0,0,0.6)] animate-in fade-in slide-in-from-bottom-4 delay-100 fill-mode-both">
          <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium text-muted-foreground">{t.totalPrem}</h3>
            <div className="p-2 bg-primary/5 rounded-full group-hover:bg-primary/10 transition-colors group-hover:scale-110 duration-300">
              <CircleDollarSign className="h-5 w-5 text-primary" />
            </div>
          </div>
          <div className="p-6 pt-0">
            <div className="font-playfair text-3xl font-bold">{formatCurrency(totalPremiumQuoted)}</div>
          </div>
        </div>

        <div className="rounded-2xl glass-panel text-card-foreground group accent-left-emerald hover:shadow-[0_12px_40px_rgba(0,0,0,0.12)] dark:hover:shadow-[0_12px_40px_rgba(0,0,0,0.6)] animate-in fade-in slide-in-from-bottom-4 delay-150 fill-mode-both">
          <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium text-muted-foreground">{lang === 'es' ? 'Prima Aceptada' : 'Accepted Premium'}</h3>
            <div className="p-2 bg-emerald-500/10 rounded-full group-hover:bg-emerald-500/20 transition-colors group-hover:scale-110 duration-300">
              <CheckCircle className="h-5 w-5 text-emerald-500" />
            </div>
          </div>
          <div className="p-6 pt-0">
            <div className="font-playfair text-3xl font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(totalPremiumAccepted)}</div>
          </div>
        </div>
        
        <div className="rounded-2xl glass-panel text-card-foreground group accent-left-gold hover:shadow-[0_12px_40px_rgba(0,0,0,0.12)] dark:hover:shadow-[0_12px_40px_rgba(0,0,0,0.6)] animate-in fade-in slide-in-from-bottom-4 delay-200 fill-mode-both">
          <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium text-muted-foreground">{t.commissions}</h3>
            <div className="p-2 bg-[#F2D3AC]/10 rounded-full group-hover:bg-[#F2D3AC]/20 transition-colors group-hover:scale-110 duration-300">
              <Activity className="h-5 w-5 text-[#8C6D41] dark:text-[#F2D3AC]" />
            </div>
          </div>
          <div className="p-6 pt-0">
            <div className="font-playfair text-3xl font-bold text-[#8C6D41] dark:text-[#F2D3AC]">{formatCurrency(totalCommissions)}</div>
            <p className="text-xs font-medium text-muted-foreground mt-2 flex items-center">
              <span className="text-[#8C6D41] dark:text-[#F2D3AC] font-semibold mr-1">+{formatCurrency(potentialCommissions)}</span> {lang === 'es' ? 'potenciales' : 'potential'}
            </p>
          </div>
        </div>
        
        <div className="rounded-2xl glass-panel text-card-foreground group accent-left-copper hover:shadow-[0_12px_40px_rgba(0,0,0,0.12)] dark:hover:shadow-[0_12px_40px_rgba(0,0,0,0.6)] animate-in fade-in slide-in-from-bottom-4 delay-300 fill-mode-both">
          <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium text-muted-foreground">{t.pending}</h3>
            <div className="p-2 bg-[#A65E44]/10 rounded-full group-hover:bg-[#A65E44]/20 transition-colors group-hover:scale-110 duration-300">
              <Files className="h-5 w-5 text-[#A65E44]" />
            </div>
          </div>
          <div className="p-6 pt-0">
            <div className="font-playfair text-3xl font-bold">{pendingQuotes}</div>
            <p className="text-xs font-medium text-muted-foreground mt-2 flex items-center">
              <span className="status-dot-copper mr-2"></span>
              <span className="text-[#A65E44] font-semibold mr-1">{pendingManagerQuotes}</span> {t.requireRev}
            </p>
          </div>
        </div>
        
        <div className="rounded-2xl glass-panel text-card-foreground group accent-left-navy hover:shadow-[0_12px_40px_rgba(0,0,0,0.12)] dark:hover:shadow-[0_12px_40px_rgba(0,0,0,0.6)] animate-in fade-in slide-in-from-bottom-4 delay-400 fill-mode-both">
          <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium text-muted-foreground">{t.hitRatio}</h3>
            <div className="p-2 bg-primary/5 rounded-full group-hover:bg-primary/10 transition-colors group-hover:scale-110 duration-300">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
          </div>
          <div className="p-6 pt-0">
            <div className="font-playfair text-3xl font-bold">{hitRatio}%</div>
            <p className="text-xs font-medium text-muted-foreground mt-2 flex items-center">
              <span className="status-dot-navy mr-2"></span>
              <span className="text-foreground font-semibold mr-1">{totalAcceptedQuotes}</span> ganadas de {totalResolvedQuotes}
            </p>
          </div>
        </div>
      </div>
      
      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2 animate-in fade-in slide-in-from-bottom-8 delay-500 duration-700 fill-mode-both">
        <div className="lg:col-span-2 rounded-2xl glass-panel text-card-foreground flex flex-col overflow-hidden">
          <div className="flex flex-col space-y-1.5 p-6 pb-2">
            <h3 className="font-playfair font-semibold text-xl leading-none tracking-tight">{t.evoTitle}</h3>
            <p className="text-sm text-muted-foreground">{t.evoDesc}</p>
          </div>
          <div className="p-6 pt-4 flex-1 min-h-[350px] flex items-center justify-center text-muted-foreground w-full">
            <OverviewChart data={overviewData} />
          </div>
        </div>
        
        <div className="rounded-2xl glass-panel text-card-foreground flex flex-col overflow-hidden">
          <div className="flex flex-col space-y-1.5 p-6 pb-2">
            <h3 className="font-playfair font-semibold text-xl leading-none tracking-tight">{t.distTitle}</h3>
            <p className="text-sm text-muted-foreground">{t.distDesc}</p>
          </div>
          <div className="p-6 pt-4 flex-1 min-h-[350px] flex items-center justify-center text-muted-foreground w-full">
            <DistributionChart data={distData} />
          </div>
        </div>

        <div className="rounded-2xl glass-panel text-card-foreground flex flex-col overflow-hidden">
          <div className="flex flex-col space-y-1.5 p-6 pb-2">
            <h3 className="font-playfair font-semibold text-xl leading-none tracking-tight">{lang === 'es' ? 'Aseguradoras Cotizadas' : 'Quoted Carriers'}</h3>
            <p className="text-sm text-muted-foreground">{lang === 'es' ? 'Distribución de solicitudes cotizadas por aseguradora.' : 'Distribution of quoted requests by carrier.'}</p>
          </div>
          <div className="p-6 pt-4 flex-1 min-h-[350px] flex items-center justify-center text-muted-foreground w-full">
            <DistributionChart data={quotedDistData} />
          </div>
        </div>
      </div>

      {/* Visits Section (Admin/Manager only) */}
      {((role === 'ADMIN' || role === 'DEMO') || role === 'MANAGER') && (
        <VisitsDashboardSection visits={visits} />
      )}
    </div>
  )
}
