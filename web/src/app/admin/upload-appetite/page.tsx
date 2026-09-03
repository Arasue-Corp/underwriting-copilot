"use client"

import { useState } from "react"
import { uploadAppetiteMatrix } from "@/app/actions/appetite_matrix"
import { Database, FileJson, CheckCircle } from "lucide-react"
import { useLanguage } from "@/components/language-provider"

export default function UploadAppetitePage() {
  const [jsonInput, setJsonInput] = useState("")
  const [status, setStatus] = useState<{type: 'idle' | 'loading' | 'success' | 'error', message?: string}>({ type: 'idle' })
  const language = useLanguage()

  const t = {
    es: {
      title: "Ingesta Manual (BI Matrix)",
      description: "Pega aquí el JSON estructurado que generaste con Gemini. El sistema lo convertirá en inteligencia de negocios.",
      tipTitle: "Tip de Extracción con Gemini:",
      tipBody: "Pide siempre que adapte la terminología de seguros al español de la industria, evitando traducciones literales (Ej. 'Steel Erection' debe ser 'Montaje Estructural', no 'Erección').",
      payload: "Payload JSON",
      placeholder: "[\n  {\n    'carrier_name': 'Chubb',\n    'product_line': 'Cyber',\n    ...\n  }\n]",
      btnLoading: "Inyectando...",
      btnSubmit: "Procesar e Inyectar a DB",
      successCount: "¡Éxito! Se inyectaron {count} registros en la base de datos.",
      formatError: "Formato JSON inválido o error de red",
      error: "Error: "
    },
    en: {
      title: "Manual Ingestion (BI Matrix)",
      description: "Paste here the structured JSON you generated with Gemini. The system will convert it into business intelligence.",
      tipTitle: "Gemini Extraction Tip:",
      tipBody: "Always ask it to adapt insurance terminology to industry standard, avoiding literal translations.",
      payload: "JSON Payload",
      placeholder: "[\n  {\n    'carrier_name': 'Chubb',\n    'product_line': 'Cyber',\n    ...\n  }\n]",
      btnLoading: "Injecting...",
      btnSubmit: "Process & Inject into DB",
      successCount: "Success! Injected {count} records into the database.",
      formatError: "Invalid JSON format or network error",
      error: "Error: "
    }
  }[language]

  const handleUpload = async () => {
    try {
      setStatus({ type: 'loading' })
      const res = await uploadAppetiteMatrix(jsonInput)
      if (res.success) {
        setStatus({ type: 'success', message: t.successCount.replace('{count}', String(res.count)) })
        setJsonInput("")
      } else {
        setStatus({ type: 'error', message: res.error })
      }
    } catch (e: any) {
      setStatus({ type: 'error', message: t.formatError })
    }
  }

  return (
    <div className="flex-1 p-8 pt-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Database className="h-8 w-8 text-primary" />
          {t.title}
        </h2>
        <p className="text-muted-foreground mt-2">
          {t.description}
        </p>
      </div>

      <div className="bg-blue-50/50 border border-blue-100 text-blue-800 p-4 rounded-xl text-sm flex gap-3 items-start">
        <div className="shrink-0 mt-0.5">ℹ️</div>
        <div>
          <strong className="font-semibold block mb-1">{t.tipTitle}</strong>
          {t.tipBody}
        </div>
      </div>

      <div className="rounded-xl border bg-card p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <FileJson className="h-5 w-5 text-muted-foreground" />
          <h3 className="font-medium">{t.payload}</h3>
        </div>
        
        <textarea
          value={jsonInput}
          onChange={(e) => setJsonInput(e.target.value)}
          className="w-full h-96 p-4 font-mono text-sm rounded-md border border-input bg-muted/50 focus:bg-background focus:ring-2 focus:ring-primary outline-none resize-y"
          placeholder={t.placeholder}
        />

        {status.type === 'error' && (
          <div className="p-3 rounded-md bg-destructive/15 border border-destructive/30 text-destructive text-sm font-medium">
            {t.error} {status.message}
          </div>
        )}
        
        {status.type === 'success' && (
          <div className="p-3 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-500 text-sm font-medium flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            {status.message}
          </div>
        )}

        <div className="flex justify-end">
          <button
            onClick={handleUpload}
            disabled={status.type === 'loading' || !jsonInput.trim()}
            className="bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-2.5 rounded-md font-medium transition-colors disabled:opacity-50"
          >
            {status.type === 'loading' ? t.btnLoading : t.btnSubmit}
          </button>
        </div>
      </div>
    </div>
  )
}
