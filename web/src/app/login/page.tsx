"use client"

import { useState } from "react"
import { ShieldCheck } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

export default function LoginPage() {
  const [email, setEmail] = useState("manager@crisol.app")
  const [password, setPassword] = useState("pass1234")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [resetSuccess, setResetSuccess] = useState(false)
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      window.location.href = "/" // Redirect to dashboard
    }
  }

  const handleResetPassword = async () => {
    if (!email) {
      setError("Por favor, ingresa tu correo electrónico arriba para recuperar tu contraseña")
      return
    }
    
    setLoading(true)
    setError(null)
    setResetSuccess(false)
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/update-password`,
    })

    if (error) {
      setError(error.message)
    } else {
      setResetSuccess(true)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8 bg-card p-8 rounded-xl border border-border shadow-lg">
        <div className="flex flex-col items-center">
          <img src="/logo-crisol.png" alt="Crisol Logo" className="h-64 w-auto -mt-6 mb-2 object-contain" />
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Acceso al Portal</h2>
          <p className="text-sm text-muted-foreground mt-2">Ingresa tus credenciales para continuar</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          {error && (
            <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md border border-destructive/30 animate-in fade-in slide-in-from-top-2">
              {error}
            </div>
          )}
          {resetSuccess && (
            <div className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-sm p-3 rounded-md border border-emerald-500/30 animate-in fade-in slide-in-from-top-2">
              Se ha enviado un correo con las instrucciones para recuperar tu contraseña. Revisa tu bandeja de entrada o spam.
            </div>
          )}
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none text-foreground">Correo Electrónico</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" 
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium leading-none text-foreground">Contraseña</label>
              <button 
                type="button" 
                onClick={handleResetPassword}
                disabled={loading}
                className="text-xs font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm disabled:opacity-50"
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" 
            />
          </div>
          <button 
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 disabled:opacity-50"
          >
            {loading ? "Autenticando..." : "Iniciar Sesión"}
          </button>
        </form>
      </div>
    </div>
  )
}
