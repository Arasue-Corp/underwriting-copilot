"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Upload, Loader2, CheckCircle2 } from "lucide-react"

interface UploadLogoProps {
  table: "agencies" | "clients"
  recordId: string
  currentLogoUrl?: string | null
}

export default function UploadLogo({ table, recordId, currentLogoUrl }: UploadLogoProps) {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [logoUrl, setLogoUrl] = useState(currentLogoUrl)
  const supabase = createClient()

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setLoading(true)
    setSuccess(false)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${table}_${recordId}_${Math.random()}.${fileExt}`
      const filePath = `${fileName}`

      // Subir archivo al bucket 'logos'
      const { error: uploadError } = await supabase.storage
        .from('logos')
        .upload(filePath, file, { upsert: true })

      if (uploadError) throw uploadError

      // Obtener URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('logos')
        .getPublicUrl(filePath)

      // Actualizar la tabla
      const { error: dbError } = await supabase
        .from(table)
        .update({ logo_url: publicUrl })
        .eq('id', recordId)

      if (dbError) throw dbError

      setLogoUrl(publicUrl)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err: any) {
      console.error("Error uploading logo:", err)
      alert("Error al subir el logo: " + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center gap-4">
      {logoUrl ? (
        <div className="h-16 w-16 rounded-md border bg-white flex items-center justify-center overflow-hidden">
          <img src={logoUrl} alt="Logo" className="max-h-full max-w-full object-contain" />
        </div>
      ) : (
        <div className="h-16 w-16 rounded-md border border-dashed bg-muted flex items-center justify-center text-muted-foreground">
          Logo
        </div>
      )}
      <div>
        <label className="relative cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90 px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-2">
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : success ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-300" />
          ) : (
            <Upload className="h-4 w-4" />
          )}
          <span>{loading ? "Subiendo..." : success ? "Actualizado" : "Cambiar Logo"}</span>
          <input 
            type="file" 
            className="sr-only" 
            accept="image/*" 
            onChange={handleUpload}
            disabled={loading}
          />
        </label>
        <p className="text-xs text-muted-foreground mt-1">Recomendado: Cuadrado, max 2MB</p>
      </div>
    </div>
  )
}
