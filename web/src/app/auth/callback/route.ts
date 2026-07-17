import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // The 'next' param is used to redirect the user after the exchange
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // If there's no error, redirect the user to the 'next' path.
      // Usually, invite emails and recovery emails should include `?next=/update-password` 
      // in their callback URL on Supabase Dashboard.
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // If there's an error or no code, redirect to login page with an error state
  return NextResponse.redirect(`${origin}/login?error=auth_failed`)
}
