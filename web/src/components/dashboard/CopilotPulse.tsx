"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useState, useEffect } from "react"
import { Sparkles, Activity } from "lucide-react"

export function CopilotPulse({ title, desc, lang }: { title: string, desc: string, lang: string }) {
  const [insightIndex, setInsightIndex] = useState(0)
  
  const insights = lang === 'es' ? [
    "Analizando apetito de 22 aseguradoras en tiempo real...",
    "Se detectó un cambio en el apetito de Construcción por parte de Chubb.",
    "Buscando cruces de datos con pólizas activas...",
    "Tu agencia tiene una tasa de conversión superior al 24% este mes."
  ] : [
    "Analyzing appetite from 22 carriers in real-time...",
    "Detected a shift in Construction appetite by Chubb.",
    "Cross-referencing data with active policies...",
    "Your agency has a conversion rate above 24% this month."
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setInsightIndex((prev) => (prev + 1) % insights.length)
    }, 4500)
    return () => clearInterval(interval)
  }, [insights.length])

  return (
    <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-8">
      {/* The AI Orb */}
      <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
        <motion.div 
          animate={{ scale: [1, 1.1, 1], rotate: [0, 90, 180, 270, 360] }} 
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 rounded-full border border-primary/30 border-t-accent/50 bg-gradient-to-tr from-primary/5 to-accent/20 backdrop-blur-md shadow-[0_0_15px_rgba(242,211,172,0.2)]"
        />
        <motion.div 
          animate={{ scale: [0.9, 1.1, 0.9], opacity: [0.4, 0.8, 0.4] }} 
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-2 rounded-full bg-primary/20 blur-[2px]"
        />
        <Sparkles className="w-6 h-6 text-primary z-10" />
      </div>
      
      {/* The Text */}
      <div className="flex flex-col">
        <h2 className="font-playfair text-3xl font-bold tracking-tight text-foreground">{title}</h2>
        <div className="flex items-center gap-2 mt-2 text-sm font-medium text-muted-foreground bg-primary/5 px-3 py-1.5 rounded-full border border-primary/10 w-fit backdrop-blur-sm shadow-sm">
          <Activity className="w-4 h-4 text-emerald-500 animate-pulse" />
          <AnimatePresence mode="wait">
            <motion.span
              key={insightIndex}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.3 }}
            >
              {insights[insightIndex]}
            </motion.span>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
