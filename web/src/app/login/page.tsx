"use client"

import { useState, useEffect } from "react"
import { 
  ShieldCheck, 
  Lock, 
  Mail, 
  KeyRound, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Eye, 
  EyeOff, 
  Sparkles,
  ArrowLeft,
  Copy,
  Check
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useLanguage } from "@/components/language-provider"
import { requestPasswordRecovery, completePasswordResetWithOtp } from "@/app/actions/auth"

type ViewMode = "login" | "recovery_request" | "recovery_reset"

export default function LoginPage() {
  const lang = useLanguage()
  const [viewMode, setViewMode] = useState<ViewMode>("login")
  
  // Login fields
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  
  // Recovery fields
  const [recoveryEmail, setRecoveryEmail] = useState("")
  const [recoveryToken, setRecoveryToken] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showNewPassword, setShowNewPassword] = useState(false)
  
  // Feedback states
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [generatedOtp, setGeneratedOtp] = useState<string | null>(null)
  const [directLink, setDirectLink] = useState<string | null>(null)
  const [copiedOtp, setCopiedOtp] = useState(false)
  const [loading, setLoading] = useState(false)
  
  const supabase = createClient()

  const t = {
    es: {
      brandTagline: "Underwriting Co-Pilot • Portal Privado",
      restrictedTitle: "Acceso Exclusivo de Suscripción",
      restrictedNotice: "Este sistema contiene información confidencial de apetito de riesgo y cotizaciones. Se requiere autenticación para acceder a los módulos de la plataforma.",
      loginTab: "Iniciar Sesión",
      recoveryTab: "Recuperar Contraseña",
      emailLabel: "Correo Electrónico Corporativo",
      emailPlaceholder: "nombre@agencia.com",
      passwordLabel: "Contraseña",
      passwordPlaceholder: "••••••••",
      forgotPasswordLink: "¿Olvidaste tu contraseña?",
      signInBtn: "Acceder al Portal",
      authenticating: "Autenticando...",
      recoveryTitle: "Asistente de Recuperación de Acceso",
      recoverySubtitle: "Ingresa tu correo institucional para generar tu clave o enlace seguro de restablecimiento.",
      sendRecoveryBtn: "Generar Código de Recuperación",
      processing: "Procesando solicitud...",
      resetTitle: "Establecer Nueva Contraseña",
      resetSubtitle: "Ingresa el código de verificación y define tu nueva clave de acceso.",
      tokenLabel: "Código de Verificación (OTP)",
      tokenPlaceholder: "Ej. 849201",
      tokenHelper: "Si el correo tarda en llegar a tu bandeja, puedes utilizar la clave segura generada directamente aquí.",
      newPasswordLabel: "Nueva Contraseña",
      confirmPasswordLabel: "Confirmar Nueva Contraseña",
      completeResetBtn: "Restablecer y Guardar Contraseña",
      backToLogin: "Regresar al inicio de sesión",
      passwordsDoNotMatch: "Las contraseñas no coinciden.",
      passwordMinLength: "La nueva contraseña debe tener al menos 6 caracteres.",
      emailRequired: "Por favor, ingresa tu correo electrónico.",
      tokenRequired: "Por favor, ingresa el código de verificación.",
      copiedText: "Código copiado",
      securityBadge: "Cifrado Bancario TLS 1.3 • Acceso Auditado"
    },
    en: {
      brandTagline: "Underwriting Co-Pilot • Private Portal",
      restrictedTitle: "Exclusive Underwriting Access",
      restrictedNotice: "This platform contains confidential risk appetite and rating intelligence. Verified authentication is strictly required to unlock system modules.",
      loginTab: "Sign In",
      recoveryTab: "Password Recovery",
      emailLabel: "Corporate Email Address",
      emailPlaceholder: "name@agency.com",
      passwordLabel: "Password",
      passwordPlaceholder: "••••••••",
      forgotPasswordLink: "Forgot your password?",
      signInBtn: "Enter Private Portal",
      authenticating: "Authenticating...",
      recoveryTitle: "Account Recovery Assistant",
      recoverySubtitle: "Enter your registered email to generate your secure recovery code or instant link.",
      sendRecoveryBtn: "Generate Recovery Code",
      processing: "Processing request...",
      resetTitle: "Set New Password",
      resetSubtitle: "Enter the verification code and choose your new security credentials.",
      tokenLabel: "Verification Code (OTP)",
      tokenPlaceholder: "E.g. 849201",
      tokenHelper: "If your mail server delays the message, use the secure code generated on this screen.",
      newPasswordLabel: "New Password",
      confirmPasswordLabel: "Confirm New Password",
      completeResetBtn: "Save & Update Password",
      backToLogin: "Back to Sign In",
      passwordsDoNotMatch: "Passwords do not match.",
      passwordMinLength: "New password must be at least 6 characters.",
      emailRequired: "Please enter your email address.",
      tokenRequired: "Please enter the verification code.",
      copiedText: "Code copied",
      securityBadge: "TLS 1.3 Enterprise Encryption • Audited Access"
    }
  }

  const currentLang = t[lang as keyof typeof t] || t.es

  useEffect(() => {
    // Detect implicit hash tokens from recovery or invite emails
    if (typeof window !== "undefined") {
      const hash = window.location.hash
      if (hash && (hash.includes("type=recovery") || hash.includes("type=invite"))) {
        window.location.href = "/update-password" + hash
      }
    }
  }, [])

  // Handle standard login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccessMessage(null)

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    })

    if (signInError) {
      setError(
        signInError.message === "Invalid login credentials"
          ? "Credenciales inválidas. Verifica tu correo y contraseña o recupera tu acceso."
          : signInError.message
      )
      setLoading(false)
    } else {
      window.location.href = "/"
    }
  }

  // Handle Step 1 of Recovery: request link & OTP code
  const handleRequestRecovery = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!recoveryEmail.trim()) {
      setError(currentLang.emailRequired)
      return
    }

    setLoading(true)
    setError(null)
    setSuccessMessage(null)
    setGeneratedOtp(null)
    setDirectLink(null)

    const res = await requestPasswordRecovery(recoveryEmail.trim())

    if (!res.success) {
      setError(res.error || "No se pudo procesar la solicitud.")
      setLoading(false)
      return
    }

    // Success: capture OTP if generated and transition to Reset step
    if (res.emailOtp) {
      setGeneratedOtp(res.emailOtp)
      setRecoveryToken(res.emailOtp) // prefill for the user convenience
    }
    if (res.directLink) {
      setDirectLink(res.directLink)
    }

    setSuccessMessage(
      res.emailSent
        ? "Se ha enviado un correo con las instrucciones. Además, hemos generado tu código de seguridad en pantalla."
        : "Código de seguridad generado con éxito. Úsalo a continuación para restablecer tu contraseña."
    )
    setViewMode("recovery_reset")
    setLoading(false)
  }

  // Handle Step 2 of Recovery: complete password update with token
  const handleCompleteReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!recoveryToken.trim()) {
      setError(currentLang.tokenRequired)
      return
    }

    if (newPassword !== confirmPassword) {
      setError(currentLang.passwordsDoNotMatch)
      return
    }

    if (newPassword.length < 6) {
      setError(currentLang.passwordMinLength)
      return
    }

    setLoading(true)
    const res = await completePasswordResetWithOtp(
      recoveryEmail.trim(),
      recoveryToken.trim(),
      newPassword
    )

    if (!res.success) {
      setError(res.error || "Error al restablecer la contraseña.")
      setLoading(false)
    } else {
      setSuccessMessage(res.message || "¡Contraseña actualizada exitosamente!")
      setEmail(recoveryEmail.trim())
      setPassword("")
      setLoading(false)
      setTimeout(() => {
        setViewMode("login")
        setSuccessMessage("Tu contraseña ha sido actualizada. Ingresa tus nuevas credenciales.")
      }, 2000)
    }
  }

  const handleCopyOtp = () => {
    if (!generatedOtp) return
    navigator.clipboard.writeText(generatedOtp)
    setCopiedOtp(true)
    setTimeout(() => setCopiedOtp(false), 2500)
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-[#070b14] text-slate-100 p-4 sm:p-6 lg:p-8 selection:bg-amber-500/30 selection:text-amber-200">
      {/* Ambient background glows */}
      <div className="absolute -top-48 -left-48 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-48 -right-48 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-slate-900/40 radial-glow rounded-full blur-[140px] pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-lg relative z-10 animate-in fade-in zoom-in-95 duration-500">
        {/* Top Status & Brand Badge */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-300 text-xs font-semibold tracking-wider uppercase mb-5 shadow-[0_0_15px_rgba(245,158,11,0.15)]">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>{currentLang.brandTagline}</span>
          </div>

          <div className="relative group cursor-default">
            <div className="absolute -inset-2 bg-gradient-to-r from-amber-500/20 via-primary/20 to-amber-500/20 rounded-2xl blur-lg opacity-70 group-hover:opacity-100 transition duration-500" />
            <div className="relative p-2 rounded-2xl bg-slate-950/80 border border-white/10 shadow-2xl backdrop-blur-xl">
              <img 
                src="/logo-crisol.png" 
                alt="Crisol" 
                className="h-28 sm:h-32 w-auto object-contain drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]" 
              />
            </div>
          </div>
        </div>

        {/* Card Frame */}
        <div className="rounded-3xl border border-white/10 bg-slate-950/70 backdrop-blur-2xl shadow-[0_16px_48px_rgba(0,0,0,0.6)] p-6 sm:p-8">
          
          {/* Unauthenticated Security Banner */}
          <div className="mb-6 p-4 rounded-2xl bg-slate-900/80 border border-amber-500/20 text-slate-300 text-xs sm:text-sm flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-white tracking-wide text-xs uppercase mb-1">
                {currentLang.restrictedTitle}
              </p>
              <p className="text-slate-400 text-xs leading-relaxed">
                {currentLang.restrictedNotice}
              </p>
            </div>
          </div>

          {/* Feedback Messages */}
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs sm:text-sm flex items-center gap-2.5 animate-in fade-in slide-in-from-top-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-5 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs sm:text-sm flex items-center gap-2.5 animate-in fade-in slide-in-from-top-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* VIEW 1: SIGN IN */}
          {viewMode === "login" && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  {currentLang.emailLabel}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={currentLang.emailPlaceholder}
                    className="w-full h-11 pl-10 pr-4 rounded-xl bg-slate-900/90 border border-slate-800 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/20 transition duration-200"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    {currentLang.passwordLabel}
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setError(null)
                      setSuccessMessage(null)
                      setRecoveryEmail(email)
                      setViewMode("recovery_request")
                    }}
                    className="text-xs font-medium text-amber-400 hover:text-amber-300 transition underline underline-offset-4"
                  >
                    {currentLang.forgotPasswordLink}
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={currentLang.passwordPlaceholder}
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

              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 mt-2 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-500 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm tracking-wide shadow-[0_0_20px_rgba(245,158,11,0.25)] hover:shadow-[0_0_25px_rgba(245,158,11,0.4)] transition duration-200 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                    <span>{currentLang.authenticating}</span>
                  </>
                ) : (
                  <>
                    <span>{currentLang.signInBtn}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* VIEW 2: RECOVERY REQUEST (STEP 1) */}
          {viewMode === "recovery_request" && (
            <form onSubmit={handleRequestRecovery} className="space-y-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-amber-400" />
                  {currentLang.recoveryTitle}
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  {currentLang.recoverySubtitle}
                </p>
              </div>

              <div className="space-y-1.5 pt-2">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  {currentLang.emailLabel}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={recoveryEmail}
                    onChange={(e) => setRecoveryEmail(e.target.value)}
                    placeholder={currentLang.emailPlaceholder}
                    className="w-full h-11 pl-10 pr-4 rounded-xl bg-slate-900/90 border border-slate-800 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/20 transition duration-200"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 mt-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm tracking-wide shadow-[0_0_20px_rgba(245,158,11,0.25)] transition duration-200 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                    <span>{currentLang.processing}</span>
                  </>
                ) : (
                  <>
                    <span>{currentLang.sendRecoveryBtn}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setError(null)
                    setSuccessMessage(null)
                    setViewMode("login")
                  }}
                  className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>{currentLang.backToLogin}</span>
                </button>
              </div>
            </form>
          )}

          {/* VIEW 3: RECOVERY RESET (STEP 2) */}
          {viewMode === "recovery_reset" && (
            <form onSubmit={handleCompleteReset} className="space-y-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-amber-400" />
                  {currentLang.resetTitle}
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  {currentLang.resetSubtitle}
                </p>
              </div>

              {/* Instant Assistant OTP Box (Guarantees recovery even if Supabase SMTP fails) */}
              {generatedOtp && (
                <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-amber-300 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      Clave de Seguridad Generada:
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyOtp}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/20 hover:bg-amber-500/30 text-[11px] font-medium text-amber-200 transition"
                    >
                      {copiedOtp ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span>{currentLang.copiedText}</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copiar</span>
                        </>
                      )}
                    </button>
                  </div>
                  <div className="flex items-center justify-between bg-slate-950/60 px-3 py-2 rounded-xl border border-amber-500/20 font-mono text-sm tracking-widest text-amber-300 font-bold">
                    <span>{generatedOtp}</span>
                    <span className="text-[10px] text-amber-400/80 font-sans tracking-normal font-normal">
                      Válido ahora
                    </span>
                  </div>
                  <p className="text-[11px] text-amber-200/70 leading-relaxed">
                    {currentLang.tokenHelper}
                  </p>
                </div>
              )}

              {/* Token Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  {currentLang.tokenLabel}
                </label>
                <input
                  type="text"
                  required
                  value={recoveryToken}
                  onChange={(e) => setRecoveryToken(e.target.value)}
                  placeholder={currentLang.tokenPlaceholder}
                  className="w-full h-11 px-4 font-mono rounded-xl bg-slate-900/90 border border-slate-800 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/20 transition duration-200"
                />
              </div>

              {/* New Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  {currentLang.newPasswordLabel}
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showNewPassword ? "text" : "password"}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    className="w-full h-11 pl-10 pr-10 rounded-xl bg-slate-900/90 border border-slate-800 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/20 transition duration-200"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 focus:outline-none"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  {currentLang.confirmPasswordLabel}
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showNewPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirma la contraseña"
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
                    <span>Guardando contraseña...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{currentLang.completeResetBtn}</span>
                  </>
                )}
              </button>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setError(null)
                    setSuccessMessage(null)
                    setViewMode("login")
                  }}
                  className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>{currentLang.backToLogin}</span>
                </button>
              </div>
            </form>
          )}

          {/* Footer Security Badge */}
          <div className="mt-8 pt-5 border-t border-slate-900 flex items-center justify-center gap-2 text-[11px] text-slate-500">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-500/70" />
            <span>{currentLang.securityBadge}</span>
          </div>
        </div>

        {/* Corporate Footer Note */}
        <div className="mt-6 text-center text-xs text-slate-500">
          Crisol Underwriting Co-Pilot • Diseñado y desarrollado por{" "}
          <span className="text-amber-400 font-semibold">Arasue Forge</span>
        </div>
      </div>
    </div>
  )
}
