'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from "@/lib/supabase/client"
import { Search, ChevronRight, UserPlus, FileText, CheckCircle2, XCircle, Clock, Eye, Trash2, Send, Download, Phone, Mail, FileUp, X, File, ShieldAlert, ArrowRightLeft, Building, Edit, Plus, History, ListTodo } from 'lucide-react'
import { toast } from 'sonner'
import { createVisit } from '@/app/actions/visits'
import { deleteClient } from '@/app/actions/clients'
import { useLanguage } from '@/components/language-provider'
import { VisitModal } from '@/components/visits/VisitModal'
import { TaskModal } from '@/components/tasks/TaskModal'
import { EditClientModal } from '@/components/clients/EditClientModal'
import { ActivityLogsModal } from '@/components/logs/ActivityLogsModal'

export default function ClientsPage() {
  const langContext = useLanguage()
  const lang = (langContext === 'en' || langContext === 'es') ? langContext : 'es'
  const t = {
    es: {
      title: 'Directorio de Clientes',
      searchPlaceholder: 'Buscar cliente...',
      clientsFound: 'Clientes encontrados',
      loading: 'Cargando...',
      visits: 'visitas',
      selectToView: 'Selecciona un cliente para ver su información 360°',
      structure: 'Estructura:',
      address: 'Dirección:',
      contact: 'Contacto:',
      notRegistered: 'No registrado',
      editClient: 'Editar Cliente',
      logVisit: 'Registrar Visita',
      newTask: 'Nueva Tarea',
      quoteHistory: 'Historial de Cotizaciones',
      noQuotes: 'Este cliente no tiene cotizaciones aún.',
      carrier: 'Aseguradora:',
      tbd: 'Por definir',
      renews: 'Renueva:',
      visitLog: 'Bitácora de Visitas / Actividad',
      noVisits: 'No hay visitas registradas para este cliente.',
      dataError: 'Error al cargar datos'
    },
    en: {
      title: 'Clients Directory',
      searchPlaceholder: 'Search client...',
      clientsFound: 'Clients found',
      loading: 'Loading...',
      visits: 'visits',
      selectToView: 'Select a client to view their 360° information',
      structure: 'Structure:',
      address: 'Address:',
      contact: 'Contact:',
      notRegistered: 'Not registered',
      editClient: 'Edit Client',
      logVisit: 'Log Visit',
      newTask: 'New Task',
      quoteHistory: 'Quote History',
      noQuotes: 'This client has no quotes yet.',
      carrier: 'Carrier:',
      tbd: 'TBD',
      renews: 'Renews:',
      visitLog: 'Visit & Activity Log',
      noVisits: 'No visits registered for this client.',
      dataError: 'Error loading data'
    }
  }[lang]

  const [clients, setClients] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedClient, setSelectedClient] = useState<any | null>(null)
  const [userRole, setUserRole] = useState<string>('')
  const [agents, setAgents] = useState<any[]>([])
  const [user, setUser] = useState<any>(null)
  
  // Modals State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isLogsModalOpen, setIsLogsModalOpen] = useState(false)
  const [isVisitModalOpen, setIsVisitModalOpen] = useState(false)
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false)
  
  const [expandedVisits, setExpandedVisits] = useState<Record<string, boolean>>({})

  const supabase = createClient()

  useEffect(() => {
    loadClients()
  }, [])

  const loadClients = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setLoading(false)
      return
    }
    const { data: profile } = await supabase.from('profiles').select('agency_id, role').eq('id', user.id).single()
    
    if (profile) {
      setUserRole(profile.role)
      setUser(user)
      if (profile.role !== 'AGENT') {
        const agts = await supabase.from('profiles').select('id, name, role').eq('agency_id', profile.agency_id)
        if (agts.data) setAgents(agts.data)
      } else {
        setAgents([profile])
      }
      let clientsQuery = supabase
        .from('clients')
        .select(          id,
          name,
          first_name,
          last_name,
          legal_structure,
          fein,
          logo_url,
          address,
          contact,
          created_at
        \)
        
      let quotesQuery = supabase
        .from('quote_requests')
        .select('id, status, created_at, accepted_at, sold_premium, carrier_id, coverage_requested, client_name')
        
      let visitsQuery = supabase
        .from('visits')
        .select('*')

      if (profile.role !== 'ADMIN' && profile.role !== 'DEMO') {
        clientsQuery = clientsQuery.eq('agency_id', profile.agency_id)
        quotesQuery = quotesQuery.eq('agency_id', profile.agency_id)
        visitsQuery = visitsQuery.eq('agency_id', profile.agency_id)
      }

      const { data: clientsData, error: clientsError } = await clientsQuery.order('name')
      const { data: quotesData, error: quotesError } = await quotesQuery
      const { data: visitsData, error: visitsError } = await visitsQuery


      if (clientsError || quotesError || visitsError) {
        toast.error(t.dataError)
      } else {
        const mergedClients = clientsData.map(client => ({
          ...client,
          quote_requests: quotesData.filter((q: any) => q.client_name === client.name),
          visits: visitsData.filter((v: any) => v.client_id === client.id)
        }))
        setClients(mergedClients)
        if (selectedClient) {
           setSelectedClient(mergedClients.find(c => c.id === selectedClient.id))
        }
      }
    }
    setLoading(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este cliente? Se eliminarán también cotizaciones asociadas.')) return;
    const res = await deleteClient(id);
    if (res.success) {
      toast.success('Cliente eliminado');
      if (selectedClient?.id === id) setSelectedClient(null);
      loadClients();
    } else {
      toast.error(res.error || 'Error');
    }
  }

  const filteredClients = clients.filter(c => c.name.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-3xl font-bold tracking-tight">{t.title}</h2>
        
        <div className="flex items-center space-x-2">
          <div className="relative w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder={t.searchPlaceholder}
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
            {filteredClients.length} {t.clientsFound}
          </div>
          <div className="overflow-y-auto flex-1 p-2">
            {loading ? (
              <div className="p-4 text-center text-muted-foreground">{t.loading}</div>
            ) : filteredClients.map(client => (
              <div 
                key={client.id}
                onClick={() => setSelectedClient(client)}
                className={`p-3 rounded-lg cursor-pointer transition-colors flex items-center justify-between mb-1 ${selectedClient?.id === client.id ? 'bg-primary/10 border border-primary/30' : 'hover:bg-muted border border-transparent'}`}
              >
                <div>
                  <h4 className={`font-semibold ${selectedClient?.id === client.id ? 'text-primary' : 'text-foreground'}`}>{client.name}</h4>
                  <div className="text-xs text-muted-foreground mt-1">
                    {client.quote_requests?.length || 0} quotes • {client.visits?.length || 0} {t.visits}
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
              <p>{t.selectToView}</p>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto">
              <div className="p-6 border-b border-border bg-gradient-to-r from-muted/50 to-transparent">
                <div className="flex items-center justify-between gap-4">
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
                      {(selectedClient.first_name || selectedClient.last_name) && (
                        <div className="text-sm font-medium text-muted-foreground mt-1">
                          {selectedClient.first_name} {selectedClient.last_name}
                        </div>
                      )}
                      <div className="flex flex-col gap-1 mt-2 text-sm text-muted-foreground">
                        <div className="flex gap-4">
                          <span><strong className="text-foreground/70 font-medium">FEIN:</strong> {selectedClient.fein || t.notRegistered}</span>
                          <span><strong className="text-foreground/70 font-medium">{t.structure}</strong> {selectedClient.legal_structure || t.notRegistered}</span>
                        </div>
                        <div className="flex gap-4 mt-1">
                          <span><strong className="text-foreground/70 font-medium">{t.address}</strong> {selectedClient.address || t.notRegistered}</span>
                          <span><strong className="text-foreground/70 font-medium">{t.contact}</strong> {selectedClient.contact || t.notRegistered}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {(userRole === 'ADMIN' || userRole === 'DEMO') && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); setIsLogsModalOpen(true); }}
                        className="bg-muted text-muted-foreground hover:bg-muted/80 p-2 rounded-lg shadow-sm border border-border flex items-center justify-center"
                        title="Ver registro de actividad"
                      >
                        <History className="w-5 h-5" />
                      </button>
                    )}
                    {(userRole === 'ADMIN' || userRole === 'DEMO') && (
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleDelete(selectedClient.id); }}
                          className="bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 px-4 py-2 rounded-lg font-medium shadow-sm flex items-center gap-2 border border-rose-500/20"
                        >
                          <Trash2 className="w-4 h-4" />
                          {'Eliminar'}
                        </button>
                    )}
                    {((userRole === 'ADMIN' || userRole === 'DEMO') || userRole === 'MANAGER') && (
                      <button 
                        onClick={() => setIsEditModalOpen(true)}
                        className="bg-muted text-muted-foreground hover:bg-muted/80 px-4 py-2 rounded-lg font-medium shadow-sm flex items-center gap-2 border border-border"
                      >
                        <Edit className="w-4 h-4" />
                        {t.editClient}
                      </button>
                    )}
                    <button 
                      onClick={() => setIsVisitModalOpen(true)}
                      className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-lg font-medium shadow-sm flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      {t.logVisit}
                    </button>
                    <button 
                      onClick={() => setIsTaskModalOpen(true)}
                      className="bg-secondary text-secondary-foreground hover:bg-secondary/80 px-4 py-2 rounded-lg font-medium shadow-sm flex items-center gap-2"
                    >
                      <ListTodo className="w-4 h-4" />
                      {t.newTask}
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* Historial Cotizaciones */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-500" />
                    {t.quoteHistory}
                  </h3>
                  {(!selectedClient.quote_requests || selectedClient.quote_requests.length === 0) ? (
                    <p className="text-muted-foreground text-sm">{t.noQuotes}</p>
                  ) : (
                    <div className="space-y-4">
                      {selectedClient.quote_requests.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).map((quote: any) => (
                        <Link href={`/proposals/${quote.id}`} key={quote.id} className="block border border-border rounded-xl p-5 bg-card hover:bg-muted/50 transition-colors shadow-sm flex flex-col justify-between gap-4 cursor-pointer group">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-bold text-base text-foreground group-hover:text-primary transition-colors">{quote.coverage_requested}</span>
                              <span className={`text-[10px] uppercase px-2 py-0.5 rounded-full border font-bold ${
                                quote.status === 'ACCEPTED' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30' :
                                quote.status === 'REJECTED' ? 'bg-red-500/10 text-red-600 border-red-500/30' :
                                'bg-amber-500/10 text-amber-600 border-amber-500/30'
                              }`}>
                                {quote.status}
                              </span>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {t.carrier} <span className="font-medium text-foreground">{quote.carrier_id || t.tbd}</span>
                            </div>
                          </div>
                          <div className="flex flex-col items-start gap-1">
                            {quote.status === 'ACCEPTED' && quote.accepted_at ? (
                              <div className="flex items-center gap-1 text-xs text-emerald-600 font-medium">
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                {t.renews} {new Date(new Date(quote.accepted_at).setFullYear(new Date(quote.accepted_at).getFullYear() + 1)).toLocaleDateString()}
                              </div>
                            ) : (
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Clock className="h-3.5 w-3.5" />
                                {new Date(quote.created_at).toLocaleDateString()}
                              </div>
                            )}
                            {quote.sold_premium && (
                              <div className="text-sm font-bold">${parseFloat(quote.sold_premium).toLocaleString()} USD</div>
                            )}
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>

                {/* Historial Visitas */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Clock className="h-5 w-5 text-amber-500" />
                    {t.visitLog}
                  </h3>
                  {(!selectedClient.visits || selectedClient.visits.length === 0) ? (
                    <p className="text-muted-foreground text-sm">{t.noVisits}</p>
                  ) : (
                    <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
                      {selectedClient.visits.sort((a: any, b: any) => new Date(b.visit_date || b.created_at).getTime() - new Date(a.visit_date || a.created_at).getTime()).map((visit: any) => (
                        <div key={visit.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                          <div className="flex items-center justify-center w-10 h-10 rounded-full border border-border bg-card text-muted-foreground shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm z-10">
                            <Building className="w-4 h-4" />
                          </div>
                          <div 
                              className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-card border border-border p-5 rounded-2xl shadow-sm hover:shadow-md transition-all cursor-pointer"
                              onClick={() => setExpandedVisits(prev => ({ ...prev, [visit.id]: !prev[visit.id] }))}
                            >
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-bold text-muted-foreground">
                                {new Date(visit.visit_date || visit.created_at).toLocaleDateString()}
                              </span>
                              <span className={`text-[9px] uppercase px-2 py-0.5 rounded-full font-bold ${
                                visit.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'
                              }`}>{visit.status}</span>
                            </div>
                            {visit.conversation_notes && (
                              <p className={`text-base text-foreground/90 mb-3 ${expandedVisits[visit.id] ? '' : 'line-clamp-3'}`}>{visit.conversation_notes}</p>
                            )}
                            {visit.policies_needed && visit.policies_needed.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {visit.policies_needed.slice(0,3).map((p:string, i:number) => (
                                  <span key={i} className="text-xs font-medium bg-primary/10 text-primary px-2.5 py-1 rounded-md">{p}</span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            </div>
          )}
        </div>
      </div>

      {/* Visit Modal */}
      <VisitModal 
        isOpen={isVisitModalOpen} 
        onClose={() => setIsVisitModalOpen(false)} 
        onSuccess={() => {
          setIsVisitModalOpen(false)
          loadClients()
        }}
        clients={clients}
        preselectedClientId={selectedClient?.id}
      />

      <TaskModal 
        isOpen={isTaskModalOpen} 
        onClose={() => setIsTaskModalOpen(false)} 
        onSuccess={() => {
          setIsTaskModalOpen(false)
          loadClients()
        }}
        clients={clients}
        agents={agents}
        userProfile={{ id: user?.id, role: userRole }}
        preselectedClientId={selectedClient?.id}
      />

      {/* Edit Client Modal */}
      <EditClientModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={() => {
          setIsEditModalOpen(false)
          loadClients()
        }}
        client={selectedClient}
      />

      <ActivityLogsModal
        isOpen={isLogsModalOpen}
        onClose={() => setIsLogsModalOpen(false)}
        entityType="clients"
        entityId={selectedClient?.id}
        entityName={selectedClient?.name}
      />
    </div>
  )
}
