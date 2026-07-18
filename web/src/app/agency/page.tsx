import { getAgencyData } from "@/app/actions/agency"
import { Users, TrendingUp, DollarSign, Target } from "lucide-react"
import UploadLogo from "@/components/UploadLogo"

export default async function AgencyPage() {
  const data = await getAgencyData()

  if (!data) {
    return (
      <div className="flex-1 p-8 text-center text-muted-foreground mt-20">
        No se pudo cargar la información de la agencia.
      </div>
    )
  }

  const { agencyId, agencyName, agencyLogo, agents } = data

  const totalPremiumGlobal = agents.reduce((acc, a) => acc + a.stats.totalPremium, 0)
  const totalCommissionGlobal = agents.reduce((acc, a) => acc + a.stats.totalCommission, 0)
  const totalQuotesGlobal = agents.reduce((acc, a) => acc + a.stats.totalQuotes, 0)

  return (
    <div className="flex-1 p-8 pt-6 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Users className="h-8 w-8 text-primary" />
            Módulo de Agencia: {agencyName}
          </h2>
          <p className="text-muted-foreground mt-2">
            Supervisa el rendimiento y las operaciones de todos los agentes de tu compañía.
          </p>
        </div>
        <div className="flex-shrink-0 bg-card rounded-xl border p-4 shadow-sm">
          <UploadLogo table="agencies" recordId={agencyId} currentLogoUrl={agencyLogo} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">Primas Emitidas (Global)</h3>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-bold">
            ${totalPremiumGlobal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
        </div>
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">Comisiones Generadas</h3>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-bold text-emerald-500">
            ${totalCommissionGlobal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
        </div>
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">Cotizaciones Procesadas</h3>
            <Target className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-bold">
            {totalQuotesGlobal}
          </div>
        </div>
      </div>

      <div className="rounded-xl border bg-card shadow-sm overflow-hidden w-full">
        <div className="bg-muted/30 px-6 py-4 border-b border-border">
          <h3 className="font-bold text-lg">Directorio de Agentes</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left whitespace-nowrap md:whitespace-normal">
            <thead className="bg-muted/10 border-b border-border text-muted-foreground">
            <tr>
              <th className="px-6 py-3 font-medium">Nombre Completo</th>
              <th className="px-6 py-3 font-medium">Correo Electrónico</th>
              <th className="px-6 py-3 font-medium">Rol</th>
              <th className="px-6 py-3 font-medium text-center">Cotizaciones</th>
              <th className="px-6 py-3 font-medium text-right">Primas Cerradas</th>
            </tr>
          </thead>
          <tbody>
            {agents.map((agent) => (
              <tr key={agent.id} className="border-b border-border/50 last:border-0 hover:bg-muted/10">
                <td className="px-6 py-4 font-medium flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                    {agent.name.substring(0,2).toUpperCase()}
                  </div>
                  {agent.name}
                </td>
                <td className="px-6 py-4 text-muted-foreground">{agent.email}</td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide ${
                    agent.role === 'MANAGER' ? 'bg-amber-500/15 text-amber-500' : 'bg-blue-500/15 text-blue-500'
                  }`}>
                    {agent.role}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  <div className="flex items-center justify-center gap-1.5">
                    <span className="font-medium">{agent.stats.boundQuotes}</span>
                    <span className="text-muted-foreground text-xs">/ {agent.stats.totalQuotes}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-right font-medium">
                  ${agent.stats.totalPremium.toLocaleString('en-US')}
                </td>
              </tr>
            ))}
            {agents.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                  No hay agentes registrados en esta agencia.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  )
}
