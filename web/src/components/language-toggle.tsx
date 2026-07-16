"use client"
import React from 'react'
import { Languages } from 'lucide-react'
import { useLanguage } from './language-provider'
import { setLanguageCookie } from '@/app/actions/language'
import { useRouter } from 'next/navigation'

export const LanguageToggle = () => {
  const language = useLanguage()
  const router = useRouter()
  
  const toggleLanguage = async () => {
    const newLang = language === 'en' ? 'es' : 'en'
    await setLanguageCookie(newLang)
    router.refresh()
  }

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors w-full text-left"
    >
      <Languages className="h-5 w-5" />
      <span>{language === 'en' ? 'Español' : 'English'}</span>
    </button>
  )
}
