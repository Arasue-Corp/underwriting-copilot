"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => setMounted(true), [])

  if (!mounted) {
    return (
      <button className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-sidebar-foreground w-full text-left opacity-50 cursor-default">
        <div className="h-5 w-5" />
        <span>Cargando tema...</span>
      </button>
    )
  }

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors w-full text-left"
    >
      {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
      <span>{theme === 'dark' ? 'Modo Claro' : 'Modo Oscuro'}</span>
    </button>
  )
}
