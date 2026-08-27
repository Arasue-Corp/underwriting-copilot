"use server"

import { createClient } from "@/lib/supabase/server"

export async function getActivityLogs(entityType: string, entityId: string) {
  const supabase = await createClient()
  
  // Verify user is an ADMIN
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: "No autenticado" }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'ADMIN') {
    return { success: false, error: "No autorizado" }
  }

  // Fetch logs and join with profiles to get the actor's name
  const { data: logs, error } = await supabase
    .from('activity_logs')
    .select(`
      id,
      action,
      old_data,
      new_data,
      created_at,
      profiles:actor_id (
        name,
        role
      )
    `)
    .eq('entity_type', entityType)
    .eq('entity_id', entityId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error("Error fetching logs:", error)
    return { success: false, error: error.message }
  }

  return { success: true, data: logs }
}
