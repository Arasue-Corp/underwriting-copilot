"use client"

import { useState, useEffect, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { X, FileText, Upload, Trash2, Download, Loader2, AlertCircle, Image as ImageIcon } from "lucide-react"

export function PolicyDocumentsModal({ isOpen, onClose, policy }: { isOpen: boolean, onClose: () => void, policy: any }) {
  const [files, setFiles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const supabase = createClient()
  const bucketName = 'policy-documents'
  const folderPath = `${policy?.id}/`

  useEffect(() => {
    if (isOpen && policy) {
      loadFiles()
    } else {
      setFiles([])
      setError("")
    }
  }, [isOpen, policy])

  async function loadFiles() {
    setLoading(true)
    setError("")
    try {
      const { data, error } = await supabase.storage.from(bucketName).list(folderPath)
      
      if (error) throw error
      
      // Filter out any hidden system files that might appear (like .emptyFolderPlaceholder)
      const validFiles = data?.filter(f => f.name !== '.emptyFolderPlaceholder') || []
      setFiles(validFiles)
    } catch (err: any) {
      console.error("Error loading documents:", err)
      setError("No se pudieron cargar los documentos.")
    } finally {
      setLoading(false)
    }
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files
    if (!selectedFiles || selectedFiles.length === 0) return

    setUploading(true)
    setError("")

    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i]
      
      // Validation: Only PDF, JPG, PNG
      const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg']
      if (!validTypes.includes(file.type)) {
        setError(`El archivo ${file.name} no es válido. Solo se permiten PDF, JPG y PNG.`)
        continue
      }

      // Max size: 10MB
      if (file.size > 10 * 1024 * 1024) {
        setError(`El archivo ${file.name} supera los 10MB.`)
        continue
      }

      const filePath = `${folderPath}${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`

      try {
        const { error: uploadError } = await supabase.storage.from(bucketName).upload(filePath, file)
        if (uploadError) throw uploadError
      } catch (err: any) {
        console.error("Upload error:", err)
        setError(`Error al subir ${file.name}: ${err.message}`)
      }
    }

    setUploading(false)
    if (fileInputRef.current) fileInputRef.current.value = ""
    loadFiles()
  }

  const handleDownload = async (fileName: string) => {
    try {
      const { data, error } = await supabase.storage.from(bucketName).createSignedUrl(`${folderPath}${fileName}`, 60)
      if (error) throw error
      
      // Create a temporary link and trigger download
      const link = document.createElement('a')
      link.href = data.signedUrl
      link.download = fileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (err: any) {
      console.error("Error downloading file:", err)
      alert("Error al descargar el archivo.")
    }
  }

  const handleDelete = async (fileName: string) => {
    if (!confirm(`¿Estás seguro de que deseas eliminar ${fileName}?`)) return
    
    try {
      const { error } = await supabase.storage.from(bucketName).remove([`${folderPath}${fileName}`])
      if (error) throw error
      loadFiles()
    } catch (err: any) {
      console.error("Error deleting file:", err)
      alert("Error al eliminar el archivo.")
    }
  }

  const getFileIcon = (fileName: string) => {
    if (fileName.toLowerCase().endsWith('.pdf')) return <FileText className="h-5 w-5 text-red-500" />
    return <ImageIcon className="h-5 w-5 text-blue-500" />
  }

  if (!isOpen || !policy) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-card w-full max-w-2xl rounded-2xl shadow-xl border border-border flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border bg-muted/20">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-violet-500/10 rounded-xl text-violet-600">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">Documentos de Póliza</h2>
              <p className="text-sm text-muted-foreground font-mono mt-0.5">{policy.policy_number || 'Borrador'}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-muted-foreground hover:bg-muted rounded-full transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-6">
          
          {error && (
            <div className="bg-red-500/10 text-red-600 p-3 rounded-xl text-sm flex items-start gap-2">
              <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}

          {/* Upload Area */}
          <div 
            className="border-2 border-dashed border-border rounded-xl p-8 flex flex-col items-center justify-center text-center bg-muted/10 hover:bg-muted/30 transition-colors cursor-pointer"
            onClick={() => !uploading && fileInputRef.current?.click()}
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              multiple 
              accept=".pdf,.jpg,.jpeg,.png" 
              onChange={handleFileSelect}
              disabled={uploading}
            />
            
            {uploading ? (
              <div className="flex flex-col items-center">
                <Loader2 className="h-8 w-8 text-primary animate-spin mb-3" />
                <p className="font-medium text-foreground">Subiendo documentos...</p>
                <p className="text-xs text-muted-foreground mt-1">Por favor espera</p>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <div className="p-3 bg-primary/10 rounded-full text-primary mb-3">
                  <Upload className="h-6 w-6" />
                </div>
                <p className="font-medium text-foreground">Haz clic para subir documentos</p>
                <p className="text-xs text-muted-foreground mt-1">Solo se permiten PDF, JPG o PNG (Max 10MB)</p>
              </div>
            )}
          </div>

          {/* File List */}
          <div className="flex-1 min-h-[150px]">
            <h3 className="text-sm font-semibold text-foreground mb-3">Archivos Adjuntos ({files.length})</h3>
            
            {loading ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="h-6 w-6 text-muted-foreground animate-spin" />
              </div>
            ) : files.length === 0 ? (
              <div className="text-center py-10 bg-muted/20 rounded-xl border border-border">
                <p className="text-muted-foreground text-sm">No hay documentos guardados para esta póliza.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {files.map((file, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-background border border-border rounded-xl hover:border-primary/30 transition-colors group">
                    <div className="flex items-center gap-3 overflow-hidden">
                      {getFileIcon(file.name)}
                      <div className="truncate">
                        <p className="text-sm font-medium text-foreground truncate" title={file.name}>
                          {file.name.split('_').slice(1).join('_') || file.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {(file.metadata?.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDownload(file.name) }}
                        className="p-2 hover:bg-blue-500/10 rounded-lg text-muted-foreground hover:text-blue-600 transition-colors"
                        title="Descargar"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(file.name) }}
                        className="p-2 hover:bg-red-500/10 rounded-lg text-muted-foreground hover:text-red-600 transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}
