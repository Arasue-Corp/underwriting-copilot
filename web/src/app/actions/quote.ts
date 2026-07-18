"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function submitQuoteRequest(formData: FormData) {
  try {
    const supabase = await createClient()

    // In a real app, these come from the authenticated session
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: "Unauthorized" }
    }

    // Fetch the agent's profile to get agency_id
    const { data: profile } = await supabase
      .from("profiles")
      .select("agency_id")
      .eq("id", user.id)
      .single()

    if (!profile) {
      return { success: false, error: "Profile not found" }
    }

    const clientName = formData.get("client_name") as string
    const carrierId = formData.get("carrier_name") as string
    
    const products = JSON.parse((formData.get("products") as string) || "[]")
    const rawFormData = JSON.parse((formData.get("form_data") as string) || "{}")

    // Check if client exists, otherwise create it
    const clientLegalStructure = rawFormData.general_legal_structure || null;
    const clientFein = rawFormData.general_fein || null;
    const clientAddress = rawFormData.general_address || null;
    const clientContact = rawFormData.general_contact || null;
    
    // Upsert client
    if (clientName) {
      await supabase
        .from('clients')
        .upsert({
          agency_id: profile.agency_id,
          name: clientName,
          legal_structure: clientLegalStructure,
          fein: clientFein,
          address: clientAddress,
          contact: clientContact
        }, { onConflict: 'agency_id,name', ignoreDuplicates: true });
    }

    // Upload attachments if present
    const attachments: string[] = []
    
    // Example of finding files in FormData
    for (const [key, value] of formData.entries()) {
      if (typeof value === 'object' && value !== null && 'name' in value && 'size' in value) {
        const fileExt = (value as File).name.split('.').pop()
        const fileName = `${user.id}-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
        const filePath = `${profile.agency_id}/${fileName}`
        
        const { error: uploadError } = await supabase.storage
          .from('quote-attachments')
          .upload(filePath, value as File)
          
        if (!uploadError) {
          attachments.push(filePath)
          // Store path in rawFormData so UI knows this field has a file
          rawFormData[key] = filePath
        } else {
          console.error("Upload error:", uploadError)
        }
      }
    }

    const { error } = await supabase.from("quote_requests").insert({
      agent_id: user.id,
      agency_id: profile.agency_id,
      client_name: clientName,
      client_business_type: rawFormData.general_legal_structure || null,
      carrier_id: carrierId,
      coverage_requested: products.join(", "),
      products: products,
      form_data: rawFormData,
      status: "PENDING_MANAGER"
    })

    if (error) {
      console.error("Error submitting quote:", error)
      return { success: false, error: error.message || "Failed to submit quote" }
    }
    
    return { success: true }
  } catch (error: any) {
    console.error("Unexpected error in submitQuoteRequest:", error)
    return { success: false, error: error?.message || String(error) }
  }
}

export async function processMultipleQuotes(quoteId: string, quotes: { product: string, premium: number, file_url: string }[]) {
  const supabase = await createClient()
  
  const totalPremium = quotes.reduce((sum, q) => sum + (Number(q.premium) || 0), 0)

  const { error } = await supabase
    .from("quote_requests")
    .update({
      premium_amount: totalPremium,
      quotes_provided: quotes,
      status: "QUOTED"
    })
    .eq("id", quoteId)

  if (error) {
    console.error("Error updating quote:", error)
    throw new Error("Failed to update quote")
  }

  revalidatePath("/quotes")
  return { success: true }
}

export async function assignQuoteRequest(quoteId: string, assigneeId: string) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: "Unauthorized" }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
  if (!profile || (profile.role !== "MANAGER" && profile.role !== "ADMIN")) {
    return { success: false, error: "Only managers and admins can assign quotes." }
  }

  const { error } = await supabase
    .from("quote_requests")
    .update({ assigned_to: assigneeId })
    .eq("id", quoteId)

  if (error) {
    console.error("Error assigning quote:", error)
    return { success: false, error: error.message }
  }

  revalidatePath("/quotes")
  return { success: true }
}

export async function updateQuoteStatus(quoteId: string, status: string, soldPremium?: number, commissionPercentage?: number) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: "Unauthorized" }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
  if (!profile || (profile.role !== "MANAGER" && profile.role !== "ADMIN")) {
    return { success: false, error: "Only managers and admins can update quote status." }
  }

  const updates: any = { status }
  if (soldPremium !== undefined) updates.sold_premium = soldPremium
  if (commissionPercentage !== undefined) updates.commission_percentage = commissionPercentage

  const { error } = await supabase
    .from("quote_requests")
    .update(updates)
    .eq("id", quoteId)

  if (error) {
    console.error("Error updating quote status:", error)
    return { success: false, error: error.message }
  }

  revalidatePath("/quotes")
  return { success: true }
}
