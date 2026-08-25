"use client"

import { useState, useEffect } from "react"
import { Building2, Plus, Users, Trash2, Edit, X, Upload } from "lucide-react"
import { getAgencies, createAgency, deleteAgency, updateAgency } from "@/app/actions/admin"
import { createClient } from "@/lib/supabase/client"

export default function AgenciesPage() {
  const [agencies, setAgencies] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [newName, setNewName] = useState("")
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState("")

  const [editingAgency, setEditingAgency] = useState<any>(null)
  const [editName, setEditName] = useState("")
  const [editAddress, setEditAddress] = useState("")
  const [editPhone, setEditPhone] = useState("")
  const [editLogoUrl, setEditLogoUrl] = useState("")
  const [isUploadingLogo, setIsUploadingLogo] = useState(false)
  const supabase = createClient()


  useEffect(() => {
    loadAgencies()
  }, [])

  async function loadAgencies() {
    setLoading(true)
    const data = await getAgencies()
    setAgencies(data)
    setLoading(false)
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Estás seguro de que deseas eliminar esta agencia? Esto podría afectar a los usuarios y clientes asociados.")) return;
    const res = await deleteAgency(id);
    if (res.success) {
      loadAgencies();
    } else {
      setError(res.error || "Error al eliminar");
    }
  }

  
  async function handleEditSave(e: React.FormEvent) {
    e.preventDefault()
    if (!editingAgency) return
    setIsCreating(true)
    setError("")
    
    const res = await updateAgency(editingAgency.id, {
      name: editName,
      address: editAddress,
      phone: editPhone,
      logo_url: editLogoUrl
    })
    
    if (res.success) {
      setEditingAgency(null)
      loadAgencies()
    } else {
      setError(res.error || "Error al actualizar")
    }
    setIsCreating(false)
  }

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    
    setIsUploadingLogo(true)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`
      const filePath = `agency_logos/${fileName}`

      const { error: uploadError, data } = await supabase.storage
        .from('logos')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('logos')
        .getPublicUrl(filePath)

      setEditLogoUrl(publicUrl)
    } catch (err: any) {
      console.error(err)
      setError("Error al subir el logo")
    } finally {
      setIsUploadingLogo(false)
    }
  }

  function openEditModal(agency: any) {
    setEditingAgency(agency)
    setEditName(agency.name || "")
    setEditAddress(agency.address || "")
    setEditPhone(agency.phone || "")
    setEditLogoUrl(agency.logo_url || "")
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setIsCreating(true)
    setError("")
    
    const res = await createAgency(newName)
    if (res.success) {
      setNewName("")
      loadAgencies()
    } else {
      setError(res.error || "Error al crear agencia")
    }
    setIsCreating(false)
  }

  return (
    <div className="flex-1 p-8 pt-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Building2 className="h-8 w-8 text-primary" />
          Directorio de Agencias
        </h2>
        <p className="text-muted-foreground mt-2">
          Gestiona las compañías registradas en la plataforma.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-6">
          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <h3 className="font-semibold text-lg mb-4">Nueva Agencia</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">
                  Nombre de la Agencia
                </label>
                <input 
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Ej. Acme Insurance Group"
                  className="w-full px-3 py-2 border border-input rounded-md bg-background focus:ring-2 focus:ring-primary outline-none"
                  required
                />
              </div>
              {error && <p className="text-sm text-rose-500">{error}</p>}
              <button
                type="submit"
                disabled={isCreating || !newName.trim()}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                {isCreating ? 'Creando...' : 'Registrar Agencia'}
              </button>
            </form>
          </div>
        </div>

        <div className="md:col-span-2">
          <div className="rounded-xl border bg-card shadow-sm overflow-hidden w-full">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left whitespace-nowrap md:whitespace-normal">
                <thead className="bg-muted/10 border-b border-border text-muted-foreground">
                <tr>
                  <th className="px-6 py-3 font-medium">Nombre de Agencia</th>
                  <th className="px-6 py-3 font-medium">Usuarios Asignados</th>
                  <th className="px-6 py-3 font-medium text-right">ID Interno</th>
                  <th className="px-6 py-3 font-medium text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">Cargando...</td>
                  </tr>
                ) : agencies.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">No hay agencias registradas.</td>
                  </tr>
                ) : (
                  agencies.map(agency => (
                    <tr key={agency.id} className="border-b border-border/50 last:border-0 hover:bg-muted/10">
                      <td className="px-6 py-4 font-medium flex items-center gap-2">
                        {agency.logo_url ? <img src={agency.logo_url} alt={agency.name} className="w-6 h-6 object-contain rounded" /> : null}
                        <Building2 className="w-4 h-4 text-primary" /> {agency.name}
                      </td>
                      <td className="px-6 py-4">
                        <span className="flex items-center gap-1.5 bg-muted/50 w-fit px-2 py-1 rounded-md text-xs font-medium">
                          <Users className="w-3.5 h-3.5" /> {agency.agentCount}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right text-xs text-muted-foreground font-mono">
                        {agency.id.substring(0,8)}...
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button onClick={() => openEditModal(agency)} className="text-blue-500 hover:text-blue-700 p-2 hover:bg-blue-500/10 rounded-full transition-colors mr-2">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(agency.id)} className="text-rose-500 hover:text-rose-700 p-2 hover:bg-rose-500/10 rounded-full transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            </div>
          </div>
        </div>
      
      </div>
      {editingAgency && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="bg-card w-full max-w-md rounded-xl border shadow-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-border/50">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Building2 className="w-5 h-5 text-primary" />
                Editar Agencia
              </h3>
              <button 
                onClick={() => setEditingAgency(null)}
                className="text-muted-foreground hover:bg-muted p-2 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleEditSave} className="p-6 space-y-4">
              {error && (
                <div className="p-3 bg-rose-500/10 text-rose-500 rounded-md text-sm">
                  {error}
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium mb-1">Nombre</label>
                <input 
                  type="text" 
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md bg-background focus:ring-2 focus:ring-primary outline-none"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Dirección</label>
                <input 
                  type="text" 
                  value={editAddress}
                  onChange={e => setEditAddress(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md bg-background focus:ring-2 focus:ring-primary outline-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Teléfono</label>
                <input 
                  type="text" 
                  value={editPhone}
                  onChange={e => setEditPhone(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md bg-background focus:ring-2 focus:ring-primary outline-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Logo</label>
                <div className="flex items-center gap-4">
                  {editLogoUrl && (
                    <img src={editLogoUrl} alt="Logo" className="h-12 w-12 object-contain bg-white rounded border" />
                  )}
                  <label className="flex items-center justify-center gap-2 px-4 py-2 border border-input rounded-md cursor-pointer hover:bg-muted/50 transition-colors">
                    <Upload className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-muted-foreground">
                      {isUploadingLogo ? 'Subiendo...' : 'Subir Logo'}
                    </span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleLogoUpload}
                      disabled={isUploadingLogo}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
              
              <div className="pt-4 flex justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => setEditingAgency(null)}
                  className="px-4 py-2 text-sm font-medium border rounded-md hover:bg-muted transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  disabled={isCreating || isUploadingLogo}
                  className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {isCreating ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

