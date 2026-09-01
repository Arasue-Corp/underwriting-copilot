"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function getPolicies() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: "Unauthorized" }

  const { data: profile } = await supabase.from("profiles").select("role, agency_id").eq("id", user.id).single()
  if (!profile || !['MANAGER', 'ADMIN'].includes(profile.role)) {
    return { success: false, error: "Unauthorized role." }
  }

  const { data, error } = await supabase
    .from("policies")
    .select("*, agent:agent_id(name, email)")
    .eq("agency_id", profile.agency_id)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching policies:", error)
    return { success: false, error: error.message }
  }

  return { success: true, policies: data }
}

export async function createPolicy(formData: any) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: "Unauthorized" }

  const { data: profile } = await supabase.from("profiles").select("role, agency_id").eq("id", user.id).single()
  if (!profile || !['MANAGER', 'ADMIN'].includes(profile.role)) {
    return { success: false, error: "Unauthorized role." }
  }

  const { error } = await supabase.from("policies").insert({
    ...formData,
    agency_id: profile.agency_id
  })

  if (error) {
    console.error("Error creating policy:", error)
    return { success: false, error: error.message }
  }

  revalidatePath("/policies")
  return { success: true }
}

export async function updatePolicy(policyId: string, formData: any) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: "Unauthorized" }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
  if (!profile || !['MANAGER', 'ADMIN'].includes(profile.role)) {
    return { success: false, error: "Unauthorized role." }
  }

  const { error } = await supabase
    .from("policies")
    .update(formData)
    .eq("id", policyId)

  if (error) {
    console.error("Error updating policy:", error)
    return { success: false, error: error.message }
  }

  revalidatePath("/policies")
  return { success: true }
}

export async function deletePolicy(policyId: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: "Unauthorized" }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
  if (!profile || !['MANAGER', 'ADMIN'].includes(profile.role)) {
    return { success: false, error: "Unauthorized role." }
  }

  const { error } = await supabase
    .from("policies")
    .delete()
    .eq("id", policyId)

  if (error) {
    console.error("Error deleting policy:", error)
    return { success: false, error: error.message }
  }

  revalidatePath("/policies")
  return { success: true }
}
