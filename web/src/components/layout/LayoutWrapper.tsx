"use client"

import { usePathname } from "next/navigation"

export default function LayoutWrapper({ 
  children, 
  sidebar, 
  header 
}: { 
  children: React.ReactNode, 
  sidebar: React.ReactNode, 
  header: React.ReactNode 
}) {
  const pathname = usePathname()
  const isPresentation = pathname?.match(/^\/proposals\/[a-zA-Z0-9-]+$/)

  if (isPresentation) {
    return (
      <main className="flex-1 flex flex-col min-h-screen min-w-0 w-full bg-background">
        {children}
      </main>
    )
  }

  return (
    <>
      {sidebar}
      <main className="flex-1 flex flex-col h-screen overflow-hidden min-w-0 relative">
        {header}
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </main>
    </>
  )
}
