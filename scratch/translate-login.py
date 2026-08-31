file_path = 'web/src/app/login/page.tsx'

content = """"use client"

import { useState } from "react"
import { ShieldCheck } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useEffect } from "react"
import { useLanguage } from "@/components/language-provider"

export default function LoginPage() {
  const lang = useLanguage()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [resetSuccess, setResetSuccess] = useState(false)
  const supabase = createClient()

  const t = {
    es: {
      portalAccess: "Acceso al Portal",
      enterCredentials: "Ingresa tus credenciales para continuar",
      email: "Correo Electrónico",
      password: "Contraseña",
      forgotPassword: "¿Olvidaste tu contraseña?",
      authenticating: "Autenticando...",
      login: "Iniciar Sesión",
      enterEmailError: "Por favor, ingresa tu correo electrónico arriba para recuperar tu contraseña",
      resetSuccessMessage: "Se ha enviado un correo con las instrucciones para recuperar tu contraseña. Revisa tu bandeja de entrada o spam."
    },
    en: {
      portalAccess: "Portal Access",
      enterCredentials: "Enter your credentials to continue",
      email: "Email Address",
      password: "Password",
      forgotPassword: "Forgot your password?",
      authenticating: "Authenticating...",
      login: "Sign In",
      enterEmailError: "Please enter your email address above to reset your password",
      resetSuccessMessage: "An email has been sent with instructions to reset your password. Check your inbox or spam folder."
    }
  }

  const currentLang = t[lang as keyof typeof t] || t.en

  useEffect(() => {
    // Intercept Supabase implicit flow hash fragments (recovery or invite)
    // and redirect to /update-password so the client there can consume the session
    if (typeof window !== "undefined") {
      const hash = window.location.hash
      if (hash && (hash.includes("type=recovery") || hash.includes("type=invite"))) {
        window.location.href = "/update-password" + hash
      }
    }
  }, [])

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
      setError(currentLang.enterEmailError)
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
          <h2 className="text-2xl font-bold tracking-tight text-foreground">{currentLang.portalAccess}</h2>
          <p className="text-sm text-muted-foreground mt-2">{currentLang.enterCredentials}</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          {error && (
            <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md border border-destructive/30 animate-in fade-in slide-in-from-top-2">
              {error}
            </div>
          )}
          {resetSuccess && (
            <div className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-sm p-3 rounded-md border border-emerald-500/30 animate-in fade-in slide-in-from-top-2">
              {currentLang.resetSuccessMessage}
            </div>
          )}
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none text-foreground">{currentLang.email}</label>
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
              <label className="text-sm font-medium leading-none text-foreground">{currentLang.password}</label>
              <button 
                type="button" 
                onClick={handleResetPassword}
                disabled={loading}
                className="text-xs font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm disabled:opacity-50"
              >
                {currentLang.forgotPassword}
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
            {loading ? currentLang.authenticating : currentLang.login}
          </button>
        </form>
      </div>
    </div>
  )
}
"""

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Done")
