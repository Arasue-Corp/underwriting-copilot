"use client"
import React, { createContext, useContext } from 'react'

const LanguageContext = createContext<'en' | 'es'>('en')

export const LanguageProvider = ({ lang, children }: { lang: 'en' | 'es', children: React.ReactNode }) => {
  return (
    <LanguageContext.Provider value={lang}>
      {children}
    </LanguageContext.Provider>
  )
}

export const useLanguage = () => useContext(LanguageContext)
