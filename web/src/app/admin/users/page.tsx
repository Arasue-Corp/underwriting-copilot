"use client"

import { useState, useEffect } from "react"
import { toast } from "sonner"
import { Users, Shield, Building2, Loader2, CheckCircle2 } from "lucide-react"
import { getUsers, getAgencies, updateUserAdmin } from "@/app/actions/admin"

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([])
  const [agencies, setAgencies] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  // Track updating state per user
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [successId, setSuccessId] = useState<string | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)
    const [uData, aData] = await Promise.all([getUsers(), getAgencies()])
    setUsers(uData)
    setAgencies(aData)
    setLoading(false)
  }

  async function handleUpdate(userId: string, field: 'role' | 'agency_id', value: string) {
    setUpdatingId(userId)
    const res = await updateUserAdmin(userId, { [field]: value === 'NULL' ? null : value })
    
    if (res.success) {
      // Local state update to feel snappy
      setUsers(users.map(u => {
        if (u.id === userId) {
          if (field === 'role') return { ...u, role: value }
          if (field === 'agency_id') {
            const ag = agencies.find(a => a.id === value)
            return { ...u, agency_id: value === 'NULL' ? null : value, agency_name: ag ? ag.name : null }
          }
        }
        return u
      }))
      setSuccessId(userId)
      setTimeout(() => setSuccessId(null), 2000)
    } else {
      toast.error("Error al actualizar usuario: " + res.error)
    }
    setUpdatingId(null)
  }

  return (
    <div className="flex-1 p-8 pt-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Users className="h-8 w-8 text-primary" />
          Directorio Global de Usuarios
        </h2>
        <p className="text-muted-foreground mt-2">
          Administra el nivel de acceso (rol) y la agencia a la que pertenece cada miembro.
        </p>
      </div>

      <div className="rounded-xl border bg-card shadow-sm overflow-hidden w-full">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left whitespace-nowrap md:whitespace-normal">
            <thead className="bg-muted/10 border-b border-border text-muted-foreground">
            <tr>
              <th className="px-6 py-3 font-medium w-1/3">Usuario</th>
              <th className="px-6 py-3 font-medium">Compañía / Agencia</th>
              <th className="px-6 py-3 font-medium">Nivel de Acceso</th>
              <th className="px-6 py-3 font-medium text-right">Estado</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">Cargando usuarios...</td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">No hay usuarios registrados.</td>
              </tr>
            ) : (
              users.map(user => (
                <tr key={user.id} className="border-b border-border/50 last:border-0 hover:bg-muted/10 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-foreground">{user.name}</div>
                    <div className="text-muted-foreground text-xs">{user.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 relative">
                      <Building2 className="w-4 h-4 text-muted-foreground absolute left-3 pointer-events-none" />
                      <select
                        value={user.agency_id || 'NULL'}
                        onChange={(e) => handleUpdate(user.id, 'agency_id', e.target.value)}
                        disabled={updatingId === user.id}
                        className="pl-9 pr-8 py-1.5 bg-background border border-input rounded-md text-sm outline-none focus:ring-1 focus:ring-primary appearance-none cursor-pointer w-full disabled:opacity-50"
                      >
                        <option value="NULL">-- Sin Agencia --</option>
                        {agencies.map(a => (
                          <option key={a.id} value={a.id}>{a.name}</option>
                        ))}
                      </select>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 relative">
                      <Shield className="w-4 h-4 text-muted-foreground absolute left-3 pointer-events-none" />
                      <select
                        value={user.role}
                        onChange={(e) => handleUpdate(user.id, 'role', e.target.value)}
                        disabled={updatingId === user.id}
                        className={`pl-9 pr-8 py-1.5 border border-input rounded-md text-sm outline-none focus:ring-1 focus:ring-primary appearance-none cursor-pointer disabled:opacity-50 font-medium ${
                          user.role === 'ADMIN' ? 'bg-rose-500/10 text-rose-500' :
                          user.role === 'MANAGER' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-500' :
                          'bg-blue-500/10 text-blue-600 dark:text-blue-500'
                        }`}
                      >
                        <option value="AGENT">Agente (Base)</option>
                        <option value="MANAGER">Manager (Agencia)</option>
                        <option value="ADMIN">Admin (Global)</option>
                      </select>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {updatingId === user.id ? (
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" /> Guardando
                      </span>
                    ) : successId === user.id ? (
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-500 animate-in fade-in">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Guardado
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">Sincronizado</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  )
}
