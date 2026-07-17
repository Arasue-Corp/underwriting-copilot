import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Database, FileText, Home, Search, Settings, ShieldCheck, Building2 } from "lucide-react";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Crisol",
  description: "Portal premium de cotizaciones y apetito.",
};

import { createClient } from "@/lib/supabase/server";
import HeaderAuth from "@/components/layout/HeaderAuth";
import MobileNav from "@/components/layout/MobileNav";
import { Users } from "lucide-react";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageProvider } from "@/components/language-provider";
import { LanguageToggle } from "@/components/language-toggle";
import { cookies } from "next/headers";

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

  const cookieStore = await cookies();
  const langCookie = cookieStore.get('NEXT_LOCALE')?.value as 'en' | 'es' | undefined;
  const lang = langCookie === 'es' ? 'es' : 'en';

  const t = {
    en: {
      dashboard: 'Dashboard',
      appetite: 'Appetite Finder',
      requests: 'Quotes',
      admin: 'Administration',
      ingestion: 'BI Ingestion',
      agencies: 'Carriers / Agencies',
      users: 'User Management',
      myAgency: 'My Agency',
      settings: 'Settings'
    },
    es: {
      dashboard: 'Dashboard',
      appetite: 'Buscador de Apetito',
      requests: 'Solicitudes',
      admin: 'Administración',
      ingestion: 'BI Ingestion',
      agencies: 'Compañías / Agencias',
      users: 'Gestión de Usuarios',
      myAgency: 'Mi Agencia',
      settings: 'Configuración'
    }
  }[lang];

  return (
    <html lang={lang} suppressHydrationWarning>
      <body
        className={`${inter.variable} ${playfair.variable} antialiased min-h-screen text-foreground premium-bg font-sans flex flex-col md:flex-row selection:bg-primary/20 selection:text-primary`}
      >
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <LanguageProvider lang={lang}>
        {/* Sidebar (Desktop Only) */}
        <aside className="w-64 border-r border-border/40 bg-card/40 backdrop-blur-3xl text-sidebar-foreground hidden md:flex flex-col shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-20">
          <div className="h-16 flex items-center px-6 border-b border-border/40 bg-card/20">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-tr from-primary to-primary/70 p-2.5 rounded-xl shadow-sm text-primary-foreground">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <span className="font-playfair font-bold tracking-tight text-xl bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">Crisol</span>
            </div>
          </div>
          <nav className="flex-1 overflow-y-auto py-6 hide-scrollbar">
            <ul className="space-y-1.5 px-4">
              <li>
                <a href="/" className="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold bg-primary/10 text-primary transition-all border border-primary/10 shadow-sm">
                  <Home className="h-4 w-4" />
                  {t.dashboard}
                </a>
              </li>
              <li>
                <a href="/appetite" className="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-card/60 hover:text-foreground transition-all hover:shadow-sm">
                  <Search className="h-4 w-4 transition-transform group-hover:scale-110 group-hover:text-primary" />
                  {t.appetite}
                </a>
              </li>
              <li>
                <a href="/quotes" className="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-card/60 hover:text-foreground transition-all hover:shadow-sm">
                  <FileText className="h-4 w-4 transition-transform group-hover:scale-110 group-hover:text-primary" />
                  {t.requests}
                </a>
              </li>
              {role === 'ADMIN' && (
                <>
                  <li className="pt-6 pb-2 px-3 text-[11px] font-bold text-muted-foreground/70 uppercase tracking-widest">
                    {t.admin}
                  </li>
                  <li>
                    <a href="/admin/upload-appetite" className="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-card/60 hover:text-foreground transition-all hover:shadow-sm">
                      <Database className="h-4 w-4 transition-transform group-hover:scale-110 group-hover:text-primary" />
                      {t.ingestion}
                    </a>
                  </li>
                  <li>
                    <a href="/admin/agencies" className="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-card/60 hover:text-foreground transition-all hover:shadow-sm">
                      <Building2 className="h-4 w-4 transition-transform group-hover:scale-110 group-hover:text-primary" />
                      {t.agencies}
                    </a>
                  </li>
                  <li>
                    <a href="/admin/users" className="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-card/60 hover:text-foreground transition-all hover:shadow-sm">
                      <ShieldCheck className="h-4 w-4 transition-transform group-hover:scale-110 group-hover:text-primary" />
                      {t.users}
                    </a>
                  </li>
                </>
              )}
              {(role === 'MANAGER' || role === 'ADMIN') && (
                <li>
                  <a href="/agency" className="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-card/60 hover:text-foreground transition-all hover:shadow-sm">
                    <Users className="h-4 w-4 transition-transform group-hover:scale-110 group-hover:text-primary" />
                    {t.myAgency}
                  </a>
                </li>
              )}
            </ul>
          </nav>
          <div className="p-4 border-t border-border/40 bg-card/20 space-y-2">
            <ThemeToggle />
            <LanguageToggle />
            <a href="#" className="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-card/60 hover:text-foreground transition-all hover:shadow-sm">
              <Settings className="h-4 w-4 transition-transform group-hover:rotate-45 group-hover:text-primary" />
              {t.settings}
            </a>
          </div>
        </aside>
        
        {/* Main Content */}
        <main className="flex-1 flex flex-col overflow-hidden min-w-0 relative">
          <header className="h-16 border-b border-border/40 flex items-center justify-between md:justify-end px-4 md:px-8 bg-card/40 backdrop-blur-3xl sticky top-0 z-10 shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
            <MobileNav role={role} />
            <div className="flex items-center gap-6">
              <HeaderAuth />
            </div>
          </header>
          <div className="flex-1 overflow-auto">
            {children}
          </div>
        </main>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
