"use client"

import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { useState, useEffect } from "react"

type Agency = { id: string; name: string }
type Agent = { id: string; name: string; agency_id?: string }

interface DashboardFiltersProps {
  role: string
  lang: string
  agencies: Agency[]
  agents: Agent[]
}

export function DashboardFilters({ role, lang, agencies, agents }: DashboardFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [startDate, setStartDate] = useState(searchParams.get("start") || "")
  const [endDate, setEndDate] = useState(searchParams.get("end") || "")
  const [agencyId, setAgencyId] = useState(searchParams.get("agency") || "all")
  const [agentId, setAgentId] = useState(searchParams.get("agent") || "all")

  // Translations
  const t = {
    en: {
      from: "From",
      to: "To",
      agency: "Agency",
      agent: "Agent",
      allAgencies: "All Agencies",
      allAgents: "All Agents",
      apply: "Apply Filters",
      clear: "Clear"
    },
    es: {
      from: "Desde",
      to: "Hasta",
      agency: "Agencia",
      agent: "Agente",
      allAgencies: "Todas las Agencias",
      allAgents: "Todos los Agentes",
      apply: "Aplicar Filtros",
      clear: "Limpiar"
    }
  }[lang === 'es' ? 'es' : 'en']

  // Update visible agents based on selected agency
  const visibleAgents = agencyId !== "all" 
    ? agents.filter(a => a.agency_id === agencyId)
    : agents

  const handleApply = () => {
    const params = new URLSearchParams(searchParams.toString())
    
    if (startDate) params.set("start", startDate)
    else params.delete("start")
    
    if (endDate) params.set("end", endDate)
    else params.delete("end")
    
    if (agencyId !== "all") params.set("agency", agencyId)
    else params.delete("agency")
    
    if (agentId !== "all") params.set("agent", agentId)
    else params.delete("agent")

    router.push(`${pathname}?${params.toString()}`)
  }

  const handleClear = () => {
    setStartDate("")
    setEndDate("")
    setAgencyId("all")
    setAgentId("all")
    router.push(pathname)
  }

  // If the user is just an agent, they don't need to see the agency/agent filters
  // We just show dates
  const isAgent = role === 'AGENT'

  return (
    <div className="bg-card/40 border border-border/40 p-4 rounded-xl shadow-sm mb-8 flex flex-col md:flex-row items-end gap-4 flex-wrap">
      <div className="flex flex-col gap-1.5 flex-1 min-w-[140px]">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t.from}</label>
        <input 
          type="date" 
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>

      <div className="flex flex-col gap-1.5 flex-1 min-w-[140px]">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t.to}</label>
        <input 
          type="date" 
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>

      {!isAgent && role === 'ADMIN' && (
        <div className="flex flex-col gap-1.5 flex-1 min-w-[160px]">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t.agency}</label>
          <select 
            value={agencyId}
            onChange={(e) => {
              setAgencyId(e.target.value)
              setAgentId("all") // Reset agent when agency changes
            }}
            className="bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="all">{t.allAgencies}</option>
            {agencies.map(a => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </select>
        </div>
      )}

      {!isAgent && (
        <div className="flex flex-col gap-1.5 flex-1 min-w-[160px]">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t.agent}</label>
          <select 
            value={agentId}
            onChange={(e) => setAgentId(e.target.value)}
            className="bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="all">{t.allAgents}</option>
            {visibleAgents.map(a => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </select>
        </div>
      )}

      <div className="flex gap-2 w-full md:w-auto">
        <button 
          onClick={handleClear}
          className="flex-1 md:flex-none px-4 py-2 border border-border rounded-lg text-sm font-medium hover:bg-muted transition-colors"
        >
          {t.clear}
        </button>
        <button 
          onClick={handleApply}
          className="flex-1 md:flex-none px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          {t.apply}
        </button>
      </div>
    </div>
  )
}
