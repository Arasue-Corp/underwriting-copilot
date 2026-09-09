import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import AccountDropdown from "./AccountDropdown"

export default async function HeaderAuth() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    const cookieStore = await cookies()
    const langCookie = cookieStore.get('NEXT_LOCALE')?.value as 'en' | 'es' | undefined
    const lang = langCookie === 'es' ? 'es' : 'en'

    return (
      <Link 
        href="/login" 
        className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2"
      >
        {lang === 'es' ? 'Iniciar Sesión' : 'Sign In'}
      </Link>
    )
  }

  // Fetch profile and agency
  const { data: profile } = await supabase
    .from('profiles')
    .select(`
      name, 
      email, 
      role, 
      agencies ( name )
    `)
    .eq('id', user.id)
    .single()

  if (!profile) return null

  const profileData = {
    name: profile.name,
    email: profile.email,
    role: profile.role,
    agency_name: profile.agencies ? (profile.agencies as any).name : undefined
  }

  return <AccountDropdown profile={profileData} />
}
