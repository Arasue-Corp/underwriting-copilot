"use client"

import { useState, useEffect } from "react"
import { Building2, Plus, Users } from "lucide-react"
import { getAgencies, createAgency } from "@/app/actions/admin"

export default function AgenciesPage() {
  const [agencies, setAgencies] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [newName, setNewName] = useState("")
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    loadAgencies()
  }, [])

  async function loadAgencies() {
    setLoading(true)
    const data = await getAgencies()
    setAgencies(data)
    setLoading(false)
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
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-8 text-center text-muted-foreground">Cargando...</td>
                  </tr>
                ) : agencies.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-8 text-center text-muted-foreground">No hay agencias registradas.</td>
                  </tr>
                ) : (
                  agencies.map(agency => (
                    <tr key={agency.id} className="border-b border-border/50 last:border-0 hover:bg-muted/10">
                      <td className="px-6 py-4 font-medium flex items-center gap-2">
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
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
