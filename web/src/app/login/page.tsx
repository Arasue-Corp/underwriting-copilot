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
  ArrowLeft,
  Copy,
  Check
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useLanguage } from "@/components/language-provider"
import { requestPasswordRecovery, completePasswordResetWithOtp } from "@/app/actions/auth"

type ViewMode = "login" | "recovery_request" | "recovery_reset"

export default function LoginPage() {
  const langContext = useLanguage()
  const lang = (langContext === "en" || langContext === "es") ? langContext : "es"

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
  const [copiedOtp, setCopiedOtp] = useState(false)
  const [loading, setLoading] = useState(false)
  
  const supabase = createClient()

  const t = {
    es: {
      portalAccess: "Acceso al Portal",
      enterCredentials: "Ingresa tus credenciales para continuar",
      restrictedNotice: "Este sistema contiene información confidencial de cotizaciones y apetito de riesgo. Por favor inicia sesión para acceder a los módulos de la plataforma.",
      email: "Correo Electrónico",
      emailPlaceholder: "nombre@agencia.com",
      password: "Contraseña",
      forgotPassword: "¿Olvidaste tu contraseña?",
      authenticating: "Autenticando...",
      login: "Iniciar Sesión",
      recoveryTitle: "Recuperar Contraseña",
      recoverySubtitle: "Ingresa tu correo para generar tu código o enlace seguro de recuperación.",
      sendRecoveryBtn: "Generar Código de Recuperación",
      processing: "Procesando...",
      resetTitle: "Establecer Nueva Contraseña",
      resetSubtitle: "Ingresa el código de verificación y define tu nueva contraseña.",
      tokenLabel: "Código de Verificación (OTP)",
      tokenPlaceholder: "Código de verificación",
      tokenHelper: "Si el correo tarda en llegar a tu bandeja, puedes utilizar el código generado a continuación:",
      newPasswordLabel: "Nueva Contraseña",
      confirmPasswordLabel: "Confirmar Contraseña",
      completeResetBtn: "Guardar Nueva Contraseña",
      backToLogin: "Regresar al inicio de sesión",
      passwordsDoNotMatch: "Las contraseñas no coinciden.",
      passwordMinLength: "La contraseña debe tener al menos 6 caracteres.",
      emailRequired: "Por favor, ingresa tu correo electrónico.",
      tokenRequired: "Por favor, ingresa el código de verificación.",
      copiedText: "Copiado",
      copyCode: "Copiar",
      developedBy: "Desarrollado por"
    },
    en: {
      portalAccess: "Portal Access",
      enterCredentials: "Enter your credentials to continue",
      restrictedNotice: "This platform contains confidential risk appetite and rating data. Please sign in to unlock application modules.",
      email: "Email Address",
      emailPlaceholder: "name@agency.com",
      password: "Password",
      forgotPassword: "Forgot your password?",
      authenticating: "Authenticating...",
      login: "Sign In",
      recoveryTitle: "Reset Password",
      recoverySubtitle: "Enter your email address to generate a secure recovery code or link.",
      sendRecoveryBtn: "Generate Recovery Code",
      processing: "Processing...",
      resetTitle: "Set New Password",
      resetSubtitle: "Enter your verification code and choose your new password.",
      tokenLabel: "Verification Code (OTP)",
      tokenPlaceholder: "Verification code",
      tokenHelper: "If the email is delayed, you can use the secure code generated below:",
      newPasswordLabel: "New Password",
      confirmPasswordLabel: "Confirm New Password",
      completeResetBtn: "Save New Password",
      backToLogin: "Back to sign in",
      passwordsDoNotMatch: "Passwords do not match.",
      passwordMinLength: "Password must be at least 6 characters.",
      emailRequired: "Please enter your email address.",
      tokenRequired: "Please enter the verification code.",
      copiedText: "Copied",
      copyCode: "Copy",
      developedBy: "Developed by"
    }
  }[lang]

  useEffect(() => {
    // Intercept implicit hash tokens (recovery or invite)
    if (typeof window !== "undefined") {
      const hash = window.location.hash
      if (hash && (hash.includes("type=recovery") || hash.includes("type=invite"))) {
        window.location.href = "/update-password" + hash
      }
    }
  }, [])

  // Iniciar Sesión
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
          ? "Credenciales inválidas. Verifica tu correo y contraseña."
          : signInError.message
      )
      setLoading(false)
    } else {
      window.location.href = "/"
    }
  }

  // Paso 1 Recuperación: solicitar enlace y OTP
  const handleRequestRecovery = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!recoveryEmail.trim()) {
      setError(t.emailRequired)
      return
    }

    setLoading(true)
    setError(null)
    setSuccessMessage(null)
    setGeneratedOtp(null)

    const res = await requestPasswordRecovery(recoveryEmail.trim())

    if (!res.success) {
      setError(res.error || "No se pudo procesar la solicitud.")
      setLoading(false)
      return
    }

    if (res.emailOtp) {
      setGeneratedOtp(res.emailOtp)
      setRecoveryToken(res.emailOtp)
    }

    setSuccessMessage(
      res.emailSent
        ? "Se ha enviado un correo con las instrucciones. También se generó tu código seguro en pantalla."
        : "Código de recuperación generado exitosamente. Úsalo a continuación para restablecer tu contraseña."
    )
    setViewMode("recovery_reset")
    setLoading(false)
  }

  // Paso 2 Recuperación: validar OTP y actualizar contraseña
  const handleCompleteReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!recoveryToken.trim()) {
      setError(t.tokenRequired)
      return
    }

    if (newPassword !== confirmPassword) {
      setError(t.passwordsDoNotMatch)
      return
    }

    if (newPassword.length < 6) {
      setError(t.passwordMinLength)
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
    setTimeout(() => setCopiedOtp(false), 2000)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background text-foreground premium-bg relative selection:bg-primary/20 selection:text-primary">
      <div className="w-full max-w-md space-y-6">
        
        {/* Main Card */}
        <div className="w-full bg-card border border-border shadow-lg rounded-2xl p-6 sm:p-8 space-y-6">
          
          {/* Header Brand */}
          <div className="flex flex-col items-center text-center">
            <img 
              src="/logo-crisol.png" 
              alt="Crisol Logo" 
              className="h-36 sm:h-40 w-auto -mt-4 mb-2 object-contain" 
            />
            <h2 className="text-2xl font-bold tracking-tight text-foreground font-playfair">
              {viewMode === "login" ? t.portalAccess : (viewMode === "recovery_request" ? t.recoveryTitle : t.resetTitle)}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {viewMode === "login" ? t.enterCredentials : (viewMode === "recovery_request" ? t.recoverySubtitle : t.resetSubtitle)}
            </p>
          </div>

          {/* Session Gate Notice */}
          <div className="p-3.5 rounded-xl bg-primary/5 border border-primary/15 text-xs text-muted-foreground flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              {t.restrictedNotice}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md border border-destructive/30 flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Success Message */}
          {successMessage && (
            <div className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-sm p-3 rounded-md border border-emerald-500/30 flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* VIEW 1: LOGIN */}
          {viewMode === "login" && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none text-foreground">
                  {t.email}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                  <input 
                    type="email" 
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t.emailPlaceholder}
                    className="flex h-10 w-full rounded-md border border-input bg-background pl-9 pr-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium leading-none text-foreground">
                    {t.password}
                  </label>
                  <button 
                    type="button" 
                    onClick={() => {
                      setError(null)
                      setSuccessMessage(null)
                      setRecoveryEmail(email)
                      setViewMode("recovery_request")
                    }}
                    className="text-xs font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm cursor-pointer"
                  >
                    {t.forgotPassword}
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                  <input 
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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

              <button 
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center rounded-md text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 disabled:opacity-50 cursor-pointer shadow-sm"
              >
                {loading ? t.authenticating : t.login}
              </button>
            </form>
          )}

          {/* VIEW 2: RECOVERY REQUEST (PASO 1) */}
          {viewMode === "recovery_request" && (
            <form onSubmit={handleRequestRecovery} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none text-foreground">
                  {t.email}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                  <input 
                    type="email" 
                    required
                    value={recoveryEmail}
                    onChange={(e) => setRecoveryEmail(e.target.value)}
                    placeholder={t.emailPlaceholder}
                    className="flex h-10 w-full rounded-md border border-input bg-background pl-9 pr-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </div>
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center rounded-md text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 disabled:opacity-50 cursor-pointer shadow-sm"
              >
                {loading ? t.processing : t.sendRecoveryBtn}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setError(null)
                    setSuccessMessage(null)
                    setViewMode("login")
                  }}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>{t.backToLogin}</span>
                </button>
              </div>
            </form>
          )}

          {/* VIEW 3: RECOVERY RESET (PASO 2) */}
          {viewMode === "recovery_reset" && (
            <form onSubmit={handleCompleteReset} className="space-y-4">
              
              {/* Asistente OTP generado */}
              {generatedOtp && (
                <div className="p-3.5 rounded-xl bg-accent/25 border border-accent text-accent-foreground text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">Código de recuperación generado:</span>
                    <button
                      type="button"
                      onClick={handleCopyOtp}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-primary text-primary-foreground text-[11px] font-medium transition cursor-pointer"
                    >
                      {copiedOtp ? (
                        <>
                          <Check className="w-3 h-3" />
                          <span>{t.copiedText}</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>{t.copyCode}</span>
                        </>
                      )}
                    </button>
                  </div>
                  <div className="p-2 rounded bg-background border border-border font-mono text-center text-base font-bold tracking-wider text-foreground">
                    {generatedOtp}
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    {t.tokenHelper}
                  </p>
                </div>
              )}

              {/* Input OTP */}
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none text-foreground">
                  {t.tokenLabel}
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                  <input 
                    type="text" 
                    required
                    value={recoveryToken}
                    onChange={(e) => setRecoveryToken(e.target.value)}
                    placeholder={t.tokenPlaceholder}
                    className="flex h-10 w-full rounded-md border border-input bg-background pl-9 pr-3 py-2 text-sm font-mono ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </div>
              </div>

              {/* Nueva Contraseña */}
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none text-foreground">
                  {t.newPasswordLabel}
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                  <input 
                    type={showNewPassword ? "text" : "password"}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    className="flex h-10 w-full rounded-md border border-input bg-background pl-9 pr-10 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirmar Contraseña */}
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none text-foreground">
                  {t.confirmPasswordLabel}
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                  <input 
                    type={showNewPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirma la contraseña"
                    className="flex h-10 w-full rounded-md border border-input bg-background pl-9 pr-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </div>
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center rounded-md text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 disabled:opacity-50 cursor-pointer shadow-sm"
              >
                {loading ? t.processing : t.completeResetBtn}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setError(null)
                    setSuccessMessage(null)
                    setViewMode("login")
                  }}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>{t.backToLogin}</span>
                </button>
              </div>
            </form>
          )}

        </div>

        {/* Footer */}
        <div className="text-center text-xs text-muted-foreground font-medium">
          {t.developedBy}{" "}
          <span className="text-primary font-bold">Arasue Forge</span>
        </div>

      </div>
    </div>
  )
}
