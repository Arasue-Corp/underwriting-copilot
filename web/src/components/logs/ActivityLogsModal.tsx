"use client"

import { useState, useEffect } from "react"
import { X, History, Clock } from "lucide-react"
import { getActivityLogs } from "@/app/actions/logs"
import { useLanguage } from "@/components/language-provider"

interface ActivityLogsModalProps {
  isOpen: boolean
  onClose: () => void
  entityType: string
  entityId: string
  entityName?: string
}

export function ActivityLogsModal({ isOpen, onClose, entityType, entityId, entityName }: ActivityLogsModalProps) {
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const language = useLanguage()

  useEffect(() => {
    if (isOpen) {
      loadLogs()
    }
  }, [isOpen, entityType, entityId])

  const loadLogs = async () => {
    setLoading(true)
    setError(null)
    const res = await getActivityLogs(entityType, entityId)
    if (res.success) {
      setLogs(res.data || [])
    } else {
      setError(res.error || (language === 'es' ? "Error cargando logs" : "Error loading logs"))
    }
    setLoading(false)
  }

  if (!isOpen) return null

  // Function to parse diffs beautifully
  const renderDiff = (action: string, oldData: any, newData: any) => {
    if (action === 'INSERT') return <div className="text-xs text-muted-foreground mt-1">{language === 'es' ? 'Registro creado' : 'Record created'}</div>
    if (action === 'DELETE') return <div className="text-xs text-muted-foreground mt-1 text-red-500">{language === 'es' ? 'Registro eliminado' : 'Record deleted'}</div>
    
    if (action === 'UPDATE' && oldData && newData) {
      const changes: string[] = []
      for (const key in newData) {
        if (key === 'updated_at' || key === 'created_at') continue
        
        const oldVal = oldData[key]
        const newVal = newData[key]
        
        if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
           // Skip internal keys or format them nicely if needed
           changes.push(language === 'es' ? `[${key}] cambió de '${oldVal || 'vacio'}' a '${newVal || 'vacio'}'` : `[${key}] changed from '${oldVal || 'empty'}' to '${newVal || 'empty'}'`)
        }
      }
      
      if (changes.length === 0) return <div className="text-xs text-muted-foreground mt-1">{language === 'es' ? 'Se actualizó sin cambios detectables (ej. timestamps)' : 'Updated with no detectable changes (e.g. timestamps)'}</div>
      
      return (
        <ul className="text-[11px] text-muted-foreground mt-2 space-y-1 list-disc pl-4">
          {changes.map((c, i) => <li key={i}>{c}</li>)}
        </ul>
      )
    }

    return null
  }

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-card w-full max-w-xl rounded-2xl shadow-2xl border border-border flex flex-col max-h-[85vh]">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-bold">Activity Logs</h3>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:bg-muted p-1.5 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-5 overflow-y-auto flex-1 bg-muted/10">
          {entityName && (
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold mb-4">
              {language === 'es' ? 'Registro:' : 'Record:'} {entityName}
            </p>
          )}

          {loading ? (
            <div className="text-center p-8 text-muted-foreground text-sm">{language === 'es' ? 'Cargando actividad...' : 'Loading activity...'}</div>
          ) : error ? (
            <div className="text-center p-8 text-red-500 text-sm">{error}</div>
          ) : logs.length === 0 ? (
            <div className="text-center p-8 text-muted-foreground text-sm">{language === 'es' ? 'No hay registros de actividad para este elemento.' : 'No activity records for this item.'}</div>
          ) : (
            <div className="relative space-y-4 before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-border before:to-transparent">
              {logs.map((log: any) => (
                <div key={log.id} className="relative flex items-start gap-4">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border-2 border-background bg-muted text-muted-foreground shrink-0 shadow-sm z-10 relative">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div className="bg-card border border-border p-4 rounded-xl shadow-sm flex-1">
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-semibold text-sm">
                        {log.profiles?.name || 'Usuario Desconocido'}
                      </span>
                      <span className="text-[10px] text-muted-foreground font-medium">
                        {new Date(log.created_at).toLocaleString()}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                        log.action === 'INSERT' ? 'bg-emerald-500/10 text-emerald-600' :
                        log.action === 'UPDATE' ? 'bg-amber-500/10 text-amber-600' :
                        'bg-red-500/10 text-red-600'
                      }`}>
                        {log.action}
                      </span>
                    </div>

                    {renderDiff(log.action, log.old_data, log.new_data)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
