"use client"

import { useState } from "react"
import { useLanguage } from "@/components/language-provider"
import { VisitsChart } from "@/components/dashboard/VisitsChart"
import { VisitsTable } from "@/components/dashboard/VisitsTable"
import { Filter } from "lucide-react"

interface VisitsDashboardSectionProps {
  visits: any[]
}

export function VisitsDashboardSection({ visits }: VisitsDashboardSectionProps) {
  const langContext = useLanguage()
  const lang = (langContext === 'en' || langContext === 'es') ? langContext : 'es'
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false)

  const t = {
    es: {
      visitsTitle: 'Actividad de Visitas',
      visitsDesc: 'Resumen de visitas registradas por los agentes.',
      visitsListTitle: 'Visitas Recientes',
      visitsListDesc: 'Últimas 5 visitas registradas en la agencia.',
      from: 'Desde',
      to: 'Hasta',
      filters: 'Filtros',
      show: 'Mostrar',
      hide: 'Ocultar'
    },
    en: {
      visitsTitle: 'Visits Activity',
      visitsDesc: 'Summary of visits registered by agents.',
      visitsListTitle: 'Recent Visits',
      visitsListDesc: 'Last 5 visits registered in the agency.',
      from: 'From',
      to: 'To',
      filters: 'Filters',
      show: 'Show',
      hide: 'Hide'
    }
  }[lang]

  // Filter visits based on date range
  const filteredVisits = visits.filter(visit => {
    if (!startDate && !endDate) return true;
    
    // We can use visit_date or created_at
    const visitDateStr = visit.visit_date || visit.created_at;
    const visitDate = new Date(visitDateStr);
    
    // Normalize visit date to start of day (local time)
    const vDateNorm = new Date(visitDate.getFullYear(), visitDate.getMonth(), visitDate.getDate()).getTime();

    if (startDate) {
      const [year, month, day] = startDate.split('-');
      const startNorm = new Date(parseInt(year), parseInt(month) - 1, parseInt(day)).getTime();
      if (vDateNorm < startNorm) return false;
    }
    
    if (endDate) {
      const [year, month, day] = endDate.split('-');
      const endNorm = new Date(parseInt(year), parseInt(month) - 1, parseInt(day)).getTime();
      if (vDateNorm > endNorm) return false;
    }
    
    return true;
  });

  return (
    <div className="mt-8 space-y-4">
      {/* Filters Mobile Toggle */}
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

      {/* Filters Controls */}
      <div className={`${isMobileFiltersOpen ? 'flex' : 'hidden'} md:flex flex-col sm:flex-row justify-end sm:items-center gap-4`}>
        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
          <label className="text-sm text-muted-foreground">{t.from || 'Desde'}:</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="bg-background border border-border text-foreground text-sm rounded-lg focus:ring-primary focus:border-primary block p-2 w-full sm:w-auto"
          />
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
          <label className="text-sm text-muted-foreground">{t.to || 'Hasta'}:</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="bg-background border border-border text-foreground text-sm rounded-lg focus:ring-primary focus:border-primary block p-2 w-full sm:w-auto"
          />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2 animate-in fade-in slide-in-from-bottom-8 delay-700 duration-700 fill-mode-both">
        <div className="rounded-2xl glass-panel text-card-foreground flex flex-col overflow-hidden">
          <div className="flex flex-col space-y-1.5 p-6 pb-2">
            <h3 className="font-playfair font-semibold text-xl leading-none tracking-tight">{t.visitsTitle}</h3>
            <p className="text-sm text-muted-foreground">{t.visitsDesc}</p>
          </div>
          <div className="p-6 pt-4 flex-1 min-h-[350px] flex items-center justify-center text-muted-foreground w-full">
            <VisitsChart visits={filteredVisits} />
          </div>
        </div>
        
        <div className="rounded-2xl glass-panel text-card-foreground flex flex-col overflow-hidden">
          <div className="flex flex-col space-y-1.5 p-6 pb-2">
            <h3 className="font-playfair font-semibold text-xl leading-none tracking-tight">{t.visitsListTitle}</h3>
            <p className="text-sm text-muted-foreground">{t.visitsListDesc}</p>
          </div>
          <div className="p-6 pt-4 flex-1 w-full overflow-hidden">
            <VisitsTable visits={filteredVisits} />
          </div>
        </div>
      </div>
    </div>
  )
}
