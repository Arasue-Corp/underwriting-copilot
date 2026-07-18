import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Users, FileText, Search, MapPin, Building, Hash } from "lucide-react"

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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {clients?.length === 0 ? (
          <div className="col-span-full bg-card/40 border border-border/40 rounded-2xl p-12 text-center backdrop-blur-sm">
            <Users className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-foreground mb-2">No hay clientes aún</h3>
            <p className="text-muted-foreground">
              Los clientes se guardarán aquí automáticamente cuando envíes una solicitud de cotización.
            </p>
          </div>
        ) : (
          clients?.map((client) => (
            <div key={client.id} className="group bg-card/60 border border-border/60 hover:border-primary/30 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)] backdrop-blur-xl flex flex-col">
              <div className="p-5 flex-1">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-lg leading-tight text-foreground group-hover:text-primary transition-colors">
                      {client.name}
                    </h3>
                    {client.legal_structure && (
                      <div className="flex items-center text-xs text-muted-foreground mt-1.5 font-medium">
                        <Building className="w-3.5 h-3.5 mr-1 text-primary/60" />
                        {client.legal_structure}
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2 mt-4 bg-background/50 rounded-xl p-3 border border-border/40">
                  {client.fein && (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Hash className="w-4 h-4 mr-2 text-muted-foreground/70" />
                      <span className="text-foreground font-medium">{client.fein}</span>
                    </div>
                  )}
                  {client.address && (
                    <div className="flex items-start text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4 mr-2 text-muted-foreground/70 mt-0.5 flex-shrink-0" />
                      <span className="line-clamp-2">{client.address}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-4 border-t border-border/40 bg-muted/20">
                <a
                  href={`/appetite?clientId=${client.id}`}
                  className="w-full flex items-center justify-center space-x-2 bg-primary/10 hover:bg-primary text-primary hover:text-primary-foreground font-semibold px-4 py-2.5 rounded-xl transition-all duration-300 shadow-sm"
                >
                  <FileText className="w-4 h-4" />
                  <span>Crear Solicitud</span>
                </a>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
