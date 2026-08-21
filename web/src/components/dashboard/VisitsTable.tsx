"use client"

import { useLanguage } from "@/components/language-provider"

export function VisitsTable({ visits }: { visits: any[] }) {
  const langContext = useLanguage()
  const lang = (langContext === 'en' || langContext === 'es') ? langContext : 'es'
  
  const t = {
    es: {
      date: 'Fecha',
      agent: 'Agente',
      client: 'Cliente',
      status: 'Estado',
      notes: 'Notas',
      noVisits: 'No hay visitas recientes'
    },
    en: {
      date: 'Date',
      agent: 'Agent',
      client: 'Client',
      status: 'Status',
      notes: 'Notes',
      noVisits: 'No recent visits'
    }
  }[lang]

  if (!visits || visits.length === 0) {
    return (
      <div className="flex h-[300px] items-center justify-center text-muted-foreground border border-dashed rounded-lg">
        {t.noVisits}
      </div>
    )
  }

  // Show only top 5 recent visits
  const recentVisits = [...visits].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 5)

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b border-border">
          <tr>
            <th className="px-4 py-3 font-semibold">{t.date}</th>
            <th className="px-4 py-3 font-semibold">{t.agent}</th>
            <th className="px-4 py-3 font-semibold">{t.client}</th>
            <th className="px-4 py-3 font-semibold">{t.status}</th>
            <th className="px-4 py-3 font-semibold">{t.notes}</th>
          </tr>
        </thead>
        <tbody>
          {recentVisits.map((visit) => (
            <tr key={visit.id} className="border-b border-border hover:bg-muted/20 transition-colors">
              <td className="px-4 py-3 font-medium text-foreground whitespace-nowrap">
                {new Date(visit.created_at).toLocaleDateString()}
              </td>
              <td className="px-4 py-3">
                <div className="font-medium text-foreground">{visit.creator?.name || 'Unknown'}</div>
              </td>
              <td className="px-4 py-3 text-foreground/80 font-medium">
                {visit.client?.name || 'Unknown'}
              </td>
              <td className="px-4 py-3">
                <span className={`text-[10px] uppercase px-2 py-0.5 rounded-full font-bold ${
                  visit.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'
                }`}>
                  {visit.status || 'PENDING'}
                </span>
              </td>
              <td className="px-4 py-3">
                <p className="line-clamp-2 max-w-[200px] text-muted-foreground text-xs" title={visit.conversation_notes}>
                  {visit.conversation_notes || '-'}
                </p>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
