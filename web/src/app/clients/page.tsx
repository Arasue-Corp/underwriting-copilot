import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { ClientDirectory } from "@/components/clients/ClientDirectory"

export default async function ClientsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("agency_id")
    .eq("id", user.id)
    .single()

  if (!profile) {
    redirect("/login")
  }

  const { data: clients } = await supabase
    .from("clients")
    .select("*")
    .eq("agency_id", profile.agency_id)
    .order("created_at", { ascending: false })

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6 relative min-h-[calc(100vh-4rem)]">
      {/* Background decorations */}
      <div className="absolute top-0 right-0 w-1/3 h-96 bg-primary/5 rounded-full blur-[100px] -z-10 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-1/4 h-64 bg-emerald-500/5 rounded-full blur-[80px] -z-10 pointer-events-none" />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-playfair font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
            Prospectos / Clientes
          </h2>
          <p className="text-muted-foreground mt-1 text-sm md:text-base">
            Directorio de prospectos registrados en tu agencia.
          </p>
        </div>
      </div>

      <ClientDirectory clients={clients || []} />
    </div>
  )
}
