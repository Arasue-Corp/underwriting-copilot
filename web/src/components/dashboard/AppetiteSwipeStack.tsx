"use client"

import { useState } from "react"
import { motion, AnimatePresence, PanInfo } from "framer-motion"
import { Building2, AlertCircle, CheckCircle2, ChevronRight, RefreshCcw } from "lucide-react"

type CarrierData = {
  id: number
  carrier_name: string
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
      className={`${className} object-contain bg-white rounded-full p-2 shadow-sm`}
      onError={() => setErrorCount(prev => prev + 1)}
    />
  );
};

export function AppetiteSwipeStack({ 
  data, 
  language
}: { 
  data: CarrierData[], 
  language: 'en' | 'es'
}) {
  const [cards, setCards] = useState(data)
  const [leaveX, setLeaveX] = useState(0)

  const removeCard = (id: number, action: 'left' | 'right') => {
    setLeaveX(action === 'right' ? 300 : -300)
    setTimeout(() => {
      setCards((prev) => prev.filter((card) => card.id !== id))
    }, 150)
  }

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo, id: number) => {
    if (info.offset.x > 100) {
      removeCard(id, 'right')
    } else if (info.offset.x < -100) {
      removeCard(id, 'left')
    }
  }

  const resetCards = () => {
    setCards(data)
  }

  if (cards.length === 0) {
    return (
      <div className="w-full h-[500px] flex flex-col items-center justify-center glass-panel rounded-[3rem] p-8 text-center border-dashed border-2">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
          <CheckCircle2 className="w-10 h-10 text-primary" />
        </div>
        <h3 className="font-playfair text-2xl font-bold mb-3">
          {language === 'es' ? "¡Terminaste!" : "You're done!"}
        </h3>
        <p className="text-muted-foreground mb-8">
          {language === 'es' 
            ? "Has revisado todas las aseguradoras para esta industria." 
            : "You've reviewed all carriers for this industry."}
        </p>
        <button 
          onClick={resetCards}
          className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-full font-semibold hover:scale-105 transition-transform shadow-lg"
        >
          <RefreshCcw className="w-5 h-5" /> 
          {language === 'es' ? "Volver a revisar" : "Review again"}
        </button>
      </div>
    )
  }

  return (
    <div className="w-full flex flex-col items-center">
    <div className="relative w-full h-[550px] flex items-center justify-center perspective-1000">
      <AnimatePresence>
        {cards.map((card, index) => {
          const isFront = index === 0;
          
          return (
            <motion.div
              key={card.id}
              className="absolute w-full max-w-[340px] h-[480px] rounded-[2rem] glass-panel p-6 flex flex-col items-center justify-between"
              style={{
                zIndex: cards.length - index,
                borderTop: `4px solid ${card.status === 'ELIGIBLE' ? '#10b981' : card.status === 'RESTRICTED' ? '#f59e0b' : '#ef4444'}`
              }}
              drag={isFront ? "x" : false}
              dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
              onDragEnd={(e, info) => handleDragEnd(e, info, card.id)}
              initial={{ scale: 0.8, opacity: 0, y: 50 }}
              animate={{
                scale: 1 - index * 0.05,
                y: index * 20,
                opacity: 1 - index * 0.2,
                rotateZ: isFront ? 0 : index % 2 === 0 ? 2 : -2
              }}
              exit={{
                x: leaveX,
                opacity: 0,
                scale: 0.9,
                transition: { duration: 0.2 }
              }}
              whileDrag={{ scale: 1.05, cursor: "grabbing" }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <div className="w-full flex justify-between items-start">
                <div className="flex flex-col items-center w-full">
                  <CarrierLogo carrierName={card.carrier_name} className="w-20 h-20 mb-4" />
                  <h2 className="font-playfair text-2xl font-bold text-center text-foreground mb-1">{card.carrier_name}</h2>
                  <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{card.product_line}</span>
                </div>
              </div>

              <div className="w-full flex-1 mt-6 overflow-hidden">
                <div className={`
                  w-full py-2 px-4 rounded-xl font-bold text-sm mb-4 text-center border
                  ${card.status === 'ELIGIBLE' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : ''}
                  ${card.status === 'RESTRICTED' ? 'bg-amber-500/10 text-amber-600 border-amber-500/20' : ''}
                  ${card.status === 'PROHIBITED' ? 'bg-red-500/10 text-red-600 border-red-500/20' : ''}
                `}>
                  {card.status === 'ELIGIBLE' && (language === 'es' ? 'ELEGIBLE' : 'ELIGIBLE')}
                  {card.status === 'RESTRICTED' && (language === 'es' ? 'RESTRINGIDO' : 'RESTRICTED')}
                  {card.status === 'PROHIBITED' && (language === 'es' ? 'PROHIBIDO' : 'PROHIBITED')}
                </div>
                
                <div className="w-full max-h-[140px] overflow-y-auto hide-scrollbar text-sm text-foreground/80 leading-relaxed text-center px-2">
                  <span className="block text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">
                    {language === 'es' ? 'Condiciones Específicas' : 'Specific Conditions'}
                  </span>
                  {card.conditions || (language === 'es' ? 'Sin condiciones adicionales detalladas.' : 'No additional detailed conditions.')}
                  
                  {card.general_prohibited_operations && card.general_prohibited_operations.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-border/50 text-left">
                      <span className="block text-[10px] font-bold text-rose-600 uppercase tracking-widest mb-2 text-center">
                        {language === 'es' ? 'Operaciones Prohibidas' : 'Prohibited Operations'}
                      </span>
                      <ul className="list-disc pl-4 text-rose-600/80 space-y-1 text-xs">
                        {card.general_prohibited_operations.map((op, i) => (
                          <li key={i}>{op}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              {/* Min Premium / Max Limits */}
              <div className="w-full grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-border/50">
                 <div className="text-center bg-background/50 rounded-lg py-2">
                   <span className="block text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                     {language === 'es' ? 'Prima Mínima' : 'Min Premium'}
                   </span>
                   <span className={`font-semibold ${!card.min_premium ? 'text-muted-foreground/60 text-xs' : ''}`}>
                     {card.min_premium ? `$${card.min_premium.toLocaleString()}` : (language === 'es' ? 'Según riesgo' : 'Varies by risk')}
                   </span>
                 </div>
                 <div className="text-center bg-background/50 rounded-lg py-2">
                   <span className="block text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                     {language === 'es' ? 'Límites Max' : 'Max Limits'}
                   </span>
                   <span className={`font-semibold ${!card.max_limits ? 'text-muted-foreground/60 text-xs' : ''}`}>
                     {card.max_limits ? `$${card.max_limits.toLocaleString()}` : (language === 'es' ? 'Sujeto a evaluación' : 'Subject to eval')}
                   </span>
                 </div>
              </div>

              {/* Swipe indicators (Only visible when dragging) */}
              {isFront && (
                <div className="absolute top-1/2 -translate-y-1/2 w-full px-6 flex justify-between pointer-events-none opacity-0 group-active:opacity-100 transition-opacity">
                   <div className="w-12 h-12 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center backdrop-blur-md">
                     <ChevronRight className="w-6 h-6 rotate-180" />
                   </div>
                   <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center backdrop-blur-md">
                     <ChevronRight className="w-6 h-6" />
                   </div>
                </div>
              )}
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
    
    {cards.length > 1 && (
      <div className="mt-4 flex flex-col items-center text-muted-foreground/60 animate-pulse">
        <span className="text-xs uppercase tracking-widest font-bold mb-1">
          {language === 'es' ? 'Desliza para ver más' : 'Swipe to see more'}
        </span>
        <div className="flex gap-4">
           <ChevronRight className="w-4 h-4 rotate-180" />
           <ChevronRight className="w-4 h-4" />
        </div>
      </div>
    )}
    </div>
  )
}
