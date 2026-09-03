"use client"

import { useState, useEffect } from "react"
import { toast } from "sonner"
import { Users, Shield, Building2, Loader2, CheckCircle2, Edit, Trash2, X } from "lucide-react"
import { getUsers, getAgencies, updateUserAdmin, deleteUser } from "@/app/actions/admin"
import { useLanguage } from "@/components/language-provider"

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([])
  const [agencies, setAgencies] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  // Track updating state per user
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [successId, setSuccessId] = useState<string | null>(null)

  const [editingUser, setEditingUser] = useState<any>(null)
  const [editName, setEditName] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const language = useLanguage()

  const t = {
    es: {
      title: "Directorio Global de Usuarios",
      description: "Administra el nivel de acceso (rol) y la agencia a la que pertenece cada miembro.",
      colUser: "Usuario",
      colAgency: "Compañía / Agencia",
      colRole: "Nivel de Acceso",
      colStatus: "Estado",
      colActions: "Acciones",
      loading: "Cargando usuarios...",
      noUsers: "No hay usuarios registrados.",
      noAgency: "-- Sin Agencia --",
      roleAgent: "Agente (Base)",
      roleManager: "Manager (Agencia)",
      roleAdmin: "Admin (Global)",
      roleDemo: "Demo (Lectura)",
      statusSaving: "Guardando",
      statusSaved: "Guardado",
      statusSynced: "Sincronizado",
      editTitle: "Editar Usuario",
      nameLabel: "Nombre",
      cancel: "Cancelar",
      saveBtn: "Guardar Cambios",
      savingBtn: "Guardando...",
      deleteConfirm: "¿Estás seguro de que deseas eliminar a este usuario?",
      msgDeleted: "Usuario eliminado",
      msgUpdated: "Usuario actualizado",
      errDelete: "Error al eliminar: ",
      errUpdate: "Error al actualizar: "
    },
    en: {
      title: "Global User Directory",
      description: "Manage access levels (roles) and agency membership for each user.",
      colUser: "User",
      colAgency: "Company / Agency",
      colRole: "Access Level",
      colStatus: "Status",
      colActions: "Actions",
      loading: "Loading users...",
      noUsers: "No users registered.",
      noAgency: "-- No Agency --",
      roleAgent: "Agent (Base)",
      roleManager: "Manager (Agency)",
      roleAdmin: "Admin (Global)",
      roleDemo: "Demo (Read-Only)",
      statusSaving: "Saving",
      statusSaved: "Saved",
      statusSynced: "Synchronized",
      editTitle: "Edit User",
      nameLabel: "Name",
      cancel: "Cancel",
      saveBtn: "Save Changes",
      savingBtn: "Saving...",
      deleteConfirm: "Are you sure you want to delete this user?",
      msgDeleted: "User deleted",
      msgUpdated: "User updated",
      errDelete: "Error deleting: ",
      errUpdate: "Error updating: "
    }
  }[language]

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

  async function handleDelete(userId: string) {
    if (!confirm(t.deleteConfirm)) return
    const res = await deleteUser(userId)
    if (res.success) {
      loadData()
      toast.success(t.msgDeleted)
    } else {
      toast.error(t.errDelete + res.error)
    }
  }

  function openEditModal(user: any) {
    setEditingUser(user)
    setEditName(user.name || "")
  }

  async function handleEditSave(e: React.FormEvent) {
    e.preventDefault()
    if (!editingUser) return
    setIsSaving(true)
    const res = await updateUserAdmin(editingUser.id, { name: editName })
    if (res.success) {
      setUsers(users.map((u: any) => u.id === editingUser.id ? { ...u, name: editName } : u))
      setEditingUser(null)
      toast.success(t.msgUpdated)
    } else {
      toast.error(t.errUpdate + res.error)
    }
    setIsSaving(false)
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
      toast.error(t.errUpdate + res.error)
    }
    setUpdatingId(null)
  }

  return (
    <div className="flex-1 p-8 pt-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Users className="h-8 w-8 text-primary" />
          {t.title}
        </h2>
        <p className="text-muted-foreground mt-2">
          {t.description}
        </p>
      </div>

      <div className="rounded-xl border bg-card shadow-sm overflow-hidden w-full">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left whitespace-nowrap md:whitespace-normal">
            <thead className="bg-muted/10 border-b border-border text-muted-foreground">
            <tr>
              <th className="px-6 py-3 font-medium w-1/3">{t.colUser}</th>
              <th className="px-6 py-3 font-medium">{t.colAgency}</th>
              <th className="px-6 py-3 font-medium">{t.colRole}</th>
              <th className="px-6 py-3 font-medium text-right">{t.colStatus}</th>
              <th className="px-6 py-3 font-medium text-right">{t.colActions}</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">{t.loading}</td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">{t.noUsers}</td>
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
                        <option value="NULL">{t.noAgency}</option>
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
                          user.role === 'DEMO' ? 'bg-purple-500/10 text-purple-600 dark:text-purple-500' :
                          'bg-blue-500/10 text-blue-600 dark:text-blue-500'
                        }`}
                      >
                        <option value="AGENT">{t.roleAgent}</option>
                        <option value="MANAGER">{t.roleManager}</option>
                        <option value="ADMIN">{t.roleAdmin}</option>
                        <option value="DEMO">{t.roleDemo}</option>
                      </select>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {updatingId === user.id ? (
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" /> {t.statusSaving}
                      </span>
                    ) : successId === user.id ? (
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-500 animate-in fade-in">
                        <CheckCircle2 className="w-3.5 h-3.5" /> {t.statusSaved}
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">{t.statusSynced}</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => openEditModal(user)} className="text-blue-500 hover:text-blue-700 p-2 hover:bg-blue-500/10 rounded-full transition-colors mr-2">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(user.id)} className="text-rose-500 hover:text-rose-700 p-2 hover:bg-rose-500/10 rounded-full transition-colors">
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

      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="bg-card w-full max-w-md rounded-xl border shadow-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-border/50">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                {t.editTitle}
              </h3>
              <button 
                onClick={() => setEditingUser(null)}
                className="text-muted-foreground hover:bg-muted p-2 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleEditSave} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">{t.nameLabel}</label>
                <input 
                  type="text" 
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md bg-background focus:ring-2 focus:ring-primary outline-none"
                  required
                />
              </div>
              
              <div className="pt-4 flex justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 text-sm font-medium border rounded-md hover:bg-muted transition-colors"
                >
                  {t.cancel}
                </button>
                <button 
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {isSaving ? t.savingBtn : t.saveBtn}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
