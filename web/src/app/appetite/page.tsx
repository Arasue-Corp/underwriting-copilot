"use client"

import React, { useState, useEffect } from "react"
import { Search, Building2, BarChart3, Globe, Filter, CheckCircle2, XCircle, AlertCircle, FileText, LayoutGrid, ChevronRight, ArrowLeft, Crosshair } from "lucide-react"
import { 
  FaHelmetSafety, FaComputer, FaWrench, FaIndustry, FaStore, 
  FaUserDoctor, FaTruckFast, FaBoltLightning, FaShieldHalved, 
  FaGraduationCap, FaUtensils, FaPaintRoller, FaUserTie, 
  FaLeaf, FaSuitcase, FaBroom, FaShop, FaPlane, FaHotel, FaCar, FaCubes 
} from "react-icons/fa6"
import { useLanguage } from "@/components/language-provider"
import { getAppetiteMatrix } from "@/app/actions/appetite_matrix"
import { AppetiteRadar } from "@/components/dashboard/AppetiteRadar"
import { AppetiteSwipeStack } from "@/components/dashboard/AppetiteSwipeStack"
import { MarketNexus } from "@/components/dashboard/MarketNexus"
import { QuoteModal } from "@/components/appetite/QuoteModal"

const getCategoryIcon = (category: string) => {
  const c = category.toLowerCase()
  if (c.includes('construc') || c.includes('contratist') || c.includes('montaje') || c.includes('ingenier')) return <FaHelmetSafety className="w-8 h-8" />
  if (c.includes('tecno') || c.includes('sistem') || c.includes('informát') || c.includes('comput')) return <FaComputer className="w-8 h-8" />
  if (c.includes('servic') || c.includes('repara') || c.includes('mantenim') || c.includes('instal') || c.includes('mecánic')) return <FaWrench className="w-8 h-8" />
  if (c.includes('fabrica') || c.includes('industr') || c.includes('operac') || c.includes('manufactur') || c.includes('producc')) return <FaIndustry className="w-8 h-8" />
  if (c.includes('comercio') || c.includes('distribui') || c.includes('minorista') || c.includes('mayorista')) return <FaStore className="w-8 h-8" />
  if (c.includes('tiend') || c.includes('retail')) return <FaShop className="w-8 h-8" />
  if (c.includes('salud') || c.includes('médic') || c.includes('clinic') || c.includes('hospit')) return <FaUserDoctor className="w-8 h-8" />
  if (c.includes('transpor') || c.includes('logístic') || c.includes('envío') || c.includes('mudanza')) return <FaTruckFast className="w-8 h-8" />
  if (c.includes('vehícul') || c.includes('auto')) return <FaCar className="w-8 h-8" />
  if (c.includes('energ') || c.includes('eléctric') || c.includes('luz')) return <FaBoltLightning className="w-8 h-8" />
  if (c.includes('seguridad') || c.includes('protec') || c.includes('vigilan')) return <FaShieldHalved className="w-8 h-8" />
  if (c.includes('educa') || c.includes('escuel') || c.includes('colegio') || c.includes('univers')) return <FaGraduationCap className="w-8 h-8" />
  if (c.includes('aliment') || c.includes('restauran') || c.includes('bebida') || c.includes('bar') || c.includes('comida')) return <FaUtensils className="w-8 h-8" />
  if (c.includes('decorador') || c.includes('pintor')) return <FaPaintRoller className="w-8 h-8" /> 
  if (c.includes('profesion') || c.includes('consultor') || c.includes('asesor') || c.includes('abogad')) return <FaUserTie className="w-8 h-8" />
  if (c.includes('inspector') || c.includes('auditor')) return <FaSuitcase className="w-8 h-8" />
  if (c.includes('limpia') || c.includes('aseo')) return <FaBroom className="w-8 h-8" />
  if (c.includes('agro') || c.includes('agrícol') || c.includes('granja') || c.includes('natur')) return <FaLeaf className="w-8 h-8" />
  if (c.includes('hotel') || c.includes('hospedaj') || c.includes('motel')) return <FaHotel className="w-8 h-8" />
  if (c.includes('avia') || c.includes('aero')) return <FaPlane className="w-8 h-8" />
  
  return <FaCubes className="w-8 h-8" />
}

