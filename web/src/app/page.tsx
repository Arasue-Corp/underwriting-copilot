import { Activity, CircleDollarSign, Files, Users } from "lucide-react"
import { OverviewChart } from "@/components/dashboard/OverviewChart"
import { DistributionChart } from "@/components/dashboard/DistributionChart"

export default function Dashboard() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <div className="flex items-center space-x-2">
          {/* Controls like date picker could go here */}
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border bg-card text-card-foreground shadow">
          <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">Total Primas Cotizadas</h3>
            <CircleDollarSign className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="p-6 pt-0">
            <div className="text-2xl font-bold">$45,231.89</div>
            <p className="text-xs text-muted-foreground">+20.1% vs mes anterior</p>
          </div>
        </div>
        <div className="rounded-xl border bg-card text-card-foreground shadow">
          <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">Comisiones Generadas</h3>
            <Activity className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="p-6 pt-0">
            <div className="text-2xl font-bold text-emerald-500">+$2,350.00</div>
            <p className="text-xs text-muted-foreground">+15% vs mes anterior</p>
          </div>
        </div>
        <div className="rounded-xl border bg-card text-card-foreground shadow">
          <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">Solicitudes Pendientes</h3>
            <Files className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="p-6 pt-0">
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">3 requieren atención urgente</p>
          </div>
        </div>
        <div className="rounded-xl border bg-card text-card-foreground shadow">
          <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">Agentes Activos</h3>
            <Users className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="p-6 pt-0">
            <div className="text-2xl font-bold">4</div>
            <p className="text-xs text-muted-foreground">En tu agencia</p>
          </div>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-4 rounded-xl border bg-card text-card-foreground shadow">
          <div className="flex flex-col space-y-1.5 p-6">
            <h3 className="font-semibold leading-none tracking-tight">Evolución de Cotizaciones</h3>
            <p className="text-sm text-muted-foreground">Primas cotizadas en el último trimestre.</p>
          </div>
          <div className="p-6 pt-0 h-[320px] flex items-center justify-center text-muted-foreground">
            <OverviewChart />
          </div>
        </div>
        <div className="col-span-3 rounded-xl border bg-card text-card-foreground shadow">
          <div className="flex flex-col space-y-1.5 p-6">
            <h3 className="font-semibold leading-none tracking-tight">Distribución por Aseguradora</h3>
            <p className="text-sm text-muted-foreground">Polizas emitidas este mes.</p>
          </div>
          <div className="p-6 pt-0 h-[320px] flex items-center justify-center text-muted-foreground">
            <DistributionChart />
          </div>
        </div>
      </div>
    </div>
  )
}
