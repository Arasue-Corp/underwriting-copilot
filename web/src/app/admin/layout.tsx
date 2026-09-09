import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { cookies } from "next/headers"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  
  if (!profile || profile.role !== 'ADMIN' && profile.role !== 'DEMO') {
    const cookieStore = await cookies()
    const langCookie = cookieStore.get('NEXT_LOCALE')?.value as 'en' | 'es' | undefined
    const lang = langCookie === 'es' ? 'es' : 'en'

    const t = {
      es: {
        title: "Acceso Denegado",
        desc: "No tienes los permisos necesarios para acceder a este módulo. Se requiere rol de Administrador.",
        back: "Volver al Inicio"
      },
      en: {
        title: "Access Denied",
        desc: "You do not have the required permissions to access this module. Administrator role is required.",
        back: "Return to Home"
      }
    }[lang]

    return (
      <div className="flex-1 p-8 flex items-center justify-center">
        <div className="max-w-md text-center space-y-4">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-rose-500/10">
            <span className="text-3xl">🛑</span>
          </div>
          <h2 className="text-2xl font-bold">{t.title}</h2>
          <p className="text-muted-foreground">
            {t.desc}
          </p>
          <a href="/appetite" className="inline-block mt-4 text-primary hover:underline">
            {t.back}
          </a>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
