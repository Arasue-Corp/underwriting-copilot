"use client"

import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Building2, Activity, CheckCircle2, AlertCircle, XCircle, Search, ChevronDown, ListFilter, FileText } from "lucide-react"
import { QuoteModal } from "@/components/appetite/QuoteModal"

type CarrierData = {
  id: number
  carrier_name: string
  industry_name: string
  product_line: string
  status: string
  conditions: string | null
  min_premium: number | null
  max_limits: number | null
  general_prohibited_operations?: string[] | null
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
      className={`${className} object-contain bg-white rounded-full p-1 shadow-sm`}
      onError={() => setErrorCount(prev => prev + 1)}
    />
  );
};

export function MarketNexus({ 
  data, 
  language 
}: { 
  data: CarrierData[], 
  language: 'en' | 'es' 
}) {
  const [groupBy, setGroupBy] = useState<'carrier' | 'industry'>('carrier');
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedDetail, setSelectedDetail] = useState<CarrierData | null>(null);
  const [showQuoteModal, setShowQuoteModal] = useState(false);

  // Compute unique sets and map
  const { groupedByCarrier, groupedByIndustry } = useMemo(() => {
    const byCarrier: Record<string, { total: number, eligible: CarrierData[], restricted: CarrierData[], prohibited: CarrierData[] }> = {};
    const byIndustry: Record<string, { total: number, eligible: CarrierData[], restricted: CarrierData[], prohibited: CarrierData[] }> = {};

    // Deduplicate data by industry+carrier (similar to before, keeping the most restrictive if duplicates)
    const map = new Map<string, CarrierData>();
    data.forEach(d => {
      const key = `${d.industry_name}::${d.carrier_name}`;
      const current = map.get(key);
      if (!current) {
        map.set(key, d);
      } else {
        if (d.status === 'PROHIBITED') map.set(key, d);
        else if (d.status === 'RESTRICTED' && current.status === 'ELIGIBLE') map.set(key, d);
      }
    });

    Array.from(map.values()).forEach(d => {
      if (!byCarrier[d.carrier_name]) {
        byCarrier[d.carrier_name] = { total: 0, eligible: [], restricted: [], prohibited: [] };
      }
      if (!byIndustry[d.industry_name]) {
        byIndustry[d.industry_name] = { total: 0, eligible: [], restricted: [], prohibited: [] };
      }

      byCarrier[d.carrier_name].total++;
      byIndustry[d.industry_name].total++;

      if (d.status === 'ELIGIBLE') {
        byCarrier[d.carrier_name].eligible.push(d);
        byIndustry[d.industry_name].eligible.push(d);
      } else if (d.status === 'RESTRICTED') {
        byCarrier[d.carrier_name].restricted.push(d);
        byIndustry[d.industry_name].restricted.push(d);
      } else if (d.status === 'PROHIBITED') {
        byCarrier[d.carrier_name].prohibited.push(d);
        byIndustry[d.industry_name].prohibited.push(d);
      }
    });

    return { groupedByCarrier: byCarrier, groupedByIndustry: byIndustry };
  }, [data]);

  const getStatusColor = (status: string) => {
    if (status === 'ELIGIBLE') return '#10b981'; // emerald-500
    if (status === 'RESTRICTED') return '#f59e0b'; // amber-500
    if (status === 'PROHIBITED') return '#ef4444'; // red-500
    return '#64748b';
  }

  const currentGroups = groupBy === 'carrier' ? groupedByCarrier : groupedByIndustry;
  
  const filteredKeys = Object.keys(currentGroups).filter(key => 
    key.toLowerCase().includes(searchQuery.toLowerCase())
  ).sort();

  return (
    <div className="flex flex-col gap-4">
      {/* Controls Header */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center bg-background/50 backdrop-blur-md p-4 rounded-2xl border border-border/50 shadow-sm">
        
        {/* Toggle Grouping */}
        <div className="flex p-1 bg-muted/50 rounded-xl w-full md:w-auto">
          <button
            onClick={() => { setGroupBy('carrier'); setExpandedId(null); }}
            className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              groupBy === 'carrier' 
                ? 'bg-background shadow-sm text-foreground' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Building2 className="w-4 h-4" />
            {language === 'es' ? 'Aseguradoras' : 'Carriers'}
          </button>
          <button
            onClick={() => { setGroupBy('industry'); setExpandedId(null); }}
            className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              groupBy === 'industry' 
                ? 'bg-background shadow-sm text-foreground' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Activity className="w-4 h-4" />
            {language === 'es' ? 'Industrias' : 'Industries'}
          </button>
        </div>

        {/* Search */}
        <div className="w-full md:flex-1 md:max-w-md relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder={language === 'es' 
              ? (groupBy === 'carrier' ? 'Buscar aseguradora...' : 'Buscar industria...') 
              : (groupBy === 'carrier' ? 'Search carrier...' : 'Search industry...')
            }
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-background border border-border/50 rounded-xl py-2 pl-9 pr-4 text-sm outline-none focus:border-primary/50 transition-colors"
          />
        </div>
      </div>

      {/* Directory List */}
      <div className="flex flex-col gap-3">
        {filteredKeys.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <ListFilter className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p>{language === 'es' ? 'No se encontraron resultados' : 'No results found'}</p>
          </div>
        )}

        {filteredKeys.map(key => {
          const groupData = currentGroups[key];
          const isExpanded = expandedId === key;

          return (
            <motion.div 
              key={key}
              layout
              className={`bg-background/60 backdrop-blur-md border rounded-2xl overflow-hidden transition-colors ${
                isExpanded ? 'border-primary/50 shadow-lg' : 'border-border/50 hover:border-border'
              }`}
            >
              {/* Accordion Header */}
              <button 
                onClick={() => setExpandedId(isExpanded ? null : key)}
                className="w-full flex items-center justify-between p-4 sm:p-5 text-left"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 shrink-0 flex items-center justify-center bg-white rounded-full p-1.5 shadow-sm border border-border/50">
                    {groupBy === 'carrier' ? (
                      <CarrierLogo carrierName={key} className="w-full h-full" />
                    ) : (
                      <Activity className="w-6 h-6 text-primary" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-playfair text-lg font-bold leading-tight line-clamp-1">{key}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {groupData.total} {language === 'es' ? 'productos' : 'products'}
                    </p>
                  </div>
                </div>

                {/* Summary Badges */}
                <div className="flex items-center gap-2 sm:gap-4 shrink-0 ml-4">
                  <div className="flex items-center gap-1.5 sm:gap-3 mr-1 sm:mr-4">
                    <span className="flex items-center gap-1 text-xs sm:text-sm font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 sm:px-2 py-1 rounded-md">
                      <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4"/> {groupData.eligible.length}
                    </span>
                    <span className="flex items-center gap-1 text-xs sm:text-sm font-bold text-amber-600 dark:text-amber-500 bg-amber-500/10 px-1.5 sm:px-2 py-1 rounded-md">
                      <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4"/> {groupData.restricted.length}
                    </span>
                    <span className="flex items-center gap-1 text-xs sm:text-sm font-bold text-rose-600 dark:text-rose-400 bg-rose-500/10 px-1.5 sm:px-2 py-1 rounded-md">
                      <XCircle className="w-3 h-3 sm:w-4 sm:h-4"/> {groupData.prohibited.length}
                    </span>
                  </div>
                  <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                </div>
              </button>

              {/* Accordion Content */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="border-t border-border/50 bg-black/5 dark:bg-white/5"
                  >
                    <div className="p-4 sm:p-5 flex flex-col gap-6">
                      
                      {/* Eligible Section */}
                      {groupData.eligible.length > 0 && (
                        <div>
                          <h4 className="flex items-center gap-2 text-sm font-bold text-emerald-600 dark:text-emerald-400 mb-3 uppercase tracking-widest">
                            <CheckCircle2 className="w-4 h-4" /> {language === 'es' ? 'Elegible' : 'Eligible'}
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {groupData.eligible.map((item, idx) => (
                              <button 
                                key={idx}
                                onClick={() => setSelectedDetail(item)}
                                className="text-left px-3 py-1.5 bg-background border border-border/50 rounded-lg text-sm hover:border-emerald-500/50 hover:shadow-sm transition-all shadow-sm"
                              >
                                {groupBy === 'carrier' ? item.industry_name : item.carrier_name}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Restricted Section */}
                      {groupData.restricted.length > 0 && (
                        <div>
                          <h4 className="flex items-center gap-2 text-sm font-bold text-amber-600 dark:text-amber-500 mb-3 uppercase tracking-widest">
                            <AlertCircle className="w-4 h-4" /> {language === 'es' ? 'Restringido' : 'Restricted'}
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {groupData.restricted.map((item, idx) => (
                              <button 
                                key={idx}
                                onClick={() => setSelectedDetail(item)}
                                className="text-left px-3 py-1.5 bg-background border border-border/50 rounded-lg text-sm hover:border-amber-500/50 hover:shadow-sm transition-all shadow-sm"
                              >
                                {groupBy === 'carrier' ? item.industry_name : item.carrier_name}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Prohibited Section */}
                      {groupData.prohibited.length > 0 && (
                        <div>
                          <h4 className="flex items-center gap-2 text-sm font-bold text-rose-600 dark:text-rose-400 mb-3 uppercase tracking-widest">
                            <XCircle className="w-4 h-4" /> {language === 'es' ? 'Prohibido' : 'Prohibited'}
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {groupData.prohibited.map((item, idx) => (
                              <button 
                                key={idx}
                                onClick={() => setSelectedDetail(item)}
                                className="text-left px-3 py-1.5 bg-background border border-border/50 rounded-lg text-sm hover:border-rose-500/50 hover:shadow-sm transition-all shadow-sm"
                              >
                                {groupBy === 'carrier' ? item.industry_name : item.carrier_name}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )
        })}
      </div>

      {/* Detail Popover Modal */}
      <AnimatePresence>
        {selectedDetail && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm" onClick={() => setSelectedDetail(null)}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-lg bg-background/95 backdrop-blur-3xl p-6 rounded-[2rem] border shadow-2xl"
              style={{ borderColor: getStatusColor(selectedDetail.status) }}
            >
              <button 
                onClick={() => setSelectedDetail(null)}
                className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground bg-muted/50 rounded-full"
              >
                <XCircle className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-4 mb-6 pr-8">
                <CarrierLogo carrierName={selectedDetail.carrier_name} className="w-12 h-12 bg-white" />
                <div>
                  <h4 className="font-playfair text-xl font-bold">{selectedDetail.carrier_name}</h4>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest leading-tight mt-1 line-clamp-2">
                    {selectedDetail.industry_name}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 mb-4 bg-muted/20 p-2 rounded-xl inline-flex">
                 {selectedDetail.status === 'ELIGIBLE' && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
                 {selectedDetail.status === 'RESTRICTED' && <AlertCircle className="w-5 h-5 text-amber-500" />}
                 {selectedDetail.status === 'PROHIBITED' && <XCircle className="w-5 h-5 text-red-500" />}
                 
                 <span className="font-bold text-sm tracking-widest uppercase pr-2" style={{ color: getStatusColor(selectedDetail.status) }}>
                   {selectedDetail.status === 'ELIGIBLE' && (language === 'es' ? 'ELEGIBLE' : 'ELIGIBLE')}
                   {selectedDetail.status === 'RESTRICTED' && (language === 'es' ? 'RESTRINGIDO' : 'RESTRICTED')}
                   {selectedDetail.status === 'PROHIBITED' && (language === 'es' ? 'PROHIBIDO' : 'PROHIBITED')}
                 </span>
              </div>

              <div className="bg-muted/30 p-4 rounded-xl text-sm leading-relaxed mb-4 max-h-[150px] overflow-y-auto custom-scrollbar">
                <span className="block text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">
                  {language === 'es' ? 'Condiciones Específicas' : 'Specific Conditions'}
                </span>
                {selectedDetail.conditions || (language === 'es' ? 'Sin condiciones especiales detalladas.' : 'No detailed special conditions.')}
              </div>

              {selectedDetail.general_prohibited_operations && selectedDetail.general_prohibited_operations.length > 0 && (
                <div className="bg-rose-500/5 border border-rose-500/20 p-4 rounded-xl text-sm leading-relaxed mb-4">
                  <span className="block text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-widest mb-2">
                    {language === 'es' ? 'Operaciones Prohibidas (General)' : 'General Prohibited Operations'}
                  </span>
                  <ul className="list-disc pl-4 text-foreground/90 space-y-1">
                    {selectedDetail.general_prohibited_operations.map((op, i) => (
                      <li key={i}>{op}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex gap-4 mb-6">
                <div className="flex-1 bg-background/50 p-3 rounded-xl border border-border/50 text-center">
                  <span className="block text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">
                    {language === 'es' ? 'Prima Mínima' : 'Min Premium'}
                  </span>
                  <span className={`font-semibold ${!selectedDetail.min_premium ? 'text-muted-foreground/60 text-xs' : ''}`}>
                    {selectedDetail.min_premium ? `$${selectedDetail.min_premium.toLocaleString()}` : (language === 'es' ? 'Según riesgo' : 'Varies by risk')}
                  </span>
                </div>
                <div className="flex-1 bg-background/50 p-3 rounded-xl border border-border/50 text-center">
                  <span className="block text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">
                    {language === 'es' ? 'Límites Max' : 'Max Limits'}
                  </span>
                  <span className={`font-semibold ${!selectedDetail.max_limits ? 'text-muted-foreground/60 text-xs' : ''}`}>
                    {selectedDetail.max_limits ? `$${selectedDetail.max_limits.toLocaleString()}` : (language === 'es' ? 'Sujeto a evaluación' : 'Subject to eval')}
                  </span>
                </div>
              </div>

              <button 
                onClick={() => setShowQuoteModal(true)}
                className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-colors shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
              >
                <FileText className="w-5 h-5" />
                {language === 'es' ? 'Solicitar Cotización' : 'Request Quote'}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <QuoteModal 
        isOpen={showQuoteModal} 
        onClose={() => setShowQuoteModal(false)} 
        rule={selectedDetail} 
      />
    </div>
  )
}