const CarrierLogo = ({ carrierName, className = "w-6 h-6" }: { carrierName: string, className?: string }) => {
  const [errorCount, setErrorCount] = useState(0);
  
  const knownLogos = [
    "aegis", "alchemy", "amtrust", "annex", "aspire", "assurance-america", "attune", 
    "berxi", "biberk", "blitz", "bristol-west", "chubb", "clearcover", "colonial", 
    "commonwealth", "coterie", "covercube", "coverwhale", "cowbell", "crosscover", 
    "employers", "epremium", "ergo-next", "first", "foremost", "foxquilt", 
    "great-american", "greenshield", "hanover", "hippo", "hiscox", "homeowners", 
    "insur-fi", "isc", "just", "kanguro", "kelly", "kemper", "lio", "mgt", 
    "neptune", "nirvana", "novo", "palomar", "pathpoint", "pouch", "propeller", 
    "rainbow", "rli-surety", "rli", "ses", "simply", "skywatch", "slice", 
    "steadily", "stonegate", "thimble", "three", "tokiomarine", "vacant-express", 
    "warrior"
  ];

  const normalized = carrierName.toLowerCase().replace(/[^a-z0-9]/g, '-');
  const matchedSlug = knownLogos.find(slug => normalized.includes(slug)) || normalized.replace(/-+/g, '-').replace(/^-|-$/g, '');

  const possiblePaths = [
    `/logos/logo-${matchedSlug}.png`,
    `/logos/logo-${matchedSlug}.jpg`,
    `/logos/Carrier-${matchedSlug}.png`,
    `/logos/Carrier-${matchedSlug}.jpg`,
    `/logos/carrier-${matchedSlug}.png`,
    `/logos/carrier-${matchedSlug}.jpg`,
    `/logos/${matchedSlug}.png`,
    `/logos/${matchedSlug}.jpg`,
  ];

  if (errorCount >= possiblePaths.length) {
    return <Building2 className={className} />;
  }

  return (
    <img 
      src={possiblePaths[errorCount]} 
      alt={`${carrierName} logo`} 
      className={`${className} object-contain bg-white rounded-lg p-1.5 shadow-sm`}
      onError={() => setErrorCount(prev => prev + 1)}
    />
  );
};

type ViewType = 'industry_finder' | 'carrier_analysis' | 'market_matrix'

