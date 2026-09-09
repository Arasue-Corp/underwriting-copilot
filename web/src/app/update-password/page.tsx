"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { CheckCircle2, Lock, Eye, EyeOff, Sparkles, RefreshCw, AlertCircle, ArrowLeft } from "lucide-react"
import { useLanguage } from "@/components/language-provider"
import { completePasswordResetWithOtp } from "@/app/actions/auth"

export default function UpdatePasswordPage() {
  const lang = useLanguage()
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [name, setName] = useState("")
  const [isInvite, setIsInvite] = useState(false)
  
  // Fallback if session is missing
  const [sessionChecked, setSessionChecked] = useState(false)
  const [hasSession, setHasSession] = useState(true)
  const [fallbackEmail, setFallbackEmail] = useState("")
  const [fallbackToken, setFallbackToken] = useState("")

  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  
  const supabase = createClient()

  const t = {
    es: {
      brandTagline: "Underwriting Co-Pilot • Seguridad de Acceso",
      welcome: "Bienvenido a Crisol",
      updatePassword: "Establecer Nueva Contraseña",
      inviteDesc: "Completa tus datos para activar tu cuenta corporativa.",
      updateDesc: "Ingresa tu nueva contraseña para acceder de inmediato a la plataforma.",
      passwordMatchError: "Las contraseñas no coinciden.",
      passwordLengthError: "La contraseña debe tener al menos 6 caracteres.",
      nameRequired: "Por favor, ingresa tu nombre completo.",
      updatedSuccess: "¡Contraseña Actualizada!",
      redirecting: "Tus nuevas credenciales han sido guardadas. Redirigiendo a tu cuenta...",
      fullName: "Nombre Completo",
      newPassword: "Nueva Contraseña",
      confirmPassword: "Confirmar Contraseña",
      saving: "Guardando contraseña...",
      activateAccount: "Activar Cuenta y Entrar",
      savePassword: "Guardar Contraseña",
      backToLogin: "Regresar al inicio de sesión",
      fallbackNotice: "No se detectó una sesión automática activa. Ingresa tu correo y código de verificación para completar el restablecimiento."
    },
    en: {
      brandTagline: "Underwriting Co-Pilot • Access Security",
      welcome: "Welcome to Crisol",
      updatePassword: "Set New Password",
      inviteDesc: "Complete your information to activate your corporate account.",
      updateDesc: "Enter your new password to immediately unlock access to the platform.",
      passwordMatchError: "Passwords do not match.",
      passwordLengthError: "Password must be at least 6 characters long.",
      nameRequired: "Please enter your full name.",
      updatedSuccess: "Password Updated!",
      redirecting: "Your new credentials have been saved. Redirecting to your account...",
      fullName: "Full Name",
      newPassword: "New Password",
      confirmPassword: "Confirm Password",
      saving: "Saving password...",
      activateAccount: "Activate Account & Enter",
      savePassword: "Save Password",
      backToLogin: "Back to Sign In",
      fallbackNotice: "Automatic session was not detected. Please provide your email and verification code to finalize password reset."
    }
  }

  const currentLang = t[lang as keyof typeof t] || t.es

  useEffect(() => {
    async function checkAuth() {
      if (typeof window !== "undefined") {
        const hash = window.location.hash
        if (hash.includes("type=invite")) {
          setIsInvite(true)
        }
        
        // Check if there is an active session
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) {
          setHasSession(false)
        } else {
          setHasSession(true)
        }
        setSessionChecked(true)
      }
    }
    checkAuth()
  }, [])

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    
    if (password !== confirmPassword) {
      setError(currentLang.passwordMatchError)
      return
    }

    if (password.length < 6) {
      setError(currentLang.passwordLengthError)
      return
    }

    if (isInvite && !name.trim()) {
      setError(currentLang.nameRequired)
      return
    }

    setLoading(true)

    // Method 1: standard Supabase session update
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

      // If session error occurred, switch to fallback
      if (updateError.message.toLowerCase().includes("session")) {
        setHasSession(false)
      } else {
        setError(updateError.message)
        setLoading(false)
        return
      }
    }

    // Method 2: Fallback with direct OTP verification
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
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-[#070b14] text-slate-100 p-4 sm:p-6 lg:p-8 selection:bg-amber-500/30 selection:text-amber-200">
      {/* Background ambient lights */}
      <div className="absolute -top-48 -left-48 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-48 -right-48 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-lg relative z-10 animate-in fade-in zoom-in-95 duration-500">
        {/* Header Branding */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-300 text-xs font-semibold tracking-wider uppercase mb-5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>{currentLang.brandTagline}</span>
          </div>

          <div className="relative p-2 rounded-2xl bg-slate-950/80 border border-white/10 shadow-2xl backdrop-blur-xl">
            <img 
              src="/logo-crisol.png" 
              alt="Crisol" 
              className="h-24 sm:h-28 w-auto object-contain" 
            />
          </div>
        </div>

        {/* Card Frame */}
        <div className="rounded-3xl border border-white/10 bg-slate-950/70 backdrop-blur-2xl shadow-[0_16px_48px_rgba(0,0,0,0.6)] p-6 sm:p-8">
          <div className="mb-6 text-center">
            <h2 className="text-xl font-bold tracking-tight text-white">
              {isInvite ? currentLang.welcome : currentLang.updatePassword}
            </h2>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              {isInvite ? currentLang.inviteDesc : currentLang.updateDesc}
            </p>
          </div>

          {success ? (
            <div className="flex flex-col items-center space-y-4 py-8 text-center animate-in fade-in zoom-in duration-300">
              <div className="p-3 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <CheckCircle2 className="w-12 h-12" />
              </div>
              <h3 className="text-xl font-bold text-white">{currentLang.updatedSuccess}</h3>
              <p className="text-xs text-slate-400 max-w-xs">
                {currentLang.redirecting}
              </p>
            </div>
          ) : (
            <form onSubmit={handleUpdate} className="space-y-4">
              {error && (
                <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs sm:text-sm flex items-center gap-2.5 animate-in fade-in slide-in-from-top-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Fallback inputs if session was lost */}
              {!hasSession && (
                <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-200 text-xs space-y-3">
                  <p className="font-medium text-amber-300">
                    {currentLang.fallbackNotice}
                  </p>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-300 uppercase">
                      Correo Electrónico
                    </label>
                    <input
                      type="email"
                      required
                      value={fallbackEmail}
                      onChange={(e) => setFallbackEmail(e.target.value)}
                      placeholder="nombre@agencia.com"
                      className="w-full h-9 px-3 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-300 uppercase">
                      Código de Verificación (OTP)
                    </label>
                    <input
                      type="text"
                      required
                      value={fallbackToken}
                      onChange={(e) => setFallbackToken(e.target.value)}
                      placeholder="Código recibido o generado"
                      className="w-full h-9 px-3 font-mono rounded-lg bg-slate-900 border border-slate-700 text-xs text-white mt-1"
                    />
                  </div>
                </div>
              )}

              {isInvite && (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    {currentLang.fullName}
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ej. Juan Pérez"
                    className="w-full h-11 px-4 rounded-xl bg-slate-900/90 border border-slate-800 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/20 transition duration-200"
                  />
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  {currentLang.newPassword}
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    className="w-full h-11 pl-10 pr-10 rounded-xl bg-slate-900/90 border border-slate-800 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/20 transition duration-200"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 focus:outline-none"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  {currentLang.confirmPassword}
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirma la nueva contraseña"
                    className="w-full h-11 pl-10 pr-4 rounded-xl bg-slate-900/90 border border-slate-800 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/20 transition duration-200"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 mt-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-bold text-sm tracking-wide shadow-[0_0_20px_rgba(16,185,129,0.25)] transition duration-200 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                    <span>{currentLang.saving}</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{isInvite ? currentLang.activateAccount : currentLang.savePassword}</span>
                  </>
                )}
              </button>

              <div className="pt-2 text-center">
                <a
                  href="/login"
                  className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>{currentLang.backToLogin}</span>
                </a>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
