"use client"

import { useState } from "react"
import { Users, FileText, Search, MapPin, Building, Hash } from "lucide-react"
import { GenericQuoteModal } from "./GenericQuoteModal"

interface ClientDirectoryProps {
  clients: any[]
}

export function ClientDirectory({ clients }: ClientDirectoryProps) {
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null)

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {clients.length === 0 ? (
          <div className="col-span-full bg-card/40 border border-border/40 rounded-2xl p-12 text-center backdrop-blur-sm">
            <Users className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-foreground mb-2">No hay clientes aún</h3>
            <p className="text-muted-foreground">
              Los clientes se guardarán aquí automáticamente cuando envíes una solicitud de cotización.
            </p>
          </div>
        ) : (
          clients.map((client) => (
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
                <button
                  onClick={() => setSelectedClientId(client.id)}
                  className="w-full flex items-center justify-center space-x-2 bg-primary/10 hover:bg-primary text-primary hover:text-primary-foreground font-semibold px-4 py-2.5 rounded-xl transition-all duration-300 shadow-sm"
                >
                  <FileText className="w-4 h-4" />
                  <span>Crear Solicitud</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <GenericQuoteModal 
        isOpen={!!selectedClientId} 
        onClose={() => setSelectedClientId(null)} 
        initialClientId={selectedClientId} 
      />
    </>
  )
}
