"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { CheckCircle2 } from "lucide-react"
import { useEffect } from "react"

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [isInvite, setIsInvite] = useState(false)
  const [name, setName] = useState("")
  const supabase = createClient()

  useEffect(() => {
    if (typeof window !== "undefined") {
      if (window.location.hash.includes("type=invite")) {
        setIsInvite(true)
      }
    }
  }, [])

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden")
      return
    }

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres")
      return
    }

    if (isInvite && !name.trim()) {
      setError("Por favor, ingresa tu nombre completo")
      return
    }

    setLoading(true)
    setError(null)
    
    const { data, error } = await supabase.auth.updateUser({ password })

    if (error) {
      setError(error.message)
    } else {
      if (isInvite && name.trim() && data.user) {
        await supabase.from('profiles').update({ name: name.trim() }).eq('id', data.user.id)
      }
      setSuccess(true)
      setTimeout(() => {
        window.location.href = "/" // Redirect to dashboard after a delay
      }, 2500)
    }
    
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8 bg-card p-8 rounded-xl border border-border shadow-lg">
        <div className="flex flex-col items-center">
          <img src="/logo-crisol.png" alt="Crisol Logo" className="h-32 w-auto mb-6 object-contain" />
          <h2 className="text-2xl font-bold tracking-tight text-foreground">{isInvite ? "Bienvenido a Crisol" : "Actualizar Contraseña"}</h2>
          <p className="text-sm text-muted-foreground mt-2 text-center">
            {isInvite ? "Completa tus datos para activar tu cuenta en la plataforma." : "Establece tu nueva contraseña para acceder a la plataforma."}
          </p>
        </div>

        {success ? (
          <div className="flex flex-col items-center space-y-4 py-4 animate-in fade-in zoom-in duration-300">
            <CheckCircle2 className="w-16 h-16 text-emerald-500" />
            <h3 className="text-xl font-bold text-foreground">¡Contraseña actualizada!</h3>
            <p className="text-sm text-muted-foreground text-center">
              Tu contraseña se guardó exitosamente. Redirigiendo a tu cuenta...
            </p>
          </div>
        ) : (
          <form onSubmit={handleUpdate} className="space-y-6">
            {error && (
              <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md border border-destructive/30 animate-in fade-in slide-in-from-top-2">
                {error}
              </div>
            )}
            {isInvite && (
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none text-foreground">Nombre Completo</label>
                <input 
                  type="text" 
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" 
                  placeholder="Ej. Juan Pérez"
                />
              </div>
            )}
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none text-foreground">Nueva Contraseña</label>
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none text-foreground">Confirmar Contraseña</label>
              <input 
                type="password" 
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" 
              />
            </div>
            <button 
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 disabled:opacity-50"
            >
              {loading ? "Guardando..." : (isInvite ? "Activar Cuenta" : "Guardar Contraseña")}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
