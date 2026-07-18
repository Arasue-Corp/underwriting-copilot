'use client'

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { PlusCircle, Search, FileText, ChevronRight, CheckCircle2, Calendar } from 'lucide-react'
import { toast } from 'sonner'

export default function ClientsPage() {
  const [clients, setClients] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedClient, setSelectedClient] = useState<any | null>(null)
  const supabase = createClientComponentClient()

  useEffect(() => {
    loadClients()
  }, [])

  const loadClients = async () => {
    setLoading(true)
    const { data: userProfile } = await supabase.from('profiles').select('agency_id').single()
    
    if (userProfile?.agency_id) {
      // Fetch clients and their recent quotes
      const { data: clientsData, error } = await supabase
        .from('clients')
        .select(`
          id,
          name,
          legal_structure,
          fein,
          logo_url,
          created_at,
          quote_requests (
            id,
            status,
            created_at,
            accepted_at,
            sold_premium,
            carrier_id,
            coverage_requested
          )
        `)
        .eq('agency_id', userProfile.agency_id)
        .order('name')

      if (error) {
        toast.error("Error al cargar clientes")
        console.error(error)
      } else {
        setClients(clientsData || [])
      }
    }
    setLoading(false)
  }

  const filteredClients = clients.filter(c => c.name.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-3xl font-bold tracking-tight">Directorio de Clientes</h2>
        
        <div className="flex items-center space-x-2">
          <div className="relative w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Buscar cliente..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-background border border-border rounded-md py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Lista de Clientes */}
        <div className="md:col-span-1 border border-border rounded-xl bg-card overflow-hidden h-[calc(100vh-200px)] flex flex-col">
          <div className="p-4 border-b border-border font-semibold bg-muted/50">
            {filteredClients.length} Clientes encontrados
          </div>
          <div className="overflow-y-auto flex-1 p-2">
            {loading ? (
              <div className="p-4 text-center text-muted-foreground">Cargando...</div>
            ) : filteredClients.map(client => (
              <div 
                key={client.id}
                onClick={() => setSelectedClient(client)}
                className={`p-3 rounded-lg cursor-pointer transition-colors flex items-center justify-between mb-1 ${selectedClient?.id === client.id ? 'bg-primary/10 border border-primary/30' : 'hover:bg-muted border border-transparent'}`}
              >
                <div>
                  <h4 className={`font-semibold ${selectedClient?.id === client.id ? 'text-primary' : 'text-foreground'}`}>{client.name}</h4>
                  <div className="text-xs text-muted-foreground mt-1">
                    {client.quote_requests?.length || 0} solicitudes
                  </div>
                </div>
                <ChevronRight className={`h-4 w-4 ${selectedClient?.id === client.id ? 'text-primary' : 'text-muted-foreground'}`} />
              </div>
            ))}
          </div>
        </div>

        {/* Client 360 View */}
        <div className="md:col-span-2 border border-border rounded-xl bg-card overflow-hidden h-[calc(100vh-200px)] flex flex-col relative">
          {!selectedClient ? (
            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-8">
              <div className="bg-muted p-4 rounded-full mb-4">
                <Search className="h-8 w-8 opacity-50" />
              </div>
              <p>Selecciona un cliente para ver su información 360°</p>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto">
              <div className="p-6 border-b border-border bg-gradient-to-r from-muted/50 to-transparent">
                <div className="flex items-center gap-4">
                  {selectedClient.logo_url ? (
                    <img src={selectedClient.logo_url} alt={selectedClient.name} className="w-16 h-16 rounded-md object-cover border border-border bg-white" />
                  ) : (
                    <div className="w-16 h-16 rounded-md border border-border bg-muted flex items-center justify-center text-xl font-bold text-muted-foreground">
                      {selectedClient.name.substring(0, 2).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <h2 className="text-2xl font-bold">{selectedClient.name}</h2>
                    <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                      <span>FEIN: {selectedClient.fein || 'No registrado'}</span>
                      <span>Estructura: {selectedClient.legal_structure || 'No registrado'}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Historial de Cotizaciones
                </h3>

                {(!selectedClient.quote_requests || selectedClient.quote_requests.length === 0) ? (
                  <p className="text-muted-foreground text-sm">Este cliente no tiene cotizaciones aún.</p>
                ) : (
                  <div className="space-y-4">
                    {selectedClient.quote_requests.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).map((quote: any) => (
                      <div key={quote.id} className="border border-border rounded-lg p-4 bg-muted/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-foreground">{quote.coverage_requested}</span>
                            <span className={`text-[10px] uppercase px-2 py-0.5 rounded-full border font-bold ${
                              quote.status === 'ACCEPTED' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30' :
                              quote.status === 'REJECTED' ? 'bg-red-500/10 text-red-600 border-red-500/30' :
                              'bg-amber-500/10 text-amber-600 border-amber-500/30'
                            }`}>
                              {quote.status}
                            </span>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Aseguradora: <span className="font-medium text-foreground">{quote.carrier_id || 'Por definir'}</span>
                          </div>
                        </div>

                        <div className="flex flex-col items-start md:items-end gap-1">
                          {quote.status === 'ACCEPTED' && quote.accepted_at ? (
                            <div className="flex items-center gap-1 text-xs text-emerald-600 font-medium">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              Renueva: {new Date(new Date(quote.accepted_at).setFullYear(new Date(quote.accepted_at).getFullYear() + 1)).toLocaleDateString()}
                            </div>
                          ) : (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Calendar className="h-3.5 w-3.5" />
                              Creada: {new Date(quote.created_at).toLocaleDateString()}
                            </div>
                          )}
                          {quote.sold_premium && (
                            <div className="text-sm font-bold">${parseFloat(quote.sold_premium).toLocaleString()} USD</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
