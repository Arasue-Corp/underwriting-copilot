"use client"

import { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import { Menu, X, Home, Search, FileText, Database, Building2, ShieldCheck, Users, Settings } from "lucide-react"

export default function MobileNav({ role }: { role: string }) {
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className="md:hidden">
      <button 
        onClick={() => setIsOpen(true)}
        className="p-2 -ml-2 mr-2 text-muted-foreground hover:bg-muted rounded-md"
      >
        <Menu className="h-6 w-6" />
      </button>

      {/* Render Backdrop and Drawer outside of the header via Portal */}
      {mounted && typeof document !== 'undefined' && createPortal(
        <>
          {/* Backdrop */}
          {isOpen && (
            <div 
              className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
              onClick={() => setIsOpen(false)}
            />
          )}

      {/* Drawer */}
      <div 
        className={`fixed inset-y-0 left-0 z-[101] w-72 bg-sidebar text-sidebar-foreground shadow-xl transition-transform duration-300 ease-in-out flex flex-col ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-16 flex items-center justify-between px-6 border-b border-sidebar-border">
          <div className="flex items-center">
            <img src="/icono-crisol-cuadrado.png" alt="Crisol Icon" className="w-8 h-8 object-contain rounded-lg mr-2" />
            <span className="font-playfair font-bold tracking-tight text-lg">Crisol</span>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="p-2 -mr-2 text-muted-foreground hover:bg-muted hover:text-foreground rounded-md"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-3">
            <li>
              <a href="/" className="flex items-center gap-3 rounded-md px-3 py-3 text-base font-medium hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors">
                <Home className="h-5 w-5" />
                Dashboard
              </a>
            </li>
            <li>
              <a href="/appetite" className="flex items-center gap-3 rounded-md px-3 py-3 text-base font-medium text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors">
                <Search className="h-5 w-5" />
                Buscador de Apetito
              </a>
            </li>
            <li>
              <a href="/quotes" className="flex items-center gap-3 rounded-md px-3 py-3 text-base font-medium text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors">
                <FileText className="h-5 w-5" />
                Solicitudes
              </a>
            </li>
            {role === 'ADMIN' && (
              <>
                <li className="pt-6 pb-2 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Administración
                </li>
                <li>
                  <a href="/admin/upload-appetite" className="flex items-center gap-3 rounded-md px-3 py-3 text-base font-medium text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors">
                    <Database className="h-5 w-5" />
                    BI Ingestion
                  </a>
                </li>
                <li>
                  <a href="/admin/agencies" className="flex items-center gap-3 rounded-md px-3 py-3 text-base font-medium text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors">
                    <Building2 className="h-5 w-5" />
                    Compañías / Agencias
                  </a>
                </li>
                <li>
                  <a href="/admin/users" className="flex items-center gap-3 rounded-md px-3 py-3 text-base font-medium text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors">
                    <ShieldCheck className="h-5 w-5" />
                    Gestión de Usuarios
                  </a>
                </li>
              </>
            )}
            {(role === 'MANAGER' || role === 'ADMIN') && (
              <li>
                <a href="/agency" className="flex items-center gap-3 rounded-md px-3 py-3 text-base font-medium text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors">
                  <Users className="h-5 w-5" />
                  Mi Agencia
                </a>
              </li>
            )}
          </ul>
        </nav>
        
          <div className="p-4 border-t border-sidebar-border">
            <a href="#" className="flex items-center gap-3 rounded-md px-3 py-3 text-base font-medium text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors">
              <Settings className="h-5 w-5" />
              Configuración
            </a>
          </div>
        </div>
        </>,
        document.body
      )}
    </div>
  )
}
