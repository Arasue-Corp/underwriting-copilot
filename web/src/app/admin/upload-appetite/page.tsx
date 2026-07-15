"use client"

import { useState } from "react"
import { uploadAppetiteMatrix } from "@/app/actions/appetite_matrix"
import { Database, FileJson, CheckCircle } from "lucide-react"

export default function UploadAppetitePage() {
  const [jsonInput, setJsonInput] = useState("")
  const [status, setStatus] = useState<{type: 'idle' | 'loading' | 'success' | 'error', message?: string}>({ type: 'idle' })

  const handleUpload = async () => {
    try {
      setStatus({ type: 'loading' })
      const res = await uploadAppetiteMatrix(jsonInput)
      if (res.success) {
        setStatus({ type: 'success', message: `¡Éxito! Se inyectaron ${res.count} registros en la base de datos.` })
        setJsonInput("")
      } else {
        setStatus({ type: 'error', message: res.error })
      }
    } catch (e: any) {
      setStatus({ type: 'error', message: "Formato JSON inválido o error de red" })
    }
  }

  return (
    <div className="flex-1 p-8 pt-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Database className="h-8 w-8 text-primary" />
          Ingesta Manual (BI Matrix)
        </h2>
        <p className="text-muted-foreground mt-2">
          Pega aquí el JSON estructurado que generaste con Gemini. El sistema lo convertirá en inteligencia de negocios.
        </p>
      </div>

      <div className="bg-blue-50/50 border border-blue-100 text-blue-800 p-4 rounded-xl text-sm flex gap-3 items-start">
        <div className="shrink-0 mt-0.5">ℹ️</div>
        <div>
          <strong className="font-semibold block mb-1">Tip de Extracción con Gemini:</strong>
          Pide siempre que adapte la terminología de seguros al español de la industria, evitando traducciones literales (Ej. <i>"Steel Erection"</i> debe ser <i>"Montaje Estructural"</i>, no "Erección").
        </div>
      </div>

      <div className="rounded-xl border bg-card p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <FileJson className="h-5 w-5 text-muted-foreground" />
          <h3 className="font-medium">Payload JSON</h3>
        </div>
        
        <textarea
          value={jsonInput}
          onChange={(e) => setJsonInput(e.target.value)}
          className="w-full h-96 p-4 font-mono text-sm rounded-md border border-input bg-muted/50 focus:bg-background focus:ring-2 focus:ring-primary outline-none resize-y"
          placeholder="[\n  {\n    'carrier_name': 'Chubb',\n    'product_line': 'Cyber',\n    ...\n  }\n]"
        />

        {status.type === 'error' && (
          <div className="p-3 rounded-md bg-destructive/15 border border-destructive/30 text-destructive text-sm font-medium">
            Error: {status.message}
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
            {status.type === 'loading' ? 'Inyectando...' : 'Procesar e Inyectar a DB'}
          </button>
        </div>
      </div>
    </div>
  )
}
