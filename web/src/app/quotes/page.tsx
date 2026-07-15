"use client"

import { useState, useEffect } from "react"
import { FileText, CheckCircle2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { updateQuoteWithPremium } from "@/app/actions/quote"

export default function QuotesPage() {
  const [quotes, setQuotes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [premiumAmount, setPremiumAmount] = useState<string>("")
  const supabase = createClient()

  useEffect(() => {
    async function loadQuotes() {
      const { data } = await supabase
        .from("quote_requests")
        .select(`*, profiles(name, agency_id), agencies(name)`)
        .order("created_at", { ascending: false })
      
      if (data) setQuotes(data)
      setLoading(false)
    }
    loadQuotes()
  }, [])

  const handleProcessQuote = async (quoteId: string) => {
    if (!premiumAmount) return alert("Ingresa la prima final")
    
    // Simulate PDF Upload - In real app, upload to supabase storage here
    const fakePdfPath = `${quoteId}-final.pdf`
    
    await updateQuoteWithPremium(quoteId, parseFloat(premiumAmount), fakePdfPath)
    
    // Refresh
    const { data } = await supabase
        .from("quote_requests")
        .select(`*, profiles(name, agency_id), agencies(name)`)
        .order("created_at", { ascending: false })
    if (data) setQuotes(data)
    
    setProcessingId(null)
    setPremiumAmount("")
    alert("Cotización procesada. La comisión fue calculada automáticamente.")
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Bandeja de Solicitudes</h2>
      </div>

      <div className="rounded-xl border bg-card text-card-foreground shadow">
        <div className="border-b border-border p-4">
          <h3 className="font-semibold">Solicitudes Pendientes y Procesadas</h3>
        </div>
        
        <div className="p-0">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 text-muted-foreground border-b border-border">
              <tr>
                <th className="px-6 py-3 font-medium">Cliente</th>
                <th className="px-6 py-3 font-medium">Aseguradora</th>
                <th className="px-6 py-3 font-medium">Cobertura</th>
                <th className="px-6 py-3 font-medium">Agente</th>
                <th className="px-6 py-3 font-medium">Estado</th>
                <th className="px-6 py-3 font-medium text-right">Acción</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                    Cargando solicitudes...
                  </td>
                </tr>
              ) : quotes.map((quote) => (
                <tr key={quote.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                  <td className="px-6 py-4 font-medium">{quote.client_name}</td>
                  <td className="px-6 py-4">{quote.carrier_id}</td>
                  <td className="px-6 py-4">{quote.coverage_requested}</td>
                  <td className="px-6 py-4 text-muted-foreground">{quote.profiles?.name}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      quote.status === 'QUOTED' ? 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/30' :
                      'bg-amber-500/15 text-amber-500 border border-amber-500/30'
                    }`}>
                      {quote.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {quote.status === 'PENDING_MANAGER' ? (
                      processingId === quote.id ? (
                        <div className="flex items-center justify-end space-x-2">
                          <input 
                            type="number" 
                            placeholder="Prima $" 
                            value={premiumAmount}
                            onChange={(e) => setPremiumAmount(e.target.value)}
                            className="w-24 flex h-8 rounded-md border border-input bg-background px-2 py-1 text-xs ring-offset-background"
                          />
                          <button 
                            onClick={() => handleProcessQuote(quote.id)}
                            className="bg-primary text-primary-foreground hover:bg-primary/90 px-3 py-1.5 rounded-md text-xs font-medium transition-colors"
                          >
                            Guardar
                          </button>
                        </div>
                      ) : (
                        <button 
                          onClick={() => setProcessingId(quote.id)}
                          className="bg-secondary text-secondary-foreground hover:bg-secondary/80 px-4 py-2 rounded-md text-sm font-medium transition-colors"
                        >
                          Procesar
                        </button>
                      )
                    ) : (
                      <div className="flex justify-end text-emerald-500 items-center text-sm font-medium">
                        <CheckCircle2 className="h-4 w-4 mr-1" />
                        Comisión: ${quote.commission_amount}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {!loading && quotes.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                    No hay solicitudes en la bandeja.
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
