"use client"

import { useState, useEffect } from "react"
import { ShieldCheck, Plus, Building, FileText, Upload, Save, X } from "lucide-react"
import { getCarriers, addCarrier, updateCarrier, getCarrierStats } from "@/app/actions/carriers"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { useLanguage } from "@/components/language-provider"

export default function CarriersPage() {
  const lang = useLanguage()
  
  const t = {
    en: {
      title: "Carriers Directory",
      subtitle: "Manage the official names and logos of insurance carriers.",
      newCarrier: "New Carrier",
      searchPlaceholder: "Search carrier...",
      logo: "Logo",
      carrierName: "Carrier Name",
      addedOn: "Added On",
      action: "Action",
      loading: "Loading carriers...",
      noResults: "No results found.",
      edit: "Edit",
      registerCarrier: "Register Carrier",
      editCarrier: "Edit Carrier",
      recordsInAppetite: "Records in Appetite",
      historicalQuotes: "Historical Quotes",
      syncWarning: "When you change the name, all historical and current records in the system will be automatically updated to maintain data integrity.",
      officialName: "Official Name",
      namePlaceholder: "E.g. Chubb, AmTrust, Berkshire Hathaway...",
      optionalLogo: "Carrier Logo (Optional)",
      uploadNewLogo: "Upload new logo",
      cancel: "Cancel",
      save: "Save",
      saving: "Saving...",
      successAdd: "Carrier registered successfully",
      errorAdd: "Error registering carrier",
      successUpdate: "Carrier updated successfully",
      errorUpdate: "Error updating carrier",
      errorGeneric: "An error occurred"
    },
    es: {
      title: "Directorio de Aseguradoras",
      subtitle: "Gestiona los nombres oficiales y logos de las aseguradoras (Carriers).",
      newCarrier: "Nueva Aseguradora",
      searchPlaceholder: "Buscar aseguradora...",
      logo: "Logo",
      carrierName: "Nombre de Aseguradora",
      addedOn: "Agregada el",
      action: "Acción",
      loading: "Cargando aseguradoras...",
      noResults: "No hay resultados.",
      edit: "Editar",
      registerCarrier: "Registrar Aseguradora",
      editCarrier: "Editar Aseguradora",
      recordsInAppetite: "Registros en Appetite",
      historicalQuotes: "Cotizaciones Históricas",
      syncWarning: "Al cambiar el nombre, se actualizarán automáticamente todos los registros históricos y actuales en el sistema para mantener la integridad de los datos.",
      officialName: "Nombre Oficial",
      namePlaceholder: "Ej. Chubb, AmTrust, Berkshire Hathaway...",
      optionalLogo: "Logo de Aseguradora (Opcional)",
      uploadNewLogo: "Subir nuevo logo",
      cancel: "Cancelar",
      save: "Guardar",
      saving: "Guardando...",
      successAdd: "Aseguradora registrada exitosamente",
      errorAdd: "Error al registrar aseguradora",
      successUpdate: "Aseguradora actualizada exitosamente",
      errorUpdate: "Error al actualizar aseguradora",
      errorGeneric: "Ocurrió un error"
    }
  }[lang]

  const [carriers, setCarriers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  // Modal states
  const [isAdding, setIsAdding] = useState(false)
  const [editingCarrier, setEditingCarrier] = useState<any>(null)
  
  // Form states
  const [carrierName, setCarrierName] = useState("")
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  // Stats state
  const [stats, setStats] = useState<{appetiteCount: number, quotesCount: number} | null>(null)
  const [loadingStats, setLoadingStats] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    loadCarriers()
  }, [])

  async function loadCarriers() {
    setLoading(true)
    const data = await getCarriers()
    setCarriers(data)
    setLoading(false)
  }

  async function handleOpenEdit(carrier: any) {
    setEditingCarrier(carrier)
    setCarrierName(carrier.name)
    setLogoFile(null)
    setStats(null)
    
    // Load stats
    setLoadingStats(true)
    try {
      const data = await getCarrierStats(carrier.name)
      setStats(data)
    } catch (e) {
      console.error(e)
    }
    setLoadingStats(false)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!carrierName.trim()) return

    setIsSaving(true)
    let logoUrl = undefined

    try {
      if (logoFile) {
        const fileExt = logoFile.name.split('.').pop()
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
        const filePath = `carriers/${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('logos')
          .upload(filePath, logoFile)

        if (uploadError) throw uploadError

        logoUrl = filePath
      }

      if (editingCarrier) {
        const res = await updateCarrier(editingCarrier.id, editingCarrier.name, carrierName, logoUrl)
        if (res.success) {
          toast.success(t.successUpdate)
          setEditingCarrier(null)
          loadCarriers()
        } else {
          toast.error(res.error || t.errorUpdate)
        }
      } else {
        const res = await addCarrier(carrierName, logoUrl)
        if (res.success) {
          toast.success(t.successAdd)
          setIsAdding(false)
          loadCarriers()
        } else {
          toast.error(res.error || t.errorAdd)
        }
      }
    } catch (err: any) {
      toast.error(err.message || t.errorGeneric)
    } finally {
      setIsSaving(false)
    }
  }

  const filteredCarriers = carriers.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()))

  return (
    <div className="flex-1 p-8 pt-6 max-w-6xl mx-auto space-y-6 relative">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <ShieldCheck className="h-8 w-8 text-primary" />
            {t.title}
          </h2>
          <p className="text-muted-foreground mt-2">
            {t.subtitle}
          </p>
        </div>
        
        <button
          onClick={() => {
            setIsAdding(true)
            setCarrierName("")
            setLogoFile(null)
          }}
          className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors shadow-sm flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          {t.newCarrier}
        </button>
      </div>

      <div className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b border-border bg-muted/20">
          <input 
            type="text" 
            placeholder={t.searchPlaceholder}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full md:max-w-md rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 text-muted-foreground border-b border-border">
              <tr>
                <th className="px-6 py-3 font-medium w-16">{t.logo}</th>
                <th className="px-6 py-3 font-medium">{t.carrierName}</th>
                <th className="px-6 py-3 font-medium">{t.addedOn}</th>
                <th className="px-6 py-3 font-medium text-right">{t.action}</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">{t.loading}</td>
                </tr>
              ) : filteredCarriers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">{t.noResults}</td>
                </tr>
              ) : (
                filteredCarriers.map(carrier => (
                  <tr key={carrier.id} className="border-b border-border last:border-0 hover:bg-muted/10 transition-colors">
                    <td className="px-6 py-4">
                      {carrier.logo_url ? (
                        <div className="w-10 h-10 rounded-md bg-white border border-border flex items-center justify-center p-1">
                          <img 
                            src={supabase.storage.from('logos').getPublicUrl(carrier.logo_url).data.publicUrl} 
                            alt={carrier.name}
                            className="max-w-full max-h-full object-contain"
                          />
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-md bg-muted flex items-center justify-center border border-border">
                          <Building className="w-5 h-5 text-muted-foreground/50" />
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 font-semibold text-base">{carrier.name}</td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {new Date(carrier.created_at).toLocaleDateString(lang === 'es' ? 'es-ES' : 'en-US')}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => handleOpenEdit(carrier)}
                        className="bg-secondary text-secondary-foreground px-3 py-1.5 rounded-md text-xs font-medium hover:bg-secondary/80"
                      >
                        {t.edit}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {(isAdding || editingCarrier) && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => { setIsAdding(false); setEditingCarrier(null); }}>
          <div className="bg-card w-full max-w-lg rounded-xl shadow-lg border border-border overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center p-6 border-b border-border">
              <h3 className="text-xl font-bold">
                {isAdding ? t.registerCarrier : t.editCarrier}
              </h3>
              <button onClick={() => { setIsAdding(false); setEditingCarrier(null); }} className="p-2 hover:bg-muted rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-6">
              
              {/* Stats for editing */}
              {editingCarrier && (
                <div className="bg-muted/30 p-4 rounded-lg border border-border/50 grid grid-cols-2 gap-4">
                  <div className="flex flex-col items-center p-3 bg-card rounded-md border border-border shadow-sm">
                    <FileText className="w-5 h-5 text-[#009CFF] mb-2" />
                    <span className="text-2xl font-bold">{loadingStats ? '...' : stats?.appetiteCount}</span>
                    <span className="text-xs text-muted-foreground uppercase font-semibold text-center mt-1">{t.recordsInAppetite}</span>
                  </div>
                  <div className="flex flex-col items-center p-3 bg-card rounded-md border border-border shadow-sm">
                    <FileText className="w-5 h-5 text-emerald-500 mb-2" />
                    <span className="text-2xl font-bold">{loadingStats ? '...' : stats?.quotesCount}</span>
                    <span className="text-xs text-muted-foreground uppercase font-semibold text-center mt-1">{t.historicalQuotes}</span>
                  </div>
                  <div className="col-span-2 text-xs text-muted-foreground text-center bg-blue-500/10 text-blue-700 p-2 rounded-md">
                    {t.syncWarning}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium">{t.officialName}</label>
                <input 
                  type="text"
                  required
                  value={carrierName}
                  onChange={e => setCarrierName(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  placeholder={t.namePlaceholder}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">{t.optionalLogo}</label>
                
                {editingCarrier?.logo_url && !logoFile && (
                  <div className="mb-2 w-24 h-24 rounded-lg border border-border bg-white p-2 flex items-center justify-center">
                    <img 
                      src={supabase.storage.from('logos').getPublicUrl(editingCarrier.logo_url).data.publicUrl} 
                      className="max-w-full max-h-full object-contain"
                      alt="Logo actual"
                    />
                  </div>
                )}
                
                <div className="flex items-center gap-3">
                  <label className="flex-1 cursor-pointer">
                    <div className="flex items-center justify-center gap-2 w-full py-2 border-2 border-dashed border-border rounded-md text-sm font-medium text-muted-foreground hover:bg-muted/50 transition-colors">
                      <Upload className="w-4 h-4" />
                      {logoFile ? logoFile.name : t.uploadNewLogo}
                    </div>
                    <input 
                      type="file" 
                      accept="image/*"
                      className="hidden" 
                      onChange={e => {
                        if (e.target.files && e.target.files.length > 0) {
                          setLogoFile(e.target.files[0])
                        }
                      }}
                    />
                  </label>
                  {logoFile && (
                    <button 
                      type="button" 
                      onClick={() => setLogoFile(null)}
                      className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-md"
                      title="Quitar imagen seleccionada"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-border gap-3">
                <button 
                  type="button" 
                  onClick={() => { setIsAdding(false); setEditingCarrier(null); }}
                  className="px-4 py-2 font-medium rounded-md hover:bg-muted"
                  disabled={isSaving}
                >
                  {t.cancel}
                </button>
                <button 
                  type="submit"
                  disabled={isSaving || !carrierName.trim()}
                  className="px-6 py-2 bg-primary text-primary-foreground font-medium rounded-md hover:bg-primary/90 flex items-center gap-2 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {isSaving ? t.saving : t.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
