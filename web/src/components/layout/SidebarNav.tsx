"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { Home, Search, FileText, Users, Database, Building2, ShieldCheck, Layers, Calendar } from "lucide-react"

export default function SidebarNav({ role, t }: { role: string, t: any }) {
  const pathname = usePathname()

  const getActiveClasses = (path: string) => {
    // If path is exactly "/"
    if (path === "/") {
      return pathname === "/" 
        ? "bg-primary/10 text-primary border border-primary/10 shadow-sm" 
        : "text-muted-foreground hover:bg-card/60 hover:text-foreground hover:shadow-sm"
    }
    // For other paths, check if pathname starts with the path
    return pathname.startsWith(path)
      ? "bg-primary/10 text-primary border border-primary/10 shadow-sm"
      : "text-muted-foreground hover:bg-card/60 hover:text-foreground hover:shadow-sm"
  }

  const getIconClasses = (path: string) => {
    if (path === "/") {
      return pathname === "/" ? "" : "transition-transform group-hover:scale-110 group-hover:text-primary"
    }
    return pathname.startsWith(path) ? "" : "transition-transform group-hover:scale-110 group-hover:text-primary"
  }

  return (
    <ul className="space-y-1.5 px-4">
      <li>
        <Link href="/" className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all ${getActiveClasses("/")}`}>
          <Home className={`h-4 w-4 ${getIconClasses("/")}`} />
          {t.dashboard}
        </Link>
      </li>
      <li>
        <Link href="/appetite" className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${getActiveClasses("/appetite")}`}>
          <Search className={`h-4 w-4 ${getIconClasses("/appetite")}`} />
          {t.appetite}
        </Link>
      </li>
      <li>
        <Link href="/quotes" className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${getActiveClasses("/quotes")}`}>
          <FileText className={`h-4 w-4 ${getIconClasses("/quotes")}`} />
          {t.requests}
        </Link>
      </li>
      <li>
        <Link href="/proposals" className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${getActiveClasses("/proposals")}`}>
          <Layers className={`h-4 w-4 ${getIconClasses("/proposals")}`} />
          {t.proposals}
        </Link>
      </li>
      <li>
        <Link href="/clients" className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${getActiveClasses("/clients")}`}>
          <Users className={`h-4 w-4 ${getIconClasses("/clients")}`} />
          {t.clients}
        </Link>
      </li>
      <li>
        <Link href="/visits" className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${getActiveClasses("/visits")}`}>
          <Calendar className={`h-4 w-4 ${getIconClasses("/visits")}`} />
          {t.visits}
        </Link>
      </li>
      {role === 'ADMIN' && (
        <>
          <li className="pt-6 pb-2 px-3 text-[11px] font-bold text-muted-foreground/70 uppercase tracking-widest">
            {t.admin}
          </li>
          <li>
            <Link href="/admin/upload-appetite" className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${getActiveClasses("/admin/upload-appetite")}`}>
              <Database className={`h-4 w-4 ${getIconClasses("/admin/upload-appetite")}`} />
              {t.ingestion}
            </Link>
          </li>
          <li>
            <Link href="/admin/agencies" className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${getActiveClasses("/admin/agencies")}`}>
              <Building2 className={`h-4 w-4 ${getIconClasses("/admin/agencies")}`} />
              {t.agencies}
            </Link>
          </li>
          <li>
            <Link href="/admin/users" className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${getActiveClasses("/admin/users")}`}>
              <ShieldCheck className={`h-4 w-4 ${getIconClasses("/admin/users")}`} />
              {t.users}
            </Link>
          </li>
          <li>
            <Link href="/admin/carriers" className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${getActiveClasses("/admin/carriers")}`}>
              <ShieldCheck className={`h-4 w-4 ${getIconClasses("/admin/carriers")}`} />
              {t.carriers}
            </Link>
          </li>
        </>
      )}
      {(role === 'MANAGER' || role === 'ADMIN') && (
        <li>
          <Link href="/agency" className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${getActiveClasses("/agency")}`}>
            <Users className={`h-4 w-4 ${getIconClasses("/agency")}`} />
            {t.myAgency}
          </Link>
        </li>
      )}
    </ul>
  )
}
