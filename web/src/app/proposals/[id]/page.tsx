"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Check, X, ChevronLeft, ChevronRight, CheckCircle2, Shield, Info, ArrowRight, Zap, Users, Lock, FileText, Activity, AlertCircle, Heart, Star, CloudRain, Briefcase, ListChecks, ArrowLeft, Gift, Download } from "lucide-react"
import { toast } from "sonner"
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion"
import { useLanguage } from "@/components/language-provider"
import { Caveat } from 'next/font/google'
import { acceptClientQuote } from "@/app/actions/quote"
import { pdf } from "@react-pdf/renderer"
import { FormalProposalPDF } from "@/components/pdf/FormalProposalPDF"
import { PDFDocument } from "pdf-lib"

const caveat = Caveat({ subsets: ['latin'], weight: '700' })

const getCarrierLogo = (carrierName: string) => {
  if (!carrierName) return null
  const name = carrierName.toLowerCase().replace(/[^a-z0-9]/g, '')
  
  const matches = (key: string) => name.includes(key.replace(/[^a-z0-9]/g, ''))
  
  if (matches('coterie')) return `/logos/logo-coterie.png`
  if (matches('chubb')) return `/logos/logo-chubb.png`
  if (matches('hiscox')) return `/logos/logo-hiscox.png`
  if (matches('attune')) return `/logos/logo-attune.png`
  if (matches('clearcover')) return `/logos/Carrier-clearcover.png`
  if (matches('kemper')) return `/logos/Carrier-kemper.jpg`
  if (matches('just')) return `/logos/Carrier-just.jpg`
  if (matches('aegis')) return `/logos/carrier-aegis.png`
  if (matches('annex')) return `/logos/carrier-annex.png`
  if (matches('aspire')) return `/logos/Carrier-aspire.jpg`
  if (matches('assurance america')) return `/logos/Carrier-assurance-america.png`
  if (matches('commonwealth')) return `/logos/Carrier-commonwealth.jpg`
  if (matches('covercube')) return `/logos/Carrier-covercube.jpg`
  if (matches('epremium')) return `/logos/carrier-epremium.png`
  if (matches('foremost')) return `/logos/carrier-foremost.png`
  if (matches('hippo')) return `/logos/carrier-hippo.png`
  if (matches('homeowners')) return `/logos/carrier-homeowners.png`
  if (matches('kanguro')) return `/logos/carrier-kanguro.png`
  if (matches('warrior')) return `/logos/Carrier-warrior.png`
  if (matches('alchemy')) return `/logos/logo-alchemy.png`
  if (matches('amtrust')) return `/logos/logo-amtrust.png`
  if (matches('berxi')) return `/logos/logo-berxi.png`
  if (matches('biberk')) return `/logos/logo-biberk.png`
  if (matches('blitz')) return `/logos/logo-blitz.png`
  if (matches('bristol')) return `/logos/logo-bristol-west.png`
  if (matches('colonial')) return `/logos/logo-colonial.png`
  if (matches('coverwhale')) return `/logos/logo-coverwhale.png`
  if (matches('cowbell')) return `/logos/logo-cowbell.png`
  if (matches('crosscover')) return `/logos/logo-crosscover.png`
  if (matches('employers')) return `/logos/logo-employers.png`
  if (matches('ergo')) return `/logos/logo-ergo-next.png`
  if (matches('first')) return `/logos/logo-first.png`
  if (matches('foxquilt')) return `/logos/logo-foxquilt.png`
  if (matches('great american')) return `/logos/logo-great-american.png`
  if (matches('greenshield')) return `/logos/logo-greenshield.png`
  if (matches('hanover')) return `/logos/logo-hanover.png`
  if (matches('insur-fi')) return `/logos/logo-insur-fi.png`
  if (matches('isc')) return `/logos/logo-isc.png`
  if (matches('kelly')) return `/logos/logo-kelly.png`
  if (matches('lio')) return `/logos/logo-lio.png`
  if (matches('mgt')) return `/logos/logo-mgt.png`
  if (matches('neptune')) return `/logos/logo-neptune.png`
  if (matches('nirvana')) return `/logos/logo-nirvana.png`
  if (matches('novo')) return `/logos/logo-novo.png`
  if (matches('palomar')) return `/logos/logo-palomar.png`
  if (matches('pathpoint')) return `/logos/logo-pathpoint.png`
  if (matches('pouch')) return `/logos/logo-pouch.png`
  if (matches('propeller')) return `/logos/logo-propeller.png`
  if (matches('rainbow')) return `/logos/logo-rainbow.png`
  if (matches('rli surety')) return `/logos/logo-rli-surety.png`
  if (matches('rli')) return `/logos/logo-rli.png`
  if (matches('ses')) return `/logos/logo-ses.png`
  if (matches('simply')) return `/logos/logo-simply.png`
  if (matches('skywatch')) return `/logos/logo-skywatch.png`
  if (matches('slice')) return `/logos/logo-slice.png`
  if (matches('steadily')) return `/logos/logo-steadily.png`
  if (matches('stonegate')) return `/logos/logo-stonegate.png`
  if (matches('thimble')) return `/logos/logo-thimble.png`
  if (matches('three')) return `/logos/logo-three.png`
  if (matches('tokio')) return `/logos/logo-tokiomarine.png`
  if (matches('vacant')) return `/logos/logo-vacant-express.png`

  return null
}

