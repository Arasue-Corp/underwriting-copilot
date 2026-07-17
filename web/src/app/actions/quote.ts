"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function submitQuoteRequest(formData: FormData) {
  const supabase = await createClient()

  // In a real app, these come from the authenticated session
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error("Unauthorized")
  }

  // Fetch the agent's profile to get agency_id
  const { data: profile } = await supabase
    .from("profiles")
    .select("agency_id")
    .eq("id", user.id)
    .single()

  if (!profile) {
    throw new Error("Profile not found")
  }

  const clientName = formData.get("client_name") as string
  const carrierId = formData.get("carrier_name") as string
  
  const products = JSON.parse((formData.get("products") as string) || "[]")
  const rawFormData = JSON.parse((formData.get("form_data") as string) || "{}")

  // Upload attachments if present
  const attachments: string[] = []
  
  // Example of finding files in FormData
  for (const [key, value] of formData.entries()) {
    if (value instanceof File) {
      const fileExt = value.name.split('.').pop()
      const fileName = `${user.id}-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
      const filePath = `${profile.agency_id}/${fileName}`
      
      const { error: uploadError } = await supabase.storage
        .from('quote-attachments')
        .upload(filePath, value)
        
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
    throw new Error("Failed to submit quote")
  }

  revalidatePath("/appetite")
  revalidatePath("/dashboard")
  
  return { success: true }
}

export async function updateQuoteWithPremium(quoteId: string, premiumAmount: number, pdfPath: string) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from("quote_requests")
    .update({
      premium_amount: premiumAmount,
      pdf_url: pdfPath,
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
