"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function getClients() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { success: false, error: "Unauthorized" }
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("agency_id")
      .eq("id", user.id)
      .single()

    if (!profile) {
      return { success: false, error: "Profile not found" }
    }

    const { data: clients, error } = await supabase
      .from("clients")
      .select("*")
      .eq("agency_id", profile.agency_id)
      .order("created_at", { ascending: false })

    if (error) throw error

    return { success: true, data: clients }
  } catch (error: any) {
    console.error("Error fetching clients:", error)
    return { success: false, error: error.message }
  }
}

export async function getClientById(id: string) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) return { success: false, error: "Unauthorized" }

    const { data: client, error } = await supabase
      .from("clients")
      .select("*")
      .eq("id", id)
      .single()

    if (error) throw error

    return { success: true, data: client }
  } catch (error: any) {
    console.error("Error fetching client by id:", error)
    return { success: false, error: error.message }
  }
}

export async function updateClient(id: string, data: any) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) return { success: false, error: "Unauthorized" }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role, agency_id")
      .eq("id", user.id)
      .single()
      
    if (!profile || (profile.role !== 'ADMIN' && profile.role !== 'MANAGER')) {
      return { success: false, error: "Unauthorized role" }
    }

    const { error } = await supabase
      .from("clients")
      .update(data)
      .eq("id", id)
      .eq("agency_id", profile.agency_id)

    if (error) throw error

    revalidatePath('/clients')
    return { success: true }
  } catch (error: any) {
    console.error("Error updating client:", error)
    return { success: false, error: error.message }
  }
}
