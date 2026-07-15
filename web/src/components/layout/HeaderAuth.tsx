import { createClient } from "@/lib/supabase/server"
import AccountDropdown from "./AccountDropdown"

export default async function HeaderAuth() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return (
      <div className="h-8 w-8 rounded-full bg-muted border border-border flex items-center justify-center text-sm font-medium text-muted-foreground">
        ?
      </div>
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
