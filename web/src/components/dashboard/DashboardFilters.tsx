"use client"

import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { useState, useEffect } from "react"
import { Filter } from "lucide-react"

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
  const [agentIds, setAgentIds] = useState<string[]>(searchParams.getAll("agent"))
  const [isAgentDropdownOpen, setIsAgentDropdownOpen] = useState(false)
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false)

  // Translations
  const t = {
    en: {
      from: "From",
      to: "To",
      agency: "Agency",
      agent: "Agent(s)",
      allAgencies: "All Agencies",
      allAgents: "All Agents",
      apply: "Apply Filters",
      clear: "Clear",
      selected: "selected",
      filters: "Filters",
      show: "Show",
      hide: "Hide"
    },
    es: {
      from: "Desde",
      to: "Hasta",
      agency: "Agencia",
      agent: "Agente(s)",
      allAgencies: "Todas las Agencias",
      allAgents: "Todos los Agentes",
      apply: "Aplicar Filtros",
      clear: "Limpiar",
      selected: "seleccionados",
      filters: "Filtros",
      show: "Mostrar",
      hide: "Ocultar"
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
    
    // Clear existing agents
    params.delete("agent")
    if (agentIds.length > 0 && !agentIds.includes("all")) {
      agentIds.forEach(id => params.append("agent", id))
    }

    router.push(`${pathname}?${params.toString()}`)
    setIsAgentDropdownOpen(false)
  }

  const handleClear = () => {
    setStartDate("")
    setEndDate("")
    setAgencyId("all")
    setAgentIds([])
    router.push(pathname)
  }

  const toggleAgent = (id: string) => {
    if (id === "all") {
      setAgentIds([])
      return
    }
    setAgentIds(prev => {
      if (prev.includes(id)) return prev.filter(i => i !== id)
      return [...prev, id]
    })
  }

  // If the user is just an agent, they don't need to see the agency/agent filters
  // We just show dates
  const isAgent = role === 'AGENT'

  return (
    <div className="bg-card/40 border border-border/40 p-4 rounded-xl shadow-sm mb-8 flex flex-col relative">
      {/* Mobile toggle */}
      <div className="md:hidden flex justify-between items-center mb-2">
        <span className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Filter className="w-4 h-4" /> {t.filters}
        </span>
        <button 
          onClick={() => setIsMobileFiltersOpen(!isMobileFiltersOpen)} 
          className="px-3 py-1.5 border border-border rounded-lg text-xs font-medium hover:bg-muted transition-colors flex items-center gap-2"
        >
          {isMobileFiltersOpen ? t.hide : t.show}
        </button>
      </div>

      {/* Filter controls */}
      <div className={`${isMobileFiltersOpen ? 'flex' : 'hidden'} md:flex flex-col md:flex-row md:items-end items-stretch gap-4 flex-wrap mt-2 md:mt-0`}>
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
              setAgentIds([]) // Reset agent when agency changes
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
        <div className="flex flex-col gap-1.5 flex-1 min-w-[160px] relative">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t.agent}</label>
          
          {/* Custom Dropdown Trigger */}
          <div 
            onClick={() => setIsAgentDropdownOpen(!isAgentDropdownOpen)}
            className="bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground cursor-pointer flex justify-between items-center focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <span className="truncate pr-2">
              {agentIds.length === 0 ? t.allAgents : `${agentIds.length} ${t.selected}`}
            </span>
            <span className="text-xs">▼</span>
          </div>

          {/* Custom Dropdown Menu */}
          {isAgentDropdownOpen && (
            <div className="absolute top-[100%] left-0 mt-1 w-full max-h-60 overflow-y-auto bg-card border border-border rounded-lg shadow-lg z-50 p-2 flex flex-col gap-1">
              <label className="flex items-center gap-2 p-1.5 hover:bg-muted rounded-md cursor-pointer text-sm">
                <input 
                  type="checkbox" 
                  checked={agentIds.length === 0} 
                  onChange={() => toggleAgent("all")}
                  className="rounded border-border text-primary focus:ring-primary"
                />
                <span className="truncate">{t.allAgents}</span>
              </label>
              
              {visibleAgents.map(a => (
                <label key={a.id} className="flex items-center gap-2 p-1.5 hover:bg-muted rounded-md cursor-pointer text-sm">
                  <input 
                    type="checkbox" 
                    checked={agentIds.includes(a.id)} 
                    onChange={() => toggleAgent(a.id)}
                    className="rounded border-border text-primary focus:ring-primary"
                  />
                  <span className="truncate">{a.name}</span>
                </label>
              ))}
            </div>
          )}
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
    </div>
  )
}
