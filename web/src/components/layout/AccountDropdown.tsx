"use client"

import { useState, useRef, useEffect } from "react"
import { createPortal } from "react-dom"
import { LogOut, User, Building, Settings, X, Loader2, CheckCircle2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { updateProfileName } from "@/app/actions/profile"

export default function AccountDropdown({ 
  profile 
}: { 
  profile: { name: string; email: string; role: string; agency_name?: string } 
}) {
  const router = useRouter()
  const supabase = createClient()
  
  const [isOpen, setIsOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [newName, setNewName] = useState(profile.name)
  const [isUpdating, setIsUpdating] = useState(false)
  const [updateStatus, setUpdateStatus] = useState<{type: 'success' | 'error', message: string} | null>(null)
  
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsUpdating(true)
    setUpdateStatus(null)
    
    const res = await updateProfileName(newName)
    
    if (res.success) {
      setUpdateStatus({ type: 'success', message: 'Perfil actualizado exitosamente' })
      setTimeout(() => {
        setIsEditModalOpen(false)
        setUpdateStatus(null)
      }, 1500)
    } else {
      setUpdateStatus({ type: 'error', message: res.error || 'Error desconocido' })
    }
    setIsUpdating(false)
  }

  const initials = profile.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 hover:bg-muted/50 p-1.5 rounded-full transition-colors"
      >
        <div className="h-8 w-8 rounded-full bg-primary/20 border border-primary/50 flex items-center justify-center text-sm font-medium text-primary">
          {initials}
        </div>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 rounded-xl border border-border bg-popover text-popover-foreground shadow-md z-50 animate-in fade-in slide-in-from-top-2">
        <div className="p-4 border-b border-border">
          <p className="font-medium truncate">{profile.name}</p>
          <p className="text-xs text-muted-foreground truncate">{profile.email}</p>
          <div className="mt-2 flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold tracking-wider">
              {profile.role}
            </span>
            {profile.agency_name && (
              <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                <Building className="h-3 w-3" />
                {profile.agency_name}
              </span>
            )}
          </div>
        </div>
        <div className="p-2 space-y-1 border-b border-border">
          <button 
            onClick={() => {
              setIsOpen(false)
              setIsEditModalOpen(true)
            }}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
          >
            <Settings className="h-4 w-4" />
            Editar Perfil
          </button>
        </div>
        <div className="p-2">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-rose-500 hover:bg-rose-500/10 rounded-md transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Cerrar Sesión
          </button>
        </div>
      </div>
      )}

      {/* Edit Modal via Portal to escape header's backdrop-filter containing block */}
      {isEditModalOpen && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-card border border-border rounded-xl shadow-lg p-6 animate-in zoom-in-95 fade-in">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Settings className="w-5 h-5 text-primary" />
                Editar Perfil
              </h3>
              <button 
                onClick={() => {
                  setIsEditModalOpen(false)
                  setUpdateStatus(null)
                  setNewName(profile.name)
                }}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">
                  Nombre y Apellido
                </label>
                <input 
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Tu nombre completo"
                  className="w-full px-3 py-2 border border-input rounded-md bg-background focus:ring-2 focus:ring-primary outline-none"
                  required
                />
              </div>
              
              {updateStatus?.type === 'error' && (
                <p className="text-sm text-rose-500 font-medium">{updateStatus.message}</p>
              )}
              {updateStatus?.type === 'success' && (
                <p className="text-sm text-emerald-500 font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> {updateStatus.message}
                </p>
              )}

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={isUpdating || !newName.trim() || newName.trim() === profile.name}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {isUpdating && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isUpdating ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}
