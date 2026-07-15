import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function AgencyLayout({
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
  
  if (!profile || (profile.role !== 'MANAGER' && profile.role !== 'ADMIN')) {
    return (
      <div className="flex-1 p-8 flex items-center justify-center">
        <div className="max-w-md text-center space-y-4">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-rose-500/10">
            <span className="text-3xl">🛑</span>
          </div>
          <h2 className="text-2xl font-bold">Acceso Denegado</h2>
          <p className="text-muted-foreground">
            Este módulo es exclusivo para Managers de Agencia y Administradores.
          </p>
          <a href="/" className="inline-block mt-4 text-primary hover:underline">
            Volver al Inicio
          </a>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
