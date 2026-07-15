"use client"

import React, { useState, useEffect } from "react"
import { Search, Building2, BarChart3, Globe, Filter, CheckCircle2, XCircle, AlertCircle, FileText, LayoutGrid, ChevronRight, ArrowLeft } from "lucide-react"
import { getAppetiteMatrix } from "@/app/actions/appetite_matrix"

type ViewType = 'industry_finder' | 'carrier_analysis' | 'market_matrix'

export default function AppetiteBIDashboard() {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeView, setActiveView] = useState<ViewType>('industry_finder')
  
  // Crossed Filters
  const [searchIndustry, setSearchIndustry] = useState("")
  const [searchProduct, setSearchProduct] = useState("")
  const [searchCarrier, setSearchCarrier] = useState("")
  const [language, setLanguage] = useState<'es' | 'en'>('es')

  // Master-Detail active selection
  const [selectedIndustry, setSelectedIndustry] = useState<string | null>(null)
  const [selectedCarrier, setSelectedCarrier] = useState<string | null>(null)
  
  // Mobile specific state to track if we are in "detail" view
  const [isMobileDetailView, setIsMobileDetailView] = useState(false)
  
  // Accordion state for grouped industries
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null)

  // Mobile filters toggle
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  
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
    if (sortedIndustries.length > 0 && !selectedIndustry) {
      setSelectedIndustry(sortedIndustries[0])
    }
    if (sortedCarriers.length > 0 && !selectedCarrier) {
      setSelectedCarrier(sortedCarriers[0])
    }
  }, [sortedIndustries, sortedCarriers, selectedIndustry, selectedCarrier])

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
    if (status === 'ELIGIBLE') return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold tracking-wide uppercase"><CheckCircle2 className="w-3.5 h-3.5" /> {t.eligible}</span>
    if (status === 'PROHIBITED') return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-rose-100 text-rose-800 border border-rose-200 text-xs font-bold tracking-wide uppercase"><XCircle className="w-3.5 h-3.5" /> {t.prohibited}</span>
    return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-amber-100 text-amber-800 border border-amber-200 text-xs font-bold tracking-wide uppercase"><AlertCircle className="w-3.5 h-3.5" /> {t.restricted}</span>
  }

  return (
    <div className="flex-1 p-4 md:p-8 pt-6 space-y-6 max-w-[1600px] mx-auto w-full bg-slate-50 min-h-screen text-slate-900">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in duration-500">
        <div>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight flex items-center gap-3 text-slate-900">
            <BarChart3 className="h-8 w-8 text-primary" />
            {t.title}
          </h2>
          <p className="text-slate-500 mt-2 max-w-2xl text-sm md:text-base font-medium">
            {t.desc}
          </p>
        </div>
        
        <div className="flex items-center bg-white border border-slate-200 p-1 rounded-lg shrink-0 shadow-sm">
          <button 
            onClick={() => setLanguage('es')}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${language === 'es' ? 'bg-slate-100 shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-900'}`}
          >
            🇪🇸 ESP
          </button>
          <button 
            onClick={() => setLanguage('en')}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${language === 'en' ? 'bg-slate-100 shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-900'}`}
          >
            🇺🇸 ENG
          </button>
        </div>
      </div>

      {/* CROSS FILTERS */}
      <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-5 animate-in fade-in duration-700">
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
            <Search className="absolute left-3 top-3.5 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
            <input 
              placeholder={t.searchInd}
              value={searchIndustry}
              onChange={(e) => setSearchIndustry(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
            />
          </div>
          <div className="relative group">
            <FileText className="absolute left-3 top-3.5 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
            <input 
              placeholder={t.searchProd}
              value={searchProduct}
              onChange={(e) => setSearchProduct(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
            />
          </div>
          <div className="relative group">
            <Building2 className="absolute left-3 top-3.5 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
            <input 
              placeholder={t.searchCarr}
              value={searchCarrier}
              onChange={(e) => setSearchCarrier(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
            />
          </div>
        </div>
      </div>

      {/* VIEWS NAVIGATION */}
      <div className="flex overflow-x-auto border-b border-slate-200 hide-scrollbar bg-white rounded-t-xl px-2 pt-2">
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
          
          {/* VIEW A: INDUSTRY FINDER (Master-Detail) */}
          {activeView === 'industry_finder' && (
            <div className="flex flex-col lg:flex-row gap-6">
              {/* MASTER LIST (Sidebar) */}
              <div className={`w-full lg:w-1/3 xl:w-1/4 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm flex flex-col lg:h-[600px] ${isMobileDetailView ? 'hidden lg:flex' : 'flex'}`}>
                <div className="bg-slate-50 p-4 border-b border-slate-200">
                  <h3 className="font-bold text-slate-700">{language === 'es' ? 'Industrias Disponibles' : 'Available Industries'}</h3>
                  <p className="text-xs text-slate-500 mt-1">{sortedIndustries.length} resultados</p>
                </div>
                <div className="overflow-y-auto flex-1 p-2 space-y-2 max-h-[400px] lg:max-h-full">
                  {sortedCategories.map(category => {
                    const industriesInCat = industryCategories[category]
                    const isExpanded = expandedCategory === category
                    const isSelectedInside = industriesInCat.includes(selectedIndustry || '')
                    
                    return (
                      <div key={category} className="border border-slate-100 rounded-lg overflow-hidden bg-white">
                        <button
                          onClick={() => setExpandedCategory(isExpanded ? null : category)}
                          className={`w-full text-left px-4 py-3 text-sm font-bold transition-colors flex items-center justify-between ${
                            isSelectedInside ? 'bg-primary/5 text-primary' : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          <span className="truncate pr-2">{category} <span className="text-slate-400 font-normal ml-1">({industriesInCat.length})</span></span>
                          <ChevronRight className={`w-4 h-4 shrink-0 transition-transform ${isExpanded ? 'rotate-90 text-primary' : 'text-slate-400'}`} />
                        </button>
                        
                        {isExpanded && (
                          <div className="bg-white border-t border-slate-100 divide-y divide-slate-50">
                            {industriesInCat.map(industry => (
                              <button
                                key={industry}
                                onClick={() => { setSelectedIndustry(industry); setIsMobileDetailView(true); }}
                                className={`w-full text-left px-4 py-2.5 text-xs font-medium transition-colors flex items-center justify-between pl-6 ${
                                  selectedIndustry === industry 
                                  ? 'bg-primary/10 text-primary' 
                                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                }`}
                              >
                                <span className="truncate pr-2">{industry}</span>
                                <ChevronRight className={`w-3.5 h-3.5 shrink-0 ${selectedIndustry === industry ? 'text-primary' : 'opacity-0'}`} />
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* DETAIL VIEW */}
              <div className={`w-full lg:w-2/3 xl:w-3/4 ${!isMobileDetailView ? 'hidden lg:block' : 'block'}`}>
                {selectedIndustry && groupedByIndustry[selectedIndustry] ? (
                  <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 lg:p-8">
                    {/* Mobile Back Button */}
                    <button 
                      onClick={() => setIsMobileDetailView(false)}
                      className="lg:hidden flex items-center gap-2 text-sm font-semibold text-primary mb-6 hover:underline"
                    >
                      <ArrowLeft className="w-4 h-4" /> {language === 'es' ? 'Volver a Industrias' : 'Back to Industries'}
                    </button>
                    
                    <h3 className="text-2xl font-extrabold flex items-center gap-3 pb-4 border-b border-slate-100 text-slate-900 mb-6">
                      <span className="bg-primary/10 text-primary p-2 rounded-lg">
                        <Search className="w-5 h-5" />
                      </span>
                      {selectedIndustry}
                    </h3>
                    
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                      {groupedByIndustry[selectedIndustry].map((r: any) => (
                        <div key={r.id} className="border border-slate-200 rounded-xl p-5 hover:border-slate-300 transition-colors bg-slate-50/50">
                          <div className="flex justify-between items-start mb-4 gap-4">
                            <div>
                              <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{r.carrier_name}</div>
                              <div className="font-bold text-lg text-slate-900">{r.product_line}</div>
                            </div>
                            <div className="shrink-0">{renderStatusBadge(r.status)}</div>
                          </div>
                          
                          <div className="bg-white rounded-lg p-4 mb-4 border border-slate-100 shadow-sm max-h-48 overflow-y-auto">
                            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">{t.conditions}</h4>
                            <p className="text-sm leading-relaxed whitespace-pre-wrap break-words text-slate-700">
                              {r.conditions || <span className="italic text-slate-400">No specific conditions.</span>}
                            </p>
                          </div>
                          
                          <div className="flex flex-wrap gap-4 text-sm bg-white border border-slate-100 rounded-lg p-4 shadow-sm">
                            <div className="flex-1 min-w-[120px]">
                              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{t.minPrem}</span>
                              <span className="font-semibold text-slate-900">{r.min_premium ? `$${r.min_premium.toLocaleString()}` : '-'}</span>
                            </div>
                            <div className="flex-1 min-w-[120px]">
                              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{t.limits}</span>
                              <span className="font-semibold text-slate-900">{r.max_limits ? `$${r.max_limits.toLocaleString()}` : '-'}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-slate-500 h-full flex items-center justify-center">
                    Selecciona una industria de la lista para ver sus detalles.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* VIEW B: CARRIER ANALYSIS (Master-Detail) */}
          {activeView === 'carrier_analysis' && (
            <div className="flex flex-col lg:flex-row gap-6">
              {/* MASTER LIST (Sidebar) */}
              <div className={`w-full lg:w-1/4 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm flex flex-col lg:h-[600px] ${isMobileDetailView ? 'hidden lg:flex' : 'flex'}`}>
                <div className="bg-slate-50 p-4 border-b border-slate-200">
                  <h3 className="font-bold text-slate-700">{language === 'es' ? 'Aseguradoras' : 'Carriers'}</h3>
                  <p className="text-xs text-slate-500 mt-1">{sortedCarriers.length} resultados</p>
                </div>
                <div className="overflow-y-auto flex-1 p-2 space-y-1 max-h-[400px] lg:max-h-full">
                  {sortedCarriers.map(carrier => (
                    <button
                      key={carrier}
                      onClick={() => { setSelectedCarrier(carrier); setIsMobileDetailView(true); }}
                      className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-between ${
                        selectedCarrier === carrier 
                        ? 'bg-primary/10 text-primary' 
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      <span className="truncate pr-2 font-semibold">{carrier}</span>
                      <ChevronRight className={`w-4 h-4 shrink-0 ${selectedCarrier === carrier ? 'text-primary' : 'text-slate-300'}`} />
                    </button>
                  ))}
                </div>
              </div>

              {/* DETAIL VIEW */}
              <div className={`w-full lg:w-3/4 ${!isMobileDetailView ? 'hidden lg:block' : 'block'}`}>
                {selectedCarrier && groupedByCarrier[selectedCarrier] ? (
                  <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                    {/* Mobile Back Button */}
                    <div className="lg:hidden p-4 bg-slate-50 border-b border-slate-200">
                      <button 
                        onClick={() => setIsMobileDetailView(false)}
                        className="flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
                      >
                        <ArrowLeft className="w-4 h-4" /> {language === 'es' ? 'Volver a Aseguradoras' : 'Back to Carriers'}
                      </button>
                    </div>

                    <div className="bg-slate-50 px-6 py-6 border-b border-slate-200 flex items-center gap-3">
                      <Building2 className="w-7 h-7 text-primary" />
                      <h3 className="font-extrabold text-2xl text-slate-900">{selectedCarrier}</h3>
                    </div>
                    
                    <div className="divide-y divide-slate-100">
                      {Object.entries(groupedByCarrier[selectedCarrier]).map(([product, records]) => {
                        const typedRecords = records as any[]
                        const eligible = typedRecords.filter(r => r.status === 'ELIGIBLE' || r.status === 'RESTRICTED')
                        const prohibited = typedRecords.filter(r => r.status === 'PROHIBITED')
                        
                        return (
                          <div key={product} className="p-6 lg:p-8">
                            <h4 className="text-xl font-bold mb-6 flex items-center gap-2 text-slate-800">
                              <span className="p-1.5 bg-slate-100 rounded-md border border-slate-200"><FileText className="w-5 h-5 text-slate-600" /></span>
                              {product}
                            </h4>
                            
                            {/* General Prohibited Operations Box */}
                            {typedRecords[0]?.general_prohibited_operations?.length > 0 && (
                              <div className="mb-8 bg-amber-50 border border-amber-200 rounded-xl p-5 shadow-sm animate-in fade-in duration-500">
                                <h5 className="text-sm font-bold text-amber-800 uppercase tracking-widest flex items-center gap-2 pb-3 mb-3 border-b border-amber-200/50">
                                  <AlertCircle className="w-5 h-5" /> 
                                  {language === 'es' ? 'Restricciones Generales del Producto' : 'General Product Restrictions'}
                                </h5>
                                <ul className="list-disc pl-5 space-y-2 text-sm text-amber-900/80">
                                  {typedRecords[0].general_prohibited_operations.map((op: string, idx: number) => (
                                    <li key={idx} className="leading-relaxed font-medium">{op}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            
                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                              {/* Eligible Column */}
                              <div className="space-y-4">
                                <h5 className="text-xs font-bold text-emerald-600 uppercase tracking-widest flex items-center gap-2 pb-2 border-b border-emerald-100">
                                  <CheckCircle2 className="w-4 h-4" /> 
                                  {language === 'es' ? 'Apetito Objetivo' : 'Target Appetite'}
                                </h5>
                                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                                  {eligible.length > 0 ? eligible.map(r => (
                                    <div key={r.id} className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-4">
                                      <div className="font-bold text-sm mb-2 text-slate-900">{r.industry_name}</div>
                                      <p className="text-sm text-slate-600 whitespace-pre-wrap break-words leading-relaxed">
                                        {r.conditions || 'Sin condiciones específicas.'}
                                      </p>
                                      {(r.min_premium || r.max_limits) && (
                                        <div className="mt-3 pt-3 border-t border-emerald-100 flex gap-4 text-[10px] font-bold text-emerald-700 uppercase tracking-wider">
                                          {r.min_premium && <span>Min: ${r.min_premium.toLocaleString()}</span>}
                                          {r.max_limits && <span>Max: ${r.max_limits.toLocaleString()}</span>}
                                        </div>
                                      )}
                                    </div>
                                  )) : (
                                    <div className="text-sm text-slate-400 italic p-4 bg-slate-50 rounded-lg border border-slate-100">Ninguna clase objetivo especificada.</div>
                                  )}
                                </div>
                              </div>
                              
                              {/* Prohibited Column */}
                              <div className="space-y-4">
                                <h5 className="text-xs font-bold text-rose-600 uppercase tracking-widest flex items-center gap-2 pb-2 border-b border-rose-100">
                                  <XCircle className="w-4 h-4" /> 
                                  {language === 'es' ? 'Fuera de Apetito' : 'Out of Appetite'}
                                </h5>
                                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                                  {prohibited.length > 0 ? prohibited.map(r => (
                                    <div key={r.id} className="bg-rose-50/50 border border-rose-100 rounded-xl p-4">
                                      <div className="font-bold text-sm mb-2 text-slate-900">{r.industry_name}</div>
                                      {r.conditions && (
                                        <p className="text-sm text-slate-600 whitespace-pre-wrap break-words leading-relaxed">
                                          {r.conditions}
                                        </p>
                                      )}
                                    </div>
                                  )) : (
                                    <div className="text-sm text-slate-400 italic p-4 bg-slate-50 rounded-lg border border-slate-100">Ninguna clase prohibida especificada.</div>
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
                  <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-slate-500 h-full flex items-center justify-center">
                    Selecciona una aseguradora de la lista para ver sus detalles.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* VIEW C: MARKET MATRIX */}
          {activeView === 'market_matrix' && (
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden w-full shadow-sm animate-in fade-in duration-500">
              <div className="bg-slate-50 px-6 py-5 border-b border-slate-200">
                <h3 className="font-bold text-lg text-slate-900">{language === 'es' ? 'Matriz Global (Aseguradora vs Industria)' : 'Global Matrix (Carrier vs Industry)'}</h3>
                <p className="text-xs text-slate-500 mt-1 font-medium">
                  {language === 'es' ? 'Solo muestra datos según los filtros aplicados arriba.' : 'Only showing data matching the filters above.'}
                </p>
              </div>
              <div className="overflow-x-auto w-full max-h-[700px]">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-100 border-b border-slate-200 sticky top-0 z-20 shadow-sm">
                    <tr>
                      <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-widest sticky left-0 bg-slate-100 z-30 w-64 shadow-[1px_0_0_0_theme(colors.slate.200)]">
                        {language === 'es' ? 'Industria' : 'Industry'}
                      </th>
                      {allCarriers.map(carrier => (
                        <th key={carrier} className="px-6 py-4 font-bold min-w-[200px] text-slate-700">
                          {carrier}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {allIndustries.map(industry => (
                      <tr key={industry} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 font-semibold text-slate-800 sticky left-0 bg-white group-hover:bg-slate-50 z-10 shadow-[1px_0_0_0_theme(colors.slate.100)]">
                          {industry}
                        </td>
                        {allCarriers.map(carrier => {
                          const records = filteredData.filter(r => r.industry_name === industry && r.carrier_name === carrier)
                          return (
                            <td key={`${industry}-${carrier}`} className="px-6 py-4">
                              {records.length > 0 ? (
                                <div className="space-y-2">
                                  {records.map(r => (
                                    <div key={r.id} className="flex flex-col gap-1 p-2 rounded bg-slate-50 border border-slate-100">
                                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{r.product_line}</div>
                                      <div>{renderStatusBadge(r.status)}</div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-slate-300 font-bold block text-center">-</span>
                              )}
                            </td>
                          )
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  )
}
