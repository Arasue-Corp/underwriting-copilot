"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { CheckCircle2, Lock, Eye, EyeOff, AlertCircle, ArrowLeft } from "lucide-react"
import { useLanguage } from "@/components/language-provider"
import { completePasswordResetWithOtp } from "@/app/actions/auth"

export default function UpdatePasswordPage() {
  const langContext = useLanguage()
  const lang = (langContext === "en" || langContext === "es") ? langContext : "es"

  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [name, setName] = useState("")
  const [isInvite, setIsInvite] = useState(false)
  
  // Fallback si la sesión no se conectó
  const [hasSession, setHasSession] = useState(true)
  const [fallbackEmail, setFallbackEmail] = useState("")
  const [fallbackToken, setFallbackToken] = useState("")

  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  
  const supabase = createClient()

  const t = {
    es: {
      welcome: "Bienvenido a Crisol",
      updatePassword: "Establecer Nueva Contraseña",
      inviteDesc: "Completa tus datos para activar tu cuenta en la plataforma.",
      updateDesc: "Ingresa tu nueva contraseña para acceder de inmediato a la plataforma.",
      passwordMatchError: "Las contraseñas no coinciden.",
      passwordLengthError: "La contraseña debe tener al menos 6 caracteres.",
      nameRequired: "Por favor, ingresa tu nombre completo.",
      updatedSuccess: "¡Contraseña Actualizada!",
      redirecting: "Tu contraseña se guardó exitosamente. Redirigiendo...",
      fullName: "Nombre Completo",
      newPassword: "Nueva Contraseña",
      confirmPassword: "Confirmar Contraseña",
      saving: "Guardando...",
      activateAccount: "Activar Cuenta",
      savePassword: "Guardar Contraseña",
      backToLogin: "Regresar al inicio de sesión",
      fallbackNotice: "No se detectó una sesión activa de navegador. Ingresa tu correo y código de verificación para completar el restablecimiento.",
      developedBy: "Desarrollado por"
    },
    en: {
      welcome: "Welcome to Crisol",
      updatePassword: "Set New Password",
      inviteDesc: "Complete your details to activate your account on the platform.",
      updateDesc: "Enter your new password to immediately access the platform.",
      passwordMatchError: "Passwords do not match.",
      passwordLengthError: "Password must be at least 6 characters long.",
      nameRequired: "Please enter your full name.",
      updatedSuccess: "Password Updated!",
      redirecting: "Your password was saved successfully. Redirecting...",
      fullName: "Full Name",
      newPassword: "New Password",
      confirmPassword: "Confirm Password",
      saving: "Saving...",
      activateAccount: "Activate Account",
      savePassword: "Save Password",
      backToLogin: "Back to sign in",
      fallbackNotice: "No active browser session was detected. Please provide your email and verification code to finalize password reset.",
      developedBy: "Developed by"
    }
  }[lang]

  useEffect(() => {
    async function checkAuth() {
      if (typeof window !== "undefined") {
        const hash = window.location.hash
        if (hash.includes("type=invite")) {
          setIsInvite(true)
        }
        
        const { data: { session } } = await supabase.auth.getSession()
        setHasSession(!!session)
      }
    }
    checkAuth()
  }, [])

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    
    if (password !== confirmPassword) {
      setError(t.passwordMatchError)
      return
    }

    if (password.length < 6) {
      setError(t.passwordLengthError)
      return
    }

    if (isInvite && !name.trim()) {
      setError(t.nameRequired)
      return
    }

    setLoading(true)

    // Método 1: Actualización con sesión normal
    if (hasSession) {
      const { data, error: updateError } = await supabase.auth.updateUser({ password })

      if (!updateError) {
        if (isInvite && name.trim() && data.user) {
          await supabase.from("profiles").update({ name: name.trim() }).eq("id", data.user.id)
        }
        setSuccess(true)
        setTimeout(() => {
          window.location.href = "/"
        }, 2000)
        setLoading(false)
        return
      }

      if (updateError.message.toLowerCase().includes("session")) {
        setHasSession(false)
      } else {
        setError(updateError.message)
        setLoading(false)
        return
      }
    }

    // Método 2: Fallback con OTP si se perdió la sesión
    if (!fallbackEmail.trim() || !fallbackToken.trim()) {
      setError("Por favor ingresa tu correo y código de verificación.")
      setLoading(false)
      return
    }

    const res = await completePasswordResetWithOtp(fallbackEmail.trim(), fallbackToken.trim(), password)
    if (!res.success) {
      setError(res.error || "No se pudo actualizar la contraseña.")
      setLoading(false)
    } else {
      setSuccess(true)
      setTimeout(() => {
        window.location.href = "/login"
      }, 2000)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background text-foreground premium-bg relative selection:bg-primary/20 selection:text-primary">
      <div className="w-full max-w-md space-y-6">
        
        <div className="w-full bg-card border border-border shadow-lg rounded-2xl p-6 sm:p-8 space-y-6">
          
          <div className="flex flex-col items-center text-center">
            <img 
              src="/logo-crisol.png" 
              alt="Crisol Logo" 
              className="h-32 w-auto -mt-4 mb-2 object-contain" 
            />
            <h2 className="text-2xl font-bold tracking-tight text-foreground font-playfair">
              {isInvite ? t.welcome : t.updatePassword}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {isInvite ? t.inviteDesc : t.updateDesc}
            </p>
          </div>

          {success ? (
            <div className="flex flex-col items-center space-y-3 py-6 text-center animate-in fade-in zoom-in duration-300">
              <CheckCircle2 className="w-14 h-14 text-emerald-500" />
              <h3 className="text-xl font-bold text-foreground">{t.updatedSuccess}</h3>
              <p className="text-sm text-muted-foreground">
                {t.redirecting}
              </p>
            </div>
          ) : (
            <form onSubmit={handleUpdate} className="space-y-4">
              {error && (
                <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md border border-destructive/30 flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {!hasSession && (
                <div className="p-3.5 rounded-xl bg-accent/20 border border-accent/40 text-accent-foreground text-xs space-y-3">
                  <p className="font-semibold">
                    {t.fallbackNotice}
                  </p>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-foreground">
                      Correo Electrónico
                    </label>
                    <input
                      type="email"
                      required
                      value={fallbackEmail}
                      onChange={(e) => setFallbackEmail(e.target.value)}
                      placeholder="nombre@agencia.com"
                      className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-xs ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-foreground">
                      Código de Verificación (OTP)
                    </label>
                    <input
                      type="text"
                      required
                      value={fallbackToken}
                      onChange={(e) => setFallbackToken(e.target.value)}
                      placeholder="Código de verificación"
                      className="flex h-9 w-full rounded-md border border-input bg-background font-mono px-3 py-1 text-xs ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    />
                  </div>
                </div>
              )}

              {isInvite && (
                <div className="space-y-2">
                  <label className="text-sm font-medium leading-none text-foreground">
                    {t.fullName}
                  </label>
                  <input 
                    type="text" 
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ej. Juan Pérez"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium leading-none text-foreground">
                  {t.newPassword}
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                  <input 
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    className="flex h-10 w-full rounded-md border border-input bg-background pl-9 pr-10 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium leading-none text-foreground">
                  {t.confirmPassword}
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                  <input 
                    type={showPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirma tu contraseña"
                    className="flex h-10 w-full rounded-md border border-input bg-background pl-9 pr-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </div>
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center rounded-md text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 disabled:opacity-50 cursor-pointer shadow-sm"
              >
                {loading ? t.saving : (isInvite ? t.activateAccount : t.savePassword)}
              </button>

              <div className="text-center pt-2">
                <a
                  href="/login"
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>{t.backToLogin}</span>
                </a>
              </div>
            </form>
          )}

        </div>

        <div className="text-center text-xs text-muted-foreground font-medium">
          {t.developedBy}{" "}
          <span className="text-primary font-bold">Arasue Forge</span>
        </div>

      </div>
    </div>
  )
}
