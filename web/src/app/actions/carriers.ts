"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function getCarriers() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("carriers")
    .select("*")
    .order("name", { ascending: true })

  if (error) {
    console.error("Error fetching carriers:", error)
    return []
  }
  return data
}

export async function addCarrier(name: string, logoUrl?: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("carriers")
    .insert({ name, logo_url: logoUrl })
    .select()
    .single()

  if (error) {
    console.error("Error adding carrier:", error)
    return { success: false, error: error.message }
  }
  
  revalidatePath("/admin/carriers")
  return { success: true, data }
}

export async function updateCarrier(id: string, oldName: string, newName: string, logoUrl?: string) {
  const supabase = await createClient()
  
  // 1. Update the carrier record itself
  const updateData: any = {}
  if (newName !== oldName) updateData.name = newName
  if (logoUrl !== undefined) updateData.logo_url = logoUrl

  if (Object.keys(updateData).length > 0) {
    const { error: updateError } = await supabase
      .from("carriers")
      .update(updateData)
      .eq("id", id)

    if (updateError) {
      console.error("Error updating carrier:", updateError)
      return { success: false, error: updateError.message }
    }
  }

  // 2. If the name changed, cascade the change to appetite_matrix and quote_requests
  if (newName !== oldName) {
    // Update appetite matrix
    await supabase
      .from("appetite_matrix")
      .update({ carrier_name: newName })
      .eq("carrier_name", oldName)

    // Update quote requests (the carrier_id column in quote_requests actually stores the string name)
    await supabase
      .from("quote_requests")
      .update({ carrier_id: newName })
      .eq("carrier_id", oldName)
  }

  revalidatePath("/admin/carriers")
  return { success: true }
}

export async function getCarrierStats(carrierName: string) {
  const supabase = await createClient()
  
  // Get appetite matrix count
  const { count: appetiteCount } = await supabase
    .from("appetite_matrix")
    .select("*", { count: 'exact', head: true })
    .eq("carrier_name", carrierName)

  // Get quote requests count
  const { count: quotesCount } = await supabase
    .from("quote_requests")
    .select("*", { count: 'exact', head: true })
    .eq("carrier_id", carrierName)

  return {
    appetiteCount: appetiteCount || 0,
    quotesCount: quotesCount || 0
  }
}

export async function deleteCarrier(id: string) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("No autenticado")
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (!profile || profile.role !== 'ADMIN') throw new Error("Acceso denegado")
    
    const { error } = await supabase.from('carriers').delete().eq('id', id)
    if (error) throw error
    revalidatePath('/admin/carriers')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
