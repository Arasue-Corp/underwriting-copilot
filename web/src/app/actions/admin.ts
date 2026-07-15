"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

// Helper para verificar rol ADMIN
async function verifyAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("No autenticado")

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (!profile || profile.role !== 'ADMIN') throw new Error("Acceso denegado: Se requiere rol de Administrador")
  
  return supabase
}

export async function getAgencies() {
  try {
    const supabase = await verifyAdmin()
    
    // Obtenemos agencias y contamos cuántos agentes tienen
    const { data: agencies, error } = await supabase
      .from('agencies')
      .select(`
        id, 
        name, 
        created_at,
        profiles ( id )
      `)
      .order('name')

    if (error) throw error

    return agencies.map(a => ({
      ...a,
      agentCount: a.profiles ? (Array.isArray(a.profiles) ? a.profiles.length : 0) : 0
    }))
  } catch (error) {
    console.error("Error al obtener agencias:", error)
    return []
  }
}

export async function createAgency(name: string) {
  try {
    const supabase = await verifyAdmin()
    
    if (!name.trim()) return { success: false, error: "El nombre no puede estar vacío" }

    const { error } = await supabase.from('agencies').insert({ name: name.trim() })
    if (error) throw error

    revalidatePath('/admin/agencies')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function getUsers() {
  try {
    const supabase = await verifyAdmin()
    
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        id, 
        email, 
        name, 
        role, 
        agency_id,
        agencies ( name )
      `)
      .order('created_at', { ascending: false })

    if (error) throw error

    return data.map(u => ({
      ...u,
      agency_name: u.agencies ? (u.agencies as any).name : null
    }))
  } catch (error) {
    console.error("Error al obtener usuarios:", error)
    return []
  }
}

export async function updateUserAdmin(userId: string, data: { role?: string, agency_id?: string | null }) {
  try {
    const supabase = await verifyAdmin()
    
    const { error } = await supabase
      .from('profiles')
      .update(data)
      .eq('id', userId)

    if (error) throw error

    revalidatePath('/admin/users')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
