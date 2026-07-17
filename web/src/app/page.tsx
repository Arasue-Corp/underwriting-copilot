import { Activity, CircleDollarSign, Files, Users, TrendingUp, TrendingDown, AlertCircle, ShieldCheck } from "lucide-react"
import { OverviewChart } from "@/components/dashboard/OverviewChart"
import { DistributionChart } from "@/components/dashboard/DistributionChart"
import { CrisolPulse } from "@/components/dashboard/CrisolPulse"
import { cookies } from "next/headers"
import { createClient } from "@/lib/supabase/server"

export default async function Dashboard() {
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
  
  // Real Data Fetching
  const { data: quotes } = await supabase.from('quote_requests').select('status, premium_amount, commission_amount');
  
  let totalPremium = 0;
  let totalCommissions = 0;
  let pendingQuotes = 0;
  let pendingManagerQuotes = 0;

  if (quotes) {
    quotes.forEach((q: any) => {
      if (q.status === 'QUOTED') {
        totalPremium += q.premium_amount || 0;
        totalCommissions += q.commission_amount || 0;
      } else if (q.status === 'PENDING_MANAGER' || q.status === 'PENDING') {
        pendingQuotes++;
        if (q.status === 'PENDING_MANAGER') pendingManagerQuotes++;
      }
    });
  }

  const { count: agentsCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'AGENT');
  const activeAgents = agentsCount || 0;

  const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

  return (
    <div className="flex-1 space-y-8 p-4 md:p-8 pt-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between space-y-2 md:space-y-0">
        <CrisolPulse 
          title={t.title} 
          desc={t.desc} 
          lang={lang} 
          realData={{ pending: pendingQuotes, premium: totalPremium, agents: activeAgents }} 
        />
        <div className="flex items-center space-x-2">
          {/* Controls like date picker could go here */}
        </div>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl glass-panel text-card-foreground group accent-left-navy hover:shadow-[0_12px_40px_rgba(0,0,0,0.12)] dark:hover:shadow-[0_12px_40px_rgba(0,0,0,0.6)] animate-in fade-in slide-in-from-bottom-4 delay-100 fill-mode-both">
          <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium text-muted-foreground">{t.totalPrem}</h3>
            <div className="p-2 bg-primary/5 rounded-full group-hover:bg-primary/10 transition-colors group-hover:scale-110 duration-300">
              <CircleDollarSign className="h-5 w-5 text-primary" />
            </div>
          </div>
          <div className="p-6 pt-0">
            <div className="font-playfair text-3xl font-bold">{formatCurrency(totalPremium)}</div>
            <p className="text-xs font-medium text-muted-foreground mt-2 flex items-center">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 mr-1" />
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold mr-1.5">+20.1%</span> {t.vsMonth}
            </p>
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
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 mr-1" />
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold mr-1.5">+15.0%</span> {t.vsMonth}
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
              <span className="text-[#A65E44] font-semibold mr-1">3</span> {t.requireRev}
            </p>
          </div>
        </div>
        
        <div className="rounded-2xl glass-panel text-card-foreground group accent-left-navy hover:shadow-[0_12px_40px_rgba(0,0,0,0.12)] dark:hover:shadow-[0_12px_40px_rgba(0,0,0,0.6)] animate-in fade-in slide-in-from-bottom-4 delay-400 fill-mode-both">
          <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium text-muted-foreground">{t.agents}</h3>
            <div className="p-2 bg-primary/5 rounded-full group-hover:bg-primary/10 transition-colors group-hover:scale-110 duration-300">
              <Users className="h-5 w-5 text-primary" />
            </div>
          </div>
          <div className="p-6 pt-0">
            <div className="font-playfair text-3xl font-bold">{activeAgents}</div>
            <p className="text-xs font-medium text-muted-foreground mt-2 flex items-center">
              <span className="status-dot-navy mr-2"></span>
              <span className="text-foreground font-semibold mr-1">{t.active}</span> {t.inAgency}
            </p>
          </div>
        </div>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7 animate-in fade-in slide-in-from-bottom-8 delay-500 duration-700 fill-mode-both">
        <div className="col-span-4 rounded-2xl glass-panel text-card-foreground flex flex-col">
          <div className="flex flex-col space-y-1.5 p-6 pb-2">
            <h3 className="font-playfair font-semibold text-xl leading-none tracking-tight">{t.evoTitle}</h3>
            <p className="text-sm text-muted-foreground">{t.evoDesc}</p>
          </div>
          <div className="p-6 pt-4 flex-1 min-h-[350px] flex items-center justify-center text-muted-foreground">
            <OverviewChart />
          </div>
        </div>
        <div className="col-span-3 rounded-2xl glass-panel text-card-foreground flex flex-col">
          <div className="flex flex-col space-y-1.5 p-6 pb-2">
            <h3 className="font-playfair font-semibold text-xl leading-none tracking-tight">{t.distTitle}</h3>
            <p className="text-sm text-muted-foreground">{t.distDesc}</p>
          </div>
          <div className="p-6 pt-4 flex-1 min-h-[350px] flex items-center justify-center text-muted-foreground">
            <DistributionChart />
          </div>
        </div>
      </div>
    </div>
  )
}