const getFeatureIcon = (text: string) => {
  const lower = text.toLowerCase()
  if (lower.includes('ciber') || lower.includes('datos') || lower.includes('cyber') || lower.includes('data')) return <Lock className="w-5 h-5" />
  if (lower.includes('vida') || lower.includes('salud') || lower.includes('médic') || lower.includes('life') || lower.includes('health')) return <Heart className="w-5 h-5" />
  if (lower.includes('terceros') || lower.includes('empleados') || lower.includes('público') || lower.includes('third party') || lower.includes('employees')) return <Users className="w-5 h-5" />
  if (lower.includes('legal') || lower.includes('demanda') || lower.includes('abogado') || lower.includes('lawsuit')) return <Briefcase className="w-5 h-5" />
  if (lower.includes('daños') || lower.includes('propiedad') || lower.includes('equipo') || lower.includes('damage') || lower.includes('property')) return <AlertCircle className="w-5 h-5" />
  if (lower.includes('interrupción') || lower.includes('negocio') || lower.includes('interruption') || lower.includes('business')) return <Activity className="w-5 h-5" />
  if (lower.includes('clima') || lower.includes('inundación') || lower.includes('weather') || lower.includes('flood')) return <CloudRain className="w-5 h-5" />
  return <CheckCircle2 className="w-5 h-5" />
}

