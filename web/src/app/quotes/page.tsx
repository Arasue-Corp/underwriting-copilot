"use client"

import { useState, useEffect } from "react"
import { CheckCircle2, Eye, FileText, UserPlus, X, Plus, Upload, Check, Pencil, ArrowRightLeft, Copy, History } from "lucide-react"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { processMultipleQuotes, assignQuoteRequest, updateQuoteStatus, transferQuoteOwnership, duplicateQuoteRequest } from "@/app/actions/quote"
import { QuoteModal } from "@/components/appetite/QuoteModal"
import { EditQuoteRequestModal } from "@/components/quotes/EditQuoteRequestModal"
import { ActivityLogsModal } from '@/components/logs/ActivityLogsModal'
import { useLanguage } from "@/components/language-provider"

export default function QuotesPage() {
  const [quotes, setQuotes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [agencyMembers, setAgencyMembers] = useState<any[]>([])
  const lang = useLanguage()

  const t = {
    es: {
      successAssigned: "Solicitud reasignada",
      errorAssigned: "Error al asignar",
      addProposal: "Agrega al menos una propuesta",
      completeCarrier: "Completa Aseguradora y % de comisión para todas las propuestas",
      selectPayment: "Debes seleccionar al menos una opción de pago (Anual o Mensual) para productos principales",
      enterTotalPremium: "Ingresa la Prima Total para la opción de Pago Anual",
      enterMonthlyPayment: "Ingresa el Pago Mensual para la opción de Pago Mensual",
      uploadErrorPDF: "Error al subir el archivo PDF: ",
      successProcessed: "Cotización procesada exitosamente",
      dbError: "Error al guardar en base de datos",
      processError: "Ocurrió un error al procesar",
      statusError: "Error al actualizar estatus",
      uploadingDoc: "Subiendo documento...",
      docSuccess: "Documento subido correctamente",
      docError: "Error al subir documento",
      inbox: "Bandeja de Solicitudes",
      all: "Todas",
      assignedToMe: "Asignadas a mí",
      createdByMe: "Creadas por mí",
      newQuote: "Nueva Cotización",
      loadingQuotes: "Cargando solicitudes...",
      noQuotes: "No hay solicitudes para mostrar.",
      statusMap: {
        PENDING_MANAGER: "Pendiente Manager",
        PENDING_AGENT: "Pendiente Agente",
        SUBMITTED_TO_CARRIER: "Enviada a Carrier",
        QUOTED: "Cotizado",
        REJECTED: "Rechazada",
        ACCEPTED: "Aceptada"
      },
      creator: "CREADOR",
      assignee: "ASIGNADO A",
      unassigned: "Sin asignar",
      carrier: "Aseguradora",
      coverage: "Cobertura",
      detailsTitle: "Detalles de la Solicitud",
      reassignTitle: "Reasignar",
      viewProposals: "Ver Propuestas",
      editQuote: "Editar Cotización",
      quote: "Cotizar",
      client: "Cliente",
      status: "Estado",
      action: "Acción",
      downloadPDF: "Descargar (PDF)",
      createdBy: "Creado Por",
      submittedForm: "Formulario Entregado",
      quoteProposals: "Propuestas de Cotización",
      commission: "Comisión",
      download: "Descargar",
      supportDocs: "Documentos de Respaldo",
      uploading: "Subiendo...",
      uploadDoc: "+ Subir Documento",
      noDocs: "No hay documentos de respaldo adjuntos a esta solicitud.",
      viewFile: "Ver Archivo",
      acceptQuote: "Aceptar Cotización",
      acceptQuoteDesc: "Ingresa la información final para cerrar esta solicitud.",
      soldPremium: "Prima Vendida ($)",
      commissionPercentage: "% de Comisión",
      commissionInternal: "% Comisión (Interno)",
      cancel: "Cancelar",
      saving: "Guardando...",
      reassignDesc: "Asigna esta cotización a otro miembro de tu agencia.",
      member: "Miembro",
      select: "Seleccionar...",
      assign: "Asignar",
      sendQuotes: "Enviar Cotizaciones",
      productCoverage: "Producto / Cobertura",
      selectCarrier: "Seleccionar Aseguradora...",
      bundleQuote: "Cotización en Conjunto (Bundle)",
      bundleDesc: "Agrupa el precio de este producto con el paquete principal",
      paymentOptions: "Opciones de Pago",
      annualPayment: "Pago Anual",
      monthlyPayment: "Pago Mensual",
      totalPremium: "Prima Total ($)",
      downpayment: "Enganche ($)",
      includedInBundle: "El precio de este producto está incluido en el paquete principal.",
      coveragesLimits: "Coberturas / Límites (Separadas por el símbolo |)",
      includes: "Qué INCLUYE (Separado por |)",
      excludes: "Qué EXCLUYE (Separado por |)",
      uwNotes: "Notas de Underwriting / Condiciones",
      quotePDF: "PDF de Cotización (Opcional - Interno)",
      addAnotherProposal: "Agregar otra propuesta",
      savingUploading: "Guardando y Subiendo...",
      sendToAgent: "Enviar a Agente",
      generatingPDF: "Generando PDF premium...",
      pdfSuccess: "PDF descargado exitosamente",
      pdfError: "Error al generar el PDF",
      openAttachment: "{t[language].openAttachment || (language === 'es' ? 'Abrir adjunto' : 'Open Attachment')}"
    },
    en: {
      successAssigned: "Request reassigned",
      errorAssigned: "Error assigning",
      addProposal: "Add at least one proposal",
      completeCarrier: "Complete Carrier and Commission % for all proposals",
      selectPayment: "You must select at least one payment option (Annual or Monthly) for main products",
      enterTotalPremium: "Enter the Total Premium for Annual Payment option",
      enterMonthlyPayment: "Enter the Monthly Payment for Monthly Payment option",
      uploadErrorPDF: "Error uploading PDF file: ",
      successProcessed: "Quote processed successfully",
      dbError: "Error saving to database",
      processError: "An error occurred while processing",
      statusError: "Error updating status",
      uploadingDoc: "Uploading document...",
      docSuccess: "Document uploaded successfully",
      docError: "Error uploading document",
      inbox: "Requests Inbox",
      all: "All",
      assignedToMe: "Assigned to me",
      createdByMe: "Created by me",
      newQuote: "New Quote",
      loadingQuotes: "Loading requests...",
      noQuotes: "No requests to display.",
      statusMap: {
        PENDING_MANAGER: "Pending Manager",
        PENDING_AGENT: "Pending Agent",
        SUBMITTED_TO_CARRIER: "Submitted to Carrier",
        QUOTED: "Quoted",
        REJECTED: "Rejected",
        ACCEPTED: "Accepted"
      },
      creator: "CREATOR",
      assignee: "ASSIGNED TO",
      unassigned: "Unassigned",
      carrier: "Carrier",
      coverage: "Coverage",
      detailsTitle: "Request Details",
      reassignTitle: "Reassign",
      viewProposals: "View Proposals",
      editQuote: "Edit Quote",
      quote: "Quote",
      client: "Client",
      status: "Status",
      action: "Action",
      downloadPDF: "Download (PDF)",
      createdBy: "Created By",
      submittedForm: "Submitted Form",
      quoteProposals: "Quote Proposals",
      commission: "Commission",
      download: "Download",
      supportDocs: "Supporting Documents",
      uploading: "Uploading...",
      uploadDoc: "+ Upload Document",
      noDocs: "No supporting documents attached to this request.",
      viewFile: "View File",
      acceptQuote: "Accept Quote",
      acceptQuoteDesc: "Enter final information to close this request.",
      soldPremium: "Sold Premium ($)",
      commissionPercentage: "Commission %",
      commissionInternal: "Commission % (Internal)",
      cancel: "Cancel",
      saving: "Saving...",
      reassignDesc: "Assign this quote to another member of your agency.",
      member: "Member",
      select: "Select...",
      assign: "Assign",
      sendQuotes: "Send Quotes",
      productCoverage: "Product / Coverage",
      selectCarrier: "Select Carrier...",
      bundleQuote: "Bundle Quote",
      bundleDesc: "Groups the price of this product with the main package",
      paymentOptions: "Payment Options",
      annualPayment: "Annual Payment",
      monthlyPayment: "Monthly Payment",
      totalPremium: "Total Premium ($)",
      downpayment: "Downpayment ($)",
      includedInBundle: "The price of this product is included in the main package.",
      coveragesLimits: "Coverages / Limits (Separated by |)",
      includes: "What's INCLUDED (Separated by |)",
      excludes: "What's EXCLUDED (Separated by |)",
      uwNotes: "Underwriting Notes / Conditions",
      quotePDF: "Quote PDF (Optional - Internal)",
      addAnotherProposal: "Add another proposal",
      savingUploading: "Saving and Uploading...",
      sendToAgent: "Send to Agent",
      generatingPDF: "Generating premium PDF...",
      pdfSuccess: "PDF downloaded successfully",
      pdfError: "Error generating PDF"
    }
  }[lang]

  
  // Modals state
  const [isNewQuoteModalOpen, setIsNewQuoteModalOpen] = useState(false)
  const [detailsQuote, setDetailsQuote] = useState<any>(null)
  const [isUploadingDoc, setIsUploadingDoc] = useState(false)
  const [processQuote, setProcessQuote] = useState<any>(null)
  const [assignQuote, setAssignQuote] = useState<any>(null)
  const [transferOwnerQuote, setTransferOwnerQuote] = useState<any>(null)
  const [editQuoteRequest, setEditQuoteRequest] = useState<any>(null)
  const [acceptQuote, setAcceptQuote] = useState<any>(null)
  const [selectedAcceptQuotes, setSelectedAcceptQuotes] = useState<boolean[]>([])
  
  const [logsQuote, setLogsQuote] = useState<any>(null)
  
  // Process State
  const [proposals, setProposals] = useState<{product: string, carrier: string, premium: string, commission_percentage: string, agent_commission_percentage: string, monthly_payment: string, downpayment: string, payment_options: string, coverages: string, included: string, excluded: string, notes: string, description: string, file: File | null, file_url?: string, is_annual?: boolean, is_monthly?: boolean, is_bundled?: boolean}[]>([])
  const [availableCarriers, setAvailableCarriers] = useState<string[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [jsonImportText, setJsonImportText] = useState("")
  const [jsonImportIndex, setJsonImportIndex] = useState<number | null>(null)
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

    if (profile && (profile.role === 'MANAGER' || profile.(role === 'ADMIN' || role === 'DEMO'))) {
      const { data: members } = await supabase
        .from("profiles")
        .select("id, name")
        .eq("agency_id", profile.agency_id)
      if (members) setAgencyMembers(members)
    }

    const { data } = await supabase
      .from("quote_requests")
      .select(`*, profiles!agent_id(name, agency_id), assignee:profiles!assigned_to(name), agencies(name, logo_url), quote_documents(id, file_name, file_url, created_at)`)
      .order("created_at", { ascending: false })
      
    const { data: carriersData } = await supabase.from('carriers').select('name').order('name')
    if (carriersData) {
      setAvailableCarriers(Array.from(new Set(carriersData.map(c => c.name))).sort())
    }
    if (data) {
      setQuotes(data.filter((q: any) => !['REJECTED'].includes(q.status)))
    }
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleAssign = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const assigneeId = formData.get("assignee") as string
    
    if (assignQuote && assigneeId) {
      setIsUploading(true)
      try {
        const res = await assignQuoteRequest(assignQuote.id, assigneeId)
        if (res.success) {
          toast.success(lang === 'es' ? "Asignado exitosamente" : "Assigned successfully")
          setAssignQuote(null)
          loadData()
        } else {
          toast.error(res.error || "Error")
        }
      } catch (e: any) {
        toast.error(e.message)
      } finally {
        setIsUploading(false)
      }
    }
  }

  const handleTransferOwnership = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const newOwnerId = formData.get("new_owner") as string
    
    if (transferOwnerQuote && newOwnerId) {
      setIsUploading(true)
      try {
        const res = await transferQuoteOwnership(transferOwnerQuote.id, newOwnerId)
        if (res.success) {
          toast.success(lang === 'es' ? "Propiedad transferida exitosamente" : "Ownership transferred successfully")
          setTransferOwnerQuote(null)
          loadData()
        } else {
          toast.error(res.error || "Error")
        }
      } catch (e: any) {
        toast.error(e.message)
      } finally {
        setIsUploading(false)
      }
    }
  }

  const handleDuplicate = async (quoteId: string) => {
    setIsUploading(true)
    try {
      const res = await duplicateQuoteRequest(quoteId)
      if (res.success) {
        toast.success(lang === 'es' ? "Cotización duplicada exitosamente" : "Quote duplicated successfully")
        loadData()
      } else {
        toast.error(res.error || "Error")
      }
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setIsUploading(false)
    }
  }

  const handleJsonImport = () => {
    try {
      const parsed = JSON.parse(jsonImportText)
      const dataArray = Array.isArray(parsed) ? parsed : [parsed]
      
      const newProposals = dataArray.map((p: any) => ({
        product: p.product || "N/A",
        carrier: p.carrier || "",
        premium: p.premium || "",
        commission_percentage: p.commission_percentage || "",
        agent_commission_percentage: p.agent_commission_percentage || "",
        monthly_payment: p.monthly_payment || "",
        downpayment: p.downpayment || "",
        payment_options: p.payment_options || "",
        coverages: p.coverages || "",
        included: p.included || "",
        excluded: p.excluded || "",
        notes: p.notes || "",
        description: p.description || "",
        file: null,
        is_annual: p.is_annual ?? true,
        is_monthly: p.is_monthly ?? false,
        is_bundled: p.is_bundled ?? false
      }))

      if (jsonImportIndex !== null && jsonImportIndex >= 0 && jsonImportIndex < proposals.length) {
         const next = [...proposals]
         next[jsonImportIndex] = {
           ...next[jsonImportIndex],
           ...newProposals[0],
           product: newProposals[0].product !== "N/A" ? newProposals[0].product : next[jsonImportIndex].product,
           carrier: newProposals[0].carrier ? newProposals[0].carrier : next[jsonImportIndex].carrier,
         }
         if (newProposals.length > 1) {
           next.push(...newProposals.slice(1))
         }
         setProposals(next)
      } else {
         setProposals([...proposals, ...newProposals])
      }
      
      setJsonImportIndex(null)
      setJsonImportText("")
      toast.success(lang === 'es' ? "JSON importado correctamente" : "JSON imported successfully")
    } catch (e) {
      toast.error(lang === 'es' ? "JSON inválido. Revisa la sintaxis." : "Invalid JSON. Check syntax.")
    }
  }

  const handleProcessSubmit = async () => {
    if (proposals.length === 0) return toast.error("Agrega al menos una propuesta")
    for (const p of proposals) {
      if (!p.carrier || (!p.commission_percentage && userProfile?.role !== 'AGENT')) return toast.error(userProfile?.role === 'AGENT' ? "Completa Aseguradora para todas las propuestas" : "Completa Aseguradora y % de comisión para todas las propuestas")
      if (!p.is_bundled) {
        if (!p.is_annual && !p.is_monthly) return toast.error("Debes seleccionar al menos una opción de pago (Anual o Mensual) para productos principales")
        if (p.is_annual && !p.premium) return toast.error("Ingresa la Prima Total para la opción de {t.annualPayment}")
        if (p.is_monthly && !p.monthly_payment) return toast.error("Ingresa el {t.monthlyPayment} para la opción de {t.monthlyPayment}")
      }
    }
    
    setIsUploading(true)
    
    try {
      const uploadedProposals = []
      for (const p of proposals) {
        let fileUrl = p.file_url
        if (p.file) {
          const fileExt = p.file.name.split('.').pop()
          const fileName = `${processQuote.id}-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
          const filePath = `policies/${fileName}`

          const { error: uploadError } = await supabase.storage
            .from('quotes-bucket')
            .upload(filePath, p.file)

          if (uploadError) throw new Error("Error al subir el archivo PDF: " + p.file.name)

          const { data: publicUrlData } = supabase.storage
            .from('quotes-bucket')
            .getPublicUrl(filePath)
            
          fileUrl = publicUrlData.publicUrl
        }

        uploadedProposals.push({
          product: p.product,
          carrier: p.carrier,
          premium: parseFloat(p.premium),
          commission_percentage: p.commission_percentage ? parseFloat(p.commission_percentage) : 0,
          agent_commission_percentage: p.agent_commission_percentage ? parseFloat(p.agent_commission_percentage) : undefined,
          monthly_payment: p.monthly_payment && !p.is_bundled ? parseFloat(p.monthly_payment) : undefined,
          downpayment: p.downpayment && !p.is_bundled ? parseFloat(p.downpayment) : undefined,
          payment_options: p.is_bundled ? "Incluido en Paquete Principal" : p.payment_options,
          is_bundled: p.is_bundled,
          coverages: p.coverages,
          included: p.included,
          excluded: p.excluded,
          notes: p.notes,
          description: p.description,
          file_url: fileUrl
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
      setSelectedAcceptQuotes(new Array(quote.quotes_provided?.length || 0).fill(false))
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
      commissionPercentage ? parseFloat(commissionPercentage) : undefined,
      selectedAcceptQuotes
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

  const handleUploadDocument = async (e: React.ChangeEvent<HTMLInputElement>, quoteId: string) => {
    if (!e.target.files || e.target.files.length === 0) return
    const file = e.target.files[0]
    setIsUploadingDoc(true)
    const toastId = toast.loading("Subiendo documento...")

    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${quoteId}/${Math.random()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('quote-attachments')
        .upload(fileName, file)

      if (uploadError) throw uploadError

      const { data: publicUrlData } = supabase.storage
        .from('quote-attachments')
        .getPublicUrl(fileName)

      const { error: dbError } = await supabase
        .from('quote_documents')
        .insert({
          quote_id: quoteId,
          file_name: file.name,
          file_url: publicUrlData.publicUrl,
          uploaded_by: userProfile?.id
        })

      if (dbError) throw dbError
      
      toast.success("Documento subido correctamente", { id: toastId })
      
      const newDoc = {
        id: Math.random().toString(),
        file_name: file.name,
        file_url: publicUrlData.publicUrl,
        created_at: new Date().toISOString()
      }
      setDetailsQuote((prev: any) => prev ? {...prev, quote_documents: [...(prev.quote_documents || []), newDoc]} : null)
      loadData()
    } catch (error: any) {
      toast.error(error.message || "Error al subir documento", { id: toastId })
    } finally {
      setIsUploadingDoc(false)
      e.target.value = ''
    }
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
        <h2 className="text-3xl font-bold tracking-tight">{t.inbox}</h2>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setFilter('ALL')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'ALL' ? 'bg-primary text-primary-foreground shadow-sm' : 'bg-muted hover:bg-muted/80'}`}>{t.all}</button>
            <button onClick={() => setFilter('ASSIGNED_TO_ME')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'ASSIGNED_TO_ME' ? 'bg-primary text-primary-foreground shadow-sm' : 'bg-muted hover:bg-muted/80'}`}>{t.assignedToMe}</button>
            <button onClick={() => setFilter('CREATED_BY_ME')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'CREATED_BY_ME' ? 'bg-primary text-primary-foreground shadow-sm' : 'bg-muted hover:bg-muted/80'}`}>{t.createdByMe}</button>
          </div>
          
          <button 
            onClick={() => setIsNewQuoteModalOpen(true)}
            className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            {t.newQuote}
          </button>
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
                        <option value="PENDING_MANAGER">{t.statusMap.PENDING_MANAGER}</option>
                        <option value="PENDING_AGENT">{t.statusMap.PENDING_AGENT}</option>
                        <option value="SUBMITTED_TO_CARRIER">{t.statusMap.SUBMITTED_TO_CARRIER}</option>
                        <option value="QUOTED">{t.statusMap.QUOTED}</option>
                        <option value="REJECTED">{t.statusMap.REJECTED}</option>
                        <option value="ACCEPTED">{t.statusMap.ACCEPTED}</option>
                      </select>
                      <h4 className="font-bold text-lg leading-tight text-foreground">{quote.client_name}</h4>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pl-2">
                    <div className="space-y-1">
                      <div className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">{t.carrier}</div>
                      <div className="text-sm font-medium text-foreground">{quote.carrier_id}</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">{t.coverage}</div>
                      <div className="text-sm font-medium text-foreground">{quote.coverage_requested}</div>
                    </div>
                  </div>

                  <div className="bg-muted/30 rounded-lg p-3 grid grid-cols-2 gap-2 text-xs border border-border/50 ml-2">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-muted-foreground font-medium">{t.creator}</span> 
                      <span className="font-medium text-foreground truncate">{quote.profiles?.name}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] text-muted-foreground font-medium">{t.assignee}</span> 
                      <span className="font-medium text-foreground truncate">{quote.assignee?.name || t.unassigned}</span>
                    </div>
                  </div>

                  <div className="pt-2 pl-2 flex gap-2">
                    {userProfile?.(role === 'ADMIN' || role === 'DEMO') && (
                      <button 
                        onClick={() => setLogsQuote(quote)}
                        title="Ver registro de actividad"
                        className="p-2.5 bg-secondary/50 text-secondary-foreground rounded-lg hover:bg-secondary transition-colors"
                      >
                        <History className="w-5 h-5" />
                      </button>
                    )}
                    <button 
                      onClick={() => setDetailsQuote(quote)}
                      title={t.detailsTitle}
                      className="p-2.5 bg-secondary/50 text-secondary-foreground rounded-lg hover:bg-secondary transition-colors"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                    
                    {quote.status !== 'QUOTED' && (userProfile?.role === 'MANAGER' || userProfile?.(role === 'ADMIN' || role === 'DEMO')) && (
                      <button 
                        onClick={() => setAssignQuote(quote)}
                        title={t.reassignTitle}
                        className="p-2.5 bg-secondary/50 text-secondary-foreground rounded-lg hover:bg-secondary transition-colors"
                      >
                        <UserPlus className="w-5 h-5" />
                      </button>
                    )}

                    {quote.status === 'QUOTED' ? (
                       <div className="flex gap-2 w-full">
                         <button onClick={() => setDetailsQuote(quote)} className="bg-emerald-500 text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-emerald-600 flex-1 transition-colors shadow-sm">{t.viewProposals}</button>
                         <button 
                           onClick={() => {
                             setProcessQuote(quote)
                             const existing = Array.isArray(quote.quotes_provided) ? quote.quotes_provided : []
                             setProposals(existing.length > 0 ? existing.map((e: any) => ({...e, file: null, is_annual: !!e.premium, is_monthly: !!e.monthly_payment})) : quote.products?.map((p: any) => ({ product: p.name || p, carrier: quote.carrier_id || "", premium: "", commission_percentage: "", agent_commission_percentage: "", monthly_payment: "", downpayment: "", payment_options: "{t.annualPayment}", coverages: "", included: "", excluded: "", notes: "", description: "", file: null, is_annual: true, is_monthly: false, is_bundled: false })) || [])
                           }}
                           title={t.editQuote}
                           className="p-2.5 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors shadow-sm"
                         >
                           <Pencil className="w-5 h-5" />
                         </button>
                       </div>
                    ) : (
                      <button 
                        onClick={() => {
                          setProcessQuote(quote)
                          setProposals(quote.products?.map((p: any) => ({ product: p.name || p, carrier: quote.carrier_id || "", premium: "", commission_percentage: "", agent_commission_percentage: "", monthly_payment: "", downpayment: "", payment_options: "{t.annualPayment}", coverages: "", included: "", excluded: "", notes: "", description: "", file: null, is_annual: true, is_monthly: false, is_bundled: false })) || [])
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
                    <th className="px-6 py-3 font-medium">{t.client}</th>
                    <th className="px-6 py-3 font-medium">{t.carrier}</th>
                    <th className="px-6 py-3 font-medium">Coberturas</th>
                    <th className="px-6 py-3 font-medium">Creador</th>
                    <th className="px-6 py-3 font-medium">Asignado a</th>
                    <th className="px-6 py-3 font-medium">{t.status}</th>
                    <th className="px-6 py-3 font-medium text-right">{t.action}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredQuotes.map((quote) => (
                    <tr key={quote.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                      <td className="px-6 py-4 font-medium">{quote.client_name}</td>
                      <td className="px-6 py-4">
                        {Array.isArray(quote.quotes_provided) && quote.quotes_provided.length > 0 
                          ? Array.from(new Set(quote.quotes_provided.map((p: any) => p.carrier).filter(Boolean))).join(', ') 
                          : (quote.carrier_id || '-')}
                      </td>
                      <td className="px-6 py-4">{quote.coverage_requested}</td>
                      <td className="px-6 py-4 text-muted-foreground">{quote.profiles?.name}</td>
                      <td className="px-6 py-4 text-muted-foreground">{quote.assignee?.name || t.unassigned}</td>
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
                          <option value="PENDING_MANAGER">{t.statusMap.PENDING_MANAGER}</option>
                          <option value="PENDING_AGENT">{t.statusMap.PENDING_AGENT}</option>
                          <option value="SUBMITTED_TO_CARRIER">{t.statusMap.SUBMITTED_TO_CARRIER}</option>
                          <option value="QUOTED">{t.statusMap.QUOTED}</option>
                          <option value="REJECTED">{t.statusMap.REJECTED}</option>
                          <option value="ACCEPTED">{t.statusMap.ACCEPTED}</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 text-right flex justify-end space-x-2">
                        {userProfile?.(role === 'ADMIN' || role === 'DEMO') && (
                          <button 
                            onClick={() => setLogsQuote(quote)}
                            title="Ver registro de actividad"
                            className="p-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80"
                          >
                            <History className="w-4 h-4" />
                          </button>
                        )}
                        <button 
                          onClick={() => setDetailsQuote(quote)}
                          title={t.detailsTitle}
                          className="p-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        
                        {quote.status !== 'QUOTED' && (userProfile?.role === 'MANAGER' || userProfile?.(role === 'ADMIN' || role === 'DEMO')) && (
                          <div className="inline-flex space-x-2">
                            <button 
                              onClick={() => setAssignQuote(quote)}
                              title={lang === 'es' ? 'Asignar para Procesar (Ayuda)' : 'Assign for Processing'}
                              className="p-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80"
                            >
                              <UserPlus className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => setTransferOwnerQuote(quote)}
                              title={lang === 'es' ? 'Ceder Propiedad' : 'Transfer Ownership'}
                              className="p-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80"
                            >
                              <ArrowRightLeft className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                        {(quote.agent_id === userProfile?.id || userProfile?.role === 'MANAGER' || userProfile?.(role === 'ADMIN' || role === 'DEMO')) && (
                          <div className="inline-flex space-x-2">
                            <button 
                              onClick={() => setEditQuoteRequest(quote)}
                              title={lang === 'es' ? 'Editar Formulario' : 'Edit Form'}
                              className="p-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleDuplicate(quote.id)}
                              title={lang === 'es' ? 'Duplicar Solicitud' : 'Duplicate Request'}
                              className="p-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80"
                              disabled={isUploading}
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                          </div>
                        )}

                        {quote.status === 'QUOTED' ? (
                           <div className="flex justify-end gap-2">
                             <button onClick={() => setDetailsQuote(quote)} className="bg-emerald-500 text-white px-3 py-1.5 rounded-md text-xs font-medium hover:bg-emerald-600">{t.viewProposals}</button>
                             <button 
                               onClick={() => {
                                 setProcessQuote(quote)
                                 const existing = Array.isArray(quote.quotes_provided) ? quote.quotes_provided : []
                                 setProposals(existing.length > 0 ? existing.map((e: any) => ({...e, file: null, is_annual: !!e.premium, is_monthly: !!e.monthly_payment})) : quote.products?.map((p: any) => ({ product: p.name || p, carrier: quote.carrier_id || "", premium: "", commission_percentage: "", agent_commission_percentage: "", monthly_payment: "", downpayment: "", payment_options: "{t.annualPayment}", coverages: "", included: "", excluded: "", notes: "", description: "", file: null, is_annual: true, is_monthly: false, is_bundled: false })) || [])
                               }}
                               title={t.editQuote}
                               className="p-1.5 bg-primary/10 text-primary rounded-md hover:bg-primary/20 transition-colors shadow-sm"
                             >
                               <Pencil className="w-4 h-4" />
                             </button>
                           </div>
                        ) : (
                          (userProfile?.(role === 'ADMIN' || role === 'DEMO') || userProfile?.role === 'MANAGER' || quote.assigned_to === userProfile?.id) && (
                            <button 
                              onClick={() => {
                                setProcessQuote(quote)
                                setProposals(quote.products?.map((p: any) => ({ product: p.name || p, carrier: quote.carrier_id || "", premium: "", commission_percentage: "", agent_commission_percentage: "", monthly_payment: "", downpayment: "", payment_options: "{t.annualPayment}", coverages: "", included: "", excluded: "", notes: "", description: "", file: null, is_annual: true, is_monthly: false, is_bundled: false })) || [])
                              }}
                              className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md text-sm font-medium transition-colors"
                            >
                              Cotizar
                            </button>
                          )
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
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setDetailsQuote(null)}
        >
          <div 
            className="bg-card w-full max-w-2xl rounded-xl shadow-lg border border-border p-6 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold">{t.detailsTitle}</h3>
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
                      
                      // Fetch actual carriers from appetite matrix
                      let query = supabase.from('appetite_matrix').select('carrier_name').eq('status', 'ELIGIBLE');
                      if (detailsQuote.products && detailsQuote.products.length > 0) {
                        query = query.in('product_line', detailsQuote.products);
                      }
                      const { data: matchedCarriers } = await query.limit(100);
                      
                      let uniqueCarriers = Array.from(new Set(matchedCarriers?.map(c => c.carrier_name)));
                      if (uniqueCarriers.length === 0) {
                        const { data: anyCarriers } = await supabase.from('appetite_matrix').select('carrier_name').eq('status', 'ELIGIBLE').limit(50);
                        uniqueCarriers = Array.from(new Set(anyCarriers?.map(c => c.carrier_name)));
                      }
                      const recommendedCarriers = uniqueCarriers.slice(0, 3);
                      if (recommendedCarriers.length === 0) {
                        recommendedCarriers.push('Cornerstone Insurance', 'Alchemy Solutions');
                      }

                      // Dynamic import of PDF components
                      const { pdf } = await import('@react-pdf/renderer');
                      const { QuoteRequestPDF } = await import('@/components/pdf/QuoteRequestPDF');
                      
                      const blob = await pdf(<QuoteRequestPDF quote={detailsQuote} clientLogo={clientLogoBase64} agencyLogo={agencyLogoBase64} recommendedCarriers={recommendedCarriers} />).toBlob();
                      
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
                  {t.downloadPDF}
                </button>
                <button onClick={() => setDetailsQuote(null)} className="p-2 hover:bg-muted rounded-full">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div id="quote-details-content" className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground font-medium">{t.client}</p>
                  <p className="font-semibold">{detailsQuote.client_name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground font-medium">{t.createdBy}</p>
                  <p className="font-semibold">{detailsQuote.profiles?.name}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground font-medium mb-4">{t.submittedForm}</p>
                <div className="space-y-6">
                  {(() => {
                    const groupedData: Record<string, any> = {};
                    Object.entries(detailsQuote.form_data || {}).forEach(([k, v]) => {
                      const prefix = k.split('_')[0];
                      const knownPrefixes = ['general', 'bop', 'cyber', 'eo', 'gl', 'cp', 'ba', 'wc', 'ho', 'pa', 'rt', 'rv', 'umb', 'inm', 'bl', 'pmi'];
                      const group = knownPrefixes.includes(prefix) ? prefix : 'otros';
                      if (!groupedData[group]) groupedData[group] = {};
                      groupedData[group][k] = v;
                    });
                    
                    const groupTitles: Record<string, string> = {
                      'general': 'Información General',
                      'bop': 'BOP (Business Owner Policy)',
                      'cyber': 'Cyber Liability',
                      'eo': 'Errors & Omissions (E&O)',
                      'gl': 'General Liability (GL)',
                      'cp': 'Commercial Property',
                      'ba': 'Commercial Auto',
                      'wc': 'Workers Compensation',
                      'ho': 'Homeowners',
                      'pa': 'Personal Auto',
                      'rt': 'Renters',
                      'rv': 'Recreational Vehicles (RV)',
                      'umb': 'Umbrella',
                      'inm': 'Inland Marine',
                      'bl': 'Builders Risk',
                      'pmi': 'Pet Medical',
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
                                              {t.viewFile}
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
                                          {t.viewFile}
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
                                   {typeof parsedV === 'string' && parsedV.includes('/') && !parsedV.includes(' ') && !parsedV.match(/^\d{1,2}\/\d{1,2}\/\d{4}$/) ? (
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
                <div className="mb-6">
                  <p className="text-sm text-muted-foreground font-medium mb-2">{t.quoteProposals}</p>
                  <div className="space-y-4">
                    {Object.values(
                      detailsQuote.quotes_provided.reduce((acc: any, q: any) => {
                        const product = q.product || 'Unknown';
                        if (!acc[product]) acc[product] = [];
                        acc[product].push(q);
                        return acc;
                      }, {})
                    ).map((group: any, idx: number) => (
                      <div key={idx} className="border border-border rounded-lg bg-emerald-500/5 overflow-hidden">
                        <div className="bg-emerald-500/10 px-4 py-2 border-b border-border flex items-center space-x-2">
                           <FileText className="w-4 h-4 text-emerald-600" />
                           <span className="font-bold text-emerald-700 text-sm uppercase">{group[0].product}</span>
                        </div>
                        <div className="p-3 space-y-3">
                          {group.map((q: any, i: number) => (
                            <div key={i} className="flex justify-between items-center bg-white p-3 rounded-md border border-border/50">
                              <div className="flex flex-col">
                                {group.length > 1 && <span className="text-xs font-bold text-muted-foreground uppercase mb-1">Opción {i + 1}</span>}
                                <span className="font-semibold text-sm">{q.carrier || t.carrier}</span>
                              </div>
                              <div className="flex items-center space-x-4 text-right">
                                 <div>
                                   <div className="font-bold text-emerald-600">${q.premium}</div>
                                   {userProfile?.role !== 'AGENT' && (
                                     <div className="text-xs text-muted-foreground font-medium">{t.commission}: {q.commission_percentage}%</div>
                                   )}
                                 </div>
                                 <a href={q.file_url} target="_blank" rel="noreferrer" className="text-sm bg-primary/10 text-primary px-3 py-1.5 rounded-md font-medium hover:bg-primary/20">
                                   {t.download}
                                 </a>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-muted-foreground font-medium">{t.supportDocs}</p>
                  <label className="cursor-pointer">
                    <input 
                      type="file" 
                      className="hidden" 
                      onChange={(e) => handleUploadDocument(e, detailsQuote.id)} 
                      disabled={isUploadingDoc}
                    />
                    <span className="text-sm bg-primary/10 text-primary px-3 py-1.5 rounded-md font-medium hover:bg-primary/20 transition-colors">
                      {isUploadingDoc ? t.uploading : t.uploadDoc}
                    </span>
                  </label>
                </div>
                
                {(!detailsQuote.quote_documents || detailsQuote.quote_documents.length === 0) ? (
                  <div className="p-4 border border-dashed border-border rounded-lg text-center text-sm text-muted-foreground bg-muted/20">
                    No hay documentos de respaldo adjuntos a esta solicitud.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {detailsQuote.quote_documents.map((doc: any, i: number) => (
                      <div key={i} className="flex justify-between items-center p-3 border border-border rounded-lg hover:bg-muted/30 transition-colors">
                        <div className="flex items-center space-x-3 overflow-hidden">
                           <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
                           <span className="font-medium text-sm truncate">{doc.file_name}</span>
                        </div>
                        <a href={doc.file_url} target="_blank" rel="noreferrer" className="text-xs font-semibold text-primary hover:underline shrink-0 ml-4">
                           {t.viewFile}
                        </a>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Accept Modal */}
      {acceptQuote && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setAcceptQuote(null)}
        >
          <div 
            className="bg-card w-full max-w-md rounded-xl shadow-lg border border-border p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold mb-4">{t.acceptQuote}</h3>
            <p className="text-sm text-muted-foreground mb-4">{t.acceptQuoteDesc}</p>
            <form onSubmit={handleAcceptSubmit} className="space-y-4">

              <div className="space-y-2">
                <label className="text-sm font-medium">{lang === 'es' ? 'Opciones Aceptadas' : 'Accepted Options'}</label>
                <div className="space-y-2 max-h-40 overflow-y-auto border border-border rounded-md p-3 bg-muted/30">
                  {acceptQuote.quotes_provided?.map((opt: any, i: number) => (
                    <label key={i} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-muted p-1 rounded">
                      <input 
                        type="checkbox" 
                        checked={selectedAcceptQuotes[i] || false}
                        onChange={(e) => {
                          const newArr = [...selectedAcceptQuotes];
                          newArr[i] = e.target.checked;
                          setSelectedAcceptQuotes(newArr);
                          
                          let sumPremium = 0;
                          let commSum = 0;
                          let count = 0;
                          acceptQuote.quotes_provided?.forEach((opt: any, idx: number) => {
                            if (newArr[idx]) {
                              const prem = parseFloat(opt.premium || 0);
                              const comm = parseFloat(opt.commission_percentage || 0);
                              if (!isNaN(prem)) sumPremium += prem;
                              if (!isNaN(comm)) commSum += comm;
                              count++;
                            }
                          });
                          
                          if (count > 0) {
                            setSoldPremium(sumPremium.toString());
                            setCommissionPercentage((commSum / count).toString());
                          } else {
                            setSoldPremium("");
                            setCommissionPercentage("");
                          }
                        }}
                        className="rounded border-border text-primary focus:ring-primary"
                      />
                      <span><span className="font-semibold">{opt.carrier}</span> - ${opt.premium}</span>
                    </label>
                  ))}
                  {(!acceptQuote.quotes_provided || acceptQuote.quotes_provided.length === 0) && (
                    <p className="text-xs text-muted-foreground">{lang === 'es' ? 'No hay opciones registradas.' : 'No options registered.'}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">{t.soldPremium}</label>
                <input 
                  type="number" 
                  required
                  step="0.01"
                  value={soldPremium}
                  onChange={(e) => setSoldPremium(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>
              {userProfile?.role !== 'AGENT' && (
                <div className="space-y-2">
                <label className="text-sm font-medium">{t.commissionPercentage}</label>
                <input 
                  type="number" 
                  required
                  step="0.01"
                  value={commissionPercentage}
                  onChange={(e) => setCommissionPercentage(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>
              )}
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setAcceptQuote(null)} className="px-4 py-2 text-sm font-medium hover:bg-muted rounded-md" disabled={isUploading}>
                  Cancelar
                </button>
                <button type="submit" disabled={isUploading} className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:bg-primary/90 disabled:opacity-50">
                  {isUploading ? t.saving : t.acceptQuote}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Modal */}
      {assignQuote && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setAssignQuote(null)}
        >
          <div 
            className="bg-card w-full max-w-md rounded-xl shadow-lg border border-border p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold mb-4">{lang === 'es' ? 'Asignar para Procesar' : 'Assign for Processing'}</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {lang === 'es' 
                ? 'El agente seleccionado podrá cotizar esta solicitud, pero la propiedad comercial y las comisiones seguirán perteneciendo al creador.' 
                : 'The selected agent will be able to quote this request, but the ownership and commissions will remain with the creator.'}
            </p>
            <form onSubmit={handleAssign}>
              <div className="mb-6">
                <label className="text-sm font-medium mb-2 block">{t.member}</label>
                <select 
                  name="assignee"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  required
                  disabled={isUploading}
                >
                  <option value="">{t.select}</option>
                  {agencyMembers.map(m => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setAssignQuote(null)} className="px-4 py-2 text-sm font-medium hover:bg-muted rounded-md" disabled={isUploading}>
                  {lang === 'es' ? 'Cancelar' : 'Cancel'}
                </button>
                <button type="submit" disabled={isUploading} className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:bg-primary/90 disabled:opacity-50">
                  {isUploading ? t.saving : t.assign}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Transfer Ownership Modal */}
      {transferOwnerQuote && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setTransferOwnerQuote(null)}
        >
          <div 
            className="bg-card w-full max-w-md rounded-xl shadow-lg border border-border p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold mb-4">{lang === 'es' ? 'Ceder Propiedad' : 'Transfer Ownership'}</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {lang === 'es' 
                ? '¡Atención! Transferir la propiedad asignará todas las métricas, ventas y comisiones de esta cotización al nuevo agente de forma permanente.' 
                : 'Warning! Transferring ownership will assign all metrics, sales, and commissions of this quote to the new agent permanently.'}
            </p>
            <form onSubmit={handleTransferOwnership}>
              <div className="mb-6">
                <label className="text-sm font-medium mb-2 block">{t.member}</label>
                <select 
                  name="new_owner"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  required
                  disabled={isUploading}
                >
                  <option value="">{t.select}</option>
                  {agencyMembers.map(m => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setTransferOwnerQuote(null)} className="px-4 py-2 text-sm font-medium hover:bg-muted rounded-md" disabled={isUploading}>
                  {lang === 'es' ? 'Cancelar' : 'Cancel'}
                </button>
                <button type="submit" disabled={isUploading} className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:bg-primary/90 disabled:opacity-50">
                  {isUploading ? t.saving : (lang === 'es' ? 'Transferir' : 'Transfer')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Quote Modal */}
      <QuoteModal 
        isOpen={isNewQuoteModalOpen} 
        onClose={() => {
          setIsNewQuoteModalOpen(false)
          loadData() // Refresh quotes list if a new quote was created
        }} 
        rule={null}
        language={lang}
      />

      {/* Edit Quote Request Modal */}
      <EditQuoteRequestModal
        isOpen={!!editQuoteRequest}
        onClose={() => setEditQuoteRequest(null)}
        onSuccess={() => {
          setEditQuoteRequest(null)
          loadData()
        }}
        quote={editQuoteRequest}
        language={lang}
      />

      {/* Process Modal */}
      {processQuote && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setProcessQuote(null)}
        >
          <div 
            className="bg-card w-full max-w-2xl rounded-xl shadow-lg border border-border p-6 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold">{t.sendQuotes}</h3>
              <div className="flex items-center gap-2">

                <button onClick={() => setProcessQuote(null)} className="p-2 hover:bg-muted rounded-full">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="space-y-6">
              {proposals.map((prop, idx) => (
                <div key={idx} className="flex flex-col gap-4 p-5 border border-border rounded-lg bg-muted/10 relative">
                  <div className="absolute right-2 top-2 flex items-center gap-2">
                    <button 
                      onClick={() => setJsonImportIndex(idx)}
                      className="px-2 py-1 text-xs bg-primary/10 text-primary font-medium rounded hover:bg-primary/20 transition-colors"
                      title="Importar JSON"
                    >
                      JSON ✨
                    </button>
                    <button 
                      onClick={() => setProposals(proposals.filter((_, i) => i !== idx))}
                      className="p-1.5 border border-red-500/20 text-red-500 rounded-md hover:bg-red-500/10"
                      title="Eliminar"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1 block">Producto / {t.coverage}</label>
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
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1 block">{t.carrier}</label>
                      <select 
                        value={prop.carrier} 
                        onChange={e => {
                          const next = [...proposals]
                          next[idx].carrier = e.target.value
                          setProposals(next)
                        }}
                        className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                      >
                        <option value="">{t.selectCarrier}</option>
                        {Array.from(new Set([...availableCarriers, prop.carrier].filter(Boolean))).map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    
                    <div className="md:col-span-2 mt-2">
                      <label className="flex items-center gap-2 p-3 bg-emerald-500/10 text-emerald-700 rounded-lg cursor-pointer font-medium text-sm border border-emerald-500/20">
                        <input 
                          type="checkbox" 
                          checked={prop.is_bundled || false}
                          onChange={e => {
                            const next = [...proposals]
                            next[idx].is_bundled = e.target.checked
                            if (e.target.checked) {
                              next[idx].premium = ""
                              next[idx].monthly_payment = ""
                              next[idx].downpayment = ""
                            }
                            setProposals(next)
                          }}
                          className="rounded border-emerald-500/50 text-emerald-600 focus:ring-emerald-600 h-5 w-5"
                        />
                        {t.bundleQuote}
                        <span className="text-xs font-normal text-emerald-600/80 ml-auto hidden sm:block">
                          {t.bundleDesc}
                        </span>
                      </label>
                    </div>

                    {!prop.is_bundled ? (
                      <div className="md:col-span-2 pt-2 border-t border-border mt-2">
                        <label className="text-xs font-medium text-muted-foreground mb-3 block">{t.paymentOptions}</label>
                        <div className="flex gap-6 mb-4">
                          <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                            <input 
                              type="checkbox" 
                              checked={prop.is_annual || false}
                              onChange={e => {
                                const next = [...proposals];
                                next[idx].is_annual = e.target.checked;
                                const opts = [];
                                if (next[idx].is_annual) opts.push("{t.annualPayment}");
                                if (next[idx].is_monthly) opts.push("{t.monthlyPayment}");
                                next[idx].payment_options = opts.join(" o ");
                                setProposals(next);
                              }}
                              className="rounded border-input text-[#009CFF] focus:ring-[#009CFF] h-4 w-4"
                            />
                            {t.annualPayment}
                          </label>
                          <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                            <input 
                              type="checkbox" 
                              checked={prop.is_monthly || false}
                              onChange={e => {
                                const next = [...proposals];
                                next[idx].is_monthly = e.target.checked;
                                const opts = [];
                                if (next[idx].is_annual) opts.push("{t.annualPayment}");
                                if (next[idx].is_monthly) opts.push("{t.monthlyPayment}");
                                next[idx].payment_options = opts.join(" o ");
                                setProposals(next);
                              }}
                              className="rounded border-input text-[#009CFF] focus:ring-[#009CFF] h-4 w-4"
                            />
                            {t.monthlyPayment}
                          </label>
                        </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {prop.is_annual && (
                          <div>
                            <label className="text-xs font-medium text-muted-foreground mb-1 block">{t.totalPremium}</label>
                            <input 
                              type="number" 
                              value={prop.premium} 
                              onChange={e => {
                                const next = [...proposals]
                                next[idx].premium = e.target.value
                                setProposals(next)
                              }}
                              className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                              placeholder="Ej. 1200.00"
                            />
                          </div>
                        )}
                        {prop.is_monthly && (
                          <div className="flex gap-4">
                            <div className="flex-1">
                              <label className="text-xs font-medium text-muted-foreground mb-1 block">{t.downpayment}</label>
                              <input 
                                type="number" 
                                value={prop.downpayment || ""} 
                                onChange={e => {
                                  const next = [...proposals]
                                  next[idx].downpayment = e.target.value
                                  setProposals(next)
                                }}
                                className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                                placeholder="Ej. 200.00"
                              />
                            </div>
                            <div className="flex-1">
                              <label className="text-xs font-medium text-muted-foreground mb-1 block">{t.monthlyPayment} ($)</label>
                              <input 
                                type="number" 
                                value={prop.monthly_payment} 
                                onChange={e => {
                                  const next = [...proposals]
                                  next[idx].monthly_payment = e.target.value
                                  setProposals(next)
                                }}
                                className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                                placeholder="Ej. 100.00"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    ) : (
                      <div className="md:col-span-2 py-4 flex items-center justify-center border border-dashed border-emerald-500/30 bg-emerald-500/5 rounded-lg">
                        <p className="text-sm font-medium text-emerald-600">
                          {t.includedInBundle}
                        </p>
                      </div>
                    )}
                    
                    {userProfile?.role !== 'AGENT' && (
                      <>
                        <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1 block">{t.commissionInternal}</label>
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

                    <div className="md:col-span-1">
                      <label className="text-xs font-medium text-muted-foreground mb-1 block">{(t as any).agentCommission || "% Comisión (Agente)"}</label>
                      <input
                        type="number"
                        value={prop.agent_commission_percentage || ""}
                        onChange={e => {
                          const next = [...proposals]
                          next[idx].agent_commission_percentage = e.target.value
                          setProposals(next)
                        }}
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        placeholder="Ej: 20"
                      />
                    </div>
                      </>
                    )}
                    
                    <div className="md:col-span-2">
                      <label className="text-xs font-medium text-muted-foreground mb-1 block">{t.coveragesLimits}</label>
                      <textarea 
                        value={prop.coverages} 
                        onChange={e => {
                          const next = [...proposals]
                          next[idx].coverages = e.target.value
                          setProposals(next)
                        }}
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        placeholder="$1M/$2M General Liability | $100k Property..."
                        rows={2}
                      />
                    </div>

                    <div>
                      <label className="text-xs font-medium text-emerald-600 mb-1 block">{t.includes}</label>
                      <textarea 
                        value={prop.included} 
                        onChange={e => {
                          const next = [...proposals]
                          next[idx].included = e.target.value
                          setProposals(next)
                        }}
                        className="w-full rounded-md border border-emerald-500/30 bg-emerald-500/5 px-3 py-2 text-sm"
                        placeholder="Ej. Daños a terceros | Gastos médicos..."
                        rows={2}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-red-600 mb-1 block">{t.excludes}</label>
                      <textarea 
                        value={prop.excluded} 
                        onChange={e => {
                          const next = [...proposals]
                          next[idx].excluded = e.target.value
                          setProposals(next)
                        }}
                        className="w-full rounded-md border border-red-500/30 bg-red-500/5 px-3 py-2 text-sm"
                        placeholder="Ej. Cyber, Inundación, Terremoto..."
                        rows={2}
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="text-xs font-medium text-muted-foreground mb-1 block">{(t as any).description || "Description / Summary"}</label>
                      <textarea 
                        value={prop.description || ""} 
                        onChange={e => {
                          const next = [...proposals]
                          next[idx].description = e.target.value
                          setProposals(next)
                        }}
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        placeholder="Product summary and examples..."
                        rows={2}
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="text-xs font-medium text-muted-foreground mb-1 block">{t.uwNotes}</label>
                      <textarea 
                        value={prop.notes} 
                        onChange={e => {
                          const next = [...proposals]
                          next[idx].notes = e.target.value
                          setProposals(next)
                        }}
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        placeholder="Condiciones o notas importantes para el cliente..."
                        rows={2}
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="text-xs font-medium text-muted-foreground mb-1 block">{t.quotePDF}</label>
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
                  </div>
                </div>
              ))}
              
              <button 
                onClick={() => setProposals([...proposals, { product: "", carrier: "", premium: "", commission_percentage: "", agent_commission_percentage: "", monthly_payment: "", downpayment: "", payment_options: "{t.annualPayment}", coverages: "", included: "", excluded: "", notes: "", description: "", file: null, is_annual: true, is_monthly: false, is_bundled: false }])}
                className="flex items-center justify-center w-full py-3 border-2 border-dashed border-border rounded-lg text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                {t.addAnotherProposal}
              </button>

            </div>

            <div className="mt-8 flex justify-end space-x-3">
              <button onClick={() => setProcessQuote(null)} className="px-5 py-2 border border-border rounded-md font-medium">{t.cancel}</button>
              <button 
                onClick={handleProcessSubmit}
                disabled={isUploading}
                className="px-5 py-2 bg-primary text-primary-foreground rounded-md font-medium flex items-center disabled:opacity-50"
              >
                {isUploading ? t.savingUploading : (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    {t.sendToAgent}
                  </>
                )}
              </button>
            </div>
          </div>
    </div>
      )}

      <ActivityLogsModal
        isOpen={!!logsQuote}
        onClose={() => setLogsQuote(null)}
        entityType="quote_requests"
        entityId={logsQuote?.id}
        entityName={`${logsQuote?.client_name} - ${logsQuote?.coverage_requested}`}
      />
      {jsonImportIndex !== null && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-lg rounded-xl shadow-lg border border-border p-6">
            <h3 className="text-xl font-bold mb-4">{lang === 'es' ? 'Importar Propuestas (JSON)' : 'Import Proposals (JSON)'}</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {lang === 'es' ? 'Pega el código JSON generado por tu IA aquí:' : 'Paste the JSON code generated by your AI here:'}
            </p>
            <textarea
              className="w-full h-64 bg-background border border-border rounded-lg p-3 font-mono text-sm mb-4"
              value={jsonImportText}
              onChange={(e) => setJsonImportText(e.target.value)}
              placeholder="[\n  {\n    'carrier': 'Chubb',\n    ...\n  }\n]"
            />
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setJsonImportIndex(null)}
                className="px-4 py-2 text-sm text-muted-foreground hover:bg-muted rounded-lg font-medium transition-colors"
              >
                {lang === 'es' ? 'Cancelar' : 'Cancel'}
              </button>
              <button 
                onClick={handleJsonImport}
                className="px-4 py-2 text-sm bg-primary text-white hover:bg-primary/90 rounded-lg font-medium transition-colors shadow-sm"
              >
                {lang === 'es' ? 'Importar' : 'Import'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
