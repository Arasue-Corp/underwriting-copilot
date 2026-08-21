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
  
  const [timeWindow, setTimeWindow] = useState('all')

  const t = {
    es: {
      visitsTitle: 'Actividad de Visitas',
      visitsDesc: 'Resumen de visitas registradas por los agentes.',
      visitsListTitle: 'Visitas Recientes',
      visitsListDesc: 'Últimas 5 visitas registradas en la agencia.',
      all: 'Histórico',
      today: 'Hoy',
      week: 'Esta semana',
      month: 'Este mes',
      year: 'Este año'
    },
    en: {
      visitsTitle: 'Visits Activity',
      visitsDesc: 'Summary of visits registered by agents.',
      visitsListTitle: 'Recent Visits',
      visitsListDesc: 'Last 5 visits registered in the agency.',
      all: 'All Time',
      today: 'Today',
      week: 'This Week',
      month: 'This Month',
      year: 'This Year'
    }
  }[lang]

  // Filter visits based on timeWindow
  const filteredVisits = visits.filter(visit => {
    if (timeWindow === 'all') return true;
    
    const visitDate = new Date(visit.created_at);
    const now = new Date();
    
    // Normalize today to start of day for accurate comparison
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    if (timeWindow === 'today') {
      return visitDate >= startOfToday;
    } else if (timeWindow === 'week') {
      const startOfWeek = new Date(startOfToday);
      startOfWeek.setDate(startOfToday.getDate() - startOfToday.getDay()); // Sunday as start of week
      return visitDate >= startOfWeek;
    } else if (timeWindow === 'month') {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      return visitDate >= startOfMonth;
    } else if (timeWindow === 'year') {
      const startOfYear = new Date(now.getFullYear(), 0, 1);
      return visitDate >= startOfYear;
    }
    
    return true;
  });

  return (
    <div className="mt-8 space-y-4">
      {/* Filters */}
      <div className="flex justify-end">
        <select
          value={timeWindow}
          onChange={(e) => setTimeWindow(e.target.value)}
          className="bg-background border border-border text-foreground text-sm rounded-lg focus:ring-primary focus:border-primary block p-2.5"
        >
          <option value="today">{t.today}</option>
          <option value="week">{t.week}</option>
          <option value="month">{t.month}</option>
          <option value="year">{t.year}</option>
          <option value="all">{t.all}</option>
        </select>
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