export default function ProposalCarouselPage() {
  const { id } = useParams()
  const router = useRouter()
  const langContext = useLanguage()
  const lang = (langContext === 'en' || langContext === 'es') ? langContext : 'es'
  
  const [quote, setQuote] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isAccepting, setIsAccepting] = useState(false)
  const [selectedModules, setSelectedModules] = useState<boolean[]>([])
  const [carriersMap, setCarriersMap] = useState<Record<string, string>>({})
  const [currentIndex, setCurrentIndex] = useState(0)
  const [hasOpened, setHasOpened] = useState(false) 
  const carouselRef = useRef<HTMLDivElement>(null)

  const { scrollY } = useScroll()
  const bgY = useTransform(scrollY, [0, 1000], ["0%", "20%"])
  const bgScale = useTransform(scrollY, [0, 1000], [1.05, 1.15])
  const bgOpacity = useTransform(scrollY, [0, 1000], [0.8, 0.4])

  const supabase = createClient()

  // i18n Dictionary
  const t = {
    es: {
      loading: 'Preparando tu experiencia...',
      notFound: 'Propuesta no encontrada.',
      back: 'Atrás',
      coverTitle: '¡Hola',
      coverThankYou: 'Gracias por confiar en nosotros. Nos tomamos el tiempo de crear esto exclusivamente para ti, queremos que tu patrimonio siempre esté seguro.',
      revealButton: 'Revelar Propuesta',
      processedSuccess: '¡Procesado con Éxito!',
      processedDesc: 'Tu equipo ya está trabajando en los documentos oficiales.',
      totalInvestment: 'Inversión Total',
      option1: 'Pago Único',
      payInFull: 'Pago Único',
      option2: 'Financiamiento Mensual',
      perMonth: '/ mes',
      downpayment: '+ enganche de $',
      includedInBundle: 'PAQUETE INTEGRADO',
      or: 'ó',
      includedTitle: 'Beneficios Incluidos',
      excludedTitle: 'Exclusiones Principales',
      coveragesTitle: 'Estructura de Límites',
      activeModule: 'Incluida en Propuesta',
      addModule: 'Añadir a Propuesta',
      limit: 'Límite:',
      acceptProposal: 'Aceptar Propuesta Oficial',
      processing: 'Procesando Documento...',
      toastPreparing: 'Preparando expediente...',
      toastSuccess: '¡Todo listo! Propuesta aceptada oficialmente.',
      toastError: 'Ocurrió un error de conexión.',
      summaryTitle: 'Resumen Ejecutivo',
      summaryDesc: 'Estas son las pólizas estructuradas para tu protección. Revisa el desglose final de inversión.',
      costBreakdown: 'Desglose de Costos',
      slide: 'Póliza',
      of: 'de',
      swipeText: 'Desliza para explorar',
      downloadPdf: 'Descargar propuesta',
      toastGeneratingPdf: 'Compilando propuesta...',
      toastGeneratedPdfSuccess: '¡Propuesta generada con éxito!',
      toastGeneratedPdfError: 'Hubo un error al generar el PDF',
      pdfFilenamePrefix: 'Propuesta-Oficial-',
      disclaimer: 'El presente documento es una cotización estimada basada en la información proporcionada y no constituye una póliza de seguro, un contrato vinculante ni un compromiso de cobertura por ninguna de las partes. Los términos, condiciones, primas y coberturas finales están sujetos a la revisión y aprobación definitiva por parte de la aseguradora correspondiente.',
      preparedExclusivelyFor: 'PREPARADO EXCLUSIVAMENTE PARA',
      noPoliciesSelected: 'No has seleccionado ninguna póliza',
      official: 'Oficial'
    },
    en: {
      loading: 'Preparing your experience...',
      notFound: 'Proposal not found.',
      back: 'Back',
      coverTitle: 'Hello',
      coverThankYou: 'Thank you for trusting us. We took the time to create this exclusively for you, we want your assets to always be secure.',
      revealButton: 'Reveal Proposal',
      processedSuccess: 'Successfully Processed!',
      processedDesc: 'Your team is already working on the official documents.',
      totalInvestment: 'Total Investment',
      option1: 'Pay in Full',
      payInFull: 'Pay in Full',
      option2: 'Monthly Financing',
      perMonth: '/ month',
      downpayment: '+ downpayment of $',
      includedInBundle: 'INTEGRATED BUNDLE',
      or: 'or',
      includedTitle: 'Included Benefits',
      excludedTitle: 'Primary Exclusions',
      coveragesTitle: 'Limits Structure',
      activeModule: 'Included in Proposal',
      addModule: 'Add to Proposal',
      limit: 'Limit:',
      acceptProposal: 'Accept Official Proposal',
      processing: 'Processing Document...',
      toastPreparing: 'Preparing file...',
      toastSuccess: 'All set! Proposal officially accepted.',
      toastError: 'A connection error occurred.',
      summaryTitle: 'Executive Summary',
      summaryDesc: 'These are the structured policies for your protection. Review the final investment breakdown.',
      costBreakdown: 'Cost Breakdown',
      slide: 'Policy',
      of: 'of',
      swipeText: 'Swipe to explore',
      downloadPdf: 'Download proposal',
      toastGeneratingPdf: 'Compiling proposal...',
      toastGeneratedPdfSuccess: 'Proposal generated successfully!',
      toastGeneratedPdfError: 'An error occurred while generating the PDF',
      pdfFilenamePrefix: 'Official-Proposal-',
      disclaimer: 'This document is an estimated quote based on the provided information and does not constitute an insurance policy, a binding contract, or a commitment of coverage by any party. Final terms, conditions, premiums, and coverages are subject to final review and approval by the respective insurance carrier.',
      preparedExclusivelyFor: 'PREPARED EXCLUSIVELY FOR',
      noPoliciesSelected: 'You have not selected any policy',
      official: 'Official'
    }
  }[lang]

  
  useEffect(() => {
    if (!carouselRef.current) return;
    
    // We observe all slides. If a slide becomes fully visible, we scroll the window to the top.
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      });
    }, {
      root: carouselRef.current,
      threshold: 0.6
    });

    const slides = document.querySelectorAll('.slide-container');
    slides.forEach(slide => observer.observe(slide));

    return () => observer.disconnect();
  }, [quote, selectedModules]);

  useEffect(() => {
    const fetchQuote = async () => {
      const { data } = await supabase
        .from("quote_requests")
        .select(`*, profiles!agent_id(name, agency_id), assignee:profiles!assigned_to(name), agencies(name, logo_url)`)
        .eq("id", id)
        .single()
        
      if (data) {
        setQuote(data)
        const initialSelected = new Array(data.quotes_provided?.length || 0).fill(false);
        const seenProducts = new Set();
        data.quotes_provided?.forEach((prop: any, idx: number) => {
          const productKey = prop.product.trim().toLowerCase();
          if (!seenProducts.has(productKey)) {
            seenProducts.add(productKey);
            initialSelected[idx] = true;
          }
        });
        setSelectedModules(initialSelected);
      }

      const { data: carriersData } = await supabase.from('carriers').select('name, logo_url')
      if (carriersData) {
        const cmap: Record<string, string> = {}
        carriersData.forEach(c => {
          if (c.logo_url && c.logo_url.trim() !== '') {
            if (c.logo_url.startsWith('http') || c.logo_url.startsWith('/')) {
              cmap[c.name] = c.logo_url
            } else {
              cmap[c.name] = supabase.storage.from('logos').getPublicUrl(c.logo_url).data.publicUrl
            }
          }
        })
        setCarriersMap(cmap)
      }

      setLoading(false)
    }
    fetchQuote()
  }, [id])

  const proposals = quote?.quotes_provided || []
  
  const groupedProposals: any[] = [];
  proposals.forEach((prop: any, idx: number) => {
    const existing = groupedProposals.find(g => g.product.trim().toLowerCase() === prop.product.trim().toLowerCase());
    if (existing) {
      existing.options.push({ ...prop, originalIdx: idx });
    } else {
      groupedProposals.push({
        product: prop.product,
        options: [{ ...prop, originalIdx: idx }]
      });
    }
  });

  const totalSlides = groupedProposals.length + 1 

  const handleScroll = () => {
    if (carouselRef.current) {
      const { scrollLeft, clientWidth } = carouselRef.current
      const newIndex = Math.round(scrollLeft / clientWidth)
      setCurrentIndex(newIndex)
    }
  }

  const packageTotal = groupedProposals.reduce((acc: any, group: any) => {
    const selectedOpt = group.options.find((o: any) => selectedModules[o.originalIdx]);
    if (selectedOpt && !selectedOpt.is_bundled) {
      acc.premium += Number(selectedOpt.premium || 0)
      acc.monthly += Number(selectedOpt.monthly_payment || 0)
      acc.downpayment += Number(selectedOpt.downpayment || 0)
    }
    return acc
  }, { premium: 0, monthly: 0, downpayment: 0 })

  const handleAccept = async () => {
    setIsAccepting(true)
    const toastId = toast.loading(t.toastPreparing)
    try {
      await acceptClientQuote(quote.id, packageTotal.premium, selectedModules)
      setQuote({ ...quote, status: 'ACCEPTED' })
      toast.success(t.toastSuccess, { id: toastId })
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (e) {
      toast.error(t.toastError, { id: toastId })
    } finally {
      setIsAccepting(false)
    }
  }

  const generateAndDownloadPDF = async () => {
    const toastId = toast.loading(t.toastGeneratingPdf);
    try {
      // 1. Generate Formal PDF Blob
      const quoteWithLogos = {
        ...quote,
        quotes_provided: quote.quotes_provided?.map((q: any) => ({
          ...q,
          carrier: q.carrier || 'N/A',
          carrierLogo: carriersMap[q.carrier]?.trim() ? carriersMap[q.carrier] : getCarrierLogo(q.carrier),
          product: q.product || 'Unknown Product'
        }))
      }
      const blob = await pdf(<FormalProposalPDF quote={quoteWithLogos} selectedModules={selectedModules} disclaimer={t.disclaimer} />).toBlob();
      
      // 2. Load it into pdf-lib to allow appending
      const pdfArrayBuffer = await blob.arrayBuffer();
      const pdfDoc = await PDFDocument.load(pdfArrayBuffer);

      // 3. Search for attachments in quote.quotes_provided based on selectedModules
      const attachments: string[] = [];
      if (Array.isArray(quote.quotes_provided)) {
        quote.quotes_provided.forEach((q: any, idx: number) => {
          if (selectedModules[idx] && q.file_url && q.file_url.toLowerCase().includes('.pdf')) {
            attachments.push(q.file_url);
          }
        });
      }
      
      // 4. Fetch and append each PDF
      for (const url of attachments) {
        try {
          const response = await fetch(`/api/proxy-pdf?url=${encodeURIComponent(url)}`);
          if (response.ok) {
            const attachmentBuffer = await response.arrayBuffer();
            const attachmentPdf = await PDFDocument.load(attachmentBuffer);
            const copiedPages = await pdfDoc.copyPages(attachmentPdf, attachmentPdf.getPageIndices());
            copiedPages.forEach((page) => pdfDoc.addPage(page));
          }
        } catch (err) {
          console.error("Failed to append PDF:", url, err);
        }
      }
      
      // 5. Save and Download
      const pdfBytes = await pdfDoc.save();
      const finalBlob = new Blob([pdfBytes as any], { type: 'application/pdf' });
      const url = URL.createObjectURL(finalBlob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `${t.pdfFilenamePrefix}${quote.client_name?.replace(/\s+/g, '_') || t.official}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success(t.toastGeneratedPdfSuccess, { id: toastId });
    } catch (e) {
      console.error(e);
      toast.error(t.toastGeneratedPdfError, { id: toastId });
    }
  }

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-white">
      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
        <Zap className="w-12 h-12 text-[#009CFF]" />
      </motion.div>
      <p className="mt-4 font-semibold text-slate-400">{t.loading}</p>
    </div>
  )
  
  if (!quote) return <div className="h-screen flex items-center justify-center bg-white">{t.notFound}</div>

  return (
    <div className="min-h-screen font-sans text-slate-800 pb-20 overflow-hidden relative selection:bg-[#009CFF] selection:text-white bg-[#F4F7FA] print:bg-white print:pb-0">
      
      {/* MAIN BACKGROUND - Pastel Digital Illustration Style */}
      <div className="fixed inset-0 z-0 pointer-events-none print:hidden bg-white">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-50 saturate-[1.5] contrast-[1.1] blur-[2px]" 
          style={{ backgroundImage: "url('/alex-assets/Wallpaper-1.jpeg')" }} 
        />
        {/* Heavy pastel white gradient overlay to wash it out nicely */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/30 via-white/60 to-[#F4F7FA]" />
      </div>

      {/* ======================= COVER SCREEN ======================= */}
      <div 
        className={`fixed inset-0 z-50 flex flex-col items-center justify-center px-6 transition-all duration-1000 bg-white/90 backdrop-blur-2xl print:relative print:block print:h-auto print:bg-white print:page-break-after-always print:z-0 ${hasOpened ? 'opacity-0 pointer-events-none translate-y-[-10%]' : 'opacity-100'}`}
      >
        {/* Wrapping Paper Background Elements (Animated & more opaque) */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none print:hidden flex items-center justify-center z-0">
          <motion.img animate={{ y: [0, -15, 0] }} transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }} src="/alex-assets/Image-2.png" alt="Deco" className="absolute top-[10%] left-[15%] w-32 md:w-48 opacity-15 -rotate-12" />
          <motion.img animate={{ y: [0, 20, 0] }} transition={{ repeat: Infinity, duration: 7, ease: "easeInOut" }} src="/alex-assets/Image-4.png" alt="Deco" className="absolute top-[15%] right-[20%] w-40 md:w-56 opacity-15 rotate-12" />
          <motion.img animate={{ x: [0, -20, 0] }} transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }} src="/alex-assets/Image-5.png" alt="Deco" className="absolute bottom-[20%] left-[25%] w-36 md:w-52 opacity-15 rotate-45" />
          <motion.img animate={{ y: [0, -25, 0], rotate: [-45, -35, -45] }} transition={{ repeat: Infinity, duration: 9, ease: "easeInOut" }} src="/alex-assets/Image-7.png" alt="Deco" className="absolute top-[50%] left-[5%] w-24 md:w-32 opacity-15 -rotate-45" />
          <motion.img animate={{ y: [0, 15, 0], rotate: [90, 100, 90] }} transition={{ repeat: Infinity, duration: 7.5, ease: "easeInOut" }} src="/alex-assets/Image-8.png" alt="Deco" className="absolute bottom-[30%] right-[30%] w-28 md:w-40 opacity-15 rotate-90" />
          <motion.img animate={{ x: [0, 20, 0] }} transition={{ repeat: Infinity, duration: 8.5, ease: "easeInOut" }} src="/alex-assets/Image-10.png" alt="Deco" className="absolute top-[60%] right-[10%] w-32 md:w-48 opacity-15 rotate-180" />
        </div>

        {/* Adornments (Dog) huge on the right, overflowing screen so it doesn't cover text */}
        <div className="absolute bottom-0 -right-20 md:-right-32 lg:-right-48 hidden md:block w-[28rem] lg:w-[40rem] xl:w-[50rem] opacity-100 origin-bottom pointer-events-none z-10">
          <img src="/alex-assets/Image-12.png" alt="Perrito" className="w-full h-auto drop-shadow-xl" />
        </div>

        <div className="text-center max-w-4xl print:py-20 relative z-20 w-full">
          {quote.agencies?.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={quote.agencies.logo_url} alt="Agency" className="h-24 md:h-32 object-contain drop-shadow-sm mx-auto mb-10 print:h-24" />
          ) : (
            <div className="w-24 h-24 bg-gradient-to-br from-[#009CFF]/10 to-[#514690]/10 rounded-3xl mx-auto flex items-center justify-center mb-10 shadow-sm border border-slate-100 print:hidden">
              <Star className="w-12 h-12 text-[#514690]" />
            </div>
          )}
          
          <h1 className="text-5xl md:text-7xl font-bold text-slate-800 leading-tight tracking-tight mb-8">
            {t.coverTitle} <br />
            <span className="text-[#514690]">{quote.client_name}!</span>
          </h1>
          
          <p className="text-xl md:text-2xl font-medium text-slate-500 leading-relaxed mb-16 max-w-2xl mx-auto">
            {t.coverThankYou}
          </p>

          {/* Reveal Button with Cat */}
          <div className="relative inline-block mx-auto mt-4">
             {/* Cat paw above button (z-30) */}
             <div className="absolute -left-28 md:-left-36 -top-6 md:-top-8 w-40 md:w-48 hidden md:block pointer-events-none z-30">
               <img src="/alex-assets/Image-13.png" alt="Gatito" className="w-full h-auto drop-shadow-md" />
             </div>
             
             <button
               onClick={() => setHasOpened(true)}
               className="print:hidden bg-white text-[#514690] hover:bg-[#F4F7FA] border border-slate-200 px-10 py-5 rounded-full font-bold text-xl flex items-center shadow-sm transition-all hover:scale-105 active:scale-95 group relative z-10"
             >
               <motion.div animate={{ rotate: [0, -15, 15, -15, 15, 0] }} transition={{ repeat: Infinity, duration: 1.5, repeatDelay: 1 }} className="mr-3 text-[#009CFF]">
                 <Gift className="w-6 h-6" />
               </motion.div>
               {t.revealButton}
             </button>
          </div>
        </div>
      </div>

      {/* ======================= MAIN CAROUSEL CONTENT ======================= */}
      <div 
        className={`relative z-10 w-full mx-auto px-0 pt-6 transition-all duration-1000 print:block print:w-full print:opacity-100 print:scale-100 print:translate-y-0 ${hasOpened ? 'opacity-100 scale-100 translate-y-0 delay-300' : 'opacity-0 scale-95 translate-y-10 pointer-events-none'}`}
      >
        
        {/* Top Navbar */}
        <nav className="h-16 flex items-center justify-between sticky top-0 z-50 px-6 max-w-7xl mx-auto print:hidden">
          <button onClick={() => router.push('/proposals')} className="flex items-center text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors bg-white/80 backdrop-blur-md rounded-full px-4 py-2 shadow-sm border border-slate-100">
            <ChevronLeft className="w-4 h-4 mr-1" />
            {t.back}
          </button>

          <button onClick={generateAndDownloadPDF} className="flex items-center text-sm font-semibold text-slate-500 hover:text-[#009CFF] transition-colors bg-white/80 backdrop-blur-md rounded-full px-4 py-2 shadow-sm border border-slate-100">
            <Download className="w-4 h-4 mr-2" />
            {t.downloadPdf}
          </button>
        </nav>

        {/* Swipe Indicator (Animated) */}
        <div className="max-w-7xl mx-auto px-6 mt-4 mb-4 flex justify-center z-20 relative print:hidden">
          <div className="flex items-center space-x-2 text-slate-400 font-bold text-sm tracking-widest uppercase">
            <span>{t.swipeText}</span>
            <motion.div
              animate={{ x: [0, 8, 0] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
            >
              <ArrowRight className="w-4 h-4" />
            </motion.div>
          </div>
        </div>

        {/* Horizontal Scroll Carousel (Turns vertical on Print) */}
        <div 
          className="w-full flex overflow-x-auto snap-x snap-mandatory scroll-smooth pb-10 hide-scrollbar print:block print:overflow-visible print:pb-0"
          ref={carouselRef}
          onScroll={handleScroll}
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {groupedProposals.map((group: any, idx: number) => {
            const isSelected = group.options.some((o: any) => selectedModules[o.originalIdx]);
            const isMulti = group.options.length > 1;
            const prop = group.options[0]; // For generic fields like carrier if not multi

            return (
              <div key={idx} className="slide-container min-w-full w-full shrink-0 snap-center px-4 md:px-12 xl:px-32 flex justify-center pt-2 print:block print:w-full print:px-0 print:mb-16 print:break-inside-avoid">
                <div 
                  className={`w-full max-w-5xl bg-white rounded-3xl overflow-hidden transition-all duration-300 border print:border-slate-300 print:shadow-none print:rounded-lg ${isSelected ? 'border-slate-200 shadow-xl shadow-slate-200/50' : 'border-slate-100 shadow-sm opacity-60 grayscale-[0.2] scale-[0.98] print:opacity-100 print:grayscale-0 print:scale-100'}`}
                >
                  
                  {/* 1. Elegant Header */}
                  <div className={`p-8 md:p-12 flex flex-col md:flex-row md:items-start justify-between gap-6 border-b border-slate-100 print:border-slate-200 ${isSelected ? 'bg-gradient-to-br from-white to-slate-50/50 print:bg-white' : 'bg-white'}`}>
                    
                    <div className="flex-1">
                      <div className="flex items-end mb-4 gap-3">
                        {!isMulti && prop.carrier ? (
                          <img 
                            src={(carriersMap[prop.carrier]?.trim() ? carriersMap[prop.carrier] : getCarrierLogo(prop.carrier)) || ""} 
                            alt={prop.carrier}
                            className="h-10 md:h-12 object-contain mix-blend-multiply opacity-80 print:opacity-100"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                              (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                            }}
                          />
                        ) : null}
                        {!isMulti && prop.carrier && (
                          <span className="hidden text-sm font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">
                            {prop.carrier}
                          </span>
                        )}
                      </div>
                      
                      <h2 className="text-3xl md:text-4xl font-bold text-slate-800 tracking-tight leading-tight">
                        {group.product}
                      </h2>
                      {group.options[0]?.description && (
                        <p className="text-slate-500 mt-2 text-lg whitespace-pre-wrap max-w-3xl">
                          {group.options[0].description}
                        </p>
                      )}
                    </div>

                    {/* Price Block (Clean typography) */}
                    <div className="flex-1 flex flex-col md:items-end text-left md:text-right mt-4 md:mt-0 gap-6">
                      {group.options.map((opt: any, optIdx: number) => (
                        <div key={optIdx} className="w-full flex flex-col md:items-end">
                          {opt.is_bundled ? (
                            <div className="bg-[#514690]/5 text-[#514690] px-5 py-2 rounded-full font-bold text-sm tracking-widest border border-[#514690]/10">
                              {t.includedInBundle}
                            </div>
                          ) : (
                            <div className="flex flex-col md:items-end w-full">
                              {isMulti && (
                                <div className="flex items-center justify-end w-full mb-2 gap-2">
                                  <span className="bg-slate-100 px-3 py-1 rounded-md text-xs font-bold text-slate-500 uppercase tracking-widest">
                                    {lang === 'es' ? 'Opción' : 'Option'} {optIdx + 1}
                                  </span>
                                  {opt.carrier && (
                                    <div className="flex items-center gap-2">
                                      {(carriersMap[opt.carrier]?.trim() || opt.carrierLogo) && (
                                        <img 
                                          src={carriersMap[opt.carrier]?.trim() ? carriersMap[opt.carrier] : (opt.carrierLogo?.startsWith('http') ? opt.carrierLogo : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/logos/${opt.carrierLogo}`)} 
                                          alt={opt.carrier}
                                          className="h-8 object-contain mix-blend-multiply opacity-80"
                                          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                        />
                                      )}
                                      <span className="text-sm font-bold text-[#514690] uppercase tracking-widest">{opt.carrier}</span>
                                    </div>
                                  )}
                                </div>
                              )}
                              <div className="flex items-baseline text-slate-800">
                                <span className="text-2xl font-semibold mr-1 text-slate-400">$</span>
                                <span className="font-bold text-4xl md:text-5xl tracking-tight">
                                  {Number(opt.premium).toLocaleString('en-US')}
                                </span>
                              </div>
                              <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest mt-1 mb-4">{t.payInFull}</span>
                              
                              {opt.monthly_payment && (
                                <div className="text-sm font-semibold text-slate-500 flex flex-col md:items-end gap-1">
                                  <div className="flex items-center md:justify-end gap-2">
                                    <span>{t.or}</span>
                                    <span className="font-bold text-[#009CFF]">${opt.monthly_payment}</span>
                                    <span>{t.perMonth}</span>
                                  </div>
                                  {Number(opt.downpayment || 0) > 0 && (
                                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{t.downpayment}{Number(opt.downpayment).toLocaleString('en-US')}</span>
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 2. Structured Features Grid with Alex AI Colors */}
                  <div className="p-8 md:p-12">
                  
                    {/* Centered Legend */}
                    <div className="text-center mb-10 text-sm md:text-base font-bold text-[#009CFF] uppercase tracking-widest bg-[#009CFF]/5 py-4 rounded-xl border border-[#009CFF]/10">
                      {t.preparedExclusivelyFor} {quote.client_name}
                    </div>

                    <div className={`flex flex-col ${isMulti ? 'xl:flex-row gap-8 xl:gap-12' : 'gap-12'}`}>
                      {group.options.map((opt: any, optIdx: number) => (
                        <div key={optIdx} className="flex-1 bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-100">
                          {isMulti && (
                            <h3 className="text-xl font-black text-slate-800 mb-8 pb-4 border-b-2 border-slate-100 flex items-center justify-between">
                              <span>{lang === 'es' ? 'Opción' : 'Option'} {optIdx + 1}</span>
                              {opt.carrier && <span className="text-sm font-bold text-[#514690] uppercase tracking-widest">{opt.carrier}</span>}
                            </h3>
                          )}

                          {/* Coverages */}
                          {opt.coverages && (
                            <div className="mb-12">
                              <h4 className="text-xs font-bold text-[#009CFF] uppercase tracking-widest mb-6 flex items-center">
                                <Shield className="w-4 h-4 mr-2" /> {t.coveragesTitle}
                              </h4>
                              
                              <div className="relative overflow-hidden bg-gradient-to-br from-[#009CFF] via-[#008AE6] to-[#005B99] rounded-2xl p-5 shadow-lg text-white">
                                <div className="relative z-10 flex flex-col gap-3">
                                  {opt.coverages.split('|').map((cov: string, i: number) => {
                                    const parts = cov.split(':');
                                    const name = parts[0];
                                    const value = parts.slice(1).join(':').trim();
                                    
                                    return (
                                      <div key={i} className="flex flex-col lg:flex-row lg:items-center justify-between bg-white/10 border border-white/20 rounded-xl p-4 shadow-sm">
                                        <div className="flex items-center lg:w-[50%] mb-2 lg:mb-0">
                                          <span className="font-bold text-white text-sm leading-tight">{name.trim()}</span>
                                        </div>
                                        <div className="lg:w-[50%] lg:text-right">
                                          <span className="font-black text-white text-base drop-shadow-sm">
                                            {value || t.includedTitle}
                                          </span>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>
                          )}
                          
                          {/* Included */}
                          {opt.included && (
                            <div className="mb-10">
                              <h4 className="text-xs font-bold text-emerald-500 uppercase tracking-widest mb-6 flex items-center">
                                <CheckCircle2 className="w-4 h-4 mr-2" /> {t.includedTitle}
                              </h4>
                              <div className="flex flex-col gap-3">
                                {opt.included.split('|').map((inc: string, i: number) => (
                                  <div key={i} className="flex items-start p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                                    <div className="text-emerald-500 mt-0.5 mr-3">
                                      <CheckCircle2 className="w-4 h-4" />
                                    </div>
                                    <span className="text-emerald-700 font-semibold text-sm leading-relaxed">{inc.trim()}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Excluded */}
                          {opt.excluded && (
                            <div className="mb-4">
                              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center">
                                <X className="w-4 h-4 mr-2" /> {t.excludedTitle}
                              </h4>
                              <div className="bg-slate-50 border border-dashed border-slate-200 rounded-xl p-5">
                                <ul className="space-y-3">
                                  {opt.excluded.split('|').map((exc: string, i: number) => (
                                    <li key={i} className="flex items-start text-slate-500 text-sm font-medium">
                                      <X className="w-4 h-4 mr-3 text-slate-300 shrink-0 mt-0.5" />
                                      <span className="leading-relaxed">{exc.trim()}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          )}

                        </div>
                      ))}
                    </div>
                    
                    {/* Action Buttons (Hidden on print) */}
                    <div className="mt-12 flex flex-col xl:flex-row gap-6 print:hidden">
                      {group.options.map((opt: any, optIdx: number) => {
                        const isOptSelected = selectedModules[opt.originalIdx];
                        return (
                          <button
                            key={optIdx}
                            disabled={quote.status === 'ACCEPTED'}
                            onClick={() => {
                              const next = [...selectedModules];
                              // Deselect all others in this group
                              group.options.forEach((o: any) => {
                                if (o.originalIdx !== opt.originalIdx) next[o.originalIdx] = false;
                              });
                              // Toggle this one
                              next[opt.originalIdx] = !next[opt.originalIdx];
                              setSelectedModules(next);
                            }}
                            className={`flex-1 relative rounded-2xl p-5 flex items-center justify-between transition-all duration-300 border-2 ${isOptSelected ? 'bg-white border-[#009CFF]/30 text-slate-800 shadow-sm' : 'bg-white border-slate-200 text-slate-400 hover:border-slate-300 hover:bg-slate-50'}`}
                          >
                            <div className="flex items-center">
                              <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center mr-4 transition-colors ${isOptSelected ? 'border-[#009CFF] bg-[#009CFF] text-white' : 'border-slate-300 bg-transparent'}`}>
                                {isOptSelected && <Check className="w-5 h-5 font-bold" />}
                              </div>
                              <span className="font-bold text-lg">
                                {isOptSelected ? t.activeModule : (isMulti ? (lang === 'es' ? `Elegir Opción ${optIdx + 1}` : `Choose Option ${optIdx + 1}`) : t.addModule)}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>

                  </div>
                </div>
              </div>
            )
          })}
          
          {/* ======================= THE SUMMARY SLIDE ======================= */}
          <div className="slide-container min-w-full w-full shrink-0 snap-center px-4 md:px-12 xl:px-32 flex justify-center items-start pt-2 print:block print:w-full print:px-0 print:page-break-before-always">
              <div 
               className="w-full max-w-5xl bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-xl shadow-slate-200 flex flex-col p-8 md:p-14 print:shadow-none print:border-0 print:p-0"
             >
                <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-12 border-b border-slate-100 pb-8 print:border-slate-300">
                  <div className="flex-1 text-left">
                    <h2 className="text-4xl font-bold text-slate-800 tracking-tight mb-4 flex items-center">
                      <ListChecks className="w-8 h-8 mr-4 text-[#514690]" /> {t.summaryTitle}
                    </h2>
                    <p className="text-lg font-medium text-slate-500 max-w-xl">{t.summaryDesc}</p>
                  </div>
                  <div className="hidden md:block w-48 h-48 lg:w-64 lg:h-64 relative shrink-0 print:hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src="/alex-assets/Image-5.png" 
                      alt="Agent and Client Connection" 
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>

                {/* Centered Legend */}
                <div className="text-center mb-10 text-sm md:text-base font-bold text-[#009CFF] uppercase tracking-widest bg-[#009CFF]/5 py-4 rounded-xl border border-[#009CFF]/10">
                  {t.preparedExclusivelyFor} {quote.client_name}
                </div>

                {quote.status === 'ACCEPTED' ? (
                  <div className="bg-emerald-50 rounded-2xl p-10 text-emerald-700 border border-emerald-100 text-center max-w-xl mx-auto w-full">
                    <CheckCircle2 className="w-16 h-16 mx-auto mb-4 text-emerald-500" />
                    <h2 className="text-3xl font-bold tracking-tight">{t.processedSuccess}</h2>
                    <p className="font-medium mt-2">{t.processedDesc}</p>
                    
                    <button 
                      onClick={generateAndDownloadPDF}
                      className="mt-6 mx-auto bg-white border border-emerald-200 text-emerald-600 hover:bg-emerald-100 px-6 py-3 rounded-xl font-bold flex items-center justify-center transition-colors print:hidden"
                    >
                      <Download className="w-5 h-5 mr-2" />
                      {t.downloadPdf}
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col lg:flex-row gap-16 w-full">
                    {/* Selected Policies Breakdown */}
                    <div className="flex-1">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">
                        {t.costBreakdown}
                      </h4>
                      <div className="space-y-4">
                        {groupedProposals.map((group: any, idx: number) => {
                          const selectedOpt = group.options.find((o: any) => selectedModules[o.originalIdx]);
                          if (!selectedOpt) return null;
                          return (
                            <div key={idx} className="flex justify-between items-center bg-slate-50 p-5 rounded-xl border border-slate-100 print:bg-white print:border-slate-200">
                              <div>
                                <h5 className="font-bold text-slate-800 text-lg">{group.product}</h5>
                                {selectedOpt.carrier && (
                                  <div className="flex items-center gap-2 mt-1">
                                    {(carriersMap[selectedOpt.carrier]?.trim() || selectedOpt.carrierLogo) && (
                                      <img 
                                        src={carriersMap[selectedOpt.carrier]?.trim() ? carriersMap[selectedOpt.carrier] : (selectedOpt.carrierLogo.startsWith('http') ? selectedOpt.carrierLogo : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/logos/${selectedOpt.carrierLogo}`)} 
                                        alt={selectedOpt.carrier}
                                        className="h-8 object-contain mix-blend-multiply opacity-80"
                                        onError={(e) => {
                                          (e.target as HTMLImageElement).style.display = 'none';
                                        }}
                                      />
                                    )}
                                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{selectedOpt.carrier}</p>
                                  </div>
                                )}
                              </div>
                              <div className="text-right">
                                <p className="font-bold text-[#514690] text-xl">${Number(selectedOpt.premium).toLocaleString('en-US')}</p>
                                {Number(selectedOpt.downpayment || 0) > 0 && (
                                  <p className="text-[10px] font-semibold text-slate-400 mt-1 uppercase tracking-wider">{t.downpayment}{Number(selectedOpt.downpayment).toLocaleString('en-US')}</p>
                                )}
                              </div>
                            </div>
                          )
                        })}
                        {selectedModules.every(v => !v) && (
                          <div className="text-center p-8 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 font-semibold text-sm">
                            {t.noPoliciesSelected}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Final Checkout Bar */}
                    <div className="flex-1 flex flex-col justify-start">
                      <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm flex flex-col relative print:border-none print:shadow-none print:p-0">
                        
                        <p className="text-slate-500 font-bold text-xs tracking-widest uppercase mb-4 text-left">{t.totalInvestment}</p>
                        <div className="flex items-baseline text-left mb-8">
                          <span className="text-3xl font-bold text-slate-400 mr-1">$</span>
                          <p className="text-6xl font-bold text-[#514690] tracking-tight">
                            {packageTotal.premium.toLocaleString('en-US')}
                          </p>
                        </div>
                        
                        {packageTotal.monthly > 0 && (
                          <div className="bg-slate-50 rounded-xl p-5 border border-slate-100 flex flex-col items-start mb-8 print:border-slate-200 print:bg-white">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">{t.option2}</span>
                            <div className="flex items-baseline">
                              <span className="font-bold text-2xl text-slate-700">${packageTotal.monthly.toLocaleString('en-US')}</span>
                              <span className="text-xs font-semibold text-slate-400 ml-2 uppercase tracking-wider">{t.perMonth}</span>
                            </div>
                            {packageTotal.downpayment > 0 && (
                              <span className="text-xs font-medium text-slate-500 mt-2 bg-white px-3 py-1 rounded-md border border-slate-100">
                                {t.downpayment}{packageTotal.downpayment}
                              </span>
                            )}
                          </div>
                        )}
                        
                        <div className="flex flex-col gap-3 print:hidden">
                          <button 
                            onClick={handleAccept}
                            disabled={isAccepting || !selectedModules.some(Boolean)}
                            className="w-full bg-[#009CFF] hover:bg-[#008AE6] text-white px-8 py-5 rounded-2xl font-bold text-xl transition-all disabled:opacity-50 flex justify-center items-center shadow-md"
                          >
                            {isAccepting ? t.processing : t.acceptProposal}
                          </button>
                          
                          <div className="mt-8 pt-6 border-t border-slate-100 print:mt-12">
                            <p className="text-xs text-slate-400 text-justify leading-relaxed">
                              {t.disclaimer}
                            </p>
                          </div>
                          
                          <div className="mt-8 flex flex-col items-start print:hidden">
                            <p className="text-sm text-slate-500 mb-1">{lang === 'es' ? 'Atentamente,' : 'Sincerely,'}</p>
                            <p className={`${caveat.className} text-4xl text-[#009CFF] -rotate-2 transform`}>
                              Alex AI Insurtech Team
                            </p>
                          </div>
                          
                          <button 
                            onClick={generateAndDownloadPDF}
                            className="w-full bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 px-8 py-4 rounded-2xl font-bold transition-all flex justify-center items-center"
                          >
                            <Download className="w-5 h-5 mr-2 text-slate-400" />
                            {t.downloadPdf}
                          </button>
                        </div>
                        
                      </div>
                    </div>
                  </div>
                )}
             </div>
          </div>

        </div>
      </div>

    </div>
  )
}
