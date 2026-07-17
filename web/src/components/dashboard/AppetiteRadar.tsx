"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useState, useMemo } from "react"
import { Search, Building2, Crosshair, AlertCircle, CheckCircle2, FileText } from "lucide-react"
import { QuoteModal } from "@/components/appetite/QuoteModal"

type CarrierData = {
  id: number
  carrier_name: string
  product_line: string
  status: string
  conditions: string | null
  x?: number
  y?: number
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

export function AppetiteRadar({ 
  data, 
  industryName,
  language
}: { 
  data: CarrierData[], 
  industryName: string,
  language: 'en' | 'es'
}) {
  const [hoveredCarrier, setHoveredCarrier] = useState<CarrierData | null>(null);
  const [quoteCarrier, setQuoteCarrier] = useState<CarrierData | null>(null);

  // Distribute carriers on the radar rings
  const radarNodes = useMemo(() => {
    const eligible = data.filter(d => d.status === 'ELIGIBLE')
    const restricted = data.filter(d => d.status === 'RESTRICTED')
    const prohibited = data.filter(d => d.status === 'PROHIBITED')

    const getNodes = (group: CarrierData[], radius: number, offsetAngle = 0) => {
      const step = (2 * Math.PI) / (group.length || 1)
      return group.map((carrier, i) => {
        const angle = offsetAngle + (i * step)
        const x = Math.cos(angle) * radius
        const y = Math.sin(angle) * radius
        return { ...carrier, x, y, radius }
      })
    }

    return [
      ...getNodes(eligible, 120, 0),       // Inner Ring
      ...getNodes(restricted, 220, Math.PI / 4), // Middle Ring
      ...getNodes(prohibited, 320, Math.PI / 2)  // Outer Ring
    ]
  }, [data])

  return (
    <div className="relative w-full max-w-4xl mx-auto h-[700px] flex items-center justify-center overflow-hidden rounded-[3rem] glass-panel bg-black/5 dark:bg-black/20">
      
      {/* Radar Rings Background */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20 dark:opacity-40">
        <div className="absolute w-[240px] h-[240px] rounded-full border-2 border-emerald-500/50 border-dashed" />
        <div className="absolute w-[440px] h-[440px] rounded-full border-2 border-amber-500/30 border-dashed" />
        <div className="absolute w-[640px] h-[640px] rounded-full border-2 border-red-500/20 border-dashed" />
        
        {/* Crosshairs */}
        <div className="absolute w-full h-[1px] bg-foreground/10" />
        <div className="absolute h-full w-[1px] bg-foreground/10" />
      </div>

      {/* Center Target (The Industry) */}
      <motion.div 
        className="absolute z-30 flex flex-col items-center justify-center text-center p-6 bg-background/80 backdrop-blur-xl rounded-full border border-primary/20 shadow-[0_0_40px_rgba(22,45,89,0.3)] dark:shadow-[0_0_40px_rgba(242,211,172,0.1)] w-40 h-40"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", bounce: 0.5 }}
      >
        <Crosshair className="w-8 h-8 text-primary mb-2 opacity-80" />
        <span className="font-bold text-sm leading-tight text-foreground">{industryName}</span>
      </motion.div>

      {/* Orbiting Nodes */}
      <AnimatePresence>
        {radarNodes.map((node, i) => (
          <motion.div
            key={`${node.carrier_name}-${node.product_line}-${i}`}
            className="absolute z-40 cursor-pointer"
            initial={{ opacity: 0, x: 0, y: 0, scale: 0 }}
            animate={{ 
              opacity: 1, 
              x: node.x, 
              y: node.y, 
              scale: hoveredCarrier?.id === node.id ? 1.2 : 1 
            }}
            transition={{ 
              type: "spring", 
              stiffness: 50, 
              damping: 15,
              delay: i * 0.05 
            }}
            onMouseEnter={() => setHoveredCarrier(node)}
            onMouseLeave={() => setHoveredCarrier(null)}
          >
            {/* The Node visually */}
            <div className="relative group">
              {/* Pulsing glow for eligible */}
              {node.status === 'ELIGIBLE' && (
                <div className="absolute inset-0 rounded-full bg-emerald-500/30 blur-md animate-pulse" />
              )}
              
              <div className={`
                relative flex items-center justify-center w-12 h-12 rounded-full border-2 bg-white shadow-lg transition-colors
                ${node.status === 'ELIGIBLE' ? 'border-emerald-500' : ''}
                ${node.status === 'RESTRICTED' ? 'border-amber-500' : ''}
                ${node.status === 'PROHIBITED' ? 'border-red-500/50 opacity-60' : ''}
              `}>
                <CarrierLogo carrierName={node.carrier_name} className="w-8 h-8" />
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Laser Connection Line on Hover */}
      {hoveredCarrier && (
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-20">
          <motion.line 
            x1="50%" y1="50%" 
            x2={`calc(50% + ${hoveredCarrier.x}px)`} 
            y2={`calc(50% + ${hoveredCarrier.y}px)`}
            stroke={hoveredCarrier.status === 'ELIGIBLE' ? 'rgba(16,185,129,0.5)' : hoveredCarrier.status === 'RESTRICTED' ? 'rgba(245,158,11,0.5)' : 'rgba(239,68,68,0.3)'}
            strokeWidth="2"
            strokeDasharray="4 4"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
          />
        </svg>
      )}

      {/* Hover Info Panel */}
      <AnimatePresence>
        {hoveredCarrier && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50 glass-panel p-6 rounded-2xl w-[90%] max-w-md border-t-4"
            style={{ 
              borderTopColor: hoveredCarrier.status === 'ELIGIBLE' ? '#10b981' : hoveredCarrier.status === 'RESTRICTED' ? '#f59e0b' : '#ef4444' 
            }}
          >
            <div className="flex items-center gap-3 mb-2">
              {hoveredCarrier.status === 'ELIGIBLE' ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <AlertCircle className="w-5 h-5 text-amber-500" />}
              <h4 className="font-bold text-lg">{hoveredCarrier.carrier_name}</h4>
            </div>
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">
              {hoveredCarrier.product_line}
            </div>
            <p className="text-sm text-foreground/80 leading-relaxed mb-4">
              {hoveredCarrier.conditions || (language === 'es' ? 'Sin condiciones adicionales.' : 'No additional conditions.')}
            </p>
            
            <button
              onClick={() => setQuoteCarrier(hoveredCarrier)}
              className="w-full py-2 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-colors shadow-sm flex items-center justify-center gap-2"
            >
              <FileText className="w-4 h-4" />
              {language === 'es' ? 'Solicitar Cotización' : 'Request Quote'}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <QuoteModal 
        isOpen={!!quoteCarrier} 
        onClose={() => setQuoteCarrier(null)} 
        rule={quoteCarrier} 
      />
    </div>
  )
}
