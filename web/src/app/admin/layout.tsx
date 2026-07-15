import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

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
  
  if (!profile || profile.role !== 'ADMIN') {
    return (
      <div className="flex-1 p-8 flex items-center justify-center">
        <div className="max-w-md text-center space-y-4">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-rose-500/10">
            <span className="text-3xl">🛑</span>
          </div>
          <h2 className="text-2xl font-bold">Acceso Denegado</h2>
          <p className="text-muted-foreground">
            No tienes los permisos necesarios para acceder a este módulo. Se requiere rol de Administrador.
          </p>
          <a href="/appetite" className="inline-block mt-4 text-primary hover:underline">
            Volver al Dashboard
          </a>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
