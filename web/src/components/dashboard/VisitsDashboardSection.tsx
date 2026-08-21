"use client"

import { useState } from "react"
import { useLanguage } from "@/components/language-provider"
import { VisitsChart } from "@/components/dashboard/VisitsChart"
import { VisitsTable } from "@/components/dashboard/VisitsTable"

interface VisitsDashboardSectionProps {
  visits: any[]
}

export function VisitsDashboardSection({ visits }: VisitsDashboardSectionProps) {
  const langContext = useLanguage()
  const lang = (langContext === 'en' || langContext === 'es') ? langContext : 'es'
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  const t = {
    es: {
      visitsTitle: 'Actividad de Visitas',
      visitsDesc: 'Resumen de visitas registradas por los agentes.',
      visitsListTitle: 'Visitas Recientes',
      visitsListDesc: 'Últimas 5 visitas registradas en la agencia.',
      from: 'Desde',
      to: 'Hasta'
    },
    en: {
      visitsTitle: 'Visits Activity',
      visitsDesc: 'Summary of visits registered by agents.',
      visitsListTitle: 'Recent Visits',
      visitsListDesc: 'Last 5 visits registered in the agency.',
      from: 'From',
      to: 'To'
    }
  }[lang]

  // Filter visits based on date range
  const filteredVisits = visits.filter(visit => {
    if (!startDate && !endDate) return true;
    
    const visitDate = new Date(visit.created_at);
    // Normalize visit date to start of day for comparison
    const vDateNorm = new Date(visitDate.getFullYear(), visitDate.getMonth(), visitDate.getDate());

    if (startDate) {
      const start = new Date(startDate);
      const startNorm = new Date(start.getFullYear(), start.getMonth(), start.getDate());
      if (vDateNorm < startNorm) return false;
    }
    
    if (endDate) {
      const end = new Date(endDate);
      const endNorm = new Date(end.getFullYear(), end.getMonth(), end.getDate());
      if (vDateNorm > endNorm) return false;
    }
    
    return true;
  });

  return (
    <div className="mt-8 space-y-4">
      {/* Filters */}
      <div className="flex justify-end items-center gap-4">
        <div className="flex items-center gap-2">
          <label className="text-sm text-muted-foreground">{t.from || 'Desde'}:</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="bg-background border border-border text-foreground text-sm rounded-lg focus:ring-primary focus:border-primary block p-2"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-muted-foreground">{t.to || 'Hasta'}:</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="bg-background border border-border text-foreground text-sm rounded-lg focus:ring-primary focus:border-primary block p-2"
          />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2 animate-in fade-in slide-in-from-bottom-8 delay-700 duration-700 fill-mode-both">
        <div className="rounded-2xl glass-panel text-card-foreground flex flex-col">
          <div className="flex flex-col space-y-1.5 p-6 pb-2">
            <h3 className="font-playfair font-semibold text-xl leading-none tracking-tight">{t.visitsTitle}</h3>
            <p className="text-sm text-muted-foreground">{t.visitsDesc}</p>
          </div>
          <div className="p-6 pt-4 flex-1 min-h-[350px] flex items-center justify-center text-muted-foreground">
            <VisitsChart visits={filteredVisits} />
          </div>
        </div>
        
        <div className="rounded-2xl glass-panel text-card-foreground flex flex-col">
          <div className="flex flex-col space-y-1.5 p-6 pb-2">
            <h3 className="font-playfair font-semibold text-xl leading-none tracking-tight">{t.visitsListTitle}</h3>
            <p className="text-sm text-muted-foreground">{t.visitsListDesc}</p>
          </div>
          <div className="p-6 pt-4 flex-1">
            <VisitsTable visits={filteredVisits} />
          </div>
        </div>
      </div>
    </div>
  )
}
