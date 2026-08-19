"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Check, X, ShieldCheck, ChevronLeft, Download, FileText, CheckCircle2, ChevronDown } from "lucide-react"
import { toast } from "sonner"
import { motion, AnimatePresence } from "framer-motion"
import { useLanguage } from "@/components/language-provider"

export default function ProposalPresentationPage() {
  const { id } = useParams()
  const router = useRouter()
  const lang = useLanguage() || 'es'
  const [quote, setQuote] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  const [hasScrolled, setHasScrolled] = useState(false)
  
  const supabase = createClient()

  // Dictionaries - Cinematic Copy
  const dict = {
    es: {
      loading: "Configurando el entorno...",
      notFound: "Propuesta no encontrada.",
      welcome: "Hola, te estaba esperando.",
      tailored: "He analizado cada detalle para crear esta propuesta exclusiva para",
      thankYou: "Tu tranquilidad es el objetivo. Exploremos juntos tu nuevo escudo de protección.",
      scroll: "Descubre tu propuesta",
      back: "Volver a Propuestas",
      download: "Descargar Documento Oficial",
      accepted: "Propuesta Aceptada",
      rejected: "Propuesta Rechazada",
      active: "Propuesta Activa",
      summary: "Escenarios de Cobertura",
      options: "Tus Opciones de Protección",
      noDetails: "Aún estamos moldeando las opciones para esta solicitud.",
      premium: "Inversión Total",
      monthly: "Esquema Mensual",
      plans: "Esquemas",
      limits: "Límites y Alcances",
      included: "Lo que sí te cubre",
      excluded: "Lo que queda fuera",
      notes: "Apuntes Estratégicos",
      documents: "Anexos Legales",
      generating: "Compilando propuesta oficial...",
      success: "Documento generado exitosamente",
      error: "No pudimos generar el documento"
    },
    en: {
      loading: "Configuring environment...",
      notFound: "Proposal not found.",
      welcome: "Hi, I've been waiting for you.",
      tailored: "I've analyzed every detail to build this exclusive proposal for",
      thankYou: "Your peace of mind is the goal. Let's explore your new protection shield together.",
      scroll: "Discover your proposal",
      back: "Back to Proposals",
      download: "Download Official Document",
      accepted: "Proposal Accepted",
      rejected: "Proposal Rejected",
      active: "Active Proposal",
      summary: "Coverage Scenarios",
      options: "Your Protection Options",
      noDetails: "We are still shaping the options for this request.",
      premium: "Total Investment",
      monthly: "Monthly Scheme",
      plans: "Schemes",
      limits: "Limits & Scope",
      included: "What is covered",
      excluded: "What is left out",
      notes: "Strategic Notes",
      documents: "Legal Annexes",
      generating: "Compiling official proposal...",
      success: "Document generated successfully",
      error: "We couldn't generate the document"
    }
  }[lang]

  useEffect(() => {
    const fetchQuote = async () => {
      const { data } = await supabase
        .from("quote_requests")
        .select(`*, profiles!agent_id(name, agency_id), assignee:profiles!assigned_to(name), agencies(name, logo_url)`)
        .eq("id", id)
        .single()
        
      if (data) setQuote(data)
      setTimeout(() => setLoading(false), 1200) // Slight delay for dramatic effect
    }
    fetchQuote()

    const handleScroll = () => {
      setHasScrolled(window.scrollY > 50)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [id, supabase])

  const handleGeneratePDF = async () => {
    setIsGenerating(true)
    const toastId = toast.loading(dict.generating)
    try {
      const { pdf } = await import('@react-pdf/renderer')
      const { ProposalPDF } = await import('@/components/pdf/ProposalPDF')
      
      const blob = await pdf(<ProposalPDF quote={quote} />).toBlob()
      
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `Propuesta_${quote.client_name.replace(/\s+/g, '_')}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
      toast.success(dict.success, { id: toastId })
    } catch (error) {
      console.error(error)
      toast.error(dict.error, { id: toastId })
    } finally {
      setIsGenerating(false)
    }
  }

  if (loading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-white text-[#514690]">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }} 
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          className="w-16 h-16 border-4 border-[#009CFF]/20 border-t-[#009CFF] rounded-full animate-spin mb-8"
        />
        <motion.p 
          animate={{ opacity: [0, 1, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          className="text-[#009CFF] tracking-[0.3em] uppercase text-xs font-bold"
        >
          {dict.loading}
        </motion.p>
      </div>
    )
  }

  if (!quote) {
    return <div className="h-screen w-full flex items-center justify-center bg-white text-[#514690]">{dict.notFound}</div>
  }

  const proposals = quote.quotes_provided || []

  // Cinematic Animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.3, delayChildren: 0.2 } }
  }

  const textRevealVariants = {
    hidden: { opacity: 0, y: 40, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 1.2, ease: [0.16, 1, 0.3, 1] } }
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 60, scale: 0.98 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 1, ease: [0.16, 1, 0.3, 1] } }
  }

  return (
    <div className="flex-1 bg-[#FFFFFF] min-h-screen text-[#0B162C] overflow-x-hidden selection:bg-[#009CFF]/20 selection:text-[#009CFF] font-sans">
      
      {/* Floating Action Bar */}
      <AnimatePresence>
        {hasScrolled && (
          <motion.div 
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="fixed top-0 inset-x-0 z-50 bg-white/70 backdrop-blur-2xl border-b border-[#514690]/5 shadow-sm px-6 py-4 flex items-center justify-between"
          >
            <button 
              onClick={() => router.push('/proposals')}
              className="flex items-center text-slate-500 hover:text-[#009CFF] font-medium text-sm transition-colors"
            >
              <ChevronLeft className="w-5 h-5 mr-1" />
              <span className="hidden sm:inline">{dict.back}</span>
            </button>
            
            <div className="flex items-center gap-3 md:gap-4">
              <span className={`px-4 py-1.5 rounded-full text-[10px] md:text-xs font-bold tracking-widest uppercase border ${
                quote.status === 'ACCEPTED' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                quote.status === 'REJECTED' ? 'bg-red-50 text-red-600 border-red-200' :
                'bg-[#009CFF]/5 text-[#009CFF] border-[#009CFF]/20'
              }`}>
                {quote.status === 'ACCEPTED' ? dict.accepted : quote.status === 'REJECTED' ? dict.rejected : dict.active}
              </span>
              <button 
                onClick={handleGeneratePDF}
                disabled={isGenerating}
                className="flex items-center px-5 py-2.5 bg-[#514690] hover:bg-[#3D3470] text-white rounded-xl text-sm font-bold transition-all shadow-[0_4px_15px_rgba(81,70,144,0.2)] hover:shadow-[0_8px_25px_rgba(81,70,144,0.3)] hover:-translate-y-0.5 disabled:opacity-50 disabled:transform-none"
              >
                <Download className="w-4 h-4 md:mr-2" />
                <span className="hidden md:inline">{dict.download}</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cinematic Hero Section - Light Theme but with deep motion and structure */}
      <section className="relative min-h-screen flex flex-col justify-center p-6 md:p-12 overflow-hidden bg-[#F8FAFC]">
        {/* Soft Animated Background Blobs */}
        <motion.div 
          animate={{ scale: [1, 1.1, 1], rotate: [0, 90, 0] }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-bl from-[#E0C0FF]/30 to-transparent rounded-full blur-[120px] opacity-60 -translate-y-1/3 translate-x-1/3"
        />
        <motion.div 
          animate={{ scale: [1, 1.2, 1], rotate: [0, -90, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-gradient-to-tr from-[#9CEAEF]/30 to-transparent rounded-full blur-[120px] opacity-60 translate-y-1/3 -translate-x-1/4"
        />
        
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-7xl mx-auto w-full flex flex-col lg:flex-row items-center justify-between gap-16 relative z-10"
        >
          
          <div className="flex-1 text-center lg:text-left z-20">
            {quote.agencies?.logo_url && (
              <motion.div variants={textRevealVariants} className="mb-12 inline-block">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={quote.agencies.logo_url} alt="Agency Logo" className="h-14 md:h-16 object-contain" />
              </motion.div>
            )}

            <motion.p variants={textRevealVariants} className="text-[#009CFF] font-bold text-sm tracking-[0.2em] uppercase mb-4">
              {dict.welcome}
            </motion.p>
            
            <motion.div variants={textRevealVariants} className="overflow-hidden mb-8">
              <h1 className="text-6xl md:text-8xl font-black text-[#514690] tracking-tight leading-[1.1] pb-2">
                {quote.client_name}
              </h1>
            </motion.div>

            <motion.p variants={textRevealVariants} className="text-slate-500 text-lg md:text-2xl font-light max-w-2xl mx-auto lg:mx-0 leading-relaxed mb-10">
              {dict.tailored} <span className="text-[#0B162C] font-semibold">{quote.client_business_type}</span>. <br/>
              <span className="opacity-70 mt-2 block">{dict.thankYou}</span>
            </motion.p>
          </div>

          <motion.div 
            variants={textRevealVariants}
            className="w-full max-w-lg lg:max-w-xl lg:w-1/2 relative z-10"
          >
            {/* User's uploaded Image (Cinematically animated) */}
            <motion.div 
              animate={{ y: [-15, 15, -15] }}
              transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
              className="relative w-full aspect-square drop-shadow-2xl"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/alex-assets/image-1.png" alt="Alex AI Assistant" className="w-full h-full object-contain" />
            </motion.div>
          </motion.div>

        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.5, duration: 1.5 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center"
        >
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] mb-4 text-[#514690]/50">{dict.scroll}</p>
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
          >
            <ChevronDown className="w-5 h-5 text-[#009CFF]" />
          </motion.div>
        </motion.div>
      </section>

      {/* Main Content Area */}
      <div className="bg-white relative z-20 shadow-[0_-20px_50px_rgba(0,0,0,0.03)] rounded-t-[3rem] -mt-8 pt-24 pb-32">
        <div className="max-w-7xl mx-auto p-4 md:p-8">
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-center gap-8 mb-20"
          >
            <div className="h-[2px] bg-gradient-to-r from-transparent via-slate-200 to-slate-200 flex-1"></div>
            <h2 className="text-3xl md:text-5xl font-black text-[#514690] tracking-tight">{dict.options}</h2>
            <div className="h-[2px] bg-gradient-to-l from-transparent via-slate-200 to-slate-200 flex-1"></div>
          </motion.div>

          {proposals.length === 0 ? (
            <div className="bg-[#F8FAFC] p-20 rounded-[3rem] border border-slate-100 text-center">
              <p className="text-xl text-slate-500 font-light">{dict.noDetails}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-10">
              {proposals.map((prop: any, idx: number) => (
                <motion.div 
                  key={idx} 
                  variants={cardVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-50px" }}
                  custom={idx}
                  className="bg-white rounded-[2.5rem] border border-slate-100 shadow-[0_10px_40px_rgba(0,0,0,0.03)] overflow-hidden flex flex-col group hover:shadow-[0_20px_60px_rgba(0,156,255,0.08)] hover:-translate-y-2 transition-all duration-700"
                >
                  {/* Header de la Tarjeta */}
                  <div className="p-10 pb-8 border-b border-slate-100 relative overflow-hidden bg-gradient-to-b from-[#F8FAFC] to-white">
                    <motion.div 
                      className="absolute top-0 right-0 w-40 h-40 bg-[#009CFF]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"
                      whileHover={{ scale: 1.5, backgroundColor: "rgba(0,156,255,0.1)" }}
                      transition={{ duration: 0.7 }}
                    />
                    <p className="text-[10px] font-black text-[#009CFF] uppercase tracking-[0.2em] mb-4 relative z-10">{prop.carrier || 'Aseguradora'}</p>
                    <h3 className="text-4xl font-black text-[#514690] relative z-10 leading-tight">{prop.product}</h3>
                  </div>

                  {/* Precios */}
                  <div className="p-10 bg-white border-b border-slate-100 relative">
                    <div className="flex flex-col gap-5">
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">{dict.premium}</p>
                        <p className="text-5xl font-black text-[#0B162C] tracking-tighter">${Number(prop.premium).toLocaleString('en-US', {minimumFractionDigits: 2})}</p>
                      </div>
                      {prop.monthly_payment && Number(prop.monthly_payment) > 0 && (
                        <div className="pt-6 border-t border-slate-100">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">{dict.monthly}</p>
                          <p className="text-3xl font-bold text-[#514690] tracking-tight">${Number(prop.monthly_payment).toLocaleString('en-US', {minimumFractionDigits: 2})}</p>
                        </div>
                      )}
                    </div>
                    {prop.payment_options && (
                      <div className="mt-8 pt-8 border-t border-slate-100">
                        <div className="bg-[#F8FAFC] p-5 rounded-2xl border border-slate-100">
                          <span className="font-bold text-[#009CFF] uppercase text-[10px] tracking-widest block mb-2">{dict.plans}</span> 
                          <p className="text-sm text-slate-600 font-medium leading-relaxed">{prop.payment_options}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Detalles */}
                  <div className="p-10 flex-1 flex flex-col gap-10 bg-[#F8FAFC]/50">
                    
                    {/* Límites */}
                    {prop.coverages && (
                      <div>
                        <p className="text-[10px] font-bold text-[#514690] uppercase tracking-widest mb-5 flex items-center gap-2">
                          <ShieldCheck className="w-4 h-4 text-[#009CFF]" /> {dict.limits}
                        </p>
                        <ul className="space-y-4">
                          {prop.coverages.split(',').map((c: string, i: number) => (
                            <li key={i} className="flex items-start text-sm">
                              <CheckCircle2 className="w-5 h-5 text-[#009CFF] mr-4 mt-0.5 shrink-0" />
                              <span className="text-slate-600 font-medium leading-relaxed">{c.trim()}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="flex flex-col gap-5">
                      {/* Qué Incluye */}
                      {prop.included && (
                        <div className="bg-emerald-50/80 rounded-3xl p-6 border border-emerald-100">
                          <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-4 flex items-center">
                            <Check className="w-4 h-4 mr-2" /> {dict.included}
                          </p>
                          <ul className="space-y-3">
                            {prop.included.split(',').map((inc: string, i: number) => (
                              <li key={i} className="text-sm text-emerald-800 font-medium leading-relaxed">{inc.trim()}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Qué Excluye */}
                      {prop.excluded && (
                        <div className="bg-red-50/80 rounded-3xl p-6 border border-red-100">
                          <p className="text-[10px] font-bold text-red-600 uppercase tracking-widest mb-4 flex items-center">
                            <X className="w-4 h-4 mr-2" /> {dict.excluded}
                          </p>
                          <ul className="space-y-3">
                            {prop.excluded.split(',').map((exc: string, i: number) => (
                              <li key={i} className="text-sm text-red-800 font-medium leading-relaxed">{exc.trim()}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    {/* Notas */}
                    {prop.notes && (
                      <div className="bg-white rounded-3xl p-6 border border-slate-200 mt-auto shadow-sm">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                          <FileText className="w-4 h-4 text-[#514690]" /> {dict.notes}
                        </p>
                        <p className="text-sm text-slate-600 font-medium leading-relaxed">{prop.notes}</p>
                      </div>
                    )}
                    
                  </div>
                </motion.div>
              ))}
            </div>
          )}
          
          {/* Archivos Originales */}
          {proposals.some((p: any) => p.file_url) && (
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className="mt-28 text-center"
            >
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-8">{dict.documents}</h3>
              <div className="flex flex-wrap justify-center gap-6">
                {proposals.map((p: any, i: number) => p.file_url ? (
                  <a 
                    key={i}
                    href={p.file_url} 
                    target="_blank" 
                    rel="noreferrer"
                    className="group flex items-center px-8 py-5 bg-white border border-slate-200 rounded-3xl hover:border-[#009CFF] transition-all duration-500 shadow-sm hover:shadow-[0_10px_30px_rgba(0,156,255,0.1)] hover:-translate-y-1"
                  >
                    <FileText className="w-6 h-6 mr-4 text-slate-400 group-hover:text-[#009CFF] transition-colors duration-500" />
                    <span className="font-bold text-sm text-[#514690] group-hover:text-[#009CFF] transition-colors duration-500 tracking-wide">{p.product}</span>
                  </a>
                ) : null)}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
