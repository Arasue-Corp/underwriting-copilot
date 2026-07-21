"use server"
import { cookies } from 'next/headers'

export async function setLanguageCookie(lang: 'en' | 'es') {
  const cookieStore = await cookies()
  cookieStore.set('NEXT_LOCALE', lang, { path: '/', maxAge: 31536000 })
}