export default function AppetiteBIDashboard() {
  const language = useLanguage()
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeView, setActiveView] = useState<ViewType>('industry_finder')
  
  // Crossed Filters
  const [searchIndustry, setSearchIndustry] = useState("")
  const [searchProduct, setSearchProduct] = useState("")
  const [searchCarrier, setSearchCarrier] = useState("")

  // Master-Detail active selection
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedIndustry, setSelectedIndustry] = useState<string | null>(null)
  const [selectedCarrier, setSelectedCarrier] = useState<string | null>(null)
  
  // Mobile specific state to track if we are in "detail" view
  const [isMobileDetailView, setIsMobileDetailView] = useState(false)
  
  // Accordion state for grouped industries
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null)

  // Mobile filters toggle
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  
  // Quote modal state
  const [quoteRule, setQuoteRule] = useState<any>(null)

  // Computed active filters count
  const activeFiltersCount = (searchIndustry ? 1 : 0) + (searchProduct ? 1 : 0) + (searchCarrier ? 1 : 0)

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      const matrixData = await getAppetiteMatrix()
      setData(matrixData || [])
      setLoading(false)
    }
    loadData()
  }, [])

  // 1. Cross-Filtering Logic
  const filteredData = data.filter(row => {
    const matchInd = searchIndustry === "" || row.industry_name?.toLowerCase().includes(searchIndustry.toLowerCase())
    const matchProd = searchProduct === "" || row.product_line?.toLowerCase().includes(searchProduct.toLowerCase())
    const matchCarr = searchCarrier === "" || row.carrier_name?.toLowerCase().includes(searchCarrier.toLowerCase())
    const matchLang = row.language === language
    
    return matchInd && matchProd && matchCarr && matchLang
  })

  // 2. Data Groupings for Views
  const groupedByIndustry = filteredData.reduce((acc, row) => {
    if (!acc[row.industry_name]) acc[row.industry_name] = []
    acc[row.industry_name].push(row)
    return acc
  }, {} as Record<string, any[]>)
  const sortedIndustries = Object.keys(groupedByIndustry).sort()

  // 2.1 Dynamic Category Grouping for Industries (e.g. "Contratistas", "Instalación")
  const getCategory = (name: string) => {
    if (!name) return 'Otros'
    let firstWord = name.split(/[\s-/]/)[0].replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ]/g, '').toLowerCase()
    if (firstWord.length <= 3) return 'Otros' // Ignore short words
    
    // Diccionario de normalización de plurales comunes en seguros/industrias
    const dictionary: Record<string, string> = {
      'servicios': 'servicio',
      'construcciones': 'construcción',
      'contratistas': 'contratista',
      'decoradores': 'decorador',
      'instaladores': 'instalador',
      'sistemas': 'sistema',
      'operaciones': 'operación',
      'fabricantes': 'fabricante',
      'reparaciones': 'reparación',
      'distribuidores': 'distribuidor',
      'limpiadores': 'limpiador',
      'inspectores': 'inspector',
      'consultores': 'consultor'
    }

    if (dictionary[firstWord]) {
      firstWord = dictionary[firstWord]
    } else {
      // Reglas básicas de terminaciones en español (fallback)
      if (firstWord.endsWith('iones')) firstWord = firstWord.slice(0, -5) + 'ión'
      else if (firstWord.endsWith('ces')) firstWord = firstWord.slice(0, -3) + 'z'
      else if (firstWord.endsWith('es') && firstWord.length > 5) firstWord = firstWord.slice(0, -2)
      else if (firstWord.endsWith('s') && firstWord.length > 4) firstWord = firstWord.slice(0, -1)
    }

    return firstWord.charAt(0).toUpperCase() + firstWord.slice(1)
  }

  const industryCategories = sortedIndustries.reduce((acc, ind) => {
    const cat = getCategory(ind)
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(ind)
    return acc
  }, {} as Record<string, string[]>)
  
  const sortedCategories = Object.keys(industryCategories).sort()

  const groupedByCarrier = filteredData.reduce((acc, row) => {
    if (!acc[row.carrier_name]) acc[row.carrier_name] = {}
    if (!acc[row.carrier_name][row.product_line]) acc[row.carrier_name][row.product_line] = []
    acc[row.carrier_name][row.product_line].push(row)
    return acc
  }, {} as Record<string, Record<string, any[]>>)
  const sortedCarriers = Object.keys(groupedByCarrier).sort()

  // Default selection
  useEffect(() => {
    if (sortedCarriers.length > 0 && !selectedCarrier) {
      setSelectedCarrier(sortedCarriers[0])
    }
  }, [sortedCarriers, selectedCarrier])

  // For Market Matrix: rows = Industry, cols = Carrier
  const allCarriers = Array.from(new Set(filteredData.map(r => r.carrier_name))).sort()
  const allIndustries = Array.from(new Set(filteredData.map(r => r.industry_name))).sort()

  const t = {
    title: language === 'es' ? 'Inteligencia de Mercado (BI)' : 'Market Intelligence (BI)',
    desc: language === 'es' 
      ? 'Analiza el apetito de riesgo del mercado. Cruza industrias, productos y aseguradoras para descubrir dónde colocar tus negocios.' 
      : 'Analyze market risk appetite. Cross-reference industries, products, and carriers to find placement options.',
    filters: language === 'es' ? 'Filtros Cruzados' : 'Cross Filters',
    searchInd: language === 'es' ? 'Buscar Industria (Ej. Construcción)' : 'Search Industry...',
    searchProd: language === 'es' ? 'Filtrar por Producto (Ej. Builder\'s Risk)' : 'Filter Product...',
    searchCarr: language === 'es' ? 'Filtrar Aseguradora (Ej. Cornerstone)' : 'Filter Carrier...',
    tab1: language === 'es' ? 'Buscador de Clases' : 'Class Finder',
    tab2: language === 'es' ? 'Análisis de Aseguradora' : 'Carrier Analysis',
    tab3: language === 'es' ? 'Matriz de Mercado' : 'Market Matrix',
    empty: language === 'es' ? 'No se encontraron datos para esta combinación de filtros.' : 'No data found for this filter combination.',
    carrier: language === 'es' ? 'Aseguradora' : 'Carrier',
    product: language === 'es' ? 'Producto' : 'Product',
    conditions: language === 'es' ? 'Condiciones de Suscripción' : 'Underwriting Conditions',
    limits: language === 'es' ? 'Límites' : 'Limits',
    minPrem: language === 'es' ? 'Prima Mínima' : 'Min Premium',
    eligible: language === 'es' ? 'Elegible' : 'Eligible',
    prohibited: language === 'es' ? 'Prohibido / Bloqueado' : 'Prohibited / Blocked',
    restricted: language === 'es' ? 'Restringido' : 'Restricted'
  }

  const renderStatusBadge = (status: string) => {
    if (status === 'ELIGIBLE') return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 text-xs font-bold tracking-wide uppercase"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span> {t.eligible}</span>
    if (status === 'PROHIBITED') return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-rose-600 dark:text-rose-400 bg-rose-500/10 border border-rose-500/20 text-xs font-bold tracking-wide uppercase"><span className="w-1.5 h-1.5 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]"></span> {t.prohibited}</span>
    return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-[#A65E44] bg-[#A65E44]/10 border border-[#A65E44]/20 text-xs font-bold tracking-wide uppercase"><span className="status-dot-copper"></span> {t.restricted}</span>
  }

  return (
    <div className="flex-1 p-4 md:p-8 pt-6 space-y-6 max-w-[1600px] mx-auto w-full min-h-screen">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in duration-500">
        <div>
          <h2 className="font-playfair text-3xl md:text-4xl font-extrabold tracking-tight flex items-center gap-3 text-foreground">
            <BarChart3 className="h-8 w-8 text-primary" />
            {t.title}
          </h2>
          <p className="text-muted-foreground mt-2 max-w-2xl text-sm md:text-base font-medium">
            {t.desc}
          </p>
        </div>
        
        <div className="flex gap-2">
          {/* Header language toggle removed since it's now global in sidebar */}
        </div>
      </div>

      {/* CROSS FILTERS */}
      <div className="glass-panel rounded-xl p-5 animate-in fade-in duration-700">
        <div 
          className="flex items-center justify-between cursor-pointer md:cursor-default"
          onClick={() => setShowMobileFilters(!showMobileFilters)}
        >
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <Filter className="w-4 h-4" />
            {t.filters}
            {activeFiltersCount > 0 && (
              <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full text-[10px] ml-1">
                {activeFiltersCount} activo(s)
              </span>
            )}
          </h3>
          <button className="md:hidden p-1 text-slate-400 hover:text-slate-600 transition-colors">
            <ChevronRight className={`w-4 h-4 transition-transform ${showMobileFilters ? 'rotate-90' : ''}`} />
          </button>
        </div>
        
        <div className={`mt-4 grid-cols-1 md:grid-cols-3 gap-4 md:grid ${showMobileFilters ? 'grid' : 'hidden'}`}>
          <div className="relative group">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <input 
              placeholder={t.searchInd}
              value={searchIndustry}
              onChange={(e) => setSearchIndustry(e.target.value)}
              className="w-full pl-10 glass-input"
            />
          </div>
          <div className="relative group">
            <FileText className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <input 
              placeholder={t.searchProd}
              value={searchProduct}
              onChange={(e) => setSearchProduct(e.target.value)}
              className="w-full pl-10 glass-input"
            />
          </div>
          <div className="relative group">
            <Building2 className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <input 
              placeholder={t.searchCarr}
              value={searchCarrier}
              onChange={(e) => setSearchCarrier(e.target.value)}
              className="w-full pl-10 glass-input"
            />
          </div>
        </div>
      </div>

      {/* VIEWS NAVIGATION */}
      <div className="flex overflow-x-auto border-b border-border/40 hide-scrollbar bg-card/40 backdrop-blur-xl rounded-t-xl px-2 pt-2">
        <button
          onClick={() => { setActiveView('industry_finder'); setIsMobileDetailView(false); }}
          className={`px-6 py-3 font-semibold text-sm transition-colors border-b-2 whitespace-nowrap flex items-center gap-2 ${
            activeView === 'industry_finder' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Search className="w-4 h-4" />
          {t.tab1}
        </button>
        <button
          onClick={() => { setActiveView('carrier_analysis'); setIsMobileDetailView(false); }}
          className={`px-6 py-3 font-semibold text-sm transition-colors border-b-2 whitespace-nowrap flex items-center gap-2 ${
            activeView === 'carrier_analysis' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Building2 className="w-4 h-4" />
          {t.tab2}
        </button>
        <button
          onClick={() => { setActiveView('market_matrix'); setIsMobileDetailView(false); }}
          className={`px-6 py-3 font-semibold text-sm transition-colors border-b-2 whitespace-nowrap flex items-center gap-2 ${
            activeView === 'market_matrix' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <LayoutGrid className="w-4 h-4" />
          {t.tab3}
        </button>
      </div>

      {/* CONTENT AREA */}
      {loading ? (
        <div className="py-20 text-center text-slate-500 flex flex-col items-center justify-center animate-pulse">
          <div className="w-10 h-10 border-4 border-slate-200 border-t-primary rounded-full animate-spin mb-4"></div>
          Cargando inteligencia de mercado...
        </div>
      ) : filteredData.length === 0 ? (
        <div className="py-24 text-center flex flex-col items-center justify-center bg-white border border-slate-200 border-dashed rounded-xl">
          <Globe className="h-12 w-12 text-slate-300 mb-4" />
          <p className="text-slate-500 text-lg font-medium">
            {t.empty}
          </p>
          <button 
            onClick={() => { setSearchIndustry(""); setSearchProduct(""); setSearchCarrier(""); }}
            className="mt-4 text-primary hover:underline text-sm font-semibold"
          >
            {language === 'es' ? 'Limpiar Filtros' : 'Clear Filters'}
          </button>
        </div>
      ) : (
        <div className="animate-in fade-in duration-500">
          {/* VIEW A: INDUSTRY FINDER */}
          {activeView === 'industry_finder' && (
            <div className="space-y-6">
               {!selectedCategory ? (
                 <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                   {sortedCategories.map((category, idx) => (
                     <button
                       key={category}
                       onClick={() => setSelectedCategory(category)}
                       className="glass-panel p-6 flex flex-col items-center justify-center text-center gap-4 hover:-translate-y-1 hover:shadow-lg transition-all animate-in fade-in zoom-in-95 duration-500 group"
                       style={{ animationDelay: `${idx * 50}ms` }}
                     >
                       <div className="p-4 rounded-full bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                         {getCategoryIcon(category)}
                       </div>
                       <div>
                         <h4 className="font-bold text-foreground text-sm">{category}</h4>
                         <p className="text-xs text-muted-foreground mt-1">{industryCategories[category].length} {language === 'es' ? 'industrias' : 'industries'}</p>
                       </div>
                     </button>
                   ))}
                 </div>
               ) : (
                 <div className="animate-in fade-in slide-in-from-right-8 duration-500">
                    <button 
                      onClick={() => { setSelectedCategory(null); setSelectedIndustry(null); }}
                      className="flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground mb-6 transition-colors"
                    >
                      <ArrowLeft className="w-4 h-4" /> {language === 'es' ? 'Volver a Categorías' : 'Back to Categories'}
                    </button>
                    
                    <div className="flex items-center gap-4 mb-8">
                       <div className="p-3 rounded-xl bg-primary/10 text-primary">
                         {getCategoryIcon(selectedCategory)}
                       </div>
                       <h2 className="font-playfair text-3xl md:text-4xl font-extrabold">{selectedCategory}</h2>
                    </div>

                    <div className="flex flex-col lg:flex-row gap-8">
                      {/* Sub-industries grid */}
                      <div className={`w-full lg:w-1/3 space-y-4 ${selectedIndustry ? 'hidden lg:block' : 'block'}`}>
                        <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-4">{language === 'es' ? 'Seleccionar Industria' : 'Select Industry'}</h3>
                        <div className="grid grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-4">
                          {industryCategories[selectedCategory].map((industry, idx) => {
                            const isLong = industry.length > 25;
                            return (
                              <button
                                 key={industry}
                                 onClick={() => setSelectedIndustry(industry)}
                                 className={`w-full p-5 rounded-[2rem] text-sm font-bold transition-all flex border animate-in fade-in zoom-in-95 duration-300 group
                                   ${isLong ? 'col-span-2 lg:col-span-1 xl:col-span-2 flex-row text-left items-center gap-5' : 'col-span-1 flex-col text-center items-center justify-center gap-4'}
                                   ${selectedIndustry === industry 
                                   ? 'bg-primary text-primary-foreground border-primary shadow-[0_0_20px_rgba(22,45,89,0.3)] scale-[1.02] dark:shadow-[0_0_20px_rgba(242,211,172,0.2)]' 
                                   : 'glass-panel border-border/50 text-foreground hover:bg-muted/50 hover:-translate-y-1 hover:shadow-lg'
                                 }`}
                                 style={{ animationDelay: `${Math.min(idx * 30, 300)}ms` }}
                              >
                                 <div className={`
                                   flex items-center justify-center rounded-full p-3 transition-transform shrink-0
                                   ${selectedIndustry === industry ? 'bg-primary-foreground/20 text-primary-foreground scale-110' : 'bg-primary/10 text-primary group-hover:scale-110'}
                                 `}>
                                   <div className="scale-75">
                                     {getCategoryIcon(selectedCategory)}
                                   </div>
                                 </div>
                                 <span className="leading-snug text-balance break-words">{industry}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Details (Radar / Stack View) */}
                      <div className={`w-full lg:w-2/3 ${selectedIndustry ? 'block' : 'hidden lg:block'}`}>
                         {selectedIndustry && groupedByIndustry[selectedIndustry] ? (
                            <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 w-full relative">
                               <div className="lg:hidden w-full mb-6">
                                 <button 
                                   onClick={() => setSelectedIndustry(null)}
                                   className="flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
                                 >
                                   <ArrowLeft className="w-4 h-4" /> {language === 'es' ? 'Volver a Industrias' : 'Back to Industries'}
                                 </button>
                               </div>
                               
                               {/* Mobile Swipe Stack */}
                               <div className="block md:hidden">
                                 <AppetiteSwipeStack 
                                   data={groupedByIndustry[selectedIndustry]} 
                                   language={language} 
                                 />
                               </div>

                               {/* Desktop Radar */}
                               <div className="hidden md:block">
                                 <AppetiteRadar 
                                   data={groupedByIndustry[selectedIndustry]} 
                                   industryName={selectedIndustry} 
                                   language={language} 
                                 />
                               </div>
                            </div>
                         ) : (
                            <div className="h-full flex flex-col items-center justify-center p-12 text-center glass-panel rounded-3xl border-dashed">
                              <Crosshair className="w-16 h-16 text-muted-foreground/30 mb-6" />
                              <h3 className="font-playfair text-2xl font-bold mb-2 text-muted-foreground">{language === 'es' ? 'Selecciona una Industria' : 'Select an Industry'}</h3>
                              <p className="text-muted-foreground max-w-sm">{language === 'es' ? 'Elige una industria a la izquierda para visualizar el mapa de apetito espacial de las aseguradoras.' : 'Choose an industry on the left to visualize the spatial appetite map of carriers.'}</p>
                            </div>
                         )}
                      </div>
                    </div>
                 </div>
               )}
            </div>
          )}

          {/* VIEW B: CARRIER ANALYSIS */}
          {activeView === 'carrier_analysis' && (
            <div className="space-y-8 relative pb-20">
              {/* Horizontal Carrier Scroller */}
              <div className="sticky top-[72px] z-40 -mx-4 px-4 md:mx-0 md:px-0 py-4 bg-background/90 backdrop-blur-xl border-b md:border-none border-border/40 md:bg-transparent flex overflow-x-auto gap-4 hide-scrollbar snap-x">
                {sortedCarriers.map((carrier) => {
                  const typedRecords = Object.values(groupedByCarrier[carrier] || {}).flat()
                  const total = typedRecords.length
                  const eligible = typedRecords.filter((r: any) => r.status === 'ELIGIBLE' || r.status === 'RESTRICTED').length
                  const percent = total > 0 ? Math.round((eligible / total) * 100) : 0
                  
                  return (
                    <button
                      key={carrier}
                      onClick={() => setSelectedCarrier(carrier)}
                      className={`min-w-[280px] snap-start text-left p-6 rounded-3xl transition-all border ${
                        selectedCarrier === carrier 
                        ? 'bg-primary text-primary-foreground border-primary shadow-xl scale-100' 
                        : 'glass-panel text-foreground hover:bg-muted/50 opacity-70 hover:opacity-100 hover:scale-[1.02]'
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-6">
                        <div className={`${selectedCarrier === carrier ? 'text-primary-foreground' : 'text-primary'}`}>
                          <CarrierLogo carrierName={carrier} className="w-12 h-12" />
                        </div>
                        <h4 className="font-bold text-lg">{carrier}</h4>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs font-semibold">
                          <span>{language === 'es' ? 'Apetito General' : 'General Appetite'}</span>
                          <span>{percent}%</span>
                        </div>
                        <div className={`h-2 w-full rounded-full overflow-hidden ${selectedCarrier === carrier ? 'bg-primary-foreground/20' : 'bg-muted'}`}>
                          <div className={`h-full rounded-full ${selectedCarrier === carrier ? 'bg-primary-foreground' : 'bg-emerald-500'}`} style={{ width: `${percent}%` }}></div>
                        </div>
                        <p className={`text-[10px] mt-1 font-medium ${selectedCarrier === carrier ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                          {eligible} {language === 'es' ? 'de' : 'of'} {total} {language === 'es' ? 'clases elegibles' : 'eligible classes'}
                        </p>
                      </div>
                    </button>
                  )
                })}
              </div>

              {/* Detail View */}
              {selectedCarrier && groupedByCarrier[selectedCarrier] ? (
                 <div className="animate-in fade-in slide-in-from-bottom-8 duration-500">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-8 pb-4 border-b border-border/50">
                       <div className="flex items-center gap-4">
                         <CarrierLogo carrierName={selectedCarrier} className="w-16 h-16 shrink-0" />
                         <h2 className="font-playfair text-4xl font-extrabold">{selectedCarrier}</h2>
                       </div>
                       <span className="px-3 py-1.5 bg-muted/50 rounded-full text-[10px] font-bold text-muted-foreground tracking-widest uppercase self-start sm:self-auto border border-border/50">
                         {language === 'es' ? 'Perfil de Apetito' : 'Appetite Profile'}
                       </span>
                    </div>

                    <div className="space-y-12">
                      {Object.entries(groupedByCarrier[selectedCarrier]).map(([product, records]) => {
                        const typedRecords = records as any[]
                        const eligible = typedRecords.filter(r => r.status === 'ELIGIBLE' || r.status === 'RESTRICTED')
                        const prohibited = typedRecords.filter(r => r.status === 'PROHIBITED')
                        
                        return (
                          <div key={product} className="glass-panel p-6 lg:p-10 rounded-[2rem]">
                            <h4 className="text-2xl font-bold mb-8 flex items-center gap-3">
                              <span className="p-2.5 bg-primary/10 text-primary rounded-xl"><FileText className="w-6 h-6" /></span>
                              {product}
                            </h4>

                            {typedRecords[0]?.general_prohibited_operations?.length > 0 && (
                              <div className="mb-10 bg-amber-500/10 border border-amber-500/30 rounded-2xl p-6 relative overflow-hidden">
                                <div className="absolute -top-4 -right-4 p-4 opacity-5">
                                  <AlertCircle className="w-32 h-32" />
                                </div>
                                <h5 className="text-sm font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest flex items-center gap-2 mb-5 relative z-10">
                                  <AlertCircle className="w-5 h-5" /> 
                                  {language === 'es' ? 'Restricciones Generales' : 'General Restrictions'}
                                </h5>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 relative z-10">
                                  {typedRecords[0].general_prohibited_operations.map((op: string, idx: number) => (
                                    <div key={idx} className="flex items-start gap-2.5">
                                      <XCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                                      <span className="text-sm font-medium text-foreground/90">{op}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                               {/* Target Cards */}
                               <div className="space-y-6">
                                 <div className="flex items-center gap-3 mb-6">
                                   <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                   </div>
                                   <h5 className="font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest text-sm">
                                      {language === 'es' ? 'Apetito Objetivo' : 'Target Appetite'}
                                   </h5>
                                 </div>
                                 <div className="grid grid-cols-1 gap-4">
                                    {eligible.map((r, idx) => (
                                      <div key={r.id} className="bg-card/50 border border-emerald-500/20 rounded-2xl p-6 hover:border-emerald-500/40 transition-colors animate-in fade-in slide-in-from-bottom-2 fill-mode-both" style={{ animationDelay: `${idx * 50}ms` }}>
                                        <div className="font-bold text-foreground mb-3 flex items-center justify-between gap-3">
                                          <div className="flex items-center gap-3">
                                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
                                            <span className="text-lg">{r.industry_name}</span>
                                          </div>
                                          <button 
                                            onClick={() => setQuoteRule(r)}
                                            className="px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 text-xs font-bold uppercase tracking-wider transition-colors border border-emerald-500/20"
                                          >
                                            {language === 'es' ? 'Cotizar' : 'Quote'}
                                          </button>
                                        </div>
                                        <p className="text-sm text-muted-foreground whitespace-pre-wrap break-words leading-relaxed mb-5">
                                          {r.conditions || 'Sin condiciones específicas.'}
                                        </p>
                                        {(r.min_premium || r.max_limits) && (
                                          <div className="flex flex-wrap gap-3 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider pt-4 border-t border-emerald-500/10">
                                            {r.min_premium && <span className="bg-emerald-500/10 px-2.5 py-1.5 rounded-lg border border-emerald-500/20">Min: ${r.min_premium.toLocaleString()}</span>}
                                            {r.max_limits && <span className="bg-emerald-500/10 px-2.5 py-1.5 rounded-lg border border-emerald-500/20">Max: ${r.max_limits.toLocaleString()}</span>}
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                    {eligible.length === 0 && (
                                       <div className="glass-panel border-dashed p-6 text-center text-sm text-muted-foreground rounded-2xl">
                                         {language === 'es' ? 'No hay clases objetivo especificadas.' : 'No target classes specified.'}
                                       </div>
                                    )}
                                 </div>
                               </div>

                               {/* Out of Appetite Cards */}
                               <div className="space-y-6">
                                 <div className="flex items-center gap-3 mb-6">
                                   <div className="w-10 h-10 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
                                      <XCircle className="w-5 h-5 text-rose-500" />
                                   </div>
                                   <h5 className="font-bold text-rose-600 dark:text-rose-400 uppercase tracking-widest text-sm">
                                      {language === 'es' ? 'Fuera de Apetito' : 'Out of Appetite'}
                                   </h5>
                                 </div>
                                 <div className="grid grid-cols-1 gap-4">
                                    {prohibited.map((r, idx) => (
                                      <div key={r.id} className="bg-card/50 border border-rose-500/20 rounded-2xl p-6 hover:border-rose-500/40 transition-colors animate-in fade-in slide-in-from-bottom-2 fill-mode-both" style={{ animationDelay: `${idx * 50}ms` }}>
                                        <div className="font-bold text-foreground mb-3 flex items-center gap-3">
                                          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]"></span>
                                          <span className="text-lg">{r.industry_name}</span>
                                        </div>
                                        {r.conditions && (
                                          <p className="text-sm text-muted-foreground whitespace-pre-wrap break-words leading-relaxed">
                                            {r.conditions}
                                          </p>
                                        )}
                                      </div>
                                    ))}
                                    {prohibited.length === 0 && (
                                       <div className="glass-panel border-dashed p-6 text-center text-sm text-muted-foreground rounded-2xl">
                                         {language === 'es' ? 'No hay clases prohibidas especificadas.' : 'No prohibited classes specified.'}
                                       </div>
                                    )}
                                 </div>
                               </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                 </div>
              ) : (
                 <div className="glass-panel border-dashed rounded-3xl p-16 text-center text-muted-foreground flex flex-col items-center justify-center">
                   <Building2 className="w-12 h-12 mb-4 opacity-20" />
                   <span className="text-lg font-medium">{language === 'es' ? 'Selecciona una aseguradora arriba para ver su perfil completo.' : 'Select a carrier above to view their full profile.'}</span>
                   <p className="text-sm mt-4 text-muted-foreground/70">
                     {language === 'es' 
                       ? 'Tip: Puedes subir los logos de las compañías añadiendo archivos PNG en public/logos/ (ej. public/logos/chubb.png).' 
                       : 'Tip: You can upload company logos by adding PNG files in public/logos/ (e.g. public/logos/chubb.png).'}
                   </p>
                 </div>
              )}
            </div>
          )}

          {/* VIEW C: MARKET NEXUS (NEURAL NETWORK) */}
          {activeView === 'market_matrix' && (
            <div className="animate-in fade-in duration-500">
              <MarketNexus data={filteredData} language={language} />
            </div>
          )}

        </div>
      )}

      <QuoteModal 
        isOpen={!!quoteRule} 
        onClose={() => setQuoteRule(null)} 
        rule={quoteRule} 
      />
    </div>
  )
}
