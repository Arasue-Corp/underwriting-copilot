"use client"

import { useState, useEffect } from "react"
import { CheckCircle2, Eye, FileText, UserPlus, X, Plus, Upload, Check } from "lucide-react"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { processMultipleQuotes, assignQuoteRequest, updateQuoteStatus } from "@/app/actions/quote"

export default function QuotesPage() {
  const [quotes, setQuotes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [agencyMembers, setAgencyMembers] = useState<any[]>([])
  
  // Modals state
  const [detailsQuote, setDetailsQuote] = useState<any>(null)
  const [processQuote, setProcessQuote] = useState<any>(null)
  const [assignQuote, setAssignQuote] = useState<any>(null)
  const [acceptQuote, setAcceptQuote] = useState<any>(null)
  
  // Process State
  const [proposals, setProposals] = useState<{product: string, premium: string, commission_percentage: string, file: File | null}[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [soldPremium, setSoldPremium] = useState("")
  const [commissionPercentage, setCommissionPercentage] = useState("")
  
  // Filter state
  const [filter, setFilter] = useState<'ALL' | 'ASSIGNED_TO_ME' | 'CREATED_BY_ME'>('ALL')
  
  const supabase = createClient()

  const loadData = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single()
      
    setUserProfile(profile)

    if (profile && (profile.role === 'MANAGER' || profile.role === 'ADMIN')) {
      const { data: members } = await supabase
        .from("profiles")
        .select("id, name")
        .eq("agency_id", profile.agency_id)
      if (members) setAgencyMembers(members)
    }

    const { data } = await supabase
      .from("quote_requests")
      .select(`*, profiles!agent_id(name, agency_id), assignee:profiles!assigned_to(name), agencies(name, logo_url)`)
      .order("created_at", { ascending: false })
    
    if (data) setQuotes(data)
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault()
    const form = e.target as HTMLFormElement
    const assigneeId = (form.elements.namedItem("assignee") as HTMLSelectElement).value
    if (!assigneeId) return
    
    setIsUploading(true)
    const res = await assignQuoteRequest(assignQuote.id, assigneeId)
    if (res.success) {
      toast.success("Solicitud reasignada")
      setAssignQuote(null)
      loadData()
    } else {
      toast.error(res.error || "Error al asignar")
    }
    setIsUploading(false)
  }

  const handleProcessSubmit = async () => {
    if (proposals.length === 0) return toast.error("Agrega al menos una propuesta")
    for (const p of proposals) {
      if (!p.premium || !p.commission_percentage || !p.file) return toast.error("Completa prima, % de comisión y archivo para todas las propuestas")
    }
    
    setIsUploading(true)
    
    try {
      const uploadedProposals = []
      for (const p of proposals) {
        const fileExt = p.file!.name.split('.').pop()
        const fileName = `${processQuote.id}-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
        const filePath = `policies/${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('quotes-bucket')
          .upload(filePath, p.file!)

        if (uploadError) throw new Error("Error al subir el archivo PDF: " + p.file!.name)

        const { data: publicUrlData } = supabase.storage
          .from('quotes-bucket')
          .getPublicUrl(filePath)
          
        uploadedProposals.push({
          product: p.product,
          premium: parseFloat(p.premium),
          commission_percentage: parseFloat(p.commission_percentage),
          file_url: publicUrlData.publicUrl
        })
      }

      const res = await processMultipleQuotes(processQuote.id, uploadedProposals)
      if (res.success) {
        toast.success("Cotización procesada exitosamente")
        setProcessQuote(null)
        setProposals([])
        loadData()
      } else {
        throw new Error("Error al guardar en base de datos")
      }
    } catch (err: any) {
      toast.error(err.message || "Ocurrió un error al procesar")
    } finally {
      setIsUploading(false)
    }
  }

  const handleStatusChange = async (quote: any, newStatus: string) => {
    if (newStatus === 'ACCEPTED') {
      setAcceptQuote(quote)
      return
    }

    setIsUploading(true)
    const res = await updateQuoteStatus(quote.id, newStatus)
    if (res.success) {
      loadData()
    } else {
      toast.error("Error al actualizar estatus")
    }
    setIsUploading(false)
  }

  const handleAcceptSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsUploading(true)
    const res = await updateQuoteStatus(
      acceptQuote.id, 
      'ACCEPTED', 
      parseFloat(soldPremium), 
      parseFloat(commissionPercentage)
    )
    if (res.success) {
      setAcceptQuote(null)
      setSoldPremium("")
      setCommissionPercentage("")
      loadData()
    } else {
      toast.error("Error al actualizar estatus")
    }
    setIsUploading(false)
  }

  const filteredQuotes = quotes.filter(q => {
    if (filter === 'ALL') return true
    if (filter === 'ASSIGNED_TO_ME') return q.assigned_to === userProfile?.id
    if (filter === 'CREATED_BY_ME') return q.agent_id === userProfile?.id
    return true
  })

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6 relative">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-3xl font-bold tracking-tight">Bandeja de Solicitudes</h2>
        <div className="flex flex-wrap gap-2">
           <button onClick={() => setFilter('ALL')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'ALL' ? 'bg-primary text-primary-foreground shadow-sm' : 'bg-muted hover:bg-muted/80'}`}>Todas</button>
           <button onClick={() => setFilter('ASSIGNED_TO_ME')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'ASSIGNED_TO_ME' ? 'bg-primary text-primary-foreground shadow-sm' : 'bg-muted hover:bg-muted/80'}`}>Asignadas a mí</button>
           <button onClick={() => setFilter('CREATED_BY_ME')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'CREATED_BY_ME' ? 'bg-primary text-primary-foreground shadow-sm' : 'bg-muted hover:bg-muted/80'}`}>Creadas por mí</button>
        </div>
      </div>

      <div className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-muted-foreground">Cargando solicitudes...</div>
        ) : filteredQuotes.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">No hay solicitudes para mostrar.</div>
        ) : (
          <>
            {/* Mobile View */}
            <div className="grid grid-cols-1 gap-4 p-4 md:hidden">
              {filteredQuotes.map((quote) => (
                <div key={quote.id} className="border border-border/50 rounded-xl p-5 space-y-4 bg-gradient-to-b from-muted/10 to-transparent shadow-sm relative overflow-hidden">
                  
                  {/* Decorator line */}
                  <div className={`absolute top-0 left-0 w-1 h-full ${quote.status === 'QUOTED' ? 'bg-emerald-500' : 'bg-amber-500'}`} />

                  <div className="flex justify-between items-start pl-2">
                    <div>
                      <select 
                        value={quote.status}
                        onChange={(e) => handleStatusChange(quote, e.target.value)}
                        disabled={isUploading}
                        className={`mb-2 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase border ${
                          quote.status === 'ACCEPTED' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30' :
                          quote.status === 'REJECTED' ? 'bg-red-500/10 text-red-600 border-red-500/30' :
                          quote.status === 'QUOTED' ? 'bg-blue-500/10 text-blue-600 border-blue-500/30' :
                          quote.status === 'SUBMITTED_TO_CARRIER' ? 'bg-indigo-500/10 text-indigo-600 border-indigo-500/30' :
                          'bg-amber-500/10 text-amber-600 border-amber-500/30'
                        }`}
                      >
                        <option value="PENDING_MANAGER">Pendiente Manager</option>
                        <option value="PENDING_AGENT">Pendiente Agente</option>
                        <option value="SUBMITTED_TO_CARRIER">Enviada a Carrier</option>
                        <option value="QUOTED">Cotizado</option>
                        <option value="REJECTED">Rechazada</option>
                        <option value="ACCEPTED">Aceptada</option>
                      </select>
                      <h4 className="font-bold text-lg leading-tight text-foreground">{quote.client_name}</h4>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pl-2">
                    <div className="space-y-1">
                      <div className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">Aseguradora</div>
                      <div className="text-sm font-medium text-foreground">{quote.carrier_id}</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">Cobertura</div>
                      <div className="text-sm font-medium text-foreground">{quote.coverage_requested}</div>
                    </div>
                  </div>

                  <div className="bg-muted/30 rounded-lg p-3 grid grid-cols-2 gap-2 text-xs border border-border/50 ml-2">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-muted-foreground font-medium">CREADOR</span> 
                      <span className="font-medium text-foreground truncate">{quote.profiles?.name}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] text-muted-foreground font-medium">ASIGNADO A</span> 
                      <span className="font-medium text-foreground truncate">{quote.assignee?.name || 'Sin asignar'}</span>
                    </div>
                  </div>

                  <div className="pt-2 pl-2 flex gap-2">
                    <button 
                      onClick={() => setDetailsQuote(quote)}
                      title="Ver Detalles"
                      className="p-2.5 bg-secondary/50 text-secondary-foreground rounded-lg hover:bg-secondary transition-colors"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                    
                    {quote.status !== 'QUOTED' && (userProfile?.role === 'MANAGER' || userProfile?.role === 'ADMIN') && (
                      <button 
                        onClick={() => setAssignQuote(quote)}
                        title="Reasignar"
                        className="p-2.5 bg-secondary/50 text-secondary-foreground rounded-lg hover:bg-secondary transition-colors"
                      >
                        <UserPlus className="w-5 h-5" />
                      </button>
                    )}

                    {quote.status === 'QUOTED' ? (
                       <button onClick={() => setDetailsQuote(quote)} className="bg-emerald-500 text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-emerald-600 flex-1 transition-colors shadow-sm">Ver Propuestas</button>
                    ) : (
                      <button 
                        onClick={() => {
                          setProcessQuote(quote)
                          setProposals(quote.products?.map((p: any) => ({ product: p.name || p, premium: "", commission_percentage: "", file: null })) || [])
                        }}
                        className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors flex-1 shadow-sm"
                      >
                        Cotizar
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-muted/50 text-muted-foreground border-b border-border">
                  <tr>
                    <th className="px-6 py-3 font-medium">Cliente</th>
                    <th className="px-6 py-3 font-medium">Aseguradora</th>
                    <th className="px-6 py-3 font-medium">Coberturas</th>
                    <th className="px-6 py-3 font-medium">Creador</th>
                    <th className="px-6 py-3 font-medium">Asignado a</th>
                    <th className="px-6 py-3 font-medium">Estado</th>
                    <th className="px-6 py-3 font-medium text-right">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredQuotes.map((quote) => (
                    <tr key={quote.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                      <td className="px-6 py-4 font-medium">{quote.client_name}</td>
                      <td className="px-6 py-4">{quote.carrier_id}</td>
                      <td className="px-6 py-4">{quote.coverage_requested}</td>
                      <td className="px-6 py-4 text-muted-foreground">{quote.profiles?.name}</td>
                      <td className="px-6 py-4 text-muted-foreground">{quote.assignee?.name || 'Sin asignar'}</td>
                      <td className="px-6 py-4">
                        <select 
                          value={quote.status}
                          onChange={(e) => handleStatusChange(quote, e.target.value)}
                          disabled={isUploading}
                          className={`text-xs font-semibold px-2 py-1 rounded-md border ${
                            quote.status === 'ACCEPTED' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30' :
                            quote.status === 'REJECTED' ? 'bg-red-500/10 text-red-600 border-red-500/30' :
                            quote.status === 'QUOTED' ? 'bg-blue-500/10 text-blue-600 border-blue-500/30' :
                            quote.status === 'SUBMITTED_TO_CARRIER' ? 'bg-indigo-500/10 text-indigo-600 border-indigo-500/30' :
                            'bg-amber-500/10 text-amber-600 border-amber-500/30'
                          }`}
                        >
                          <option value="PENDING_MANAGER">Pendiente Manager</option>
                          <option value="PENDING_AGENT">Pendiente Agente</option>
                          <option value="SUBMITTED_TO_CARRIER">Enviada a Carrier</option>
                          <option value="QUOTED">Cotizado</option>
                          <option value="REJECTED">Rechazada</option>
                          <option value="ACCEPTED">Aceptada</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 text-right flex justify-end space-x-2">
                        <button 
                          onClick={() => setDetailsQuote(quote)}
                          title="Ver Detalles"
                          className="p-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        
                        {quote.status !== 'QUOTED' && (userProfile?.role === 'MANAGER' || userProfile?.role === 'ADMIN') && (
                          <button 
                            onClick={() => setAssignQuote(quote)}
                            title="Reasignar"
                            className="p-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80"
                          >
                            <UserPlus className="w-4 h-4" />
                          </button>
                        )}

                        {quote.status === 'QUOTED' ? (
                           <button onClick={() => setDetailsQuote(quote)} className="bg-emerald-500 text-white px-3 py-1.5 rounded-md text-xs font-medium hover:bg-emerald-600">Ver Propuestas</button>
                        ) : (
                          <button 
                            onClick={() => {
                              setProcessQuote(quote)
                              setProposals(quote.products?.map((p: any) => ({ product: p.name || p, premium: "", commission_percentage: "", file: null })) || [])
                            }}
                            className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md text-sm font-medium transition-colors"
                          >
                            Cotizar
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Details Modal */}
      {detailsQuote && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-2xl rounded-xl shadow-lg border border-border p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold">Detalles de la Solicitud</h3>
              <div className="flex items-center space-x-2">
                <button 
                  onClick={async () => {
                    const toastId = toast.loading("Generando PDF premium...");
                    try {
                      // Fetch client logo
                      const { data: client } = await supabase
                        .from('clients')
                        .select('logo_url')
                        .eq('name', detailsQuote.client_name)
                        .eq('agency_id', detailsQuote.profiles?.agency_id)
                        .maybeSingle();
                        
                      const clientLogoPath = client?.logo_url;
                      const agencyLogoPath = detailsQuote.agencies?.logo_url;
                      
                      const clientLogoUrl = clientLogoPath?.startsWith('http') ? clientLogoPath : (clientLogoPath ? supabase.storage.from('logos').getPublicUrl(clientLogoPath).data.publicUrl : null);
                      const agencyLogoUrl = agencyLogoPath?.startsWith('http') ? agencyLogoPath : (agencyLogoPath ? supabase.storage.from('logos').getPublicUrl(agencyLogoPath).data.publicUrl : null);
                      
                      // Helper to fetch image and convert to base64 for guaranteed rendering in PDF
                      const getBase64Image = async (url: string | null) => {
                        if (!url) return null;
                        try {
                          const response = await fetch(url);
                          if (!response.ok) return null;
                          const blob = await response.blob();
                          return new Promise<string>((resolve) => {
                            const reader = new FileReader();
                            reader.onloadend = () => resolve(reader.result as string);
                            reader.readAsDataURL(blob);
                          });
                        } catch (e) {
                          console.error("Error fetching logo", e);
                          return null;
                        }
                      };

                      const clientLogoBase64 = await getBase64Image(clientLogoUrl);
                      const agencyLogoBase64 = await getBase64Image(agencyLogoUrl);

                      const { pdf } = await import('@react-pdf/renderer');
                      const { QuoteRequestPDF } = await import('@/components/pdf/QuoteRequestPDF');
                      
                      const blob = await pdf(<QuoteRequestPDF quote={detailsQuote} agencyLogo={agencyLogoBase64} clientLogo={clientLogoBase64} />).toBlob();
                      
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `Solicitud_${detailsQuote.client_name.replace(/\s+/g, '_')}.pdf`;
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                      URL.revokeObjectURL(url);
                      
                      toast.success("PDF descargado exitosamente", { id: toastId });
                    } catch (error) {
                      console.error(error);
                      toast.error("Error al generar el PDF", { id: toastId });
                    }
                  }}
                  className="bg-primary/10 text-primary hover:bg-primary/20 px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Descargar (PDF)
                </button>
                <button onClick={() => setDetailsQuote(null)} className="p-2 hover:bg-muted rounded-full">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div id="quote-details-content" className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground font-medium">Cliente</p>
                  <p className="font-semibold">{detailsQuote.client_name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground font-medium">Creado Por</p>
                  <p className="font-semibold">{detailsQuote.profiles?.name}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground font-medium mb-4">Formulario Entregado</p>
                <div className="space-y-6">
                  {(() => {
                    const groupedData: Record<string, any> = {};
                    Object.entries(detailsQuote.form_data || {}).forEach(([k, v]) => {
                      const prefix = k.split('_')[0];
                      const group = ['general', 'bop', 'cyber', 'eo'].includes(prefix) ? prefix : 'otros';
                      if (!groupedData[group]) groupedData[group] = {};
                      groupedData[group][k] = v;
                    });
                    
                    const groupTitles: Record<string, string> = {
                      'general': 'Información General',
                      'bop': 'BOP (Business Owner Policy)',
                      'cyber': 'Cyber Liability',
                      'eo': 'Errors & Omissions (E&O)',
                      'otros': 'Otros Detalles'
                    };

                    return Object.entries(groupedData).map(([groupName, groupFields]) => (
                      <div key={groupName} className="bg-muted/10 p-4 md:p-5 rounded-xl border border-border">
                        <h4 className="text-sm font-bold text-foreground mb-4 uppercase tracking-wider border-b border-border/50 pb-2">
                          {groupTitles[groupName] || groupName}
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {Object.entries(groupFields).map(([k, v]) => {
                            let parsedV: any = v;
                            if (typeof v === 'string' && (v.trim().startsWith('[') || v.trim().startsWith('{'))) {
                              try { parsedV = JSON.parse(v); } catch(e) {}
                            }
                            
                            const isArray = Array.isArray(parsedV);
                            const isArrayOfObjects = isArray && (parsedV as any[]).length > 0 && typeof (parsedV as any[])[0] === 'object' && (parsedV as any[])[0] !== null;
                            const isSimpleArray = isArray && !isArrayOfObjects;
                            const isObject = typeof parsedV === 'object' && parsedV !== null && !isArray;
                            
                            // Remove the group prefix from the key for display, e.g. "general_client_name" -> "client name"
                            const displayKey = k.startsWith(groupName + '_') ? k.substring(groupName.length + 1) : k;

                            return (
                            <div key={k} className={`flex flex-col ${isArrayOfObjects || isObject || isSimpleArray ? 'md:col-span-2' : ''}`}>
                              <span className="font-medium capitalize text-xs text-muted-foreground mb-1">{displayKey.replace(/_/g, " ")}:</span> 
                              
                              {isArrayOfObjects ? (
                                <div className="mt-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                                  {(parsedV as any[]).map((item, idx) => (
                                    <div key={idx} className="bg-background rounded-md p-3 text-xs border border-border space-y-1">
                                      {typeof item === 'object' && item !== null ? Object.entries(item).map(([subK, subV]) => {
                                        const subIsFile = typeof subV === 'string' && subV.includes('/') && (subV.endsWith('.pdf') || subV.endsWith('.png') || subV.endsWith('.jpg') || subV.endsWith('.jpeg'));
                                        const subFileUrl = subIsFile ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/quote-attachments/${subV}` : null;
                                        return (
                                        <div key={subK} className="flex justify-between border-b border-border/50 last:border-0 pb-1 last:pb-0">
                                          <span className="font-medium text-muted-foreground capitalize">{subK.replace(/_/g, " ")}:</span> 
                                          {subFileUrl ? (
                                            <a href={subFileUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium flex items-center">
                                              Ver Documento
                                            </a>
                                          ) : (
                                            <span className="font-medium">{String(subV)}</span>
                                          )}
                                        </div>
                                      )}) : <span className="font-medium">{String(item)}</span>}
                                    </div>
                                  ))}
                                </div>
                              ) : isObject ? (
                                <div className="mt-1 bg-background rounded-md p-3 text-xs border border-border space-y-1">
                                  {Object.entries(parsedV).map(([subK, subV]) => {
                                    const subIsFile = typeof subV === 'string' && subV.includes('/') && (subV.endsWith('.pdf') || subV.endsWith('.png') || subV.endsWith('.jpg') || subV.endsWith('.jpeg'));
                                    const subFileUrl = subIsFile ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/quote-attachments/${subV}` : null;
                                    return (
                                    <div key={subK} className="flex justify-between border-b border-border/50 last:border-0 pb-1 last:pb-0">
                                      <span className="font-medium text-muted-foreground capitalize">{subK.replace(/_/g, " ")}:</span> 
                                      {subFileUrl ? (
                                        <a href={subFileUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium flex items-center">
                                          Ver Documento
                                        </a>
                                      ) : (
                                        <span className="font-medium">{String(subV)}</span>
                                      )}
                                    </div>
                                  )})}
                                </div>
                              ) : isSimpleArray ? (
                                <div className="mt-1 flex flex-wrap gap-2">
                                  {(parsedV as any[]).map((item, idx) => (
                                    <span key={idx} className="bg-primary/10 text-primary px-2 py-1 rounded-md text-xs font-medium">
                                      {String(item)}
                                    </span>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-sm font-medium text-foreground">
                                   {typeof parsedV === 'string' && parsedV.includes('/') && !parsedV.includes(' ') ? (
                                     <a href={supabase.storage.from('quote-attachments').getPublicUrl(parsedV).data.publicUrl} target="_blank" rel="noreferrer" className="text-primary hover:underline inline-flex items-center bg-primary/10 px-2 py-1 rounded-md">
                                       <FileText className="w-4 h-4 mr-1"/> Abrir adjunto
                                     </a>
                                   ) : String(parsedV)}
                                </span>
                              )}
                            </div>
                          )})}
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              </div>

              {detailsQuote.quotes_provided && detailsQuote.quotes_provided.length > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground font-medium mb-2">Propuestas de Cotización</p>
                  <div className="space-y-2">
                    {detailsQuote.quotes_provided.map((q: any, i: number) => (
                      <div key={i} className="flex justify-between items-center p-3 border border-border rounded-lg bg-emerald-500/5">
                        <div className="flex items-center space-x-3">
                           <FileText className="w-5 h-5 text-emerald-500" />
                           <span className="font-medium">{q.product}</span>
                        </div>
                        <div className="flex items-center space-x-4 text-right">
                           <div>
                             <div className="font-bold text-emerald-600">${q.premium}</div>
                             {userProfile?.role !== 'AGENT' && (
                               <div className="text-xs text-muted-foreground font-medium">Comisión: {q.commission_percentage}%</div>
                             )}
                           </div>
                           <a href={q.file_url} target="_blank" rel="noreferrer" className="text-sm bg-primary/10 text-primary px-3 py-1.5 rounded-md font-medium hover:bg-primary/20">
                             Descargar
                           </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Assign Modal */}
      {acceptQuote && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-sm rounded-xl shadow-lg border border-border p-6">
            <h3 className="text-xl font-bold mb-4">Aceptar Cotización</h3>
            <p className="text-sm text-muted-foreground mb-4">Ingresa la información final para cerrar esta solicitud.</p>
            <form onSubmit={handleAcceptSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Prima Vendida ($)</label>
                <input 
                  type="number" 
                  required
                  step="0.01"
                  value={soldPremium}
                  onChange={(e) => setSoldPremium(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">% de Comisión</label>
                <input 
                  type="number" 
                  required
                  step="0.01"
                  value={commissionPercentage}
                  onChange={(e) => setCommissionPercentage(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setAcceptQuote(null)} className="px-4 py-2 text-sm font-medium hover:bg-muted rounded-md" disabled={isUploading}>
                  Cancelar
                </button>
                <button type="submit" disabled={isUploading} className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:bg-primary/90 disabled:opacity-50">
                  {isUploading ? "Guardando..." : "Aceptar Cotización"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Modal */}
      {assignQuote && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-md rounded-xl shadow-lg border border-border p-6">
            <h3 className="text-xl font-bold mb-4">Reasignar Solicitud</h3>
            <p className="text-sm text-muted-foreground mb-4">Asigna esta cotización a otro miembro de tu agencia.</p>
            <form onSubmit={handleAssign}>
              <div className="mb-6">
                <label className="text-sm font-medium mb-2 block">Miembro</label>
                <select name="assignee" className="w-full h-10 rounded-md border border-input bg-background px-3" required defaultValue={assignQuote.assigned_to || ""}>
                  <option value="" disabled>Selecciona a alguien...</option>
                  {agencyMembers.map(m => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end space-x-2">
                <button type="button" onClick={() => setAssignQuote(null)} className="px-4 py-2 border rounded-md text-sm">Cancelar</button>
                <button type="submit" disabled={isUploading} className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium disabled:opacity-50">
                  {isUploading ? "Asignando..." : "Asignar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Process Modal */}
      {processQuote && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-3xl rounded-xl shadow-lg border border-border p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold">Enviar Cotizaciones</h3>
              <button onClick={() => setProcessQuote(null)} className="p-2 hover:bg-muted rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-6">
              {proposals.map((prop, idx) => (
                <div key={idx} className="flex flex-col md:flex-row gap-4 items-end p-4 border border-border rounded-lg bg-muted/10">
                  <div className="flex-1 w-full">
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Producto / Cobertura</label>
                    <input 
                      type="text" 
                      value={prop.product} 
                      onChange={e => {
                        const next = [...proposals]
                        next[idx].product = e.target.value
                        setProposals(next)
                      }}
                      className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                      placeholder="Ej. Auto Comercial"
                    />
                  </div>
                  <div className="w-full md:w-32">
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Prima ($)</label>
                    <input 
                      type="number" 
                      value={prop.premium} 
                      onChange={e => {
                        const next = [...proposals]
                        next[idx].premium = e.target.value
                        setProposals(next)
                      }}
                      className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                      placeholder="0.00"
                    />
                  </div>
                  <div className="w-full md:w-28">
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">% Comisión</label>
                    <input 
                      type="number" 
                      value={prop.commission_percentage} 
                      onChange={e => {
                        const next = [...proposals]
                        next[idx].commission_percentage = e.target.value
                        setProposals(next)
                      }}
                      className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                      placeholder="0.00"
                    />
                  </div>
                  <div className="flex-1 w-full">
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">PDF de Cotización</label>
                    <input 
                      type="file"
                      accept=".pdf,application/pdf"
                      onChange={e => {
                        const next = [...proposals]
                        next[idx].file = e.target.files ? e.target.files[0] : null
                        setProposals(next)
                      }}
                      className="w-full text-sm file:mr-2 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                    />
                  </div>
                  <button 
                    onClick={() => setProposals(proposals.filter((_, i) => i !== idx))}
                    className="h-9 px-3 border border-red-500/20 text-red-500 rounded-md hover:bg-red-500/10"
                    title="Eliminar"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              
              <button 
                onClick={() => setProposals([...proposals, { product: "", premium: "", commission_percentage: "", file: null }])}
                className="flex items-center justify-center w-full py-3 border-2 border-dashed border-border rounded-lg text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                Agregar otra propuesta
              </button>

            </div>

            <div className="mt-8 flex justify-end space-x-3">
              <button onClick={() => setProcessQuote(null)} className="px-5 py-2 border border-border rounded-md font-medium">Cancelar</button>
              <button 
                onClick={handleProcessSubmit}
                disabled={isUploading}
                className="px-5 py-2 bg-primary text-primary-foreground rounded-md font-medium flex items-center disabled:opacity-50"
              >
                {isUploading ? "Guardando y Subiendo..." : (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Enviar a Agente
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
