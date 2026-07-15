import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Database, FileText, Home, Search, Settings, ShieldCheck, Building2 } from "lucide-react";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Underwriting Co-Pilot",
  description: "Portal premium de cotizaciones y apetito.",
};

import { createClient } from "@/lib/supabase/server";
import HeaderAuth from "@/components/layout/HeaderAuth";
import MobileNav from "@/components/layout/MobileNav";
import { Users } from "lucide-react";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  let role = 'AGENT';
  if (user) {
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if (profile) role = profile.role;
  }

  return (
    <html lang="es" className="light">
      <body
        className={`${inter.variable} antialiased min-h-screen text-slate-900 bg-slate-50 font-sans flex flex-col md:flex-row`}
      >
        {/* Sidebar (Desktop Only) */}
        <aside className="w-64 border-r border-border bg-sidebar text-sidebar-foreground hidden md:flex flex-col">
          <div className="h-16 flex items-center px-6 border-b border-sidebar-border">
            <ShieldCheck className="h-6 w-6 text-primary mr-2" />
            <span className="font-bold tracking-tight text-lg">UW Co-Pilot</span>
          </div>
          <nav className="flex-1 overflow-y-auto py-4">
            <ul className="space-y-1 px-3">
              <li>
                <a href="/" className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium bg-sidebar-accent text-sidebar-accent-foreground">
                  <Home className="h-4 w-4" />
                  Dashboard
                </a>
              </li>
              <li>
                <a href="/appetite" className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors">
                  <Search className="h-4 w-4" />
                  Buscador de Apetito
                </a>
              </li>
              <li>
                <a href="/quotes" className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors">
                  <FileText className="h-4 w-4" />
                  Solicitudes
                </a>
              </li>
              {role === 'ADMIN' && (
                <>
                  <li className="pt-4 pb-1 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Administración
                  </li>
                  <li>
                    <a href="/admin/upload-appetite" className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors">
                      <Database className="h-4 w-4" />
                      BI Ingestion
                    </a>
                  </li>
                  <li>
                    <a href="/admin/agencies" className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors">
                      <Building2 className="h-4 w-4" />
                      Compañías / Agencias
                    </a>
                  </li>
                  <li>
                    <a href="/admin/users" className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors">
                      <ShieldCheck className="h-4 w-4" />
                      Gestión de Usuarios
                    </a>
                  </li>
                </>
              )}
              {(role === 'MANAGER' || role === 'ADMIN') && (
                <li>
                  <a href="/agency" className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors">
                    <Users className="h-4 w-4" />
                    Mi Agencia
                  </a>
                </li>
              )}
            </ul>
          </nav>
          <div className="p-4 border-t border-sidebar-border">
            <a href="#" className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors">
              <Settings className="h-4 w-4" />
              Configuración
            </a>
          </div>
        </aside>
        
        {/* Main Content */}
        <main className="flex-1 flex flex-col overflow-hidden min-w-0">
          <header className="h-16 border-b border-border flex items-center justify-between md:justify-end px-4 md:px-6 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <MobileNav role={role} />
            <div className="flex items-center gap-4">
              <HeaderAuth />
            </div>
          </header>
          <div className="flex-1 overflow-auto">
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}
